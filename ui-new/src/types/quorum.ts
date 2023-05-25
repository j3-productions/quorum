export type ChannelTagMode = 'unrestricted' | 'restricted';

export interface ChannelSettingsSchema {
  tags: {
    mode: ChannelTagMode;
    edits?: {
      add: string[];
      rem: string[];
    };
  };
};

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
