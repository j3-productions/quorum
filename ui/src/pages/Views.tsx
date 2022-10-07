import React, { useCallback, useRef, useState, useEffect } from 'react';
import api from '../api';
import curry from 'lodash.curry';
import { useParams } from 'react-router-dom';
import { Plaque } from '../components/Plaque';
import { Strand } from '../components/Strand';
import { Hero, ErrorBoundary, EmptyBoundary } from '../components/Sections';
import { Spinner, Failer } from '../components/Decals';
import {
  GetBoard, GetPost, GetPostBad,
  GetQuestion, GetQuestionBad, GetAnswer, GetThread, GetSearchResult,
  BoardRoute, ThreadRoute, SearchRoute,
} from '../types/quorum';
import { apiScry, useApiState, fixupPost } from '../utils';

///////////////////////////
/// Component Functions ///
///////////////////////////

export const Splash = () => {
  const [boards] = useApiState(() =>
    apiScry<any>('/boards').then(
      (result: any) =>
        (result['all-boards'] as GetBoardProps[]).reduce(
          (l, {host, boards}) => l.concat(boards.map(b => ({...b, host: `~${host}`}))),
        [] as GetBoard[])
    )
  );

  const Boards = genViewComponent(
    (boards: any) => (
      <React.Fragment>
        {boards.map((board: GetBoard) => (
          <Plaque key={board.name} content={board}/>
        ))}
      </React.Fragment>),
    (boards: any[]) => (boards.length === 0),
    "Create or join a knowledge board using the navbar above.",
  );

  return (
    <StandardView>
      <Boards fetch={boards} />
    </StandardView>
  );
}

export const Search = () => {
  const {planet, board, lookup} = useParams<SearchRoute>();
  const [entries, setEntries] = useApiState((planet, board, lookup) =>
    apiScry<any>(`/search/${planet}/${board}/${lookup}`).then(
      (result: any) => {
        const results: GetSearchResult[] = (result.search as GetSearchResult[]).map(
          ({host, ...data}) => ({host: `~${host}`, ...data})
        );
        const queryTids: number[] = results.map(({id, ...data}) => id);
        return (results.length === 0) ? [] :
          apiScry<any>(`/questions/${planet}/${board}`).then(
            (result: any) =>
              (result.questions as GetQuestionProps[]).
                map(({question, tags}) => ({...question, tags: tags, board: board})).
                map(curry(fixupPost)(planet)).
                filter(({id, ...data}) => queryTids.includes(id)) as GetQuestion[]
          )
      }
    )
  , planet, board, lookup);
  // TODO: These lines ensure that the `Search` component is updated when
  // subsequent queries are input. Ideally, 'useApiState' would just see that
  // the relevant params were updated and perform an auto-update, but alas.
  useEffect(() => setEntries(planet, board, lookup), [planet, board, lookup]);

  const Entries = genViewComponent(
    (entries: any) => (
      <React.Fragment>
        {entries.map((entry: GetQuestion) => (
          <Plaque key={entry.id} content={entry} />
        ))}
      </React.Fragment>),
    (entries: any[]) => (entries.length === 0),
    "Search yielded no results!",
  );

  return (
    <StandardView>
      <Entries fetch={entries} />
    </StandardView>
  );
}

export const Board = () => {
  const {planet, board} = useParams<BoardRoute>();
  const [questions] = useApiState(() =>
    apiScry<any>(`/questions/${planet}/${board}`).then(
      (result: any) =>
        (result.questions as GetQuestionProps[]).
          map(({question, tags}) => ({...question, tags: tags, board: board})).
          map(curry(fixupPost)(planet)) as GetQuestion[]
    )
  );

  const Questions = genViewComponent(
    (questions: any) => (
      <React.Fragment>
        {questions.map((entry: GetQuestion) => (
          <Plaque key={entry.id} content={entry} />
        ))}
      </React.Fragment>),
    (questions: any[]) => (questions.length === 0),
    "Search yielded no results!",
  );

  return (
    <StandardView>
      <Questions fetch={questions} />
    </StandardView>
  );
}

export const Thread = () => {
  const {planet, board, tid} = useParams<ThreadRoute>();
  const [thread, setThread] = useState<GetThread>({
    best: -1,
    question: undefined,
    answers: [],
  });
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    apiScry<any>(`/thread/${planet}/${board}/${tid}`).then(
      (result: any) => {
        const question: GetPostBad = result.question;
        const answers: GetPostBad[] = result.answers;
        setThread({
          'question': {...fixupPost(planet, question), tags: result.tags} as GetQuestion,
          'answers': answers.map(curry(fixupPost)(planet)) as GetAnswer[],
          'best': result?.best || -1,
        });
        setMessage("Thread load successful!");
      }, (error: any) => {
        console.log(error);
        setMessage(`Unable to load content for thread thread:${tid}!`);
      },
    );
  }, [/*thread*/]);

  thread.answers.sort((a: GetAnswer, b: GetAnswer): number => {
    const isBest = (a: GetAnswer): number => +(a.id === thread.best);
    return isBest(b) - isBest(a) ||
      b.votes - a.votes ||
      b.date - a.date;
  });

  return !thread.question ? (
      (message === "") ?
        (<Spinner className='w-24 h-24' />) :
        (<Hero>{message}</Hero>)
    ) : (
      <>
        <Strand key={thread.question.id} content={thread.question}
          qauthor={thread.question?.who} thread={thread} setThread={setThread}/>
        {thread.answers.map(answer => (
          <Strand key={answer.id} content={answer}
            qauthor={thread.question?.who} thread={thread} setThread={setThread}/>
        ))
        }
      </>
  );
}

////////////////////////////
// Helper Types/Functions //
////////////////////////////

interface GetBoardProps {
  boards: Omit<GetBoard, 'host'>[];
  host: string;
}

interface GetQuestionProps {
  question: GetQuestionBad;
  tags: string[];
}

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

const genViewComponent = (
    render: (d: any) => React.ReactNode,
    isEmpty: (d: any) => boolean, // TODO: Use default of 'length === 0'
    emptyMessage?: string) => {
  return useCallback(({fetch}) => {
    const data: any = fetch();
    return (
      <EmptyBoundary fallback={<Hero>{emptyMessage || "No content!"}</Hero>}>
        {!isEmpty(data) && render(data)}
      </EmptyBoundary>
    );
  }, []);
}
