import React, { useCallback, useRef, useState, useEffect } from 'react';
import cn from 'classnames';
import api from '../api';
import debounce from 'lodash.debounce';
import curry from 'lodash.curry';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import {
  GetBoard, GetBoardBad, GetPost, GetPostBad,
  GetQuestion, GetAnswer, GetThread,
  BoardRoute, ThreadRoute,
} from '../types/quorum';
import { Plaque } from '../components/Plaque';
import { Strand } from '../components/Strand';
import { Hero } from '../components/Hero';
import { fixupScry, fixupBoard, fixupPost } from '../utils';

export const Splash = () => {
  const [boards, setBoards] = useState<GetBoard[]>([]);
  const [populated, setPopulated] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([
      api.scry<any>({app: 'quorum-server', path: '/all-boards'}),
      api.scry<any>({app: 'quorum-client', path: '/whose-boards'}),
    ]).then(
      (results: any[]) => {
        const serverBoards: GetBoardBad[] = results[0].boards;
        const clientBoards: {host: string, boards: GetBoardBad[]}[] = results[1]['client-boards'];
        setBoards(([] as GetBoard[]).concat(
          serverBoards.map(curry(fixupBoard)(undefined)),
          ...clientBoards.map(({host, boards}) => boards.map(curry(fixupBoard)(`~${host}`))),
        ));
        setPopulated(true);
      }, (error: any) => {
        console.log(error);
      },
    );
  }, [/*boards*/]);

  return (populated && boards.length === 0) ? (
    <Hero content={"Welcome! Create or join a knowledge board by clicking the rightmost arrow in the navbar above."} />
  ) : (
    <>
      {boards.map(board => (
        <Plaque key={board.name} content={board}/>
      ))}
    </>
  );
}

export const Board = () => {
  const {planet, board} = useParams<BoardRoute>();
  const [questions, setQuestions] = useState<GetQuestion[]>([]);
  const [populated, setPopulated] = useState<boolean>(false);

  useEffect(() => {
    api.scry<any>(fixupScry(planet, {path: `/all-questions/${board}`})).then(
      (result: any) => {
        // FIXME: There are cases when modifying a remote question/answer
        // can cause a duplicate entry to be sent to the client with the
        // updates. This version will become perfunctory; we just need to
        // ignore it.
        // const questions: GetPostBad[] = [
        //   ...new Map(result.questions.map(q => [q.id, q])).values()
        // ];
        const questions: GetPostBad[] = result.questions;
        setQuestions(questions.map(
            curry(fixupPost)(planet)
          ).map(
            (b) => ({...b, board: board})
          ) as GetQuestion[]
        );
        setPopulated(true);
      }, (error: any) => {
        console.log(error);
      },
    );
  }, [/*questions*/]);

  return (populated && questions.length === 0) ? (
    <Hero content={"This board is empty! Add a question by clicking the rightmost arrow in the navbar above."} />
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

  useEffect(() => {
    api.scry<any>(fixupScry(planet, {path: `/thread/${board}/${tid}`})).then(
      (result: any) => {
        const question: GetPostBad = result.question;
        const answers: GetPostBad[] = result.answers;
        setThread({
          'question': fixupPost(planet, question) as GetQuestion,
          'answers': answers.map(curry(fixupPost)(planet)) as GetAnswer[],
          'best': result?.best || -1,
        });
      }, (error: any) => {
        console.log(error);
      },
    );
  }, [/*thread*/]);

  thread.answers.sort((a: GetAnswer, b: GetAnswer): number => {
    const isBest = (a: GetAnswer): number => +(a.id === thread.best);
    return isBest(b) - isBest(a) ||
      b.votes - a.votes ||
      b.date - a.date;
  });

  return !thread.question ? (<></>) : (
    <>
      <Strand key={thread.question.id} content={thread.question}
        thread={thread} setThread={setThread}/>
      {thread.answers.map(answer => (
        <Strand key={answer.id} content={answer}
          thread={thread} setThread={setThread}/>
      ))
      }
    </>
  )
}
