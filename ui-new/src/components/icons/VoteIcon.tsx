import React from 'react';
import { IconProps } from './icon';

export default function VoteIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        className="stroke-current"
        d="M 0.9382276,23.061782 11.999999,0.93823714 23.061772,23.061782 11.999999,15.687268 Z"
        strokeWidth="0.548379"
        strokeLinejoin="round"
      />
    </svg>
  );
}
