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
import { getChannelIdFromTitle } from '~/logic/utils';
import { useDismissNavigate } from '~/logic/routing';

// TODO: Figure out how to change the placeholder so that when no
// entries exist (e.g. user has no groups OR group has no Q&A channels)
// the user is informed immediately and obviously
//
// FIXME: These are required in order to allow the form to recognize the
// select fields as being valid on the first attempt.
//
// FIXME: Attempting to 'resetField' or 'resetErrors' didn't help the
// issue; only printing the values appears to help.
//
// FIXME: Refs are broken in '...groupProps' being set to 'SingleSelector'

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
  const {field: {value: group, onChange: groupOnChange, ...groupProps}} =
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
    }).then((result) => {
      const adminGroups = Object.entries(result).filter(([flag, {fleet}]) =>
        fleet[`~${api.ship}`]["sects"].includes("admin")
      );

      setGroups(adminGroups.map(([flag, {meta}]) => ({
        value: flag,
        label: meta.title,
      })));
      setIsLoading(false);
    });
  }, []);

  console.log(`Form Is Valid: ${formState.isValid}`);
  console.log(`Form Is Dirty: ${formState.isDirty}`);

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="sm:w-96">
            <header className="mb-3 flex items-center">
              <h2 className="text-lg font-bold">Create New Q&A Channel</h2>
            </header>
          </div>

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
  const {field: {value: group, onChange: groupOnChange, ...groupProps}} =
    useController({name: "group", rules: {required: true}, control});
  const {field: {value: channel, onChange: channelOnChange, ...channelProps}} =
    useController({name: "channel", rules: {required: true}, control});
  const onSubmit = useCallback((data) => {
    const {group, channel} = data;
    alert(JSON.stringify(data));
  }, []);

  useEffect(() => {
    api.scry({
      app: "groups",
      path: `/groups`,
    }).then((result) => {
      setGroups(Object.entries(result).map(([flag, {meta}]) => ({
        value: flag,
        label: meta.title,
      })));
      setIsGroupsLoading(false);
    });
  }, []);

  useEffect(() => {
    group && api.scry({
      app: "groups",
      path: `/groups`,
    }).then((result) => {
      const groupChannels = Object.entries(result[group]["channels"]);
      const joinChannels = groupChannels.filter(([path, channel]) => (
        true
        // channel.join && path.split("/")[0] === "quorum"
      ));
      setChannels(joinChannels.map(([path, {meta}]) => ({
        value: path,
        label: meta.title,
      })));
      setIsChannelsLoading(false);
    });
  }, [group]);

  // FIXME: These are required in order to allow the form to recognize the
  // select fields as being valid on the first attempt.
  console.log(`Form Is Valid: ${formState.isValid}`);
  console.log(`Form Is Dirty: ${formState.isDirty}`);

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="sm:w-96">
            <header className="mb-3 flex items-center">
              <h2 className="text-lg font-bold">Join Existing Q&A Channel</h2>
            </header>
          </div>

          <label className="mb-3 font-semibold">
            Group Name*
            {/* TODO: When selection is changed, trigger channel population. */}
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
                setIsChannelsLoading(true);
              }}
              {...groupProps}
            />
          </label>
          <label className="mb-3 font-semibold">
            Channel Name*
            <SingleSelector
              options={channels}
              setOptions={setChannels}
              isClearable={true}
              isLoading={isChannelsLoading}
              className="my-2 w-full"
              value={channel ? channels.find(e => e.value === channel) : channel}
              onChange={o => channelOnChange(o ? o.value : o)}
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
