import React, { useCallback, useRef, useState, useEffect } from 'react';
import cn from 'classnames';
import api from '../api';
import debounce from 'lodash.debounce';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import {
  GetBoard, GetPost, GetQuestion, GetAnswer, GetThread,
  BoardRoute, ThreadRoute
} from '../types/quorum';
import { Plaque } from '../components/Plaque';
import { Strand } from '../components/Strand';
import { fixupPost } from '../utils';

// TODO: Clean up data types for `api.scry` type check (need to account
// for Urbit wrappers).

export const Splash = () => {
  const [boards, setBoards] = useState<GetBoard[]>([]);

  useEffect(() => {
    api.scry({
      app: 'quorum-server',
      path: '/what-boards',
    }).then(
      (result) => (setBoards(result['boards'])),
      (err) => (console.log(err)),
    );
  }, [/*boards*/]);

  return (
    <>
      {boards.map(board => (
        <Plaque key={board.name} content={board}/>
      ))}
    </>
  )
}

export const Board = () => {
  const {planet, board} = useParams<BoardRoute>();
  const [questions, setQuestions] = useState<GetQuestion[]>([]);

  useEffect(() => {
    api.scry({
      app: 'quorum-server',
      path: `/all-questions/${board}`,
    }).then(
      (result) => (
        setQuestions(result['questions'].map(fixupPost).map(
          (b: any) => ({...b, board: board})
        ))
      ),
      (err) => (console.log(err)),
    );
  }, [/*questions*/]);

  return (
    <>
      {questions.map(board => (
        <Plaque key={board.id} content={board}/>
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
    api.scry({
      app: 'quorum-server',
      path: `/thread/${board}/${tid}`,
    }).then(
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
