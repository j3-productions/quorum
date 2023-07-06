import _ from 'lodash';
import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import api from '@/api';
import useSchedulerStore from '@/state/scheduler';

// NOTE: Like 'useReactQuerySubscription', but with extra configuration
// parameters to allow different scry paths to share the same subscription
// feed (required for board questions and search results, which all listen
// to the /quorum/~ship/board/search/ui subscription path for updates).

export default function useQuorumQuerySubscription({
  queryKey,
  path,
  scry,
  validKey = queryKey,
  priority = 3,
  options,
}: {
  queryKey: QueryKey;
  path: string;
  scry: string;
  priority?: number;
  validKey?: QueryKey;
  options?: UseQueryOptions;
}): ReturnType<typeof useQuery> {
  const queryClient = useQueryClient();
  const invalidate = useRef(
    _.debounce(
      () => {
        queryClient.invalidateQueries(validKey);
      },
      300,
      { leading: true, trailing: true }
    )
  );

  const fetchData = async () => {
    return useSchedulerStore.getState().wait(
      async () => {
        return api.scry({
          app: "quorum",
          path: scry,
        })
      },
      priority
    );
  }

  useEffect(() => {
    api.subscribe({
      app: "quorum",
      path,
      event: invalidate.current,
    });
  }, [path, queryClient, queryKey, validKey]);

  // FIXME: Understand the options here and edit them as appropriate
  return useQuery(queryKey, fetchData, {
    // retryOnMount: false,
    // refetchOnMount: false,
    ...options,
  });
}
