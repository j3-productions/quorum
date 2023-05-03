import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChannelPrivacyType } from '~/types/groups';
import { ChannelTagMode } from '~/types/quorum';


export interface RadioLabel {
  title: string;
  description: string;
}
export type RadioOption<RadioValue extends string> = Record<RadioValue, RadioLabel>;


export const ChannelPrivacyRadio = (props) => {
  const PRIVACY_OPTIONS: RadioOption<ChannelPrivacyType> = {
    public: {
      title: 'Open to All Members',
      description: 'Everyone can view and write',
    },
    'read-only': {
      title: 'Members Can Read Only',
      description: 'Only admins can write',
    },
    secret: {
      title: 'Admin Only',
      description: 'Only admins can view and write',
    },
  };

  return (
    <RadioSelector options={PRIVACY_OPTIONS} {...props} />
  );
};

export const TagModeRadio = (props) => {
  const TAG_MODE_OPTIONS: RadioOption<ChannelTagMode> = {
    unrestricted: {
      title: 'No Restrictions',
      description: 'Users can use any tags they want on their posts',
    },
    restricted: {
      title: 'Restricted to Admin List',
      description: 'Users are restricted to a set of predefined, admin-maintained tags',
    },
  };

  return (
    <RadioSelector options={TAG_MODE_OPTIONS} {...props} />
  );
};

const RadioSelector = ({options, field, className}) => (
  <ul className={`flex flex-col space-y-2 ${className}`}>
    {Object.entries(options).map(([value, label]) => (
      <li key={value}>
        <RadioRow field={field} value={value} label={label} />
      </li>
    ))}
  </ul>
);

const RadioRow = ({field, value, label}) => {
  const { title, description } = label;
  const { register, watch } = useFormContext(); // FIXME: Need <> type for 'useFormContext'
  const selected = value === watch(field);

  return (
    <label
      className={
        'flex cursor-pointer items-center justify-between space-x-2 py-2'
      }
    >
      <div className="flex items-center">
        {selected ? (
          <div className="h-4 w-4 rounded-xl border-4 border-gray-400" />
        ) : (
          <div className="h-4 w-4 rounded-xl border-2 border-gray-200" />
        )}
      </div>
      <div className="flex w-full flex-col">
        <div className="flex flex-row items-center space-x-2">
          <div className="flex w-full flex-col justify-start text-left">
            <span className="font-semibold">{title}</span>
            <span className="text-sm font-medium text-gray-600">
              {description}
            </span>
          </div>
        </div>
      </div>
      <input
        {...register(field, { required: false })}
        className="sr-only"
        type="radio"
        value={value}
      />
    </label>
  );
};
