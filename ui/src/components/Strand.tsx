import React, { useEffect, useState } from 'react';
import api from '../api';
import cn from 'classnames';
import { Link, useParams } from 'react-router-dom';
import { deSig, uxToHex } from '@urbit/api';
import { MDBlock } from './subcomponents/MDBlock';
import { GetPost, GetQuestion, ThreadRoute } from '../types/quorum';

interface StrandProps {
  content: GetPost | GetQuestion;
  bestTid?: number;
  setBestTid?: (tid: number) => void;
  className?: string;
}

export const Strand = ({content, bestTid, setBestTid, className}: StrandProps) => {
  const {planet, board, tid} = useParams<ThreadRoute>();
  const svg = {
    arrow: {
      path: 'M0,486.944l245-148.887l245,148.887L245,3.056L0,486.944z',
      vbox: '0 0 490 490',
    },
    check: {
      path: 'M387.702,43.753L181.316,253.467l-90.84-88.044L0,258.771l183.479,177.834l296.879-301.667L387.702,43.753z',
      vbox: '0 0 480.358 480.358',
    },
  };

  const isQuestion = (question : any): question is GetQuestion => {
    return (question as GetQuestion) !== undefined && "title" in question;
  }
  const vote = (up: boolean) => () => {
    api.poke({
      app: 'quorum-server',
      mark: 'client-poke',
      json: {
        'vote': {
          'thread-id': parseInt(tid || "0"),
          'post-id': content.id,
          'name': board,
          'sing': up ? 'up' : 'down',
        },
      },
    });
  };
  const select = () => {
    api.poke({
      app: 'quorum-server',
      mark: 'client-poke',
      json: {
        'set-best': {
          'thread-id': parseInt(tid || "0"),
          // TODO: Slightly clumsy, but IDs start at 0 so this effectively
          // unsets the best answer for the thread.
          'post-id': (content.id === bestTid) ? 0 : content.id,
          'name': board,
        },
      },
    });
  };

  // TODO: Because of the nature of vote values, we just highlight the
  // strand arrow up if the value is positive and the down arrow if it
  // is negative.
  return (
    <div className="w-full grid grid-cols-12 justify-center content-start text-mauve border-solid border-b-2 border-rosy">
      <div className="col-span-1 flex flex-col place-items-center p-2">
        <svg className="h-4 w-4 cursor-pointer" xmlns="http://www.w3.org/2000/svg"
            viewBox={svg.arrow.vbox} stroke="black" strokeWidth="25"
            fill={(content.votes > 0) ? "orange" : "none"}
            onClick={vote(true)}>
          <path d={svg.arrow.path}/>
        </svg>
        {content.votes}
        <svg className="h-4 w-4 cursor-pointer" xmlns="http://www.w3.org/2000/svg"
            viewBox={svg.arrow.vbox} stroke="black" strokeWidth="25"
            transform="rotate(180)"
            fill={(content.votes < 0) ? "blue" : "none"}
            onClick={vote(false)}>
          <path d={svg.arrow.path}/>
        </svg>
        {!isQuestion(content) &&
          <>
            <div className="h-4"></div>
            <svg className="h-4 w-4 cursor-pointer" xmlns="http://www.w3.org/2000/svg"
                viewBox={svg.check.vbox} stroke="black" strokeWidth="25"
                fill={(content.id === bestTid) ? "green" : "none"}
                onClick={select}>
              <path d={svg.check.path}/>
            </svg>
          </>
        }
      </div>
      <div className="col-span-11 w-full">
        {isQuestion(content) &&
          <MDBlock content={content.title} archetype="head"/>
        }
        <MDBlock content={content.body} archetype="body"/>
        <p className="text-lavender font-semibold float-left">
          {isQuestion(content) &&
            content.tags.map((t, i) => `${i === 0 ? '' : ' | '}#${t}`)
          }
        </p>
        <p className="float-right">
          ~{content.who} @ {(new Date(content.date)).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
