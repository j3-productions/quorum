import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import api from '~/api';
import { useGroups } from '~/state/groups';
import { useBoardMetas } from '~/state/quorum';
import {
  isChannelJoined,
  canReadChannel,
  nestToFlag,
  isColor,
} from '~/logic/utils';
import { BoardMeta } from '~/types/quorum';
import { Groups, Group, GroupChannel } from '~/types/groups';
import { ChatBriefs, ChatBrief } from '~/types/chat';
import { ClassProps } from '~/types/ui';


interface ChannelProps {
  board: BoardMeta;
  group?: Group;
}


export default function ChannelGrid({className}: ClassProps) {
  const groups = useGroups();
  const boards = useBoardMetas();

  const channels: ChannelProps[] = (groups === undefined || boards === undefined)
    ? []
    : boards.map(board => ({
      board: board,
      group: groups?.[board.group],
    }));

  return (
    <div className={cn(
      `grid w-full h-fit grid-cols-2 gap-4 px-4
      justify-center sm:grid-cols-[repeat(auto-fit,minmax(auto,250px))]`,
      className,
    )}>
      {channels.map(channel => (
        <div key={`${channel.board.group}/${channel.board.board}`}
            className={`relative aspect-w-1 aspect-h-1 rounded-3xl ring-gray-800 ring-4`}>
          <ChannelGridTile {...channel} />
        </div>
      ))}
    </div>
  );
}

function ChannelGridTile({board, group: cgroup}: ChannelProps) {
  const group = cgroup || {
    meta: {title: "", cover: "0x0"}
  };
  // const title = `${group.meta.title} • ${board.title}`;
  const defaultImportCover = group.meta.cover === "0x0";

  // NOTE: Styles are used here instead of custom TailwindCSS classes because
  // the latter cannot handle dynamic values, e.g. `bg-[${group.meta.cover}]`
  const bgStyle = () => (
    (!isColor(group.meta.cover) && !defaultImportCover)
      ? {backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${group.meta.cover})`}
      : (isColor(group.meta.cover) && !defaultImportCover)
        ? {backgroundColor: group.meta.cover}
        : {}
  );
  const fgStyle = () => (
    (!isColor(group.meta.cover) && !defaultImportCover)
      ? "text-white dark:text-black"  // style: {textShadow: '0px 1px 3px black'}}
      : (isColor(group.meta.cover) && !defaultImportCover)
        ? "text-gray-50"    // use foregroundFromBackground(group?.meta.cover)
        : "text-gray-800"
  );

  return (
    <Link to={`/channel/${board.group}/${board.board}`}
        className={`default-ring group absolute
        h-full w-full overflow-hidden rounded-3xl
        font-semibold focus-visible:ring-4`}
        style={bgStyle()}
    >
      <div className={`h4 absolute top-[5%] left-[2%] z-10
          rounded-lg sm:bottom-7 sm:left-5
          ${fgStyle()}`}
      >
        {board.title}
      </div>
    </Link>
  );
}
