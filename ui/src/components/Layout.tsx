import React from 'react';
import cn from 'classnames';
import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';

export const Layout = () => {
  return (
    <React.Fragment>
      <NavBar />
      <main className={cn("flex flex-col items-center h-full min-h-screen")}>
        <div className="flex-1 flex flex-col max-w-2xl h-full w-full p-4 space-y-4">
          <Outlet />
        </div>
      </main>
    </React.Fragment>
  )
}
