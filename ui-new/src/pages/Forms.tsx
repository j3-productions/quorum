import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { FormProvider, useForm, useController, useWatch } from 'react-hook-form';
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
import api from '~/api';
import { TagModeRadio } from '~/components/Radio';
import { PostStrand } from '~/components/Post';
import { useBoardMeta, useThread } from '~/state/quorum';
import { useModalNavigate } from '~/logic/routing';
import { BoardMeta, BoardThread, BoardPost } from '~/types/quorum';
import { ClassProps } from '~/types/ui';


// FIXME: There's a weird issue with all forms wherein using the syntax
// `const {... formState, ...} = form;` causes forms to lag by 1 input on
// recognizing a valid form, where using the syntax
// `const {... {isDirty, isValid} ...} = form;` works fine. The latter syntax
// is used everywhere for forms to avoid this problem, though ideally the
// `form` assignment could take any shape and the form would "just work".
// TODO: Consider combining 'QuestionForm' and 'ResponseForm' into a
// single component (would also allow for importing in question form).


interface BoardFormTags {
  options: SelectorOption[];
  restricted: boolean;
};


export function QuestionForm({className}: ClassProps) {
  // TODO: Add preview button to preview what question will look like
  // TODO: Refactor the JSX code so that the same set of props is passed to
  // both types of `MultiSelector` component.
  const params = useParams();
  const navigate = useNavigate();

  const board = useBoardMeta(`${params?.chShip}/${params?.chName}`);
  const {options: tagOptions, restricted: areTagsRestricted} = getFormTags(board);

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
      mark: "forums-poke",
      json: {
        board: `${params.chShip}/${params.chName}`,
        action: {"new-thread": {
          title: title,
          content: content,
          tags: tags,
        }},
      },
    }).then((result: any) =>
      navigate(`../thread/${board?.["next-id"]}`, {relative: "path"})
    );
  }, [board, params, navigate]);

  return (board === undefined) ? null : (
    <FormProvider {...form}>
      <div className={className}>
        <div>
          <header className="mb-3 flex items-center">
            <h1 className="text-lg font-bold">Submit a New Question to '{board.title}'</h1>
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
            {areTagsRestricted ? (
              <MultiSelector
                ref={tagsRef}
                options={tagOptions}
                value={tags.sort().map(t => tagOptions.find(e => e.value === t) || {value: t, label: `#${t}`})}
                onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                isLoading={board === undefined}
                noOptionsMessage={() => `Tags are restricted; please select an existing tag.`}
                className="my-2 w-full"
              />
            ) : (
              <CreatableMultiSelector
                ref={tagsRef}
                options={tagOptions}
                value={tags.sort().map(t => tagOptions.find(e => e.value === t) || {value: t, label: `#${t}`})}
                onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                isLoading={board === undefined}
                noOptionsMessage={({inputValue}) => (
                  inputValue === "" || inputValue.match(/^[a-z][a-z0-9\-]*$/)
                    ? `Please enter question tags.`
                    : `Given tag is invalid; please enter a term.`
                )}
                isValidNewOption={(value) => value.match(/^[a-z][a-z0-9\-]*$/)}
                className="my-2 w-full"
              />
            )}
          </label>
          <label className="mb-3 font-semibold">
            Question Content*
            <Editor
              value={content}
              onValueChange={contentOnChange}
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
  const navigate = useNavigate();
  const modalNavigate = useModalNavigate();
  const location = useLocation();
  const state = location?.state;
  const params = useParams();

  const board = useBoardMeta(`${params?.chShip}/${params?.chName}`);
  const {options: tagOptions, restricted: areTagsRestricted} = getFormTags(board);
  const thread: BoardThread | undefined = useThread(
    `${params?.chShip}/${params?.chName}`,
    Number(params?.thread || 0),
  );
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
      mark: "forums-poke",
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

  useEffect(() => {
    const posts = (thread === undefined) ? [] : [thread.thread].concat(thread.posts);
    const response = posts.find(post =>
      Number(post["post-id"]) === Number(params.response)
    );
    reset({
      title: response?.thread?.title || "",
      tags: ((response?.thread?.tags.sort() || []) as string[]),
      content: response?.history[0].content || "",
    });
  }, [thread]);

  useEffect(() => {
    if (state?.payload) {
      // TODO: Remove the payload
      contentOnChange(state.payload);
    }
  }, [state]);

  return (board === undefined || thread === undefined) ? null : (
    <div className={className}>
      <PostStrand post={thread?.thread} />
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
                  {areTagsRestricted ? (
                    <MultiSelector
                      ref={tagsRef}
                      options={tagOptions}
                      value={tags.sort().map(t => tagOptions.find(e => e.value === t) || {value: t, label: `#${t}`})}
                      onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                      isLoading={board === undefined}
                      noOptionsMessage={() => `Tags are restricted; please select an existing tag.`}
                      className="my-2 w-full"
                    />
                  ) : (
                    <CreatableMultiSelector
                      ref={tagsRef}
                      options={tagOptions}
                      value={tags.sort().map(t => tagOptions.find(e => e.value === t) || {value: t, label: `#${t}`})}
                      onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                      isLoading={board === undefined}
                      noOptionsMessage={({inputValue}) => (
                        inputValue === "" || inputValue.match(/^[a-z][a-z0-9\-]*$/)
                          ? `Please enter question tags.`
                          : `Given tag is invalid; please enter a term.`
                      )}
                      isValidNewOption={(value) => value.match(/^[a-z][a-z0-9\-]*$/)}
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
  const navigate = useNavigate();
  const params = useParams();

  const board = useBoardMeta(`${params?.chShip}/${params?.chName}`);
  const {options: tagOptions, restricted: areTagsRestricted} = getFormTags(board);
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
  const {register, handleSubmit, reset, formState: {isDirty, isValid}, control} = form;
  const tagMode = useWatch({name: "tagMode", control});
  const {field: {value: newTags, onChange: newTagsOnChange, ref: newTagsRef}} =
    useController({name: "newTags", rules: {required: tagMode === "restricted"}, control});
  const onSubmit = useCallback(({
    title,
    description,
    tagMode,
    newTags,
  }: {
    title: string;
    description: string;
    tagMode: string;
    newTags: string[];
  }) => {
    api.poke({
      app: "forums",
      mark: "forums-poke",
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
    reset({
      title: board?.title || "",
      description: board?.description || "",
      tagMode: areTagsRestricted ? "restricted" : "unrestricted",
      newTags: (board?.["allowed-tags"] || []).sort(),
    });
  }, [board, areTagsRestricted]);

  return (board === undefined) ? null : (
    <FormProvider {...form}>
      <div className={className}>
        <div>
          <header className="mb-3 flex items-center">
            <h1 className="text-lg font-bold">Change Settings for '{board.title}'</h1>
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
              options={tagOptions}
              value={newTags ? newTags.sort().map(t => tagOptions.find(e => e.value === t) || {value: t, label: `#${t}`}) : newTags}
              onChange={o => newTagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
              isLoading={board === undefined}
              noOptionsMessage={({inputValue}) => (
                inputValue === "" || inputValue.match(/^[a-z][a-z0-9\-]*$/)
                  ? `Please enter one or more valid tags.`
                  : `Given tag is invalid; please enter a term.`
              )}
              isValidNewOption={(value) => value.match(/^[a-z][a-z0-9\-]*$/)}
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

function getFormTags(board: BoardMeta | undefined): BoardFormTags {
  return {
    restricted: !board || board["allowed-tags"].length > 0,
    options: !board
      ? []
      : board["allowed-tags"].sort().map(t => ({value: t, label: `#${t}`})),
  };
}
