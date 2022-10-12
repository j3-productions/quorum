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
  question: GetQuestion;
  answers: GetAnswer[];
  best: number;
}

/****************************/
/* Scry Types (Urbit->React) */
/****************************/

export type ScryBoard = {
  'all-boards': {
    boards: Omit<GetBoard, 'host'>[];
    host: string;
  }[];
};

export type ScryQuestions = {
  questions: ScryQuestion[];
};

export type ScryThread = ScryQuestion & {
  answers: GetAnswerBad[];
  best: number | undefined;
};

export type ScrySearch = {
  search: GetSearchResult[];
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

// FIXME: remove

export interface GetBoard {
  name: string;
  desc: string;
  tags: string[];
  image: string;
  host: string;
}

export interface GetPostBase {
  id: number;
  date: number;
  body: string;
  who: string;
  host: string;
  board?: string;
}
export interface GetPost extends GetPostBase {votes: number;}
export interface GetPostBad extends Omit<GetPostBase, 'host'> {votes: string;}
export interface GetAnswer extends GetPost {}
export interface GetAnswerBad extends GetPostBad {}
export interface GetQuestion extends GetPost {title: string; tags: string[];}
export interface GetQuestionBad extends GetPostBad {title: string;}

export interface GetThread {
  best?: number;
  question?: GetQuestion;
  answers: GetAnswer[];
}

export interface GetSearchResult {
  name: string;
  id: number;
  host: string;
}

/*****************************/
/* Poke Types (React->Urbit) */
/*****************************/

export interface PostBoard {
  name: string;
  desc: string;
  tags: string[];
  image: string;
}

export interface PostJoin {
  host: string;
  name: string;
}

export interface PostQuestion {
  title: string;
  body: string;
  tags: string[];
}

export interface PostAnswer {
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
  // lookup?: string;
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
