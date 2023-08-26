import React, { useEffect, useState, useCallback } from 'react';
import cn from 'classnames';
import { Route, Routes } from 'react-router-dom';
import { PlusIcon, HomeIcon, GearIcon } from '@radix-ui/react-icons';
import Layout from '@/components/Layout/Layout';
import { PostWall, PostThread } from '@/quorum/QuorumViews';
import { ResponseForm, SettingsForm } from '@/quorum/QuorumForms';
import QuorumNav from '@/nav/QuorumNav';
import { AnchorButton } from '@/quorum/QuorumButtons';
import ErrorRedirect from '@/components/ErrorRedirect';
import { useRouteGroup } from '@/state/groups';
import { useRouteBoard } from '@/state/quorum';
import useMedia from '@/logic/useMedia';


export default function QuorumChannel() {
  const groupFlag = useRouteGroup();
  const chFlag = useRouteBoard();

  const navClass = "w-full max-w-2xl mx-auto";
  const formClass = "w-full max-w-4xl mx-auto";

  return (
    <Layout
      className="flex-1 max-w-7xl mx-auto bg-white"
      mainClass="p-4 max-h-full overflow-y-scroll"
      stickyHeader
      header={
        <Routes>
          <Route path="question" element={<React.Fragment />} />
          <Route path="settings" element={<React.Fragment />} />
          <Route path=":page?"
            element={
              <QuorumNav className={navClass}>
                <AnchorButton to="question" title="New Question" children={<PlusIcon/>} />
                <AnchorButton to="settings" title="Settings" children={<GearIcon/>} />
              </QuorumNav>
            }
          />
          <Route path="search/:query/:page?"
            element={
              <QuorumNav className={navClass}>
                <AnchorButton to="." title="Go to Board" children={<HomeIcon/>} />
              </QuorumNav>
            }
          />
        </Routes>
      }
    >
      <Routes>
        <Route path=":page?" element={<PostWall />} />
        <Route path="search/:query/:page?" element={<PostWall />} />
        <Route path="question" element={<ResponseForm className={formClass} />} />
        <Route path="settings" element={<SettingsForm className={formClass} />} />
        <Route path="thread/:thread">
          <Route index element={<PostThread className={formClass} />} />
          <Route path="response/:response?" element={<ResponseForm className={formClass} />} />
        </Route>
        <Route path="*" element={
          <ErrorRedirect anchor
            header="Invalid Page!"
            content="Click the logo above to return to safety."
          />
        } />
      </Routes>
    </Layout>
  );
}
