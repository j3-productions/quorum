import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { FormProvider, useForm, useController } from 'react-hook-form';
import {
  PlusIcon,
  EnterIcon,
  QuestionMarkIcon,
  DownloadIcon,
  Cross2Icon,
  HomeIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import '~/styles/prism.css'; // FIXME: Improve styling by editing this file
import Dialog from '~/components/Dialog';
import {
  SingleSelector,
  MultiSelector,
  CreatableSingleSelector,
  CreatableMultiSelector,
  SelectorOption,
} from '~/components/Selector';
import { TagModeRadio } from '~/components/Radio';
import { PostStrand } from '~/components/Post';
import api from '~/api';
import {
  isGroupAdmin,
  isChannelJoined,
  canReadChannel,
  getChannelIdFromTitle,
  nestToFlag,
} from '~/logic/utils';
import { useModalNavigate, useDismissNavigate } from '~/logic/routing';
import { BoardMeta, BoardThread, BoardPost } from '~/types/quorum';
import { Groups, Group, GroupChannel } from '~/types/groups';
import { ChatBriefs, ChatBrief } from '~/types/chat';
import { ClassProps } from '~/types/ui';


// FIXME: There's a weird issue with all forms wherein using the syntax
// `const {... formState, ...} = form;` causes forms to lag by 1 input on
// recognizing a valid form, where using the syntax
// `const {... {isDirty, isValid} ...} = form;` works fine. The latter syntax
// is used everywhere for forms to avoid this problem, though ideally the
// `form` assignment could take any shape and the form would "just work".


export function QuestionForm({className}: ClassProps) {
  // TODO: Add preview button to preview what question will look like
  // TODO: Refactor the JSX code so that the same set of props is passed to
  // both types of `MultiSelector` component.
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTagListRestricted, setIsTagListRestricted] = useState<boolean>(false);
  const [boardTagList, setBoardTagList] = useState<SelectorOption[]>([]);
  const [boardTitle, setBoardTitle] = useState<string>("");

  const params = useParams();
  const navigate = useNavigate();

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      title: '',
      tags: [],
      content: '',
    },
  });
  const {register, handleSubmit, formState: {isDirty, isValid}, control} = form;
  const {field: {value: content, onChange: contentOnChange, ref: contentRef}} =
    useController({name: "content", rules: {required: true}, control});
  const {field: {value: tags, onChange: tagsOnChange, ref: tagsRef}} =
    useController({name: "tags", rules: {required: false}, control});
  const onSubmit = useCallback(({
    title,
    tags,
    content,
  }: {
    title: string;
    tags: string[];
    content: string;
  }) => {
    api.poke({
      app: "forums",
      mark: "forums-action",
      json: {
        board: `${params.chShip}/${params.chName}`,
        action: {"new-thread": {
          title: title,
          content: content,
          tags: tags,
        }},
      },
    }).then((result: any) =>
      navigate("../", {relative: "path"})
    );
  }, [params, navigate]);

  useEffect(() => {
    api.scry<BoardMeta>({
      app: "forums",
      path: `/board/${params.chShip}/${params.chName}/metadata`,
    }).then(({title, "allowed-tags": allowedTags}: BoardMeta) => {
      setBoardTitle(title);
      setBoardTagList(allowedTags.sort().map(tag => ({
        value: tag,
        label: `#${tag}`,
      })));
      setIsTagListRestricted(allowedTags.length !== 0);
      setIsLoading(false);
    });
  }, [params]);

  return isLoading ? null : (
    <FormProvider {...form}>
      <div className={className}>
        <div className="sm:w-96">
          <header className="mb-3 flex items-center">
            <h1 className="text-lg font-bold">Submit a New Question to '{boardTitle}'</h1>
          </header>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mb-3 font-semibold">
            Question Title*
            <input type="text" autoComplete="off" autoFocus
              className="input my-2 block w-full py-1 px-2"
              {...register("title", {required: true})}
            />
          </label>
          <label className="mb-3 font-semibold">
            Question Tags
            {isTagListRestricted ? (
              <MultiSelector
                ref={tagsRef}
                options={boardTagList}
                value={tags.sort().map(t => boardTagList.find(e => e.value === t) || {value: t, label: `#${t}`})}
                onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                isLoading={isLoading}
                noOptionsMessage={() => `Tags are restricted; please select an existing tag.`}
                className="my-2 w-full"
              />
            ) : (
              <CreatableMultiSelector
                ref={tagsRef}
                options={boardTagList}
                value={tags.sort().map(t => boardTagList.find(e => e.value === t) || {value: t, label: `#${t}`})}
                onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                isLoading={isLoading}
                className="my-2 w-full"
              />
            )}
          </label>
          <label className="mb-3 font-semibold">
            Question Content*
            <Editor
              value={content}
              onValueChange={contentOnChange}
              // FIXME: This may have been broken by new import
              // syntax... need to test to double check.
              highlight={code => highlight(code, languages.md, "md")}
              // @ts-ignore
              rows={8} // FIXME: workaround via 'min-h-...'
              padding={8} // FIXME: workaround, but would prefer 'py-1 px-2'
              ignoreTabKey={true}
              className="input my-2 block w-full min-h-[calc(8em+8px)]"
            />
          </label>

          <footer className="mt-4 flex items-center justify-between space-x-2">
            <div className="ml-auto flex items-center space-x-2">
              <Link className="secondary-button ml-auto" to="../">
                Cancel
              </Link>
              <button className="button" type="submit"
                disabled={!isValid || !isDirty}>
                Ask
              </button>
            </div>
          </footer>
        </form>
      </div>
    </FormProvider>
  );
}

