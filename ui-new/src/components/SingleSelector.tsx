import React, { useEffect, useState } from 'react';
import { Cross2Icon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Select, {
  components,
  ControlProps,
  OptionProps,
  MenuProps,
  MenuListProps,
  InputProps,
  MultiValueRemoveProps,
  MultiValueGenericProps,
  MultiValue,
  ActionMeta,
  GroupBase,
  SingleValue,
  ValueContainerProps,
  ClearIndicatorProps,
  InputActionMeta,
} from 'react-select';


export interface Option {
  value: string;
  label: string;
}

interface SingleSelectorProps {
  options: Option[];
  setOptions: (options: Option[]) => void;
  isClearable?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  inputProps?: InputProps<Option, true>;
  className?: string;
}


export default function SingleSelector({
  options,
  setOptions,
  isClearable = false,
  isLoading = false,
  placeholder = '',
  autoFocus = true,
  inputProps = {},
  value,
  onChange,
  className,
  inputRef,
  ...extraProps
}: SingleSelectorProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      isClearable={isClearable}
      isLoading={isLoading}
      autoFocus={autoFocus}
      options={options}
      className={className}
      innerRef={inputRef}
      menuShouldScrollIntoView={false}
      hideSelectedOptions={true}
      styles={{
        control: (base) => ({}),
        menu: ({ width, borderRadius, ...base }) => ({
          ...base,
          borderWidth: '',
          borderColor: '',
          zIndex: 50,
          backgroundColor: 'inherit',
        }),
        input: (base) => ({
          ...base,
          margin: '',
          color: '',
          paddingTop: '',
          paddingBottom: '',
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused
            ? 'rgb(var(--colors-gray-50))'
            : '',
        }),
        valueContainer: (base) => ({
          ...base,
          padding: '0px',
        }),
      }}
      components={{
        Control,
        Menu,
        MenuList,
        Input,
        ClearIndicator,
        LoadingIndicator,
        NoOptionsMessage,
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
      {...extraProps}
    />
  );
}


function Control({ children, ...props }: ControlProps<Option, true>) {
  return (
    <components.Control
      {...props}
      className="input cursor-text items-center text-gray-800"
    >
      {children}
    </components.Control>
  );
}

function Menu({ children, ...props }: MenuProps<Option, true>) {
  return (
    <components.Menu
      className="rounded-lg outline outline-0 outline-gray-100 dark:outline-2"
      {...props}
    >
      {children}
    </components.Menu>
  );
}

function MenuList({
  children,
  ...props
}: MenuListProps<Option, true>) {
  return (
    <components.MenuList
      className="hide-scroll rounded-lg bg-white p-2"
      {...props}
    >
      {children}
    </components.MenuList>
  );
}

function Input({ children, ...props }: InputProps<Option, true>) {
  return (
    <components.Input className="py-0.5 text-gray-800" {...props}>
      {children}
    </components.Input>
  );
}

function ClearIndicator({ ...props }: ClearIndicatorProps<Option, true>) {
  const clearValue = () => {
    props.clearValue();
    // reset state in parent
    // @ts-expect-error we passed an extra prop to selectProps
    if (props.selectProps.onClear) {
      // @ts-expect-error we passed an extra prop to selectProps
      props.selectProps.onClear();
    }
  };

  const innerProps = {
    ...props.innerProps,
    onMouseDown: clearValue,
    onTouchEnd: clearValue,
  };

  return (
    <span {...innerProps} className="cursor-pointer">
      <Cross2Icon className="h-4 w-4" />
    </span>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex justify-center">
      <svg className="animate-spin w-6 h-6 stroke-stone-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
        <circle className="stroke-stone-900" cx="16" cy="16" r="13" strokeWidth="2"/>
        <path className="fill-stone-900" d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" />
      </svg>
    </div>
  );
}

function NoOptionsMessage() {
  // FIXME: Add generic title here for no options.
  return (
    <div className="flex content-center space-x-1 px-2 py-3">
      <ExclamationTriangleIcon className="mr-2 w-6 h-6 text-gray-300" />
      <span className="italic">
        This is not a known or valid group name.
      </span>
    </div>
  );
}
