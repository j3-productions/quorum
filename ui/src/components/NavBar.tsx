import React from 'react';
import cn from 'classnames';
import api from '../api';
import { NavLink, matchPath, useLocation } from 'react-router-dom';
import { SearchIcon } from '@heroicons/react/solid';
import { DropMenu } from './DropMenu';

interface CrumbProps {
  index: number;
  crumbs: string[];
  className?: string;
}

export const NavBar = () => {
  const { pathname } = useLocation();
  const breadcrumbs  = pathname.split('/').slice(1);

  const NavCrumb = ({ index, crumbs, className }: CrumbProps) => {
    // TODO: clean up logic related to 'settings' form population
    // TODO: add real links to each stage of this navigation menu
    const indexPrefix = (i) => (['', ...crumbs.slice(0, i+1)].join('/'))

    // example: /board/~zod/board-name/thread/thread-id
    const isBoardCrumb = (i, c) => (c[0] === 'board' && i === 2);
    const isThreadCrumb = (i, c) => (c[0] === 'board' && i === 4);
    const isOurBoard = (i, c) => (c[0] === 'board' && c[1].slice(1) === api.ship);

    return (
      <>
        <li><span className="text-gray-500 mx-2">/</span></li>
        <li>
          <NavLink to={indexPrefix(index)} className="text-gray-500 hover:text-gray-600">
            {crumbs[index]}
          </NavLink>
          {(isBoardCrumb(index, crumbs) || isThreadCrumb(index, crumbs)) &&
            <DropMenu entries={
              [['❓ question', indexPrefix(2) + '/question']].concat(
              isOurBoard(index, crumbs) ? [['⚙️ settings',  indexPrefix(2) + '/settings']] : [])}
              className="min-w-0 sm:w-20" />
          }
        </li>
      </>
    )
  }

  return (
    <nav className="relative w-full sticky top-0 flex flex-wrap items-center justify-between py-2 bg-linen border-solid border-b-2 border-rosy text-mauve">
      <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
        <nav className="bg-grey-light rounded-md float-left" aria-label="breadcrumb">
          <ol className="flex">
            <li>
              <NavLink to="/">%quorum</NavLink>
              <DropMenu entries={[
                ['➕ create', '/create'],
                ['⤵️ join', '/join']]}
                className="min-w-0 sm:w-20" />
            </li>
            {/* TODO: This span creates the breadcrumbs, but want 'mx-2' to be handled at filter/item level */}
            {breadcrumbs.map((c, i) => (<NavCrumb key={c} index={i} crumbs={breadcrumbs}/>))}
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
