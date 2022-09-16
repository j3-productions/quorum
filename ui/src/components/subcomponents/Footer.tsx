import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import api from '../../api';
import { format } from 'date-fns';
import { FooterData } from '../../types/quorum';

interface FooterProps {
  content: FooterData;
  className?: string;
}

export const Footer = ({content, className}: FooterProps) => {
  // TODO: Figure out how to get footer content at the end when
  // there's space.
  return (
    <div className={cn("flex flex-row mt-2 items-center justify-between", className)}>
      <ol className="flex space-x-2 text-sm text-fgs2">
        {content.tags?.map(tag => (
          <code key={tag} className="rounded bg-fgs2/40 p-1">{tag}</code>
        ))}
      </ol>
      <div className="text-fgp1">
        {(!content.path || content.path.includes("/thread/")) ?
          `${content.who} @ ${format(new Date(content.date), 'HH:mm yyyy/MM/dd')}` :
          `Host: ${content.host}`
        }
      </div>
    </div>
  );
}
