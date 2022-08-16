import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { MultiValue } from 'react-select';
import api from '../api';
import debounce from 'lodash.debounce';
import { ErrorMessage } from '../components/ErrorMessage';
import { Option, TagField } from '../components/TagField';
import { BoardRoute, QuestionMeta } from '../types/quorum';

// TODO: Improve type checking in this file once 'BoardMeta' is closer to final.
// TODO: Add image uri and tags once they exist in the back-end.
// TODO: Figure out how to redirect to board page after submit.

function errorMessages(length: number) {
  return {
    required: 'This field is required.',
    maxLength: `The maximum length is ${length}.`
  }
}

export const Question = () => {
  // TODO: Use react-dom to redirect to the new question on success.

  const { planet, name } = useParams<BoardRoute>();
  const [tags, setTags] = useState<MultiValue<Option>>([]);
  const form = useForm<QuestionMeta>({
    defaultValues: {
      title: '',
      body: '',
      tags: [],
    }
  });

  const { register, watch, reset, setValue, handleSubmit } = form;

  // const onSubmit = useCallback((values: Omit<PostForm, 'tags'>) => {
  const onSubmit = useCallback((values/*: QuestionMeta*/) => {
    // api.poke<BoardPostData>
    api.poke({
      app: 'quorum-server',
      mark: 'client-poke',
      json: {
        'add-question': {
          ...values,
          name: name,
          tags: tags.map(t => t.value),
        }
      }
    })
    reset();
    setTags([]);
  }, [tags]);

  return (
    <div className='w-full space-y-6'>
      {/*^m-auto*/}
      <header>
        <h1 className='text-2xl font-semibold'>Submit Question to '{name}'</h1>
      </header>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex w-full space-x-6'>
            <div className='flex-1 space-y-3'>
              <div>
                <label htmlFor='title' className='text-sm font-semibold'>Title</label>
                <div className='flex items-center space-x-2'>
                  <input {...register('title', { required: true, maxLength: 77 })} className='flex-1 w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='What is the question?'/>
                </div>
                <ErrorMessage className='mt-1' field="title" messages={errorMessages(77)}/>
              </div>
              <div>
                <label htmlFor='body' className='text-sm font-semibold'>Body</label>
                <textarea {...register('body', { required: true, maxLength: 256 })} rows={2} className='align-middle w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='Insert markdown-compatible text here.' />
                <ErrorMessage className='mt-1' field="body" messages={errorMessages(256)} />
              </div>
              <div>
                <label className='text-sm font-semibold'>Tags</label>
                <TagField tags={tags} onTags={setTags} />
                {tags.length === 8 && <div className='text-mauve/50 text-xs mt-1'>8 tags maximum</div>}
              </div>
              <div className='pt-3'>
                <div className='flex justify-between border-t border-zinc-300 py-3'>
                  <Link to="./.." className='flex items-center rounded-lg text-base font-semibold text-rosy bg-rosy/30 border-2 border-transparent hover:border-rosy leading-none py-2 px-3 transition-colors'>
                    Dismiss
                  </Link>
                  <button type="submit" className='flex items-center rounded-lg text-base font-semibold text-linen bg-rosy border-2 border-transparent hover:border-linen/60 leading-none py-2 px-3 transition-colors'>
                    Submit
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
