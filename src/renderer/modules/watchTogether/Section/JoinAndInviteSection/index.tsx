import './style.scss';

import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import type { CodeInputRef } from '@components/CodeInput';
import CodeInput from '@components/CodeInput';
import { useDisplayManager } from '@components/DisplayManager/useDisplayManager';
import { showToast } from '@components/Toaster';
import { formatToDashCode } from '@utils/helper';

import { WatchTogetherIDs } from '../../constants';
import watchTogetherStore from '../../core/store/WatchTogetherStore';

/**
 * JoinAndInviteSection Component
 * @description Manages room creation and joining functionalities for the Watch Together feature.
 * @returns {JSX.Element} Rendered JoinAndInviteSection component.
 */
function JoinAndInviteSection() {
  const codeInputRef = useRef<CodeInputRef>(null); // Reference for CodeInput
  const { navigate } = useDisplayManager();

  // Create a new room
  const handleCreateRoom = async () => {
    try {
      await watchTogetherStore.createRoom();
      navigate('JOINED_ROOM');
    } catch (err) {
      console.error('Error creating room:', err);
      showToast('Failed to create a room. Please try again.', 'error');
    }
  };

  // Join an existing room
  const handleJoinRoom = async (value = '') => {
    if (!value && !codeInputRef.current?.validate()) {
      showToast('Invalid or incomplete Room ID.', 'error');
      return;
    }

    try {
      const roomId = formatToDashCode(
        value || codeInputRef.current?.getCode() || '',
      );
      await watchTogetherStore.joinRoom({ roomId });
    } catch (err) {
      console.error('Error joining room:', err);
      showToast('Failed to join the room. Please check the Room ID.', 'error');
    }
  };
  useEffect(() => {
    if (watchTogetherStore.currentRoom?.roomId) {
      navigate('JOINED_ROOM');
    }
  }, [watchTogetherStore.currentRoom?.roomId]);

  useEffect(() => {
    if (watchTogetherStore.isInitialized) {
      if (watchTogetherStore.currentRoom?.roomId) {
        navigate('JOINED_ROOM');
      }
    }
  }, [
    watchTogetherStore.currentRoom?.roomId,
    watchTogetherStore.isInitialized,
  ]);

  return (
    <div
      id={WatchTogetherIDs.JOIN_AND_INVITE_SECTION}
      className="join-invite-container"
    >
      <h2>Watch Together</h2>

      {/* Create Room Button */}
      <button
        type="button"
        className="create-room-button"
        id={WatchTogetherIDs.CREATE_ROOM_BUTTON}
        onClick={handleCreateRoom}
      >
        Create a Room
      </button>

      <div className="divider">
        <div className="line" />
        <span>or join with room ID</span>
        <div className="line" />
      </div>

      {/* Room ID Input */}
      <CodeInput
        id={WatchTogetherIDs.JOIN_ROOM_INPUT}
        length={8}
        dashPosition={4}
        showErrorMessage={false}
        onChange={() => {}}
        onComplete={(value) => handleJoinRoom(value)}
        onEnter={() => codeInputRef.current?.validate()}
        ref={codeInputRef}
      />

      {/* Join Room Button */}
      <button
        type="button"
        id={WatchTogetherIDs.JOIN_BUTTON}
        className="join-room-button"
        onClick={() => handleJoinRoom()}
      >
        Join a Room
      </button>
    </div>
  );
}

export default observer(JoinAndInviteSection);
