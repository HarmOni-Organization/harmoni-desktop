import './style.css';

import clsx from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';

import preferencesStore from '../../../../core/stores/PreferencesStore';
import useAppTheme from '../../../../hooks/useAppTheme';
import { useThemeSlider } from '../../../../hooks/useThemeSlider';
import { appThemeRemoveAll } from '../../../../utils/helper';
import { appAsideClasses } from '../../appAsideClasses';
import { GlobalThemeStyles } from './styles';
import ThemeIcon from './ThemeIcon';

const THEME_COUNT = 17; // Total number of theme options in the slider

/**
 * ThemeSlider component for selecting and applying themes using a slider.
 *
 * This component displays a slider with dots representing different themes.
 * It utilizes the `useThemeSlider` hook to manage slider visibility and interaction.
 * The slider allows users to select and apply themes by adjusting the range input.
 *
 * @component
 * @returns {JSX.Element} The rendered theme slider component.
 */
function ThemeSlider(): JSX.Element {
  useAppTheme();

  const { themeSliderRef, isSliderVisible, isTouchDevice } = useThemeSlider();

  /**
   * Handles slider value change and applies the selected theme.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the slider input.
   */
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = +event.target.value; // Convert input value to number
    const formattedValue =
      sliderValue < 10 ? `0${sliderValue}` : `${sliderValue}`;

    preferencesStore.setTheme(sliderValue);

    appThemeRemoveAll();

    document.body.classList.add(`theme--${formattedValue}`);
  };

  return (
    <div
      ref={themeSliderRef}
      className={clsx(appAsideClasses.option, appAsideClasses.themeRoot, {
        'theme-slider--is--visible': isSliderVisible,
        touchevents: isTouchDevice,
        'no-touchevents': !isTouchDevice,
      })}
    >
      <div className={appAsideClasses.themeIcon}>
        <ThemeIcon
          className={clsx(appAsideClasses.icon, appAsideClasses.themeRoot)}
        />
      </div>

      <div className={appAsideClasses.themeSliderContainer}>
        <div className={appAsideClasses.themeSliderDots}>
          {Array.from({ length: THEME_COUNT }, (_, index) => (
            <div key={index} className="dot" />
          ))}
        </div>

        <input
          className={appAsideClasses.themeSliderInput}
          type="range"
          min="0"
          max={THEME_COUNT - 1}
          step="1"
          value={preferencesStore.theme}
          onChange={handleSliderChange}
          aria-label="Select Theme"
        />
      </div>

      <GlobalThemeStyles maxLevel={THEME_COUNT - 1} />
    </div>
  );
}

export default observer(ThemeSlider);
