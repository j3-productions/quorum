import React from 'react';
import { IconProps } from './icon';

export default function BestIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        className="stroke-current"
        d="M 18.94237,2.7563362 9.2299289,12.625393 4.9550357,8.4820778 0.69727203,12.874996 9.3317196,21.243791 23.302725,7.0474652 Z"
        strokeWidth="0.548379"
        strokeLinejoin="round"
      />
    </svg>
  );
}
