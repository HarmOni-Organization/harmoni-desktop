import './style.css';

import { useEffect } from 'react';
import clsx from 'classnames';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { useNavigation } from '@contexts/NavigationContext';
import preferencesStore from '@core/stores/PreferencesStore';
import { useIsMobile } from '@hooks/use-mobile';
import { navigationConfig } from '@navigation/index';

import { navigationMenuClasses } from './navigationMenuClasses';

/**
 * NavigationMenu component renders a list of selectable menu items.
 * Each item is clickable and can be navigated via keyboard (Enter key).
 *
 * @component
 * @returns {JSX.Element} The rendered navigation menu component.
 */
function NavigationMenu(): JSX.Element {
  const { currentTab, setCurrentTab } = useNavigation();
  const isMobile = useIsMobile(1021);

  // Handle mobile/desktop transitions and remember sidebar state
  useEffect(() => {
    // If we're on mobile view, store the current collapse state for later
    if (isMobile) {
      preferencesStore.sidebarCollapsed = false;
    }
  }, [isMobile]);

  const handleItemSelect = (key: string) => {
    setCurrentTab(key);
  };

  const toggleCollapse = () => {
    // Only toggle if not in mobile view
    if (!isMobile) {
      preferencesStore.toggleSidebar();
    }
  };

  // Dynamically generate menu items from the navigationConfig
  const menuItems = Object.keys(navigationConfig)
    .filter((key) => key !== 'notFound')
    .map((key) => ({
      key,
      id: navigationConfig[key].id,
      label: navigationConfig[key].label || 'Unnamed Item',
      icon: navigationConfig[key].icon,
    }));

  return (
    <nav
      className={clsx(navigationMenuClasses.nav, {
        [navigationMenuClasses.collapsed]: preferencesStore.sidebarCollapsed,
      })}
    >
      <div className={navigationMenuClasses.content}>
        {menuItems.map((item) => (
          <div
            key={item.key}
            id={item.id}
            className={clsx(navigationMenuClasses.item, {
              [navigationMenuClasses.isActive]: item.key === currentTab,
            })}
            onClick={() => handleItemSelect(item.key)}
            aria-label={item.label}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleItemSelect(item.key)}
          >
            <div className="icon-container" title={item.label}>
              {item.icon}
            </div>
            {!preferencesStore.sidebarCollapsed && (
              <span className={clsx({ 'no-wrap-text': !isMobile })}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
      <button
        className={clsx(navigationMenuClasses.toggleButton, {
          'mobile-hidden': isMobile,
        })}
        onClick={toggleCollapse}
        aria-label={
          preferencesStore.sidebarCollapsed
            ? 'Expand sidebar'
            : 'Collapse sidebar'
        }
        type="button"
      >
        {preferencesStore.sidebarCollapsed ? (
          <PanelLeftOpen size={16} />
        ) : (
          <PanelLeftClose size={16} />
        )}
      </button>
    </nav>
  );
}

export default observer(NavigationMenu);
