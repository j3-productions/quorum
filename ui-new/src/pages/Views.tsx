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
import { PostCard } from '~/components/Post';
import { TEST_THREADS } from '~/constants';


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
    // TODO: Remove debugging statement
    if (params?.query !== undefined) { console.log(decodeURIComponent(params.query)); }
    setPosts(
      params?.query === undefined
        ? Object.values(TEST_THREADS)
        : Object.values(TEST_THREADS).filter((thread) =>
          thread.title.toLowerCase().includes(params.query.toLowerCase())
          || thread.content.toLowerCase().includes(params.query.toLowerCase())
        )
    );
  }, [params]);

  // TODO: Add links to tags to search for all posts containing that tag
  // TODO: Figure out the search syntax for tag searches

  return (
    <div className={className}>
      <div className="mx-auto flex h-full w-full flex-col">
        {/* Post Container */}
        {posts.map((post) => (
          <PostCard key={post['post-id']} post={post}
            toPost={(post) =>
              () => navigate(`${basePath}thread/${post['thread-id']}`, {relative: "path"})
            }
          />
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
