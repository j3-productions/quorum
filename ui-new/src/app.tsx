import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Location,
  useLocation,
  useNavigate,
  Link,
} from 'react-router-dom';
import {
  PlusIcon,
  EnterIcon,
  HomeIcon,
} from '@radix-ui/react-icons';
import NavBar from '~/components/NavBar';
import ChannelGrid from '~/components/ChannelGrid';
import { CreateDialog, JoinDialog } from '~/pages/Dialogs';


export function App() {
  return (
    <BrowserRouter basename="/apps/quorum">
      <RoutedApp />
    </BrowserRouter>
  );
}

function RoutedApp() {
  const location = useLocation();
  const state = location.state as {bgLocation?: Location} | null;

  return (
    <React.Fragment>
      <Routes location={state?.bgLocation}>
        {/* Standalone Paths */}
        <Route path="/">
          {/* TODO: Add group blocks a la %landscape */}
          <Route index element={
            <React.Fragment>
              <NavBar children={
                <React.Fragment>
                  <Link className="button" to="/create" state={{bgLocation: location}}>
                    <PlusIcon />
                  </Link>
                  <Link className="button" to="/join" state={{bgLocation: location}}>
                    <EnterIcon />
                  </Link>
                </React.Fragment>
              } />
              <ChannelGrid />
            </React.Fragment>
          } />
          {/* TODO: Add search results and pagination bottom nav */}
          <Route path="search/:seQuery/:sePage?" element={
            <NavBar children={
              <Link className="button" to="/">
                <HomeIcon />
              </Link>
            } />
          } />
        </Route>

        {/* Embedded Paths */}
        <Route path="/groups/:grShip/:grName/channels/quorum/:chShip/:chName">
          <Route path=":chPage?" element={<p>Group @ Page</p>} />
          <Route path="question" element={<p>Group Question</p>} />
          <Route path="settings" element={<p>Group Settings</p>} />
          <Route path="search/:seQuery/:sePage?" element={<p>Group Search</p>} />
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
          <Route path="/groups/:grShip/:grName/channels/quorum/:chShip/:chName/thread/:thId">
            <Route path="answer/ref" element={<p>Group Thread Answer Ref</p>} />
            <Route path="edit/:edId/ref" element={<p>Group Thread Edit Ref</p>} />
          </Route>
        </Routes>
      )}
    </React.Fragment>
  );
};
