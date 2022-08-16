import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import cn from 'classnames';
import debounce from 'lodash.debounce';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { SearchInput } from '../components/SearchInput';
import { Listings } from '../components/Listings';
import { ThreadRoute, BoardMeta, PostMeta } from '../types/quorum';
import api from '../api';
import { Paginator } from '../components/Paginator';
import { Plaque } from '../components/Plaque';
import { encodeLookup } from '../utils';

// TODO: Clean up imports
// TODO: Clean up data types for `api.scry` type check

export const Thread = () => {
  const { planet, name, tid } = useParams<ThreadRoute>();
  const [data, setData] = useState<PostMeta[]>([]);

  // `api.scry<ReturnType>`: template type is the return type for the function
  // data:
  useEffect(() => {
    // TODO: api.scry<PostMetaData[]>(...); real return is:
    //   {questions: PostMetaData[], date: number}
    api.scry({
      app: 'quorum-server',
      path: `/all-questions/${name}`,
    }).then(
      (result) => (setData(result['questions'].map(b => {
        b.votes = parseInt(b.votes.slice(1, b.votes.indexOf("i")));
        return {...b, board: name};
      }))),
      (err) => (console.log(err)),
    );
  }, [data]);

  return (
    <>
      {data.map(b => (
        <Plaque key={b.id} content={b}/>
      ))}
    </>
  )
}
