import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import cn from 'classnames';
import debounce from 'lodash.debounce';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { SearchInput } from '../components/SearchInput';
import { Listings } from '../components/Listings';
import { ThreadRoute, ThreadMeta } from '../types/quorum';
import api from '../api';
import { Paginator } from '../components/Paginator';
import { Strand } from '../components/Strand';
import { encodeLookup, fixupEntry } from '../utils';

// TODO: Clean up imports
// TODO: Clean up data types for `api.scry` type check

export const Thread = () => {
  const {planet, name, tid} = useParams<ThreadRoute>();
  const [data, setData] = useState<ThreadMeta>({
    answers: [],
    question: {
      id: parseInt(tid || "0"),
      date: 0,
      body: "",
      votes: 0,
      who: planet || "~zod",
      title: "",
      tags: [],
    },
  });

  // `api.scry<ReturnType>`: template type is the return type for the function
  // data:
  useEffect(() => {
    // TODO: api.scry<PostMetaData[]>(...); real return is:
    //   {questions: PostMetaData[], date: number}
    api.scry({
      app: 'quorum-server',
      path: `/thread/${name}/${tid}`,
    }).then(
      (result) => (setData({
        'question': fixupEntry(result['question']),
        'answers': result['answers'].map(fixupEntry),
      })),
      (err) => (console.log(err)),
    );
  }, [data]);

  // TODO: Render a strand first for the question, then for all answers
  // in order of descending vote total.
  return (
    <>
      <Strand key={data.question.id} content={data.question}/>
      {data.answers.map(a => (
        <Strand key={a.id} content={a}/>
      ))}
    </>
  )

  // return (
  //   <>
  //     {data.map(e => (
  //       <Plaque key={b.id} content={e}/>
  //     ))}
  //   </>
  // )
}
