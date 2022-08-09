import React from 'react';
import cn from 'classnames';
import { UserRemoveIcon, UsersIcon } from '@heroicons/react/solid';
import { deSig, uxToHex } from '@urbit/api';
import { BoardMeta } from '../types/sphinx';

interface BoardPlaqueProps {
  content: BoardMeta;
  className?: string;
}

// TODO: Generalize 'BoardPlaque' to cover 'ThreadMeta' props.

export const BoardPlaque = ({ content, className }: BoardPlaqueProps) => {
  /*TODO: Cleanup 'place-items-center' here; can it just be applied to img?*/
  return (
    <div className="w-full p-2 grid grid-cols-12 place-items-center gap-2 text-mauve bg-fawn/30 border-solid border-2 border-rosy rounded-xl">
      <div className="col-span-2">
        <img
          src={content.uri}
          className="object-cover rounded-xl"
        />
      </div>
      <div className="col-span-10 border-solid border-l-2 border-rosy px-2">
        <a href="#" className="underline font-semibold">{content.title}</a>
        <p>{content.description}</p>
        <p className="text-lavender font-semibold float-left">
          {content.tags.map((t, i) => `${i === 0 ? '' : ' | '}#${t}`)}
        </p>
      </div>
    </div>
  )
}
