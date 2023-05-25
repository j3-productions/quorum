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
import { BoardPost, PostEdit } from '~/types/quorum';


export function PostCard({post, toPost}) {
  // FIXME: Consider updating this so that cards for child posts contain
  // information about the parent post (e.g. the thread title, author).
  const score = Object.values(post.votes).reduce(
    (n, i) => n + (i === "up" ? 1 : -1), 0
  );

  const newestEdit: PostEdit = post.history[0];
  const oldestEdit: PostEdit = post.history.slice(-1)[0];

  return (
    <div className="my-6 px-6">
      <div
        role="link"
        className="card cursor-pointer bg-gray-100"
        onClick={toPost(post)}
      >
        <header className="space-y-8">
          {post?.thread && (
            <React.Fragment>
              <h1 className="break-words text-3xl font-semibold leading-10">
                {post.thread.title}
              </h1>
              <p className="font-semibold text-gray-400">
                <span className="flex items-center">
                  <span>{format(oldestEdit.timestamp, 'LLLL do, yyyy')}</span>
                  <span className={`
                      ml-auto flex flex-wrap
                      justify-end items-center
                      gap-2 text-gray-600`}>
                    {post.thread.tags.map(tag => (
                      <code key={`${post['post-id']}-${tag}`} className={`
                          inline-block rounded bg-blue-soft
                          px-1.5 dark:bg-blue-300`}>
                        #{tag}
                      </code>
                    ))}
                  </span>
                </span>
              </p>
            </React.Fragment>
          )}

          <MarkdownBlock
            content={newestEdit.content}
            archectype="desc"
            className="line-clamp-5"
          />

          <div className="flex items-center">
            <div
              className="flex items-center space-x-2 font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              <Author ship={oldestEdit.author} hideTime />
            </div>

            <div
              className="ml-auto flex items-center space-x-2 text-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              {/* TODO: Consider removing or reworking this indicator. */}
              {(post?.thread && post.thread["best-id"] !== 0) &&
                <BestIcon className="h-5 w-5" />
              }
              <div className="flex items-center space-x-2" title="Vote Score">
                <ThickArrowUpIcon className="h-5 w-5" />
                {`${score >= 0 ? "+" : ""}${score}`}
              </div>
              <div className="flex items-center space-x-2" title="Comment Count">
                <ChatBubbleIcon className="h-5 w-5" />
                &nbsp;{post?.thread ? post.thread.replies.length : post.comments.length}
              </div>
              <div className="flex items-center space-x-2" title="Latest Activity">
                <CounterClockwiseClockIcon className="h-5 w-5" />
                &nbsp;{makeTerseLapse(new Date(newestEdit.timestamp))}
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}


export function PostStrand({post, toPost, parent}) {
  // TODO: Change the background of the strand if:
  // - it's displaying a version older than the latest
  // - the post belongs to the user (use a light blue instead of white?)
  const totalRevisions = Object.keys(post.history).length;

  const [revisionNumber, setRevisionNumber] = useState(totalRevisions);
  const [revisionContent, setRevisionContent] = useState(post.history[0].content);
  const [revisionTimestamp, setRevisionTimestamp] = useState(post.history[0].timestamp);
  const [revisionAuthors, setRevisionAuthors] = useState(
    [...new Set(Object.values(post.history).map(({author}) => author))]
  );
  const {didCopy, doCopy} = useCopy(
    `TODO: Relative link to the post (using %lure?) #${post["post-id"]}`
  );
  const modalNavigate = useModalNavigate();
  const location = useLocation();

  const isQuestion = post?.thread !== undefined && post?.thread !== null;
  const isThread = parent ? true : false;
  const ourVote = post.votes[window.our];
  const isBest = post["post-id"] === parent?.thread["best-id"];
  const score = Object.values(post.votes).reduce(
    (n, i) => n + (i === "up" ? 1 : -1), 0
  );

  // TODO: The user should also be able to modify the post if they're
  // an admin for the current board.
  // TODO: After testing, the author of a post shouldn't be allowed
  // to vote on it.
  const postAuthor = post.history.slice(-1)[0].author;
  const parentAuthor = parent?.history.slice(-1)[0].author;
  const canModify = postAuthor === window.our;
  const canVote = true; // postAuthor !== window.our;
  const canBest = parentAuthor === window.our;

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
                <p>{makeTerseLapse(new Date(revisionTimestamp))}</p>
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content className="dropdown" side="right"> {/*w-56*/}
              <DropdownMenu.Item
                disabled
                className="dropdown-item flex cursor-default items-center space-x-2 text-gray-300 hover:bg-transparent"
              >
                Version
              </DropdownMenu.Item>
              {post.history.map(({author, timestamp, content}, index) => (
                <DropdownMenu.Item
                  key={`${author}-${timestamp}`}
                  onSelect={() => {
                    setRevisionNumber(totalRevisions - index);
                    setRevisionContent(content);
                    setRevisionTimestamp(timestamp);
                    setRevisionAuthors(
                      [...new Set(history.slice(index).map(({author}) => author))]
                    );
                  }}
                  className="dropdown-item flex items-center space-x-2"
                >
                  v{totalRevisions - index}: {author}
                  {/*, {makePrettyLapse(new Date(timestamp))}*/}
                </DropdownMenu.Item>
              ))}
              {/* <DropdownMenu.Arrow className="fill-white stroke-black" /> */}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          {!isQuestion && (
            <BestIcon
              onClick={() => console.log(`Best Post ${post['post-id']}`)}
              className={cn(
                "w-6 h-6",
                isBest ? "fill-green" : "fill-none",
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
              {post.thread.title}
            </h1>
          )}
          <MarkdownBlock
            content={revisionContent}
            archectype="body"
          />
        </div>
        {(isQuestion && post.thread.tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-gray-600">
            {post.thread.tags.map(tag => (
              <code key={`${post['post-id']}-${tag}`} className={`
                  inline-block rounded bg-blue-soft
                  px-1.5 dark:bg-blue-300`}>
                #{tag}
              </code>
            ))}
          </div>
        )}
        <div className="flex items-center">
          <div
            className="flex items-center space-x-2 font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {/* FIXME: Change to be an %groups-like author stack, with oldest on top */}
            <Author ship={postAuthor} hideTime />
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
