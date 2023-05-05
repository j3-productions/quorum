import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';


export default function NavBar({children}) {
  const navigate = useNavigate();
  const params = useParams();

  const [queryName, setQueryName] = useState<string>("");
  const onChange = (queryParam: string, setQueryParam: (s: string) => void) => (
    useCallback((event: ChangeEvent<HTMLInputElement>) => {
      const {value}: {value: string;} = event.target;
      setQueryParam(value.replace(/[^a-zA-Z0-9-_\.~]/g, ""));
    }, [queryParam, setQueryParam])
  );
  const onChangeName = onChange(queryName, setQueryName);

  const submitQuery = useCallback(() => {
    const basePath = ["query", "query", "page"].filter(s => s in params).fill("../").join("");
    if (queryName !== "") {
      navigate(`${basePath}search/${queryName}`, {relative: "path"});
      setQueryName("");
    }
  }, [navigate, params, queryName]);
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
    <nav className="w-full sticky top-0 z-20 p-2">
      <div className="flex flex-row gap-2">
        {children}
        <label className="relative flex w-full items-center">
          <span className="sr-only">Search Prefences</span>
          <span className="absolute inset-y-[5px] left-0 flex h-8 w-8 items-center pl-2 text-gray-400">
            <MagnifyingGlassIcon className="h-4 w-4 flip-y" />
          </span>
          <input
            className="input h-10 w-full bg-gray-50 pl-7 text-sm mix-blend-multiply placeholder:font-normal focus-within:mix-blend-normal dark:bg-white dark:mix-blend-normal md:text-base"
            placeholder="Search Boards"
            value={queryName}
            onChange={onChangeName}
            onKeyDown={onKeyDown}
          />
        </label>
      </div>
    </nav>
  );
}
