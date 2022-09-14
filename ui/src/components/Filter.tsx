import React from 'react';
import * as Select from '@radix-ui/react-select';

interface FilterItemProps {
  title: string;
}

const FilterItem = ({ title }: FilterItemProps) => {
  return (
    <Select.Item value={title} className="text-fgp1 cursor-default select-none relative py-2 pl-3 pr-9 focus:outline-none focus:ring-1 focus:ring-bgs1 font-semibold">
      <Select.ItemText>{title}</Select.ItemText>
      <Select.ItemIndicator className="text-bgs1 absolute inset-y-0 right-0 flex items-center pr-4">
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </Select.ItemIndicator>
    </Select.Item>
  )
}

const filters: string[] = ['create', 'join'];

interface FilterProps<T extends string> {
  selected: T;
  onSelect: (value: T) => void;
  showAll?: boolean;
  className?: string;
}

export function Filter<T extends string>({ selected, onSelect, className, showAll = true }: FilterProps<T>) {
  const options = showAll ? filters : filters.filter(f => f === 'all');
  return (
    <div className={className}>
      <Select.Root value={selected} onValueChange={onSelect}>
        <span className="sr-only">Filter Type</span>
        <Select.Trigger className="bg-bgp1 flex justify-between w-full font-semibold border border-bgp2/30 rounded-lg shadow-sm pl-3 pr-2 py-1.5 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-bgs1 focus:border-bgs1 sm:text-sm">
          <Select.Value>%{selected}</Select.Value>
          <Select.Icon asChild>
            <svg className="h-5 w-5 text-bgs1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Select.Icon>
        </Select.Trigger>
        <Select.Content className="z-10 w-full bg-bgp1 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-bgs1 ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <Select.Viewport>
            {options.map(f => (
              <FilterItem key={f} title={f} />
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </div>
  )
}
