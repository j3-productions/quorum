import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import cn from 'classnames';
import debounce from 'lodash.debounce';
import { useNavigate, useParams } from 'react-router-dom';
import { SearchInput } from '../components/SearchInput';
import { Listings } from '../components/Listings';
import { BoardMeta } from '../types/quorum';
import api from '../api';
import { Paginator } from '../components/Paginator';
import { Plaque } from '../components/Plaque';
import { useTags } from '../state/tags';
import { useSearch } from '../state/search';
import { encodeLookup } from '../utils';

// TODO: Clean up imports
// TODO: Clean up data types for `api.scry` type check

export const Board = () => {
  // `api.scry<ReturnType>`: template type is the return type for the function
  // {shelf-metadata: [{description: '', name: 'test'}, ...]}
  // const [data, setData] = useState<BoardMeta[]>([]);

  // useEffect(() => {
  //   // TODO: <BoardMetaData>
  //   api.scry({
  //     app: 'quorum-server',
  //     path: '/what-boards'
  //   }).then(
  //     (result) => (
  //       setData(result['shelf-metadata'].map((d: any) => (
  //         {...d, path: '/', uri: 'https://lh3.googleusercontent.com/a-/AOh14GgOm4If5lPzmRZoOk5yb2TN0twuiwzp0zeJiUZ3qw=k-s256'}
  //       )))
  //     ),
  //     (err) => (console.log(err)),
  //   );
  // }, [data]);

  const data = [
    {
      'name': 'What is the deal with airline food?',
      'description':
        'I fly around on planes all the time and I do not get it! ' +
        'Why is airline food so bad? What is the big deal here? ' +
        'Someone please explain this to me!',
      'path': '/what-is-the-deal-with-airline-food',
      'author': '~sampel-palnet',
      'time': (new Date(2020, 10, 10)).getTime(),
      'votes': 1,
    },
    {
      'name': 'How many monkeys does it take to write Shakespeare?',
      'description':
        'I recently received a shipment of 10,000 monkeys from Botwswana ' +
        'and I need to know if this is enough monkeys in order to recreate ' +
        'the plays of Shakespeare. Also, would anyone happen to know the ' +
        'current going rate for typewriters?',
      'path': '/how-many-monkeys-shakespeare',
      'author': '~lagrev-nocfep',
      'time': (new Date(2021, 8, 3)).getTime(),
      'votes': 2,
    },
    {
      'name': 'Why are black walnuts green?',
      'description':
        'My cousin showed me a black walnut tree in his back yard the other day. ' +
        'Despite the name of the tree, I could not help but observe that the ' +
        'walnuts were green and not black. Why do green walnuts come from the ' +
        'black walnut tree? I invite the comment of all professional botanists.',
      'path': '/why-black-walnuts-green',
      'author': '~litmus-ritten',
      'time': (new Date(2022, 1, 22)).getTime(),
      'votes': 3,
    },
  ];

  return (
    <>
      {data.map(b => (
        <Plaque key={b.name} content={b}/>
      ))}
    </>
  )
}
