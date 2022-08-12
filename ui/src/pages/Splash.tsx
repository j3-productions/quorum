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
  const [data, setData] = useState<BoardMeta[]>([]);

  useEffect(() => {
    // TODO: api.scry<BoardMetaData[]>(...); real return is:
    //   {boards: BoardMetaData[], date: number}
    // TODO: prevent polling by using data cacher (see sphinx)
    api.scry({
      app: 'quorum-server',
      path: '/what-boards'
    }).then(
      (result) => (setData(result['boards'])),
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
