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
import '@/styles/prism.css'; // FIXME: Improve styling by editing this file
import Dialog from '@/components/Dialog';
import {
  SingleSelector,
  MultiSelector,
  CreatableSingleSelector,
  CreatableMultiSelector,
  SelectorOption,
} from '@/components/Selector';
import api from '@/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorRedirect from '@/components/ErrorRedirect';
import { ToggleLink } from '@/components/Links';
import { TagModeRadio } from '@/components/Radio';
import { PostStrand } from '@/components/Post';
import { useGroupFlag, useVessel, useGroup, useGroups, useChannel } from '@/state/groups';
import {
  useBoardMeta,
  useThread,
  useBoardFlag,
  useEditBoardMutation,
  useNewThreadMutation,
  useEditThreadMutation,
  useNewReplyMutation,
  useEditPostMutation,
} from '@/state/quorum';
import { getOriginalEdit, getLatestEdit } from '@/logic/post';
import { useModalNavigate, useAnchorNavigate } from '@/logic/routing';
import { canWriteChannel } from '@/logic/utils';
import { BoardMeta, BoardThread, BoardPost, QuorumEditBoard } from '@/types/quorum';
import { ClassProps } from '@/types/ui';


// FIXME: There's a weird issue with all forms wherein using the syntax
// `const {... formState, ...} = form;` causes forms to lag by 1 input on
// recognizing a valid form, where using the syntax
// `const {... {isDirty, isValid} ...} = form;` works fine. The latter syntax
// is used everywhere for forms to avoid this problem, though ideally the
// `form` assignment could take any shape and the form would "just work".


interface BoardFormTags {
  options: SelectorOption[];
  restricted: boolean;
};


