import React, { useCallback, useEffect, useRef, useState, SyntheticEvent } from 'react';
import api from '../api';
import debounce from 'lodash.debounce';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MultiValue } from 'react-select';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ErrorMessage } from '../components/ErrorMessage';
import { Option, TagField } from '../components/TagField';
import { Strand } from '../components/Strand';
import { Hero, Spinner, Failer } from '../components/Decals';
import {
  GetBoard, GetQuestion, GetAnswer, GetThread, GetPostBad,
  PostBoard, PostJoin, PostQuestion, PostAnswer,
  BoardRoute, ThreadRoute
} from '../types/quorum';
import { apiHost, fixupScry, fixupPoke, fixupPost } from '../utils';

// TODO: Improve error handling behavior for 'onError' in forms.
// TODO: Use react-dom to redirect to the created item on success.
// TODO: Add return types to 'onSubmit' functions (input type).
// TODO: Abstract out all form components as follows:
// - [ ] Tag Entry
// - [ ] Short String Entry
// - [ ] Long String Entry
// - [ ] Image Entry
// - [ ] Form Container
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

type SubmissionState = 'notyet' | 'pending' | 'error';

const errorMessages = (length: number, pattern?: string) => {
  return {
    required: 'This field is required.',
    maxLength: `The maximum length is ${length}.`,
    pattern: `This field must ${pattern}.`,
  };
}

