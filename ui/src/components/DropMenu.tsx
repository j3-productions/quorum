import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDoubleDownIcon } from '@heroicons/react/solid';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface DropEntryProps {
  text: string;
  link: string;
  className?: string;
}

const DropEntry = ({ text, link, className }: DropEntryProps) => {
  return (
    <Link to={link}>
      <DropdownMenu.Item className="text-fgp1 cursor-default select-none relative py-2 pl-3 pr-9 focus:outline-none focus:ring-1 focus:ring-bgs1 font-semibold">
        {text}
      </DropdownMenu.Item>
    </Link>
  )
}

export type DropMenuItem = [string, string];
interface DropMenuProps {
  entries: DropMenuItem[];
  className?: string;
}

export const DropMenu = ({ entries, className }: DropMenuProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button>
          {/*TODO: Consider increasing the size, particularly for mobile.*/}
          <svg className="h-2 w-4 text-bgs1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 386.257 386.257" fill="currentColor">
            <polygon points="0,96.879 193.129,289.379 386.257,96.879 "/>
          </svg>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="z-10 w-full bg-bgp1 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-bgs1 ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
        {entries.map(([f, l]: DropMenuItem) => (<DropEntry key={f} text={f} link={l} />))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
