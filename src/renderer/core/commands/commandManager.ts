import ArgumentParser from './ArgumentParser';
import commandConfig from './commandConfig';

class CommandManager {
  /**
   * Execute a command based on user input.
   * @param input - The raw input string containing the command and arguments.
   */
  static executeCommand(input: string) {
    // Remove the first character if it's a slash (/)
    const sanitizedInput = input.startsWith('/') ? input.slice(1) : input;

    // Parse the sanitized input
    const { command, options, action } = ArgumentParser.parse(sanitizedInput);

    const commandDefinition = commandConfig[command]?.[action];
    if (commandDefinition) {
      commandDefinition.execute(options);
      console.log(`Executed: ${command}`);
    } else {
      console.error(`Command not found: ${command}`);
      this.generateHelp();
    }
  }

  /**
   * Generate and display a help message with all available commands.
   */
  static generateHelp() {
    console.log('Available Commands:');

    // const groupedCommands = Object.values(commandConfig).reduce(
    //   (acc, cmd) => {
    //     if (!acc[cmd.category]) acc[cmd.category] = [];
    //     acc[cmd.category].push(cmd);
    //     return acc;
    //   },
    //   {} as Record<string, Command[]>,
    // );

    // Object.entries(groupedCommands).forEach(([category, commands]) => {
    //   console.log(`\n  ${category}:`);
    //   commands.forEach((cmd) => {
    //     console.log(`    ${cmd.usage.padEnd(30)} - ${cmd.description}`);
    //   });
    // });
  }
}

export default CommandManager;
