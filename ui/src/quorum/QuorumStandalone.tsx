import React, { useEffect, useState, useCallback } from 'react';
import cn from 'classnames';
import { Route, Routes } from 'react-router-dom';
import { PlusCircledIcon, EnterIcon, HomeIcon } from '@radix-ui/react-icons';
import Layout from '@/components/Layout/Layout';
import { BoardGrid, PostWall } from '@/quorum/QuorumViews';
import QuorumNav from '@/nav/QuorumNav';
import { AnchorButton, ModalButton } from '@/quorum/QuorumButtons';
import ErrorRedirect from '@/components/ErrorRedirect';
import useMedia from '@/logic/useMedia';


export default function QuorumStandalone() {
  const navClass = "w-full max-w-2xl mx-auto";

  return (
    <Layout
      className="flex-1 max-w-7xl mx-auto bg-white"
      mainClass="p-4 max-h-full overflow-y-scroll"
      stickyHeader
      header={
        <Routes>
          <Route index
            element={
              <QuorumNav className={navClass}>
                <ModalButton to="create" title="New Board" children={<PlusCircledIcon/>} />
                <ModalButton to="join" title="Join Board" children={<EnterIcon/>} />
              </QuorumNav>
            }
          />
          <Route path="search/:query/:page?"
            element={
              <QuorumNav className={navClass}>
                <AnchorButton to="." title="Go to Boards" children={<HomeIcon/>} />
              </QuorumNav>
            }
          />
        </Routes>
      }
    >
      <Routes>
        <Route index element={<BoardGrid />} />
        <Route path="search/:query/:page?" element={<PostWall />} />
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