import type { FormEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { debounce } from '../utils/debounce';

interface FormField {
  value: string;
  error?: string;
  validate?: (
    value: string,
    formState?: Record<string, FormField>,
  ) => string | undefined;
}

export type FormFields = Record<string, FormField>;

/**
 * Custom React Hook for handling form state and validation.
 *
 * @param initialFormFields - Initial state of form fields (values, errors, and validation).
 *
 * @returns {object} Form utilities including:
 *  - formState: Current form values and errors.
 *  - updateFieldValue: Function to handle changes and trigger validation.
 *  - submitForm: Function to handle form submission.
 *  - resetForm: Resets the form to initial state.
 *  - inputRefs: Reference to form inputs.
 *  - isFormValid: Boolean indicating form validity.
 *  - isFormUnchanged: Boolean indicating if form has been modified.
 */

export const useForm = (initialFormFields: FormFields) => {
  const [formState, setFormState] = useState<FormFields>(initialFormFields);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Debounced validation function to improve performance
  const debouncedValidateField = useCallback(
    debounce(
      (
        fieldName: string,
        fieldValue: string,
        currentFormFields: FormFields,
        callback?: () => void,
      ) => {
        const field = currentFormFields[fieldName];
        if (field?.validate) {
          const error = field.validate(fieldValue, currentFormFields);
          setFormState((prevFormState) => ({
            ...prevFormState,
            [fieldName]: { ...prevFormState[fieldName], error },
          }));
        }
        callback?.();
      },
      300,
    ),
    [],
  );

  // Update input value and trigger validation
  const updateFieldValue = useCallback(
    (fieldName: string, newValue: string, callback?: () => Promise<void>) => {
      setFormState((prevFormState) => ({
        ...prevFormState,
        [fieldName]: { ...prevFormState[fieldName], value: newValue },
      }));

      debouncedValidateField(fieldName, newValue, formState, callback);
    },
    [formState, debouncedValidateField],
  );

  // Handle form submission with validation
  const submitForm = useCallback(
    (onSubmit: (formData: Record<string, string>) => void) =>
      (event: FormEvent) => {
        event.preventDefault();
        const validationErrors: Record<string, string> = {};
        let hasErrors = false;

        Object.keys(formState).forEach((fieldKey) => {
          const field = formState[fieldKey];
          const error = field.validate?.(field.value, formState);
          if (error) {
            hasErrors = true;
            validationErrors[fieldKey] = error;
          }
        });

        if (hasErrors) {
          setFormState((prevFormState) =>
            Object.keys(prevFormState).reduce((acc, key) => {
              acc[key] = {
                ...prevFormState[key],
                error: validationErrors[key],
              };
              return acc;
            }, {} as FormFields),
          );
        } else {
          const formData = Object.keys(formState).reduce(
            (acc, key) => {
              acc[key] = formState[key].value;
              return acc;
            },
            {} as Record<string, string>,
          );
          onSubmit(formData);
        }
      },
    [formState],
  );

  // Set a specific error for a field
  const setFieldError = useCallback(
    (fieldName: string, errorMessage: string | undefined) => {
      setFormState((prevFormState) => ({
        ...prevFormState,
        [fieldName]: { ...prevFormState[fieldName], error: errorMessage },
      }));
    },
    [],
  );

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormState(() =>
      Object.keys(initialFormFields).reduce((acc, key) => {
        acc[key] = {
          ...initialFormFields[key],
          value: initialFormFields[key].value,
          error: undefined,
        };
        return acc;
      }, {} as FormFields),
    );
  }, [initialFormFields]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return Object.values(formState).every((field) => !field.error);
  }, [formState]);

  // Check if form is unchanged from initial values
  const isFormUnchanged = useMemo(() => {
    return Object.keys(initialFormFields).every(
      (key) => formState[key]?.value === initialFormFields[key]?.value,
    );
  }, [formState, initialFormFields]);

  // Get current form values as a plain object
  const getFormValues = useCallback(() => {
    return Object.keys(formState).reduce(
      (acc, key) => {
        acc[key] = formState[key].value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [formState]);

  return {
    formState,
    updateFieldValue,
    submitForm,
    resetForm,
    setFieldError,
    inputRefs,
    isFormValid,
    isFormUnchanged,
    getFormValues,
  };
};
