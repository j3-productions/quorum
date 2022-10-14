import React from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Type from '../types/quorum';

interface EntryProps extends Type.MenuItem {
  className?: string;
}
interface SectionProps extends Type.MenuSection {
  className?: string;
  iclassName?: string;
}
interface MenuProps {
  entries: Type.MenuSection[] | Type.MenuItem[];
  trigger: React.ReactNode;
  className?: string;
}

// TODO: Reconcile 'sm:text-sm' at the top-level w/ 'text-lg' for the
// drop section entry.
// TODO: Try to handle separators at the menu level instead of the
// section or entry levels.
//
// <DropdownMenu.DropdownMenuSeparator className="border-t border-bgs1 my-2" />

export const DropMenu = ({entries, trigger, className}: MenuProps) => {
  const DropEntry = ({title, path, className}: EntryProps) => (
    <Link to={path}>
      <DropdownMenu.Item className={cn(`
          relative py-2 pl-3 pr-9 font-semibold text-fgp1/70
          focus:text-fgp1/100 focus:outline-none focus:ring-1 focus:ring-bgs1`,
          className)}>
        {title}
      </DropdownMenu.Item>
    </Link>
  );
  const DropSection = ({items, title, path, className, iclassName}: SectionProps) => (
    <React.Fragment>
      <Link to={path}>
        <DropdownMenu.Item className={cn(`
            relative pl-3 pr-9 text-lg italic text-fgs2/70
            hover:text-fgs2/100 hover:outline-none hover:ring-1 hover:ring-fgs2`,
            className)}>
          {title}
        </DropdownMenu.Item>
      </Link>
      {items.map(({title, path}: Type.MenuItem) => (
        <DropEntry key={title} title={title} path={path} className={iclassName} />
      ))}
    </React.Fragment>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={className} asChild>
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className={cn(`
          w-full max-h-60 py-1 z-10 overflow-auto rounded-md text-base
          bg-bgp2 shadow-lg ring-1 ring-bgs1 ring-opacity-5
          focus:outline-none sm:text-sm`)}>
        {((entries.length > 0) && 'items' in entries[0]) ?
          (entries as Type.MenuSection[])
            .slice(0, (entries as Type.MenuSection[])[entries.length - 1].items.length ? entries.length : -1)
            .map((props) => (<DropSection key={props.title} {...props} />)) :
          (entries as Type.MenuItem[])
            .map((props) => (<DropEntry key={props.title} {...props} />))
        }
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export const CrumbMenu = ({entries, trigger, className}: MenuProps) => {
  const CrumbSection = ({items, title, path, className, iclassName}: SectionProps) => (
    <React.Fragment>
      <li>
        <Link to={path} className="text-fgp1/70 hover:text-fgp1/100">
          {title}
        </Link>
        {(items.length > 0) &&
          <DropMenu entries={items} trigger={trigger} />
        }
      </li>
      <li>/</li>
    </React.Fragment>
  );

  return (
    <div aria-label="breadcrumb" className={className}>
      <ol className="flex space-x-2">
        {((entries.length > 0) && 'items' in entries[0]) ?
          (entries as Type.MenuSection[])
            .map((props) => (<CrumbSection key={props.title} {...props} />)) :
          (<React.Fragment />)
        }
      </ol>
    </div>
  );
};