export function ResponseForm({className}: ClassProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTagListRestricted, setIsTagListRestricted] = useState<boolean>(false);
  const [boardTagList, setBoardTagList] = useState<SelectorOption[]>([]);
  const [question, setQuestion] = useState<BoardPost | undefined>(undefined);

  const navigate = useNavigate();
  const modalNavigate = useModalNavigate();
  const location = useLocation();
  const state = location?.state;
  const params = useParams();

  const isQuestionEdit = params.thread === params.response;

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      title: "",
      tags: ([] as string[]),
      content: "",
    },
  });
  const {register, handleSubmit, reset, formState: {isDirty, isValid, dirtyFields}, control} = form;
  const {field: {value: title, onChange: titleOnChange, ref: titleRef}} =
    useController({name: "title", rules: {required: isQuestionEdit}, control});
  const {field: {value: content, onChange: contentOnChange, ref: contentRef}} =
    useController({name: "content", rules: {required: true}, control});
  const {field: {value: tags, onChange: tagsOnChange, ref: tagsRef}} =
    useController({name: "tags", rules: {required: false}, control});
  const onSubmit = useCallback(({
    title,
    tags,
    content,
  }: {
    title: string;
    tags: string[];
    content: string;
  }) => {
    const responseActionOptions: [boolean, any][] = [
      [
        params?.response === undefined,
        {"new-reply": {
          "parent-id": Number(params.thread),
          "content": content,
          "is-comment": false,
        }},
      ], [
        params?.response !== undefined && Boolean(dirtyFields?.content),
        {"edit-post": {
          "post-id": Number(params?.response || 0),
          "content": content,
        }},
      ], [
        params?.response !== undefined && Boolean(dirtyFields?.title || dirtyFields?.tags),
        {"edit-thread": {
          "post-id": Number(params?.response || 0),
          "title": dirtyFields?.title && title,
          "tags": dirtyFields?.tags && tags,
        }},
      ],
    ];
    const responseActions = responseActionOptions
      .filter(([condition, action]) => condition)
      .map(([condition, action]) => action);

    Promise.all(responseActions.map(action => api.poke({
      app: "forums",
      mark: "forums-action",
      json: {
        board: `${params.chShip}/${params.chName}`,
        action: action,
      },
    }))).then((result: any) =>
      navigate(
        // FIXME: Use some form of helper function here
        ["thread", "response"].filter(s => s in params).fill("../").join(""),
        {relative: "path"},
      )
    );
  }, [params, navigate, dirtyFields]);

  // FIXME: Using 'params' blindly here for reloading here is a bad
  // idea b/c it causes unnecessary reloads when the 'import' modal is
  // brought up.
  useEffect(() => {
    Promise.all([
      api.scry<BoardMeta>({
        app: "forums",
        path: `/board/${params.chShip}/${params.chName}/metadata`,
      }),
      api.scry<BoardThread>({
        app: "forums",
        path: `/board/${params.chShip}/${params.chName}/thread/${params.thread}`,
      }),
    ]).then((
      [{title, "allowed-tags": allowedTags}, {thread, posts}]:
      [BoardMeta, BoardThread]
    ) => {
      const response = [thread].concat(posts).find(post =>
        Number(post["post-id"]) === Number(params.response)
      );
      setBoardTagList(allowedTags.sort().map(tag => ({
        value: tag,
        label: `#${tag}`,
      })));
      setIsTagListRestricted(allowedTags.length !== 0);
      setQuestion(thread);
      reset({
        title: response?.thread?.title || "",
        tags: ((response?.thread?.tags.sort() || []) as string[]),
        content: response?.history[0].content || "",
      });
      setIsLoading(false);
    });
  }, [/*params*/]);

  useEffect(() => {
    if (state?.payload) {
      contentOnChange(state.payload);
    }
  }, [state]);

  return isLoading ? null : (
    <div className={className}>
      {(question !== undefined) && (
        <PostStrand post={question as BoardPost} />
      )}
      <FormProvider {...form}>
        <div className="py-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {isQuestionEdit && (
              <React.Fragment>
                <label className="mb-3 font-semibold">
                  New Title*
                  <input type="text" autoComplete="off" autoFocus
                    ref={titleRef}
                    className="input my-2 block w-full py-1 px-2"
                    value={title}
                    onChange={titleOnChange}
                  />
                </label>
                <label className="mb-3 font-semibold">
                  New Tags
                  {isTagListRestricted ? (
                    <MultiSelector
                      ref={tagsRef}
                      options={boardTagList}
                      value={tags.sort().map(t => boardTagList.find(e => e.value === t) || {value: t, label: `#${t}`})}
                      onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                      isLoading={isLoading}
                      noOptionsMessage={() => `Tags are restricted; please select an existing tag.`}
                      className="my-2 w-full"
                    />
                  ) : (
                    <CreatableMultiSelector
                      ref={tagsRef}
                      options={boardTagList}
                      value={tags.sort().map(t => boardTagList.find(e => e.value === t) || {value: t, label: `#${t}`})}
                      onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                      isLoading={isLoading}
                      className="my-2 w-full"
                    />
                  )}
                </label>
              </React.Fragment>
            )}
            <label className="mb-3 font-semibold">
              <div className="flex flex-row justify-between items-center">
                {isQuestionEdit ? "New Content*" : "Response*"}
                <Link className="small-button" to="ref" state={{bgLocation: location}}>
                  <DownloadIcon />
                </Link>
              </div>
              <Editor
                value={content}
                onValueChange={contentOnChange}
                // FIXME: This may have been broken by new import
                // syntax... need to test to double check.
                highlight={code => highlight(code, languages.md, "md")}
                // @ts-ignore
                rows={8} // FIXME: workaround via 'min-h-...'
                padding={8} // FIXME: workaround, but would prefer 'py-1 px-2'
                ignoreTabKey={true}
                className="input my-2 block w-full min-h-[calc(8em+8px)]"
              />
            </label>

            <footer className="mt-4 flex items-center justify-between space-x-2">
              <div className="ml-auto flex items-center space-x-2">
                <Link className="secondary-button ml-auto" to="../">
                  Cancel
                </Link>
                <button className="button" type="submit"
                  disabled={!isValid || !isDirty}>
                  Submit
                </button>
              </div>
            </footer>
          </form>
        </div>
      </FormProvider>
    </div>
  );
}

