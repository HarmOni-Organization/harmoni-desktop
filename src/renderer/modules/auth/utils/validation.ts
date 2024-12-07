// Validation messages for different validation scenarios.
export const validationMessages = {
  requiredField: (fieldName: string) => `${fieldName} is required.`,
  invalidEmailFormat: 'Invalid email.',
  usernameTooShort: 'Username too short (min 3).',
  usernameInvalidCharacters:
    'Invalid characters (letters, numbers, _, -, . only).',
  usernameInvalidStartEnd: 'Cannot start/end with _, - or .',
  invalidEmailOrUsername: 'Invalid email or username.',
  passwordTooShort: 'Password too short (min 8).',
  weakPassword: 'Must include upper, lower, number, and special char.',
  passwordsDoNotMatch: 'Passwords mismatch.',
  emailAlreadyExists: 'Email already in use.',
  usernameAlreadyExists: 'Username already taken.',
};

// Regular expressions for validation
const emailPattern = /\S+@\S+\.\S+/;
const usernamePattern = /^[a-zA-Z0-9._-]+$/;
const validStartEndPattern = /^(?![_.-])[a-zA-Z0-9._-]+(?<![_.-])$/;
const passwordComplexityPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

/**
 * Checks if the value is a valid email address.
 * @param email - The value to check.
 * @returns True if valid, otherwise false.
 */
export const isValidEmail = (email: string): boolean =>
  emailPattern.test(email);

/**
 * Validates an email address.
 * @param email - The email address to validate.
 * @returns Error message if invalid, otherwise undefined.
 */
export const validateEmail = (email: string): string | undefined => {
  if (!isValidEmail(email)) {
    return validationMessages.invalidEmailFormat;
  }
  return undefined;
};

/**
 * Validates a username.
 * @param username - The username to validate.
 * @returns Error message if invalid, otherwise undefined.
 */
export const validateUsername = (username: string): string | undefined => {
  if (!username) {
    return validationMessages.requiredField('Username');
  }
  if (username.trim().length < 3) {
    return validationMessages.usernameTooShort;
  }
  if (!usernamePattern.test(username)) {
    return validationMessages.usernameInvalidCharacters;
  }
  if (!validStartEndPattern.test(username)) {
    return validationMessages.usernameInvalidStartEnd;
  }
  return undefined;
};

/**
 * Validates an email or username.
 * @param value - The value to validate.
 * @returns Error message if invalid, otherwise undefined.
 */
export const validateEmailOrUsername = (value: string): string | undefined => {
  if (!value) {
    return validationMessages.requiredField('Email or Username');
  }
  if (
    !isValidEmail(value) &&
    (value.trim().length < 3 || !usernamePattern.test(value))
  ) {
    return validationMessages.invalidEmailOrUsername;
  }
  return undefined;
};

/**
 * Validates a required field.
 * @param value - The value to validate.
 * @param fieldName - Name of the field being validated.
 * @returns Error message if the field is empty, otherwise undefined.
 */
export const validateRequiredField = (
  value: string,
  fieldName: string,
): string | undefined => {
  if (!value) {
    return validationMessages.requiredField(fieldName);
  }
  return undefined;
};

/**
 * Validates a password.
 * @param password - The password to validate.
 * @returns Error message if invalid, otherwise undefined.
 */
export const validatePassword = (password: string): string | undefined => {
  if (password.length < 8) {
    return validationMessages.passwordTooShort;
  }
  if (!passwordComplexityPattern.test(password)) {
    return validationMessages.weakPassword;
  }
  return undefined;
};

/**
 * Validates if two passwords match.
 * @param confirmPassword - The confirmation password.
 * @param originalPassword - The original password.
 * @returns Error message if passwords do not match, otherwise undefined.
 */
export const validateConfirmPassword = (
  confirmPassword: string,
  originalPassword: string,
): string | undefined => {
  if (confirmPassword !== originalPassword) {
    return validationMessages.passwordsDoNotMatch;
  }
  return undefined;
};

/**
 * Asynchronously validates if an email is unique.
 * @param isEmailUnique - Function that checks the uniqueness of the email.
 * @returns A function that validates the email asynchronously.
 */
export const asyncValidateEmail =
  (isEmailUnique: (email: string) => Promise<boolean>) =>
  async (email: string): Promise<string | undefined> => {
    const emailError = validateEmail(email);
    if (emailError) return emailError;

    const unique = await isEmailUnique(email);
    if (!unique) {
      return validationMessages.emailAlreadyExists;
    }

    return undefined;
  };

/**
 * Asynchronously validates if a username is unique.
 * @param isUsernameUnique - Function that checks the uniqueness of the username.
 * @returns A function that validates the username asynchronously.
 */
export const asyncValidateUsername =
  (isUsernameUnique: (username: string) => Promise<boolean>) =>
  async (username: string): Promise<string | undefined> => {
    const usernameError = validateUsername(username);
    if (usernameError) return usernameError;

    const unique = await isUsernameUnique(username);
    if (!unique) {
      return validationMessages.usernameAlreadyExists;
    }

    return undefined;
  };
