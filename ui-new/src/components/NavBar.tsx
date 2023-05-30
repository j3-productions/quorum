import React, { ChangeEvent, KeyboardEvent, useState, useCallback } from 'react';
import cn from 'classnames';
import { stringToTa } from "@urbit/api";
import { useNavigate, useParams } from "react-router-dom";
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';


export default function NavBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();
  const params = useParams();

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const {value}: {value: string;} = event.target;
    setQuery(value);
  }, [query]);
  const submitQuery = useCallback(() => {
    const basePath = ["query", "query", "page"].filter(s => s in params).fill("../").join("");
    if (query !== "") {
      const encodedQuery = stringToTa(query).replace('~.', '~~');
      navigate(`${basePath}search/${encodedQuery}`, {relative: "path"});
    }
  }, [navigate, params, query]);
  const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") {
      event.preventDefault();
      submitQuery();
    }
  }, [submitQuery]);
  const onSubmit = useCallback(() => {
    submitQuery();
  }, [submitQuery]);

  return (
    <nav className={cn(className, "w-full sticky top-0 z-20 p-2")}>
      <div className="flex flex-row gap-2">
        {children}
        <label className="relative flex w-full items-center">
          <span className="sr-only">Search Prefences</span>
          <span className="absolute inset-y-[5px] left-0 flex h-8 w-8 items-center pl-2 text-gray-400">
            <MagnifyingGlassIcon className="h-4 w-4 flip-y" />
          </span>
          <input
            className={`
              input h-10 w-full bg-gray-50 pl-7 text-sm
              mix-blend-multiply placeholder:font-normal focus-within:mix-blend-normal
              dark:bg-white dark:mix-blend-normal md:text-base
            `}
            placeholder={`Search ${params?.chName ? "This Board" : "All Boards" }`}
            value={query}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        </label>
      </div>
    </nav>
  );
}
