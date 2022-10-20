import React from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Type from '../types/quorum';

interface EntryProps extends Type.MenuItem {
  className?: string;
}
interface SectionProps extends Type.MenuSection {
  first: boolean;
  className?: string;
  iclassName?: string;
}
interface MenuProps {
  entries: Type.MenuSection[] | Type.MenuItem[];
  trigger: React.ReactNode;
  className?: string;
}
interface ClickProps {
  click: string | (() => void);
  children: React.ReactNode;
  className?: string;
}

// TODO: Reconcile 'sm:text-sm' at the top-level w/ 'text-lg' for the
// drop section entry.

export const DropMenu = ({entries, trigger, className}: MenuProps) => {
  const DropEntry = ({title, click, className}: EntryProps) => (
    <ClickDiv click={click}>
      <DropdownMenu.Item className={cn(`
          relative py-2 pl-3 pr-9 font-semibold text-fgp1/70
          focus:text-fgp1/100 focus:outline-none focus:ring-1 focus:ring-bgs1`,
          className)}>
        {title}
      </DropdownMenu.Item>
    </ClickDiv>
  );
  const DropSection = ({items, title, click, first, className, iclassName}: SectionProps) => (
    <React.Fragment>
      {!first &&
        <DropdownMenu.DropdownMenuSeparator className="border-t border-bgs1 my-2" />
      }
      <ClickDiv click={click}>
        <DropdownMenu.Item className={cn(`
            relative pl-3 pr-9 text-lg italic text-fgs2/70
            hover:text-fgs2/100 hover:outline-none hover:ring-1 hover:ring-fgs2`,
            className)}>
          {title}
        </DropdownMenu.Item>
      </ClickDiv>
      {items.map((props: Type.MenuItem) => (
        <DropEntry key={props.title} {...props} className={iclassName} />
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
            .map((props, index) => (
              <DropSection key={props.title} first={index === 0} {...props} />
            )) :
          (entries as Type.MenuItem[])
            .map((props) => (<DropEntry key={props.title} {...props} />))
        }
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export const CrumbMenu = ({entries, trigger, className}: MenuProps) => {
  const CrumbSection = ({items, title, click, first, className, iclassName}: SectionProps) => (
    <React.Fragment>
      <li>
        <ClickDiv click={click} className="text-fgp1/70 hover:text-fgp1/100">
          {title}
        </ClickDiv>
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
            .map((props, index) => (<CrumbSection key={props.title} first={index === 0} {...props} />)) :
          (<React.Fragment />)
        }
      </ol>
    </div>
  );
};

const ClickDiv = ({click, children, className}: ClickProps) => (
  (typeof click === 'string' || click instanceof String) ? (
    <Link to={click as string} className={className}>
      {children}
    </Link>
    ) : (
    <div onClick={click as (() => void)} className={cn("hover:cursor-pointer", className)}>
      {children}
    </div>
    )
);
