import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { MultiValue } from 'react-select';
import api from '../api';
import debounce from 'lodash.debounce';
import { ErrorMessage } from '../components/ErrorMessage';
import { Option, TagField } from '../components/TagField';
import { BoardMeta } from '../types/quorum';

// TODO: Improve type checking in this file once 'BoardMeta' is closer to final.
// TODO: Add image uri and tags once they exist in the back-end.
// TODO: Figure out how to redirect to board page after submit.

function errorMessages(length: number) {
  return {
    required: 'This field is required.',
    maxLength: `The maximum length is ${length}.`
  }
}

export const Join = () => {
  // const form = useForm<BoardMetaBeta>({
  const form = useForm({
    defaultValues: {
      path: '',
    }
  });

  const { register, watch, reset, setValue, handleSubmit } = form;

  // const onSubmit = useCallback((values: Omit<PostForm, 'tags'>) => {
  const onSubmit = useCallback((values/*: BoardMeta*/) => {
    // api.poke<BoardJoin>
    // api.poke({
    //   app: 'quorum-server',
    //   mark: 'server-poke',
    //   json: {
    //     'add-board': {
    //       ...values,
    //       // tags: tags.map(t => t.value)
    //     }
    //   }
    // })
    reset();
  }, []);

  return (
    <div className='w-full space-y-6'>
      {/*^m-auto*/}
      <header>
        <h1 className='text-2xl font-semibold'>Join Knowledge Board</h1>
      </header>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex w-full space-x-6'>
            <div className='flex-1 space-y-3'>
              <div>
                <label htmlFor='path' className='text-sm font-semibold'>Path</label>
                <div className='flex items-center space-x-2'>
                  <input {...register('path', { required: true, maxLength: 77 })} className='flex-1 w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='~sampel-palnet/board-name'/>
                  {/* TODO: Add in a labeled 'private' toggle button here. */}
                </div>
                <ErrorMessage className='mt-1' field="path" messages={errorMessages(77)}/>
              </div>
              <div className='pt-3'>
                <div className='flex justify-between border-t border-zinc-300 py-3'>
                  <Link to="/" className='flex items-center rounded-lg text-base font-semibold text-rosy bg-rosy/30 border-2 border-transparent hover:border-rosy leading-none py-2 px-3 transition-colors'>
                    Dismiss
                  </Link>
                  <button type="submit" className='flex items-center rounded-lg text-base font-semibold text-linen bg-rosy border-2 border-transparent hover:border-linen/60 leading-none py-2 px-3 transition-colors'>
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
