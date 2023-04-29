import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Location,
  Navigate,
  useLocation,
  useNavigate,
  Link,
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
import { PostWall } from '~/pages/Views';
import { QuestionForm, SettingsForm } from '~/pages/Forms';
import { CreateDialog, JoinDialog } from '~/pages/Dialogs';


export function App() {
  return (
    <BrowserRouter basename="/apps/quorum/">
      <RoutedApp />
    </BrowserRouter>
  );
}

function RoutedApp() {
  const location = useLocation();
  const state = location.state as {bgLocation?: Location} | null;
  return (
    <RoutedAppRoutes state={state} location={location} />
  );
}

// NOTE: This seemingly unnecessary indirection is required to allow modals
// to overlay on top of base paths without causing those base paths to
// re-render their contents.
function RoutedAppRoutes({state, location}) {
  return (
    <React.Fragment>
      <Routes location={state?.bgLocation || location}>
        {/* Standalone Paths */}
        <Route path="/">
          <Route index element={
            <React.Fragment>
              <NavBar children={
                <React.Fragment>
                  <Link className="button" to="create" state={{bgLocation: location}}>
                    <PlusIcon />
                  </Link>
                  <Link className="button" to="join" state={{bgLocation: location}}>
                    <EnterIcon />
                  </Link>
                </React.Fragment>
              } />
              <ChannelGrid className="py-4" />
            </React.Fragment>
          } />
          {/* FIXME: Imperfect hack to enable lazy relative links on paginated pages */}
          <Route path="search" element={<Navigate to="../" replace />} />
          <Route path="search/:seQuery/:sePage?" element={
            <React.Fragment>
              <NavBar children={
                <Link className="button" to="/">
                  <HomeIcon />
                </Link>
              } />
              <p>TODO: Add search results and pagination bottom nav</p>
            </React.Fragment>
          } />
        </Route>

        {/* Embedded Paths */}
        <Route path="/channel/:grShip/:grName/:chShip/:chName">
          <Route path=":chPage?" element={
            <React.Fragment>
              <NavBar children={
                <React.Fragment>
                  <Link className="button" to="question">
                    <QuestionMarkIcon />
                  </Link>
                  <Link className="button" to="settings">
                    <GearIcon />
                  </Link>
                </React.Fragment>
              } />
              <PostWall className="py-4" />
            </React.Fragment>
          } />
          <Route path="question" element={<QuestionForm className="py-4 px-6" />} />
          <Route path="settings" element={<SettingsForm className="py-4 px-6" />} />
          {/* FIXME: Imperfect hack to enable lazy relative links on paginated pages */}
          <Route path="search" element={<Navigate to="../" replace />} />
          <Route path="search/:seQuery/:sePage?" element={
            <React.Fragment>
              <NavBar children={
                <React.Fragment>
                  <Link className="button" to="../../" relative="path">
                    <HomeIcon />
                  </Link>
                </React.Fragment>
              } />
              <p>TODO: Add search results and pagination bottom nav</p>
            </React.Fragment>
          } />
          <Route path="thread/:thId">
            <Route index element={<p>Group Thread</p>} />
            <Route path="answer" element={<p>Group Thread Answer</p>} />
            <Route path="edit/:edId" element={<p>Group Thread Edit</p>} />
          </Route>
        </Route>
      </Routes>
      {state?.bgLocation && (
        <Routes>
          {/* Standalone Modals */}
          <Route path="/create" element={<CreateDialog />} />
          <Route path="/join" element={<JoinDialog />} />

          {/* Embedded Modals */}
          <Route path="/channel/:grShip/:grName/:chShip/:chName/thread/:thId">
            <Route path="answer/ref" element={<p>Group Thread Answer Ref</p>} />
            <Route path="edit/:edId/ref" element={<p>Group Thread Edit Ref</p>} />
          </Route>
        </Routes>
      )}
    </React.Fragment>
  );
};
