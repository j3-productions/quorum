import React, { useCallback, useRef, useState, useEffect } from 'react';
import api from '../api';
import curry from 'lodash.curry';
import { useParams } from 'react-router-dom';
import { Plaque } from '../components/Plaque';
import { Strand } from '../components/Strand';
import { Hero, ErrorBoundary, EmptyBoundary } from '../components/Sections';
import { Spinner, Failer } from '../components/Decals';
import { apiScry, apiPoke, useFetch, fixupPost } from '../utils';
import * as Type from '../types/quorum';

///////////////////////////
/// Component Functions ///
///////////////////////////

export const Splash = () => {
  const [boards] = useFetch<Type.Board[]>(() =>
    apiScry<Type.ScryBoard>('/boards').then(
      ({'all-boards': result}: Type.ScryBoard) =>
        result.reduce(
          (l, {host, boards}) => l.concat(boards.map(b => ({...b, host: `~${host}`}))),
          [] as Type.Board[],
        )
    )
  );

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
  const [questions] = useFetch<Type.Question[]>(() =>
    apiScry<Type.ScryQuestions>(`/questions/${planet}/${board}`).then(
      ({questions: result}: Type.ScryQuestions) =>
        result
          .map(({question: q, tags: ts}) => ({...q, tags: ts, board: board}))
          .map(curry(fixupPost)(planet)) as Type.Question[]
    )
  );

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
  const [thread, setThread] = useFetch<Type.Thread, [Type.SetThreadAPI, U<number>]>(
    (setType: Type.SetThreadAPI, setTid?: number) =>
      (!setTid ?
        new Promise(resolve => resolve(0)) :
        apiPoke<any>({ json: { dove: {
          host: planet,
          name: board,
          mail: setType.match(/.*-best$/) ? {
            'set-best': {
              name: board,
              'post-id': (setType === 'set-best') ? setTid : 0,
              'thread-id': parseInt(tid || "0"),
            },
          } : {
            vote: {
              name: board,
              sing: (setType === 'vote-up') ? 'up' : 'down',
              'post-id': setTid,
              'thread-id': parseInt(tid || "0"),
            },
          }
        }}})
      ).then(
        // FIXME: Subscription-based data takes a bit longer to come back,
        // so we just wait a bit. This should be removed and replaced with
        // a more reliable check on incoming subscription data.
        (result: any) =>
          new Promise(resolve => {setTimeout(resolve, setTid ? 2000 : 0);})
      ).then(
        (result: any) =>
          apiScry<Type.ScryThread>(`/thread/${planet}/${board}/${tid}`)
      ).then(
        ({question, tags, answers, best}: Type.ScryThread) => {
          const bestTid: number = best || 0;
          const isBestTid = (a: Type.Answer): number => +(a.id === bestTid);
          return {
            best: bestTid,
            question: {...fixupPost(planet, question), tags: tags} as Type.Question,
            answers: answers
              .map(curry(fixupPost)(planet))
              .sort((a, b) => (
                isBestTid(b) - isBestTid(a) ||
                b.votes - a.votes ||
                b.date - a.date
              )),
          };
        }
      )
  , 'set-best', undefined);

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
  const [entries, setEntries] = useFetch<Type.Question[], [U<string>, U<string>, U<string>]>(
    (planet, board, lookup) =>
      apiScry<Type.ScrySearch>(`/search/${planet}/${board}/${lookup}`).then(
        ({search: result}: Type.ScrySearch) => {
          result = result.map(({host, ...data}) => ({host: `~${host}`, ...data}));
          const queryTids: number[] = result.map(({id, ...data}) => id);
          return (result.length === 0) ? [] :
            apiScry<Type.ScryQuestions>(`/questions/${planet}/${board}`).then(
              ({questions: result}: Type.ScryQuestions) =>
                result
                  .map(({question: q, tags: ts}) => ({...q, tags: ts, board: board}))
                  .map(curry(fixupPost)(planet))
                  .filter(({id, ...data}) => queryTids.includes(id)) as Type.Question[]
            )
        }
      )
  , planet, board, lookup);
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

type U<T> = Type.U<T>;

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
  return useCallback(({fetch}: {fetch: Type.DataOrModifiedFxn<ResponseType>;}) => {
    const data: ResponseType = fetch();
    return (
      <EmptyBoundary fallback={<Hero>{emptyMessage || "No content!"}</Hero>}>
        {(!isEmpty || !isEmpty(data)) && render(data)}
      </EmptyBoundary>
    );
  }, []);
}
