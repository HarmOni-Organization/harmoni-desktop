import './style.css';

import React, { useMemo } from 'react';

import { useNavigation } from '../../contexts/NavigationContext';
import { navigationConfig } from '../../navigation';

/**
 * @typedef {Object} BreadcrumbProps
 * @property {JSX.Element} avatar - Avatar element to display at the end of the breadcrumb.
 */

interface BreadcrumbProps {
  avatar: JSX.Element;
}

/**
 * Breadcrumb component that displays the current navigation path
 * based on the active tab from the navigation context.
 *
 * @component
 * @param {BreadcrumbProps} props - Component props.
 * @returns {JSX.Element} The rendered breadcrumb navigation.
 */
function Breadcrumb({ avatar }: BreadcrumbProps) {
  const { currentTab } = useNavigation();

  // Memoize the breadcrumb items to avoid unnecessary recalculations.
  const navigationPath = useMemo(
    () => [
      { label: 'Home' },
      { label: navigationConfig[currentTab]?.label, isActive: true },
    ],
    [currentTab],
  );

  return (
    <div className="breadcrumb">
      <div className="breadcrumb-container">
        <div className="icon-container">
          <span className="icon">{navigationConfig[currentTab]?.icon}</span>
        </div>
        {navigationPath.map((breadcrumbItem, index) => (
          <React.Fragment key={breadcrumbItem.label}>
            <span
              className={`breadcrumb-item ${breadcrumbItem.isActive ? 'active' : ''}`}
            >
              {breadcrumbItem.label}
            </span>
            {index < navigationPath.length - 1 && (
              <span className="separator">&#8250;</span>
            )}
          </React.Fragment>
        ))}
      </div>
      {avatar}
    </div>
  );
}

export default Breadcrumb;
