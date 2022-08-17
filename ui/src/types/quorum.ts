// Meta Types //

export interface BoardMeta {
  name: string;
  description: string;
  tags: string[];
  image: string;
}

// TODO: Consider:
// - PostMeta: id, date, body, votes, who, board?
// - QuestionMeta: +title, +tags

export interface PostMeta {
  id: number;
  date: number;
  body: string;
  votes: number;
  who: string;
  title?: string;    // answers don't have a title
  tags?: string[];   // answers don't have tags
  board?: string;    // answers don't reference a parent board
}
export interface BadPostMeta { // TODO: Remove
  id: number;
  date: number;
  body: string;
  votes: string;
  who: string;
  title?: string;    // answers don't have a title
  tags?: string[];   // answers don't have tags
  board?: string;    // answers don't reference a parent board
}

export interface ThreadMeta {
  question: PostMeta;
  answers: PostMeta[];
}

export interface QuestionMeta {
  title: string;
  body: string;
  tags: string[];
}

export interface AnswerMeta {
  name: string;
  parent: number;
  body: string;
}

// export interface AnswerMeta {

// Route Types //

export interface BoardRoute extends Record<string, string | undefined> {
  planet?: string;
  name?: string;
}

export interface ThreadRoute extends BoardRoute {
  tid?: string;
}

// TODO: Remove //

export interface Post {
  title: string;
  description: string;
  image: string;
  color: string;
  tags: string[];
  link: string;
}

export interface Listing {
  post: Post;
  hash: string;
  source: string;
  time: number;
}

export type Search = {
  listings: Listing[];
  start: number;
  limit: number;
  size: number;
  total: number;
}

export interface Tags {
  [key: string]: number;
}
