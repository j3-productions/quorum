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
import { TEST_BOARD_POSTS, TEST_SEARCH_POSTS } from '~/constants';


export function PostWall({className}) {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const params = useParams();

  const minPage = 1;
  const maxPage = 10;  // FIXME: Change to `useState` informed by BE in production
  const currPage = params?.page ? Number(params?.page) : 1;
  const maxPageTabs = 2;  // FIXME: Anything over 2 is messed up on mobile, and 2 is a bit suspect
  const maxPageDigits: number = Math.floor(Math.log10(Math.max(maxPage, 1))) + 1;

  const pagePath = ["page"].filter(s => s in params).fill("../").join("");
  const basePath = ["query", "query", "page"].filter(s => s in params).fill("../").join("");

  useEffect(() => {
    setPosts(
      params?.query !== undefined
        ? TEST_SEARCH_POSTS
        : TEST_BOARD_POSTS
    );
  }, [params]);

  // TODO: Add links to tags to search for all posts containing that tag
  // TODO: Figure out the search syntax for tag searches

  return (
    <div className={className}>
      <div className="mx-auto flex h-full w-full flex-col">
        {/* Post Container */}
        {posts.map((post) => {
          const score = Object.values(post.votes).reduce(
            (n, i) => n + (i === "up" ? 1 : -1), 0
          );

          return (
            <div key={post['post-id']} className="my-6 px-6">
              <div
                role="link"
                className="card cursor-pointer bg-gray-100"
                onClick={() => navigate(
                  `${basePath}thread/${post['thread-id']}`,
                  {relative: "path"}
                )}
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
                  <p>
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
        })}

        {/* Pagination Bar */}
        {posts.length > 0 && (
          <div className="flex flex-row w-full justify-between items-center px-2">
            <div className="flex flex-row gap-2">
              <Link className="button"
                  to={`${pagePath}${minPage}`} relative="path"
                  disabled={currPage <= minPage}
              >
                <DoubleArrowRightIcon className="flip-y" />
              </Link>
              <Link className="button"
                  to={`${pagePath}${currPage - 1}`} relative="path"
                  disabled={currPage <= minPage}
              >
                <ChevronRightIcon className="flip-y" />
              </Link>
            </div>
            <div className="flex flex-row justify-center gap-2 overflow-hidden">
              {_.range(-maxPageTabs, maxPageTabs + 1).map(i => (
                <Link key={i}
                    to={`${pagePath}${currPage + i}`} relative="path"
                    className={cn(
                      (i === 0) ? "font-semibold text-black" : "text-gray-400",
                      (currPage + i < minPage || currPage + i > maxPage) && "invisible",
                    )}
                >
                  {String(Math.max(0, currPage + i)).padStart(maxPageDigits, '0')}
                </Link>
              ))}
            </div>
            <div className="flex flex-row gap-2">
              <Link className="button"
                  to={`${pagePath}${currPage + 1}`} relative="path"
                  disabled={currPage >= maxPage}
              >
                <ChevronRightIcon className="" />
              </Link>
              <Link className="button"
                  to={`${pagePath}${maxPage}`} relative="path"
                  disabled={currPage >= maxPage}
              >
                <DoubleArrowRightIcon className="" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
