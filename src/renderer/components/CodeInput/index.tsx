import './style.scss';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import clsx from 'classnames';

import UIStoreInput from '@core/stores/withUIStore';

interface CodeInputProps {
  length?: number;
  value?: string;
  id: string;
  dashPosition?: number;
  showErrorMessage?: boolean;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  onEnter?: (value: string) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}

export interface CodeInputRef {
  validate: () => boolean;
  getCode: () => string;
  value: string;
  setIsValid: (value: boolean) => void;
  setErrorMessage: (message: string) => void;
}

/**
 * A React component for a multi-digit code input.
 *
 * @typedef {Object} CodeInputProps
 * @property {number} [length=8] - Number of digits in the code.
 * @property {number} [dashPosition=4] - Position to insert a dash for visual grouping.
 * @property {(value: string) => void} [onChange] - Callback triggered on code change.
 * @property {(value: string) => void} [onComplete] - Callback triggered when all digits are filled.
 * @property {(value: string) => void} [onEnter] - Callback triggered when Enter is pressed.
 * @property {React.InputHTMLAttributes<HTMLInputElement>} [inputProps] - Additional props for the input elements.
 * @property {string} [className] - Custom class name for the container.
 *
 * @typedef {Object} CodeInputRef
 * @property {() => boolean} validate - Validates if all digits are filled correctly.
 * @property {() => string} getCode - Returns the full entered code as a string.
 * @property {(value: boolean) => void} setIsValid - Sets the validity state.
 * @property {(message: string) => void} setErrorMessage - Sets the error message.
 */
const CodeInput = forwardRef<CodeInputRef, CodeInputProps>(
  (
    {
      length = 8,
      dashPosition = 4,
      showErrorMessage = true,
      onChange,
      value = '',
      id,
      onComplete,
      onEnter,
      inputProps,
      className,
    },
    ref,
  ) => {
    const inputElements = useRef<HTMLInputElement[]>([]);
    const [inputValues, setInputValues] = useState<string[]>(
      Array(length).fill(''),
    );
    const [isValid, setValidity] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Sync internal state with the external value
    useEffect(() => {
      const newValues = value
        .toUpperCase()
        .replace(/[^a-zA-Z0-9]/g, '')
        .split('')
        .concat(Array(length).fill(''))
        .slice(0, length);
      setInputValues(newValues);
    }, [value, length]);

    useImperativeHandle(ref, () => ({
      validate: () => {
        const fullCode = inputValues.join('');
        if (inputValues.includes('')) {
          setValidity(false);
          setErrorMessage('All fields must be filled.');
          console.log('errorMessage2', inputValues);

          return false;
        }
        if (fullCode.length !== length) {
          setValidity(false);
          setErrorMessage(`Code must be ${length} characters.`);
          console.log('errorMessag3e', inputValues);

          return false;
        }
        console.log('errorMessage4', inputValues);

        setValidity(true);
        setErrorMessage('');
        return true;
      },
      value: inputValues.join(''),
      getCode: () => inputValues.join(''),
      setIsValid: setValidity,
      setErrorMessage,
    }));

    const handleInputChange = useCallback(
      (index, inputValue) => {
        if (!/^[a-zA-Z0-9]*$/.test(inputValue)) return;

        const updatedValues = [...inputValues];
        updatedValues[index] = inputValue.slice(-1).toUpperCase();
        setInputValues(updatedValues);

        const fullCode = updatedValues.join('');
        onChange?.(fullCode);

        if (updatedValues.every((char) => char !== '')) {
          onComplete?.(fullCode);
        }

        setValidity(true);
        setErrorMessage('');

        if (inputValue && index < length - 1) {
          inputElements.current[index + 1]?.focus();
        }
      },
      [inputValues, length, onChange, onComplete],
    );

    const handleKeyDown = useCallback(
      (event, index) => {
        const updatedValues = [...inputValues];

        if (event.key === 'Backspace') {
          event.preventDefault();
          if (updatedValues[index]) {
            updatedValues[index] = '';
          } else if (index > 0) {
            updatedValues[index - 1] = '';
            inputElements.current[index - 1]?.focus();
          }
          setInputValues(updatedValues);
          onChange?.(updatedValues.join(''));
        }

        if (event.key === 'ArrowRight' && index < length - 1) {
          inputElements.current[index + 1]?.focus();
        }

        if (event.key === 'ArrowLeft' && index > 0) {
          inputElements.current[index - 1]?.focus();
        }

        if (event.key === 'Enter') {
          const fullCode = updatedValues.join('');
          onEnter?.(fullCode);
        }
      },
      [inputValues, length, onChange, onEnter],
    );

    const handlePaste = (event) => {
      event.preventDefault();
      const pastedData = event.clipboardData
        .getData('text')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, length)
        .toUpperCase();

      const updatedValues = pastedData.split('').concat(Array(length).fill(''));
      setInputValues(updatedValues.slice(0, length));

      const fullCode = updatedValues.join('');
      onChange?.(fullCode);

      setValidity(true);
      setErrorMessage('');
      inputElements.current[
        Math.min(pastedData.length - 1, length - 1)
      ]?.focus();
    };

    return (
      <div
        id={id}
        className={clsx('code-container', className)}
        aria-label="Code Input"
      >
        {showErrorMessage && !isValid && (
          <p className="error-message">{errorMessage}</p>
        )}

        <div className="input-wrapper">
          {Array.from({ length }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={index}>
              <input
                ref={(el) => {
                  if (el) inputElements.current[index] = el;
                }}
                id={`code-input_${index}`}
                type="text"
                value={inputValues[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                onPaste={handlePaste}
                className={clsx('code-input', { invalid: !isValid })}
                {...inputProps}
                aria-label={`Digit ${index + 1}`}
              />
              {dashPosition === index + 1 && (
                <span className="dash" aria-hidden="true">
                  -
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
);

export default UIStoreInput(CodeInput);
