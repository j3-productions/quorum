import { stringToTa } from "@urbit/api";
import { GetPost, GetPostBad } from "./types/quorum";

export function encodeLookup(value: string | undefined) {
  if (!value) {
    return '';
  }

  return stringToTa(value).replace('~.', '~~');
}

// Object.assign, but recursive.
// (See: https://stackoverflow.com/a/37164538/837221)
export function mergeDeep(
    target: {[index: string]: any},
    source: {[index: string]: any}):
      {[index: string]: any} {
  const isObject = (item: any): item is {[index: string]: any} => {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

export function fixupPost(post: GetPostBad): GetPost {
  const {votes, ...data} = {...post};
  return {
    votes: (votes.startsWith("--") ? 1 : -1) *
      parseInt(votes.slice(votes.indexOf("i")+1)),
    ...data,
  };
}
