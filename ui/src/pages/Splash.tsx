import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import cn from 'classnames';
import debounce from 'lodash.debounce';
import { useNavigate, useParams } from 'react-router-dom';
import { SearchInput } from '../components/SearchInput';
import { Listings } from '../components/Listings';
import { BoardMeta } from '../types/quorum';
import api from '../api';
import { Paginator } from '../components/Paginator';
import { Plaque } from '../components/Plaque';
import { useTags } from '../state/tags';
import { useSearch } from '../state/search';
import { encodeLookup } from '../utils';

// TODO: Clean up imports
// TODO: Clean up data types for `api.scry` type check

export const Splash = () => {
  // `api.scry<ReturnType>`: template type is the return type for the function
  // {shelf-metadata: [{description: '', name: 'test'}, ...]}
  const [data, setData] = useState<BoardMeta[]>([]);

  useEffect(() => {
    // TODO: <BoardMetaData>
    api.scry({
      app: 'quorum-server',
      path: '/what-boards'
    }).then(
      (result) => (
        setData(result['shelf-metadata'].map((d: any) => (
          {
            ...d,
            author: '~zod',
            time: (new Date(2000, 2, 10)).getTime(),
            path: '/',
            uri: 'https://lh3.googleusercontent.com/a-/AOh14GgOm4If5lPzmRZoOk5yb2TN0twuiwzp0zeJiUZ3qw=k-s256'}
        )))
      ),
      (err) => (console.log(err)),
    );
  }, [data]);

  return (
    <>
      {data.map(b => (
        <Plaque key={b.name} content={b}/>
      ))}
    </>
  )
}
