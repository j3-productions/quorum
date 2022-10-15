import React, { useCallback, useRef, useState, useEffect } from 'react';
import api from '../api';
import curry from 'lodash.curry';
import { useParams } from 'react-router-dom';
import { Plaque } from '../components/Plaque';
import { Strand } from '../components/Strand';
import { Hero, ErrorBoundary, EmptyBoundary } from '../components/Sections';
import { Spinner, Failer } from '../components/Decals';
import { apiScry, apiPoke, useFetch, fixupPost } from '../utils';
import * as QAPI from '../state/quorum';
import * as Type from '../types/quorum';

///////////////////////////
/// Component Functions ///
///////////////////////////

export const Splash = () => {
  const [boards] = useFetch<Type.Board[]>(QAPI.getBoards);

  const Boards = makeViewComponent<Type.Board[]>(
    (boards) => (
      <React.Fragment>
        {boards.map(b => (<Plaque key={`${b.host}/${b.name}`} content={b}/>))}
      </React.Fragment>
    ),
    (boards) => (boards.length === 0),
    "Create or join a knowledge board using the navbar above.",
  );

  return (
    <StandardView>
      <Boards fetch={boards} />
    </StandardView>
  );
}

export const Board = () => {
  const {planet, board} = useParams<Type.BoardRoute>();
  const [questions, setQuestions] = useFetch<Type.Question[], [ustring, ustring]>(
    QAPI.getQuestions, planet, board);

  const Questions = makeViewComponent<Type.Question[]>(
    (questions) => (
      <React.Fragment>
        {questions.map(e => (<Plaque key={e.id} content={e} />))}
      </React.Fragment>
    ),
    (questions) => (questions.length === 0),
    "Create this board's first question using the navbar above.",
  );

  return (
    <StandardView>
      <Questions fetch={questions} />
    </StandardView>
  );
}

export const Thread = () => {
  const {planet, board, tid} = useParams<Type.ThreadRoute>();
  const [thread, setThread] = useFetch<Type.Thread, [Type.SetThreadAPI, unumber]>(
    QAPI.getThread(planet, board, tid), 'set-best', undefined);

  const QuestionAndAnswers = makeViewComponent<Type.Thread>(
    (thread) => (
      <React.Fragment>
        <Strand key={thread.question.id} content={thread.question}
          thread={thread} setThread={setThread}/>
        {thread.answers.map(answer => (
          <Strand key={answer.id} content={answer}
            thread={thread} setThread={setThread}/>
        ))}
      </React.Fragment>
    ),
  );

  return (
    <StandardView>
      <QuestionAndAnswers fetch={thread} />
    </StandardView>
  );
}

export const Search = () => {
  const {planet, board, lookup} = useParams<Type.SearchRoute>();
  const [entries, setEntries] = useFetch<Type.Question[], [ustring, ustring, ustring]>(
    QAPI.getSearch, planet, board, lookup);
  // FIXME: Necessary because 'useFetch' doesn't auto-update when params change.
  useEffect(() => setEntries(planet, board, lookup), [planet, board, lookup]);

  const Entries = makeViewComponent<Type.Question[]>(
    (entries) => (
      <React.Fragment>
        {entries.map(e => (<Plaque key={e.id} content={e} />))}
      </React.Fragment>
    ),
    (entries) => (entries.length === 0),
    "Search yielded no results!",
  );

  return (
    <StandardView>
      <Entries fetch={entries} />
    </StandardView>
  );
}

//////////////////////
// Helper Functions //
//////////////////////

type ustring = Type.U<string>;
type unumber = Type.U<number>;

const GenericView = ({children, error, suspense, ...props}: {
    children: React.ReactNode;
    error: React.ReactNode;
    suspense: NonNullable<React.ReactNode>;
  }) => (
  <ErrorBoundary fallback={error} {...props}>
    <React.Suspense fallback={suspense}>
      {children}
    </React.Suspense>
  </ErrorBoundary>
);

const StandardView = ({children, ...props}: {
    children: React.ReactNode;
  }) => (
  <GenericView
      error={<Failer className='w-24 h-24' />}
      suspense={<Spinner className='w-24 h-24' />}
      {...props}>
    {children}
  </GenericView>
);

export function makeViewComponent<ResponseType>(
    render: (d: ResponseType) => React.ReactNode,
    isEmpty?: (d: ResponseType) => boolean,
    emptyMessage?: string,
  ) {
  return useCallback(({fetch}: Type.FetchFxn<ResponseType>) => {
    const data: ResponseType = fetch();
    return (
      <EmptyBoundary fallback={<Hero>{emptyMessage || "No content!"}</Hero>}>
        {(!isEmpty || !isEmpty(data)) && render(data)}
      </EmptyBoundary>
    );
  }, []);
}
