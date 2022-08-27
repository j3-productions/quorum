// Interface Types //

/// Get Types (Urbit->React) ///

export interface GetBoard {
  name: string;
  desc: string;
  tags: string[];
  image: string;
}

export interface GetPostBase {
  id: number;
  date: number;
  body: string;
  who: string;
  board?: string;
}
export interface GetPost extends GetPostBase {votes: number;}
export interface GetPostBad extends GetPostBase {votes: string;}
export interface GetAnswer extends GetPost {};
export interface GetQuestion extends GetPost {title: string; tags: string[];}

export interface GetThread {
  question?: GetQuestion;
  answers: GetAnswer[];
}

/// Post Types (React->Urbit) ///

export interface PostBoard extends GetBoard {};

export interface PostJoin {
  // planet: string;
  // board: string;
  path: string;
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
