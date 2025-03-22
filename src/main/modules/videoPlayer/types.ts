export type UserAction = {
  event: string;
  [key: string]: unknown; // Allow additional properties
};

export interface VideoEffects {
  contrast: number;
  gamma: number;
  hue: number;
  brightness: number;
  saturation: number;
}
export interface IPlayerState {
  isPlaying: boolean;
  currentTime: number;
  loop: boolean;
  repeat: boolean;
  title: string;
  chapter: string;
  filename: string;
  duration: number;
  filepath: string;
}

export interface PlayerStateComparison {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  fullscreen: boolean;
  rate: number;
  audiodelay: number;
  subtitledelay: number;
  aspectratio: string | null;
  repeat: boolean;
  loop: boolean;
  videoeffects: VideoEffects;
  audiofilters: Record<string, unknown>;
  random: boolean;
  apiversion: number;
  currentplid: number;
  title: string;
  chapter: string;
  filename: string;
}

export interface PlayerState {
  state?: string;
  time?: number;
  volume?: number;
  fullscreen?: boolean;
  rate?: number;
  audiodelay?: number;
  subtitledelay?: number;
  aspectratio?: string | null;
  repeat?: boolean;
  loop?: boolean;
  videoeffects?: {
    contrast?: number;
    gamma?: number;
    hue?: number;
    brightness?: number;
    saturation?: number;
  };
  audiofilters?: Record<string, unknown>;
  random?: boolean;
  apiversion?: number;
  currentplid?: number;
  information?: {
    title?: string;
    chapter?: string;
    category?: {
      meta?: {
        filename?: string;
      };
    };
  };
}
