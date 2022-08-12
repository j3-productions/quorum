import cn from 'classnames';
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Meta } from './Meta';
import { NavBar } from './NavBar';

export const Layout = () => {
  return (
    <>
      <NavBar />
      <main className={cn("flex flex-col items-center h-full min-h-screen")}>
        <div className="flex-1 flex flex-col max-w-2xl h-full w-full p-4 space-y-6">
          <Outlet />
        </div>
        <aside className='self-start mx-4 mb-6 mt-auto sm:m-0 sm:fixed left-4 bottom-4'>
          <nav className='mb-10'>
            <ul className='font-semibold text-sm space-y-4'>
              <li>
                <NavLink to="/board/~zod/example-board" className={({ isActive }) => cn('hover:text-rosy transition-colors', isActive && 'underline')}>zod-example-board</NavLink>
              </li>
              <li>
                <NavLink to="/board/~nec/example-board" className={({ isActive }) => cn('hover:text-rosy transition-colors', isActive && 'underline')}>nec-example-board</NavLink>
              </li>
            </ul>
          </nav>
        </aside>
      </main>
    </>
  )
}
