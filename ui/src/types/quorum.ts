import { Scry, PokeInterface } from "@urbit/http-api";

/////////////////////
// Interface Types //
/////////////////////

/*******************************/
/* Internal Types (React only) */
/*******************************/

export interface Board {
  name: string;
  desc: string;
  tags: string[];
  image: string;
  host: string;
}

export interface Poast {
  id: number;
  date: number;
  body: string;
  votes: number;
  who: string;
  host: string;
  board?: string;
}
export interface Answer extends Poast {}
export interface Question extends Poast {
  title: string;
  tags: string[];
}

export interface Thread {
  question: Question;
  answers: Answer[];
  best: number;
}

/****************************/
/* Scry Types (Urbit->React) */
/****************************/

export type ScryBoards = {
  'all-boards': {
    boards: Omit<Board, 'host'>[];
    host: string;
  }[];
};

export type ScryQuestions = {
  questions: ScryQuestion[];
};

export type ScryThread = ScryQuestion & {
  answers: ScryAnswer[];
  best: number | undefined;
};

export type ScrySearch = {
  search: {
    name: string;
    id: number;
    host: string;
  }[];
};

export type ScryPoast = {
  id: number;
  date: number;
  body: string;
  who: string;
  votes: string; // FIXME: Votes passed as string
};
export type ScryAnswer = ScryPoast;
export type ScryQuestion = {
  question: ScryPoast & {title: string;};
  tags: string[];
};

/*****************************/
/* Poke Types (React->Urbit) */
/*****************************/

export interface PokeBoard {
  name: string;
  desc: string;
  tags: string[];
  image: string;
}

export interface PokeJoin {
  host: string;
  name: string;
}

export interface PokeQuestion {
  title: string;
  body: string;
  tags: string[];
}

export interface PokeAnswer {
  name: string;
  parent: number;
  body: string;
}

/////////////////
// Route Types //
/////////////////

export interface SearchRoute extends Record<string, string | undefined> {
  planet?: string;
  board?: string;
  lookup?: string;
  // limit?: string;
  // page?: string;
}

export interface BoardRoute extends Record<string, string | undefined> {
  planet?: string;
  board?: string;
}

export interface ThreadRoute extends BoardRoute {
  tid?: string;
}

/////////////////
// Other Types //
/////////////////

export interface MenuItem {
  title: string;
  path: string;
}
export interface MenuSection extends MenuItem {
  items: MenuItem[];
}

export type SetThreadAPI = 'set-best' | 'unset-best' | 'vote-up' | 'vote-dn';

///////////////////
// Generic Types //
///////////////////

export type U<T> = T | undefined;

// a typical api function: takes an arbitrary number of arguments of type A
// and returns a Promise which resolves with a specific response type of R
export type ApiFxn<R, A extends any[] = []> = (...args: A) => Promise<R>;

// an updater function: has a similar signature with the original api function,
// but doesn't return anything because it only triggers new api calls
export type UpdaterFxn<A extends any[] = []> = (...args: A) => void;

// a simple data reader function: just returns the response type R
export type DataFxn<R> = () => R;

// we know we can also transform the data with a modifier function
// which takes as only argument the response type R and returns a different type M
export type ModifierFxn<R, M = any> = (response: R) => M;

// therefore, our data reader functions might behave differently
// when we pass a modifier function, returning the modified type M
export type ModifiedDataFxn<R> = <M>(modifier: ModifierFxn<R, M>) => M;

// finally, our actual eager and lazy implementations will use
// both versions (with and without a modifier function),
// so we need overloaded types that will satisfy them simultaneously
export type DataOrModifiedFxn<R> = DataFxn<R> & ModifiedDataFxn<R>;

// one last thing: a type for 'fetch' prop; used in element construction
// within a 'React.Suspend' cage
export type FetchFxn<R> = {fetch: DataOrModifiedFxn<R>;};