export const Create = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<MultiValue<Option>>([]);
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [sstate, setSState] = useState<SubmissionState>('notyet');
  const form = useForm<PostBoard>({
    defaultValues: {
      name: '',
      // private: false,
      desc: '',
      image: '',
      tags: [],
    }
  });

  const {register, watch, reset, setValue, handleSubmit} = form;

  const updateImg = useRef(debounce(setImage));
  const img = watch('image');

  const onSubmit = useCallback((values/*: PostBoard*/) => {
    setSState('pending');
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
        navigate(`./../board/${apiHost}/${values.name}`, {replace: true});
      },
      onError: () => {
        console.log("Failed to create the board!");
        // reset();
        // setTags([]);
        setSState('error');
      },
    });
  }, [tags]);

  // TODO: Reset image as well upon submission.
  useEffect(() => {
    if (img) {
      updateImg.current(img);
    }
  }, [img]);

  /** Halway works
                <label for="toggle-example" className="flex items-center cursor-pointer relative mb-4">
                  <input type="checkbox" id="toggle-example" className="sr-only" />
                  <div className="toggle-bg bg-gray-200 border-2 border-gray-200 h-6 w-11 rounded-full"></div>
                  <span className="ml-3 text-gray-900 text-sm font-medium">Toggle me</span>
                </label>
   */

  return (
    <div className='w-full space-y-6'>
      <header>
        <h1 className='text-2xl font-semibold'>Create Knowledge Board</h1>
      </header>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex w-full max-w-full space-x-6'>
            <div className='flex-1 space-y-3'>
              <div className='flex items-center'>
                <div className='flex-1'>
                  <label htmlFor='name' className='text-sm font-semibold'>Name</label>
                  <div className='flex items-center space-x-2'>
                    <input
                      placeholder='board-name'
                      className='flex-1 w-full py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30'
                      {...register('name', {required: true, maxLength: 100, pattern: /^[a-z][a-z0-9\-]*$/})}
                    />
                  </div>
                  <ErrorMessage className='mt-1' field="name" messages={errorMessages(100, 'contain only lowercase letters, numbers, and hyphens')}/>
                </div>
                <div className='flex-none'>
                  <label htmlFor='private' className='text-sm font-semibold'>Private?</label>
                  <div className='flex items-center'>
                    <input type='checkbox'
                      className='flex-1 w-8 h-8 py-2 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30'
                      // {...register('private', {required: true})}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor='desc' className='text-sm font-semibold'>Description</label>
                <textarea rows={5}
                  placeholder='Insert markdown-compatible text here.'
                  className='align-middle w-full font-mono py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30'
                  value={text}
                  {...register('desc', {required: true, maxLength: 400, onChange: (e: SyntheticEvent) =>
                    setText((e.target as HTMLTextAreaElement).value)
                  })}
                />
                {/*
                <SyntaxHighlighter
                  // children={String(text).replace(/\n$/, '')}
                  children={text}
                  // TODO: Create a style for tailwind css to guarantee matchup??
                  // style={solarizedlight}
                  language="markdown"
                  PreTag="div"
                  className='align-middle max-w-full w-full overflow-x-auto py-1 px-2 ring-bgs2 rounded-lg border border-bgp2/30'
                />
                */}
                <ErrorMessage className='mt-1' field="desc" messages={errorMessages(400)} />
              </div>
              <div className='flex items-center space-x-6'>
                <div className='flex-1'>
                  <div>
                    <label htmlFor='image' className='text-sm font-semibold'>Image</label>
                    <input type="url" {...register('image', {
                      maxLength: 1024
                    })} className='flex-1 w-full py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='https://example.com/image.png' />
                    <ErrorMessage className='mt-1' field="image" messages={errorMessages(1024)}/>
                  </div>
                  <div>
                    <label className='text-sm font-semibold'>Tags</label>
                    <TagField tags={tags} onTags={setTags} />
                    {tags.length === 8 && <div className='text-fgp1/50 text-xs mt-1'>8 tags maximum</div>}
                  </div>
                </div>
                <img className='flex-none object-cover w-28 h-28 mt-4 border-2 border-dashed border-fgp1/60 rounded-lg' src={image || undefined} />
              </div>
              <div className='pt-3'>
                <div className='flex justify-between border-t border-bgs1 py-3'>
                  <Link to="/" className='flex items-center rounded-lg text-base font-semibold text-bgs1 bg-bgs1/30 border-2 border-bgs1/0 hover:border-bgs1 leading-none py-2 px-3 transition-colors'>
                    Dismiss
                  </Link>
                  {(sstate === 'pending') ? (<Spinner className='w-8 h-8' />) :
                    ((sstate === 'error') ? (<Failer className='w-8 h-8' />) : (<></>))
                  }
                  <button type="submit" className='flex items-center rounded-lg text-base font-semibold text-bgp1 bg-bgs1 border-2 border-bgp1/0 hover:border-bgp1/60 leading-none py-2 px-3 transition-colors'>
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
  const navigate = useNavigate();
  const [sstate, setSState] = useState<SubmissionState>('notyet');
  const form = useForm<PostJoin>({
    defaultValues: {
      host: '',
      name: '',
    }
  });

  const {register, watch, reset, setValue, handleSubmit} = form;

  const onSubmit = useCallback((values/*: PostJoin*/) => {
    setSState('pending');
    api.poke({
      app: 'quorum-client',
      mark: 'client-pass',
      json: {'sub': values},
      onSuccess: () => {
        // FIXME: Subscription-based data takes a bit longer to come back,
        // so we just wait a bit. This should be removed and replaced with
        // a more reliable check on incoming subscription data.
        new Promise(resolve => {setTimeout(resolve, 1000);}).then(() => {
        api.scry<any>(fixupScry(values.host, {path: `/all-questions/${values.name}`})).then(
          (result: any) => {
            navigate(`./../board/${values.host}/${values.name}`, {replace: true});
          }, (error: any) => {
            console.log(error);
            // reset();
            setSState('error');
          },
        );
        });
      },
      onError: () => {
        console.log("Failed to join the board!");
        // reset();
        setSState('error');
      },
    })
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
                <label htmlFor='host' className='text-sm font-semibold'>Host Planet</label>
                <div className='flex items-center space-x-2'>
                  <input {...register('host', {required: true, maxLength: 200, pattern: /^~(([a-z]{3})|([a-z]{6}(\-[a-z]{6}){0,3})|([a-z]{6}(\-[a-z]{6}){3})\-\-([a-z]{6}(\-[a-z]{6}){3}))$/})} className='flex-1 w-full py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='~sampel-palnet'/>
                </div>
                <ErrorMessage className='mt-1' field="host" messages={errorMessages(200, 'be a valid @p')}/>
              </div>
              <div>
                <label htmlFor='name' className='text-sm font-semibold'>Board Name</label>
                <div className='flex items-center space-x-2'>
                  <input {...register('name', {required: true, maxLength: 100, pattern: /^[a-z][a-z0-9\-]*$/})} className='flex-1 w-full py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='board-name'/>
                </div>
                <ErrorMessage className='mt-1' field="name" messages={errorMessages(100, 'contain only lowecase letters, numbers, and hyphens')}/>
              </div>
              <div className='pt-3'>
                <div className='flex justify-between border-t border-bgs1 py-3'>
                  <Link to="/" className='flex items-center rounded-lg text-base font-semibold text-bgs1 bg-bgs1/30 border-2 border-bgs1/0 hover:border-bgs1 leading-none py-2 px-3 transition-colors'>
                    Dismiss
                  </Link>
                  {(sstate === 'pending') ? (<Spinner className='w-8 h-8' />) :
                    ((sstate === 'error') ? (<Failer className='w-8 h-8' />) : (<></>))
                  }
                  <button type="submit" className='flex items-center rounded-lg text-base font-semibold text-bgp1 bg-bgs1 border-2 border-bgp1/0 hover:border-bgp1/60 leading-none py-2 px-3 transition-colors'>
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
  const [sstate, setSState] = useState<SubmissionState>('notyet');
  const form = useForm<PostQuestion>({
    defaultValues: {
      title: '',
      body: '',
      tags: [],
    }
  });

  const {register, watch, reset, setValue, handleSubmit} = form;

  const onSubmit = useCallback((values/*: PostQuestion*/) => {
    setSState('pending');
    api.poke(fixupPoke(planet, {
      mark: 'client-action',
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
        console.log("Failed to submit the question!");
        // reset();
        // setTags([]);
        setSState('error');
      },
    }));
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
                  <input {...register('title', {required: true, maxLength: 100})} className='flex-1 w-full font-mono py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='Insert markdown-compatible title here.'/>
                </div>
                <ErrorMessage className='mt-1' field="title" messages={errorMessages(100)}/>
              </div>
              <div>
                <label htmlFor='body' className='text-sm font-semibold'>Body</label>
                <textarea {...register('body', {required: true, maxLength: 5000})} rows={5} className='align-middle w-full font-mono py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='Insert markdown-compatible text here.' />
                <ErrorMessage className='mt-1' field="body" messages={errorMessages(5000)} />
              </div>
              <div>
                <label className='text-sm font-semibold'>Tags</label>
                <TagField tags={tags} onTags={setTags} />
                {tags.length === 8 && <div className='text-fgp1/50 text-xs mt-1'>8 tags maximum</div>}
              </div>
              <div className='pt-3'>
                <div className='flex justify-between border-t border-bgs1 py-3'>
                  <Link to="./.." className='flex items-center rounded-lg text-base font-semibold text-bgs1 bg-bgs1/30 border-2 border-bgs1/0 hover:border-bgs1 leading-none py-2 px-3 transition-colors'>
                    Dismiss
                  </Link>
                  {(sstate === 'pending') ? (<Spinner className='w-8 h-8' />) :
                    ((sstate === 'error') ? (<Failer className='w-8 h-8' />) : (<></>))
                  }
                  <button type="submit" className='flex items-center rounded-lg text-base font-semibold text-bgp1 bg-bgs1 border-2 border-bgp1/0 hover:border-bgp1/60 leading-none py-2 px-3 transition-colors'>
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
  const [message, setMessage] = useState<string>('');
  const [sstate, setSState] = useState<SubmissionState>('notyet');
  const [thread, setThread] = useState<GetThread>({
    best: -1,
    question: undefined,
    answers: [],
  });

  useEffect(() => {
    api.scry<any>(fixupScry(planet, {path: `/thread/${board}/${tid}`})).then(
      (result: any) => {
        const question: GetPostBad = result.question;
        setThread({
          'question': fixupPost(planet, question) as GetQuestion,
          'answers': [] as GetAnswer[],
          'best': -1,
        });
        setMessage("Thread load successful!");
      }, (error: any) => {
        console.log(error);
      },
    );
  }, [/*thread*/]);

  const form = useForm<PostAnswer>({
    defaultValues: {
      name: '',
      parent: 0,
      body: '',
    }
  });

  const {register, watch, reset, setValue, handleSubmit} = form;

  const onSubmit = useCallback((values/*: PostAnswer*/) => {
    setSState('pending');
    api.poke(fixupPoke(planet, {
      mark: 'client-action',
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
        console.log("Failed to submit answer!");
        // reset();
        setSState('error');
      },
    }));
  }, []);

  return !thread.question ? (
      (message === "") ?
        (<Spinner className='w-24 h-24' />) :
        (<Hero content={message} />)
  ) : (
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
                <textarea {...register('body', {required: true, maxLength: 5000})} rows={5} className='align-middle w-full py-1 px-2 font-mono bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='Insert markdown-compatible text here.' />
                <ErrorMessage className='mt-1' field="body" messages={errorMessages(5000)} />
              </div>
              <div className='pt-3'>
                <div className='flex justify-between border-t border-bgs1 py-3'>
                  <Link to="./.." className='flex items-center rounded-lg text-base font-semibold text-bgs1 bg-bgs1/30 border-2 border-bgs1/0 hover:border-bgs1 leading-none py-2 px-3 transition-colors'>
                    Dismiss
                  </Link>
                  {(sstate === 'pending') ? (<Spinner className='w-8 h-8' />) :
                    ((sstate === 'error') ? (<Failer className='w-8 h-8' />) : (<></>))
                  }
                  <button type="submit" className='flex items-center rounded-lg text-base font-semibold text-bgp1 bg-bgs1 border-2 border-bgp1/0 hover:border-bgp1/60 leading-none py-2 px-3 transition-colors'>
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
