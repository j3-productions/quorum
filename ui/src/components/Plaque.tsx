import React from 'react';
import api from '../api';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import { Footer } from './subcomponents/Footer';
import { MDBlock } from './subcomponents/MDBlock';
import * as Type from '../types/quorum';

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
  const plaqueClasses: string = `
    w-full p-2 flex flex-col gap-2 rounded-xl text-fgp1 bg-bgp2/30
    border-solid border-2 border-bgs1
  `;
  const truncateBody = (body: string): string =>
    body.substring(0, 200) + ((body.length > 200) ? "..." : "");

  const BoardPlaque = ({content, className}: BoardPlaqueProps) => {
    const path: string = `/board/${content.host}/${content.name}`;
    return (
      <div className={cn(plaqueClasses, "relative overflow-hidden", className)}>
        {/*NOTE: Weird extra element w/ absolute needed for different bg opacity.*/}
        <div className={`absolute top-0 left-0 w-full h-full opacity-30
            bg-center bg-contain bg-repeat`}
            style={{backgroundImage: `url('${content.image}`} as React.CSSProperties} />
        <div className="relative">
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
        <div>
          <Link to={path} className="text-bgs2">
            <MDBlock content={content.title} archetype="head" />
          </Link>
          <MDBlock archetype="desc" content={truncateBody(content.body)}/>
          <Footer who={content.who} host={content.host}
            date={content.date} tags={content.tags} path={path} />
        </div>
        <div className={`flex justify-around items-center
            border-solid border-t border-bgs1 pt-2`}>
          {/*TODO: On large monitors, list what each of these means w/ text*/}
          <div>🗳: {((content.votes < 0) ? "" : "+") + content.votes}</div>
          <div>💬: ?</div> {/*number of comments; {content.replies}*/}
          <div>🕒: ?</div> {/*time of latest comment/update, as X ago*/}
        </div>
      </div>
    );
  };

  return ("image" in content) ?
    (<BoardPlaque content={content as Type.Board} className={className} />) :
    (<QuestionPlaque content={content as Type.Question} className={className} />);
};
