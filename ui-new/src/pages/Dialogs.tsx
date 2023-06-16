import React, { useState, useEffect, useCallback } from 'react';
import { FormProvider, useForm, useController } from 'react-hook-form';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  PlusIcon,
  EnterIcon,
  QuestionMarkIcon,
  Cross2Icon,
  HomeIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import api from '~/api';
import Author from '~/components/Author';
import Dialog from '~/components/Dialog';
import {
  SingleSelector,
  MultiSelector,
  SelectorOption,
} from '~/components/Selector';
import LoadingSpinner from '~/components/LoadingSpinner';
import { ChannelPrivacyRadio } from '~/components/Radio';
import PrivacySelector from '~/components/ChannelPermsSelector';
import MarkdownBlock from '~/components/MarkdownBlock';
import {
  RefPlaceholder,
} from '~/components/LoadingPlaceholders';
import {
  useBoardFlag,
  useNewBoardMutation,
  useJoinBoardMutation,
  useDeletePostMutation,
} from '~/state/quorum';
import { useGroups } from '~/state/groups';
import {
  isChannelJoined,
  canReadChannel,
  getFlagParts,
  nestToFlag,
} from '~/logic/utils';
import {
  inlineToMarkdown,
  isChatRef,
  isGroupAdmin,
  getChannelIdFromTitle,
  makeTerseDateAndTime,
} from '~/logic/local';
import { useDismissNavigate, useAnchorNavigate } from '~/logic/routing';
import { Groups, Group, GroupChannel } from '~/types/groups';
import { ChatBrief, ChatBriefs, ChatWrit, ChatWrits, ChatStory } from '~/types/chat';


interface GroupsRef {
  id: string;
  flag: string;
  author: string;
  timestamp: number;
  content: string;
};


export function CreateDialog() {
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());

  const groups: Groups = useGroups();
  const {mutate: newMutation, status: newStatus} = useNewBoardMutation({
    onSuccess: () => dismiss(),
  });

  const adminGroups = (Object.entries(groups) as [string, Group][])
    .filter(([flag, group]: [string, Group]) => isGroupAdmin(group));
  const groupOpts = adminGroups.map(([flag, {meta}]: [string, Group]) => ({
    value: flag,
    label: meta.title,
  }));

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      group: "",
      name: "",
      description: "",
      privacy: "public",
    },
  });
  const {register, handleSubmit, formState: {isDirty, isValid}, control} = form;
  const {field: {value: group, onChange: groupOnChange, ref: groupRef}} =
    useController({name: "group", rules: {required: true}, control});
  const onSubmit = useCallback(async ({
    group: groupFlag,
    name,
    description,
    privacy
  }: {
    group: string;
    name: string;
    description: string;
    privacy: string;
  }) => {
    // TODO: If 'board' is already taken on this host, then use
    // 'boardBackup' instead.
    const [board, boardBackup] = getChannelIdFromTitle(name);
    const boardFlag = `${window.our}/${board}`;
    newMutation({
      flag: boardFlag,
      update: {
        group: groupFlag,
        title: name,
        description: description,
        tags: [],
      }
    });
  }, [newMutation]);

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <FormProvider {...form}>
        <div className="sm:w-96">
          <header className="mb-3 flex items-center">
            <h2 className="text-lg font-bold">Create New Q&A Channel</h2>
          </header>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mb-3 font-semibold">
            Group Name*
            <SingleSelector
              ref={groupRef}
              options={groupOpts}
              value={groupOpts.find(e => e.value === group)}
              onChange={o => groupOnChange(o ? o.value : o)}
              isLoading={groupOpts.length === 0}
              noOptionsMessage={() => `Please select an existing group.`}
              className="my-2 w-full"
              autoFocus
            />
          </label>
          <label className="mb-3 font-semibold">
            Channel Name*
            <input type="text" autoComplete="off"
              className="input my-2 block w-full py-1 px-2"
              {...register("name", {required: true})}
            />
          </label>
          <label className="mb-3 font-semibold">
            Channel Description
            <input type="text" autoComplete="off"
              className="input my-2 block w-full py-1 px-2"
              {...register("description", {required: false})}
            />
          </label>
          <label className="mb-3 font-semibold">
            Channel Permissions
            <ChannelPrivacyRadio field={"privacy"} />
            {/* TODO: Implement this once groups permissions are figured out. */}
            {/*group !== "" && (
              <PrivacySelector group={groups[group]} />
            )*/}
          </label>

          <footer className="mt-4 flex items-center justify-between space-x-2">
            <div className="ml-auto flex items-center space-x-2">
              <DialogPrimitive.Close asChild>
                <button className="secondary-button ml-auto">
                  Cancel
                </button>
              </DialogPrimitive.Close>
              <button
                type="submit"
                className="button"
                disabled={!isValid || !isDirty}
              >
                {newStatus === 'loading' ? (
                  <LoadingSpinner />
                ) : newStatus === 'error' ? (
                  'Error'
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </footer>
        </form>
      </FormProvider>
    </Dialog>
  );
}

