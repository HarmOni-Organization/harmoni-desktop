import WatchTogetherIcon from './assets/icons/WatchTogetherIcon';
import WatchTogetherSection from './WatchTogetherSection';

/**
 * Navigation configuration for the "Watch Together" feature.
 * Defines the component, label, and icon associated with this feature.
 */
export const watchTogetherNavigation = {
  watchTogether: {
    component: WatchTogetherSection,
    id: 'watch-together-section',
    label: 'Watch Together',
    icon: <WatchTogetherIcon />,
    persistent: true,
  },
};
