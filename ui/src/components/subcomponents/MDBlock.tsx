import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  HeadingProps as MDHeadProps,
  UnorderedListProps as MDULProps,
  OrderedListProps as MDOLProps,
  CodeProps as MDCodeProps,
  ReactMarkdownProps as MDProps,
  ComponentPropsWithoutRef,
} from 'react-markdown/lib/ast-to-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import cn from 'classnames';

// TODO: Fix type errors related to contained '@ts-ignore' directives.

type MDListProps = MDULProps | MDOLProps;
type MDComponentProps<T> = ComponentPropsWithoutRef<T> & MDProps;

interface MDBlockProps {
  content: string;
  archetype: 'head' | 'desc' | 'body';
  className?: string;
}

export const MDBlock = ({content, archetype, className}: MDBlockProps) => {
  const renderHeader = ({node, level, className, ...props}: MDHeadProps) => {
    const levelMap = [
      '',                                 // 0
      'text-lg font-bold underline',      // 1
      'text-lg font-medium underline',    // 2
      'underline font-medium',            // 3
      'underline italic',                 // 4
      'underline italic',                 // 5
      'underline italic',                 // 6
    ];
    return (
      <p className={cn(levelMap[level], className)} {...props}/>
    );
  };
  const renderList = ({node, ordered, className, ...props}: MDListProps) => {
    const listType: string = (ordered ? "list-decimal" : "list-disc");
    return (
      <ul className={cn("list-inside", listType, className)} {...props}/>
    );
  };
  const renderLink = ({node, className, ...props}: MDComponentProps<'a'>) => (
    <a className={cn("text-rosy hover:underline transition-colors", className)}
      {...props}/>
  );
  const renderQuote = ({node, className, ...props}: MDComponentProps<'blockquote'>) => (
    <blockquote className={cn("p-2 bg-mauve/20 border-l-4 border-mauve", className)}
      {...props}/>
  );
  const renderCode = ({node, inline, className, ...props}: MDCodeProps) => {
    const match = /language-(\w+)/.exec(className || '');
    const {children, ...bprops} = props;
    return (!match || inline) ?
      (<code className={cn("rounded bg-mauve/40", className)} {...props} />) :
      (<SyntaxHighlighter
          children={String(children).replace(/\n$/, '')}
          // @ts-ignore
          style={solarizedlight}
          language={match[1]}
          PreTag="div"
          {...bprops}
       />);
  };
  const renderImage = ({node, src, alt, ...props}: MDComponentProps<'img'>) => {
    const {children, ...lprops} = props;
    return (archetype === 'body') ?
      (<img {...{src: src, alt: alt, ...props}} />) :
      // @ts-ignore
      renderLink({node: node, href: src, children: alt, ...lprops});
  };

  return (
    <ReactMarkdown
      skipHtml={true}
      children={content}
      components={{
        a: renderLink,
        code: renderCode,
        blockquote: renderQuote,
        img: renderImage,
        // NOTE: This prevents headers from being recursively rendered within
        // Markdown headings.
        ...((archetype === 'head') ? {} : {
          h1: renderHeader, h2: renderHeader, h3: renderHeader,
          h4: renderHeader, h5: renderHeader, h6: renderHeader,
          ol: renderList, ul: renderList,
        })
      }}
      className={cn(
        (archetype === 'head') ? 'underline text-xl' : '',
        (archetype === 'body') ? 'overflow-x-auto' : '',
        'break-words',
        className)}
    />
  )
}
