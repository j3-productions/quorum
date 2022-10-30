import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { sigil, reactRenderer } from '@tlon/sigil-js'
// @ts-ignore
import * as ob from 'urbit-ob';
import { patpFormat } from '../utils';

export const Spinner = ({className}: {className?: string;}) => (
  <div className='flex justify-center'>
    <svg className={cn('animate-spin', className)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <circle className="fill-bgp1 stroke-fgp1" cx="16" cy="16" r="13" strokeWidth="2"/>
      <path className="fill-fgp1" d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" />
    </svg>
  </div>
);

export const Failer = ({className}: {className?: string;}) => (
  <div className='flex justify-center'>
    <svg className={className} viewBox="0 -8 528 528" xmlns="http://www.w3.org/2000/svg" >
      <path className="fill-fgs1" d="M264 456Q210 456 164 429 118 402 91 356 64 310 64 256 64 202 91 156 118 110 164 83 210 56 264 56 318 56 364 83 410 110 437 156 464 202 464 256 464 310 437 356 410 402 364 429 318 456 264 456ZM264 288L328 352 360 320 296 256 360 192 328 160 264 224 200 160 168 192 232 256 168 320 200 352 264 288Z" />
    </svg>
  </div>
);

export const Pointer = ({className}: {className?: string;}) => (
  <div className='flex justify-center'>
    <svg className={className} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path className="fill-fgp1" fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </div>
);

export const Nameplate = ({ship, className}: {ship: string; className?: string;}) => {
  const [plate, setPlate] = useState<{name?: string; icon?: string;}>({});
  const plateClass: string = "object-cover rounded flex-none";

  const ShipSigil = ({ship, className}: {ship: string; className?: string;}) => {
    switch (ob.clan(ship)) {
      case 'comet':
        return (
          <div className={cn("w-full h-full bg-fgp1", className)} />
        );
      case 'moon':
        return sigil({
          patp: ob.sein(ship),
          renderer: reactRenderer,
          width: 24,
          height: 24,
          colors: ['#586E75', '#EEE8D5'],
          class: className,
          attributes: {style: undefined},
        });
      default:
        return sigil({
          patp: ship,
          renderer: reactRenderer,
          width: 24,
          height: 24,
          colors: ['#586E75', '#FDF6E3'],
          class: className,
          attributes: {style: undefined},
        });
    };
  };

  // TODO: Uncomment to enable dynamic loading of contact information.
  //
  // useEffect(() => {
  //   api.scry<any>({app: 'contact-store', path: `/contact/${ship}`}).then(
  //     (result: any) => {
  //       const contact: {[index: string]: string} =
  //         result['contact-update']['add']['contact'];
  //       setPlate({
  //         name: strVoid(contact.nickname),
  //         icon: strVoid(contact.avatar),
  //       });
  //     }, (error: any) => {
  //       // TODO: If the contact entry doesn't exist for this user, just
  //       // ignore it.
  //       // console.log(error);
  //     },
  //   );
  // }, [/*boards*/]);

  // NOTE: For a more clear title indicator: hover:bg-bgs1/20
  return (
    <div title={ship} className="flex gap-2 items-center cursor-default">
      <div className="w-6 h-6">
        {plate.icon ?
          (<img src={plate.icon} className={plateClass} />) :
          <ShipSigil ship={ship} className={plateClass} />
        }
      </div>
      <div className="text-fgp1">
        {plate.name || patpFormat(ship)}
      </div>
    </div>
  );
};
