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
  // Windows Store installation
  'c:\\Program Files\\WindowsApps\\VideoLAN.VLC_*\\VLC\\vlc.exe',
  // Additional macOS locations
  '/opt/homebrew/bin/vlc',
  '/opt/local/bin/vlc',
  // Additional Linux locations
  '/opt/vlc/bin/vlc',
  '/var/lib/flatpak/app/org.videolan.VLC/current/active/files/bin/vlc',
  '~/.local/bin/vlc',
  '/usr/lib/vlc/vlc',
  '/opt/homebrew/Caskroom/vlc/*/VLC.app/Contents/MacOS/VLC',
  // More Windows locations
  'c:\\Users\\*\\AppData\\Local\\Programs\\VideoLAN\\VLC\\vlc.exe',
  'c:\\Users\\*\\Desktop\\VLC\\vlc.exe',
  // More Linux locations
  '/snap/vlc/current/usr/bin/vlc',
  '/var/lib/snapd/snap/bin/vlc',
  '/run/user/*/doc/*/VLC*.AppImage',
  '/usr/share/vlc/vlc',
  '/data/data/org.videolan.vlc/files/vlc',
  // More macOS locations
  '~/Applications/VLC.app/Contents/MacOS/VLC',
  '/Volumes/*/VLC.app/Contents/MacOS/VLC',
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
