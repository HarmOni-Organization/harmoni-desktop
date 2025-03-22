import { forwardRef, useImperativeHandle } from 'react';

import { FormProvider, useFormContext } from './FormProvider';
import type { FormFields } from '../hooks/useForm';

/**
 * @typedef {Object} FormProps
 * @property {FormFields} initialFormState - The initial state of the form.
 * @property {function(Object): void} onSubmit - Callback function for when the form is submitted.
 * @property {function(): void} [onReset] - Optional callback function for when the form is reset.
 * @property {function(): void} [resetForm] - Optional function to manually reset the form.
 * @property {React.ReactNode} children - Child elements to render within the form.
 */
export interface FormProps {
  initialFormState: FormFields;
  onSubmit: (formData: Record<string, string>) => void;
  onReset?: () => void;
  resetForm?: () => void;
  children: React.ReactNode;
  updateFieldValue?: (
    field: string,
    value: string,
    callback?: () => Promise<void>,
  ) => void;
}

interface FormContentProps extends Omit<FormProps, 'initialFormState'> {}

/**
 * @typedef {Object} FormContentProps
 * @property {function(Object): void} onSubmit - Callback function for form submission.
 * @property {function(): void} [onReset] - Optional callback function for form reset.
 * @property {React.ReactNode} children - Child elements to render.
 */
const FormContent = forwardRef(
  (
    { onSubmit, onReset, children, ...otherFormProps }: FormContentProps,
    ref,
  ) => {
    const formContext = useFormContext();

    useImperativeHandle(ref, () => formContext);

    return (
      <form
        {...otherFormProps}
        onSubmit={(event) => {
          event.preventDefault();
          formContext.submitForm(onSubmit)(event);
        }}
        onReset={(event) => {
          event.preventDefault();
          formContext.resetForm();
          if (onReset) onReset();
        }}
      >
        {children}
      </form>
    );
  },
);

/**
 * Main Form component which provides the form context.
 * @param {FormProps} props - The properties to initialize and control the form.
 * @returns {JSX.Element}
 */
export const Form = forwardRef(
  (
    {
      initialFormState,
      onSubmit,
      onReset,
      children,
      ...otherFormProps
    }: FormProps,
    ref,
  ) => {
    return (
      <FormProvider initialFormState={initialFormState}>
        <FormContent
          ref={ref}
          onSubmit={onSubmit}
          onReset={onReset}
          {...otherFormProps}
        >
          {children}
        </FormContent>
      </FormProvider>
    );
  },
);
