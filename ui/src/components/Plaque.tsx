import React from 'react';
import api from '../api';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import { sigil, reactRenderer } from '@tlon/sigil-js'
import { Footer } from './subcomponents/Footer';
import { MDBlock } from './subcomponents/MDBlock';
import * as Type from '../types/quorum';

///////////////////////////
/// Component Functions ///
///////////////////////////

interface BoardPlaqueProps {
  content: Type.Board;
  className?: string;
}
interface QuestionPlaqueProps {
  content: Type.Question;
  className?: string;
}
interface PlaqueProps {
  content: Type.Board | Type.Question;
  className?: string;
}

export const Plaque = ({content, className}: PlaqueProps) => {
  const imageClasses: string = `object-cover rounded-xl`;
  const plaqueClasses: string = `
    w-full p-2 grid grid-cols-12 place-items-center gap-2
    text-fgp1 bg-bgp2/30 border-solid border-2 border-bgs1 rounded-xl
  `;
  const truncateBody = (body: string): string =>
    body.substring(0, 200) + ((body.length > 200) ? "..." : "");

  // TODO: Render image as the background of the board with light opacity,
  // which will also require rendering the front as text with outline.
  // TODO: Add a bottom bar to 'QuestionPlaque' that contains the vote
  // score and reply count for a particular question.
  const BoardPlaque = ({content, className}: BoardPlaqueProps) => {
    const path: string = `/board/${content.host}/${content.name}`;
    return (
      <div className={cn(plaqueClasses, className)}>
        <div className="col-span-2">
          {(content.image !== "") ?
            (<img src={content.image} className={imageClasses} />) :
            sigil({
              patp: content.host,
              renderer: reactRenderer,
              width: 100,
              height: 100,
              colors: ['#586E75', '#FDF6E3'],
              class: imageClasses,
              attributes: {style: undefined},
            })
          }
        </div>
        <div className="col-span-10 w-full border-solid border-l-2 border-bgs1 px-2">
          <Link to={path} className="text-bgs2">
            <MDBlock content={content.name} archetype="head" />
          </Link>
          <MDBlock archetype="desc" content={truncateBody(content.desc)}/>
          <Footer who={content.host} host={content.host}
            date={Date.now()} tags={content.tags} path={path} />
        </div>
      </div>
    );
  };
  const QuestionPlaque = ({content, className}: QuestionPlaqueProps) => {
    const path: string = `/board/${content.host}/${content.board}/thread/${content.id}`;
    return (
      <div className={cn(plaqueClasses, className)}>
        <div className="col-span-12 w-full">
          <Link to={path} className="text-bgs2">
            <MDBlock content={content.title} archetype="head" />
          </Link>
          <MDBlock archetype="desc" content={truncateBody(content.body)}/>
          <Footer who={content.who} host={content.host}
            date={content.date} tags={content.tags} path={path} />
        </div>
      </div>
    );
  };

  return ("image" in content) ?
    (<BoardPlaque content={content as Type.Board} className={className} />) :
    (<QuestionPlaque content={content as Type.Question} className={className} />);
};
