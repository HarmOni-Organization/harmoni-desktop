import { spawn } from 'child_process';

import { getValidVLCPath } from '../utils';
import {
  VLC_EXECUTABLE_PATHS,
  VLC_HARMONI_ARGS,
  VLC_PLATFORM_ARGS,
} from '../VLCConfig';

/**
 * Launches a VLC instance configured for syncplay.
 *
 * @param {number} port - The port for VLC syncplay.
 * @param {string} [mediaFilePath] - Optional path to the media file.
 * @returns {import('child_process').ChildProcess} VLC process instance.
 * @throws {Error} If no valid VLC executable is found.
 */
export const launchVLC = (port: number, mediaFilePath?: string) => {
  const vlcArguments = [
    `--lua-config=syncplay={port=${port}}`,
    ...VLC_HARMONI_ARGS,
    ...VLC_PLATFORM_ARGS,
  ];

  if (mediaFilePath) vlcArguments.push(mediaFilePath);

  const vlcExecutablePath = getValidVLCPath(VLC_EXECUTABLE_PATHS);
  if (!vlcExecutablePath) throw new Error('No valid VLC executable found.');

  return spawn(vlcExecutablePath, vlcArguments, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
};
