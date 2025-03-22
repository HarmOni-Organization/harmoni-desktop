import { useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { Form, Input, SubmitButton } from '@components/CustomForm';
import type { FormProps } from '@components/CustomForm/_components/Form';

import authStore from '../core/store';
import { validateEmailOrUsername, validatePassword } from '../utils/validation';

/**
 * LoginForm - Handles user login.
 *
 * @returns {JSX.Element} Login form component.
 */
function LoginForm() {
  const formRef = useRef<FormProps>(null);

  // Initial state for form fields
  const initialFormState = useMemo(
    () => ({
      emailOrUsername: {
        value: '',
        validate: validateEmailOrUsername,
      },
      password: {
        value: '',
        validate: validatePassword,
      },
    }),
    [],
  );

  /**
   * Handles form submission.
   *
   * @param {Object} formData - Submitted form data.
   */
  const submitForm = async (formData) => {
    try {
      const { emailOrUsername, password } = formData;
      await authStore.login({ emailOrUsername, password });
      // Reset form if login succeeds
      if (!authStore.authState.authError) {
        setTimeout(() => {
          formRef.current?.resetForm?.();
        }, 500);
      } else {
        formRef.current?.updateFieldValue?.('password', '');
      }
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  return (
    <Form
      initialFormState={initialFormState}
      onSubmit={submitForm}
      ref={formRef}
    >
      <Input
        name="emailOrUsername"
        label="Email or Username"
        placeholder="Enter your email or username"
        required
      />
      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        required
      />
      <SubmitButton
        className="animate__pulse"
        isLoading={authStore.authState.loading}
      >
        Sign In
      </SubmitButton>
    </Form>
  );
}

export default observer(LoginForm);
