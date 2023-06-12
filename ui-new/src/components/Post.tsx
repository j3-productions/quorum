import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { stringToTa } from "@urbit/api";
import api from '~/api';
import Author from '~/components/Author';
import PostAuthor from '~/components/PostAuthor';
import Avatar from '~/components/Avatar';
import MarkdownBlock from '~/components/MarkdownBlock';
import VoteIcon from '~/components/icons/VoteIcon';
import BestIcon from '~/components/icons/BestIcon';
import { useModalNavigate, useAnchorNavigate } from '~/logic/routing';
import { useCopy } from '~/logic/utils';
import {
  calcScoreStr,
  getSnapshotAt,
  getOriginalEdit,
  getLatestEdit,
} from '~/logic/post';
import { makeTerseLapse, makePrettyLapse } from '~/logic/local';
import { BoardPost, PostEdit } from '~/types/quorum';


// FIXME: Consider promoting the per-thread and per-tag divs into proper hrefs
// so they can be more easily navigated to on desktop devices.


export function PostCard({
  post
}: {
  post: BoardPost;
}) {
  // FIXME: Consider updating this so that cards for child posts contain
  // information about the parent post (e.g. the thread title, author)
  const navigate = useNavigate();

  return (
    <div className="my-6 px-6">
      <div
        role="link"
        className="card cursor-pointer bg-gray-100"
        onClick={() =>
          navigate(`/channel/${post.group}/${post.board}/thread/${
            post["parent-id"] !== 0
              ? post["parent-id"]
              : post["post-id"]
          }`)
        }
      >
        <header className="space-y-8">
          {post?.thread && (
            <React.Fragment>
              <h1 className="break-words text-3xl font-semibold leading-10">
                {post.thread?.title}
              </h1>
              <p className="font-semibold text-gray-400">
                <span className="flex items-center">
                  <span>{format(getOriginalEdit(post).timestamp, 'LLLL do, yyyy')}</span>
                  <PostTags
                    post={post}
                    className="ml-auto justify-end"
                  />
                </span>
              </p>
            </React.Fragment>
          )}

          <MarkdownBlock
            content={getLatestEdit(post).content}
            archetype="desc"
            className="line-clamp-5"
          />

          <div className="flex items-center">
            <div
              className="flex items-center space-x-2 font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              <PostAuthor post={post} />
            </div>

            <div
              className="ml-auto flex items-center space-x-2 text-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              {/* TODO: Consider removing or reworking this indicator. */}
              {(post?.thread && post.thread?.["best-id"] !== 0) &&
                <BestIcon className="h-5 w-5" />
              }
              <div className="flex items-center space-x-2" title="Vote Score">
                <ThickArrowUpIcon className="h-5 w-5" />
                {calcScoreStr(post)}
              </div>
              <div className="flex items-center space-x-2" title="Comment Count">
                <ChatBubbleIcon className="h-5 w-5" />
                &nbsp;{post?.thread ? post.thread?.replies.length : post.comments.length}
              </div>
              <div className="flex items-center space-x-2" title="Latest Activity">
                <CounterClockwiseClockIcon className="h-5 w-5" />
                &nbsp;{makeTerseLapse(new Date(getLatestEdit(post).timestamp))}
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}

export function PostStrand({
  post,
  parent
}: {
  post: BoardPost;
  parent?: BoardPost;
}) {
  // TODO: Change the background of the strand if:
  // - it's displaying a version older than the latest
  // - the post belongs to the user (use a light blue instead of white?)
  const [editId, setEditId] = useState<number>(0);
  const {didCopy, doCopy} = useCopy(
    `TODO: Relative link to the post (using %lure?) #${post["post-id"]}`
  );

  const modalNavigate = useModalNavigate();
  const navigate = useNavigate();
  const location = useLocation();

  const editPost: BoardPost = getSnapshotAt(post, editId);
  const totalEdits: number = Object.keys(post.history).length;
  const postAuthor: string = getOriginalEdit(post).author;
  const parentAuthor: string | undefined = parent && getOriginalEdit(parent).author;

  const isQuestion: boolean = post?.thread ? true : false;
  const isThread: boolean = parent ? true : false;
  // TODO: The user should also be able to modify the post if they're
  // an admin for the current board.
  const canModify: boolean = postAuthor === window.our;
  const ourVote: string | undefined = post.votes[window.our];
  // TODO: After testing, the author of a post shouldn't be allowed
  // to vote on it.
  const canVote: boolean = true; // postAuthor !== window.our;
  const isBest: boolean = post["post-id"] === parent?.thread?.["best-id"];
  const canBest: boolean = parentAuthor === window.our;

  return (
    <div id={`${post["post-id"]}`} className={cn(
      "flex flex-row w-full justify-center",
      "border-gray-50 border-solid border-b-2",
      isQuestion ? "pb-6" : "py-6",
    )}>
      {isThread && (
        <div className="flex flex-col items-center py-2 px-4 gap-y-4 text-gray-800">
          <div className="flex flex-col items-center">
            <VoteIcon
              onClick={() => {
                canVote && api.poke({
                  app: "forums",
                  mark: "forums-poke",
                  json: {
                    board: post["board"],
                    action: {"vote": {
                      "post-id": post["post-id"],
                      "dir": "up",
                    }},
                  },
                });
              }}
              className={cn(
                "w-6 h-6",
                ourVote === "up" ? "fill-orange" : "fill-none",
                canVote
                  ? "hover:cursor-pointer"
                  : "text-gray-200 hover:cursor-not-allowed",
              )}
            />
            {calcScoreStr(post)}
            <VoteIcon
              onClick={() => {
                canVote && api.poke({
                  app: "forums",
                  mark: "forums-poke",
                  json: {
                    board: post["board"],
                    action: {"vote": {
                      "post-id": post["post-id"],
                      "dir": "down",
                    }},
                  },
                });
              }}
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
                <CounterClockwiseClockIcon className="w-6 h-6" />
                <p>v{totalEdits - editId}/{totalEdits}</p>
                <p>{makeTerseLapse(new Date(getLatestEdit(editPost).timestamp))}</p>
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content className="dropdown" side="right"> {/*w-56*/}
              <DropdownMenu.Item
                disabled
                className="dropdown-item flex cursor-default items-center space-x-2 text-gray-300 hover:bg-transparent"
              >
                Version
              </DropdownMenu.Item>
              {post.history.map(({author, timestamp}, index) => (
                <DropdownMenu.Item
                  key={`${author}-${timestamp}`}
                  onSelect={() => setEditId(index)}
                  className="dropdown-item flex items-center space-x-2"
                >
                  v{totalEdits - index}: {author}, {makePrettyLapse(new Date(timestamp))}
                </DropdownMenu.Item>
              ))}
              {/* <DropdownMenu.Arrow className="fill-white stroke-black" /> */}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          {!isQuestion && (
            <BestIcon
              onClick={() => {
                canBest && api.poke({
                  app: "forums",
                  mark: "forums-poke",
                  json: {
                    board: post["board"],
                    action: {"edit-thread": {
                      "post-id": parent?.["post-id"],
                      "best-id": post["post-id"],
                    }},
                  },
                });
              }}
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
              {post.thread?.title}
            </h1>
          )}
          <MarkdownBlock
            content={getLatestEdit(editPost).content}
            archetype="body"
          />
        </div>
        {isQuestion && (
          <PostTags post={post} />
        )}
        <div className="flex items-center">
          <div
            className="flex items-center space-x-2 font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            <PostAuthor post={editPost} />
          </div>

          <div
            className="ml-auto flex items-center space-x-2 text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            {(canModify && isThread) && (
              <React.Fragment>
                <div title="Edit"
                  className="hover:cursor-pointer"
                  onClick={() => navigate(`response/${post["post-id"]}`)}
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

function PostTags({
  post,
  className,
}: {
  post: BoardPost;
  className?: string;
}) {
  const anchorNavigate = useAnchorNavigate();

  // FIXME: The tags should really be `Link`s, but at present it's just more
  // convenient to use 'AnchorNavigate' (need to implement a context-sensitive
  // `AnchorLink` style component to help with this).
  return (
    <span className={cn(
      "flex flex-wrap items-center gap-2",
      className
    )}>
      {(post.thread?.tags || []).sort().map(tag => (
        <div
          key={`${tag}`}
          role="link"
          className={cn(
            "inline-block cursor-pointer rounded bg-blue-soft px-1.5 dark:bg-blue-300"
          )}
          onClick={(e) => {
            e.stopPropagation();
            anchorNavigate(`search/${
              stringToTa(`tag:${"a"}`).replace('~.', '~~')
            }`)
          }}
        >
          #{tag}
        </div>
      ))}
    </span>
  );
}
