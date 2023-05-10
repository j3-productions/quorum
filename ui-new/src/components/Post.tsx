import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import _ from 'lodash';
import cn from 'classnames';
import { format } from 'date-fns';
import {
  CheckIcon,
  ChatBubbleIcon,
  ThickArrowUpIcon,
  ClockIcon,
  CounterClockwiseClockIcon,
  PlayIcon,
  TrashIcon,
  LayersIcon,
  Pencil1Icon,
  ChevronRightIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import Author from '~/components/Author';
import MarkdownBlock from '~/components/MarkdownBlock';
import VoteIcon from '~/components/icons/VoteIcon';
import BestIcon from '~/components/icons/BestIcon';
import { makeTerseLapse, makePrettyLapse } from '~/logic/utils';


export function PostCard({post, toPost}) {
  const score = Object.values(post.votes).reduce(
    (n, i) => n + (i === "up" ? 1 : -1), 0
  );

  return (
    <div className="my-6 px-6">
      <div
        role="link"
        className="card cursor-pointer bg-gray-100"
        onClick={toPost(post)}
      >
        <header className="space-y-8">
          <h1 className="break-words text-3xl font-semibold leading-10">
            {post.title}
          </h1>
          <p className="font-semibold text-gray-400">
            <span className="flex items-center">
              <span>{format(post.timestamp, 'LLLL do, yyyy')}</span>
              <span className={`
                  ml-auto flex flex-wrap
                  justify-end items-center
                  gap-2 text-gray-600`}>
                {post.tags.map(((tag) => (
                  <code key={`${post['post-id']}-${tag}`} className={`
                      inline-block rounded bg-blue-soft
                      px-1.5 dark:bg-blue-300`}>
                    #{tag}
                  </code>
                )))}
              </span>
            </span>
          </p>

          <MarkdownBlock
            content={post.content}
            archectype="desc"
            className="line-clamp-5"
          />

          <div className="flex items-center">
            <div
              className="flex items-center space-x-2 font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              <Author ship={post.author} hideTime />
            </div>

            <div
              className="ml-auto flex items-center space-x-2 text-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              {(false) && // TODO: Post has answer?
                <CheckIcon className={`stroke-green-600 h-5 w-5`} />
              }
              <div className="flex items-center space-x-2" title="Vote Score">
                <ThickArrowUpIcon className="h-5 w-5" />
                {`${score >= 0 ? "+" : ""}${score}`}
              </div>
              <div className="flex items-center space-x-2" title="Comment Count">
                <ChatBubbleIcon className="h-5 w-5" />
                &nbsp;{post.comments.length}
              </div>
              <div className="flex items-center space-x-2" title="Latest Activity">
                <CounterClockwiseClockIcon className="h-5 w-5" />
                {makeTerseLapse(new Date(post.timestamp))}
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}


export function PostStrand({post, toPost}) {
  const isQuestion = post?.title !== undefined;
  const ourVote = post.votes[window.our];
  const score = Object.values(post.votes).reduce(
    (n, i) => n + (i === "up" ? 1 : -1), 0
  );

  // TODO: The user should also be able to modify the post if they're
  // an admin for the current board.
  const canModify = post.author === window.our;

  return (
    <div className={cn(
      "flex flex-row w-full justify-center",
      "border-gray-50 border-solid border-b-2",
      isQuestion ? "pb-6" : "py-6",
    )}>
      <div className="flex flex-col items-center py-2 px-4 gap-y-4 text-gray-800">
        <div className="flex flex-col items-center">
          <VoteIcon
            onClick={() => console.log(`Upvote Post ${post['post-id']}`)}
            className={cn(
              "w-6 h-6 hover:cursor-pointer",
              (ourVote === "up") ? "fill-orange" : "fill-none",
            )}
          />
          {score}
          <VoteIcon
            onClick={() => console.log(`Downvote Post ${post['post-id']}`)}
            className={cn(
              "w-6 h-6 hover:cursor-pointer",
              "flip-x",
              (ourVote === "down") ? "fill-blue" : "fill-none",
            )}
          />
        </div>
        {!isQuestion && (
          <BestIcon
            onClick={() => console.log(`Best Post ${post['post-id']}`)}
            className={cn(
              "w-6 h-6 hover:cursor-pointer",
            )}
          />
        )}
        <div
          title={makePrettyLapse(post.timestamp)}
          className="flex flex-col items-center"
        >
          <CounterClockwiseClockIcon
            onClick={() => console.log(`Time for ${post['post-id']}`)}
            className={cn(
              "w-6 h-6 hover:cursor-pointer",
            )}
          />
          {makeTerseLapse(post.timestamp)}
        </div>
      </div>
      <div className="flex flex-col w-full justify-between gap-y-6">
        <div className="space-y-6">
          {isQuestion && (
            <h1 className="break-words text-3xl font-semibold leading-10">
              {post.title}
            </h1>
          )}
          <MarkdownBlock
            content={post.content}
            archectype="body"
          />
        </div>
        {(isQuestion && post.tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-gray-600">
            {post.tags.map(((tag) => (
              <code key={`${post['post-id']}-${tag}`} className={`
                  inline-block rounded bg-blue-soft
                  px-1.5 dark:bg-blue-300`}>
                #{tag}
              </code>
            )))}
          </div>
        )}
        <div className="flex items-center">
          <div
            className="flex items-center space-x-2 font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            <Author ship={post.author} hideTime />
          </div>

          <div
            className="ml-auto flex items-center space-x-2 text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-2 hover:cursor-pointer" title="Version">
              <LayersIcon className="h-5 w-5" />
              &nbsp;Latest
            </div>
            {canModify && (
              <React.Fragment>
                <div title="Edit"
                  className="hover:cursor-pointer"
                  onClick={toPost(post)}
                >
                  <Pencil1Icon className="h-5 w-5" />
                </div>
                <div className="hover:cursor-pointer" title="Delete">
                  <TrashIcon className="h-5 w-5" />
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
