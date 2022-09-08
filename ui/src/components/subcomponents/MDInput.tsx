import React from 'react';
import ReactMarkdown from 'react-markdown';
import cn from 'classnames';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MDInputProps {
  className?: string;
}

export const MDInput = ({className}: MDInputProps) => {
  return (
    <p>Cool!</p>
  )
}
