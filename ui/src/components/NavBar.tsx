import React, { ChangeEvent, KeyboardEvent, useCallback, useState } from 'react';
import cn from 'classnames';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SearchIcon, MenuIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { DropMenu, CrumbMenu } from './Menus';
import { appHost } from '../utils';
import * as Type from '../types/quorum';

export const NavBar = () => {
  const navigate = useNavigate();
  const {pathname} = useLocation();

  // TODO: Clean this up so that path prefixes just use paths defined in 'react-dom'.
  let searchBoard: string = '~';
  let searchPlanet: string = appHost;
  let searchQuery: string | undefined = undefined;
  let navCrumbs: Type.MenuSection[] = []; {
    let currCrumbs: string[] = ('%quorum' + pathname).replace(/\/$/, '').split('/');
    let currPath: string = '';
    while(currCrumbs.length > 0) {
      const nextCrumb: string = currCrumbs.shift() || '';
      if(nextCrumb.match(/%quorum/)) {
        navCrumbs.push({
          title: nextCrumb,
          click: currPath + '/',
          items: [
            {title: '➕ create', click: '/create'},
            {title: '⤵️ join',    click: '/join'},
          ],
        });
      } else if(nextCrumb.match(/search/)) {
        const planetCrumb: string = currCrumbs.shift() || '';
        const boardCrumb: string = currCrumbs.shift() || '';
        const queryCrumb: string = currCrumbs.shift() || '';
        searchPlanet = planetCrumb;
        searchBoard = boardCrumb;
        searchQuery = queryCrumb;
        currPath += `/search/${planetCrumb}/${boardCrumb}/${queryCrumb}`;
        navCrumbs.push({
          title: `${planetCrumb}:${boardCrumb}?${queryCrumb}`,
          click: currPath,
          items: [],
        });
      } else if(nextCrumb.match(/board/)) {
        const hostCrumb: string = currCrumbs.shift() || '';
        const boardCrumb: string = currCrumbs.shift() || '';
        searchPlanet = hostCrumb;
        searchBoard = boardCrumb;
        currPath += `/board/${hostCrumb}/${boardCrumb}`;
        navCrumbs.push({
          title: `${hostCrumb}:${boardCrumb}`,
          click: currPath,
          items: [
            {title: '❓ question', click: `${currPath}/question`},
            {title: '⚙️ settings',  click: `${currPath}/settings`},
          ],
        });
      } else if(nextCrumb.match(/thread/)) {
        const tidCrumb: string = currCrumbs.shift() || '';
        currPath += `/thread/${tidCrumb}`;
        navCrumbs.push({
          title: `thread:${tidCrumb}`,
          click: currPath,
          items: [
            {title: '🙋 answer', click: `${currPath}/answer`},
          ],
        });
      } else {
        currPath += `/${nextCrumb}`;
        navCrumbs.push({title: nextCrumb, click: currPath, items: []});
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
    if(event.key === "Enter" && rawQuery !== "") {
      navigate(`/search/${searchPlanet}/${searchBoard}/${rawQuery}`);
      event.preventDefault();
    }
  }, [searchPlanet, searchBoard, rawQuery]);

  return (
    <nav className="relative w-full sticky top-0 z-50 py-2 bg-bgp1 border-solid border-b-2 border-bgs1">
      <div className="container-fluid gap-2 w-full flex items-center justify-between px-6">
        <div className="shrink-0 container-fluid flex justify-start">
          <DropMenu entries={navCrumbs} className="block md:hidden" trigger={(
              <button className="rounded border-2 border-solid border-bgs1">
                <MenuIcon className="h-6 w-6" />
              </button>
            )}/>
          <CrumbMenu entries={navCrumbs} className="hidden md:block" trigger={(
              <button className="align-text-bottom">
                <ChevronDownIcon className="h-4 w-4 text-bgs2" />
              </button>
            )}/>
        </div>
        <div className="shrink rounded-md">
          <div className="relative flex items-center">
            <SearchIcon
              onClick={() => {
                if(rawQuery !== "") {
                  navigate(`/search/${searchPlanet}/${searchBoard}/${rawQuery}`);
                }
              }}
              className={cn('flip-y absolute left-2 h-5 w-5 cursor-pointer')}
            />
            <input
              type='text'
              value={rawQuery}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={`Search ${(searchBoard !== "~") ?
                `'${searchBoard}'` : "All Boards"}`}
              className={cn(`w-full py-1 pl-9 pr-2 rounded-lg ring-bgs2
                focus:outline-none focus:ring-2 enabled:bg-bgp2/100
                disabled:bg-bgp2/50 disabled:cursor-not-allowed disabled:select-none`)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