export function SettingsForm({className}: ClassProps) {
  // TODO: Use 'BulkEditor' and for finer-grained editing control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTagListRestricted, setIsTagListRestricted] = useState<boolean>(false);
  const [boardTagList, setBoardTagList] = useState<SelectorOption[]>([]);
  const [boardTitle, setBoardTitle] = useState<string>("");

  const navigate = useNavigate();
  const params = useParams();

  // TODO: The user should also be able to modify the settings if they're
  // an admin for the current board.
  const canEdit = params.chShip === window.our;

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      title: "",
      description: "",
      tagMode: "unrestricted",
      newTags: ([] as string[]),
    },
  });
  const {register, handleSubmit, reset, formState: {isDirty, isValid}, control, watch} = form;
  const tagMode = watch("tagMode", "");
  const {field: {value: newTags, onChange: newTagsOnChange, ref: newTagsRef}} =
    useController({name: "newTags", rules: {required: tagMode === "restricted"}, control});
  const onSubmit = useCallback(({
    title,
    description,
    tagMode,
    newTags
  }: {
    title: string;
    description: string;
    tagMode: string;
    newTags: string[];
  }) => {
    api.poke({
      app: "forums",
      mark: "forums-action",
      json: {
        board: `${params.chShip}/${params.chName}`,
        action: {"edit-board": {
          title: title,
          description: description,
          tags: tagMode === "unrestricted" ? [] : newTags,
        }},
      },
    }).then((result: any) =>
      navigate("../", {relative: "path"})
    );
  }, [params, navigate]);

  useEffect(() => {
    api.scry<BoardMeta>({
      app: "forums",
      path: `/board/${params.chShip}/${params.chName}/metadata`,
    }).then(({title, description, "allowed-tags": allowedTags}: BoardMeta) => {
      setBoardTitle(title);
      setBoardTagList(allowedTags.sort().map(tag => ({
        value: tag,
        label: `#${tag}`,
      })));
      setIsTagListRestricted(allowedTags.length !== 0);
      reset({
        title: title,
        description: description,
        tagMode: (allowedTags.length !== 0) ? "restricted" : "unrestricted",
        newTags: allowedTags.sort(),
      });
      setIsLoading(false);
    });
  }, [params]);

  useEffect(() => {
    if (tagMode === "restricted") {
      newTagsOnChange(boardTagList.map(t => t.value));
    }
  }, [tagMode]);

  return isLoading ? null : (
    <FormProvider {...form}>
      <div className={className}>
        <div className="sm:w-96">
          <header className="mb-3 flex items-center">
            <h1 className="text-lg font-bold">Change Settings for '{boardTitle}'</h1>
          </header>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mb-3 font-semibold">
            Board Title
            <input type="text" autoComplete="off" autoFocus
              disabled={!canEdit}
              className="input my-2 block w-full py-1 px-2"
              {...register("title", {required: true})}
            />
          </label>
          <label className="mb-3 font-semibold">
            Board Description
            <input type="text" autoComplete="off"
              disabled={!canEdit}
              className="input my-2 block w-full py-1 px-2"
              {...register("description", {required: false})}
            />
          </label>

          <label className="mb-3 font-semibold">
            Tag Behavior
            <TagModeRadio field="tagMode" disabled={!canEdit} />
          </label>
          {(tagMode === "restricted") && (
            <CreatableMultiSelector
              ref={newTagsRef}
              options={boardTagList}
              value={newTags ? newTags.sort().map(t => boardTagList.find(e => e.value === t) || {value: t, label: `#${t}`}) : newTags}
              onChange={o => newTagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
              className="my-2 w-full font-semibold"
              isDisabled={!canEdit}
            />
          )}

          <footer className="mt-4 flex items-center justify-between space-x-2">
            <div className="ml-auto flex items-center space-x-2">
              <Link className="secondary-button ml-auto" to="../">
                Cancel
              </Link>
              <button className="button" type="submit"
                disabled={!canEdit || !isDirty || !isValid}>
                Publish
              </button>
            </div>
          </footer>
        </form>
      </div>
    </FormProvider>
  );
}
