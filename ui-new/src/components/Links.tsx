import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useAnchorLink } from '@/logic/routing';


export function ToggleLink({
  children,
  disabled = false,
  ...props
}: LinkProps & {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return disabled ? (
    <a aria-disabled="true" {...props}>
      {children}
    </a>
  ) : (
    <Link {...props}>
      {children}
    </Link>
  );
}

export function AnchorLink({
  children,
  ...props
}: LinkProps & {
  children: React.ReactNode;
}) {
  const { to, ...oprops } = props;
  const anchorLink = useAnchorLink();

  return (
    <Link {...oprops} to={`${anchorLink}/${to}`} relative="path">
      {children}
    </Link>
  );
}
