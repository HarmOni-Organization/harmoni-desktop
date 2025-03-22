import { useLayoutEffect } from 'react';

import preferencesStore from '@core/stores/PreferencesStore';
import { appThemeRemoveAll } from '@utils/helper';

/**
 * Custom hook to toggle between two themes: 'theme--00' and 'theme--16'.
 * It also ensures the corresponding slider value is updated and adds
 * a visual indicator to the body while the theme is changing.
 */
const useAppTheme = () => {
  useLayoutEffect(() => {
    const { theme } = preferencesStore;
    const { body } = document;

    // Add a temporary class or attribute to indicate theme is changing
    body.classList.add('theme-changing');

    appThemeRemoveAll();

    // Add the new theme class
    body.classList.add(`theme--${theme.toString().padStart(2, '0')}`);

    // Update the theme slider value to reflect the new theme
    const sliderElement =
      document.querySelector<HTMLInputElement>('.app-aside .slider');
    if (sliderElement) {
      sliderElement.value = theme.toString();
    }

    // Remove the theme-changing indicator after a short delay
    const timeout = setTimeout(() => {
      body.classList.remove('theme-changing');
    }, 300);

    return () => clearTimeout(timeout);
  }, [preferencesStore.theme]);

  return null;
};

export default useAppTheme;
