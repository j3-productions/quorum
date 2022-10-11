import React, { useCallback, useState } from 'react';
import api from './api';
import { stringToTa } from "@urbit/api";
import { Scry, PokeInterface } from "@urbit/http-api";
import {
  GetBoard, GetPost, GetPostBad,
  ApiFxn, UpdaterFxn, DataFxn,
  ModifierFxn, ModifiedDataFxn, DataOrModifiedFxn,
} from "./types/quorum";

/////////////////////////////
/// Application Constants ///
/////////////////////////////

export const apiHost: string = `~${api.ship}`;

/////////////////////////////////
/// General Utility Functions ///
/////////////////////////////////

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

// https://dev.to/andreiduca/practical-implementation-of-data-fetching-with-react-suspense-that-you-can-use-today-273m
export function apiFetch<ResponseType>(
    apiFxn: ApiFxn<ResponseType>,
  ): DataOrModifiedFxn<ResponseType>;
export function apiFetch<ResponseType, ArgTypes extends any[]>(
    apiFxn: ApiFxn<ResponseType, ArgTypes>,
    ...parameters: ArgTypes
  ): DataOrModifiedFxn<ResponseType>;
export function apiFetch<ResponseType, ArgTypes extends any[] = []>(
    apiFxn: ApiFxn<ResponseType, ArgTypes>,
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
  function dataReaderFxn<M>(modifier: ModifierFxn<ResponseType, M>): M;
  function dataReaderFxn<M>(modifier?: ModifierFxn<ResponseType, M>) {
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
    apiFunction: ApiFxn<ResponseType, ArgTypes>,
  ): [UpdaterFxn<ArgTypes>];
export function useFetch<ResponseType>(
    apiFunction: ApiFxn<ResponseType>,
    // eagerLoading: never[], // the type of an empty array `[]` is `never[]`
  ): [DataOrModifiedFxn<ResponseType>, UpdaterFxn];
export function useFetch<ResponseType, ArgTypes extends any[]>(
    apiFunction: ApiFxn<ResponseType, ArgTypes>,
    ...parameters: ArgTypes
  ): [DataOrModifiedFxn<ResponseType>, UpdaterFxn<ArgTypes>];
export function useFetch<ResponseType, ArgTypes extends any[]>(
    apiFunction: ApiFxn<ResponseType> | ApiFxn<ResponseType, ArgTypes>,
    ...parameters: ArgTypes) {
  const [dataReader, updateDataReader] = useState(() => {
    return !parameters.length ?
      apiFetch(apiFunction as ApiFxn<ResponseType>):
      apiFetch(apiFunction as ApiFxn<ResponseType, ArgTypes >, ...parameters);
  });

  const updater = useCallback((...newParameters: ArgTypes) => {
    updateDataReader(() =>
      apiFetch(apiFunction as ApiFxn<ResponseType, ArgTypes >, ...newParameters)
    );
  }, [apiFunction]);

  return [dataReader, updater];
};

//////////////////////////////////////
/// App-Specific Utility Functions ///
//////////////////////////////////////

export function apiScry<Type>(path: string): Promise<Type> {
  return api.scry<Type>({
    app: 'quorum-agent',
    path: path,
  });
}

export function apiPoke<Type extends object>(params: Omit<PokeInterface<Type>, 'app' | 'mark'>):
    Promise<number> {
  const jsonAction: string = Object.keys(params.json)[0];

  return api.poke<Type>({
    app: 'quorum-agent',
    mark: (jsonAction === 'add-board') ? 'quorum-beans' : 'quorum-outs',
    ...params
  });
}

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
