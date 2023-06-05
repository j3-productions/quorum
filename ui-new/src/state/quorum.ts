import { useEffect, useMemo } from 'react';
import {
  QueryKey,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  BoardMeta,
  BoardThread,
  BoardPage,
} from '~/types/quorum';
import api from '~/api';
import useSchedulerStore from '~/state/scheduler';
import useReactQuerySubscription from '~/logic/useReactQuerySubscription';
import useQuorumQuerySubscription from '~/logic/useQuorumQuerySubscription';
import useReactQueryScry from '~/logic/useReactQueryScry';


export function useBoardMeta(flag: string): BoardMeta | undefined {
  const queryKey: QueryKey = useMemo(() => ["forums", flag], [flag]);
  // const queryPath: string = useMemo(() => `/quorum/${flag}/ui`, [flag]);
  // const queryScry: string = useMemo(() => `/board/${flag}/metadata`, [flag]);

  const { data, ...rest } = useQuorumQuerySubscription({
    queryKey: queryKey,
    path: `/quorum/${flag}/ui`,
    scry: `/board/${flag}/metadata`,
    isTrigger: (data: any) => (
      "edit-board" in data
      || "new-reply" in data
      || "new-thread" in data
    ),
  });

  if (rest.isLoading || rest.isError) {
    return undefined;
  }

  return data as BoardMeta;
}

export function usePage(flag: string, index: number, query?: string): BoardPage | undefined {
  const queryKey: QueryKey = useMemo(() => [
    "forums", flag,
    query ? "questions" : "search", index, query,
  ], [flag, index, query]);

  // FIXME: The subscription update path needs to be updated for the standalone
  // search tool.
  const { data, ...rest } = useQuorumQuerySubscription({
    queryKey: queryKey,
    path: `/quorum/${flag}/ui`,
    scry: `/board/${flag}/${!query
      ? `questions/${index}`
      : `search/${index}/${query}`
    }`,
    isTrigger: (data: any) => {
      const [action, params]: [string, any] = Object.entries(data)[0];
      return action !== "edit-board";
    },
  });

  if (rest.isLoading || rest.isError) {
    return undefined;
  }

  return data as BoardPage;
}

export function useThread(flag: string, thread: number): BoardThread | undefined {
  const queryKey: QueryKey = useMemo(() => ["forums", flag, "thread", thread], [flag, thread]);
  // const queryPath: string = useMemo(() => `/quorum/${flag}/ui`, [flag, thread]);
  // const queryScry: string = useMemo(() => `/board/${flag}/thread/${thread}`, [flag, thread]);

  const { data, ...rest } = useQuorumQuerySubscription({
    queryKey: queryKey,
    path: `/quorum/${flag}/ui`,
    scry: `/board/${flag}/thread/${thread}`,
    // FIXME: We should probably have separate per-thread subscriptions
    // because this doesn't catch any updates to child posts.
    isTrigger: (data: any) => {
      const [action, params]: [string, any] = Object.entries(data)[0];
      return (action === "edit-thread" && Number(params["post-id"]) === thread)
        || (action === "edit-post" && Number(params["post-id"]) === thread)
        || (action === "new-reply" && Number(params["parent-id"]) === thread)
        || (action === "vote" && Number(params["post-id"]) === thread);
    },
  });

  if (rest.isLoading || rest.isError) {
    return undefined;
  }

  return data as BoardThread;
}
