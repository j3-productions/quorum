import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  CheckIcon,
  ChatBubbleIcon,
  ThickArrowUpIcon,
  ClockIcon,
} from '@radix-ui/react-icons';
import Author from '~/components/Author';
import { makeTerseLapse, makePrettyLapse } from '~/logic/utils';


export function PostWall({className}) {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    setPosts([
      {
        'title': "Simple Post",
        'tags': [],
        'content': "This is a simple post with no votes, tags, comments, nor edits",
        'post-id': 1,
        'thread-id': 1,
        'parent-id': undefined,
        'timestamp': Date.now(),
        'author': "~sampel-palnet",
        'comments': [],
        'history': {},
        'votes': {},
        'editors': [],
      },
      {
        'title': "Moderate Post",
        'tags': ["post"],
        'content': "This is a post with votes, tags, and comments, but no edits",
        'post-id': 2,
        'thread-id': 2,
        'parent-id': undefined,
        'timestamp': Date.now()  - 1000000000/4,
        'author': "~zod",
        'comments': [4],
        'history': {},
        'votes': {"~nec": "down"},
        'editors': [],
      },
      {
        'title': "Complex Post",
        'tags': ["post", "complex", "test"],
        'content': "This is a post with votes, tags, comments, and edits",
        'post-id': 3,
        'thread-id': 3,
        'parent-id': undefined,
        'timestamp': Date.now() - 1000000000,
        'author': "~nut",
        'comments': [5, 6, 7],
        'history': {
          [Date.now() - 1000000000/2]: {
            who: "~nec",
            content: "This is an edited post with votes etc.",
          },
        },
        'votes': {"~nec": "up", "~bud": "down", "~wex": "up"},
        'editors': ["~nec"],
      },
    ]);
  }, []);

  // TODO: Add links to tags to search for all posts containing that tag
  // TODO: Figure out the search syntax for tag searches

  return (
    <div className={className}>
      <div className="mx-auto flex h-full w-full flex-col">
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
                  `${params?.chPage !== undefined ? "../" : ""}thread/${post['thread-id']}`
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
      </div>
    </div>
  );
}
