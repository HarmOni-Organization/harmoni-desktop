import { libraryManagerNavigation } from '@modules/libraryManager/navigation';
import { watchTogetherNavigation } from '@modules/watchTogether/navigation';

import ItemPlaceholderIcon from '../assets/icons/ItemPlaceholderIcon';

/**
 * Configuration object defining the navigation items.
 * Each item includes a label, component to render, and icon.
 */
export const navigationConfig = {
  ...watchTogetherNavigation,
  ...libraryManagerNavigation,
  sectionOne: {
    component: () => <div>Section 1 Content</div>,
    label: 'Section 1',
    icon: <ItemPlaceholderIcon />,
    persistent: false,
    authRequired: true,
  },
  sectionTwo: {
    component: () => <div>Section 2 Content</div>,
    label: 'Section 2',
    icon: <ItemPlaceholderIcon />,
    persistent: true,
  },
  sectionThree: {
    component: () => <div>Section 3 Content</div>,
    label: 'Section 3',
    icon: <ItemPlaceholderIcon />,
    persistent: false,
  },
  sectionFour: {
    component: () => <div>Section 4 Content</div>,
    label: 'Section 4',
    icon: <ItemPlaceholderIcon />,
    persistent: true,
  },
  sectionFive: {
    component: () => <div>Section 5 Content</div>,
    label: 'Section 5',
    icon: <ItemPlaceholderIcon />,
  },
};
