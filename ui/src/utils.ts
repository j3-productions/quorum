import React, { useCallback, useState } from 'react';
import api from './api';
import { stringToTa } from "@urbit/api";
import { Scry, PokeInterface } from "@urbit/http-api";
import * as Type from "./types/quorum";

/////////////////////////////
/// Application Constants ///
/////////////////////////////

export const appHost: string = `~${api.ship}`;
export const termRegex: RegExp = /^[a-z][a-z0-9\-]*$/;
export const shipRegex: RegExp = /^~(([a-z]{3})|([a-z]{6}(\-[a-z]{6}){0,3})|([a-z]{6}(\-[a-z]{6}){3})\-\-([a-z]{6}(\-[a-z]{6}){3}))$/;

/////////////////////////////////
/// General Utility Functions ///
/////////////////////////////////

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

// https://dev.to/andreiduca/practical-implementation-of-data-fetching-with-react-suspense-that-you-can-use-today-273m
export function apiFetch<ResponseType>(
    apiFxn: Type.ApiFxn<ResponseType>,
  ): Type.DataOrModifiedFxn<ResponseType>;
export function apiFetch<ResponseType, ArgTypes extends any[]>(
    apiFxn: Type.ApiFxn<ResponseType, ArgTypes>,
    ...parameters: ArgTypes
  ): Type.DataOrModifiedFxn<ResponseType>;
export function apiFetch<ResponseType, ArgTypes extends any[] = []>(
    apiFxn: Type.ApiFxn<ResponseType, ArgTypes>,
    ...parameters: ArgTypes) {
  type AsyncStatus = 'init' | 'done' | 'error';

  let data: ResponseType;
  let status: AsyncStatus = 'init';
  let error: any;

  const fetcingPromise = apiFxn(...parameters)
    .then((response) => {
      data = response;
      status = 'done';
    })
    .catch((e) => {
      error = e;
      status = 'error';
    });

  function dataReaderFxn(): ResponseType;
  function dataReaderFxn<M>(modifier: Type.ModifierFxn<ResponseType, M>): M;
  function dataReaderFxn<M>(modifier?: Type.ModifierFxn<ResponseType, M>) {
    if (status === 'init') {
      throw fetcingPromise;
    } else if (status === 'error') {
      throw error;
    }
    return (typeof modifier === "function") ?
      modifier(data) as M :
      data as ResponseType;
  }

  return dataReaderFxn;
}

export function useFetch<ResponseType, ArgTypes extends any[]>(
    apiFunction: Type.ApiFxn<ResponseType, ArgTypes>,
  ): [Type.UpdaterFxn<ArgTypes>];
export function useFetch<ResponseType>(
    apiFunction: Type.ApiFxn<ResponseType>,
    // eagerLoading: never[], // the type of an empty array `[]` is `never[]`
  ): [Type.DataOrModifiedFxn<ResponseType>, Type.UpdaterFxn];
export function useFetch<ResponseType, ArgTypes extends any[]>(
    apiFunction: Type.ApiFxn<ResponseType, ArgTypes>,
    ...parameters: ArgTypes
  ): [Type.DataOrModifiedFxn<ResponseType>, Type.UpdaterFxn<ArgTypes>];
export function useFetch<ResponseType, ArgTypes extends any[]>(
    apiFunction: Type.ApiFxn<ResponseType> | Type.ApiFxn<ResponseType, ArgTypes>,
    ...parameters: ArgTypes) {
  const [dataReader, updateDataReader] = useState(() => {
    return !parameters.length ?
      apiFetch(apiFunction as Type.ApiFxn<ResponseType>):
      apiFetch(apiFunction as Type.ApiFxn<ResponseType, ArgTypes >, ...parameters);
  });

  const updater = useCallback((...newParameters: ArgTypes) => {
    updateDataReader(() =>
      apiFetch(apiFunction as Type.ApiFxn<ResponseType, ArgTypes >, ...newParameters)
    );
  }, [apiFunction]);

  return [dataReader, updater];
}

export function encodeLookup(value: string | undefined) {
  return !value ? '' : stringToTa(value).replace('~.', '~~');
}

export function strVoid(value: string | undefined): string | undefined {
  return (value && value !== "") ? value : undefined;
}

export function patpFormat(patp: string): string {
  const patpSplit = patp.slice(1).split("-");
  const patpComps = patpSplit.length;
  switch (patpComps) {
    // galaxies, stars, planets
    case 0:
    case 1:
    case 2:
      return patp;
    // moons
    case 3:
    case 4:
      return `~${patpSplit[patpComps - 2]}^${patpSplit[patpComps - 1]}`;
    // comets
    default:
      return `~${patpSplit[0]}_${patpSplit[patpComps - 1]}`;
  };
}

//////////////////////////////////////
/// App-Specific Utility Functions ///
//////////////////////////////////////

export function apiScry<T>(path: string): Promise<T> {
  return api.scry<T>({
    app: 'quorum-agent',
    path: path,
  });
}

export function apiPoke<T extends object>(params: Omit<PokeInterface<T>, 'app' | 'mark'>):
    Promise<number> {
  const jsonAction: string = Object.keys(params.json)[0];
  const jsonHost: Type.U<string> = ['sub', 'unsub', 'dove'].includes(jsonAction) ?
    ((params.json as {[index: string]: {host: string};})[jsonAction]['host']) : undefined;

  return api.poke<T>({
    app: 'quorum-agent',
    mark: (['add-board', 'toggle'].includes(jsonAction)) ? 'quorum-beans' : 'quorum-outs',
    ...params
  // FIXME: Subscription-based data takes a bit longer to come back,
  // so we just wait a bit. This should be removed and replaced with
  // a more reliable check on incoming subscription data.
  }).then((result: number) =>
    new Promise(resolve => {
      setTimeout(resolve, (jsonHost === appHost) ? 0 : 2000);
      return result;
    })
  );
}

export function fixupPost(host: string | undefined, post: Type.ScryPoast): Type.Poast {
  const {votes, who, ...data} = post;
  return {
    who: `~${who}`,
    host: host || appHost,
    votes: (votes.startsWith("--") ? 1 : -1) *
      parseInt(votes.slice(votes.indexOf("i")+1)),
    ...data,
  };
}
