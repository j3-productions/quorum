import { cite } from '@urbit/api';
import React, { HTMLAttributes } from 'react';

type ShipNameProps = {
  name: string;
  full?: boolean;
  showAlias?: boolean;
} & HTMLAttributes<HTMLSpanElement>;


export default function ShipName({
  name,
  full = false,
  showAlias = false,
  ...props
}: ShipNameProps) {
  const separator = /([_^-])/;
  const citedName = full ? name : cite(name);

  if (!citedName) {
    return null;
  }

  const parts: string[] = citedName.replace('~', '').split(separator);
  const first: string | undefined = parts.shift();

  return (
    <span {...props}>
      <span aria-hidden>~</span>
      <span>{first}</span>
      {parts.length > 1 && (
        <>
          {parts.map((piece: string, index: number) => (
            <span
              key={`${piece}-${index}`}
              aria-hidden={separator.test(piece)}
            >
              {piece}
            </span>
          ))}
        </>
      )}
    </span>
  );
}
