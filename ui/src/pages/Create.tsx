import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { MultiValue } from 'react-select';
import api from '../api';
import debounce from 'lodash.debounce';
import { ErrorMessage } from '../components/ErrorMessage';
import { Option, TagField } from '../components/TagField';
import { BoardMeta } from '../types/sphinx';

// TODO: Improve type checking in this file once 'BoardMeta' is closer to final.
// TODO: Add image uri and tags once they exist in the back-end.
// TODO: Figure out how to redirect to board page after submit.

export interface BoardMetaBeta extends BoardMeta {
  image: string;
  // tags: string[];
}

function errorMessages(length: number) {
  return {
    required: 'This field is required.',
    maxLength: `The maximum length is ${length}.`
  }
}

export const Create = () => {
  const [tags, setTags] = useState<MultiValue<Option>>([]);
  const [image, setImage] = useState<string>('');
  const form = useForm<BoardMetaBeta>({
    defaultValues: {
      name: '',
      description: '',
      image: '',
      // tags: [],
    }
  });

  const { register, watch, reset, setValue, handleSubmit } = form;

  const updateImg = useRef(debounce(setImage));
  const img = watch('image');

  // const onSubmit = useCallback((values: Omit<PostForm, 'tags'>) => {
  const onSubmit = useCallback((values/*: BoardMeta*/) => {
    // api.poke<BoardPostData>
    api.poke({
      app: 'quorum-server',
      mark: 'server-poke',
      json: {
        'add-board': {
          ...values,
          // tags: tags.map(t => t.value)
        }
      }
    })
    reset();
    setTags([]);
  }, [tags]);

  useEffect(() => {
    if (img) {
      updateImg.current(img)
    }
  }, [img]);

  return (
    <div className='w-full space-y-6'>
      {/*^m-auto*/}
      <header>
        <h1 className='text-2xl font-semibold'>Create Knowledge Board</h1>
      </header>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex w-full space-x-6'>
            <div className='flex-1 space-y-3'>
              <div>
                <label htmlFor='name' className='text-sm font-semibold'>Name</label>
                <div className='flex items-center space-x-2'>
                  <input {...register('name', { required: true, maxLength: 77 })} className='flex-1 w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='sphinx'/>
                  {/* TODO: Add in a labeled 'private' toggle button here. */}
                </div>
                <ErrorMessage className='mt-1' field="name" messages={errorMessages(77)}/>
              </div>
              <div>
                <label htmlFor='description' className='text-sm font-semibold'>Description</label>
                <textarea {...register('description', { required: true, maxLength: 256 })} rows={2} className='align-middle w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='An app for answering your riddles' />
                <ErrorMessage className='mt-1' field="description" messages={errorMessages(256)} />
              </div>
              <div className='flex items-center space-x-6'>
                <div className='flex-1'>
                  <div>
                    <label htmlFor='image' className='text-sm font-semibold'>Image</label>
                    <input type="url" {...register('image', {
                      maxLength: 1024
                    })} className='flex-1 w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='https://nyc3.digitaloceanspaces.com/...' />
                    <ErrorMessage className='mt-1' field="image" messages={errorMessages(1024)}/>
                  </div>
                  <div>
                    <label className='text-sm font-semibold'>Tags</label>
                    <TagField tags={tags} onTags={setTags} />
                    {tags.length === 8 && <div className='text-mauve/50 text-xs mt-1'>8 tags maximum</div>}
                  </div>
                </div>
                <img className='flex-none object-cover w-28 h-28 mt-4 border-2 border-dashed border-mauve/60 rounded-lg' src={image || undefined} />
              </div>
              <div className='pt-3'>
                <div className='flex justify-between border-t border-zinc-300 py-3'>
                  <Link to="/" className='flex items-center rounded-lg text-base font-semibold text-rosy bg-rosy/30 border-2 border-transparent hover:border-rosy leading-none py-2 px-3 transition-colors'>
                    Dismiss
                  </Link>
                  <button type="submit" className='flex items-center rounded-lg text-base font-semibold text-linen bg-rosy border-2 border-transparent hover:border-linen/60 leading-none py-2 px-3 transition-colors'>
                    Publish
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
