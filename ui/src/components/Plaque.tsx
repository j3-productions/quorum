import React from 'react';
import api from '../api';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import { deSig, uxToHex } from '@urbit/api';
import { Footer } from './subcomponents/Footer';
import { MDBlock } from './subcomponents/MDBlock';
import { GetBoard, GetQuestion, FooterData } from '../types/quorum';

interface PlaqueProps {
  content: GetBoard | GetQuestion;
  host: string;
  className?: string;
}

export const Plaque = ({content, host, className}: PlaqueProps) => {
  // TODO: Cleanup 'place-items-center' here; can it just be applied to img?
  // TODO: Fix rendering issue w/ 1-liner plaques.
  // TODO: How do we know the host ship for the content in the networked case?

  const isBoard = (board : any): board is GetBoard => {
    return (board as GetBoard) !== undefined && "image" in board;
  }
  const isQuestion = (question : any): question is GetQuestion => {
    return (question as GetQuestion) !== undefined && "votes" in question;
  }

  const maxBodyLen = 200;
  const data = {
    title: isBoard(content) ? content.name : content.title,
    body: isBoard(content) ? content.desc : content.body,
    who: isBoard(content) ? content.host : content.who,
    date: isBoard(content) ? Date.now() : content.date, // TODO: board latest update
    tags: content.tags,
    path: `/board/${isBoard(content) ?
      `~${content.host}/${content.name}` :
      `~${host}/${content.board}/thread/${content.id}`}`,
  };

  return (
    <div className="w-full p-2 grid grid-cols-12 place-items-center gap-2 text-fgp1 bg-bgp2/30 border-solid border-2 border-bgs1 rounded-xl">
      <div className="col-span-2">
        {isBoard(content) &&
          <img
            src={content.image}
            className="object-cover rounded-xl"
          />
        }
        {isQuestion(content) &&
          <>
            <div><span className="font-semibold">score:</span> {content.votes}</div>
            {/*TODO: <div><span className="font-semibold">replies:</span> ???</div>*/}
          </>
        }
      </div>
      <div className="col-span-10 w-full border-solid border-l-2 border-bgs1 px-2">
        <Link to={data.path} className="text-bgs2">
          <MDBlock content={data.title} archetype="head" />
        </Link>
        <MDBlock archetype="desc" content={
          data.body.substring(0, maxBodyLen) +
          ((data.body.length > maxBodyLen) ? "..." : "")
        } />
        <Footer content={data as FooterData}/>
      </div>
    </div>
  )
}
