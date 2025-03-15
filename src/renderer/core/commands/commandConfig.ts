import watchTogetherCommands from '@modules/watchTogether/index.commands';

import type { Command } from './type';

// Combine commands from all modules
const commandConfig: Record<string, Command> = {
  ...watchTogetherCommands,
};

export default commandConfig;
