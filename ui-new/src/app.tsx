import React, { useState, useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import {
  BrowserRouter,
  Routes,
  Route,
  Location,
  useLocation,
  Link,
  LinkProps,
} from 'react-router-dom';
import {
  PlusIcon,
  EnterIcon,
  HomeIcon,
  QuestionMarkIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import NavBar from '~/components/NavBar';
import { AnchorLink } from '~/components/Links';
import { BoardGrid, PostWall, PostThread } from '~/pages/Views';
import { ResponseForm, SettingsForm } from '~/pages/Forms';
import { CreateDialog, JoinDialog, DeleteDialog, RefDialog } from '~/pages/Dialogs';
import { ReactRouterState } from '~/types/ui';
import bootstrap from '~/state/bootstrap';
import { useCalm, useTheme } from '~/state/settings';
import { useLocalState } from '~/state/local';
import { useScheduler } from '~/state/scheduler';
import { useIsDark, useIsMobile } from '~/logic/useMedia';
import useErrorHandler from '~/logic/useErrorHandler';
import indexedDBPersistor from '~/indexedDBPersistor';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});


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

function RoutedApp() {
  const location = useLocation();
  const state = location.state as ReactRouterState;
  const [userThemeColor, setUserThemeColor] = useState('#ffffff');
  const body = document.querySelector('body');

  const theme = useTheme();
  const isDarkMode = useIsDark();

  useEffect(() => {
    if ((isDarkMode && theme === 'auto') || theme === 'dark') {
      document.body.classList.add('dark');
      useLocalState.setState({currentTheme: 'dark' });
      setUserThemeColor('#000000');
    } else {
      document.body.classList.remove('dark');
      useLocalState.setState({currentTheme: 'light'});
      setUserThemeColor('#ffffff');
    }
  }, [isDarkMode, theme]);

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
      <Routes location={state?.bgLocation || location}>
        {/* Standalone Paths */}
        <Route path="/">
          <Route index element={
            <React.Fragment>
              <NavBar>
                <AppLink to="./create" title="New Board" location={location}>
                  <PlusIcon />
                </AppLink>
                <AppLink to="./join" title="Join Board" location={location}>
                  <EnterIcon />
                </AppLink>
              </NavBar>
              <BoardGrid className="py-4" />
            </React.Fragment>
          } />
          <Route path="search/:query/:page?" element={
            <React.Fragment>
              <NavBar>
                <AppLink to="." title="Go to Boards">
                  <HomeIcon />
                </AppLink>
              </NavBar>
              <PostWall className="py-4" />
            </React.Fragment>
          } />
        </Route>

        {/* Embedded Paths */}
        <Route path="/channel/:ship/:name/:chShip/:chName">
          <Route path=":page?" element={
            <React.Fragment>
              <NavBar>
                <AppLink to="./question" title="New Question">
                  <PlusIcon />
                </AppLink>
                <AppLink to="./settings" title="Settings">
                  <GearIcon />
                </AppLink>
              </NavBar>
              <PostWall className="py-4" />
            </React.Fragment>
          } />
          <Route path="question" element={<ResponseForm className="py-4 px-6" />} />
          <Route path="settings" element={<SettingsForm className="py-4 px-6" />} />
          <Route path="search/:query/:page?" element={
            <React.Fragment>
              <NavBar>
                <AppLink to="." title="Go to Board">
                  <HomeIcon />
                </AppLink>
              </NavBar>
              <PostWall className="py-4" />
            </React.Fragment>
          } />
          <Route path="thread/:thread">
            <Route index element={<PostThread className="py-4 px-6" />} />
            <Route path="response/:response?" element={<ResponseForm className="py-4 px-6" />} />
          </Route>
        </Route>
      </Routes>
      {state?.bgLocation && (
        <Routes>
          {/* Standalone Modals */}
          <Route path="/create" element={<CreateDialog />} />
          <Route path="/join" element={<JoinDialog />} />

          {/* Embedded Modals */}
          <Route path="/channel/:ship/:name/:chShip/:chName">
            <Route path="question/ref" element={<RefDialog />} />
            <Route path="thread/:thread">
              <Route path="delete/:response" element={<DeleteDialog />} />
              <Route path="response/:response?/ref" element={<RefDialog />} />
            </Route>
          </Route>
        </Routes>
      )}
    </React.Fragment>
  );
};

function Scheduler() {
  useScheduler();
  return null;
}

function AppLink({
  children,
  location,
  ...props
}: LinkProps & {
  children: React.ReactNode;
  location?: Location;
}) {
  const lprops = location ? {state: {bgLocation: location}} : {};
  return (
    <AnchorLink {...props} {...lprops} className="button">
      {children}
    </AnchorLink>
  );
}
