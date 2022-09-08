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
    <div className={className}>
      <p className="text-lavender font-semibold float-left">
        {content.tags?.map((t, i) => `${i === 0 ? '' : ' | '}#${t}`)}
      </p>
      <p className="float-right">
        ~{content.who} @ {(new Date(content.date)).toLocaleString()}
      </p>
    </div>
  );
}
