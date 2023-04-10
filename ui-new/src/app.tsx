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
import Dialog from '~/components/Dialog';
import { QuestionMarkIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useDismissNavigate } from '~/logic/routing';

// TODO: Create dedicated state/ files for the following:
// - base/
//   - query.ts: React-Query API
// - local/
//   - media.ts: Zustand for `useMedia` queries
// - remote/
//   - urbit.ts: Urbit API
//   - subs.ts: Urbit API Subscriptions + Data Wires (??)

export function App() {
  return (
    <BrowserRouter basename="/apps/quorum">
      <RoutedApp />
    </BrowserRouter>
  );
}

export function RoutedApp() {
  const location = useLocation();
  const state = location.state as { bgLocation?: Location } | null;

  return (
    <React.Fragment>
      <Routes location={state?.bgLocation}>
        {/* Standalone Paths */}
        <Route path="/">
          <Route index element={
            <Link to="/about" state={{ bgLocation: location }}>
              <QuestionMarkIcon className="h-6 w-6" />
            </Link>
          } />
          <Route path="search/:seQuery/:sePage?" element={<p>Search</p>} />
        </Route>

        {/* Embedded Paths */}
        <Route path="/groups/:grShip/:grName/channels/qa/:chShip/:chName">
          <Route index element={<p>Group @ Page 1</p>} />
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
          <Route path="/about" element={<AboutDialog />} />
          <Route path="/create" element={<CreateDialog />} />
          <Route path="/join" element={<JoinDialog />} />

          {/* Embedded Modals */}
          <Route path="/groups/:grShip/:grName/channels/qa/:chShip/:chName/thread/:thId">
            <Route path="answer/ref" element={<p>Group Thread Answer Ref</p>} />
            <Route path="edit/:edId/ref" element={<p>Group Thread Edit Ref</p>} />
          </Route>
        </Routes>
      )}
    </React.Fragment>
  );
};

export function AboutDialog() {
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <p>ABOUT ABOUT ABOUT</p>
    </Dialog>
  );
}

export function CreateDialog() {
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <p>CREATE CREATE CREATE</p>
    </Dialog>
  );
}

export function JoinDialog() {
  const dismiss = useDismissNavigate();
  const onOpenChange = (open: boolean) => (!open && dismiss());

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange} className="w-[500px]">
      <p>JOIN JOIN JOIN</p>
    </Dialog>
  );
}
