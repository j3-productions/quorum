import { stringToTa } from "@urbit/api";
import { BadPostMeta, PostMeta } from "./types/quorum";

export function encodeLookup(value: string | undefined) {
  if (!value) {
    return '';
  }

  return stringToTa(value).replace('~.', '~~');
}

export function fixupEntry(post: BadPostMeta): PostMeta {
  const {votes, ...data} = {...post};
  return {
    votes: parseInt(votes.slice(1, votes.indexOf("i"))),
    ...data,
  };
}
