import { spawn } from 'child_process';
import * as fs from 'fs';
import path from 'path';
import { AppLogger } from 'shared/logger';

import { getValidVLCPath } from '../utils';
import { VLC_EXECUTABLE_PATHS, VLC_PLATFORM_ARGS } from '../VLCConfig';

/**
 * Launches a VLC instance configured for syncplay.
 *
 * @param {number} port - The port for VLC syncplay.
 * @param {string} [mediaFilePath] - Optional path to the media file.
 * @returns {import('child_process').ChildProcess} VLC process instance.
 * @throws {Error} If no valid VLC executable is found.
 */
export const launchVLC = (port: number, mediaFilePath?: string) => {
  // Get the Lua script path
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  let luaIntfDir;

  if (process.platform === 'win32') {
    luaIntfDir = path.join(
      homeDir!,
      'AppData',
      'Roaming',
      'vlc',
      'lua',
      'intf',
    );
  } else if (process.platform === 'darwin') {
    luaIntfDir = path.join(
      homeDir!,
      'Library',
      'Application Support',
      'org.videolan.vlc',
      'lua',
      'intf',
    );
  } else {
    luaIntfDir = path.join(homeDir!, '.local', 'share', 'vlc', 'lua', 'intf');
  }

  const luaDestPath = path.join(luaIntfDir, 'syncplay.lua');

  // Check if the Lua script exists at runtime
  const scriptExists = fs.existsSync(luaDestPath);
  const luaIntfArg = scriptExists ? '--lua-intf=syncplay' : '';

  AppLogger.info(
    `VLC Lua script status: ${scriptExists ? 'Found' : 'Not found'} at ${luaDestPath}`,
    {
      context: 'VLCProcessHandler',
    },
  );

  // Build arguments with dynamic check for Lua script
  const harmoniArgs = [
    '--extraintf=luaintf',
    luaIntfArg, // Only set if script exists now
    '--no-quiet',
    '--no-input-fast-seek',
    '--play-and-pause',
    '--start-time=0',
  ].filter(Boolean); // Remove empty args

  const vlcArguments = [
    `--lua-config=syncplay={port=${port}}`,
    ...harmoniArgs,
    ...VLC_PLATFORM_ARGS,
  ];

  AppLogger.info(`Launching VLC with arguments: ${vlcArguments.join(' ')}`, {
    context: 'VLCProcessHandler',
  });

  if (mediaFilePath) vlcArguments.push(mediaFilePath);

  const vlcExecutablePath = getValidVLCPath(VLC_EXECUTABLE_PATHS);
  if (!vlcExecutablePath) throw new Error('No valid VLC executable found.');

  return spawn(vlcExecutablePath, vlcArguments, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
};
