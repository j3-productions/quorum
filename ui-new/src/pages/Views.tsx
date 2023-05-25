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
import { PostCard } from '~/components/Post';
import { BoardPage, BoardPost } from '~/types/quorum';


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
      path: `/board/${params.chShip}/${params.chName}/${
        (params?.query === undefined)
          ? `questions/${currPage - 1}`
          : `search/${currPage - 1}/${decodeURIComponent(params.query)}`
      }`
    }).then(({posts, pages}: BoardPage) => {
      setPosts(posts);
      setPageCount(pages);
    });
    // setPosts(
    //   params?.query === undefined
    //     ? Object.values(TEST_THREADS)
    //     : Object.values(TEST_THREADS).filter((thread) =>
    //       thread.title.toLowerCase().includes(params.query.toLowerCase())
    //       || thread.content.toLowerCase().includes(params.query.toLowerCase())
    //     )
    // );
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
              () => navigate(`${basePath}thread/${
                post['parent-id'] !== 0
                  ? post['parent-id']
                  : post['post-id']
              }`, {relative: "path"})
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
