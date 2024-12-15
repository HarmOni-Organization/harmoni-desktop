import React, { useMemo } from 'react';

import { useNavigation } from '../contexts/NavigationContext';
import { navigationConfig } from '.';

/**
 * Renders the currently active tab component.
 * Non-persistent components are only mounted when active.
 *
 * @component
 * @returns {React.ComponentType} The component linked with the active tab.
 */
function ActiveTabRenderer() {
  // Get the currently selected tab from the navigation context
  const { currentTab } = useNavigation();

  // Memoize components to prevent unnecessary re-renders
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
        const { persistent } = navigationConfig[tabId];
        const MemoizedComponent = memoizedTabComponents[tabId];
        const isTabActive = tabId === currentTab;

        // Render non-persistent components only if they are active
        if (!persistent && !isTabActive) {
          return null;
        }

        return (
          <div
            key={tabId}
            className={isTabActive ? 'active-tab' : 'inactive-tab'}
          >
            <MemoizedComponent />
          </div>
        );
      })}
    </>
  );
}

export default ActiveTabRenderer;
