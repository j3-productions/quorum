import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import omit from 'lodash.omit';
import { useParams } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/outline';
import { Footer } from './subcomponents/Footer';
import { MDBlock } from './subcomponents/MDBlock';
import { appHost, datefmt, fromfmt } from '../utils';
import * as Type from '../types/quorum';

interface StrandProps {
  content: Type.Poast | Type.Question;
  thread?: Type.Thread;
  setThread?: (setType: Type.SetThreadAPI, setTid?: number) => void;
  className?: string;
}
interface StrandCompProps {
  onClick?: () => void;
  className?: string;
}

export const Strand = ({content, thread, setThread, className}: StrandProps) => {
  const {planet, board, tid} = useParams<Type.ThreadRoute>();

  const Arrow = ({className, ...props}: StrandCompProps) => {
    const isHost: boolean = (content.who === appHost);
    const fprops: object = !isHost ? props : omit(props, 'onClick');
    return (
      <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 490 490" stroke="black" strokeWidth="25"
          className={cn("h-4 w-4 cursor-pointer",
             !isHost ? "cursor-pointer" : "cursor-not-allowed",
            className)}
          {...fprops}>
        <path d="M0,486.944l245-148.887l245,148.887L245,3.056L0,486.944z"/>
      </svg>
    );
  };
  const Check = ({className, ...props}: StrandCompProps) => {
    const isPoster: boolean = (thread?.question.who === appHost);
    const fprops: object = isPoster ? props : omit(props, 'onClick');
    return (
      <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 480.358 480.358" stroke="black" strokeWidth="25"
          className={cn("h-4 w-4",
            (content.id === thread?.best) ? "fill-fgp2" : "fill-none",
            isPoster ? "cursor-pointer" : "cursor-not-allowed",
            className)}
          {...fprops}>
        <path d="M387.702,43.753L181.316,253.467l-90.84-88.044L0,258.771l183.479,177.834l296.879-301.667L387.702,43.753z"/>
      </svg>
    );
  };
  const Time = ({className, date, ...props}: StrandCompProps & {date: number;}) => {
    return (
      <div title={datefmt(date, 'long')}
          className={cn("text-[10px]", className)}>
        <ClockIcon stroke="black" strokeWidth="1.6" className="h-4 w-4" />
        {fromfmt(date, 'short')}
      </div>
    );
  };
  const isQuestion = (question : any): question is Type.Question =>
    (question as Type.Question) !== undefined && "title" in question;

  // TODO: Because of the nature of vote values, we just highlight the
  // strand arrow up if the value is positive and the down arrow if it
  // is negative.
  return (
    <div className={`w-full grid grid-cols-12
        justify-center content-start text-fgp1
        border-solid border-b-2 border-bgs1`}>
      {thread && setThread &&
        <div className="col-span-1 flex flex-col place-items-center p-2">
          <Arrow onClick={() => setThread('vote-up', content.id)}
            className={(content.votes > 0) ? "fill-fgs1" : "fill-none"}/>
          {content.votes}
          <Arrow onClick={() => setThread('vote-dn', content.id)}
            className={cn("flip-x", (content.votes < 0) ? "fill-fgs2" : "fill-none")}/>
          {!isQuestion(content) && thread && setThread &&
            <Check onClick={() => setThread(`${(content.id === thread.best) ? "un" : ""}set-best`, content.id)}
              className="mt-3"/>
          }
          <Time date={content.date} className="mt-3"/>
        </div>
      }
      <div className={cn(thread ? "col-span-11" : "col-span-12", "w-full mb-2")}>
        {isQuestion(content) &&
          <MDBlock content={content.title} archetype="head"/>
        }
        <MDBlock content={content.body} archetype="body"/>
        <Footer who={content.who} host={content.host} date={content.date}
          tags={isQuestion(content) ? content.tags : undefined} />
          {/*FIXME: Use 'relative' in the outer div and this almost works.*/}
          {/*className="absolute bottom-0 w-full" />*/}
      </div>
    </div>
  );
}
