import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, LinkProps } from 'react-router-dom';
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
  ChevronLeftIcon,
  DoubleArrowRightIcon,
  DoubleArrowLeftIcon,
} from '@radix-ui/react-icons';
import api from '~/api';
import { PostCard, PostStrand } from '~/components/Post';
import { usePage, useThread } from '~/state/quorum';
import { BoardPage, BoardPost, BoardThread } from '~/types/quorum';
import { ClassProps } from '~/types/ui';


export function PostWall({className}: ClassProps) {
  const navigate = useNavigate();
  const params = useParams();

  const currPage: number = params?.page ? Number(params?.page) : 1;
  const pagePath: string = ["page"].filter(s => s in params).fill("../").join("");
  const page: BoardPage | undefined = usePage(
    params?.chShip
      ? `${params?.chShip}/${params?.chName}`
      : "",
    currPage - 1,
    params?.query,
  );
  const pagePosts = page?.posts || [];

  const minPage: number = 1;
  const maxPage: number = page?.pages || 1;
  // FIXME: Anything over 2 is messed up on mobile, and 2 is a bit suspect
  const maxPageTabs: number = 2;

  return (
    <div className={className}>
      <div className="mx-auto flex h-full w-full flex-col">
        {pagePosts.map(post => (
          <PostCard key={`${post['board']}/${post['post-id']}`} post={post} />
        ))}

        {/* FIXME: Padding top is a hack here; want same spacing as top nav
            to first card at the bottom */}
        {/* Pagination Bar */}
        {pagePosts.length > 0 && (
          <div className="flex flex-row w-full justify-between items-center px-2 pt-6">
            <div className="flex flex-row gap-2">
              <ToggleLink to={`${pagePath}${minPage}`} relative="path"
                title="First Page"
                disabled={currPage <= minPage}
                className="button"
              >
                <DoubleArrowLeftIcon />
              </ToggleLink>
              <ToggleLink to={`${pagePath}${currPage - 1}`} relative="path"
                title="Previous Page"
                disabled={currPage <= minPage}
                className="button"
              >
                <ChevronLeftIcon />
              </ToggleLink>
            </div>
            <div className="flex flex-row justify-center gap-6 overflow-hidden">
              {_.range(-maxPageTabs, maxPageTabs + 1).map(i => (
                <Link key={i}
                  to={`${pagePath}${currPage + i}`} relative="path"
                  className={cn(
                    (i === 0) ? "font-semibold text-black" : "text-gray-400",
                    (currPage + i < minPage || currPage + i > maxPage) && "invisible",
                  )}
                >
                  {String(Math.max(0, currPage + i))/*.padStart(maxPageDigits, '0')*/}
                </Link>
              ))}
            </div>
            <div className="flex flex-row gap-2">
              <ToggleLink to={`${pagePath}${currPage + 1}`} relative="path"
                title="Next Page"
                disabled={currPage >= maxPage}
                className="button"
              >
                <ChevronRightIcon />
              </ToggleLink>
              <ToggleLink to={`${pagePath}${maxPage}`} relative="path"
                title="Last Page"
                disabled={currPage >= maxPage}
                className="button"
              >
                <DoubleArrowRightIcon />
              </ToggleLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PostThread({className}: ClassProps) {
  const navigate = useNavigate();
  const params = useParams();

  const thread: BoardThread | undefined = useThread(
    `${params?.chShip}/${params?.chName}`,
    Number(params?.thread || 0),
  );

  // TODO: Make the "Answer" button link to the user's existing answer if
  // it exists.
  // TODO: On effect for question and responses, change the content to the
  // view the latest revision (otherwise, you can edit and still be looking
  // at the old version, even though the new one is available).

  const isBestTid = (p: BoardPost): number =>
    +(p["post-id"] === thread?.thread.thread?.["best-id"]);
  const calcScore = (p: BoardPost): number =>
    Object.values(p.votes).reduce((n, i) => n + (i === "up" ? 1 : -1), 0);
  const ourResponse =
    (thread?.posts || []).find(p => p.history.slice(-1)[0].author === window.our);

  return (thread === undefined) ? null : (
    <div className={className}>
      <PostStrand post={thread?.thread} parent={thread?.thread} />
      {(thread?.posts || [])
        .sort((a, b) => (
          isBestTid(b) - isBestTid(a)
          || calcScore(b) - calcScore(a)
          || b.history[0].timestamp - a.history[0].timestamp
        )).map(post => (
          <PostStrand key={post['post-id']} post={post} parent={thread?.thread} />
        )
      )}

      <footer className="mt-4 flex items-center justify-between space-x-2">
        <div className="ml-auto flex items-center space-x-2">
          <Link to="../../" relative="path"
            className="secondary-button ml-auto"
          >
            Cancel
          </Link>
          <ToggleLink to="response"
            disabled={(thread === undefined) || (ourResponse !== undefined)}
            className="button"
          >
            Answer
          </ToggleLink>
        </div>
      </footer>
    </div>
  );
}

function ToggleLink({
  children,
  disabled = false,
  ...props
}: LinkProps & {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return disabled ? (
    <a aria-disabled="true" {...props}>
      {children}
    </a>
  ) : (
    <Link {...props}>
      {children}
    </Link>
  );
}
