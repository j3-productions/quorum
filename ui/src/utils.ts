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
    votes: parseInt(votes.slice(1, votes.indexOf("i"))),
    ...data,
  };
}
