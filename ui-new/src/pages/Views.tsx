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
import api from '~/api';
import { PostCard, PostStrand } from '~/components/Post';
import { BoardPage, BoardPost, BoardThread } from '~/types/quorum';


export function PostWall({className}) {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [pageCount, setPageCount] = useState<Number>(0);
  const navigate = useNavigate();
  const params = useParams();

  const minPage = 1;
  const maxPage = pageCount;
  const currPage = params?.page ? Number(params?.page) : 1;
  // FIXME: Anything over 2 is messed up on mobile, and 2 is a bit suspect
  const maxPageTabs = 2;
  const maxPageDigits: number = Math.floor(Math.log10(Math.max(maxPage, 1))) + 1;

  const pagePath = ["page"].filter(s => s in params).fill("../").join("");
  const basePath = ["query", "query", "page"].filter(s => s in params).fill("../").join("");

  // FIXME: Don't just blindly use 'params' as an effect target; it causes
  // undue re-renders when modals are brought up (e.g. the delete modal).
  useEffect(() => {
    api.scry<BoardPage>({
      app: "forums",
      path: `${
        (params?.chShip === undefined)
          ? ``
          : `/board/${params.chShip}/${params.chName}`
      }/${
        (params?.query === undefined)
          ? `questions/${currPage - 1}`
          : `search/${currPage - 1}/${params.query}`
      }`
    }).then(({posts, pages}: BoardPage) => {
      setPosts(posts);
      setPageCount(pages);
    });
  }, [params]);

  // TODO: Add links to tags to search for all posts containing that tag
  // TODO: Figure out the search syntax for tag searches

  return (
    <div className={className}>
      <div className="mx-auto flex h-full w-full flex-col">
        {posts.map(post => (
          <PostCard key={post['post-id']} post={post} />
        ))}

        {/* FIXME: Padding top is a hack here; want same spacing as top nav
            to first card at the bottom */}
        {/* Pagination Bar */}
        {posts.length > 0 && (
          <div className="flex flex-row w-full justify-between items-center px-2 pt-6">
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

export function PostThread({className}) {
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState<BoardPost>(undefined);
  const [answers, setAnswers] = useState<BoardPost[]>(undefined);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    api.scry<BoardThread>({
      app: "forums",
      path: `/board/${params.chShip}/${params.chName}/thread/${params.thread}`,
    }).then(({thread, posts}: BoardThread) => {
      setQuestion(thread);
      setAnswers(posts);
      setIsLoading(false);
    });
  }, [params]);

  // TODO: Make the "Answer" button link to the user's existing answer if
  // it exists.

  const isBestTid = (p: BoardPost): number =>
    +(p["post-id"] === question.thread["best-id"]);
  const calcScore = (p: BoardPost): number =>
    Object.values(p.votes).reduce((n, i) => n + (i === "up" ? 1 : -1), 0);
  const ourResponse = isLoading
    ? undefined
    : answers.find(p => p.history.slice(-1)[0].author === window.our);

  return isLoading ? null : (
    <div className={className}>
      <PostStrand post={question} parent={question} />
      {answers
        .sort((a, b) => (
          isBestTid(b) - isBestTid(a)
          || calcScore(b) - calcScore(a)
          || b.history[0].timestamp - a.history[0].timestamp
        )).map(answer => (
          <PostStrand key={answer['post-id']} post={answer} parent={question} />
        )
      )}

      <footer className="mt-4 flex items-center justify-between space-x-2">
        <div className="ml-auto flex items-center space-x-2">
          <Link className="secondary-button ml-auto" to="../../" relative="path">
            Cancel
          </Link>
          <Link className="button" to="response"
            disabled={isLoading || (ourResponse !== undefined)}
          >
            Answer
          </Link>
        </div>
      </footer>
    </div>
  );
}
