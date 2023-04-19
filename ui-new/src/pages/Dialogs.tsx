import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
import ChannelPermsSelector from '~/components/ChannelPermsSelector';
import api from '~/api';
import { useDismissNavigate } from '~/logic/routing';

// TODO: Use the same algorithm as %groups to termify quorum names
//
// TODO: Figure out how to change the placeholder so that when no
// entries exist (e.g. user has no groups OR group has no Q&A channels)
// the user is informed immediately and obviously

export function CreateDialog() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());

  const defaultValues = {
    group: '',
    name: '',
    privacy: 'public',
  };

  const form = useForm({
    defaultValues,
    mode: 'onChange',
  });

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

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <FormProvider {...form}>
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
            className="my-2 w-full" />
        </label>
        <label className="mb-3 font-semibold">
          Channel Name*
          <input type="text" className="input my-2 block w-full py-1 px-2"
            {...form.register('name', { required: true })}
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
              disabled={
                !form.formState.isValid ||
                !form.formState.isDirty
            }>
              Create
            </button>
          </div>
        </footer>
      </FormProvider>
    </Dialog>
  );
}

export function JoinDialog() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [channels, setChannels] = useState([]);
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());

  const defaultValues = {
    group: '',
    channel: '',
  };

  const form = useForm({
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    api.scry({
      app: "groups",
      path: `/groups`,
    }).then((result) => {
      setGroups(Object.entries(result).map(([flag, {meta}]) => ({
        value: flag,
        label: meta.title,
      })));
      setIsLoading(false);
    });
  }, []);

  // useEffect(() => {
  //   api.scry({
  //     app: "groups",
  //     path: `/groups`,
  //   }).then((result) => {
  //     // TODO: collect all channels where 'join is true && type is quorom' is the case
  //     const allChannels = Object.entries(result).reduce((a, n) => (
  //       a.concat(Object.entries(n.channels).map(([path, channel]) =>
  //         [n.flag, path, channel]
  //       ))
  //     ), []);
  //     const joinChannels = allChannels.filter(([flag, path, channel]) => (
  //       channel.join && path.split("/")[0] === "quorum"
  //     ));

  //     console.log(joinChannels);
  //     // const myGroups = Object.entries(result).filter(([flag, {fleet, ...rest}]) =>
  //     //   fleet[`~${api.ship}`]["sects"].includes("admin")
  //     // ).map(([flag, {meta, ...rest}]) => ({
  //     //   flag,
  //     //   meta,
  //     // }));

  //     // setGroups(myGroups.map(({flag, meta}) => ({value: flag, label: meta.title})));
  //     // setIsLoading(false);
  //   });
  // }, []);

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <FormProvider {...form}>
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
            isLoading={isLoading}
            className="my-2 w-full" />
        </label>
        <label className="mb-3 font-semibold">
          Channel Name*
          <SingleSelector
            options={channels}
            setOptions={setChannels}
            isClearable={true}
            isLoading={isLoading}
            className="my-2 w-full" />
        </label>

        <footer className="mt-4 flex items-center justify-between space-x-2">
          <div className="ml-auto flex items-center space-x-2">
            <DialogPrimitive.Close asChild>
              <button className="secondary-button ml-auto">
                Cancel
              </button>
            </DialogPrimitive.Close>
            <button className="button" type="submit"
              disabled={
                !form.formState.isValid ||
                !form.formState.isDirty
            }>
              Join
            </button>
          </div>
        </footer>
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
