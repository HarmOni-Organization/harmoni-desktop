import React, { useMemo } from 'react';

import { useNavigation } from '@contexts/NavigationContext';
import authStore from '@modules/auth/core/store';

import { navigationConfig } from '.';

/**
 * Renders the currently active tab component.
 * Non-persistent components are only mounted when active.
 *
 * @component
 * @returns {React.ComponentType} The component linked with the active tab.
 */
function ActiveTabRenderer() {
  const { currentTab } = useNavigation();
  const memoizedTabComponents = useMemo(() => {
    const componentCache: Record<string, React.ComponentType> = {};

    Object.keys(navigationConfig).forEach((tabId) => {
      const { component: TabComponent } = navigationConfig[tabId];
      componentCache[tabId] = React.memo(TabComponent);
    });

    return componentCache;
  }, []);

  return (
    <>
      {Object.keys(navigationConfig).map((tabId) => {
        const { persistent, authRequired } = navigationConfig[tabId];
        const MemoizedComponent = memoizedTabComponents[tabId];
        const isTabActive = tabId === currentTab;

        // Check if the section requires authentication
        if (authRequired && !authStore.isAuthenticated) {
          return (
            <div key={tabId} className="inactive-tab not-authorized-message">
              <p>You need to log in to access this section.</p>
            </div>
          );
        }

        // Render non-persistent components only if they are active
        if (!persistent && !isTabActive) {
          return null;
        }

        return (
          <div
            key={tabId}
            className={`${isTabActive ? 'active-tab section-grid' : 'inactive-tab'}`}
          >
            <MemoizedComponent />
          </div>
        );
      })}
    </>
  );
}

export default ActiveTabRenderer;
