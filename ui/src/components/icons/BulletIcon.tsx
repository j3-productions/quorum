import React from 'react';
import { IconProps } from './icon';

export default function BulletIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16">
      <circle className="fill-current" cx="8" cy="8" r="3" />
    </svg>
  );
}
