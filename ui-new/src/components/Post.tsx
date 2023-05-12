import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
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
  CopyIcon,
  ChevronRightIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import Author from '~/components/Author';
import MarkdownBlock from '~/components/MarkdownBlock';
import VoteIcon from '~/components/icons/VoteIcon';
import BestIcon from '~/components/icons/BestIcon';
import { useModalNavigate } from '~/logic/routing';
import {
  makeTerseLapse,
  makePrettyLapse,
  useCopy,
} from '~/logic/utils';


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
                &nbsp;{makeTerseLapse(new Date(post.timestamp))}
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}


export function PostStrand({post, toPost, parent}) {
  // TODO: Implement 'select' menu for revision; entries should list the number
  // (as index+1), date, and author
  // TODO: Need a lot of fixup for the 'revision' logic; specifically want it
  // to go from most to least recent.
  // TODO: Change the background of the strand if:
  // - it's displaying a version older than the latest
  // - the post belongs to the user (use a light blue instead of white?)
  const totalRevisions = Object.keys(post.history).length + 1;

  // TODO: Spin these all together into a single field called 'revision':
  // - version: index
  // - content: string (markdown)
  // - timestamp: number (convert to date)
  // - authors: list of all authors up through this index
  const [revisionNumber, setRevisionNumber] = useState(totalRevisions);
  const [revisionContent, setRevisionContent] = useState(post.content);
  const [revisionAuthors, setRevisionAuthors] = useState(
    [...new Set([post.author].concat(Object.values(post.history).map(({who}) => who)))]
  );
  const {didCopy, doCopy} = useCopy(
    `TODO: Relative link to the post (using %lure?) #${post["post-id"]}`
  );
  const modalNavigate = useModalNavigate();
  const location = useLocation();

  const isQuestion = post?.title !== undefined;
  const isThread = parent ? true : false;
  const ourVote = post.votes[window.our];
  const score = Object.values(post.votes).reduce(
    (n, i) => n + (i === "up" ? 1 : -1), 0
  );

  // TODO: The user should also be able to modify the post if they're
  // an admin for the current board.
  const canModify = post.author === window.our;
  const canVote = post.author !== window.our;
  const canBest = parent?.author === window.our;

  return (
    <div id={post["post-id"]} className={cn(
      "flex flex-row w-full justify-center",
      "border-gray-50 border-solid border-b-2",
      isQuestion ? "pb-6" : "py-6",
    )}>
      {isThread && (
        <div className="flex flex-col items-center py-2 px-4 gap-y-4 text-gray-800">
          <div className="flex flex-col items-center">
            <VoteIcon
              onClick={() => console.log(`Upvote Post ${post['post-id']}`)}
              className={cn(
                "w-6 h-6",
                ourVote === "up" ? "fill-orange" : "fill-none",
                canVote
                  ? "hover:cursor-pointer"
                  : "text-gray-200 hover:cursor-not-allowed",
              )}
            />
            {score}
            <VoteIcon
              onClick={() => console.log(`Downvote Post ${post['post-id']}`)}
              className={cn(
                "w-6 h-6",
                "flip-x",
                ourVote === "down" ? "fill-blue" : "fill-none",
                canVote
                  ? "hover:cursor-pointer"
                  : "text-gray-200 hover:cursor-not-allowed",
              )}
            />
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger aria-label="TODO">
              <div className="flex flex-col items-center hover:cursor-pointer">
                <CounterClockwiseClockIcon
                  className={cn("w-6 h-6")}
                />
                <p>v{revisionNumber}/{totalRevisions}</p>
                <p>{makeTerseLapse(post.timestamp)}</p>
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content className="dropdown" side="right"> {/*w-56*/}
              <DropdownMenu.Item
                disabled
                className="dropdown-item flex cursor-default items-center space-x-2 text-gray-300 hover:bg-transparent"
              >
                Version
              </DropdownMenu.Item>
              {Object.entries(post.history).map(([timestamp, {who: author, content}], index) => (
                <DropdownMenu.Item
                  key={`${author}-${timestamp}`}
                  onSelect={() => {
                    setRevisionNumber(index + 2);
                    setRevisionContent(content);
                    // FIXME: Should be all authors for all edits up through this
                    // index, i.e. [author for author in (history sorted by date)[::index]]
                    setRevisionAuthors(
                      [...new Set([post.author, author])]
                    );
                  }}
                  className="dropdown-item flex items-center space-x-2"
                >
                  v{index + 2}: {author}, {makePrettyLapse(Number(timestamp))}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Item
                onSelect={() => {
                  setRevisionNumber(1);
                  setRevisionContent(post.content);
                  setRevisionAuthors(
                    [...new Set([post.author].concat(Object.values(post.history).map(({who}) => who)))]
                  );
                }}
                className="dropdown-item flex items-center space-x-2"
              >
                v1: {post.author}, {makePrettyLapse(Number(post.timestamp))}
              </DropdownMenu.Item>

              {/* <DropdownMenu.Arrow className="fill-white stroke-black" /> */}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          {!isQuestion && (
            <BestIcon
              onClick={() => console.log(`Best Post ${post['post-id']}`)}
              className={cn(
                "w-6 h-6",
                canBest
                  ? "hover:cursor-pointer"
                  : "text-gray-200 hover:cursor-not-allowed",
              )}
            />
          )}
        </div>
      )}
      <div className="flex flex-col w-full justify-between px-4 gap-y-6">
        <div className="space-y-6">
          {isQuestion && (
            <h1 className="break-words text-3xl font-semibold leading-10">
              {post.title}
            </h1>
          )}
          <MarkdownBlock
            content={revisionContent}
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
            {(canModify && isThread) && (
              <React.Fragment>
                <div title="Edit"
                  className="hover:cursor-pointer"
                  onClick={toPost(post)}
                >
                  <Pencil1Icon className="h-5 w-5" />
                </div>
                <div title="Delete"
                  className="hover:cursor-pointer"
                  onClick={() => modalNavigate(`delete/${post["post-id"]}`, {
                    state: {bgLocation: location}
                  })}
                >
                  <TrashIcon className="h-5 w-5" />
                </div>
              </React.Fragment>
            )}
            <div title="Copy Reference"
              className="hover:cursor-pointer"
              onClick={doCopy}
            >
              {didCopy ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <CopyIcon className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
