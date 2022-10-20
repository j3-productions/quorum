import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import api from '../../api';
import { patpFormat, strVoid } from '../../utils';
import { Nameplate } from '../Decals';

interface FooterProps {
  who: string;
  host: string;
  date: number;
  tags?: string[];
  path?: string;
  className?: string;
}

export const Footer = ({who, host, date, tags, path, className}: FooterProps) => {
  // FIXME: Ideally, both "in-board" and "out-of-board" paths will
  // include a date eventually with the value for the latter being the
  // time of the latest post on the board.
  const patpWho: string = (!path || path.includes("/thread/")) ? who : host
  return (
    <div className={cn("flex flex-wrap mt-2 gap-2 items-center justify-between", className)}>
      <ol className="flex flex-wrap gap-2 text-sm text-fgs2">
        {tags?.map(tag => (
          <code key={tag} className="rounded bg-fgs2-light p-1">{tag}</code>
        ))}
      </ol>
      <Nameplate ship={patpWho} />
    </div>
  );
}
