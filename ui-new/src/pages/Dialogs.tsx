import React, { useState, useEffect, useCallback } from 'react';
import { FormProvider, useForm, useController } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  PlusIcon,
  EnterIcon,
  QuestionMarkIcon,
  Cross2Icon,
  HomeIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import Author from '~/components/Author';
import Dialog from '~/components/Dialog';
import { SingleSelector, MultiSelector } from '~/components/Selector';
import { ChannelPrivacyRadio } from '~/components/Radio';
import api from '~/api';
import {
  isChatRef,
  isGroupAdmin,
  isChannelJoined,
  canReadChannel,
  getChannelIdFromTitle,
  getFlagParts,
  nestToFlag,
} from '~/logic/utils';
import { inlineToString, normalizeInline } from '~/logic/tiptap';
// FIXME: These don't work for the 'channel' selection in the 'join'
// form for some reason.
//
// import {
//   selectGetValue,
//   selectOnChange,
// } from '~/logic/forms';
//
import { useDismissNavigate } from '~/logic/routing';
import { Groups, Group, GroupChannel } from '~/types/groups';
import { ChatBriefs, ChatBrief } from '~/types/chat';


export function CreateDialog() {
  // TODO: Add description as a dialog option
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  const navigate = useNavigate();
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      group: '',
      channel: '',
      privacy: 'public',
    },
  });
  const {register, handleSubmit, formState: {isDirty, isValid}, control} = form;
  const {field: {value: group, onChange: groupOnChange, ref: groupRef}} =
    useController({name: "group", rules: {required: true}, control});
  const onSubmit = useCallback(({group: groupFlag, channel, privacy}) => {
    const [board, boardBackup] = getChannelIdFromTitle(channel);
    // TODO: If 'board' is already taken on this host, then use
    // 'boardBackup' instead.
    const boardFlag = `${window.our}/${board}`;

    api.poke({
      app: "forums",
      mark: "forums-action",
      json: {
        board: boardFlag,
        action: {"new-board": {
          group: groupFlag,
          title: channel,
          description: "",
          tags: [],
        }},
      },
    }).then(result =>
      // TODO: Consider some form of dismiss-then-refresh
      navigate(`../board/${group}/${board}`, {relative: "path"})
    );
  }, []);

  useEffect(() => {
    api.scry({
      app: "groups",
      path: `/groups`,
    }).then((result: Groups) => {
      const adminGroups = Object.entries(result).filter(
        ([flag, group]: [string, Group]) => isGroupAdmin(group)
      );
      setGroups(adminGroups.map(([flag, {meta}]) => ({
        value: flag,
        label: meta.title,
      })));
      setIsLoading(false);
    });
  }, []);

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
              options={groups}
              value={group ? groups.find(e => e.value === group) : group}
              onChange={o => groupOnChange(o ? o.value : o)}
              isLoading={isLoading}
              className="my-2 w-full"
              autoFocus
            />
          </label>
          <label className="mb-3 font-semibold">
            Channel Name*
            <input type="text" autoComplete="off"
              className="input my-2 block w-full py-1 px-2"
              {...register("channel", { required: true })}
            />
          </label>
          <label className="mb-3 font-semibold">
            Channel Permissions
            <ChannelPrivacyRadio field={"privacy"} />
          </label>

          <footer className="mt-4 flex items-center justify-between space-x-2">
            <div className="ml-auto flex items-center space-x-2">
              <DialogPrimitive.Close asChild>
                <button className="secondary-button ml-auto">
                  Cancel
                </button>
              </DialogPrimitive.Close>
              <button className="button" type="submit"
                disabled={!isValid || !isDirty}>
                Create
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

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      ship: '',
      board: '',
    },
  });
  const {register, handleSubmit, resetField, formState: {isDirty, isValid}, control} = form;
  const onSubmit = useCallback(({ship, board}) => {
    api.poke({
      app: "forums",
      mark: "surf-forums",
      json: [ship, "forums", "updates", board, null],
    }).then(result =>
      // TODO: Dismiss-and-refresh will work once subscriptions are in place
      dismiss()
    );
  }, []);

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
              <button className="button" type="submit"
                disabled={!isValid || !isDirty}>
                Join
              </button>
            </div>
          </footer>
        </form>
      </FormProvider>
    </Dialog>
  );
}

