import './style.css';

import clsx from 'classnames';

import { useNavigation } from '@contexts/NavigationContext';
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

  const handleItemSelect = (key: string) => {
    setCurrentTab(key);
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
    <nav className={navigationMenuClasses.nav}>
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
            <div className="icon-container">{item.icon}</div>
            <span className="no-wrap-text">{item.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}

export default NavigationMenu;
