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
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import '~/styles/prism.css'; // FIXME: Improve styling by editing this file
import Dialog from '~/components/Dialog';
import {
  SingleSelector,
  MultiSelector,
  CreatableSingleSelector,
  CreatableMultiSelector,
} from '~/components/Selector';
import { BulkEditor } from '~/components/BulkEditor';
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

// FIXME: There's a weird issue with all forms wherein using the syntax
// `const {... formState, ...} = form;` causes forms to lag by 1 input on
// recognizing a valid form, where using the syntax
// `const {... {isDirty, isValid} ...} = form;` works fine. The latter syntax
// is used everywhere for forms to avoid this problem, though ideally the
// `form` assignment could take any shape and the form would "just work".


export function QuestionForm({className}) {
  // TODO: Add preview button to preview what question will look like
  // TODO: Refactor the JSX code so that the same set of props is passed to
  // both types of `MultiSelector` component.
  const [isLoading, setIsLoading] = useState(true);
  const [isTagListRestricted, setIsTagListRestricted] = useState(false);
  const [boardTagList, setBoardTagList] = useState([]);
  const [boardTitle, setBoardTitle] = useState("");
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
  const onSubmit = useCallback(({title, content, tags}) => {
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
    }).then(response => {
      navigate("../", {relative: "path"});
    });
  }, [params, navigate]);

  useEffect(() => {
    api.scry<BoardMeta>({
      app: "forums",
      path: `/board/${params.chShip}/${params.chName}/metadata`,
    }).then(({title, "allowed-tags": allowedTags}: BoardMeta) => {
      setBoardTitle(title);
      setBoardTagList(allowedTags.map(tag => ({
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
              {...register("title", { required: true })}
            />
          </label>
          <label className="mb-3 font-semibold">
            Question Tags
            {isTagListRestricted ? (
              <MultiSelector
                ref={tagsRef}
                options={boardTagList}
                value={tags ? tags.map(t => boardTagList.find(e => e.value === t)) : tags}
                onChange={o => tagsOnChange(o ? o.map(oo => oo.value) : o)}
                isLoading={isLoading}
                className="my-2 w-full"
              />
            ) : (
              <CreatableMultiSelector
                ref={tagsRef}
                options={boardTagList}
                value={tags ? tags.map(t => boardTagList.find(e => e.value === t) || {value: t, label: `#${t}`}) : tags}
                onChange={o => tagsOnChange(o ? o.map(oo => oo.value) : o)}
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
              highlight={code => highlight(code, languages.md)}
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

export function SettingsForm({className}) {
  // TODO: Need to fix up the default values and form stuff so that it's
  // all set after the 'useEffect' fires; right now the tags field is in
  // a weird empty state if it's the current state for the board, and
  // requires resetting the field to work.
  const [isLoading, setIsLoading] = useState(true);
  const [isTagListRestricted, setIsTagListRestricted] = useState(false);
  const [boardTagList, setBoardTagList] = useState([]);
  const [boardTitle, setBoardTitle] = useState("");
  const navigate = useNavigate();
  const params = useParams();

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      tagMode: "unrestricted",
      // TODO: Use 'BulkEditor' and edit list for better control
      newTags: [],
    },
  });
  const {register, handleSubmit, formState: {isDirty, isValid}, control, watch} = form;
  const {field: {value: newTags, onChange: newTagsOnChange, ref: newTagsRef}} =
    useController({name: "newTags", rules: {required: false}, control});
  const onSubmit = useCallback(({tagMode, newTags}) => {
    api.poke({
      app: "forums",
      mark: "forums-action",
      json: {
        board: `${params.chShip}/${params.chName}`,
        action: {"edit-board": {
          // title: title,
          // description: description,
          tags: tagMode === "unrestricted" ? [] : newTags,
        }},
      },
    }).then(response => {
      navigate("../", {relative: "path"});
    });
  }, []);
  const tagMode = watch("tagMode", "");

  useEffect(() => {
    api.scry<BoardMeta>({
      app: "forums",
      path: `/board/${params.chShip}/${params.chName}/metadata`,
    }).then(({title, "allowed-tags": allowedTags}: BoardMeta) => {
      setBoardTitle(title);
      setBoardTagList(allowedTags.map(tag => ({
        value: tag,
        label: `#${tag}`,
      })));
      setIsTagListRestricted(allowedTags.length !== 0);
      setIsLoading(false);
      newTagsOnChange(boardTagList.map(t => t.value));
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
            Tag Behavior
            <TagModeRadio field="tagMode" />
          </label>
          {(tagMode === "restricted") && (
            <CreatableMultiSelector
              ref={newTagsRef}
              options={boardTagList}
              value={newTags ? newTags.map(t => boardTagList.find(e => e.value === t) || {value: t, label: `#${t}`}) : newTags}
              onChange={o => newTagsOnChange(o ? o.map(oo => oo.value) : o)}
              className="my-2 w-full font-semibold"
            />
          )
          /* <BulkEditor field="tagEdits" data={boardTagList} className="my-3" /> */
          }

          <footer className="mt-4 flex items-center justify-between space-x-2">
            <div className="ml-auto flex items-center space-x-2">
              <Link className="secondary-button ml-auto" to="../">
                Cancel
              </Link>
              <button className="button" type="submit"
                disabled={!isDirty || !isValid}>
                Publish
              </button>
            </div>
          </footer>
        </form>
      </div>
    </FormProvider>
  );
}

export function PostThread({className}) {
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState<BoardPost>(undefined);
  const [answers, setAnswers] = useState<BoardPost[]>(undefined);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    api.scry<BoardThread>({
      app: "forums",
      path: `/board/${params.chShip}/${params.chName}/thread/${params.thread}`,
    }).then(({thread, posts}: BoardThread) => {
      setQuestion(thread);
      setAnswers(posts);
      setIsLoading(false);
    });

    // setQuestion(TEST_THREADS[params.thread]);
    // setAnswers(TEST_THREADS[params.thread].comments.map((anId) =>
    //   TEST_POSTS[anId]
    // ));
    // setIsLoading(false);
  }, [params]);

  // TODO: Make the "Answer" button link to the user's existing answer if
  // it exists.

  const isBestTid = (p: BoardPost): number =>
    +(p["post-id"] === question.thread["best-id"]);
  const calcScore = (p: BoardPost): number =>
    Object.values(p.votes).reduce((n, i) => n + (i === "up" ? 1 : -1), 0);
  const ourResponse = isLoading
    ? undefined
    : answers.find(p => p.history.slice(-1)[0].author === window.our);

  return isLoading ? null : (
    <div className={className}>
      <PostStrand post={question}
        toPost={(post) =>
          () => navigate(`response/${post["post-id"]}`, {relative: "path"})
        }
        parent={question}
      />
      {answers
        .sort((a, b) => (
          isBestTid(b) - isBestTid(a)
          || calcScore(b) - calcScore(a)
          || b.history[0].timestamp - a.history[0].timestamp
        )).map(answer => (
          <PostStrand key={answer['post-id']} post={answer}
            toPost={(post) =>
              () => navigate(`response/${post["post-id"]}`, {relative: "path"})
            }
            parent={question}
          />
        )
      )}

      <footer className="mt-4 flex items-center justify-between space-x-2">
        <div className="ml-auto flex items-center space-x-2">
          <Link className="secondary-button ml-auto" to="../../" relative="path">
            Cancel
          </Link>
          <Link className="button" to="response"
            disabled={isLoading || (ourResponse !== undefined)}
          >
            Answer
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function ResponseForm({className}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isTagListRestricted, setIsTagListRestricted] = useState(false);
  const [boardTagList, setBoardTagList] = useState([]);
  const [question, setQuestion] = useState(undefined);
  const [response, setResponse] = useState(undefined);

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
      tags: [],
      content: "",
    },
  });
  const {register, handleSubmit, setValue, formState: {isDirty, isValid}, control} = form;
  const {field: {value: title, onChange: titleOnChange, ref: titleRef}} =
    useController({name: "title", rules: {required: isQuestionEdit}, control});
  const {field: {value: content, onChange: contentOnChange, ref: contentRef}} =
    useController({name: "content", rules: {required: true}, control});
  const {field: {value: tags, onChange: tagsOnChange, ref: tagsRef}} =
    useController({name: "tags", rules: {required: false}, control});
  const onSubmit = useCallback(({title, content, tags}) => {
    const responseActions = (params?.response === undefined)
      ? [{"new-reply": {
          "parent-id": Number(params.thread),
          "content": content,
          "is-comment": false,
        }}]
      : [{"edit-post": {
          "post-id": Number(params.response),
          "content": content,
        }}].concat(!isQuestionEdit
          ? []
          : [{"edit-thread": {
            "post-id": Number(params.response),
            "title": title,
            "tags": tags,
          }}]
        );

    Promise.all(responseActions.map(action => api.poke({
      app: "forums",
      mark: "forums-action",
      json: {
        board: `${params.chShip}/${params.chName}`,
        action: action,
      },
    }))).then(response => {
      navigate(
        ["thread", "response"].filter(s => s in params).fill("../").join(""),
        {relative: "path"},
      );
    });
  }, []);

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
    ]).then(([{title, "allowed-tags": allowedTags}, {thread, posts}]: [BoardMeta, BoardThread]) => {
      const response = [thread].concat(posts).find(post =>
        Number(post["post-id"]) === Number(params.response)
      );
      setBoardTagList(allowedTags.map(tag => ({
        value: tag,
        label: `#${tag}`,
      })));
      setIsTagListRestricted(allowedTags.length !== 0);
      setQuestion(thread);
      setResponse(response);
      setValue("title", response?.thread?.title || "");
      // FIXME: Weird behavior where select is not populated w/ values
      // after loading.
      setValue("tags", response?.thread?.tags.map(t => ({value: t, label: `#${t}`})) || []);
      setValue("content", response?.history[0].content || "");
      setIsLoading(false);
    });
  }, [params]);

  return isLoading ? null : (
    <div className={className}>
      <PostStrand post={question} toPost={(post) => () => navigate(`.`)} />
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
                      value={tags ? tags.map(t => boardTagList.find(e => e.value === t)) : tags}
                      onChange={o => tagsOnChange(o ? o.map(oo => oo.value) : o)}
                      isLoading={isLoading}
                      className="my-2 w-full"
                    />
                  ) : (
                    <CreatableMultiSelector
                      ref={tagsRef}
                      options={boardTagList}
                      value={tags ? tags.map(t => boardTagList.find(e => e.value === t) || {value: t, label: `#${t}`}) : tags}
                      onChange={o => tagsOnChange(o ? o.map(oo => oo.value) : o)}
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
                highlight={code => highlight(code, languages.md)}
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
