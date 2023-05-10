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
    'content':
`
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
end a line with two or more spaces, then type return.

### Headers

Markdown supports two styles of headers, [Setext] [1] and [atx] [2].

Optionally, you may "close" atx-style headers. This is purely
cosmetic -- you can use this if you think it looks better. The
closing hashes don't even need to match the number of hashes
used to open the header. (The number of opening hashes
determines the header level.)
`,
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
    'content':
`
### Blockquotes

Markdown uses email-style \`>\` characters for blockquoting. If you're
familiar with quoting passages of text in an email message, then you
know how to create a blockquote in Markdown. It looks best if you hard
wrap the text and put a \`>\` before every line:

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.

Markdown allows you to be lazy and only put the \`>\` before the first
line of a hard-wrapped paragraph:

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.

> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
id sem consectetuer libero luctus adipiscing.

Blockquotes can be nested (i.e. a blockquote-in-a-blockquote) by
adding additional levels of \`>\`:

> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.
`,
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
    'content':
`
### Lists

Markdown supports ordered (numbered) and unordered (bulleted) lists.

Unordered lists use asterisks, pluses, and hyphens -- interchangably
-- as list markers:

*   Red
*   Green
*   Blue

is equivalent to:

+   Red
+   Green
+   Blue

and:

-   Red
-   Green
-   Blue

Ordered lists use numbers followed by periods:

1.  Bird
2.  McHale
3.  Parish

It's important to note that the actual numbers you use to mark the
list have no effect on the HTML output Markdown produces. The HTML
Markdown produces from the above list is:

If you instead wrote the list in Markdown like this:

1.  Bird
1.  McHale
1.  Parish

or even:

3. Bird
1. McHale
8. Parish

you'd get the exact same HTML output. The point is, if you want to,
you can use ordinal numbers in your ordered Markdown lists, so that
the numbers in your source match the numbers in your published HTML.
But if you want to be lazy, you don't have to.

To make lists look nice, you can wrap items with hanging indents:

*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
    Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
    viverra nec, fringilla in, laoreet vitae, risus.
*   Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
    Suspendisse id sem consectetuer libero luctus adipiscing.

But if you want to be lazy, you don't have to:

*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
viverra nec, fringilla in, laoreet vitae, risus.
*   Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
Suspendisse id sem consectetuer libero luctus adipiscing.

List items may consist of multiple paragraphs. Each subsequent
paragraph in a list item must be indented by either 4 spaces
or one tab:

1.  This is a list item with two paragraphs. Lorem ipsum dolor
    sit amet, consectetuer adipiscing elit. Aliquam hendrerit
    mi posuere lectus.

    Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus. Donec sit amet nisl. Aliquam semper ipsum
    sit amet velit.

2.  Suspendisse id sem consectetuer libero luctus adipiscing.

It looks nice if you indent every line of the subsequent
paragraphs, but here again, Markdown will allow you to be
lazy:

*   This is a list item with two paragraphs.

    This is the second paragraph in the list item. You're
only required to indent the first line. Lorem ipsum dolor
sit amet, consectetuer adipiscing elit.

*   Another item in the same list.

To put a blockquote within a list item, the blockquote's \`>\`
delimiters need to be indented:

*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.

To put a code block within a list item, the code block needs
to be indented *twice* -- 8 spaces or two tabs:

*   A list item with a code block:

        <code goes here>
`,
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
    'content':
`
### Code Blocks

Pre-formatted code blocks are used for writing about programming or
markup source code. Rather than forming normal paragraphs, the lines
of a code block are interpreted literally. Markdown wraps a code block
in both \`<pre>\` and \`<code>\` tags.

To produce a code block in Markdown, simply indent every line of the
block by at least 4 spaces or 1 tab.

This is a normal paragraph:

    This is a code block.

Here is an example of AppleScript:

    tell application "Foo"
        beep
    end tell

A code block continues until it reaches a line that is not indented
(or the end of the article).

Within a code block, ampersands (\`&\`) and angle brackets (\`<\` and \`>\`)
are automatically converted into HTML entities. This makes it very
easy to include example HTML source code using Markdown -- just paste
it and indent it, and Markdown will handle the hassle of encoding the
ampersands and angle brackets. For example, this:

    <div class="footer">
        &copy; 2004 Foo Corporation
    </div>

Regular Markdown syntax is not processed within code blocks. E.g.,
asterisks are just literal asterisks within a code block. This means
it's also easy to use Markdown to write about Markdown's own syntax.

\`\`\`
tell application "Foo"
    beep
end tell
\`\`\`
`,
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
    'content':
