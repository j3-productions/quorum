import React from 'react';
import cn from 'classnames';
import {
  makePrettyDayAndDateAndTime,
  makePrettyDayAndTime,
  makePrettyTime,
  useCopy,
} from '~/logic/utils';
import { useLocation } from 'react-router';
import { useModalNavigate } from '~/logic/routing';
import Avatar from '~/components/Avatar';
import ShipName from '~/components/ShipName';

interface AuthorsProps {
  ships: string[];
  date?: Date;
  timeOnly?: boolean;
  hideTime?: boolean;
  isReply?: boolean;
  isRef?: boolean;
  className?: string;
}
export default function Authors({
  ships,
  date,
  timeOnly,
  hideTime,
  className,
  isReply = false,
  isRef = false,
}: AuthorsProps) {
  const location = useLocation();
  const { didCopy, doCopy } = useCopy(ships[0]);
  const modalNavigate = useModalNavigate();
  const prettyTime = date ? makePrettyTime(date) : undefined;
  const prettyDayAndTime = date ? makePrettyDayAndTime(date) : undefined;
  const prettyDayAndDateAndTime = date
    ? makePrettyDayAndDateAndTime(date)
    : undefined;

  const handleProfileClick = () => {
    // TODO: Add some form of navigation here.
    console.log("TODO");
    // modalNavigate(`/profile/${ship}`, {
    //   state: { backgroundLocation: location },
    // });
  };

  if (!date) {
    return (
      <div
        className={cn(
          'align-center group flex items-center py-1',
          isReply || isRef ? 'space-x-2' : 'space-x-3',
          className
        )}
      >
        <div onClick={handleProfileClick} className="shrink-0">
          <div className="group -ml-2 whitespace-nowrap rounded p-2 text-sm font-semibold text-gray-800">
            <div className="flex items-center">
              <div className="mr-2 flex flex-row-reverse">
                {ships.map((ship, i) => (
                  <div
                    key={ship}
                    className={cn(
                      'reply-avatar relative h-6 w-6 rounded group-one-focus-within:outline-gray-50 group-one-hover:outline-gray-50',
                      i !== 0 && '-mr-3'
                    )}
                  >
                    <Avatar ship={ship} size="xs" className="cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={doCopy}
          className="text-md shrink cursor-pointer font-semibold"
        >
          {didCopy ? (
            'Copied!'
          ) : (
            <ShipName
              name={ships[0]}
              showAlias
              className="text-md font-semibold leading-6 line-clamp-1"
            />
          )}
        </div>
      </div>
    );
  }

  // FIXME: Use stack for date
  return (
    <div
      className={cn(
        'group-two align-center flex items-center py-1',
        isReply || isRef ? 'space-x-2' : 'space-x-3',
        className
      )}
    >
      <div onClick={handleProfileClick} className="shrink-0">
        <Avatar
          ship={ships[0]}
          size={isReply || isRef ? 'xxs' : 'xs'}
          className="cursor-pointer"
        />
      </div>
      <div
        onClick={doCopy}
        className="text-md shrink cursor-pointer font-semibold"
      >
        {didCopy ? (
          'Copied!'
        ) : (
          <ShipName
            name={ships[0]}
            showAlias
            className="text-md break-all font-semibold leading-6 line-clamp-1"
          />
        )}
      </div>

      {hideTime ? (
        <span className="-mb-0.5 hidden shrink-0 text-sm font-semibold text-gray-500 group-two-hover:block">
          {prettyDayAndTime}
        </span>
      ) : (
        <>
          <span className="-mb-0.5 hidden shrink-0 text-sm font-semibold text-gray-500 group-two-hover:block">
            {prettyDayAndDateAndTime}
          </span>
          <span className="-mb-0.5 block shrink-0 text-sm font-semibold text-gray-500 group-two-hover:hidden">
            {timeOnly ? prettyTime : prettyDayAndTime}
          </span>
        </>
      )}
    </div>
  );
}
