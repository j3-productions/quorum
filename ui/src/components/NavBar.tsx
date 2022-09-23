import React, { ChangeEvent, KeyboardEvent, useCallback, useRef, useState } from 'react';
import cn from 'classnames';
import api from '../api';
import { Link, matchPath, useNavigate, useLocation } from 'react-router-dom';
import { SearchIcon } from '@heroicons/react/solid';
import { DropMenu, DropMenuItem } from './DropMenu';

interface CrumbItem {
  title: string;
  path: string;
  items: DropMenuItem[];
}

interface CrumbProps {
  crumb: CrumbItem;
  first: boolean;
  className?: string;
}

const NavCrumb = ({crumb, first, className}: CrumbProps) => {
  return (
    <>
      {!first && (<li>/</li>)}
      <li>
        <Link to={crumb.path} className="text-fgp1/70 hover:text-fgp1/100">
          {crumb.title}
        </Link>
        {(crumb.items.length > 0) &&
          <DropMenu entries={crumb.items} />
        }
      </li>
    </>
  );
}

export const NavBar = () => {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const breadCrumbs: string[] = ('%quorum' + pathname).replace(/\/$/, "").split('/');

  // TODO: Clean this up so that path prefixes just use paths defined in
  // 'react-dom'.
  let searchBoard: string | undefined = undefined;
  let searchQuery: string | undefined = undefined;
  let navCrumbs: CrumbItem[] = []; {
    let currCrumbs: string[] = breadCrumbs.slice();
    let currPath: string = '';
    while(currCrumbs.length > 0) {
      const nextCrumb: string = currCrumbs.shift() || '';
      if(nextCrumb.match(/%quorum/)) {
        navCrumbs.push({
          title: nextCrumb,
          path: currPath + '/',
          items: [
            {title: '➕ create', path: '/create'},
            {title: '⤵️ join',    path: '/join'},
          ],
        });
      } else if(nextCrumb.match(/search/)) {
        const boardCrumb: string = currCrumbs.shift() || '';
        const queryCrumb: string = currCrumbs.shift() || '';
        searchBoard = boardCrumb;
        searchQuery = queryCrumb;
        currPath += `/search/${boardCrumb}/${queryCrumb}`;
        navCrumbs.push({
          title: `search:${boardCrumb}?${queryCrumb}`,
          path: currPath,
          items: [],
        });
      } else if(nextCrumb.match(/board/)) {
        const hostCrumb: string = currCrumbs.shift() || '';
        const boardCrumb: string = currCrumbs.shift() || '';
        searchBoard = boardCrumb;
        currPath += `/board/${hostCrumb}/${boardCrumb}`;
        navCrumbs.push({
          title: `${hostCrumb}:${boardCrumb}`,
          path: currPath,
          items: [
            {title: '❓ question', path: `${currPath}/question`},
            // {title: '⚙️ settings',  path: `${curPath}/settings`},
          ],
        });
      } else if(nextCrumb.match(/thread/)) {
        const tidCrumb: string = currCrumbs.shift() || '';
        currPath += `/thread/${tidCrumb}`;
        navCrumbs.push({
          title: `thread:${tidCrumb}`,
          path: currPath,
          items: [
            {title: '🙋 answer', path: `${currPath}/answer`},
          ],
        });
      } else {
        currPath += `/${nextCrumb}`;
        navCrumbs.push({title: nextCrumb, path: currPath, items: []});
      }
    }
  }

  // TODO: Add an fgs1 border when an invalid input is provided (i.e.
  // inputValue !== finalValue).
  // TODO: Completely termify input (i.e. must start with letter).
  const [rawQuery, setRawQuery] = useState(searchQuery || '');
  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target;
    setRawQuery(value.toLowerCase().replace(/[^a-z0-9\-]/g, ""));
  }, []);
  const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") {
      navigate(`/search/${searchBoard}/${rawQuery}`);
      event.preventDefault();
    }
  }, [rawQuery]);

  return (
    <nav className="relative w-full sticky top-0 z-50 py-2 bg-bgp1 border-solid border-b-2 border-bgs1">
      <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
        <div aria-label="breadcrumb">
          <ol className="flex space-x-2">
            {navCrumbs.map((c, i) => (<NavCrumb key={c.title} first={i === 0} crumb={c}/>))}
          </ol>
        </div>
        <div className="rounded-md">
          <div className='relative flex items-center'>
            <SearchIcon
              onClick={() => navigate(`/search/${searchBoard}/${rawQuery}`)}
              className={cn('flip-y absolute left-2 h-5 w-5', searchBoard ? "cursor-pointer" : "cursor-not-allowed opacity-25")}
            />
            <input
              type='text'
              value={searchBoard ? rawQuery : ""}
              disabled={!searchBoard}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={searchBoard ? "Search" : "(Select Board to Search)"}
              className={cn('w-full py-1 pl-9 pr-2 rounded-lg ring-bgs2 focus:outline-none focus:ring-2 enabled:bg-bgp2/100 disabled:bg-bgp2/50 disabled:cursor-not-allowed disabled:select-none')}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
