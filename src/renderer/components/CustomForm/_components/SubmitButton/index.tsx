import './style.css';

import React from 'react';
import classNames from 'classnames';

import { useFormContext } from '../FormProvider';

/**
 * SubmitButton Component
 *
 * This button component is responsible for handling form submission.
 * It integrates with the context provided by the parent form (via useFormContext),
 * enabling features like validation checks and custom submission handling.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.onFormSubmit - A callback function to handle form submission.
 * @param {boolean} props.isLoading - Flag to indicate if the form submission is in progress.
 * @param {React.ReactNode} props.children - The content to display inside the button.
 * @param {string} props.className - Additional CSS classes for styling.
 * @param {boolean} props.disabled - Flag to indicate if the button should be disabled.
 * @param {Object} restProps - Any other button attributes.
 */
interface SubmitButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSubmit'> {
  onFormSubmit?: (formData: Record<string, string>) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function SubmitButton({
  onFormSubmit,
  children = 'Submit',
  className,
  isLoading = false,
  disabled,
  ...buttonAttributes
}: SubmitButtonProps) {
  const { submitForm, isFormUnchanged, isFormValid } = useFormContext();

  return (
    <button
      {...buttonAttributes}
      type="submit"
      onClick={(event) => {
        if (onFormSubmit && typeof onFormSubmit === 'function') {
          event.preventDefault();
          submitForm(onFormSubmit)(event);
        }
      }}
      className={classNames('submit-button', className)}
      disabled={isFormUnchanged || !isFormValid || disabled || isLoading}
    >
      {isLoading ? <span className="loading-spinner light" /> : children}
    </button>
  );
}