export function ResponseForm({className}: ClassProps) {
  // TODO: Add preview button to preview what question will look like
  const [canRespond, setCanRespond] = useState<boolean>(true);

  const anchorNavigate = useAnchorNavigate();
  const modalNavigate = useModalNavigate();
  const location = useLocation();
  const state = location?.state;
  const params = useParams();

  const isQuestionNew = params.thread === undefined;
  const isQuestionSub = isQuestionNew || params.thread === params.response;
  const subTitlePrefix = isQuestionNew ? "Question" : "New";

  const boardFlag = useBoardFlag();
  const board = useBoardMeta(boardFlag);
  const {options: tagOptions, restricted: areTagsRestricted} = getFormTags(board);
  const thread: BoardThread | undefined = isQuestionNew
    ? undefined
    : useThread(boardFlag, Number(params?.thread || 0));

  const groupFlag = useGroupFlag();
  const vessel = useVessel(groupFlag, window.our);
  const channel = useChannel(groupFlag, `quorum/${boardFlag}`);
  const group = useGroup(groupFlag);
  const canWrite = canWriteChannel({writers: board?.writers || []}, vessel, group?.bloc);

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
    useController({name: "title", rules: {required: isQuestionSub}, control});
  const {field: {value: content, onChange: contentOnChange, ref: contentRef}} =
    useController({name: "content", rules: {required: true}, control});
  const {field: {value: tags, onChange: tagsOnChange, ref: tagsRef}} =
    useController({name: "tags", rules: {required: false}, control});

  const {mutate: newThreadMutation, status: newThreadStatus} = useNewThreadMutation({
    onSuccess: () => anchorNavigate(`thread/${board?.["next-id"]}`),
  });
  const {mutate: newReplyMutation, status: newReplyStatus} = useNewReplyMutation({
    onSuccess: () => anchorNavigate(`thread/${params.thread}`),
  });
  const {mutate: editThreadMutation, status: editThreadStatus} = useEditThreadMutation({
    onSuccess: () => anchorNavigate(`thread/${params.thread}`),
  });
  const {mutate: editPostMutation, status: editPostStatus} = useEditPostMutation({
    onSuccess: () => anchorNavigate(`thread/${params.thread}`),
  });
  const mutateStatuses = [newThreadStatus, newReplyStatus, editThreadStatus, editPostStatus];
  const isLoading = Boolean(mutateStatuses.find(s => s === "loading"));
  const isErrored = Boolean(mutateStatuses.find(s => s === "error"));

  const onSubmit = useCallback(async ({
    title,
    tags,
    content,
  }: {
    title: string;
    tags: string[];
    content: string;
  }) => {
    if (isQuestionNew) {
      newThreadMutation({
        flag: boardFlag,
        update: {title, content, tags}
      });
    } else if (params?.response === undefined) {
      newReplyMutation({
        flag: boardFlag,
        update: {
          "parent-id": Number(params.thread),
          "content": content,
          "is-comment": false,
        },
      });
    } else {
      if (dirtyFields?.content) {
        editPostMutation({
          flag: boardFlag,
          update: {
            "post-id": Number(params?.response || 0),
            "content": content,
          },
        });
      }
      if (dirtyFields?.title || dirtyFields?.tags) {
        editThreadMutation({
          flag: boardFlag,
          update: {
            "post-id": Number(params?.response || 0),
            "title": dirtyFields?.title && title,
            "tags": dirtyFields?.tags && tags,
          },
        });
      }
    }
  }, [boardFlag, params, dirtyFields]);

  useEffect(() => {
    const posts = (thread === undefined) ? [] : [thread.thread].concat(thread.posts);
    const response = posts.find(post =>
      Number(post["post-id"]) === Number(params.response)
    );
    if (response === undefined) {
      // TODO: Error
    } else {
      // TODO: Incorporate %groups permissions (needs to be author, writer,
      // or admin...?)
      setCanRespond(getOriginalEdit(response).author === window.our);
      reset({
        title: response.thread?.title || "",
        tags: ((response.thread?.tags.sort() || []) as string[]),
        content: getLatestEdit(response).content,
      });
    }
  }, [thread]);

  useEffect(() => {
    // TODO: Remove the payload (?)
    if (state?.payload) {
      contentOnChange(state.payload);
    }
  }, [state]);

  return (board === undefined || (!isQuestionNew && thread === undefined)) ? null : (
    <div className={className}>
      {!canRespond ? (
        <ErrorRedirect anchor
          header="Permission Denied!"
          content={`
            You are not allowed to edit this response.
            Click the logo above to return to the source thread.
          `}
          to={`./thread/${params.thread}`}
        />
      ) : (
        <React.Fragment>
          {(!isQuestionNew && thread !== undefined) ? (
            <PostStrand post={thread?.thread} />
          ) : (
            <div>
              <header className="mb-3 flex items-center">
                <h1 className="text-lg font-bold">
                  Submit a New Question to '{board.title}'
                </h1>
              </header>
            </div>
          )}
          <FormProvider {...form}>
            <div className="py-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                {isQuestionSub && (
                  <React.Fragment>
                    <label className="mb-3 font-semibold">
                      {`${subTitlePrefix} Title*`}
                      <input type="text" autoComplete="off" autoFocus
                        ref={titleRef}
                        className="input my-2 block w-full py-1 px-2"
                        value={title}
                        disabled={!canWrite}
                        onChange={titleOnChange}
                      />
                    </label>
                    <label className="mb-3 font-semibold">
                      {`${subTitlePrefix} Tags`}
                      {areTagsRestricted ? (
                        <MultiSelector
                          ref={tagsRef}
                          options={tagOptions}
                          value={tags.sort().map(t => tagOptions.find(e => e.value === t) || {value: t, label: `#${t}`})}
                          onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                          isLoading={board === undefined}
                          isDisabled={!canWrite}
                          noOptionsMessage={() =>
                            `Tags are restricted; please select an existing tag.`
                          }
                          className="my-2 w-full"
                        />
                      ) : (
                        <CreatableMultiSelector
                          ref={tagsRef}
                          options={tagOptions}
                          value={tags.sort().map(t => tagOptions.find(e => e.value === t) || {value: t, label: `#${t}`})}
                          onChange={o => tagsOnChange(o ? o.map(oo => oo.value).sort() : o)}
                          isLoading={board === undefined}
                          isDisabled={!canWrite}
                          noOptionsMessage={({inputValue}) => (
                            inputValue === "" || inputValue.match(/^[a-z][a-z0-9\-]*$/)
                              ? `Please enter question tags.`
                              : `Given tag is invalid; please enter a term.`
                          )}
                          isValidNewOption={(inputValue, value, options, accessors) =>
                            Boolean(inputValue.match(/^[a-z][a-z0-9\-]*$/))
                          }
                          className="my-2 w-full"
                        />
                      )}
                    </label>
                  </React.Fragment>
                )}
                <label className="mb-3 font-semibold">
                  <div className="flex flex-row justify-between items-center">
                    {isQuestionSub ? `${subTitlePrefix} Content*` : "Response*"}
                    <ToggleLink to="ref"
                      disabled={!canWrite}
                      state={{bgLocation: location}}
                      className="small-button"
                    >
                      <DownloadIcon />
                    </ToggleLink>
                  </div>
                  <Editor
                    value={content}
                    onValueChange={contentOnChange}
                    highlight={code => highlight(code, languages.md, "md")}
                    // @ts-ignore
                    rows={8} // FIXME: workaround via 'min-h-...'
                    padding={8} // FIXME: workaround, but would prefer 'py-1 px-2'
                    ignoreTabKey={true}
                    disabled={!canWrite}
                    className="input my-2 block w-full min-h-[calc(8em+8px)]"
                  />
                </label>

                <footer className="mt-4 flex items-center justify-between space-x-2">
                  <div className="ml-auto flex items-center space-x-2">
                    <Link className="secondary-button ml-auto" to="../">
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="button"
                      disabled={!canWrite || !isValid || !isDirty}
                    >
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : isErrored ? (
                        "Error"
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </footer>
              </form>
            </div>
          </FormProvider>
        </React.Fragment>
      )}
    </div>
  );
}

