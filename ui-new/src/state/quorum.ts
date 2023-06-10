import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
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


export function useBoardMetas(): BoardMeta[] | undefined {
  const queryKey: QueryKey = useMemo(() => ["quorum"], []);

  const { data, ...rest } = useQuorumQuerySubscription({
    queryKey: queryKey,
    path: `/ui`,
    scry: `/boards`,
  });

  if (rest.isLoading || rest.isError) {
    return undefined;
  }

  return data as BoardMeta[];
}

export function useBoardMeta(flag: string): BoardMeta | undefined {
  const queryKey: QueryKey = useMemo(() => ["forums", flag], [flag]);

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
  const isGlobalQuery: boolean = useMemo(() => (flag === ""), [flag]);
  const queryKey: QueryKey = useMemo(() => [
    "forums", flag,
    query ? "questions" : "search", index, query,
  ], [flag, index, query]);

  const { data, ...rest } = useQuorumQuerySubscription({
    queryKey: queryKey,
    path: isGlobalQuery
      ? `/search/ui`
      : `/quorum/${flag}/ui`,
    scry: isGlobalQuery
      ? `/search/${index}/${query}`
      : `/board/${flag}/${!query
        ? `questions/${index}`
        : `search/${index}/${query}`
      }`,
  });

  if (rest.isLoading || rest.isError) {
    return undefined;
  }

  return data as BoardPage;
}

export function useThread(flag: string, thread: number): BoardThread | undefined {
  const queryKey: QueryKey = useMemo(() => ["forums", flag, "thread", thread], [flag, thread]);

  const { data, ...rest } = useQuorumQuerySubscription({
    queryKey: queryKey,
    path: `/quorum/${flag}/thread/${thread}/ui`,
    scry: `/board/${flag}/thread/${thread}`,
  });

  if (rest.isLoading || rest.isError) {
    return undefined;
  }

  return data as BoardThread;
}

export function useRouteBoard() {
  const { chShip, chName } = useParams();
  return useMemo(() => {
    if (!chShip || !chName) {
      return '';
    }

    return `${chShip}/${chName}`;
  }, [chShip, chName]);
}

export function useBoardFlag() {
  return useRouteBoard();
}
