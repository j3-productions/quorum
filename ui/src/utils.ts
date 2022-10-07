import React, { useCallback, useState } from 'react';
import api from './api';
import { stringToTa } from "@urbit/api";
import { Scry, Poke } from "@urbit/http-api";
import { GetBoard, GetPost, GetPostBad } from "./types/quorum";

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

// a typical api function: takes an arbitrary number of arguments of type A
// and returns a Promise which resolves with a specific response type of R
type ApiFxn<R, A extends any[] = []> = (...args: A) => Promise<R>;

// an updater function: has a similar signature with the original api function,
// but doesn't return anything because it only triggers new api calls
type UpdaterFxn<A extends any[] = []> = (...args: A) => void;

// a simple data reader function: just returns the response type R
type DataFxn<R> = () => R;

// we know we can also transform the data with a modifier function
// which takes as only argument the response type R and returns a different type M
type ModifierFxn<R, M = any> = (response: R) => M;

// therefore, our data reader functions might behave differently
// when we pass a modifier function, returning the modified type M
type ModifiedDataFxn<R> = <M>(modifier: ModifierFxn<R, M>) => M;

// finally, our actual eager and lazy implementations will use
// both versions (with and without a modifier function),
// so we need overloaded types that will satisfy them simultaneously
type DataOrModifiedFxn<R> = DataFxn<R> & ModifiedDataFxn<R>;

// overload for wrapping an apiFunction without params:
// it only takes the api function as an argument
// it returns a data reader with an optional modifier function
export function apiFetch<ResponseType>(
    apiFxn: ApiFxn<ResponseType>,
  ): DataOrModifiedFxn<ResponseType>;

// overload for wrapping an apiFunction with params:
// it takes the api function and all its expected arguments
// also returns a data reader with an optional modifier function
export function apiFetch<ResponseType, ArgTypes extends any[]>(
    apiFxn: ApiFxn<ResponseType, ArgTypes>,
    ...parameters: ArgTypes
  ): DataOrModifiedFxn<ResponseType>;

// implementation that covers the above overloads
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

  // overload for a simple data reader that just returns the data
  function dataReaderFxn(): ResponseType;
  // overload for a data reader with a modifier function
  function dataReaderFxn<M>(modifier: ModifierFxn<ResponseType, M>): M;
  // implementation to satisfy both overloads
  function dataReaderFxn<M>(modifier?: ModifierFxn<ResponseType, M>) {
    if (status === 'init') {
      throw fetcingPromise;
    } else if (status === 'error') {
      throw error;
    }

    return typeof modifier === "function"
      ? modifier(data) as M
      : data as ResponseType;
  }

  return dataReaderFxn;
}

// https://dev.to/andreiduca/practical-implementation-of-data-fetching-with-react-suspense-that-you-can-use-today-273m

// overload for a lazy initializer:
// the only param passed is the api function that will be wrapped
// the returned data reader LazyDataOrModifiedFxn<ResponseType> is "lazy",
//   meaning it can return `undefined` if the api call hasn't started
// the returned updater function UpdaterFxn<ArgTypes>
//   can take any number of arguments, just like the wrapped api function
export function useApiState<ResponseType, ArgTypes extends any[]>(
  apiFunction: ApiFxn<ResponseType, ArgTypes>,
): [UpdaterFxn<ArgTypes>];

// overload for an eager initializer for an api function without params:
// the second param must be `[]` to indicate we want to start the api call immediately
// the returned data reader DataOrModifiedFxn<ResponseType> is "eager",
//   meaning it will always return the ResponseType
//   (or a modified version of it, if requested)
// the returned updater function doesn't take any arguments,
//   just like the wrapped api function
export function useApiState<ResponseType>(
  apiFunction: ApiFxn<ResponseType>,
  eagerLoading: never[], // the type of an empty array `[]` is `never[]`
): [DataOrModifiedFxn<ResponseType>, UpdaterFxn];

// overload for an eager initializer for an api function with params
// the returned data reader is "eager", meaning it will return the ResponseType
//   (or a modified version of it, if requested)
// the returned updater function can take any number of arguments,
//   just like the wrapped api function
export function useApiState<ResponseType, ArgTypes extends any[]>(
  apiFunction: ApiFxn<ResponseType, ArgTypes>,
  ...parameters: ArgTypes
): [DataOrModifiedFxn<ResponseType>, UpdaterFxn<ArgTypes>];

export function useApiState<ResponseType, ArgTypes extends any[]>(
  apiFunction: ApiFxn<ResponseType> | ApiFxn<ResponseType, ArgTypes>,
  ...parameters: ArgTypes
) {
  // initially defined data reader
  const [dataReader, updateDataReader] = useState(() => {
    return !parameters.length ?
      apiFetch(apiFunction as ApiFxn<ResponseType>):
      apiFetch(apiFunction as ApiFxn<ResponseType, ArgTypes >, ...parameters);
  });

  // the updater function
  const updater = useCallback((...newParameters: ArgTypes) => {
    updateDataReader(() =>
      apiFetch(apiFunction as ApiFxn<ResponseType, ArgTypes >, ...newParameters)
    );
  }, [apiFunction]);

  return [dataReader, updater];
};

//
// export function apiFetch(promise, ...params) {
//   // keep data in a local variable so we can synchronously request it later
//   let data: any | undefined = undefined;
//   // keep track of progress and errors
//   let status: 'init' | 'error' | 'done' = 'init';
//   let error: Error | undefined = undefined;
//
//   // call the api function immediately, starting fetching
//   const fetchingPromise = promise(...params)
//     .then((r) => {
//       data = r;
//       status = 'done';
//     })
//     .catch((e) => {
//       error = e;
//       status = 'error';
//     });
//
//   // this is the data reader function that will return the data,
//   // or throw if it's not ready or has errored
//   return () => {
//     if (status === 'init') {
//       throw fetchingPromise;
//     } else if (status === 'error') {
//       throw error;
//     }
//     return data;
//   }
// }
//
// export function useApiState(promise, ...params) {
//   const [data, setData] = useState(() => apiFetch(promise, ...params));
//
//   const updateData = useCallback((...newparams) => {
//     setData(() => apiFetch(promise, ...newparams));
//   }, [promise]);
//
//   return [data, updateData];
// }

//////////////////////////////////////
/// App-Specific Utility Functions ///
//////////////////////////////////////

export function apiScry<Type>(path: string): Promise<Type> {
  return api.scry<Type>({
    app: 'quorum-agent',
    path: path,
  });
}

// export function apiPoke(path: string): Poke<TODOPokeDataObject> {
//   return {
//     app: 'quorum-agent',
//     path: path,
//   };
// }

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
