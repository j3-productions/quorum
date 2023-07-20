import { Location } from 'react-router-dom';

export type ReactRouterState = null | {
  bgLocation?: Location;
  fgPayload?: string;
};

export interface ClassProps {
  className?: string;
}
