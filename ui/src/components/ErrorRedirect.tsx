import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { AnchorLink } from '@/components/Links';
import UrbitIcon from '@/components/icons/UrbitIcon';


export default function ErrorRedirect({
  header,
  content,
  to,
  anchor=false,
} : {
  header: string;
  content: string;
  to?: string;
  anchor?: boolean;
}) {
  const linkTo = to !== undefined ? to : (anchor ? "." : "/");

  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      {anchor ? (
        <AnchorLink to={to || "."}>
          <UrbitIcon className="animate-spin w-24 h-24 fill-stone-900" />
        </AnchorLink>
      ) : (
        <Link to={to || "/"}>
          <UrbitIcon className="animate-spin w-24 h-24 fill-stone-900" />
        </Link>
      )}
      <h1 className="break-words text-3xl font-semibold">
        {header}
      </h1>
      <p className="font-normal">
        {content}
      </p>
    </div>
  );
}
