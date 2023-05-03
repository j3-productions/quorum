import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FormProvider, useForm, useController } from 'react-hook-form';
import {
  PlusIcon,
  EnterIcon,
  QuestionMarkIcon,
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
import { TagModeRadio } from '~/components/Radio';
import api from '~/api';
import {
  isGroupAdmin,
  isChannelJoined,
  canReadChannel,
  getChannelIdFromTitle,
  nestToFlag,
} from '~/logic/utils';
import { useDismissNavigate } from '~/logic/routing';
import { Groups, Group, GroupChannel } from '~/types/groups';
import { ChatBriefs, ChatBrief } from '~/types/chat';

// FIXME: There's a weird issue with all forms wherein using the syntax
// `const {... formState, ...} = form;` causes forms to lag by 1 input on
// recognizing a valid form, where using the syntax
// `const {... {isDirty, isValid} ...} = form;` works fine. The latter syntax
// is used everywhere for forms to avoid this problem, though ideally the
// `form` assignment could take any shape and the form would "just work".


export function QuestionForm({className}) {
  // TODO: Get access to the board name to display "submit message to X" in the
  // form header.
  // TODO: Add preview button to preview what question will look like
  // TODO: Set `isTagListRestricted` based on the board metadata (i.e.
  // `metadata['allowed-tags'].length == 0`).
  // TODO: Refactor the JSX code so that the same set of props is passed to
  // both types of `MultiSelector` component.
  const [isLoading, setIsLoading] = useState(false);
  const [isTagListRestricted, setIsTagListRestricted] = useState(true);
  const [boardTagList, setBoardTagList] = useState([]);

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
  const onSubmit = useCallback((data) => {
    alert(JSON.stringify(data));
  }, []);

  useEffect(() => {
    setBoardTagList([
      {value: "tag-1", label: "#tag-1"},
      {value: "tag-2", label: "#tag-2"},
      {value: "tag-3", label: "#tag-3"},
      {value: "tag-4", label: "#tag-4"},
    ]);
    // setBoardTagList([]);
    setIsLoading(false);
    // setIsTagListRestricted(false);
  }, []);

  return (
    <FormProvider {...form}>
      <div className={className}>
        <div className="sm:w-96">
          <header className="mb-3 flex items-center">
            <h1 className="text-lg font-bold">Submit a New Question</h1>
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
                value={tags ? tags.map(t => boardTagList.find(e => e.value === t)) : tags}
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
  // TODO: Get access to the board name to display "submit message to X" in the
  // form header.
  const [isLoading, setIsLoading] = useState(false);
  const [boardTagList, setBoardTagList] = useState([]);

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      mode: 'unrestricted',
      toAdd: [],
      toRem: [],
    },
  });
  const {register, handleSubmit, formState: {isDirty, isValid}, control, watch} = form;
  const onSubmit = useCallback((data) => {
    alert(JSON.stringify(data));
  }, []);
  const tagMode = watch("mode", "");

  useEffect(() => {
    setBoardTagList([
      {value: "tag-1", label: "#tag-1"},
      {value: "tag-2", label: "#tag-2"},
      {value: "tag-3", label: "#tag-3"},
      {value: "tag-4", label: "#tag-4"},
    ]);
    setIsLoading(false);
  }, []);

  return (
    <FormProvider {...form}>
      <div className={className}>
        <div className="sm:w-96">
          <header className="mb-3 flex items-center">
            <h1 className="text-lg font-bold">Change Settings</h1>
          </header>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mb-3 font-semibold">
            Tag Behavior
            <TagModeRadio field={"mode"} />
          </label>

          {(tagMode === "restricted") && (
            <div className="border-gray-50 border-t-2 pt-2 mb-3">
              <label className="mb-3 font-semibold">
                Tag Changes
              </label>
              <p>
                TODO: Add an interface for viewing existing tags, adding new
                tags, and removing existing tags
              </p>
            </div>
          )}

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