export function JoinDialog() {
  // FIXME: Right now, 'group' is just being used as a proxy for the remote
  // host of the board. Eventually, this should be changed so that the parent
  // group uses its channel information and provides a list of all quorum
  // boards that are available to 'window.our' in that channel list.
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());
  const {mutate: joinMutation, status: joinStatus} = useJoinBoardMutation({
    onSuccess: () => dismiss(),
  });

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      ship: "",
      board: "",
    },
  });
  const {register, handleSubmit, formState: {isDirty, isValid}} = form;
  const onSubmit = useCallback(({
    ship,
    board,
  }: {
    ship: string;
    board: string;
  }) => {
    joinMutation({flag: `${ship}/${board}`});
  }, [joinMutation]);

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <FormProvider {...form}>
        <div className="sm:w-96">
          <header className="mb-3 flex items-center">
            <h2 className="text-lg font-bold">Join Existing Q&A Channel</h2>
          </header>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mb-3 font-semibold">
            Board Ship Name*
            <input type="text" autoComplete="off"
              className="input my-2 block w-full py-1 px-2"
              {...register("ship", {required: true})}
            />
          </label>
          <label className="mb-3 font-semibold">
            Board Channel Name*
            <input type="text" autoComplete="off"
              className="input my-2 block w-full py-1 px-2"
              {...register("board", {required: true})}
            />
          </label>

          <footer className="mt-4 flex items-center justify-between space-x-2">
            <div className="ml-auto flex items-center space-x-2">
              <DialogPrimitive.Close asChild>
                <button className="secondary-button ml-auto">
                  Cancel
                </button>
              </DialogPrimitive.Close>
              <button
                type="submit"
                className="button"
                disabled={!isValid || !isDirty}
              >
                {joinStatus === 'loading' ? (
                  <LoadingSpinner />
                ) : joinStatus === 'error' ? (
                  'Error'
                ) : (
                  'Join'
                )}
              </button>
            </div>
          </footer>
        </form>
      </FormProvider>
    </Dialog>
  );
}

