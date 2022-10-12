import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import api from '../../api';
import { format } from 'date-fns';
import { sigil, reactRenderer } from '@tlon/sigil-js'

interface FooterProps {
  who: string;
  host: string;
  date: number;
  tags?: string[];
  path?: string;
  className?: string;
}

export const Footer = ({who, host, date, tags, path, className}: FooterProps) => {
  const [whoData, setWhoData] = useState<{name?: string; icon?: string;}>({});

  const dataOrUndef = (data: string | undefined): string | undefined =>
    (data && data !== "") ? data : undefined;
  const patpFormat = (who: string): string => {
    const patpSplit = who.slice(1).split("-");
    const patpComps = patpSplit.length;
    switch (patpComps) {
      // galaxies, stars, planets
      case 0:
      case 1:
      case 2:
        return who;
      // moons
      case 3:
      case 4:
        return `~${patpSplit[patpComps - 2]}^${patpSplit[patpComps - 1]}`;
      // comets
      default:
        return `~${patpSplit[0]}_${patpSplit[patpComps - 1]}`;
    };
  };
  // FIXME: Ideally, both "in-board" and "out-of-board" paths will
  // include a date eventually with the value for the latter being the
  // time of the latest post on the board.
  const isInBoard: boolean = (!path || path.includes("/thread/"));
  const patpWho: string = isInBoard ? who : host

  // TODO: Uncomment to enable dynamic loading of contact information.
  //
  // useEffect(() => {
  //   api.scry<any>({app: 'contact-store', path: `/contact/${patpWho}`}).then(
  //     (result: any) => {
  //       const contact: {[index: string]: string} =
  //         result['contact-update']['add']['contact'];
  //       setWhoData({
  //         name: dataOrUndef(contact.nickname),
  //         icon: dataOrUndef(contact.avatar),
  //       });
  //     }, (error: any) => {
  //       // TODO: If the contact entry doesn't exist for this user, just
  //       // ignore it.
  //       // console.log(error);
  //     },
  //   );
  // }, [/*boards*/]);

  return (
    <div className={cn("flex flex-wrap mt-2 gap-2 items-center justify-between", className)}>
      <ol className="flex flex-wrap gap-2 text-sm text-fgs2">
        {tags?.map(tag => (
          <code key={tag} className="rounded bg-fgs2/40 p-1">{tag}</code>
        ))}
      </ol>
      <div className="flex gap-2 items-center">
        <div className="w-6 h-6">
          {whoData.icon ?
            (<img src={whoData.icon} className="object-cover rounded flex-none"/>) :
            sigil({
              patp: who,
              renderer: reactRenderer,
              width: 24,
              height: 24,
              colors: ['#586E75', '#FDF6E3'],
              class: "object-cover rounded flex-none",
              attributes: {style: undefined},
            })
          }
        </div>
        <div title={patpWho} className="text-fgp1">
          {isInBoard ?
            `${whoData.name || patpFormat(patpWho)} @ ${format(new Date(date), 'HH:mm yyyy/MM/dd')}` :
            `Host: ${whoData.name || patpFormat(patpWho)}`
          }
        </div>
      </div>
    </div>
  );
}
