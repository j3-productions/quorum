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
        to: planet,
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
      const queryGroups: {[index: string]: number[]} = result
        .map(({host, name, id}): [string, number] => [`~${host}/${name}`, id])
        .reduce((groups, [path, id]) => {
          if(path in groups) { groups[path].push(id); }
          else { groups[path] = [id]; }
          return groups;
        }, {} as {[index: string]: number[]});
      return (result.length === 0) ? [] :
        Promise.all(Object.entries(queryGroups).map(([path, ids]) => {
          const [host, name]: string[] = path.split('/');
          return apiScry<Type.ScryQuestions>(`/questions/${path}`).then(
            ({questions: result}: Type.ScryQuestions) => result
              .map(({question: q, tags: ts}) => ({...q, tags: ts, board: name}))
              .map((post) => fixupPost(host, post))
              .filter(({id, ...data}) => ids.includes(id)) as Type.Question[]
          )
        })).then((result: Type.Question[][]) =>
          result.reduce((l, n) => l.concat(n), [] as Type.Question[])
        );
    }
  )
);

export const getPermissions = (planet?: string, board?: string) => (
  (setType: Type.SetPermsAPI, setAxis?: Type.Axis, setShip?: string) => (
    ((setType === 'toggle') ? (
      !setAxis ? new Promise(resolve => resolve(0)) :
      apiPoke<any>({ json: { judge: {
        to: planet,
        name: board,
        gavel: {
          toggle: {
            name: board,
            axis: setAxis,
          },
        },
      }}})
    ) : (
      !setShip ? new Promise(resolve => resolve(0)) :
      apiPoke<any>({ json: { judge: {
        to: planet,
        name: board,
        gavel: {
          [setType]: {
            name: board,
            ship: setShip,
          },
        },
      }}})
    )).then((result: any) =>
      apiScry<Type.ScryPerms>(`/permissions/${planet}/${board}`)
    ).then(({allowed, banned, members, axis}: Type.ScryPerms) => (
      {
        allowed: allowed.map(i => `~${i}`),
        banned: banned.map(i => `~${i}`),
        members: members.map(i => `~${i}`),
        ...axis
      }
    ))
  )
);
