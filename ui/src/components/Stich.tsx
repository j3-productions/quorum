import React from 'react';
import api from '../api';
import cn from 'classnames';
import { NavLink } from 'react-router-dom';
import { deSig, uxToHex } from '@urbit/api';
import { PostMeta } from '../types/quorum';

// TODO: Rename 'Strand'

interface StitchProps {
  content: PostMeta;
  className?: string;
}

export const Stich = ({content, className}: StitchProps) => {
  // TODO: Similar in many ways to a Plaque, but fills the entire
  // container and contains spacing and border below.
  // TODO: If the entries tags are undefined, then don't render
  // anything.
  // TODO: If the entry doesn't have a board, then render it with an
  // associated check mark (answer).

  return (
    <p>
      TODO: Render a stich, a constituent of a thread (question or answer).
    </p>
  )
}
