import './style.scss';

import { lazy, useEffect } from 'react';

import { DisplayManager } from '@components/DisplayManager';
import { useDisplayManager } from '@components/DisplayManager/useDisplayManager';
import { withDisplayManagerProvider } from '@components/DisplayManager/withDisplayManagerProvider';

import { SECTION_NAMES } from './constants';

// Lazy-loaded sections
const JoinAndInviteSection = lazy(
  () => import('./Section/JoinAndInviteSection'),
);
const JoinedRoomSection = lazy(() => import('./Section/JoinedRoomSection'));

/**
 * Main component for Watch Together feature with dynamic section navigation.
 */
function WatchTogetherSection() {
  const { registerComponent, navigate } = useDisplayManager();

  // // Bulk register components dynamically
  useEffect(() => {
    registerComponent(SECTION_NAMES.JOIN_AND_INVITE, <JoinAndInviteSection />);
    registerComponent(SECTION_NAMES.JOINED_ROOM, <JoinedRoomSection />);
    navigate(SECTION_NAMES.JOIN_AND_INVITE);
  }, [registerComponent, navigate]);

  return (
    <div className="watch-together">
      <DisplayManager duration={300} debug />
    </div>
  );
}

export default withDisplayManagerProvider(WatchTogetherSection);
