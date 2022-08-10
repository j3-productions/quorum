import React from 'react';
import cn from 'classnames';
import { NavLink, matchPath, useLocation } from 'react-router-dom';
import { SearchIcon } from '@heroicons/react/solid';
import { Filter } from './Filter';

// NavBar args: current path
export function NavBar() {
  const { pathname } = useLocation();
  const breadcrumbs  = pathname.split('/').slice(1);

  return (
    <nav className="relative w-full sticky top-0 flex flex-wrap items-center justify-between py-2 bg-linen border-solid border-b-2 border-rosy text-mauve">
      <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
        <nav className="bg-grey-light rounded-md float-left" aria-label="breadcrumb">
          <ol className="flex">
            <li>
              <NavLink to="/">%quorum</NavLink>
              {/* TODO: Update 'Filter' to take list of item/href pairs */}
              <Filter onSelect={() => {}} selected='all' className="min-w-0 sm:w-20" />
            </li>
            {/* TODO: This span creates the breadcrumbs, but want 'mx-2' to be handled at filter/item level */}
            <li><span className="text-gray-500 mx-2">/</span></li>
            <li><a href="#" className="text-gray-500 hover:text-gray-600">{breadcrumbs[0]}</a></li>
          </ol>
        </nav>
        <nav className="bg-grey-light rounded-md float-right">
          <div className='relative flex items-center'>
            <SearchIcon className='flip absolute left-2 h-5 w-5' />
            <input
              type='text'
              value=''
              onChange={() => {}}
              placeholder="Search"
              className={cn('w-full py-1 pl-9 pr-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30')}
            />
          </div>
        </nav>
      </div>
    </nav>
  )
}
