import React from 'react';
import api from '../api';
import cn from 'classnames';
import { NavLink } from 'react-router-dom';
import { deSig, uxToHex } from '@urbit/api';
import { GetPost, GetQuestion } from '../types/quorum';

interface StrandProps {
  content: GetPost | GetQuestion;
  className?: string;
}

export const Strand = ({content, className}: StrandProps) => {
  // TODO: If the entry doesn't have a board, then render it with an
  // associated check mark (answer).

  const isQuestion = (question : any): question is GetQuestion => {
    return (question as GetQuestion) !== undefined && "title" in question;
  }

  return (
    <div className="w-full p-2 grid grid-cols-12 place-items-center text-mauve border-solid border-b-2 border-rosy">
      {/*float to top somehow*/}
      <div className="col-span-1">
        <p>^</p>
        <p>1</p>
        <p>v</p>
        {!isQuestion(content) &&
          <p>✔️</p>
        }
      </div>
      <div className="col-span-11">
        {isQuestion(content) &&
          <p className="underline font-semibold text-xl">What is a question?</p>
        }
        <p>{content.body}</p>
        <p className="text-lavender font-semibold float-left">
          {isQuestion(content) &&
            content.tags.map((t, i) => `${i === 0 ? '' : ' | '}#${t}`)
          }
        </p>
        <p className="float-right">
          ~{content.who} @ {(new Date(content.date)).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
