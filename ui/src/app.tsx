import React, { useState, useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import {
  BrowserRouter,
  Routes,
  Route,
  Location,
  useLocation,
} from 'react-router-dom';
import QuorumChannel from '@/quorum/QuorumChannel';
import QuorumStandalone from '@/quorum/QuorumStandalone';
import QuorumProfileModal from '@/quorum/profiles/ProfileModal';
import {
  CreateDialog,
  JoinDialog,
  DeleteDialog,
  DestroyDialog,
  RefDialog,
  PreviewDialog,
} from '@/quorum/QuorumDialogs';
import bootstrap from '@/state/bootstrap';
import { useTheme } from '@/state/settings';
import { useLocalState } from '@/state/local';
import { useScheduler } from '@/state/scheduler';
import { useIsDark } from '@/logic/useMedia';
import useErrorHandler from '@/logic/useErrorHandler';
import { ReactRouterState } from '@/types/quorum-ui';
import { CHANNEL_PATH } from '@/constants';
import queryClient from '@/queryClient';
import indexedDBPersistor from '@/indexedDBPersistor';


export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: indexedDBPersistor(`${window.our}-landscape`),
      }}
    >
      <BrowserRouter basename="/apps/quorum/">
        <RoutedApp />
        <Scheduler />
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

function Scheduler() {
  useScheduler();
  return null;
}

function RoutedApp() {
  const location = useLocation();
  const state = location.state as ReactRouterState;
  const [userThemeColor, setUserThemeColor] = useState('#ffffff');
  const body = document.querySelector('body');
  const colorSchemeFromNative = window.colorscheme;

  const theme = useTheme();
  const isDarkMode = useIsDark();

  useEffect(() => {
    if (
      (isDarkMode && theme === 'auto') ||
      theme === 'dark' ||
      colorSchemeFromNative === 'dark'
    ) {
      document.body.classList.add('dark');
      useLocalState.setState({ currentTheme: 'dark' });
      setUserThemeColor('#000000');
    } else {
      document.body.classList.remove('dark');
      useLocalState.setState({ currentTheme: 'light' });
      setUserThemeColor('#ffffff');
    }
  }, [isDarkMode, theme, colorSchemeFromNative]);

  // <meta name="theme-color" content={userThemeColor} />

  return (
    <RoutedAppRoutes state={state} location={location} />
  );
}

// NOTE: This seemingly unnecessary indirection is required to allow modals
// to overlay on top of base paths without causing those base paths to
// re-render their contents.
function RoutedAppRoutes({
  state,
  location,
}: {
  state: ReactRouterState;
  location: Location;
}) {
  const handleError = useErrorHandler();

  useEffect(() => {
    handleError(() => {
      bootstrap();
    })();
  }, [handleError]);

  return (
    <React.Fragment>
      <Routes location={state?.backgroundLocation || location}>
        <Route path={`${CHANNEL_PATH}/*`} element={<QuorumChannel />} />
        <Route path="/*" element={<QuorumStandalone />} />
      </Routes>
      {state?.backgroundLocation && (
        <Routes>
          {/* Standalone Modals */}
          <Route path="/create" element={<CreateDialog />} />
          <Route path="/join" element={<JoinDialog />} />
          <Route path="/profile/:ship" element={<QuorumProfileModal />} />
          <Route path="/destroy/:chShip/:chName" element={<DestroyDialog />} />

          {/* Embedded Modals */}
          <Route path={CHANNEL_PATH}>
            <Route path="profile/:ship" element={<QuorumProfileModal />} />
            <Route path="question/ref" element={<RefDialog />} />
            <Route path="question/pre" element={<PreviewDialog />} />
            <Route path="thread/:thread">
              <Route path="delete/:response" element={<DeleteDialog />} />
              <Route path="response/:response?/ref" element={<RefDialog />} />
              <Route path="response/:response?/pre" element={<PreviewDialog />} />
            </Route>
          </Route>
        </Routes>
      )}
    </React.Fragment>
  );
};
