import React, { useCallback, useEffect, useRef, useState, SyntheticEvent } from 'react';
import api from '../api';
import cn from 'classnames';
import debounce from 'lodash.debounce';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MultiValue } from 'react-select';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { genErrorData, ErrorMessage } from '../components/ErrorMessage';
import { Option, TagField } from '../components/TagField';
import { Strand } from '../components/Strand';
import { Spinner, Failer } from '../components/Decals';
import { Hero } from '../components/Sections';
import { appHost, apiScry, apiPoke, useFetch, fixupPost } from '../utils';
import * as QAPI from '../state/quorum';
import * as Type from '../types/quorum';

// TODO: Abstract forms out into smaller components.

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

///////////////////////////
/// Component Functions ///
///////////////////////////

export const Create = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<MultiValue<Option>>([]);
  const [image, setImage] = useState<string>('');
  const [sstate, setSState] = useState<SState>('notyet');
  const form = useForm<Type.PokeBoard>({
    defaultValues: {
      name: '',
      // private: false,
      desc: '',
      image: '',
      tags: [],
    }
  });
  const {register, watch, reset, setValue, handleSubmit} = form;

  const onSubmit = genSubmitFxn(setSState, [tags],
    (values: Type.PokeBoard) =>
      apiPoke<any>({ json: { 'add-board': {
        ...values,
        tags: tags.map(t => t.value),
      }}}).then(
        (result: any) =>
          navigate(`./../board/${appHost}/${values.name}`, {replace: true})
      )
  );

  const updateImg = useRef(debounce(setImage));
  const img = watch('image');
  useEffect(() => {img && updateImg.current(img);}, [img]);

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
                  <ErrorMessage className='mt-1' field="name" messages={genErrorData(100, 'contain only lowercase letters, numbers, and hyphens')}/>
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
                  {...register('desc', {required: true, maxLength: 200})}
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
                <ErrorMessage className='mt-1' field="desc" messages={genErrorData(200)} />
              </div>
              <div className='flex items-center space-x-6'>
                <div className='flex-1'>
                  <div>
                    <label htmlFor='image' className='text-sm font-semibold'>Image</label>
                    <input type="url" {...register('image', {
                      maxLength: 1024
                    })} className='flex-1 w-full py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='https://example.com/image.png' />
                    <ErrorMessage className='mt-1' field="image" messages={genErrorData(1024)}/>
                  </div>
                  <div>
                    <label className='text-sm font-semibold'>Tags</label>
                    <TagField tags={tags} onTags={setTags} />
                    {tags.length === 8 && <div className='text-fgp1/50 text-xs mt-1'>8 tags maximum</div>}
                  </div>
                </div>
                <img className='flex-none object-cover w-28 h-28 mt-4 border-2 border-dashed border-fgp1/60 rounded-lg' src={image || undefined} />
              </div>
              <FormFooter sstate={sstate} dismissLink="/" submitText="Publish" />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export const Join = () => {
  const navigate = useNavigate();
  const [sstate, setSState] = useState<SState>('notyet');
  const form = useForm<Type.PokeJoin>({
    defaultValues: {
      host: '',
      name: '',
    }
  });
  const {register, watch, reset, setValue, handleSubmit} = form;

  const onSubmit = genSubmitFxn(setSState, [],
    (values: Type.PokeJoin) =>
      apiPoke<any>({ json: {
        'sub': values
      }}).then((result: any) =>
        apiScry<Type.ScryQuestions>(`/questions/${values.host}/${values.name}`)
      ).then((result: any) =>
        navigate(`./../board/${values.host}/${values.name}`, {replace: true})
      )
  );

  return (
    <div className='w-full space-y-6'>
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
                <ErrorMessage className='mt-1' field="host" messages={genErrorData(200, 'be a valid @p')}/>
              </div>
              <div>
                <label htmlFor='name' className='text-sm font-semibold'>Board Name</label>
                <div className='flex items-center space-x-2'>
                  <input {...register('name', {required: true, maxLength: 100, pattern: /^[a-z][a-z0-9\-]*$/})} className='flex-1 w-full py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='board-name'/>
                </div>
                <ErrorMessage className='mt-1' field="name" messages={genErrorData(100, 'contain only lowecase letters, numbers, and hyphens')}/>
              </div>
              <FormFooter sstate={sstate} dismissLink="/" submitText="Join" />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export const Question = () => {
  const navigate = useNavigate();
  const {planet, board} = useParams<Type.BoardRoute>();
  const [tags, setTags] = useState<MultiValue<Option>>([]);
  const [sstate, setSState] = useState<SState>('notyet');
  const form = useForm<Type.PokeQuestion>({
    defaultValues: {
      title: '',
      body: '',
      tags: [],
    }
  });
  const {register, watch, reset, setValue, handleSubmit} = form;

  const onSubmit = genSubmitFxn(setSState, [tags],
    (values: Type.PokeQuestion) =>
      apiPoke<any>({ json: { dove: {
        'host': planet,
        'name': board,
        'mail': {
          'add-question': {
            ...values,
            name: board,
            tags: tags.map(t => t.value),
          },
        },
      }}}).then((result: any) =>
        navigate("./..", {replace: true})
      )
  );

  return (
    <div className='w-full space-y-6'>
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
                <ErrorMessage className='mt-1' field="title" messages={genErrorData(100)}/>
              </div>
              <div>
                <label htmlFor='body' className='text-sm font-semibold'>Body</label>
                <textarea {...register('body', {required: true, maxLength: 5000})} rows={5} className='align-middle w-full font-mono py-1 px-2 bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='Insert markdown-compatible text here.' />
                <ErrorMessage className='mt-1' field="body" messages={genErrorData(5000)} />
              </div>
              <div>
                <label className='text-sm font-semibold'>Tags</label>
                <TagField tags={tags} onTags={setTags} />
                {tags.length === 8 && <div className='text-fgp1/50 text-xs mt-1'>8 tags maximum</div>}
              </div>
              <FormFooter sstate={sstate} dismissLink="./.." submitText="Publish" />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export const Answer = () => {
  const navigate = useNavigate();
  const {planet, board, tid} = useParams<Type.ThreadRoute>();
  const [sstate, setSState] = useState<SState>('notyet');
  const [thread, setThread] = useFetch<Type.Thread, [Type.SetThreadAPI, Type.U<number>]>(
    QAPI.getThread(planet, board, tid), 'set-best', undefined);
  const form = useForm<Type.PokeAnswer>({
    defaultValues: {
      name: '',
      parent: 0,
      body: '',
    }
  });
  const {register, watch, reset, setValue, handleSubmit} = form;

  const Question = useCallback(({fetch}: Type.FetchFxn<Type.Thread>) => {
    const thread: Type.Thread = fetch();
    return (<Strand key={thread.question.id} content={thread.question} />);
  }, []);
  const onSubmit = genSubmitFxn(setSState, [],
    (values: Type.PokeAnswer) =>
      apiPoke<any>({ json: { dove: {
        'host': planet,
        'name': board,
        'mail': {
          'add-answer': {
            body: values.body,
            name: board,
            parent: parseInt(tid || "0"),
          },
        },
      }}}).then((result: any) =>
        navigate("./..", {replace: true})
      )
  );

  return (
    <React.Suspense fallback={<Spinner className='w-24 h-24' />}>
      <div className='w-full space-y-6'>
        <header>
          <h1 className='text-2xl font-semibold'>Submit Answer</h1>
        </header>
        <Question fetch={thread} />
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex w-full space-x-6'>
              <div className='flex-1 space-y-3'>
                <div>
                  <label htmlFor='body' className='text-sm font-semibold'>Response</label>
                  <textarea {...register('body', {required: true, maxLength: 5000})} rows={5} className='align-middle w-full py-1 px-2 font-mono bg-bgp2/30 focus:outline-none focus:ring-2 ring-bgs2 rounded-lg border border-bgp2/30' placeholder='Insert markdown-compatible text here.' />
                  <ErrorMessage className='mt-1' field="body" messages={genErrorData(5000)} />
                </div>
                <FormFooter sstate={sstate} dismissLink="./.." submitText="Publish" />
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </React.Suspense>
  );
}

export const Settings = () => {
  return (
    <div>
      TODO: Settings page goes here.
    </div>
  );
}

//////////////////////
// Helper Functions //
//////////////////////

type SState = 'notyet' | 'pending' | 'error';

const FormFooter = ({sstate, dismissLink, submitText, dismissText, className}: {
    sstate: SState;
    dismissLink: string;
    submitText?: string;
    dismissText?: string;
    className?: string;
  }) => {
  const buttonClass: string = `flex items-center rounded-lg py-2 px-3
    text-base font-semibold border-2 leading-none transition-colors`;
  return (
    <div className='pt-3'>
      <div className='flex justify-between border-t border-bgs1 py-3'>
        <Link to={dismissLink} className={cn(buttonClass,
            'text-bgs1 bg-bgs1/30 border-bgs1/0 hover:border-bgs1')}>
          {dismissText || "Dismiss"}
        </Link>
        {(sstate === 'pending') ? (<Spinner className='w-8 h-8' />) :
          ((sstate === 'error') ? (<Failer className='w-8 h-8' />) :
          (<React.Fragment />))
        }
        <button type="submit" className={cn(buttonClass,
            'text-bgp1 bg-bgs1 border-bgp1/0 hover:border-bgp1/60')}>
          {submitText || "Submit"}
        </button>
      </div>
    </div>
  );
};

function genSubmitFxn<SubmitType>(
    sset: (state: SState) => void,
    mods: any[],
    poke: (args: SubmitType) => Promise<any>,
  ) {
  return useCallback((values: SubmitType) => {
    sset('pending');
    poke(values).catch((error: Error) => {
      console.log(error);
      sset('error');
    });
  }, mods || []);
};
