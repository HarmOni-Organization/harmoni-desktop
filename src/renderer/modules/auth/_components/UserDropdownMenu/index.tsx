import './style.scss';

import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import profileAvatar from '@modules/auth/assets/profile-avatar.png';
import authStore from '@modules/auth/core/store';

/**
 * UserDropdownMenu Component
 * Renders a dropdown menu for authenticated users with account options such as profile, settings, and logout.
 *
 * @returns {JSX.Element | null} The dropdown menu component, or null if no user is authenticated.
 */
function UserDropdownMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenuVisibility = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen) {
        if (!event?.target?.closest?.('.dropdown-menu-container')) {
          setIsMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuItemClick = (callbackFunction) => () => {
    setIsMenuOpen(false);
    callbackFunction?.();
  };

  if (!authStore.authState.currentUser) {
    return null;
  }

  return (
    <div className="dropdown-menu-container">
      <div>
        <div
          className="Image avatar"
          onClick={toggleMenuVisibility}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => event.key === 'Enter' && toggleMenuVisibility()}
        >
          <img src={profileAvatar} alt="User Profile Avatar" />
        </div>
      </div>
      <div>
        {isMenuOpen && (
          <div className="dropdown-menu">
            <div className="menu-item">
              <span>
                My Profile
                <br />
                <span className="menu-item__username">
                  @{authStore.authState.currentUser?.username}
                </span>
              </span>
            </div>
            <div className="menu-item">Account Settings</div>
            <div className="menu-item">Device Management</div>
            <div
              className="menu-item"
              onClick={handleMenuItemClick(authStore.logout)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) =>
                event.key === 'Enter' && handleMenuItemClick(authStore.logout)()
              }
            >
              Sign Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default observer(UserDropdownMenu);
