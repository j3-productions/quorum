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
export const TEST_THREADS = {
  10: {
    'title': "Simple Post",
    'tags': [],
    'post-id': 10,
    'thread-id': 10,
    'parent-id': undefined,
    'timestamp': Date.now(),
    'author': "~sampel-palnet",
    'content': "This is a simple post with no votes, tags, comments, nor edits",
    'comments': [],
    'history': {},
    'votes': {},
    'editors': [],
  },
  20: {
    'title': "Moderate Post",
    'tags': TEST_TAGS.slice(0, 1).map(({value}) => value),
    'post-id': 20,
    'thread-id': 20,
    'parent-id': undefined,
    'timestamp': Date.now()  - 1000000000/4,
    'author': "~zod",
    'content': "This is a post with votes, tags, and comments, but no edits",
    'comments': [21],
    'history': {},
    'votes': {"~nec": "down"},
    'editors': [],
  },
  30: {
    'title': "Complex Post",
    'tags': TEST_TAGS.slice(0, 3).map(({value}) => value),
    'post-id': 30,
    'thread-id': 30,
    'parent-id': undefined,
    'timestamp': Date.now() - 1000000000,
    'author': "~nut",
    'content': "This is a post with votes, tags, comments, and edits",
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
  40: {
    'title': "Filler Post 1",
    'tags': TEST_TAGS.slice(0, 2).map(({value}) => value),
    'post-id': 40,
    'thread-id': 40,
    'parent-id': undefined,
    'timestamp': Date.now() - 2000000000,
    'author': "~dister-dozzod-dalten",
    'content': "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
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
  50: {
    'title': "Filler Post 2",
    'tags': TEST_TAGS.slice(0, 3).map(({value}) => value),
    'post-id': 50,
    'thread-id': 50,
    'parent-id': undefined,
    'timestamp': Date.now() - 2000000000,
    'author': "~dister-dozzod-dalten",
    'content': "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
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
};
export const TEST_POSTS = {
  21: {
    'post-id': 21,
    'thread-id': 21,
    'parent-id': 20,
    'timestamp': Date.now(),
    'author': "~mister-poster",
    'content': "This is a simple response with no comments nor edits",
    'comments': [],
    'history': {},
    'votes': {"~zod": "up"},
    'editors': [],
  },
  31: {
    'post-id': 31,
    'thread-id': 31,
    'parent-id': 30,
    'timestamp': Date.now(),
    'author': "~zod",
    'content': "Aliquam ultrices sagittis orci a scelerisque purus. Nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi. Proin libero nunc consequat interdum varius sit amet mattis vulputate. Elit pellentesque habitant morbi tristique senectus et netus. Gravida neque convallis a cras semper auctor neque. Enim nulla aliquet porttitor lacus luctus. Vitae semper quis lectus nulla at volutpat. Scelerisque viverra mauris in aliquam. Vel quam elementum pulvinar etiam non quam. Integer vitae justo eget magna fermentum iaculis eu non. Vel orci porta non pulvinar neque laoreet suspendisse. A diam maecenas sed enim ut sem. Imperdiet sed euismod nisi porta. Pharetra convallis posuere morbi leo.",
    'comments': [],
    'history': {},
    'votes': {},
    'editors': [],
  },
  32: {
    'post-id': 32,
    'thread-id': 32,
    'parent-id': 30,
    'timestamp': Date.now(),
    'author': "~nec",
    'content': "Commodo quis imperdiet massa tincidunt. Leo urna molestie at elementum eu. Lobortis mattis aliquam faucibus purus in massa tempor. Aliquam id diam maecenas ultricies mi eget mauris pharetra et. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper. Sit amet tellus cras adipiscing enim eu. Mollis nunc sed id semper risus in hendrerit gravida. Integer feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Gravida rutrum quisque non tellus. Tempus imperdiet nulla malesuada pellentesque elit eget gravida cum sociis. At auctor urna nunc id. Tellus mauris a diam maecenas sed enim ut sem. Amet nisl purus in mollis nunc sed id. A scelerisque purus semper eget duis. Neque ornare aenean euismod elementum nisi quis eleifend quam adipiscing. Consectetur libero id faucibus nisl tincidunt eget nullam non.",
    'comments': [],
    'history': {},
    'votes': {},
    'editors': [],
  },
  33: {
    'post-id': 33,
    'thread-id': 33,
    'parent-id': 30,
    'timestamp': Date.now(),
    'author': "~nut",
    'content': "Nam at lectus urna duis convallis. Nulla aliquet enim tortor at auctor urna nunc id cursus. Pellentesque id nibh tortor id aliquet lectus. Arcu vitae elementum curabitur vitae nunc. Ullamcorper sit amet risus nullam eget felis. Nunc sed blandit libero volutpat sed cras ornare arcu. Velit dignissim sodales ut eu sem integer vitae justo eget. Sit amet purus gravida quis blandit turpis cursus. Urna nunc id cursus metus aliquam eleifend mi in nulla. Ac felis donec et odio pellentesque diam volutpat commodo sed. Vel eros donec ac odio tempor orci. Arcu non sodales neque sodales. Bibendum arcu vitae elementum curabitur vitae. Placerat in egestas erat imperdiet sed euismod nisi porta lorem. Adipiscing vitae proin sagittis nisl rhoncus mattis. Turpis massa tincidunt dui ut ornare lectus sit. Viverra justo nec ultrices dui sapien.",
    'comments': [],
    'history': {},
    'votes': {"~zod": "up"},
    'editors': [],
  },
  41: {
    'post-id': 41,
    'thread-id': 41,
    'parent-id': 40,
    'timestamp': Date.now(),
    'author': "~sampel-palnet",
    'content': `### Philosophy

Markdown is intended to be as easy-to-read and easy-to-write as is feasible.

Readability, however, is emphasized above all else. A Markdown-formatted
document should be publishable as-is, as plain text, without looking
like it's been marked up with tags or formatting instructions. While
Markdown's syntax has been influenced by several existing text-to-HTML
filters -- including [Setext](http://docutils.sourceforge.net/mirror/setext.html), [atx](http://www.aaronsw.com/2002/atx/), [Textile](http://textism.com/tools/textile/), [reStructuredText](http://docutils.sourceforge.net/rst.html),
[Grutatext](http://www.triptico.com/software/grutatxt.html), and [EtText](http://ettext.taint.org/doc/) -- the single biggest source of
inspiration for Markdown's syntax is the format of plain text email.

## Block Elements

### Paragraphs and Line Breaks

A paragraph is simply one or more consecutive lines of text, separated
by one or more blank lines. (A blank line is any line that looks like a
blank line -- a line containing nothing but spaces or tabs is considered
blank.) Normal paragraphs should not be indented with spaces or tabs.

The implication of the "one or more consecutive lines of text" rule is
that Markdown supports "hard-wrapped" text paragraphs. This differs
significantly from most other text-to-HTML formatters (including Movable
Type's "Convert Line Breaks" option) which translate every line break
character in a paragraph into a \`<br />\` tag.

When you *do* want to insert a \`<br />\` break tag using Markdown, you
end a line with two or more spaces, then type return.`,
    'comments': [],
    'history': {},
    'votes': {},
    'editors': [],
  },
  51: {
    'post-id': 51,
    'thread-id': 51,
    'parent-id': 50,
    'timestamp': Date.now(),
    'author': "~sampel-palnet",
    'content': `### Philosophy

Markdown is intended to be as easy-to-read and easy-to-write as is feasible.

Readability, however, is emphasized above all else. A Markdown-formatted
document should be publishable as-is, as plain text, without looking
like it's been marked up with tags or formatting instructions. While
Markdown's syntax has been influenced by several existing text-to-HTML
filters -- including [Setext](http://docutils.sourceforge.net/mirror/setext.html), [atx](http://www.aaronsw.com/2002/atx/), [Textile](http://textism.com/tools/textile/), [reStructuredText](http://docutils.sourceforge.net/rst.html),
[Grutatext](http://www.triptico.com/software/grutatxt.html), and [EtText](http://ettext.taint.org/doc/) -- the single biggest source of
inspiration for Markdown's syntax is the format of plain text email.

## Block Elements

### Paragraphs and Line Breaks

A paragraph is simply one or more consecutive lines of text, separated
by one or more blank lines. (A blank line is any line that looks like a
blank line -- a line containing nothing but spaces or tabs is considered
blank.) Normal paragraphs should not be indented with spaces or tabs.

The implication of the "one or more consecutive lines of text" rule is
that Markdown supports "hard-wrapped" text paragraphs. This differs
significantly from most other text-to-HTML formatters (including Movable
Type's "Convert Line Breaks" option) which translate every line break
character in a paragraph into a \`<br />\` tag.

When you *do* want to insert a \`<br />\` break tag using Markdown, you
end a line with two or more spaces, then type return.`,
    'comments': [],
    'history': {},
    'votes': {},
    'editors': [],
  },
};
