export type ChannelTagMode = 'unrestricted' | 'restricted';

export interface ChannelSettingsSchema {
  tags: {
    mode: ChannelTagMode;
    edits?: {
      add: string[];
      rem: string[];
    };
  };
};
