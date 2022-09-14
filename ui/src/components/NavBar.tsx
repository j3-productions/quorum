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

  const indexPrefix = (i: number): string => (crumbs.slice(0, i+1).join('/'));

  let indexEntries: DropMenuItem[] = [];
  if(index === 0) { // if is base crumb
    const createEntry: DropMenuItem = ['➕ create', '/create'];
    const joinEntry: DropMenuItem = ['⤵️ join', '/join'];
    indexEntries.push(...[createEntry, joinEntry]);
  } else if(crumbs[1] === 'board') { // if is board crumb
    if(index === 3) { // if is direct board crumb
      const questionEntry: DropMenuItem = ['❓ question', indexPrefix(index) + '/question'];
      const settingsEntry: DropMenuItem = ['⚙️ settings',  indexPrefix(index) + '/settings'];
      indexEntries.push(questionEntry);
      if(crumbs[1].slice(1) === api.ship) { // if host owns the board
        indexEntries.push(settingsEntry);
      }
    } else if(index === 5) { // if is thread crumb
      const answerEntry: DropMenuItem = ['🙋 answer', indexPrefix(index) + '/answer'];
      indexEntries.push(answerEntry);
    }
  }

  return (
    <>
      {(index > 0) && (<li>/</li>)}
      <li>
        <Link to={indexPrefix(index)} className="text-fgp1/70 hover:text-fgp1/100">
          {(index > 0) ? crumbs[index] : '%quorum'}
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
  const breadcrumbs = (pathname !== '/') ? pathname.split('/') : [''];

  return (
    <nav className="relative w-full sticky top-0 z-50 py-2 bg-bgp1 border-solid border-b-2 border-bgs1">
      <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2">
            {breadcrumbs.map((c, i) => (<NavCrumb key={c} index={i} crumbs={breadcrumbs}/>))}
          </ol>
        </nav>
        <nav className="bg-bgp2 rounded-md">
          <div className='relative flex items-center'>
            <SearchIcon className='flip-y absolute left-2 h-5 w-5' />
            <input
              type='text'
              value=''
              onChange={() => {}}
              placeholder="Search"
              className={cn('w-full py-1 pl-9 pr-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30')}
            />
          </div>
        </nav>
      </div>
    </nav>
  )
}
