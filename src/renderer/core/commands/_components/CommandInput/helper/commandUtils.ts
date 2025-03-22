import type { Command } from '@core/commands/type';

/**
 * Validates the input string for required flag values in commands.
 * @param {string} input - The command input string.
 * @param {Object} commandConfig - Configuration object for commands.
 * @returns {string} Error message if validation fails, otherwise an empty string.
 */
export const validateCommandInput = (
  input,
  commandConfig: Record<string, Command>,
) => {
  const inputParts = input.trim().split(/\s+/);
  const [commandNameRaw, actionName] = inputParts;
  const commandName = commandNameRaw.replace('/', '');

  const commandGroup = commandConfig[commandName];
  const commandDetails = commandGroup?.[actionName];

  if (!commandDetails) return '';

  const missingFlag = commandDetails.flags
    .filter((flag) => flag.requiresValue)
    .find((flag) => {
      const flagIndex = inputParts.indexOf(flag.name);
      return (
        flagIndex !== -1 &&
        (flagIndex === inputParts.length - 1 ||
          inputParts[flagIndex + 1].startsWith('-') ||
          inputParts[flagIndex + 1].trim() === '')
      );
    });

  return missingFlag
    ? `Error: Missing value for required flag ${missingFlag.name}`
    : '';
};

/**
 * Filters keys of an object that start with a given prefix.
 * @param {Object} obj - Object to filter keys from.
 * @param {string} prefix - Prefix to match.
 * @returns {string[]} Array of matching keys.
 */
const filterMatchingKeys = (obj, prefix) => {
  return Object.keys(obj).filter((key) => key.startsWith(prefix));
};

/**
 * Resolves shadow text for a single matching result.
 * @param {string[]} matches - Array of matches.
 * @param {string} input - Current input string.
 * @returns {string} Shadow text for auto-completion.
 */
export const resolveShadowText = (matches, input) => {
  return matches.length === 1 ? matches[0].slice(input.length) : '';
};

/**
 * Generates suggestions for commands, actions, and flags.
 * @param {string} input - The command input string.
 * @param {Object} commandConfig - Configuration object for commands.
 * @returns {Object} Suggestions and shadow text.
 */
export const generateCommandSuggestions = (
  input,
  commandConfig: Record<string, Command>,
) => {
  const inputParts = input.split(/\s+/);
  const commandName = inputParts[0].replace('/', '');
  const lastPart = inputParts[inputParts.length - 1];

  let suggestions: string[] = [];
  let shadowText = '';

  if (inputParts.length === 1) {
    const matchingCommands = filterMatchingKeys(commandConfig, commandName);
    suggestions = matchingCommands;
    shadowText = resolveShadowText(matchingCommands, commandName);
  } else if (inputParts.length === 2) {
    const commandGroup = commandConfig[commandName];
    if (commandGroup) {
      const matchingActions = filterMatchingKeys(commandGroup, inputParts[1]);
      suggestions = matchingActions;
      shadowText = resolveShadowText(matchingActions, inputParts[1]);
    }
  } else if (inputParts.length > 2) {
    const commandGroup = commandConfig[commandName];
    const actionName = inputParts[1];
    const commandDetails = commandGroup?.[actionName];

    if (commandDetails) {
      const usedFlags = new Set(
        inputParts.filter((part) => part.startsWith('-')),
      );
      const availableFlags = commandDetails.flags
        .map((flag) => flag.name)
        .filter((flag) => !usedFlags.has(flag));

      const matchingFlags = filterMatchingKeys(
        Object.fromEntries(availableFlags.map((flag) => [flag, flag])),
        lastPart,
      );

      suggestions = matchingFlags.map((flag) => {
        const flagDetails = commandDetails.flags.find((f) => f.name === flag);
        return `${flag}${flagDetails?.requiresValue ? ' ""' : ''}`;
      });
      shadowText = resolveShadowText(matchingFlags, lastPart);
    }
  }

  return { suggestions, shadowText };
};

/**
 * Calculates the position for displaying suggestions relative to the input element.
 * @param {HTMLInputElement} inputElement - The input HTML element.
 * @param {number} selectionStart - The caret position in the input.
 * @returns {{top: number, left: number}} The position for suggestion placement.
 */
export const calculateSuggestionPosition = (inputElement, selectionStart) => {
  const textBeforeCaret = inputElement.value.slice(0, selectionStart);
  const measurementSpan = document.createElement('span');

  Object.assign(measurementSpan.style, {
    visibility: 'hidden',
    position: 'absolute',
    whiteSpace: 'pre',
  });
  measurementSpan.textContent = textBeforeCaret;

  document.body.appendChild(measurementSpan);

  const { top: inputTop } = inputElement.getBoundingClientRect();
  const { width: spanWidth } = measurementSpan.getBoundingClientRect();

  document.body.removeChild(measurementSpan);

  return {
    top: inputTop + inputElement.offsetHeight + window.scrollY,
    left: spanWidth,
  };
};
