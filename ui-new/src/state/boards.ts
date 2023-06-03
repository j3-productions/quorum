import { useEffect, useMemo } from 'react';
import {
  QueryKey,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  BoardMeta,
} from '~/types/quorum';
import api from '~/api';
import useSchedulerStore from '~/state/scheduler';
import useReactQuerySubscription from '~/logic/useReactQuerySubscription';
import useReactQueryScry from '~/logic/useReactQueryScry';


export function useBoardMeta(flag: string): BoardMeta | undefined {
  const queryKey: QueryKey = useMemo(() => ["forums", flag], [flag]);

  const queryClient = useQueryClient();
  const fetchData = async () => {
    return useSchedulerStore.getState().wait(
      async () => {
        return api.scry({
          app: "forums",
          path: `/board/${flag}/metadata`,
        })
      },
      3
    );
  }

  useEffect(() => {
    api.subscribe({
      app: "forums",
      path: `/quorum/${flag}/ui`,
      event: (data: any) => {
        if ("edit-board" in data) {
          queryClient.invalidateQueries(queryKey);
        }
      },
    });
  }, [queryClient, queryKey]);

  // FIXME: Understand the options here and edit them as appropriate
  const { data, ...rest } = useQuery(queryKey, fetchData, {
    refetchOnMount: false,
    retry: true,
  });

  if (rest.isLoading || rest.isError) {
    return undefined;
  }

  return data as BoardMeta;
}
