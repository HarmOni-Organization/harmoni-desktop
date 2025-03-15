import * as fs from 'fs';

export const getValidVLCPath = (paths: string[]): string | null =>
  paths.find(fs.existsSync) || null;

export const getRandomPort = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const VLC_ANSWER_REGEX = /^(?<command>[a-zA-Z_-]+): (?<argument>.*)/;

export const parseVLCResponse = (line: string) => {
  const match = line.match(VLC_ANSWER_REGEX);
  return match
    ? { command: match.groups!.command, argument: match.groups!.argument }
    : null;
};
