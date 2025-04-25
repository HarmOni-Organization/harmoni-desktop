import './style.scss';

import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { LoginForm, RegisterForm } from './_components';
import authStore from './core/store';

/**
 * UserAuth Component
 * Handles toggling between login and registration forms.
 * @returns {JSX.Element} The User Authentication component.
 */
function UserAuth() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  /**
   * Toggles between login and register modes.
   */
  const toggleAuthMode = () => {
    setIsRegisterMode((previousMode) => !previousMode);
  };

  return (
    <div className="section user-auth">
      <div className="content">
        <div className="form-container animate__fadeIn">
          <h2>{isRegisterMode ? 'Create an Account' : 'Sign In'}</h2>
          {isRegisterMode ? <RegisterForm /> : <LoginForm />}
          <p className="toggle-link">
            {isRegisterMode
              ? 'Already have an account?'
              : "Don't have an account?"}
            <button type="button" onClick={toggleAuthMode}>
              {isRegisterMode ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * UserAuthLoader Component
 * Observes the authentication state and conditionally displays the UserAuth component.
 * @returns {JSX.Element|null} The User Authentication Loader.
 */
const UserAuthLoader = observer(() => {
  const [isAuthVisible, setIsAuthVisible] = useState(false);

  useEffect(() => {
    const updateAuthVisibility = () => {
      const shouldDisplayAuth = !authStore.authState.loggedIn;

      if (shouldDisplayAuth) {
        setIsAuthVisible(shouldDisplayAuth);

        setTimeout(() => {
          document.body.classList.add('user-auth--is--visible');
        }, 0);
      } else {
        setTimeout(() => {
          setIsAuthVisible(shouldDisplayAuth);
        }, 500);

        document.body.classList.remove('user-auth--is--visible');
      }
    };

    updateAuthVisibility();
  }, [authStore.authState.loggedIn]);

  return isAuthVisible ? <UserAuth /> : null;
});

export default UserAuthLoader;
