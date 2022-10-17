import { apiScry, apiPoke, useFetch, fixupPost } from '../utils';
import * as Type from "../types/quorum";

export const getBoards = () => (
  apiScry<Type.ScryBoards>('/boards').then(
    ({'all-boards': result}: Type.ScryBoards) =>
      result.reduce(
        (l, {host, boards}) => l.concat(boards.map(b => ({...b, host: `~${host}`}))),
        [] as Type.Board[],
      )
  )
);

export const getQuestions = (planet?: string, board?: string) => (
  apiScry<Type.ScryQuestions>(`/questions/${planet}/${board}`).then(
    ({questions: result}: Type.ScryQuestions) =>
      result
        .map(({question: q, tags: ts}) => ({...q, tags: ts, board: board}))
        .map((post) => fixupPost(planet, post)) as Type.Question[]
  )
);

export const getThread = (planet?: string, board?: string, tid?: string) => (
  (setType: Type.SetThreadAPI, setTid?: number) => (
    (!setTid ?
      new Promise(resolve => resolve(0)) :
      apiPoke<any>({ json: { dove: {
        host: planet,
        name: board,
        mail: setType.match(/.*-best$/) ? {
          'set-best': {
            name: board,
            'post-id': (setType === 'set-best') ? setTid : 0,
            'thread-id': parseInt(tid || "0"),
          },
        } : {
          vote: {
            name: board,
            sing: (setType === 'vote-up') ? 'up' : 'down',
            'post-id': setTid,
            'thread-id': parseInt(tid || "0"),
          },
        }
      }}})
    ).then((result: any) =>
      apiScry<Type.ScryThread>(`/thread/${planet}/${board}/${tid}`)
    ).then(({question, tags, answers, best}: Type.ScryThread) => {
      const bestTid: number = best || 0;
      const isBestTid = (a: Type.Answer): number => +(a.id === bestTid);
      return {
        best: bestTid,
        question: {...fixupPost(planet, question), tags: tags} as Type.Question,
        answers: answers
          .map((post) => fixupPost(planet, post))
          .sort((a, b) => (
            isBestTid(b) - isBestTid(a) ||
            b.votes - a.votes ||
            b.date - a.date
          )),
      };
    })
  )
);

export const getSearch = (planet?: string, board?: string, lookup?: string) => (
  apiScry<Type.ScrySearch>(`/search/${planet}/${board}/${lookup}`).then(
    ({search: result}: Type.ScrySearch) => {
      result = result.map(({host, ...data}) => ({host: `~${host}`, ...data}));
      const queryTids: number[] = result.map(({id, ...data}) => id);
      return (result.length === 0) ? [] :
        apiScry<Type.ScryQuestions>(`/questions/${planet}/${board}`).then(
          ({questions: result}: Type.ScryQuestions) =>
            result
              .map(({question: q, tags: ts}) => ({...q, tags: ts, board: board}))
              .map((post) => fixupPost(planet, post))
              .filter(({id, ...data}) => queryTids.includes(id)) as Type.Question[]
        )
    }
  )
);
