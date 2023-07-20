import React, { useState } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import {
  PlusIcon,
  Cross2Icon,
  Pencil1Icon,
  ResetIcon,
} from '@radix-ui/react-icons';


export interface BulkEditorOption {
  value: string;
  label: string;
}


export const BulkEditor = ({
  data,
  field,
  className,
}: {
  data: BulkEditorOption[];
  field: string;
  className?: string;
}) => {
  /* TODO: Make the container gap max-h-screen, min-h-??? (need to see
   * >=4 rows) */
  /* TODO: Add proper coloring to the tags. */
  //           <div className="line-clamp-1">
  //           </div>
  // TODO: Is is possible to embed a form specifically for adding new
  // entries?
  // TODO: Replicate 'input' styling across all tag entries

  // const [adds, setAdds] = useState([]);  // list of new tag names
  // const [dels, setDels] = useState([]);  // list of existing tag names to remove
  // const [mods, setMods] = useState([]);  // list of [old-name, new-name] mods
  const [adds, setAdds] = useState([
    {value: "tag-add", label: "#tag-add"},
  ]);
  const [dels, setDels] = useState([
    {value: "tag-del", label: "#tag-del"},
  ]);
  const [mods, setMods] = useState([
    [{value: "tag-4", label: "#tag-4"}, {value: "tag-mod", label: "#tag-mod"}],
  ]);

  // TODO: Sort based on label...? Perhaps accept a sorting function?
  const olds = data.filter(({value, label}) =>
    !adds.map(({value}) => value).includes(value)
    && !dels.map(({value}) => value).includes(value)
    && !mods.map(([{value}, _]) => value).includes(value)
  );

  return (
    <div className={cn("grid grid-cols-2 gap-x-2", className)}>
      <BulkEditorColumn title="Current" rows={olds.map(d =>
        <BulkEditorOldRow key={d.value} {...d} />
      )} />
      <BulkEditorColumn title="Edits" rows={(
        <React.Fragment>
          <label className="relative flex w-full items-center">
            <span className="absolute inset-y-[5px] left-0 flex items-center pl-2 text-gray-400">
              <PlusIcon className="h-4 w-4" />
            </span>
            <input
              className="input w-full bg-gray-50 pl-7 text-sm mix-blend-multiply placeholder:font-normal focus-within:mix-blend-normal dark:bg-white dark:mix-blend-normal md:text-base"
              placeholder="New Tag"
            />
          </label>
          {adds.map(d =>
            <BulkEditorAddRow key={d.value} {...d} />
          )}
          {dels.map(d =>
            <BulkEditorDelRow key={d.value} {...d} />
          )}
          {mods.map(([_, d]) =>
            <BulkEditorModRow key={d.value} {...d} />
          )}
        </React.Fragment>
      )} />
    </div>
  );
};

const BulkEditorColumn = ({
  title,
  rows,
  className,
}: {
  title: string;
  rows: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("card pt-0 pb-3 px-3 bg-gray-100", className)}>
      <h1 className="text-l font-semibold leading-10">
        {title}
      </h1>
      <div className="grid grid-rows-1 gap-y-3">
        {rows}
      </div>
    </div>
  );
};

const BulkEditorOldRow = ({value, label}: BulkEditorOption) => (
  <BulkEditorRow type="old" className="bg-blue-soft" children={
    <React.Fragment>
      <Cross2Icon onClick={() => console.log("old")} className="hover:cursor-pointer" />
      {label}
    </React.Fragment>
  } />
);
const BulkEditorAddRow = ({value, label}: BulkEditorOption) => (
  <BulkEditorRow type="add" className="bg-green-soft" children={
    <React.Fragment>
      <Cross2Icon onClick={() => console.log("add")} className="hover:cursor-pointer" />
      {label}
    </React.Fragment>
  } />
);
const BulkEditorDelRow = ({value, label}: BulkEditorOption) => (
  <BulkEditorRow type="del" className="bg-red-soft" children={
    <React.Fragment>
      <ResetIcon onClick={() => console.log("del")} className="hover:cursor-pointer" />
      {label}
    </React.Fragment>
  } />
);
const BulkEditorModRow = ({value, label}: BulkEditorOption) => (
  <BulkEditorRow type="mod" className="bg-blue-softer" children={
    <React.Fragment>
      <ResetIcon onClick={() => console.log("mod")} className="hover:cursor-pointer" />
      {label}
    </React.Fragment>
  } />
);

// <div className="line-clamp-1">
const BulkEditorRow = ({
  children,
  type,
  className,
}: {
  children: React.ReactNode;
  type: string;
  className?: string;
}) => {
  return (
    <code className={cn(`
        flex flex-row items-center w-full
        inline-block rounded text-gray-600 px-1.5
      `, className)}>
      {children}
    </code>
  );
};
