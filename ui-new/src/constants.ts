// eslint-disable-next-line import/prefer-default-export
export const FETCH_PAGE_SIZE = 5;  // FIXME: Should be 50 in the non-test version

export const PASTEABLE_IMAGE_TYPES = [
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg',
  'image/tif',
  'image/webp',
];

export const AUTHORS = [
  '~litlep-nibbyt',
  '~tamlut-modnys',
  '~sidnym-ladrut',
];

// TODO: Migrate these test variables to Tlon's Urbit http-api mock.
export const TEST_TAGS = [
  {value: "tag-1", label: "#tag-1"},
  {value: "tag-2", label: "#tag-2"},
  {value: "tag-3", label: "#tag-3"},
  {value: "tag-4", label: "#tag-4"},
];
export const TEST_BOARD_POSTS = [
  {
    'title': "Simple Post",
    'tags': [],
    'content': "This is a simple post with no votes, tags, comments, nor edits",
    'post-id': 10,
    'thread-id': 10,
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
    'tags': TEST_TAGS.slice(0, 1).map(({value}) => value),
    'content': "This is a post with votes, tags, and comments, but no edits",
    'post-id': 20,
    'thread-id': 20,
    'parent-id': undefined,
    'timestamp': Date.now()  - 1000000000/4,
    'author': "~zod",
    'comments': [21],
    'history': {},
    'votes': {"~nec": "down"},
    'editors': [],
  },
  {
    'title': "Complex Post",
    'tags': TEST_TAGS.slice(0, 3).map(({value}) => value),
    'content': "This is a post with votes, tags, comments, and edits",
    'post-id': 30,
    'thread-id': 30,
    'parent-id': undefined,
    'timestamp': Date.now() - 1000000000,
    'author': "~nut",
    'comments': [31, 32, 33],
    'history': {
      [Date.now() - 1000000000/2]: {
        who: "~nec",
        content: "This is an edited post with votes etc.",
      },
    },
    'votes': {"~nec": "up", "~bud": "down", "~wex": "up"},
    'editors': ["~nec"],
  },
  {
    'title': "Filler Post 1",
    'tags': TEST_TAGS.slice(0, 2).map(({value}) => value),
    'content': "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    'post-id': 40,
    'thread-id': 40,
    'parent-id': undefined,
    'timestamp': Date.now() - 2000000000,
    'author': "~dister-dozzod-dalten",
    'comments': [41],
    'history': {
      [Date.now() - 2000000000 + 100000]: {
        who: "~mister-dozzod-dalten",
        content: "Fixing up this post from my moon",
      },
      [Date.now() - 2000000000 + 200000]: {
        who: "~martyr-dozzod-dalten",
        content: "Fixing up this post from my other moon",
      },
    },
    'votes': {"~nec": "up", "~bud": "down"},
    'editors': ["~mister-dozzod-dalten", "~martyr-dozzod-dalten"],
  },
  {
    'title': "Filler Post 2",
    'tags': TEST_TAGS.slice(0, 3).map(({value}) => value),
    'content': "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    'post-id': 50,
    'thread-id': 50,
    'parent-id': undefined,
    'timestamp': Date.now() - 2000000000,
    'author': "~dister-dozzod-dalten",
    'comments': [51],
    'history': {
      [Date.now() - 2000000000 + 100000]: {
        who: "~mister-dozzod-dalten",
        content: "Fixing up this post from my moon",
      },
      [Date.now() - 2000000000 + 200000]: {
        who: "~martyr-dozzod-dalten",
        content: "Fixing up this post from my other moon",
      },
    },
    'votes': {"~nec": "up", "~bud": "down", "~wex": "down", "~zod": "down"},
    'editors': ["~mister-dozzod-dalten", "~martyr-dozzod-dalten"],
  },
];
export const TEST_SEARCH_POSTS = TEST_BOARD_POSTS.map(
  ({title, content, ...etc}) => ({
    title: `${title} (Search)`,
    content: content.replace("post", "searched post"),
    ...etc,
  })
);
