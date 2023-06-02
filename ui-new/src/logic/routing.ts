import { useCallback } from 'react';
import { NavigateOptions, To, useLocation, useNavigate } from 'react-router';
import { ReactRouterState } from '~/types/ui';

/**
 * Returns an imperative method for navigating while preserving the navigation
 * state underneath the overlay
 */
export function useModalNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (to: To, opts?: NavigateOptions) => {
      if (location.state) {
        navigate(to, {...(opts || {}), state: location.state});
        return;
      }
      navigate(to, opts);
    },
    [navigate, location.state]
  );
}

export function useDismissNavigate() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ReactRouterState | null;

  return useCallback((payload?: string) => {
    if (state?.bgLocation) {
      const {bgLocation, ...oldState} = state;
      const newPayload = (payload !== undefined) ? {payload: payload} : {};
      const newState: ReactRouterState = {...Object.assign({}, oldState, newPayload)};
      navigate(bgLocation, {replace: true, state: newState});
    }
  }, [navigate, state]);
}
