/**
 * VLC configuration constants.
 */
import fs from 'fs';
import path from 'path';

// VLC port range for Syncplay integration.
export const VLC_PORT_RANGE = {
  MIN: 10000,
  MAX: 55000,
};

// Common VLC executable paths for different operating systems.
export const VLC_EXECUTABLE_PATHS = [
  'c:\\program files (x86)\\videolan\\vlc\\vlc.exe',
  'c:\\program files\\videolan\\vlc\\vlc.exe',
  '/usr/bin/vlc',
  '/usr/bin/vlc-wrapper',
  '/Applications/VLC.app/Contents/MacOS/VLC',
  '/usr/local/bin/vlc',
  '/usr/local/bin/vlc-wrapper',
  '/snap/bin/vlc',
];

// Function to get the VLC Lua interface directory
const getVlcLuaIntfPath = (): string => {
  const homeDir = process.env.HOME || process.env.USERPROFILE; // Cross-platform

  if (process.platform === 'win32') {
    return path.join(homeDir!, 'AppData', 'Roaming', 'vlc', 'lua', 'intf');
  }
  if (process.platform === 'darwin') {
    return path.join(
      homeDir!,
      'Library',
      'Application Support',
      'org.videolan.vlc',
      'lua',
      'intf',
    );
  }
  return path.join(homeDir!, '.local', 'share', 'vlc', 'lua', 'intf');
};

// Resolve the Lua script path
const VLC_LUA_INTF_DIR = getVlcLuaIntfPath();
const VLC_LUA_DEST_PATH = path.join(VLC_LUA_INTF_DIR, 'syncplay.lua');

// Check if the script exists before setting the argument
const luaIntfArg = fs.existsSync(VLC_LUA_DEST_PATH)
  ? '--lua-intf=syncplay'
  : '';

export const VLC_HARMONI_ARGS = [
  '--extraintf=luaintf',
  luaIntfArg, // Only set if the script exists
  '--no-quiet',
  '--no-input-fast-seek',
  '--play-and-pause',
  '--start-time=0',
].filter(Boolean); // Remove empty arguments if script is missing
// Additional platform-specific arguments for VLC.
export const VLC_PLATFORM_ARGS =
  process.platform === 'darwin'
    ? ['--verbose=2', '--no-file-logging']
    : ['--no-one-instance', '--no-one-instance-when-started-from-file'];

// Path to the Syncplay Lua script. __dir + './lua/syncplay.lua'
export const VLC_LUA_SCRIPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'syncplay.lua',
);
