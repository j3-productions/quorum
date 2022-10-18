import React, { Component, KeyboardEventHandler, useCallback, useState } from 'react';
import cn from 'classnames';

import * as Select from '@radix-ui/react-select';
import {
  ActionMeta, components, ControlProps, OnChangeValue,
  MultiValue, MultiValueGenericProps, MultiValueRemoveProps
} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { CheckIcon, DotsVerticalIcon, XIcon } from '@heroicons/react/solid';
import { Pointer } from './Decals';
import * as Type from '../types/quorum';

// TODO: Make the placeholder text color a light gray, like all the other fields.

const createOption = (label: string) => ({
  label,
  value: label,
});

function Control({children, ...props}: ControlProps<Type.FieldOption, true>) {
  return (
    <components.Control
      {...props}
      className="flex items-center w-full py-1 px-2 bg-bgp2/30 rounded-lg border border-bgp2/30 cursor-text text-fgp1"
    >
      {children}
    </components.Control>
  );
}

function TagContainer({
  children,
  ...props
}: MultiValueGenericProps<Type.FieldOption, true>) {
  return (
    <components.MultiValueContainer {...props}>
      <div className="flex">{children}</div>
    </components.MultiValueContainer>
  );
}

function TagLabel({data}: {data: Type.FieldOption}) {
  const { value, label } = data;
  return (
    <div className="flex h-6 items-center rounded-l bg-bgs2 text-bgp1">
      <span className="p-1 font-semibold">{label || value}</span>
    </div>
  );
}

function TagRemove(props: MultiValueRemoveProps<Type.FieldOption, true>) {
  return (
    <components.MultiValueRemove {...props}>
      <div className="flex h-full items-center rounded-r bg-bgs2 pr-1">
        <XIcon className="h-4 w-4 text-bgp1" />
      </div>
    </components.MultiValueRemove>
  );
}

export const TagField = ({tags, onTags, className}: {
    tags: MultiValue<Type.FieldOption>;
    onTags: (tags: MultiValue<Type.FieldOption>) => void;
    className?: string;
  }) => {
  const [input, setInput] = useState('');

  const handleChange = useCallback((
    value: OnChangeValue<Type.FieldOption, true>,
    actionMeta: ActionMeta<Type.FieldOption>
  ) => {
    onTags(value);
  }, []);

  const handleInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback((event) => {
    if (!input) return;

    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setInput('');
        onTags([...tags, createOption(input)])
        event.preventDefault();
    }
  }, [input, tags]);

  return (
    <CreatableSelect<Type.FieldOption, true>
      className={className}
      components={{
        ...components,
        Control,
        MultiValueContainer: TagContainer,
        MultiValueLabel: TagLabel,
        MultiValueRemove: TagRemove,
        DropdownIndicator: null
      }}
      styles={{
        control: (base, state) => ({
          boxShadow: `var(--tw-ring-inset) 0 0 0 calc(${state.isFocused ? 2 : 0}px + var(--tw-ring-offset-width)) var(--tw-ring-color);`,
          '--tw-ring-color': '#657B83',
        }),
        input: (base) => ({
          ...base,
          padding: 0,
          margin: 0,
        }),
        clearIndicator: (base) => ({
          ...base,
          cursor: 'pointer',
          padding: 0
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: '',
          margin: '0 2px',
        }),
        multiValueRemove: (base) => ({
          ...base,
          paddingRight: '',
          paddingLeft: '',
          '&:hover': {
            color: 'inherit',
            backgroundColor: 'inherit',
          },
        }),
        valueContainer: (base) => ({
          ...base,
          padding: 0
        })
      }}
      isOptionDisabled={() => tags.length >= 8}
      inputValue={input}
      isClearable
      isMulti
      menuIsOpen={false}
      onChange={handleChange}
      onInputChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder="Type something and press tab or enter..."
      value={tags}
    />
  );
}

export const SelectField = ({options, selection, onSelection, className}: {
    options: Type.FieldOption[];
    selection: string;
    onSelection: (value: string) => void;
    className?: string;
  }) => {
  const FilterItem = ({label, value}: Type.FieldOption) => (
    <Select.Item value={value} className="cursor-pointer select-none relative py-2 pl-3 pr-9 focus:outline-none focus:ring-1 focus:ring-bgs1 font-semibold">
      <Select.ItemText>{label}</Select.ItemText>
      <Select.ItemIndicator className="absolute inset-y-0 right-0 flex items-center pr-4">
        <CheckIcon className="h-5 w-5" />
      </Select.ItemIndicator>
    </Select.Item>
  );

  // FIXME: This is a bit clumsy (options as `{value: label}` would be
  // way cleaner), but demanded in order to make the `Type.FieldOption`
  // interface uniform.
  const label: string = options.filter(({label, value}) => value === selection)[0].label;
  // FIXME: Improve the behavior of mobile by shortening the displayed
  // selection value when the screen size is sm.
  // const smlabel: string = `${label.split(" ")[0]}+`;
  return (
    <div className={className}>
      <Select.Root value={selection} onValueChange={onSelection}>
        <span className="sr-only font-semibold">Filter Type</span>
        <Select.Trigger className="bg-bgp2/30 flex justify-between w-full font-semibold border border-bgp2/30 rounded-lg pl-3 pr-2 py-1.5 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-bgs1 focus:border-bgs1 sm:text-sm">
          <Select.Value>{label}</Select.Value>
          <Select.Icon asChild>
            {/*FIXME: This causes a weird React error about 'forwardRef'. */}
            {/*<Pointer className="h-5 w-5" />*/}
            <div className='flex justify-center'>
              <svg className="h-5 w-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path className="fill-fgp1" fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </Select.Icon>
        </Select.Trigger>
        <Select.Content className="z-10 w-full bg-bgp2 max-h-60 rounded-md py-1 text-base ring-1 ring-bgs1 ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <Select.Viewport>
            {options.map(opt => (
              <FilterItem key={opt.value} {...opt} />)
            )}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </div>
  );
}
