import React from 'react';
import cn from 'classnames';
import { UserRemoveIcon, UsersIcon } from '@heroicons/react/solid';
import { deSig, uxToHex } from '@urbit/api';
import { BoardMeta, PostMeta } from '../types/quorum';

// TODO: Generalize 'BoardPlaque' to cover 'PostMeta' props.
// TODO: Clean up imports.

interface PlaqueProps {
  content: BoardMeta | PostMeta;
  className?: string;
}

export const Plaque = ({ content, className }: PlaqueProps) => {
  /*TODO: Cleanup 'place-items-center' here; can it just be applied to img?*/
  /*TODO: Render image saved to the database.*/
  /*TODO: Fix rendering issue w/ 1-liner plaques.*/
  // TODO: Add host ship to board metadata and display this in bottom-right.

  const isBoard = (board : any): board is BoardMeta => {
    return (board as BoardMeta) !== undefined && "uri" in board;
  }
  const isPost = (post : any): post is PostMeta => {
    return (post as PostMeta) !== undefined && "votes" in post;
  }

  const tags = ["urbit", "dojo", "hoon"];
  return (
    <div className="w-full p-2 grid grid-cols-12 place-items-center gap-2 text-mauve bg-fawn/30 border-solid border-2 border-rosy rounded-xl">
      <div className="col-span-2">
        {isBoard(content) &&
          <img
            src={content.uri}
            className="object-cover rounded-xl"
          />
        }
        {isPost(content) &&
          <>
            <p><span className="font-semibold">score:</span> +{content.votes}</p>
            <p><span className="font-semibold">replies:</span> 123</p>
          </>
        }
      </div>
      <div className="col-span-10 border-solid border-l-2 border-rosy px-2">
        <a href={content.path} className="underline font-semibold">{content.name}</a>
        <p>{content.description}</p>
        <p className="text-lavender font-semibold float-left">
          {/* {content.tags.map((t, i) => `${i === 0 ? '' : ' | '}#${t}`)} */}
          {tags.map((t, i) => `${i === 0 ? '' : ' | '}#${t}`)}
        </p>
        <p className="float-right">
          {content.author} @ {(new Date(content.time)).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
