import { stringToTa } from "@urbit/api";
import { GetPost, GetPostBad } from "./types/quorum";

export function encodeLookup(value: string | undefined) {
  if (!value) {
    return '';
  }

  return stringToTa(value).replace('~.', '~~');
}

export function fixupPost(post: GetPostBad): GetPost {
  const {votes, ...data} = {...post};
  return {
    votes: (votes.startsWith("--") ? 1 : -1) *
      parseInt(votes.slice(votes.indexOf("i")+1)),
    ...data,
  };
}
