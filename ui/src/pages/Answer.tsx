import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import debounce from 'lodash.debounce';
import { Strand } from '../components/Strand';
import { ErrorMessage } from '../components/ErrorMessage';
import { AnswerMeta, ThreadMeta, ThreadRoute } from '../types/quorum';
import { fixupEntry } from '../utils';

function errorMessages(length: number) {
  return {
    required: 'This field is required.',
    maxLength: `The maximum length is ${length}.`
  }
}

export const Answer = () => {
  // TODO: Use react-dom to redirect to the question (i.e. ./../)
  // on success.
  const {planet, name, tid} = useParams<ThreadRoute>();
  const [data, setData] = useState<ThreadMeta>({
    answers: [],
    question: {
      id: parseInt(tid || "0"),
      date: 0,
      body: "",
      votes: 0,
      who: planet || "~zod",
      title: "",
      tags: [],
    },
  });

  // `api.scry<ReturnType>`: template type is the return type for the function
  // data:
  useEffect(() => {
    // TODO: api.scry<PostMetaData[]>(...); real return is:
    //   {questions: PostMetaData[], date: number}
    api.scry({
      app: 'quorum-server',
      path: `/thread/${name}/${tid}`,
    }).then(
      (result) => (setData({
        'question': fixupEntry(result['question']),
        'answers': [],
      })),
      (err) => (console.log(err)),
    );
  }, [data]);

  const form = useForm<AnswerMeta>({
    defaultValues: {
      name: '',
      parent: 0,
      body: '',
    }
  });

  const { register, watch, reset, setValue, handleSubmit } = form;

  // const onSubmit = useCallback((values: Omit<PostForm, 'tags'>) => {
  const onSubmit = useCallback((values/*: AnswerMeta*/) => {
    // api.poke<BoardPostData>
    api.poke({
      app: 'quorum-server',
      mark: 'client-poke',
      json: {
        'add-answer': {
          ...values,
          name: name,
          parent: parseInt(tid),
        }
      }
    })
    reset();
  }, []);

  return (
    <div className='w-full space-y-6'>
      {/*^m-auto*/}
      <header>
        <h1 className='text-2xl font-semibold'>Submit Answer</h1>
      </header>
      <Strand key={data.question.id} content={data.question}/>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex w-full space-x-6'>
            <div className='flex-1 space-y-3'>
              <div>
                <label htmlFor='body' className='text-sm font-semibold'>Response</label>
                <textarea {...register('body', { required: true, maxLength: 256 })} rows={2} className='align-middle w-full py-1 px-2 bg-fawn/30 focus:outline-none focus:ring-2 ring-lavender rounded-lg border border-fawn/30' placeholder='An app for answering your riddles' />
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
