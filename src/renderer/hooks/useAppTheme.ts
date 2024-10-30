import { useLayoutEffect } from 'react';

import store from '../core/stores/RootStore';
import { appThemeRemoveAll } from '../utils/helper';

/**
 * Custom hook to toggle between two themes: 'theme--00' and 'theme--16'.
 * It also ensures the corresponding slider value is updated.
 *
 * @returns {() => void} A function that toggles between the two themes.
 */
const useAppTheme = () => {
  const { theme } = store.preferencesStore;

  useLayoutEffect(() => {
    const { body } = document;

    // Remove all current theme classes and apply the new theme
    appThemeRemoveAll();

    body.classList.add(`theme--${theme.toString().padStart(2, '0')}`);

    // Update the theme slider value to reflect the new theme
    const sliderElement =
      document.querySelector<HTMLInputElement>('.app-aside .slider');
    if (sliderElement) {
      sliderElement.value = theme.toString();
    }
  }, [theme]);

  return null;
};

export default useAppTheme;