// export function JoinDialog() {
//   const [isGroupsLoading, setIsGroupsLoading] = useState<boolean>(true);
//   const [groups, setGroups] = useState<SelectorOption[]>([]);
//   const [isChannelsLoading, setIsChannelsLoading] = useState<boolean>(false);
//   const [channels, setChannels] = useState<SelectorOption[]>([]);
//
//   const dismiss = useDismissNavigate();
//   const onOpenChange = (open: boolean) => (!open && dismiss());
//
//   const form = useForm({
//     mode: 'onChange',
//     defaultValues: {
//       group: '',
//       channel: '',
//     },
//   });
//   const {register, handleSubmit, resetField, formState: {isDirty, isValid}, control} = form;
//   const {field: {value: group, onChange: groupOnChange, ref: groupRef}} =
//     useController({name: "group", rules: {required: true}, control});
//   const {field: {value: channel, onChange: channelOnChange, ref: channelRef}} =
//     useController({name: "channel", rules: {required: true}, control});
//   const onSubmit = useCallback(({group: groupFlag, channel}) => {
//     // const [groupHost, groupName] = getFlagParts(groupFlag);
//     alert(JSON.stringify(data));
//   }, []);
//
//   useEffect(() => {
//     api.scry<Groups>({
//       app: "groups",
//       path: `/groups`,
//     }).then((scryGroups: Groups) => {
//       setGroups(Object.entries(scryGroups).map(
//         ([flag, {meta}]: [string, Group]) => ({
//           value: flag,
//           label: meta.title,
//         })
//       ));
//       setIsGroupsLoading(false);
//     });
//   }, []);
//
//   useEffect(() => {
//     group && Promise.all([
//       api.scry<Groups>({app: "groups", path: `/groups`}),
//       api.scry<ChatBriefs>({app: "chat", path: `/briefs`}),    // TODO: change to quorum
//     ]).then(([scryGroups, scryBriefs]: [Groups, ChatBriefs]) => {
//       const scryGroup = scryGroups[group];
//       const realBriefs = Object.fromEntries(Object.entries(scryBriefs).map(
//         ([key, value]) => [`chat/${key}`, value]
//       ));
//       const joinChannels = Object.entries(scryGroup.channels).filter(
//         ([nest, chan]: [string, GroupChannel]) =>
//           !isChannelJoined(nest, realBriefs)
//           && canReadChannel(chan, scryGroup.fleet?.[window.our], scryGroup.bloc)
//           && nestToFlag(nest)[0] === "chat"  // TODO: change to quorum
//       );
//       setChannels(joinChannels.map(([nest, {meta}]) => ({
//         value: nest,
//         label: meta.title,
//       })));
//       setIsChannelsLoading(false);
//     });
//   }, [group]);
//
//   return (
//     <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
//       <FormProvider {...form}>
//         <div className="sm:w-96">
//           <header className="mb-3 flex items-center">
//             <h2 className="text-lg font-bold">Join Existing Q&A Channel</h2>
//           </header>
//         </div>
//
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <label className="mb-3 font-semibold">
//             Group Name*
//             <SingleSelector
//               ref={groupRef}
//               options={groups}
//               value={groups.find(e => e.value === group)}
//               onChange={o => {
//                 groupOnChange(o ? o.value : o);
//                 setChannels([]);
//                 resetField("channel");
//                 setIsChannelsLoading(o ? true : false);
//               }}
//               isLoading={isGroupsLoading}
//               noOptionsMessage={() => `Please select an existing group.`}
//               className="my-2 w-full"
//               autoFocus
//             />
//           </label>
//           <label className="mb-3 font-semibold">
//             Channel Name*
//             <SingleSelector
//               ref={channelRef}
//               options={channels}
//               value={channels.find(e => e.value === channel)}
//               onChange={o => channelOnChange(o ? o.value : o)}
//               isLoading={isChannelsLoading}
//               noOptionsMessage={() => `Please select an existing channel.`}
//               className="my-2 w-full"
//             />
//           </label>
//
//           <footer className="mt-4 flex items-center justify-between space-x-2">
//             <div className="ml-auto flex items-center space-x-2">
//               <DialogPrimitive.Close asChild>
//                 <button className="secondary-button ml-auto">
//                   Cancel
//                 </button>
//               </DialogPrimitive.Close>
//               <button className="button" type="submit"
//                 disabled={!isValid || !isDirty}>
//                 Join
//               </button>
//             </div>
//           </footer>
//         </form>
//       </FormProvider>
//     </Dialog>
//   );
// }

