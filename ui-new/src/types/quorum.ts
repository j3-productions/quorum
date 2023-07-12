export type BoardTagMode = 'unrestricted' | 'restricted';

/// Scry Types ///

export interface ThreadMeta {
  replies: number[];
  'best-id': number;
  title: string;
  tags: string[];
}

export interface PostVotes {
  [voter: string]: string;
}

export interface PostEdit {
  author: string;
  content: string;
  timestamp: number;
}

export interface BoardPost {
  'post-id': number;
  'parent-id': number;
  comments: number[];
  votes: PostVotes;
  history: PostEdit[];
  board: string;
  group: string;
  thread?: ThreadMeta;
}

export interface BoardMeta {
  board: string;
  group: string;
  writers: string[];
  title: string;
  description: string;
  'allowed-tags': string[];
  'next-id': number;
}

export interface BoardThread {
  thread: BoardPost;
  posts: BoardPost[];
}

export interface BoardPage {
  posts: BoardPost[];
  pages: number;
}

export interface QuorumBrief {
  last: number;
  count: number;
  'read-id': string | null;
}

export interface QuorumBriefs {
  [flag: string]: QuorumBrief;
}

export interface QuorumBriefUpdate {
  flag: string;
  brief: QuorumBrief;
}

/// Poke Types ///

export interface QuorumNewBoard {
  group: string;
  writers: string[];
  title: string;
  description: string;
  tags: string[];
}

export type QuorumJoinBoard = null;

export interface QuorumEditBoard {
  title?: string;
  description?: string;
  tags?: string[];
}

export type QuorumDeleteBoard = null;

export interface QuorumNewThread {
  title: string;
  tags: string[];
  content: string;
}

export interface QuorumEditThread {
  'post-id': number;
  'best-id'?: number;
  title?: string;
  tags?: string[];
}

export interface QuorumNewReply {
  'parent-id': number;
  content: string;
  'is-comment': boolean;
}

export interface QuorumEditPost {
  'post-id': number;
  content: string;
}

export interface QuorumDeletePost {
  'post-id': number;
}

export interface QuorumVote {
  'post-id': number;
  dir: 'up' | 'down';
}

export interface QuorumCreate {
  group: string;
  name: string;
  title: string;
  description: string;
  readers: string[];
  writers: string[];
}

export interface QuorumJoin {
  group: string;
  chan: string;
}

export type QuorumUpdate =
  | {'new-board': QuorumNewBoard}
  | {'edit-board': QuorumEditBoard}
  | {'delete-board': QuorumDeleteBoard}
  | {'new-thread': QuorumNewThread}
  | {'edit-thread': QuorumEditThread}
  | {'new-reply': QuorumNewReply}
  | {'edit-post': QuorumEditPost}
  | {'delete-post': QuorumDeletePost}
  | {'vote': QuorumVote};

export interface QuorumAction {
  board: string;
  update: QuorumUpdate;
}

export type SurfAction = [string, "quorum", "updates", string, string, null];
