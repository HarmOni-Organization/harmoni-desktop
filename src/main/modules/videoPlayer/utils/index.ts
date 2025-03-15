// import * as fs from 'fs';

// export const getValidVLCPath = (paths: string[]): string | null =>
//   paths.find(fs.existsSync) || null;

// export const getRandomPort = (min: number, max: number): number =>
//   Math.floor(Math.random() * (max - min + 1)) + min;

// const VLC_ANSWER_REGEX = /^(?<command>[a-zA-Z_-]+): (?<argument>.*)/;
// export const parseVLCResponse = (line: string) => {
//   const match = line.match(VLC_ANSWER_REGEX);
//   return match
//     ? { command: match.groups!.command, argument: match.groups!.argument }
//     : null;
// };

// export const VLC_PATHS = [
//   'c:\\program files (x86)\\videolan\\vlc\\vlc.exe',
//   'c:\\program files\\videolan\\vlc\\vlc.exe',
//   '/usr/bin/vlc',
//   '/usr/bin/vlc-wrapper',
//   '/Applications/VLC.app/Contents/MacOS/VLC',
//   '/usr/local/bin/vlc',
//   '/usr/local/bin/vlc-wrapper',
//   '/snap/bin/vlc',
// ];

// export const VLC_SLAVE_ARGS = [
//   '--extraintf=luaintf',
//   '--lua-intf=syncplay',
//   '--no-quiet',
//   '--no-input-fast-seek',
//   '--play-and-pause',
//   '--start-time=0',
// ];

// export const VLC_SLAVE_EXTRA_ARGS =
//   process.platform === 'darwin'
//     ? ['--verbose=2', '--no-file-logging']
//     : ['--no-one-instance', '--no-one-instance-when-started-from-file'];
