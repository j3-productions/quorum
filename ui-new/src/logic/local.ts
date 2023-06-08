import { format, formatDistance } from 'date-fns';
import { strToSym } from './utils';
import {
  Group,
} from '~/types/groups';
import {
  Inline,
  InlineKey,
  isBlockquote,
  isBreak,
  isBold,
  isInlineCode,
  isItalics,
  isLink,
  isShip,
  isStrikethrough,
  Link,
} from '~/types/content';


export const REF_CHAT_REGEX = /^\/1\/chan\/chat\/(~[a-z0-9-]+)\/([a-z0-9-]+)\/msg\/(~[a-z0-9-]+)\/([1-9][0-9\.]*)$/;


/**
 * FIXME: Replace this function now that custom channel types have rolled out.
 */
export function isGroupAdmin(group: Group): boolean {
  const vessel = group.fleet?.[window.our];
  return vessel && vessel.sects.includes("admin");
}

/**
 * FIXME: Is there a better way to do this with just the `landscape-apps` source
 * functions?
 */
export function isChatRef(text: string) {
  return REF_CHAT_REGEX.test(text);
}

export function makeTerseDate(date: Date) {
  return format(date, 'yy/MM/dd');
}

export function makeTerseDateAndTime(date: Date) {
  return format(date, 'yy/MM/dd HH:mm');
}

export function makePrettyLapse(date: Date) {
  return formatDistance(date, Date.now(), {addSuffix: true})
    .replace(/ a /, ' 1 ')
    .replace(/less than /, '<')
    .replace(/about /, '~')
    .replace(/almost /, '<~')
    .replace(/over /, '>~');
}

export function makeTerseLapse(date: Date) {
  return formatDistance(date, Date.now(), {addSuffix: true})
    .replace(/ a /, ' 1 ')
    .replace(/less than /, '<')
    .replace(/about /, '~')
    .replace(/almost /, '<~')
    .replace(/over /, '>~')
    .replace(/ /, '').replace(/ago/, '')
    .replace(/minute(s)?/, 'm')
    .replace(/hour(s)?/, 'h')
    .replace(/day(s)?/, 'D')
    .replace(/month(s)?/, 'M')
    .replace(/year(s)?/, 'Y');
}

/**
 * Given a channel title (e.g. "Apples and Oranges"), generate and return
 * a set of viable channel IDs (e.g. ["apples-and-oranges",
 * "apples-and-oranges-2"]).
 */
export function getChannelIdFromTitle(
  channel: string
): [string, string] {
  const titleIsNumber = Number.isInteger(Number(channel));
  const baseChannelName = titleIsNumber
    ? `channel-${channel}`
    : strToSym(channel).replace(/[^a-z]*([a-z][-\w\d]+)/i, '$1');
  const randomSmallNumber = Math.floor(Math.random() * 100);

  return [baseChannelName, `${baseChannelName}-${randomSmallNumber}`];
}

/**
 * Given an inline string, generate a string with equivalent Markdown
 * annotations.
 */
export function inlineToMarkdown(inline: Inline): string {
  if (typeof inline === "string") {
    return inline;
  }

  if (isBreak(inline)) {
    return "\n";
  }

  if (isBold(inline)) {
    return inline.bold.map((i: Inline) => `**${inlineToMarkdown(i)}**`).join(" ");
  }

  if (isItalics(inline)) {
    return inline.italics.map((i: Inline) => `*${inlineToMarkdown(i)}*`).join(" ");
  }

  // TODO: Add support for strikethrough with a plugin?
  // `~${inlineToMarkdown(i)}~`
  if (isStrikethrough(inline)) {
    return inline.strike.map((i: Inline) => inlineToMarkdown(i)).join(" ");
  }

  // TODO: Should fixup links; simple links like `urbit.org` behave
  // weirdly and act as links internal to the application (e.g.
  // `/apps/quorum/.../urbit.org/` instead of `urbit.org`).
  if (isLink(inline)) {
    return `[${inline.link.content}](${inline.link.href})`;
  }

  // FIXME: This works, but is a little funky. Ideally, the import would
  // have a `> ` prefix for each link, but this interacts poorly with
  // newlines. Also, it"d be better if any newline broke up the quote,
  // but I think the current behavior is more standard for markdown.
  if (isBlockquote(inline)) {
    return Array.isArray(inline.blockquote)
      ? `> ${inline.blockquote.map((i) => inlineToMarkdown(i)).join(" ")}\n`
      : `> ${inline.blockquote}\n`;
  }

  if (isInlineCode(inline)) {
    return typeof inline["inline-code"] === "object"
      ? `\`${inlineToMarkdown(inline["inline-code"])}\``
      : `\`${inline["inline-code"]}\``;
  }

  // TODO: Figure out how to transform ship syntax in a satisfactory way
  // (perhaps link to the profile of the ship relative to the current
  // board?)
  if (isShip(inline)) {
    return inline.ship;
  }

  return "";
}