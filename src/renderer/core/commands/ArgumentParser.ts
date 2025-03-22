class ArgumentParser {
  /**
   * Parse the input string to extract the command and options.
   * @param input - The raw input string.
   * @returns Parsed command and options.
   */
  static parse(input: string): {
    command: string;
    action: string;
    options: Record<string, string>;
  } {
    const parts = input.split(' ').filter((item) => item.trim() !== '');
    const [command, action] = parts.slice(0, 2); // Support hierarchical commands like "/note add"
    const args = parts.slice(2);

    const options: Record<string, string> = {};
    let currentKey = '';

    args.forEach((arg) => {
      if (arg.startsWith('-')) {
        currentKey = arg.replace(/^-+/, ''); // Remove leading `-`
        options[currentKey] = ''; // Initialize empty value
      } else if (currentKey) {
        options[currentKey] = arg.replace(/^"|"$/g, ''); // Assign value to the key
        currentKey = ''; // Reset key
      }
    });

    return { command, action, options };
  }
}

export default ArgumentParser;
