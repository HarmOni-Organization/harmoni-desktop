import './style.scss';

import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';

import { useDisplayManager } from '@components/DisplayManager/useDisplayManager';
import { SECTION_NAMES } from '@modules/watchTogether/constants';

import CopyRoomId from './CopyRoomId';
import LeaveRoomIcon from './LeaveRoomIcon';
import Chat from '../../components/Chat';
import Sidebar from '../../components/Sidebar';
import watchTogetherStore from '../../core/store/WatchTogetherStore';

/**
 * JoinedRoomSection Component
 * @description Displays the joined room information and provides controls for managing the room.
 * @returns {JSX.Element} Rendered JoinedRoomSection component.
 */
function JoinedRoomSection() {
  const { navigate } = useDisplayManager();

  console.log(
    'watchTogetherStore.currentRoom:',
    toJS(watchTogetherStore.currentRoom),
  );

  const { currentRoom } = watchTogetherStore;
  if (!currentRoom) {
    return null;
  }

  const { roomId, roomInfo } = currentRoom;

  const handleLeaveRoom = async () => {
    try {
      await watchTogetherStore.leaveRoom();
      navigate(SECTION_NAMES.JOIN_AND_INVITE);
    } catch (err) {
      console.error('Error leaving room:', err);
      alert('Failed to leave the room. Please try again.');
    }
  };

  return (
    <div className="joined-room-container section-grid">
      <Sidebar />
      <div className="chat-container scroll-container">
        <div className="chat-header">
          <span className="chat-title">
            <h2>{roomInfo?.name || 'Unknown Room'}</h2>
            <LeaveRoomIcon
              width="30"
              height="30"
              fill="currentColor"
              className="leave-room-icon"
              onClick={handleLeaveRoom}
            />
          </span>
          <CopyRoomId roomId={roomId} />
        </div>

        <Chat />
      </div>
    </div>
  );
}

export default observer(JoinedRoomSection);
