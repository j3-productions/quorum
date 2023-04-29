import React from 'react';


// TODO: Implement these (the Typescript typing is confusing and may
// require some annoying additional templating).

export function selectGetValue<SelectType, OptionType>(
  value: SelectType | undefined,
  options: OptionType[],
): OptionType | undefined {
  return value ? options.find(o => o.value === value) : undefined;
}

export function selectOnChange<OptionType>(
  onChange, // : (o: OptionType | undefined) => ,
): (a: b) => c {
  return (o) => onChange(o ? o.value : o);
}
