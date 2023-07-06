import { produce } from 'immer';
import { BoardPost, PostVotes, PostEdit } from '@/types/quorum';


export function calcScore(post: BoardPost): number {
  return Object.values(post.votes).reduce(
    (n, i) => n + (i === "up" ? 1 : -1),
    0
  );
}

export function calcScoreStr(post: BoardPost): string {
  const score = calcScore(post);
  return `${score >= 0 ? "+" : ""}${score}`;
}

export function getOriginalEdit(post: BoardPost): PostEdit {
  return post.history[post.history.length - 1];
}

export function getLatestEdit(post: BoardPost): PostEdit {
  return post.history[0];
}

export function getSnapshotAt(post: BoardPost, edit: number): BoardPost {
  return produce(post, ({history}: BoardPost) => {
    for (let i = 0; i < edit; i++) {
      history.shift();
    }
  });
}
