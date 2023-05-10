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
import { mergeDeep } from '../../utils';


type MDListProps = MDULProps | MDOLProps;
type MDComponentProps<T> = ComponentPropsWithoutRef<T> & MDProps;

interface MDBlockProps {
  content: string;
  archetype: 'head' | 'desc' | 'body';
  className?: string;
}


export default function MarkdownBlock({content, archetype, className}: MDBlockProps) {
  const borderClass: string = "border-solid border-2 border-gray-800";

  const renderHeader = ({node, level, className, ...props}: MDHeadProps) => {
    const levelMap = [
      '',                              // 0
      'text-2xl font-bold',            // 1
      'text-xl font-semibold',         // 2
      'text-lg font-semibold',         // 3
      'underline font-medium italic',  // 4
      'underline font-medium italic',  // 5
      'underline italic',              // 6
    ];
    return (
      <div className={cn(levelMap[level], className)} {...props}/>
    );
  };
  const renderList = ({node, ordered, className, ...props}: MDListProps) => {
    const listType: string = (ordered ? "list-decimal" : "list-disc");
    return (
      <ul className={cn("list-inside", listType, className)} {...props}/>
    );
  };
  const renderLink = ({node, className, ...props}: MDComponentProps<'a'>) => (
    <a {...props}/>
  );
  const renderQuote = ({node, className, ...props}: MDComponentProps<'blockquote'>) => (
    <blockquote className={cn("p-2 bg-gray-200/20 border-l-4 border-gray-800", className)}
      {...props}/>
  );
  const renderCode = ({node, inline, className, ...props}: MDCodeProps) => {
    const match = /language-(\w+)/.exec(className || '');
    const {children, ...bprops} = props;
    return true ? /* inline */
      (<code className={cn("inline-block rounded px-1.5 bg-blue-soft", className)} {...props} />) :
      (<code />);
      // (<SyntaxHighlighter
      //     className={cn("p-2", borderClass, className)}
      //     children={String(children).replace(/\n$/, '')}
      //     // @ts-ignore
      //     style={mergeDeep(SolarizedDark, styleMod)}
      //     language={match ? match[1] : ''}
      //     PreTag="div"
      //     {...bprops}
      //  />);
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
        img: renderImage,
        code: renderCode, // FIXME: No blocks; only inline.
        // NOTE: This prevents headers from being rendering undesirable
        // subcomponents, e.g. sublinks, quotes, lists, etc.
        ...((archetype === 'head') ? {
            p: 'div',
            ol: 'div', ul: 'div',
            blockquote: 'div',
          } : {
            h1: renderHeader, h2: renderHeader, h3: renderHeader,
            h4: renderHeader, h5: renderHeader, h6: renderHeader,
            ol: renderList, ul: renderList,
            blockquote: renderQuote,
        })
      }}
      className={cn(
        (archetype === 'head') ? 'underline text-xl' : '',
        (archetype === 'body') ? 'overflow-x-auto' : '',
        'break-words',
        className)}
    />
  );
}
