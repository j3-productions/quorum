import api from './api';
// @ts-ignore
import uob from 'urbit-ob';
import { stringToTa } from "@urbit/api";
import { Scry, PokeInterface } from "@urbit/http-api";
import { GetBoard, GetPost, GetPostBad, GenericScry, GenericPoke } from "./types/quorum";

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

export function scryAll(params: GenericScry): Promise<any[]> {
  const apps: string[] = ['quorum-server', 'quorum-client'];
  return Promise.all(apps.map((app: string) =>
    (api.scry({...params, app: app}))
  ));
}

export function fixupScry(params: GenericScry, host: string | undefined): Scry {
  const isLocalBoard: boolean =
    ((host && host.startsWith('~')) ? host.slice(1) : host) === api.ship;
  return {
      ...params,
      app: isLocalBoard ? 'quorum-server' : 'quorum-client',
  };
}

export function fixupPoke(params: GenericPoke, host: string | undefined): PokeInterface<any> {
  const isLocalBoard: boolean =
    ((host && host.startsWith('~')) ? host.slice(1) : host) === api.ship;
  return {
      ...params,
      app: isLocalBoard ? 'quorum-server' : 'quorum-client',
  };
};

export function fixupBoard(board: Omit<GetBoard, 'host'>, local: boolean): GetBoard {
  // FIXME: Doesn't work for the highest possible patp.
  const host: string = local ? api.ship :
    uob.patp(uob.patp2dec(`~${api.ship}`) + 1).slice(1);
  return {host: host, ...board};
};

export function fixupPost(post: GetPostBad): GetPost {
  const {votes, ...data} = {...post};
  return {
    votes: (votes.startsWith("--") ? 1 : -1) *
      parseInt(votes.slice(votes.indexOf("i")+1)),
    ...data,
  };
}