export function RefDialog() {
  // TODO: Show a warning message if the given ref is non-empty and invalid
  // TODO: Show a check mark or green message if the given ref is non-empty
  // and valid
  // TODO: Add support for importing a window of references surrounding the
  // one input by the user (e.g. import a series of temporally proximal
  // references from groups)
  // TODO: Selecting import messages in the form causes them to be added to
  // the form's 'messages' field; deselecting them causes them to be removed
  const [loadedRefs, setLoadedRefs] = useState<GroupsRef[]>([]);

  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      importRef: '',
      messages: [],
    },
  });
  const {register, handleSubmit, formState: {isDirty, isValid}, control, watch} = form;
  const importRef = watch("importRef", "");
  const {field: {value: messages, onChange: messagesOnChange, ref: messagesRef}} =
    useController({name: "messages", rules: {required: true}, control});
  const onSubmit = useCallback(({
    importRef,
    messages
  }: {
    importRef: string;
    messages: GroupsRef[];
  }) => {
    dismiss(messages.map(({id, flag, author, timestamp, content}) =>
      `${content}\n(Imported from \`${flag}\`; original author \`${
      author}\` at ${makeTerseDateAndTime(new Date(timestamp))})`
    )[0]);
  }, [dismiss]);

  useEffect(() => {
    // TODO: Require the import link to be a 'chat' reference (diary and heap
    // not supported for starters).
    if (isChatRef(importRef)) {
      const [refChShip, refChName, _, refAuthor, refId]: string[] =
        importRef.split("/").slice(-5);
      // TODO: Add an error handling case here for when the user inputs a
      // structurally valid ref that isn't in `%groups` (scry returns null/error).
      api.scry<ChatWrits>({
        app: "chat",
        path: `/chat/${refChShip}/${refChName}/writs/newer/${refId}/1`,
      }).then((result: ChatWrits) => {
        const newLoadedRefs = (Object.entries(result) as [string, ChatWrit][])
          .map(([refId, {memo: refMemo}]): GroupsRef => ({
            id: refId,
            flag: `${refChShip}/${refChName}`,
            author: refMemo.author,
            timestamp: refMemo.sent,
            content: (refMemo.content as {story: ChatStory})
              .story.inline.map(inlineToMarkdown).join(""),
          }));
        setLoadedRefs(newLoadedRefs);
        messagesOnChange(newLoadedRefs);
      });
    } else if (!isChatRef(importRef) && loadedRefs.length > 0) {
      setLoadedRefs([]);
      messagesOnChange([]);
    }
  }, [importRef]);

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <FormProvider {...form}>
        <div className="sm:w-96">
          <header className="mb-3 flex items-center">
            <h2 className="text-lg font-bold">Import Groups Content</h2>
          </header>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mb-3 font-semibold">
            Groups Reference*
            <input type="text" autoComplete="off"
              className="input my-2 block w-full py-1 px-2"
              {...register("importRef", {required: true, validate: isChatRef})}
            />
          </label>

          <label className="mb-3 font-semibold">
            Reference Selection*
          </label>
          <div className="max-h-[200px] overflow-scroll">
            {loadedRefs.length === 0 ? (
              isChatRef(importRef) ? (
                <RefPlaceholder count={1} />
              ) : (
                <p>Input a valid groups reference to see selection.</p>
              )
            ) : (
              <div className="flex flex-col w-full items-center">
                {/* <span onClick={() => {}}>Load Older</span> */}
                {/* TODO: "border-4 border-gray-800" for selected entries */}
                {loadedRefs.map(({id, flag, author, timestamp, content}) => (
                  <div key={id} className="w-full card bg-gray-100">
                    <div
                      className="flex items-center space-x-2 font-semibold mb-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Author ship={author} date={new Date(timestamp)} />
                    </div>
                    <MarkdownBlock content={content} archetype="body" />
                  </div>
                ))}
                {/* <span onClick={() => {}}>Load Newer</span> */}
              </div>
            )}
          </div>

          <footer className="mt-4 flex items-center justify-between space-x-2">
            <div className="ml-auto flex items-center space-x-2">
              <DialogPrimitive.Close asChild>
                <button className="secondary-button ml-auto">
                  Cancel
                </button>
              </DialogPrimitive.Close>
              <button
                type="submit"
                className="button"
                disabled={!isValid || !isDirty}
              >
                Import
              </button>
            </div>
          </footer>
        </form>
      </FormProvider>
    </Dialog>
  );
}

export function DeleteDialog() {
  // TODO: Revise the content of the dialog based on whether the
  // deleting user is the author or the admin (author overrides admin
  // message in the case that both are true).
  const anchorNavigate = useAnchorNavigate();
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());
  const params = useParams();

  const boardFlag = useBoardFlag();
  const isThread = params.response === params.thread;
  const {mutate: deleteMutation, status: deleteStatus} = useDeletePostMutation({
    onSuccess: () => !isThread ? dismiss() : anchorNavigate(),
  });

  const onSubmit = useCallback(async (event) => {
    event.preventDefault();
    deleteMutation({
      flag: boardFlag,
      update: {
        "post-id": Number(params.response)
      }
    });
  }, [params, deleteMutation]);

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <div className="sm:w-96">
        <header className="mb-3 flex items-center">
          <h2 className="text-lg font-bold">
            Delete {isThread ? "Thread" : "Response"}
          </h2>
        </header>
      </div>

      <form onSubmit={onSubmit}>
        <p>
          Do you really want to delete
          {isThread
            ? " this entire thread, including all responses"
            : " your response to this question"
          }?
        </p>

        <footer className="mt-4 flex items-center justify-between space-x-2">
          <div className="ml-auto flex items-center space-x-2">
            <DialogPrimitive.Close asChild>
              <button className="secondary-button ml-auto">
                Cancel
              </button>
            </DialogPrimitive.Close>
            <button className="button bg-red" type="submit">
              {deleteStatus === 'loading' ? (
                <LoadingSpinner />
              ) : deleteStatus === 'error' ? (
                'Error'
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </footer>
      </form>
    </Dialog>
  );
}

// export function AboutDialog() {
//   const dismiss = useDismissNavigate();
//   const onOpenChange = (open: boolean) => (!open && dismiss());
//
//   return (
//     <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
//       <p>TODO: Create About Page</p>
//     </Dialog>
//   );
// }
