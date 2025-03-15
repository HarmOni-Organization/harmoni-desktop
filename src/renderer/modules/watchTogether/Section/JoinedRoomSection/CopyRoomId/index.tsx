import './style.scss';

import { showToast } from '@components/Toaster';

import CopyIcon from './CopyIcon';

interface CopyRoomIdProps {
  roomId: string;
}

/**
 * CopyRoomId Component
 * @description Displays the Room ID and provides a copy-to-clipboard functionality.
 * @param {CopyRoomIdProps} props - Component props containing the roomId.
 * @returns {JSX.Element} Rendered CopyRoomId component.
 */
function CopyRoomId({ roomId }: CopyRoomIdProps) {
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      showToast('Room ID copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy Room ID.', 'error');
    }
  };

  return (
    roomId && (
      <div
        className="room-id-section"
        onClick={copyRoomId}
        aria-label="Toggle Copy Room Id"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && copyRoomId()}
      >
        <span className="room-id-value">{roomId}</span>
        <CopyIcon
          width="24"
          height="24"
          fill="currentColor"
          className="copy-icon"
        />
      </div>
    )
  );
}

export default CopyRoomId;
