import React from 'react';

// Import from the dedicated file instead of index
import LibraryManager from './LibraryManager';

// Create an icon component for the library manager
function LibraryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

// Export the navigation configuration for the library manager
export const libraryManagerNavigation = {
  libraryManager: {
    // Ensure the component is a function component
    component: LibraryManager,
    label: 'Library',
    icon: <LibraryIcon />,
    persistent: true,
  },
};
