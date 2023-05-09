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
  PlayIcon,
  ChevronRightIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import Author from '~/components/Author';
import { makeTerseLapse, makePrettyLapse,  } from '~/logic/utils';
import VoteIcon from '~/components/icons/VoteIcon';
import BestIcon from '~/components/icons/BestIcon';


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
          <p className="line-clamp-5">
            {post.content}
          </p>

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
              <ThickArrowUpIcon className={`h-5 w-5`} />
              {`${score >= 0 ? "+" : ""}${score}`}
              <ChatBubbleIcon className={`h-5 w-5`} />
              &nbsp;{post.comments.length}
              <ClockIcon className={`h-5 w-5`} />
              {makeTerseLapse(new Date(post.timestamp))}
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}


export function PostStrand({post, toPost}) {
  return (
    <p>
      {post?.title} -- {post.content}
    </p>
  );
}
