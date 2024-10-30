import { useEffect } from 'react';

import useAppGridOverlay from './useAppGridOverlay';
import useAppThemeSpectrum from './useAppThemeSpectrum';

/**
 * useKeydownEvents hook listens for specific keydown events and triggers corresponding actions:
 * - 'g' or ';' keys toggle the grid overlay.
 * - 'w' or 'b' keys toggle the theme.
 * - 'd' key cycles through themes in forward order.
 * - 'a' key cycles through themes in reverse order.
 */
const useKeydownEvents = () => {
  const { cycleThemes, toggleTheme } = useAppThemeSpectrum();
  const toggleGridOverlay = useAppGridOverlay();

  useEffect(() => {
    /**
     * Handles keydown events and triggers the appropriate actions based on the pressed key.
     *
     * @param {KeyboardEvent} event - The keydown event object.
     */
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'g':
          case ';':
            toggleGridOverlay();
            break;

          case 'w':
          case 'b':
            toggleTheme();
            break;

          case 'd':
            cycleThemes(true); // Cycle forward
            break;

          case 'a':
            cycleThemes(); // Cycle backward
            break;

          default:
            break;
        }
      }
    };

    // Attach the keydown event listener
    document.addEventListener('keydown', handleKeydown);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [toggleTheme, cycleThemes, toggleGridOverlay]);
};

export default useKeydownEvents;
