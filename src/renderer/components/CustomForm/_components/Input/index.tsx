import './style.css';

import { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'classnames';

import { useFormContext } from '../FormProvider';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  asyncValidator?: (value: string) => Promise<string | undefined>;
}

/**
 * Input Component with Asynchronous Validation.
 *
 * This component represents an input field that can perform asynchronous validation. It integrates with
 * the form context for state management, and displays validation errors, loading state, and success indicators.
 *
 * @param {string} name - The unique identifier for the input field, which is also used as its name.
 * @param {string} [label] - The label displayed for the input field, describing its intended use.
 * @param {string} [type='text'] - The type of input element (e.g., text, password, email).
 * @param {string} [placeholder] - Placeholder text for the input element.
 * @param {string} [className] - Additional CSS classes to apply to the input.
 * @param {(value: string) => Promise<string | undefined>} [asyncValidator] - Function to validate the input asynchronously, returning an error message or undefined if valid.
 * @param {React.InputHTMLAttributes<HTMLInputElement>} restProps - Additional props for the input element.
 * @returns {JSX.Element} The Input component with built-in validation features.
 */
export function Input({
  name,
  label,
  type = 'text',
  placeholder,
  className,
  asyncValidator,
  ...additionalProps
}: InputProps) {
  const [isAsyncValidationLoading, setIsAsyncValidationLoading] =
    useState(false);
  const { formState, updateFieldValue, inputRefs } = useFormContext();
  const currentFieldState = formState[name];

  const asyncValidationErrorRef = useRef<string | undefined>('');
  const asyncValidationStatus = useRef<'Idle' | 'Pending' | 'Complete'>('Idle');

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      updateFieldValue(name, value, async () => {
        if (asyncValidator) {
          setIsAsyncValidationLoading(true);
          asyncValidationStatus.current = 'Pending';
          try {
            const errorMessage = await asyncValidator(value);
            asyncValidationErrorRef.current = errorMessage;
          } catch (error) {
            asyncValidationErrorRef.current = 'Unexpected validation error';
          } finally {
            asyncValidationStatus.current = 'Complete';
            setIsAsyncValidationLoading(false);
          }
        }
      });
    },
    [name, updateFieldValue, asyncValidator],
  );

  const isInputValid = useMemo(
    () =>
      !currentFieldState.error &&
      !asyncValidationErrorRef.current &&
      !isAsyncValidationLoading &&
      !!currentFieldState.value,
    [
      currentFieldState.error,
      isAsyncValidationLoading,
      currentFieldState.value,
    ],
  );

  return (
    <div style={{ marginBottom: '1rem' }} className="form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <div className="input-wrapper">
        <input
          {...additionalProps}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={currentFieldState.value}
          onChange={handleInputChange}
          ref={(element) => {
            inputRefs.current[name] = element;
          }}
          className={clsx('form-input', className, {
            'form-input--error': !!currentFieldState.error,
          })}
          aria-invalid={!!currentFieldState.error}
          aria-describedby={
            currentFieldState.error ? `${name}-error` : undefined
          }
        />
        {isAsyncValidationLoading && <span className="loading-spinner" />}
        {asyncValidator &&
          isInputValid &&
          asyncValidationStatus.current === 'Complete' && (
            <span className="validation-success-indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  fill="none"
                />
                <polyline
                  points="8 12 11 15 16 9"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
            </span>
          )}
      </div>
      {(currentFieldState.error || asyncValidationErrorRef.current) && (
        <span id={`${name}-error`} className="form-error">
          {currentFieldState.error || asyncValidationErrorRef.current}
        </span>
      )}
    </div>
  );
}
