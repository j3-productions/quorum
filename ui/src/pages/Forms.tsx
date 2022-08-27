import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import debounce from 'lodash.debounce';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MultiValue } from 'react-select';
import { ErrorMessage } from '../components/ErrorMessage';
import { Option, TagField } from '../components/TagField';
import { Strand } from '../components/Strand';
import {
  GetBoard, GetQuestion, GetThread,
  PostBoard, PostJoin, PostQuestion, PostAnswer,
  BoardRoute, ThreadRoute
} from '../types/quorum';
import { fixupPost } from '../utils';

// TODO: Improve error handling behavior for 'onError' in forms.
// TODO: Use react-dom to redirect to the created item on success.
// TODO: Add return types to 'onSubmit' functions (input type).
// TODO: Abstract out all form components as follows:
// - [ ] Tag Entry
// - [ ] Short String Entry
// - [ ] Long String Entry
// - [ ] Image Entry
// - [ ] Form Container
// TODO: Clean up data types for `api.scry` type check (need to account
// for Urbit wrappers).
// TODO: Add type checks to `onSubmit` and `api.poke` methods.

// Form Parameters:
// - Title
// - Dismiss Button
//   - Text
//   - Link
// - Submit Button
//   - Text
//   - Link(s) (onSuccess, onFail)
// - Fields
//   - Short Text Field
//     - Title
//     - Default Text
//   - Long Text Field (Markdown)
//     - Title
//     - Default Text
//     - Default Size
//   - Tags Field
//   - Image Field
//   - Random HTML (For Preview Strand)

const errorMessages = (length: number) => {
  return {
    required: 'This field is required.',
    maxLength: `The maximum length is ${length}.`
  }
}

export const Create = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<MultiValue<Option>>([]);
  const [image, setImage] = useState<string>('');
  const form = useForm<PostBoard>({
    defaultValues: {
      name: '',
      desc: '',
      image: '',
      tags: [],
    }
  });

  const {register, watch, reset, setValue, handleSubmit} = form;

  const updateImg = useRef(debounce(setImage));
  const img = watch('image');

  const onSubmit = useCallback((values/*: PostBoard*/) => {
    api.poke({
      app: 'quorum-server',
      mark: 'server-poke',
      json: {
        'add-board': {
          ...values,
          tags: tags.map(t => t.value),
        }
      },
      onSuccess: () => {
        navigate(`./../board/~${api.ship}/${values.name}`, {replace: true});
      },
      onError: () => {
        // reset();
        // setTags([]);
        console.log("Failed to create the board!");
      },
    })
  }, [tags]);

  // TODO: Reset image as well upon submission.
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
                  <input {...register('name', {required: true, maxLength: 77})} className='flex-1 w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='quorum'/>
                  {/* TODO: Add in a labeled 'private' toggle button here. */}
                </div>
                <ErrorMessage className='mt-1' field="name" messages={errorMessages(77)}/>
              </div>
              <div>
                <label htmlFor='desc' className='text-sm font-semibold'>Description</label>
                <textarea {...register('desc', {required: true, maxLength: 256})} rows={2} className='align-middle w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='Insert markdown-compatible text here.' />
                <ErrorMessage className='mt-1' field="desc" messages={errorMessages(256)} />
              </div>
              <div className='flex items-center space-x-6'>
                <div className='flex-1'>
                  <div>
                    <label htmlFor='image' className='text-sm font-semibold'>Image</label>
                    <input type="url" {...register('image', {
                      maxLength: 1024
                    })} className='flex-1 w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='https://example.com/image.png' />
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

