import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import api from '~/api';
import { useGroups } from '~/state/groups';
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
  const [channels, setChannels] = useState<ChannelProps[]>([]);
  const groups = useGroups();

  useEffect(() => {
    // TODO: Add fallback behavior for when the board's associated group
    // is bad or out of sync.
    api.scry<BoardMeta[]>({
      app: "forums",
      path: `/boards`
    }).then((scryBoards: BoardMeta[]) => {
      const scryChannels = scryBoards.map(scryBoard => ({
        board: scryBoard,
        group: groups[scryBoard.group],
      }));
      setChannels(scryChannels);
    });

    // FIXME: Remove this old reference logic once the method for determining
    // channel membership is finalized (are per-channel '/briefs' still required
    // in the final version?).
    //
    // Promise.all([
    //   api.scry({app: "groups", path: `/groups`}),
    //   api.scry({app: "chat", path: `/briefs`}),
    // ]).then(([scryGroups, scryBriefs]: [Groups, ChatBriefs]) => {
    //   const scryChannels = Object.entries(scryGroups).reduce(
    //     (list, [flag, group]) => list.concat(Object.entries(group.channels).map(
    //       ([nest, chan]) => [flag, group, nest, chan]
    //     )), []
    //   );
    //   const realBriefs = Object.fromEntries(Object.entries(scryBriefs).map(
    //     ([key, value]) => [`chat/${key}`, value]
    //   ));
    //   const joinChannels: [string, Group, string, GroupChannel] = scryChannels.filter(
    //     ([flag, group, nest, chan]) =>
    //       isChannelJoined(nest, realBriefs)
    //       && canReadChannel(chan, group.fleet?.[window.our], group.bloc)
    //       && nestToFlag(nest)[0] === "chat"  // TODO: change to quorum
    //   );
    //     setChannels(joinChannels);
    //   });
    // }, []);
  }, [groups]);

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