// export function JoinDialog() {
//   const [isGroupsLoading, setIsGroupsLoading] = useState(true);
//   const [groups, setGroups] = useState([]);
//   const [isChannelsLoading, setIsChannelsLoading] = useState(false);
//   const [channels, setChannels] = useState([]);
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
//     api.scry({
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
//       api.scry({app: "groups", path: `/groups`}),
//       api.scry({app: "chat", path: `/briefs`}),    // TODO: change to quorum
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
//               value={group ? groups.find(e => e.value === group) : group}
//               onChange={o => {
//                 groupOnChange(o ? o.value : o);
//                 setChannels([]);
//                 resetField("channel");
//                 setIsChannelsLoading(o ? true : false);
//               }}
//               isLoading={isGroupsLoading}
//               className="my-2 w-full"
//               autoFocus
//             />
//           </label>
//           <label className="mb-3 font-semibold">
//             Channel Name*
//             <SingleSelector
//               ref={channelRef}
//               options={channels}
//               value={channel ? channels.find(e => e.value === channel) : channel}
//               onChange={o => channelOnChange(o ? o.value : o)}
//               isLoading={isChannelsLoading}
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
  // references from groups).
  // TODO: Selecting import messages in the form causes them to be added to
  // the form's 'messages' field; deselecting them causes them to be removed.
  const [isLoading, setIsLoading] = useState(true);
  const [loadedRefs, setLoadedRefs] = useState([]);
  const params = useParams();

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
  // const {
  //   field: {value: importRef, onChange: importRefOnChange, ref: importRefRef},
  //   fieldState: {invalid: isImportRefInvalid, isDirty: isImportRefDirty, error: importRefError},
  // } = useController({name: "importRef", rules: {required: true, validate: isChatRef}, control});
  const {field: {value: messages, onChange: messagesOnChange, ref: messagesRef}} =
    useController({name: "messages", rules: {required: true}, control});
  const onSubmit = useCallback((data) => {
    // TODO: Figure out how to pass this data back to the calling form so that it
    // can be used to fill in the appropriate input field.
    // TODO: Probably need to manipulate 'location.state' to include input data,
    // which then could be consumed by the calling group.
    alert(JSON.stringify(data));
  }, []);
  const importRef = watch("importRef", "");

  useEffect(() => {
    // TODO: Require the import link to be a 'chat' reference (diary and heap
    // not supported for starters).
    if (isChatRef(importRef)) {
      const [refChShip, refChName, _, refAuthor, refId] = importRef.split("/").slice(-5);
      // TODO: Add an error handling case here for when the user inputs a
      // structurally valid ref that isn't in `%groups` (scry returns null/error).
      api.scry({
        app: "chat",
        path: `/chat/${refChShip}/${refChName}/writs/newer/${refId}/1`,
      }).then((result) => {
        // TODO: Need a `story:chat` to markdown converter here in order to process
        // the data handed back by %groups. The 'refContent' has the following form:
        //
        // {
        //   "memo": {
        //     "author": "~zod",
        //     "sent": 1681419582244,
        //     "replying": null, // if this is non-null, this item is in a thread
        //     "content": {
        //       "story": {
        //         "inline": [ ... ],
        //         "block": [ ... ],
        //       }
        //     }
        //   },
        //   "seal": {
        //     "feels": {},
        //     "id": "~zod/170.141.184.506.168.884.671.681.766.167.097.643.106",
        //     "replied": []
        //   }
        // }
        const newLoadedRefs = Object.entries(result).map(([refId, refContent]) =>
          [
            refId,
            refContent.memo.author,
            refContent.memo.sent,
            refContent.memo.content.story.inline.map(inlineToString).join(""),
          ]
        );
        setLoadedRefs(newLoadedRefs);
        messagesOnChange(newLoadedRefs);
        setIsLoading(false);
      });
    } else if (!isChatRef(importRef) && loadedRefs.length > 0) {
      setLoadedRefs([]);
      messagesOnChange([]);
      setIsLoading(false);
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
            {(loadedRefs.length === 0) ? (
              <p>Input a valid groups reference to see selection.</p>
            ) : (
              <div className="flex flex-col w-full items-center">
                {/* <span onClick={() => {}}>Load Older</span> */}
                {/* TODO: "border-4 border-gray-800" for selected entries */}
                {loadedRefs.map(([id, author, timestamp, content]) => (
                  <div key={id} className="w-full card bg-gray-100">
                    <div
                      className="flex items-center space-x-2 font-semibold mb-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Author ship={author} date={new Date(timestamp)} />
                    </div>
                    <p>{content}</p>
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
              <button className="button" type="submit"
                disabled={!isValid || !isDirty}>
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
  // TODO: Include more information on the thread content in the body of
  // the dialog.
  // TODO: Revise the content of the dialog based on whether the
  // deleting user is the author or the admin (author overrides admin
  // message in the case that both are true).
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());
  const params = useParams();

  const isThread = params.response === params.thread;

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    api.poke({
      app: "forums",
      mark: "forums-action",
      json: {
        board: `${params.chShip}/${params.chName}`,
        action: {"delete-post": {"post-id": Number(params.response)}},
      },
    }).then(response => {
      dismiss();
    });
  }, [params]);

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
              Delete
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
