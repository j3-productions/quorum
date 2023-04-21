import React, { useState, useEffect, useCallback } from 'react';
import { FormProvider, useForm, useController } from 'react-hook-form';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  PlusIcon,
  EnterIcon,
  QuestionMarkIcon,
  Cross2Icon,
  HomeIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import Dialog from '~/components/Dialog';
import SingleSelector from '~/components/SingleSelector';
import Select from 'react-select';
import ChannelPermsSelector from '~/components/ChannelPermsSelector';
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


export function CreateDialog() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);

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
  const {register, handleSubmit, formState, control} = form;
  const {field: {value: group, onChange: groupOnChange, ref: groupRef, ...groupProps}} =
    useController({name: "group", rules: {required: true}, control});
  const onSubmit = useCallback((data) => {
    const {group, channel, privacy} = data;
    const channelId = getChannelIdFromTitle(channel);
    alert(JSON.stringify({channelId, ...data}));
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

  // FIXME: This is never used, but is needed to make the form work first try.
  const isDirty = formState.isDirty;

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
              options={groups}
              setOptions={setGroups}
              isClearable={true}
              isLoading={isLoading}
              className="my-2 w-full"
              value={group ? groups.find(e => e.value === group) : group}
              onChange={o => groupOnChange(o ? o.value : o)}
              inputRef={groupRef}
              {...groupProps}
            />
          </label>
          <label className="mb-3 font-semibold">
            Channel Name*
            <input type="text" className="input my-2 block w-full py-1 px-2"
              {...register("channel", { required: true })}
            />
          </label>
          <label className="mb-3 font-semibold">
            Channel Permissions
            <ChannelPermsSelector />
          </label>

          <footer className="mt-4 flex items-center justify-between space-x-2">
            <div className="ml-auto flex items-center space-x-2">
              <DialogPrimitive.Close asChild>
                <button className="secondary-button ml-auto">
                  Cancel
                </button>
              </DialogPrimitive.Close>
              <button className="button" type="submit"
                disabled={!formState.isValid || !formState.isDirty}>
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
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [isChannelsLoading, setIsChannelsLoading] = useState(false);
  const [channels, setChannels] = useState([]);

  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      group: '',
      channel: '',
    },
  });
  const {register, handleSubmit, resetField, formState, control} = form;
  const {field: {value: group, onChange: groupOnChange, ref: groupRef, ...groupProps}} =
    useController({name: "group", rules: {required: true}, control});
  const {field: {value: channel, onChange: channelOnChange, ref: channelRef, ...channelProps}} =
    useController({name: "channel", rules: {required: true}, control});
  const onSubmit = useCallback((data) => {
    const {group, channel} = data;
    alert(JSON.stringify(data));
  }, []);

  useEffect(() => {
    api.scry({
      app: "groups",
      path: `/groups`,
    }).then((scryGroups: Groups) => {
      setGroups(Object.entries(scryGroups).map(
        ([flag, {meta}]: [string, Group]) => ({
          value: flag,
          label: meta.title,
        })
      ));
      setIsGroupsLoading(false);
    });
  }, []);

  useEffect(() => {
    group && Promise.all([
      api.scry({app: "groups", path: `/groups`}),
      api.scry({app: "chat", path: `/briefs`}),    // TODO: change to quorum
    ]).then(([scryGroups, scryBriefs]: [Groups, ChatBriefs]) => {
      const scryGroup = scryGroups[group];
      const realBriefs = Object.fromEntries(Object.entries(scryBriefs).map(
        ([key, value]) => [`chat/${key}`, value]
      ));
      const joinChannels = Object.entries(scryGroup.channels).filter(
        ([nest, chan]: [string, GroupChannel]) =>
          !isChannelJoined(nest, realBriefs)
          && canReadChannel(chan, scryGroup.fleet?.[window.our], scryGroup.bloc)
          && nestToFlag(nest)[0] === "chat"  // TODO: change to quorum
      );
      setChannels(joinChannels.map(([nest, {meta}]) => ({
        value: nest,
        label: meta.title,
      })));
      setIsChannelsLoading(false);
    });
  }, [group]);

  // FIXME: This is never used, but is needed to make the form work first try.
  const isDirty = formState.isDirty;

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
            Group Name*
            <SingleSelector
              options={groups}
              setOptions={setGroups}
              isClearable={true}
              isLoading={isGroupsLoading}
              className="my-2 w-full"
              value={group ? groups.find(e => e.value === group) : group}
              onChange={o => {
                groupOnChange(o ? o.value : o);
                setChannels([]);
                resetField("channel");
                setIsChannelsLoading(o ? true : false);
              }}
              inputRef={groupRef}
              {...groupProps}
            />
          </label>
          <label className="mb-3 font-semibold">
            Channel Name*
            <SingleSelector
              options={channels}
              setOptions={setChannels}
              isClearable={true}
              autoFocus={false}
              isLoading={isChannelsLoading}
              className="my-2 w-full"
              value={channel ? channels.find(e => e.value === channel) : channel}
              onChange={o => channelOnChange(o ? o.value : o)}
              inputRef={channelRef}
              {...channelProps}
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
                disabled={!formState.isValid || !formState.isDirty}>
                Join
              </button>
            </div>
          </footer>
        </form>
      </FormProvider>
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
