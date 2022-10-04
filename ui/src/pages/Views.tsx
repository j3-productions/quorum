import React, { useCallback, useRef, useState, useEffect } from 'react';
import api from '../api';
import curry from 'lodash.curry';
import { useParams } from 'react-router-dom';
import { Plaque } from '../components/Plaque';
import { Strand } from '../components/Strand';
import { Hero, Spinner } from '../components/Decals';
import {
  GetBoard, GetPost, GetPostBad,
  GetQuestion, GetAnswer, GetThread, GetSearchResult,
  BoardRoute, ThreadRoute, SearchRoute,
} from '../types/quorum';
import { fixupPost } from '../utils';

export const Splash = () => {
  const [boards, setBoards] = useState<GetBoard[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    api.scry<any>({app: 'quorum-agent', path: '/boards'}).then(
      (result: any) => {
        const scryBoards: GetBoard[] = ([] as GetBoard[]).concat(
          ...result['all-boards'].map(
            ({host, boards}: {host: string, boards: Omit<GetBoard, 'host'>[]}) =>
              boards.map((board) => ({...board, host: `~${host}`}))
          )
        );

        setBoards(scryBoards);
        setMessage((boards.length > 0) ? "" :
          "Welcome! Create or join a knowledge board using the navbar above.");
      }, (error: any) => {
        console.log(error);
        setMessage("Unable to load knowledge boards!");
      },
    );
  }, [/*boards*/]);

  return (boards.length === 0) ? (
      (message === "") ?
        (<Spinner className='w-24 h-24' />) :
        (<Hero content={message} />)
    ) : (
      <>
        {boards.map(board => (
          <Plaque key={board.name} content={board}/>
        ))}
      </>
  );
}

export const Search = () => {
  const {board, lookup} = useParams<SearchRoute>();
  const [entries, setEntries] = useState<GetQuestion[]>([]);
  const [message, setMessage] = useState<string>('');

  // FIXME: Return to this when the 'search' endpoint is working.
  useEffect(() => {
    if(entries.length !== 0) { setEntries([]); }
    if(message !== "") { setMessage(""); }
    api.scry<any>({app: 'quorum-agent', path: `/search/${board}/${lookup}`}).then(
      (result: any) => {
        const results: GetSearchResult[] = (result.search as GetSearchResult[]).map(
          ({host, ...data}) => ({host: `~${host}`, ...data})
        );
        if(results.length === 0) {
          setMessage("Search yielded no results! Please try generalizing your query.");
        } else {
          const planet: string = results[0].host;
          const queryTids: number[] = results.map(({id, ...data}) => (id));
          api.scry<any>({app: 'quorum-agent', path: `/questions/${planet}/${board}`}).then(
            (result: any) => {
              const questions: GetQuestion[] = result.questions.
                map(curry(fixupPost)(planet)).
                map((b: any) => ({...b, board: board}));
              setEntries(questions.filter(({id, ...data}) => (
                queryTids.includes(id)
              )));
              setMessage("");
            }, (error: any) => {
              console.log(error);
              setMessage(`Unable to load results for query '${board}?${lookup}'!`);
            },
          );
        }
      }, (error: any) => {
        console.log(error);
        setMessage(`Unable to load results for query '${board}?${lookup}'!`);
      },
    );
  }, [board, lookup]);

  return (entries.length === 0) ? (
      (message === "") ?
        (<Spinner className='w-24 h-24' />) :
        (<Hero content={message} />)
    ) : (
      <>
        {entries.map(entry => (
          <Plaque key={entry.id} content={entry} />
        ))}
      </>
  );
}

export const Board = () => {
  const {planet, board} = useParams<BoardRoute>();
  const [questions, setQuestions] = useState<GetQuestion[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    api.scry<any>({app: 'quorum-agent', path: `/questions/${planet}/${board}`}).then(
      (result: any) => {
        const questions: {question: GetPostBad; tags: string[];}[] = result.questions;
        setQuestions(questions.map(
            ({question, tags}) => ({...question, tags: tags, board: board})
          ).map(
            curry(fixupPost)(planet)
          ) as GetQuestion[]
        );
        setMessage((questions.length > 0) ? "" :
          "This board is empty! Add a question by clicking the rightmost arrow in the navbar above.");
      }, (error: any) => {
        console.log(error);
        setMessage(`Unable to load questions for board ${planet}:${board}!`);
      },
    );
  }, [/*questions*/]);

  return (questions.length === 0) ? (
      (message === "") ?
        (<Spinner className='w-24 h-24' />) :
        (<Hero content={message} />)
    ) : (
      <>
        {questions.map(board => (
          <Plaque key={board.id} content={board} />
        ))}
      </>
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
    api.scry<any>({app: 'quorum-agent', path: `/thread/${planet}/${board}/${tid}`}).then(
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
        (<Hero content={message} />)
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
