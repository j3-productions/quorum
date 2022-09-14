import React, { useCallback, useRef, useState } from 'react';
import cn from 'classnames';
import api from '../api';
import debounce from 'lodash.debounce';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { SearchInput } from '../components/SearchInput';
import { Listings } from '../components/Listings';
import { PostFilter, Remove, Search as SearchType } from '../types/sphinx';
import { Paginator } from '../components/Paginator';
import { Filter } from '../components/Filter';
import { PlusSmIcon } from '@heroicons/react/solid';
import { TagCloud } from '../components/TagCloud';
import { useTags } from '../state/tags';
import { useSearch } from '../state/search';
import { SearchRoute } from '../types/quorum';
import { encodeLookup } from '../utils';

export const Search = () => {
  const navigate = useNavigate();
  const {
    lookup,
    limit,
    page
  } = useParams<SearchRoute>();
  const [selected, setSelected] = useState<PostFilter>('all')
  const [rawSearch, setRawSearch] = useState(lookup || '');

  const {
    size,
    start,
    pageInt,
    pages,
    results,
    linkBuild
  } = useSearch({
    key: (start, size) => `lookup-${selected}-${size}-${start}-${lookup}`,
    fetcher: (start, size) => api.scry<SearchType>({
      app: 'sphinx',
      path: `/lookup/${selected}/${start}/${size}/${encodeLookup(lookup)}`
    }),
    enabled: !!lookup,
    limit,
    page,
    linkPrefix: `/search/${lookup}`
  });
  const tags = useTags();
  const queryClient = useQueryClient();
  const { mutate } = useMutation((hash: string) => {
    return api.poke<Remove>({
      app: 'sphinx',
      mark: 'remove',
      json: hash
    })
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries(`lookup-${selected}-${size}-${start}-${lookup}`)
    }
  });

  const update = useRef(debounce((value: string) => {
    if (!value) {
      return;
    }

    navigate(`/search/${value}/${size}/${page || '1'}`)
  }, 400))

  const onChange = useCallback((value: string) => {
    setRawSearch(value);
    update.current(value);
  }, []);

  return (
    <div className={cn('w-full space-y-6', !lookup && 'm-auto')}>
      <header className='flex items-center space-x-2'>
        <SearchInput className='flex-1' lookup={rawSearch} onChange={onChange} />
      </header>
      {lookup && results && <div className='flex justify-end border-t border-zinc-300'>
        <Paginator pages={pages} currentPage={pageInt} linkBuilder={linkBuild} />
      </div>}
      {lookup && <Listings listings={results.listings} remove={mutate} />}
      {!lookup && (
        <div className='space-y-2'>
          <h2 className='font-semibold'>top tags</h2>
          <TagCloud tags={tags.slice(0,12)} />
        </div>
      )}
      {results && pages > 1 && <div className='flex justify-end border-t border-zinc-300'>
        <Paginator pages={pages} currentPage={pageInt} linkBuilder={linkBuild} />
      </div>}
    </div>
  )
}
