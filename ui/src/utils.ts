import api from './api';
import { stringToTa } from "@urbit/api";
import { Scry, PokeInterface } from "@urbit/http-api";
import { GetBoard, GetPost, GetPostBad } from "./types/quorum";

/// Constants ///

export const apiHost: string = `~${api.ship}`;

/// General Utility Functions ///

export function encodeLookup(value: string | undefined) {
  return !value ? '' : stringToTa(value).replace('~.', '~~');
}

// https://stackoverflow.com/a/37164538/837221
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
        Object.assign(output, {[key]: source[key]});
      }
    });
  }

  return output;
}

/// App-Specific Utility Functions ///

// FIXME: 'host' should be the second argument in all of these functions,
// but `lodash.curryRight` doesn't work so it needs to be the first argument
// to make other bits of `array.map(curry(result)(host))` code to work.

export function fixupPost(host: string | undefined, post: GetPostBad): GetPost {
  const {votes, who, ...data} = post;
  return {
    who: `~${who}`,
    host: host || apiHost,
    votes: (votes.startsWith("--") ? 1 : -1) *
      parseInt(votes.slice(votes.indexOf("i")+1)),
    ...data,
  };
}
