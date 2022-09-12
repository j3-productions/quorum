import { SearchIcon } from '@heroicons/react/solid';
import cn from 'classnames';
import React, { ChangeEvent, useCallback } from 'react';

interface SearchInputProps {
  lookup: string;
  className?: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ lookup, className, onChange }: SearchInputProps) => {
  const onInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    onChange(value);
  }, [onChange]);

  return (
    <div className={cn('relative flex items-center', className)}>
      <SearchIcon className='flip-y absolute left-2 h-5 w-5' />
      <input
        type='text'
        value={lookup}
        onChange={onInput}
        placeholder="Search"
        className={cn('w-full py-1 pl-9 pr-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30')}
      />
    </div>
  )
}
