import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '~/api';
import {
  isGroupAdmin,
  isChannelJoined,
  canReadChannel,
  getChannelIdFromTitle,
  nestToFlag,
  isColor,
} from '~/logic/utils';
import { Groups, Group, GroupChannel } from '~/types/groups';
import { ChatBriefs, ChatBrief } from '~/types/chat';


export default function ChannelGrid({className}) {
  const [channels, setChannels] = useState<[string, Group, string, GroupChannel][]>([]);

  useEffect(() => {
    Promise.all([
      api.scry({app: "groups", path: `/groups`}),
      api.scry({app: "chat", path: `/briefs`}),    // TODO: change to quorum
    ]).then(([scryGroups, scryBriefs]: [Groups, ChatBriefs]) => {
      const scryChannels = Object.entries(scryGroups).reduce(
        (list, [flag, group]) => list.concat(Object.entries(group.channels).map(
          ([nest, chan]) => [flag, group, nest, chan]
        )), []
      );
      const realBriefs = Object.fromEntries(Object.entries(scryBriefs).map(
        ([key, value]) => [`chat/${key}`, value]
      ));
      const joinChannels: [string, Group, string, GroupChannel] = scryChannels.filter(
        ([flag, group, nest, chan]) =>
          isChannelJoined(nest, realBriefs)
          && canReadChannel(chan, group.fleet?.[window.our], group.bloc)
          && nestToFlag(nest)[0] === "chat"  // TODO: change to quorum
      );
      setChannels(joinChannels);
    });
  }, []);

  return (
    <div className={`grid w-full h-fit grid-cols-2 gap-4 px-4
        justify-center sm:grid-cols-[repeat(auto-fit,minmax(auto,250px))]
        ${className}`}
    >
      {channels.map(([flag, group, nest, chan]) => (
        <div key={`${flag}/${nest}`}
            className={`relative aspect-w-1 aspect-h-1 rounded-3xl ring-gray-800 ring-4`}>
          <ChannelGridTile flag={flag} group={group} nest={nest} chan={chan} />
        </div>
      ))}
    </div>
  );
}

function ChannelGridTile({flag, group, nest, chan}) {
  const title = `${group.meta.title} • ${chan.meta.title}`;
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
    <Link to={`/channel/${flag}/${nestToFlag(nest)[1]}`}
        className={`default-ring group absolute
        h-full w-full overflow-hidden rounded-3xl
        font-semibold focus-visible:ring-4`}
        style={bgStyle()}
    >
      <div className={`h4 absolute top-[5%] left-[2%] z-10
          rounded-lg sm:bottom-7 sm:left-5
          ${fgStyle()}`}
      >
        {chan.meta.title}
      </div>
    </Link>
  );
}
