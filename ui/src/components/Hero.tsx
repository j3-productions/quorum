import React from 'react';
import cn from 'classnames';

interface HeroProps {
  content: string;
  className?: string;
}

export const Hero = ({content, className}: HeroProps) => {
  return (
    <div className={cn("text-center py-8", className)}>
      <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight mb-12">
        {content}
      </h1>
    </div>
  );
}