`
# Markdown: Syntax

*   [Overview](#overview)
    *   [Philosophy](#philosophy)
    *   [Inline HTML](#html)
    *   [Automatic Escaping for Special Characters](#autoescape)
*   [Block Elements](#block)
    *   [Paragraphs and Line Breaks](#p)
    *   [Headers](#header)
    *   [Blockquotes](#blockquote)
    *   [Lists](#list)
    *   [Code Blocks](#precode)
    *   [Horizontal Rules](#hr)
*   [Span Elements](#span)
    *   [Links](#link)
    *   [Emphasis](#em)
    *   [Code](#code)
    *   [Images](#img)
*   [Miscellaneous](#misc)
    *   [Backslash Escapes](#backslash)
    *   [Automatic Links](#autolink)


**Note:** This document is itself written using Markdown; you
can [see the source for it by adding '.text' to the URL](/projects/markdown/syntax.text).

----

## Overview

### Philosophy

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
end a line with two or more spaces, then type return.

### Headers

Markdown supports two styles of headers, [Setext] [1] and [atx] [2].

Optionally, you may "close" atx-style headers. This is purely
cosmetic -- you can use this if you think it looks better. The
closing hashes don't even need to match the number of hashes
used to open the header. (The number of opening hashes
determines the header level.)


### Blockquotes

Markdown uses email-style \`>\` characters for blockquoting. If you're
familiar with quoting passages of text in an email message, then you
know how to create a blockquote in Markdown. It looks best if you hard
wrap the text and put a \`>\` before every line:

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.

Markdown allows you to be lazy and only put the \`>\` before the first
line of a hard-wrapped paragraph:

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.

> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
id sem consectetuer libero luctus adipiscing.

Blockquotes can be nested (i.e. a blockquote-in-a-blockquote) by
adding additional levels of \`>\`:

> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.

Blockquotes can contain other Markdown elements, including headers, lists,
and code blocks:

> ## This is a header.
>
> 1.   This is the first list item.
> 2.   This is the second list item.
>
> Here's some example code:
>
>     return shell_exec("echo $input | $markdown_script");

Any decent text editor should make email-style quoting easy. For
example, with BBEdit, you can make a selection and choose Increase
Quote Level from the Text menu.


### Lists

Markdown supports ordered (numbered) and unordered (bulleted) lists.

Unordered lists use asterisks, pluses, and hyphens -- interchangably
-- as list markers:

*   Red
*   Green
*   Blue

is equivalent to:

+   Red
+   Green
+   Blue

and:

-   Red
-   Green
-   Blue

Ordered lists use numbers followed by periods:

1.  Bird
2.  McHale
3.  Parish

It's important to note that the actual numbers you use to mark the
list have no effect on the HTML output Markdown produces. The HTML
Markdown produces from the above list is:

If you instead wrote the list in Markdown like this:

1.  Bird
1.  McHale
1.  Parish

or even:

3. Bird
1. McHale
8. Parish

you'd get the exact same HTML output. The point is, if you want to,
you can use ordinal numbers in your ordered Markdown lists, so that
the numbers in your source match the numbers in your published HTML.
But if you want to be lazy, you don't have to.

To make lists look nice, you can wrap items with hanging indents:

*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
    Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
    viverra nec, fringilla in, laoreet vitae, risus.
*   Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
    Suspendisse id sem consectetuer libero luctus adipiscing.

But if you want to be lazy, you don't have to:

*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
viverra nec, fringilla in, laoreet vitae, risus.
*   Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
Suspendisse id sem consectetuer libero luctus adipiscing.

List items may consist of multiple paragraphs. Each subsequent
paragraph in a list item must be indented by either 4 spaces
or one tab:

1.  This is a list item with two paragraphs. Lorem ipsum dolor
    sit amet, consectetuer adipiscing elit. Aliquam hendrerit
    mi posuere lectus.

    Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus. Donec sit amet nisl. Aliquam semper ipsum
    sit amet velit.

2.  Suspendisse id sem consectetuer libero luctus adipiscing.

It looks nice if you indent every line of the subsequent
paragraphs, but here again, Markdown will allow you to be
lazy:

*   This is a list item with two paragraphs.

    This is the second paragraph in the list item. You're
only required to indent the first line. Lorem ipsum dolor
sit amet, consectetuer adipiscing elit.

*   Another item in the same list.

To put a blockquote within a list item, the blockquote's \`>\`
delimiters need to be indented:

*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.

To put a code block within a list item, the code block needs
to be indented *twice* -- 8 spaces or two tabs:

*   A list item with a code block:

        <code goes here>

### Code Blocks

Pre-formatted code blocks are used for writing about programming or
markup source code. Rather than forming normal paragraphs, the lines
of a code block are interpreted literally. Markdown wraps a code block
in both \`<pre>\` and \`<code>\` tags.

To produce a code block in Markdown, simply indent every line of the
block by at least 4 spaces or 1 tab.

This is a normal paragraph:

    This is a code block.

Here is an example of AppleScript:

    tell application "Foo"
        beep
    end tell

A code block continues until it reaches a line that is not indented
(or the end of the article).

Within a code block, ampersands (\`&\`) and angle brackets (\`<\` and \`>\`)
are automatically converted into HTML entities. This makes it very
easy to include example HTML source code using Markdown -- just paste
it and indent it, and Markdown will handle the hassle of encoding the
ampersands and angle brackets. For example, this:

    <div class="footer">
        &copy; 2004 Foo Corporation
    </div>

Regular Markdown syntax is not processed within code blocks. E.g.,
asterisks are just literal asterisks within a code block. This means
it's also easy to use Markdown to write about Markdown's own syntax.

\`\`\`
tell application "Foo"
    beep
end tell
\`\`\`

## Span Elements

### Links

Markdown supports two style of links: *inline* and *reference*.

In both styles, the link text is delimited by [square brackets].

To create an inline link, use a set of regular parentheses immediately
after the link text's closing square bracket. Inside the parentheses,
put the URL where you want the link to point, along with an *optional*
title for the link, surrounded in quotes. For example:

This is [an example](http://example.com/) inline link.

[This link](http://example.net/) has no title attribute.

### Emphasis

Markdown treats asterisks (\`*\`) and underscores (\`_\`) as indicators of
emphasis. Text wrapped with one \`*\` or \`_\` will be wrapped with an
HTML \`<em>\` tag; double \`*\`'s or \`_\`'s will be wrapped with an HTML
\`<strong>\` tag. E.g., this input:

*single asterisks*

_single underscores_

**double asterisks**

__double underscores__

### Code

To indicate a span of code, wrap it with backtick quotes (\`\` \` \`\`).
Unlike a pre-formatted code block, a code span indicates code within a
normal paragraph. For example:

Use the \`printf()\` function.
`,
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
