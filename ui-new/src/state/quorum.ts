import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import {
  QueryKey,
  MutationFunction,
  useQuery,
  useQueryClient,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import { Poke } from '@urbit/http-api';
import api from '~/api';
import useSchedulerStore from '~/state/scheduler';
import useReactQuerySubscription from '~/logic/useReactQuerySubscription';
import useQuorumQuerySubscription from '~/logic/useQuorumQuerySubscription';
import useReactQueryScry from '~/logic/useReactQueryScry';
import { getFlagParts } from '~/logic/utils';
import {
  BoardMeta,
  BoardThread,
  BoardPage,
  QuorumAction,
  SurfAction,
  QuorumUpdate,
  QuorumNewBoard,
  QuorumDeleteBoard,
  QuorumEditBoard,
  QuorumNewThread,
  QuorumEditThread,
  QuorumNewReply,
  QuorumEditPost,
  QuorumDeletePost,
  QuorumVote,
} from '~/types/quorum';


function quorumAction(flag: string, update: QuorumUpdate): Poke<QuorumAction> {
  return {
    app: "forums",
    mark: "forums-poke",
    json: {
      board: flag,
      action: update,
    },
  };
}

function surfAction(flag: string): Poke<SurfAction> {
  const {ship, name} = getFlagParts(flag);
  return {
    app: "forums",
    mark: "surf-boards",
    json: [ship, "forums", "updates", ship, name, null],
  };
}


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
  const queryKey: QueryKey = useMemo(() => ["quorum", flag], [flag]);

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
    "quorum", flag,
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
  const queryKey: QueryKey = useMemo(() => ["quorum", flag, "thread", thread], [flag, thread]);

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

export function useBoardMutation<TResponse>(
  mutationFn: MutationFunction<TResponse, any>,
  options?: UseMutationOptions<TResponse, unknown, any, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries(["quorum", variables.flag]);

      const oldData = await queryClient.getQueryData(["quorum", variables.flag]);
      const oldBoard = oldData as BoardMeta;

      // NOTE: The following code performs local updates on the query cache
      // when mutations occur so that they are reflected to the user instantly.

      const { metadata } = variables;

      if (metadata) {
        queryClient.setQueryData(["quorum", variables.flag], {
          ...oldBoard,
          ...metadata
        });
      }

      return oldData;
    },
    onError: (err, variables, oldData) => {
      queryClient.setQueryData(["quorum", variables.flag], oldData);
    },
    onSettled: (_data, _error, variables) =>
      queryClient.invalidateQueries(["quorum", variables.flag]),
    ...options,
  });
}

export function useNewBoardMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string; update: QuorumNewBoard;}) =>
    api.poke(
      quorumAction(variables.flag, {"new-board": variables.update})
    );

  return useBoardMutation(mutationFn, options);
}

export function useJoinBoardMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string}) => api.poke(surfAction(variables.flag));
  return useBoardMutation(mutationFn, options);
}

export function useEditBoardMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string; update: QuorumEditBoard;}) =>
    api.poke(
      quorumAction(variables.flag, {"edit-board": variables.update})
    );

  return useBoardMutation(mutationFn, options);
}

export function useDeleteBoardMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string; update: QuorumDeleteBoard;}) =>
    api.poke(
      quorumAction(variables.flag, {"delete-board": variables.update})
    );

  return useBoardMutation(mutationFn, options);
}

export function useNewThreadMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string; update: QuorumNewThread;}) =>
    api.poke(
      quorumAction(variables.flag, {"new-thread": variables.update})
    );

  return useBoardMutation(mutationFn, options);
}

export function useEditThreadMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string; update: QuorumEditThread;}) =>
    api.poke(
      quorumAction(variables.flag, {"edit-thread": variables.update})
    );

  return useBoardMutation(mutationFn, options);
}

export function useNewReplyMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string; update: QuorumNewReply;}) =>
    api.poke(
      quorumAction(variables.flag, {"new-reply": variables.update})
    );

  return useBoardMutation(mutationFn, options);
}

export function useEditPostMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string; update: QuorumEditPost;}) =>
    api.poke(
      quorumAction(variables.flag, {"edit-post": variables.update})
    );

  return useBoardMutation(mutationFn, options);
}

export function useDeletePostMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string; update: QuorumDeletePost;}) =>
    api.poke(
      quorumAction(variables.flag, {"delete-post": variables.update})
    );

  return useBoardMutation(mutationFn, options);
}

export function useVoteMutation(options: UseMutationOptions = {}) {
  const mutationFn = (variables: {flag: string; update: QuorumVote;}) =>
    api.poke(
      quorumAction(variables.flag, {"vote": variables.update})
    );

  return useBoardMutation(mutationFn, options);
}
