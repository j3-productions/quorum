import React from 'react';
import cn from 'classnames';
import ReactMarkdown from 'react-markdown';
import {
  HeadingProps as MDHeadProps,
  UnorderedListProps as MDULProps,
  OrderedListProps as MDOLProps,
  CodeProps as MDCodeProps,
  ReactMarkdownProps as MDProps,
  ComponentPropsWithoutRef,
} from 'react-markdown/lib/ast-to-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { default as SolarizedDark } from 'react-syntax-highlighter/dist/esm/styles/prism/solarized-dark-atom';
import { mergeDeep } from '../../utils';

// TODO: Fix type errors related to contained '@ts-ignore' directives.

type MDListProps = MDULProps | MDOLProps;
type MDComponentProps<T> = ComponentPropsWithoutRef<T> & MDProps;

interface MDBlockProps {
  content: string;
  archetype: 'head' | 'desc' | 'body';
  className?: string;
}

export const MDBlock = ({content, archetype, className}: MDBlockProps) => {
  const borderClass: string = "border-solid border-2 border-bgs1";
  // FIXME: This is a terrible hack to get around the fact that the 'customStyle'
  // field of 'SyntaxHighlighter' doesn't work.
  const styleMod = {
    "code[class*=\"language-\"]": {
      "fontFamily": "'Source Code Pro', 'Roboto mono', 'Courier New', 'monospace'",
      "borderRadius": "0.0em",
    },
    "pre[class*=\"language-\"]": {
      "fontFamily": "'Source Code Pro', 'Roboto mono', 'Courier New', 'monospace'",
      "padding": undefined,
      "borderRadius": "0.0em",
    },
    ":not(pre) > code[class*=\"language-\"]": {
      "borderRadius": "0.0em",
    },
  };

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
    <a className={cn("text-bgs1 hover:underline transition-colors", className)}
      {...props}/>
  );
  const renderQuote = ({node, className, ...props}: MDComponentProps<'blockquote'>) => (
    <blockquote className={cn("p-2 bg-fgp1/20 border-l-4 border-fgp1", className)}
      {...props}/>
  );
  const renderCode = ({node, inline, className, ...props}: MDCodeProps) => {
    const match = /language-(\w+)/.exec(className || '');
    const {children, ...bprops} = props;
    return inline ?
      (<code className={cn("rounded bg-fgp1/40", className)} {...props} />) :
      (<SyntaxHighlighter
          className={cn("p-2", borderClass, className)}
          children={String(children).replace(/\n$/, '')}
          // @ts-ignore
          style={mergeDeep(SolarizedDark, styleMod)}
          language={match ? match[1] : ''}
          PreTag="div"
          {...bprops}
       />);
  };
  const renderImage = ({node, src, alt, className, ...props}: MDComponentProps<'img'>) => {
    const {children, ...lprops} = props;
    return (archetype === 'body') ?
      (<img {...{src: src, alt: alt, className: cn(borderClass, className), ...props}} />) :
      // @ts-ignore
      renderLink({node: node, href: src, children: alt, className: className, ...lprops});
  };

  return (
    <ReactMarkdown
      skipHtml={true}
      // TODO: This is probably the easiest place to solve the issue with
      // single newlines being eaten after lists.
      children={content} // {content.replace(/\n/gi, '\n &nbsp;')}
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