export function SettingsForm({className}: ClassProps) {
  // TODO: Use 'BulkEditor' and for finer-grained editing control
  const boardFlag = useBoardFlag();
  const board = useBoardMeta(boardFlag);
  const {options: tagOptions, restricted: areTagsRestricted} = getFormTags(board);

  // TODO: The user should also be able to modify the settings if they're
  // an admin for the current board.
  const params = useParams();
  const canEdit = params.chShip === window.our;

  const form = useForm({
    mode: "onChange",
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

  const {mutate: editMutation, status: editStatus} = useEditBoardMutation({
    onSuccess: () => reset({...form.getValues()}),
  });
  const onSubmit = useCallback(async ({
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
    const editUpdate: QuorumEditBoard = {
      title,
      description,
      tags: tagMode === "unrestricted" ? [] : newTags,
    };
    editMutation({flag: boardFlag, update: editUpdate});
  }, [boardFlag, editMutation]);

  // FIXME: It would be better if these could be integrated into the original
  // 'useForm' call like they are in
  //   'landscape-apps/ui/src/groups/GroupAdmin/GroupInfoEditor.tsx'
  // but this causes problems when reloading the settings page (all the values
  // show up as blank and are not updated for by 'board' changing some reason).
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
              isValidNewOption={(inputValue, value, options, accessors) =>
                Boolean(inputValue.match(/^[a-z][a-z0-9\-]*$/))
              }
              className="my-2 w-full font-semibold"
              isDisabled={!canEdit}
            />
          )}

          <footer className="mt-4 flex items-center justify-between space-x-2">
            <div className="ml-auto flex items-center space-x-2">
              <Link className="secondary-button ml-auto" to="../">
                Cancel
              </Link>
              <button
                type="submit"
                className="button"
                disabled={!canEdit || !isDirty || !isValid}
              >
                {editStatus === 'loading' ? (
                  <LoadingSpinner />
                ) : editStatus === 'error' ? (
                  'Error'
                ) : (
                  'Save'
                )}
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
