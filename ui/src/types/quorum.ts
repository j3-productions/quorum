import { Scry, PokeInterface } from "@urbit/http-api";

// Interface Types //

/// Get Types (Urbit->React) ///

export interface GetBoardBase {
  name: string;
  desc: string;
  tags: string[];
  image: string;
}
export interface GetBoard extends GetBoardBase {host: string;}
export interface GetBoardBad extends GetBoardBase {}

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
export interface GetAnswer extends GetPost {};
export interface GetQuestion extends GetPost {title: string; tags: string[];}

export interface GetThread {
  best?: number;
  question?: GetQuestion;
  answers: GetAnswer[];
}

/// Post Types (React->Urbit) ///

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

// Route Types //

export interface SearchRoute extends Record<string, string | undefined> {
  lookup?: string;
  limit?: string;
  page?: string;
}

export interface BoardRoute extends Record<string, string | undefined> {
  planet?: string;
  board?: string;
}

export interface ThreadRoute extends BoardRoute {
  tid?: string;
}

// Other Types //

export type GenericScry = Omit<Scry, 'app'>;
export type GenericPoke = Omit<PokeInterface<any>, 'app'>;

export interface FooterData {
  tags?: string[];
  path?: string;
  who: string;
  host: string;
  date: number;
}
