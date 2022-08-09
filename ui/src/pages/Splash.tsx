import React, { useCallback, useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import cn from 'classnames';
import debounce from 'lodash.debounce';
import { useNavigate, useParams } from 'react-router-dom';
import { SearchInput } from '../components/SearchInput';
import { Listings } from '../components/Listings';
import { PostFilter, Remove, BoardMeta, Search as SearchType } from '../types/sphinx';
import api from '../api';
import { Paginator } from '../components/Paginator';
import { BoardPlaque } from '../components/Plaque';
import { useTags } from '../state/tags';
import { useSearch } from '../state/search';
import { encodeLookup } from '../utils';

// TODO: Query list of boards from agent

export const Splash = () => {
  // `api.scry<ReturnType>`: template type is the return type for the function
  // {shelf-metadata: [{description: '', name: 'test'}, ...]}
  const fakeBoards : BoardMeta[] = [
    {
      title: 'Networked Subject',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
        'eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ' +
        'vel eros donec ac odio. Dictum non consectetur a erat.',
      tags: ['urbit', 'sysadmin', 'linux'],
      path: '~sitful-hatred/networked-subject',
      uri: 'https://lh3.googleusercontent.com/a-/AOh14GgOm4If5lPzmRZoOk5yb2TN0twuiwzp0zeJiUZ3qw=k-s256',
    },
    {
      title: 'Urbit FAQ',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
        'eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      tags: ['urbit', 'hoon', 'dojo'],
      path: '~master-morzod/urbit-faq',
      uri: 'https://i.stack.imgur.com/agMKZ.png?s=128&g=1',
    },
    {
      title: 'Hooniversity',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
        'eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      tags: ['urbit', 'hoon', 'gall'],
      path: '~taller-ravnut/hooniversity',
      uri: 'https://www.gravatar.com/avatar/9d2bd51b0d7a3e483cb42919119d2e8d?s=256&d=identicon&r=PG',
    },
  ];
  return (
    <>
      {fakeBoards.map(b => (
        <BoardPlaque content={b}/>
      ))}
    </>
  )
}
