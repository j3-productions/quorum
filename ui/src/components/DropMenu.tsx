import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDoubleDownIcon } from '@heroicons/react/solid';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface DropEntryProps {
  text: string;
  link: string;
  className?: string;
}

const DropEntry = ({ text, link, className }: DropEntryProps) => {
  return (
    <NavLink to={link}>
      <DropdownMenu.Item className="text-mauve cursor-default select-none relative py-2 pl-3 pr-9 focus:outline-none focus:ring-1 focus:ring-rosy font-semibold">
        {text}
      </DropdownMenu.Item>
    </NavLink>
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
          {/* <ChevronDoubleDownIcon className="w-4 h-4" /> */}
          <svg className="h-2 w-4 text-rosy" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 386.257 386.257" fill="currentColor">
            <polygon points="0,96.879 193.129,289.379 386.257,96.879 "/>
          </svg>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="z-10 w-full bg-linen shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-rosy ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
        {entries.map(([f, l]: DropMenuItem) => (<DropEntry key={f} text={f} link={l} />))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
