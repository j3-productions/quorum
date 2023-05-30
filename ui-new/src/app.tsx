import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Location,
  Navigate,
  NavigateProps,
  useLocation,
  useNavigate,
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
import ChannelGrid from '~/components/ChannelGrid';
import { PostWall, PostThread } from '~/pages/Views';
import { QuestionForm, SettingsForm, ResponseForm } from '~/pages/Forms';
import { CreateDialog, JoinDialog, DeleteDialog, RefDialog } from '~/pages/Dialogs';
import { ReactRouterState } from '~/types/ui';


export function App() {
  return (
    <BrowserRouter basename="/apps/quorum/">
      <RoutedApp />
    </BrowserRouter>
  );
}

function RoutedApp() {
  const location = useLocation();
  const state = location.state as ReactRouterState;
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
  return (
    <React.Fragment>
      <Routes location={state?.bgLocation || location}>
        {/* Standalone Paths */}
        <Route path="/">
          <Route index element={
            <React.Fragment>
              <NavBar>
                <NavLink to="create" title="New Board" location={location}>
                  <PlusIcon />
                </NavLink>
                <NavLink to="join" title="Join Board" location={location}>
                  <EnterIcon />
                </NavLink>
              </NavBar>
              <ChannelGrid className="py-4" />
            </React.Fragment>
          } />
          <Route path="search" element={<FixupNavigate to="../"/>} />
          <Route path="search/:query/:page?" element={
            <React.Fragment>
              <NavBar>
                <NavLink to="/" title="Go to Boards">
                  <HomeIcon />
                </NavLink>
              </NavBar>
              <PostWall className="py-4" />
            </React.Fragment>
          } />
        </Route>

        {/* Embedded Paths */}
        <Route path="/channel/:grShip/:grName/:chShip/:chName">
          <Route path=":page?" element={
            <React.Fragment>
              <NavBar>
                <NavLink to="question" title="New Question">
                  <PlusIcon />
                </NavLink>
                <NavLink to="settings" title="Settings">
                  <GearIcon />
                </NavLink>
              </NavBar>
              <PostWall className="py-4" />
            </React.Fragment>
          } />
          <Route path=":page/question" element={<FixupNavigate to="../../question"/>} />
          <Route path=":page/settings" element={<FixupNavigate to="../../settings"/>} />
          <Route path="question" element={<QuestionForm className="py-4 px-6" />} />
          <Route path="settings" element={<SettingsForm className="py-4 px-6" />} />
          <Route path="search" element={<FixupNavigate to="../"/>} />
          <Route path="search/:query/:page?" element={
            <React.Fragment>
              <NavBar>
                <NavLink to="../../" title="Go to Board" relative="path">
                  <HomeIcon />
                </NavLink>
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
          <Route path="/channel/:grShip/:grName/:chShip/:chName/thread/:thread">
            <Route path="delete/:response" element={<DeleteDialog />} />
            <Route path="response/:response?/ref" element={<RefDialog />} />
          </Route>
        </Routes>
      )}
    </React.Fragment>
  );
};

function NavLink({
  children,
  location,
  ...props
}: LinkProps & {
  children: React.ReactNode;
  location?: Location;
}) {
  const lprops = location ? {state: {bgLocation: location}} : {};
  return (
    <Link {...lprops} {...props} className="button">
      {children}
    </Link>
  );
}

// FIXME: Imperfect hack to enable lazy relative links on paginated pages
// (is there any easier/cleaner way to tell if we need to navigate an extra
// level if the ':page?' parameter is defined?)
function FixupNavigate(props: NavigateProps) {
  return (
    <Navigate {...props} relative="path" replace />
  );
}