export const Join = () => {
  const form = useForm<PostJoin>({
    defaultValues: {
      path: '',
    }
  });

  const {register, watch, reset, setValue, handleSubmit} = form;

  const onSubmit = useCallback((values/*: PostJoin*/) => {
    // api.poke({
    //   app: 'quorum-server',
    //   mark: 'client-poke',
    //   json: {
    //     'join-board': {
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
                  <input {...register('path', {required: true, maxLength: 77})} className='flex-1 w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='~sampel-palnet/board-name'/>
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

export const Question = () => {
  const navigate = useNavigate();
  const {planet, board} = useParams<BoardRoute>();
  const [tags, setTags] = useState<MultiValue<Option>>([]);
  const form = useForm<PostQuestion>({
    defaultValues: {
      title: '',
      body: '',
      tags: [],
    }
  });

  const {register, watch, reset, setValue, handleSubmit} = form;

  const onSubmit = useCallback((values/*: PostQuestion*/) => {
    api.poke({
      app: 'quorum-server',
      mark: 'client-poke',
      json: {
        'add-question': {
          ...values,
          name: board,
          tags: tags.map(t => t.value),
        }
      },
      onSuccess: () => {
        // TODO: We should redirect to the question here, but to do so we need
        // some way of requesting its ID after it is submitted.
        navigate("./..", {replace: true});
      },
      onError: () => {
        // reset();
        // setTags([]);
        console.log("Failed to submit the question!");
      },
    })
  }, [tags]);

  return (
    <div className='w-full space-y-6'>
      {/*^m-auto*/}
      <header>
        <h1 className='text-2xl font-semibold'>Submit Question to '{board}'</h1>
      </header>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex w-full space-x-6'>
            <div className='flex-1 space-y-3'>
              <div>
                <label htmlFor='title' className='text-sm font-semibold'>Title</label>
                <div className='flex items-center space-x-2'>
                  <input {...register('title', {required: true, maxLength: 77})} className='flex-1 w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='What is the question?'/>
                </div>
                <ErrorMessage className='mt-1' field="title" messages={errorMessages(77)}/>
              </div>
              <div>
                <label htmlFor='body' className='text-sm font-semibold'>Body</label>
                <textarea {...register('body', {required: true, maxLength: 256})} rows={2} className='align-middle w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='Insert markdown-compatible text here.' />
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

export const Answer = () => {
  const navigate = useNavigate();
  const {planet, board, tid} = useParams<ThreadRoute>();
  const [thread, setThread] = useState<GetThread>({
    question: undefined,
    answers: [],
  });

  useEffect(() => {
    api.scry({
      app: 'quorum-server',
      path: `/thread/${board}/${tid}`,
    }).then(
      (result) => (setThread({
        'question': fixupPost(result['question']) as GetQuestion,
        'answers': [],
      })),
      (err) => (console.log(err)),
    );
  }, [thread]);

  const form = useForm<PostAnswer>({
    defaultValues: {
      name: '',
      parent: 0,
      body: '',
    }
  });

  const {register, watch, reset, setValue, handleSubmit} = form;

  const onSubmit = useCallback((values/*: PostAnswer*/) => {
    api.poke({
      app: 'quorum-server',
      mark: 'client-poke',
      json: {
        'add-answer': {
          body: values.body,
          name: board,
          parent: parseInt(tid || "0"),
        }
      },
      onSuccess: () => {
        navigate("./..", {replace: true});
      },
      onError: () => {
        // reset();
        console.log("failed to submit answer!");
      },
    })
  }, []);

  return !thread.question ? (<></>) : (
    <div className='w-full space-y-6'>
      {/*^m-auto*/}
      <header>
        <h1 className='text-2xl font-semibold'>Submit Answer</h1>
      </header>
      <Strand key={thread.question.id} content={thread.question}/>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex w-full space-x-6'>
            <div className='flex-1 space-y-3'>
              <div>
                <label htmlFor='body' className='text-sm font-semibold'>Response</label>
                <textarea {...register('body', {required: true, maxLength: 256})} rows={2} className='align-middle w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='Insert markdown-compatible text here.' />
                <ErrorMessage className='mt-1' field="body" messages={errorMessages(256)} />
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

export const Settings = () => {
  return (
    <div>
      TODO: Settings page goes here.
    </div>
  )
}
