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
