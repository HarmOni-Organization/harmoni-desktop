import { observer } from 'mobx-react-lite';
import { useMemo, useRef } from 'react';

import { Form, Input, SubmitButton } from '../../../components/CustomForm';
import type { FormProps } from '../../../components/CustomForm/_components/Form';
import authStore from '../core/store';
import {
  asyncValidateEmail,
  asyncValidateUsername,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../utils/validation';

/**
 * RegisterForm Component
 * Handles user registration.
 * @returns {JSX.Element} The Registration Form component.
 */
function RegisterForm() {
  const formReference = useRef<FormProps>(null);

  const registerInitialState = useMemo(
    () => ({
      email: {
        value: '',
        validate: validateEmail,
      },
      username: {
        value: '',
        validate: validateUsername,
      },
      password: {
        value: '',
        validate: validatePassword,
      },
      confirmPassword: {
        value: '',
        validate: (value, formState) =>
          validateConfirmPassword(value, formState.password.value),
      },
    }),
    [],
  );

  /**
   * Handles registration form submission.
   * @param {Object} formData - The form data.
   * @returns {Promise<void>}
   */
  const handleRegister = async (newUserDetails) => {
    try {
      const { username, password, email } = newUserDetails;
      await authStore.register({ username, password, email });

      // Reset form if registration is successful
      if (!authStore.authState.authError) {
        setTimeout(() => {
          formReference.current?.resetForm?.();
        });
      }
    } catch (error) {
      console.error('Registration Error:', error);
    }
  };

  const isDisabled =
    authStore.authState.emailCheckStatus !== 'available' ||
    authStore.authState.userNameCheckStatus !== 'available';

  return (
    <Form
      initialFormState={registerInitialState}
      onSubmit={handleRegister}
      ref={formReference}
    >
      <Input
        name="email"
        label="Email"
        placeholder="Enter your email"
        asyncValidator={asyncValidateEmail(authStore.checkEmailAvailability)}
        required
      />
      <Input
        name="username"
        label="User Name"
        placeholder="Enter your user name"
        asyncValidator={asyncValidateUsername(
          authStore.checkUsernameAvailability,
        )}
        required
      />
      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        required
      />
      <Input
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        required
      />
      <SubmitButton
        className="animate__pulse"
        isLoading={authStore.authState.loading}
        disabled={isDisabled}
      >
        Sign Up
      </SubmitButton>
    </Form>
  );
}

export default observer(RegisterForm);
