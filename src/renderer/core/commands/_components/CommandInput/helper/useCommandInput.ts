import { useCallback, useEffect, useRef, useState } from 'react';

import CommandManager from '@core/commands/commandManager';

import {
  calculateSuggestionPosition,
  generateCommandSuggestions,
  validateCommandInput,
} from './commandUtils';

const useCommandInput = (commandConfig) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [shadowText, setShadowText] = useState('');
  const [error, setError] = useState('');
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
  });

  const updateSuggestions = useCallback(() => {
    if (inputRef.current) {
      const position = calculateSuggestionPosition(
        inputRef.current,
        inputRef.current.selectionStart || 0,
      );
      setSuggestionPosition(position);
    }
  }, []);

  useEffect(() => {
    updateSuggestions();
  }, [input, suggestions]);

  const handleInputChange = useCallback(
    (e) => {
      const { value } = e.target;
      setInput(value);
      setError('');

      const { suggestions: newSuggestions, shadowText: newShadowText } =
        generateCommandSuggestions(value, commandConfig);
      setSuggestions(newSuggestions);
      setShadowText(newShadowText);

      const validationError = validateCommandInput(value, commandConfig);
      setError(validationError);
      setActiveSuggestionIndex(-1);
    },
    [commandConfig],
  );

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      const lastSpaceIndex = input.lastIndexOf(' ');

      if (lastSpaceIndex === -1) {
        setInput(`/${suggestion}`);
      } else {
        const prefix = input.slice(0, lastSpaceIndex + 1);
        setInput(`${prefix}${suggestion}`);
      }

      setShadowText('');
      setSuggestions([]);
      setActiveSuggestionIndex(-1);

      inputRef.current?.focus?.();
    },
    [input],
  );

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Tab':
          if (shadowText) {
            e.preventDefault();
            setInput((prev) => prev + shadowText);
            setShadowText('');
            setSuggestions([]);
            setActiveSuggestionIndex(-1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveSuggestionIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveSuggestionIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeSuggestionIndex >= 0) {
            handleSuggestionClick(suggestions[activeSuggestionIndex]);
          } else if (input.trim()) {
            CommandManager.executeCommand(input.trim());
            setInput('');
            setSuggestions([]);
            setShadowText('');
          }
          break;
        default:
          break;
      }
    },
    [shadowText, suggestions, activeSuggestionIndex, input],
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setSuggestions([]);
      setShadowText('');
    }, 200);
  }, []);

  return {
    inputRef,
    input,
    suggestions,
    shadowText,
    error,
    suggestionPosition,
    activeSuggestionIndex,
    handleInputChange,
    handleKeyDown,
    handleSuggestionClick,
    handleBlur,
  };
};

export default useCommandInput;
