import React, { useCallback, useRef, useState, useEffect } from 'react';
import cn from 'classnames';
import api from '../api';
import debounce from 'lodash.debounce';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import {
  GetBoard, GetPost, GetQuestion, GetAnswer, GetThread,
  BoardRoute, ThreadRoute,
  GenericScry
} from '../types/quorum';
import { Plaque } from '../components/Plaque';
import { Strand } from '../components/Strand';
import { scryAll, fixupScry, fixupBoard, fixupPost } from '../utils';

// TODO: Clean up data types for `api.scry` type check (need to account
// for Urbit wrappers).

export const Splash = () => {
  const [boards, setBoards] = useState<GetBoard[]>([]);

  useEffect(() => {
    scryAll({path: '/what-boards'}).then(
      (boardLists: any[]) => {
        setBoards(boardLists.reduce((a: any[], n: any, i: number) =>
          a.concat(n.boards.map((b: any) => fixupBoard(b, i === 0))),
        []));
      }, (error: any) => {
        console.log(error);
      },
    );
  }, [/*boards*/]);

  return (
    <>
      {boards.map(board => (
        <Plaque key={board.name} content={board} host={api.ship as string}/>
      ))}
    </>
  )
}

export const Board = () => {
  const {planet, board} = useParams<BoardRoute>();
  const [questions, setQuestions] = useState<GetQuestion[]>([]);

  useEffect(() => {
    api.scry(fixupScry({path: `/all-questions/${board}`}, planet)).then(
      (result: any) => {
        setQuestions(result['questions'].map(fixupPost).map(
          (b: any) => ({...b, board: board})
        ));
      }, (error: any) => {
        console.log(error);
      },
    );
  }, [/*questions*/]);

  return (
    <>
      {questions.map(board => (
        <Plaque key={board.id} content={board} host={(planet as string).slice(1)}/>
      ))}
    </>
  )
}

export const Thread = () => {
  const {planet, board, tid} = useParams<ThreadRoute>();
  const [thread, setThread] = useState<GetThread>({
    best: -1,
    question: undefined,
    answers: [],
  });

  useEffect(() => {
    api.scry(fixupScry({path: `/thread/${board}/${tid}`}, planet)).then(
      (result) => (
        setThread({
          'question': fixupPost(result['question']) as GetQuestion,
          'answers': result['answers'].map(fixupPost),
          'best': result?.best || -1,
        })
      ),
      (err) => (console.log(err)),
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
