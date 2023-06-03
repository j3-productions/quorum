import _ from 'lodash';
import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import api from '~/api';
import useSchedulerStore from '~/state/scheduler';

// NOTE: Like 'useReactQuerySubscription', but with extra configuration
// parameters for events (since 'quorum' less granuluar subscription
// lines; only one per board instead of one per update).

export default function useQuorumQuerySubscription({
  queryKey,
  path,
  scry,
  isTrigger = (d: any) => (true),
  priority = 3,
  options,
}: {
  queryKey: QueryKey;
  path: string;
  scry: string;
  isTrigger?: (d: any) => boolean;  // FIXME: Add a proper type for event input
  priority?: number;
  options?: UseQueryOptions;
}): ReturnType<typeof useQuery> {
  const queryClient = useQueryClient();
  const invalidate = useRef(
    _.debounce(
      (data: any) => {
        if (isTrigger(data)) {
          queryClient.invalidateQueries(queryKey);
        }
      },
      300,
      { leading: true, trailing: true }
    )
  );

  const fetchData = async () => {
    return useSchedulerStore.getState().wait(
      async () => {
        return api.scry({
          app: "forums",
          path: scry,
        })
      },
      priority
    );
  }

  useEffect(() => {
    api.subscribe({
      app: "forums",
      path,
      event: invalidate.current,
    });
  }, [path, queryClient, queryKey]);

  // FIXME: Understand the options here and edit them as appropriate
  return useQuery(queryKey, fetchData, {
    // retryOnMount: false,
    // refetchOnMount: false,
    ...options,
  });
}
