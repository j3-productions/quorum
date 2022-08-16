// Meta Types //

export interface BoardMeta {
  name: string;
  description: string;
  tags: string[];
  image: string;
}

export interface PostMeta {
  board: string;
  id: number;
  date: number;
  title: string;
  body: string;
  votes: number;
  who: string;
  tags: string[];
}

export interface QuestionMeta {
  title: string;
  body: string;
  tags: string[];
}

// Route Types //

interface BoardRoute extends Record<string, string | undefined> {
  planet?: string;
  name?: string;
}

interface ThreadRoute extends BoardRoute {
  tid?: string;
}

// TODO: Remove //

export interface Post {
  title: string;
  type: PostType;
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
