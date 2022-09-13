import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { FooterData } from '../../types/quorum';

interface FooterProps {
  content: FooterData;
  className?: string;
}

export const Footer = ({content, className}: FooterProps) => {
  // TODO: Figure out how to get footer content at the end when
  // there's space.
  return (
    <div className={cn("flex flex-row items-center justify-between", className)}>
      <p className="text-fgs2 font-semibold">
        {content.tags?.map((t, i) => `${i === 0 ? '' : ' | '}#${t}`)}
      </p>
      <p className="text-fgp1">
        {(!content.path || content.path.includes("/thread/")) ?
          `~${content.who} @ ${(new Date(content.date)).toLocaleString()}` :
          `Hosted @ ~${content.who}`
        }
      </p>
    </div>
  );
}
