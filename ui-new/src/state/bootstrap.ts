import Urbit from '@urbit/http-api';
import api from '@/api';
import { asyncWithDefault, asyncWithFallback, isTalk } from '@/logic/utils';
import queryClient from '@/queryClient';
import { Gangs, Groups } from '@/types/groups';
// import { TalkInit, GroupsInit } from '@/types/ui';
// import { useChatState } from './chat';
import useContactState from './contact';
// import { useDiaryState } from './diary';
// import useDocketState from './docket';
// import { useHeapState } from './heap/heap';
// import useKilnState from './kiln';
import { useLocalState } from './local';
// import { useLureState } from './lure/lure';
import useSchedulerStore from './scheduler';
// import { useStorage } from './storage';

// const emptyGroupsInit: GroupsInit = {
//   groups: {},
//   gangs: {},
//   chat: { briefs: {}, chats: {}, pins: [] },
//   heap: { briefs: {}, stash: {} },
//   diary: { briefs: {}, shelf: {} },
// };

// async function chatScry<T>(path: string, def: T) {
//   return asyncWithDefault(
//     () =>
//       api.scry<T>({
//         app: 'chat',
//         path,
//       }),
//     def
//   );
// }

async function startGroups(talkStarted: boolean) {
  // // make sure if this errors we don't kill the entire app
  // const { chat, heap, diary, groups, gangs } = await asyncWithDefault(
  //   () =>
  //     api.scry<GroupsInit>({
  //       app: 'groups-ui',
  //       path: '/init',
  //     }),
  //   emptyGroupsInit
  // );

  // if (!talkStarted) {
  //   useChatState.getState().start(chat);
  // }

  // queryClient.setQueryData(['groups'], groups);
  // queryClient.setQueryData(['gangs'], gangs);

  // useHeapState.getState().start(heap);
  // useDiaryState.getState().start(diary);

  // NOTE: The following is a replacement to the default `%groups`
  // behavior that just fetches groups data on bootstrap.
  const groups = await asyncWithDefault(
    () => api.scry<Groups>({app: 'groups', path: '/groups/light'}),
    ({} as Groups),
  );

  queryClient.setQueryData(['groups'], groups);
}

async function startTalk(groupsStarted: boolean) {
  // // since talk is a separate desk we need to offer a fallback
  // const { groups, gangs, ...chat } = await asyncWithFallback(
  //   () =>
  //     api.scry<TalkInit>({
  //       app: 'talk-ui',
  //       path: '/init',
  //     }),
  //   async () => {
  //     const [
  //       groupsRes,
  //       gangsRes,
  //       briefs,
  //       chats,
  //       dms,
  //       clubs,
  //       invited,
  //       pinsResp,
  //     ] = await Promise.all([
  //       asyncWithDefault(
  //         () =>
  //           api.scry<Groups>({
  //             app: 'groups',
  //             path: '/groups/light',
  //           }),
  //         {}
  //       ),
  //       asyncWithDefault(
  //         () =>
  //           api.scry<Gangs>({
  //             app: 'groups',
  //             path: '/gangs',
  //           }),
  //         {}
  //       ),
  //       chatScry('/briefs', {}),
  //       chatScry('/chats', {}),
  //       chatScry('/dm', []),
  //       chatScry('/clubs', {}),
  //       chatScry('/dm/invited', []),
  //       chatScry('/pins', { pins: [] }),
  //     ]);
  //     return {
  //       groups: groupsRes,
  //       gangs: gangsRes,
  //       briefs,
  //       chats,
  //       dms,
  //       clubs,
  //       invited,
  //       pins: pinsResp.pins,
  //     };
  //   }
  // );

  // queryClient.setQueryData(['groups'], groups);
  // queryClient.setQueryData(['gangs'], gangs);
  // useChatState.getState().startTalk(chat, !groupsStarted);
}

type Bootstrap = 'initial' | 'reset' | 'full-reset';

export default async function bootstrap(reset = 'initial' as Bootstrap) {
  const { wait } = useSchedulerStore.getState();
  if (reset === 'full-reset') {
    api.reset();
  }

  if (isTalk) {
    startTalk(false);
    wait(() => startGroups(true), 5);
  } else {
    startGroups(false);
    wait(async () => startTalk(true), 5);
  }

  wait(() => {
    useContactState.getState().start();
    // useStorage.getState().initialize(api as unknown as Urbit);
  }, 4);

  wait(() => {
    // useKilnState.getState().initializeKiln();
    // const { start, fetchCharges } = useDocketState.getState();
    // fetchCharges();
    // start();
    // useLureState.getState().start();

    // if (!import.meta.env.DEV) {
    //   usePalsState.getState().initializePals();
    // }
    // api.poke({
    //   app: isTalk ? 'talk-ui' : 'groups-ui',
    //   mark: 'ui-vita',
    //   json: null,
    // });
  }, 5);
}

useLocalState.setState({
  onReconnect: () => {
    const { reset } = useSchedulerStore.getState();
    reset();
    bootstrap('reset');

    useLocalState.setState({ lastReconnect: Date.now() });
  },
});
