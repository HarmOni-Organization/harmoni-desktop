import React, { createContext, useContext } from 'react';

import type { FormFields } from '../hooks/useForm';
import { useForm } from '../hooks/useForm';

// Creating a context to store form state and methods.
const FormContext = createContext<ReturnType<typeof useForm> | null>(null);

/**
 * FormProvider - Provides form state and methods to child components.
 * @param {FormFields} initialFormState - The initial state for the form.
 * @param {React.ReactNode} children - The components that will consume the form context.
 * @returns {JSX.Element} Wrapped provider component.
 */
interface FormProviderProps {
  initialFormState: FormFields;
  children: React.ReactNode;
}

export function FormProvider({
  initialFormState,
  children,
}: FormProviderProps) {
  const formContextValue = useForm(initialFormState);

  return (
    <FormContext.Provider value={formContextValue}>
      {children}
    </FormContext.Provider>
  );
}

/**
 * useFormContext - Custom hook to access the form context.
 * @throws Will throw an error if used outside of a FormProvider.
 * @returns {ReturnType<typeof useForm>} The form state and methods.
 */
export const useFormContext = () => {
  const formContext = useContext(FormContext);
  if (!formContext) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return formContext;
};
