import api from './api';
import { stringToTa } from "@urbit/api";
import { Scry, PokeInterface } from "@urbit/http-api";
import {
    GetBoard, GetBoardBad,
    GetPost, GetPostBad,
    GenericScry, GenericPoke
} from "./types/quorum";

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

export function fixupScry(host: string | undefined, params: GenericScry): Scry {
  const {path: serverPath, ...data} = params;

  let clientPathComps: string[] = serverPath.split('/');
  clientPathComps.splice(2, 0, host || apiHost);
  const clientPath = clientPathComps.join('/');

  return {
    app: (host === apiHost) ? 'quorum-server' : 'quorum-client',
    path: (host === apiHost) ? serverPath : clientPath,
    ...data,
  };
}

export function fixupPoke(host: string | undefined, params: GenericPoke): PokeInterface<any> {
  const {json, mark, ...data} = params;

  // mark: needs to be 'client-action' for server, 'client-pass' for client

  return {
    app: (host === apiHost) ? 'quorum-server' : 'quorum-client',
    mark: (mark === 'client-action' && host !== apiHost) ? 'client-pass' : mark,
    json: (host === apiHost) ? json : {dove: {
      host: host,
      name: json[Object.keys(json)[0]].name,
      action: json,
    }},
    ...data,
  };
};

export function fixupBoard(host: string | undefined, board: GetBoardBad): GetBoard {
  return {
    host: host || apiHost,
    ...board
  };
};

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
