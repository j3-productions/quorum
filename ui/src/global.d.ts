type Stringified<T> = string & {
  [P in keyof T]: { '_ value': T[P] };
};

declare module 'urbit-ob' {
  function isValidPatp(ship: string): boolean;
  function clan(ship: string): 'galaxy' | 'star' | 'planet' | 'moon' | 'comet';
}
