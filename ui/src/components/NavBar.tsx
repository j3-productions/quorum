import React from 'react';
import cn from 'classnames';
import api from '../api';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { SearchIcon } from '@heroicons/react/solid';
import { DropMenu, DropMenuItem } from './DropMenu';

interface CrumbProps {
  index: number;
  crumbs: string[];
  className?: string;
}

// TODO: Combine crumbs into components based on nav
// - %quorum/board/~zod/example => %quorum/board:~zod:example/
// - /thread/10/ => thread:10

const NavCrumb = ({index, crumbs, className}: CrumbProps) => {
  // TODO: clean up logic related to 'settings' form population
  // TODO: add real links to each stage of this navigation menu
  // TODO: gray out all crumbs that don't link to something real

  const indexPrefix = (i: number): string =>
    (['', ...crumbs.slice(0, i+1)].join('/'));

  let indexEntries: DropMenuItem[] = [];
  if(crumbs[0] === 'board') { // if is board crumb
    if(index === 2) { // if is direct board crumb
      const questionEntry: DropMenuItem = ['❓ question', indexPrefix(index) + '/question'];
      const settingsEntry: DropMenuItem = ['⚙️ settings',  indexPrefix(index) + '/settings'];
      indexEntries.push(questionEntry);
      if(crumbs[1].slice(1) === api.ship) { // if host owns the board
        indexEntries.push(settingsEntry);
      }
    } else if(index === 4) { // if is thread crumb
      const answerEntry: DropMenuItem = ['🙋 answer', indexPrefix(index) + '/answer'];
      indexEntries.push(answerEntry);
    }
  }

  return (
    <>
      <li><span className="text-gray-500 mx-2">/</span></li>
      <li>
        <Link to={indexPrefix(index)} className="text-gray-500 hover:text-gray-600">
          {crumbs[index]}
        </Link>
        {(indexEntries.length > 0) &&
          <DropMenu entries={indexEntries} className="min-w-0 sm:w-20" />
        }
      </li>
    </>
  )
}

export const NavBar = () => {
  const {pathname} = useLocation();
  const breadcrumbs  = pathname.split('/').slice(1);

  return (
    <nav className="relative w-full sticky top-0 z-50 flex flex-wrap items-center justify-between py-2 bg-linen border-solid border-b-2 border-rosy text-mauve">
      <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
        <nav className="bg-grey-light rounded-md float-left" aria-label="breadcrumb">
          <ol className="flex">
            <li>
              <Link to="/">%quorum</Link>
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
