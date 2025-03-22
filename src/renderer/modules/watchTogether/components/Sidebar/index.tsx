import './style.scss';

import { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import profileAvatar from '@modules/auth/assets/profile-avatar.png';
import { WatchTogetherIDs } from '@modules/watchTogether/constants';
import watchTogetherStore from '@modules/watchTogether/core/store/WatchTogetherStore';
import type { PlayerType } from '@modules/watchTogether/types';

import SelectMediaButton from './SelectMediaIcon';
import StartWatchTogetherIcon from '../../assets/icons/ClockIcon';

const RoomMemberList = observer(() => {
  const { members = [], files = [] } = watchTogetherStore?.currentRoom || {};

  return (
    <div className="room-member-list">
      <h3 className="list-title">Room Members</h3>
      {members.map((member) => {
        const hasFile = files.some(
          (file) => file.userId === member.userId && file.name,
        );

        return (
          <div key={member.userId} className="member-item">
            <div className="relative">
              <div className="Image avatar">
                <img src={profileAvatar} alt={`${member.username}'s avatar`} />
              </div>
              <span
                className={`file-status-dot ${hasFile ? 'ready' : 'not-Ready'}`}
              />
            </div>

            <div className="member-info">
              <span className="username">{member.username}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

function Sidebar() {
  const { videoPlayer, setVideoPlayerType, currentRoom, setPlayerPath } =
    watchTogetherStore;

  const fileName =
    watchTogetherStore.fileName || watchTogetherStore.currentSelectedFileName;
  // Opens a file dialog to select a video player
  const handleSelectPlayer = async () => {
    try {
      // Pass the current player path to use as initial directory
      const path = await window.electron.ipcRenderer.invoke(
        'select-player',
        videoPlayer.path,
      );
      if (path) {
        // Validate the selected player before setting it
        const isValid = await window.electron.ipcRenderer.invoke(
          'validate-player-path',
          path,
        );
        if (isValid) {
          setPlayerPath(path); // Update player path in the store
        } else {
          console.error('Invalid player path selected');
          alert(
            'The selected file is not a valid video player. Please select VLC or another supported player.',
          );
        }
      }
    } catch (error) {
      console.error('Failed to select player:', error);
    }
  };

  // Updates the video player settings when playerDetails change
  useEffect(() => {
    console.log(toJS(currentRoom));

    if (videoPlayer.type) {
      window.electron.ipcRenderer.invoke('set-player', videoPlayer.type, {
        username: videoPlayer.username,
        host: videoPlayer.host,
        port: videoPlayer.port,
        password: videoPlayer.password,
      });
    }
  }, []);

  const handlePlayerSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === videoPlayer.type) {
      setVideoPlayerType(event.target.value as PlayerType);
      window.electron.ipcRenderer.invoke('set-player', event.target.value, {
        username: videoPlayer.username,
        host: videoPlayer.host,
        port: videoPlayer.port,
        password: videoPlayer.password,
      });
    }
  };

  const handleSelectFile = async (): Promise<void> => {
    try {
      // Invoke the main process to open the file dialog
      const selectedFile: string | null =
        await window.electron.ipcRenderer.invoke('select-media');
      if (selectedFile) {
        watchTogetherStore.setSelectedMedia(selectedFile); // Set the selected file path in the store
      }
    } catch (error) {
      console.error('Error selecting media file:', error);
    }
  };
  return (
    <div
      className="action-section-container"
      id={WatchTogetherIDs.ACTION_SECTION}
    >
      <button
        type="button"
        className="harmony-btn"
        onClick={async () => {
          try {
            await window.electron.ipcRenderer.invoke('start');
          } catch (error) {
            console.error('Failed to start:', error);
          }
        }}
        id={WatchTogetherIDs.START_BUTTON}
      >
        Harm
        <span className="icon">
          <StartWatchTogetherIcon />
        </span>
        ny
      </button>

      <div className="main-info">
        <div className="info-item">
          <span className="label">Status</span>
          <span
            className={`value status ${watchTogetherStore.status.toLowerCase()}`}
          >
            {watchTogetherStore.status}
          </span>
        </div>

        <div className="info-item">
          <span className="label file-name">File Name</span>

          <span className="value file-name-container ellipsis">
            {fileName || 'No file selected'}
          </span>
          <Tooltip anchorSelect=".file-name-container" place="top">
            {fileName}
          </Tooltip>
          <SelectMediaButton
            onClick={handleSelectFile}
            width={20}
            style={{ minWidth: 20, paddingBottom: 10, cursor: 'pointer' }}
          />
        </div>
        {/* <MediaSelector /> */}
        <div className="info-item">
          <span className="label">Select Video Player</span>

          <div className="custom-dropdown">
            <select
              value={videoPlayer.type}
              className="player-select"
              onChange={handlePlayerSelect}
            >
              <option value="vlc">VLC</option>
            </select>
          </div>
        </div>
        <div className="info-item">
          <span className="label">Player Path</span>
          <span className="value player-path ellipsis">{videoPlayer.path}</span>

          <Tooltip anchorSelect=".player-path" place="top">
            {videoPlayer.path}
          </Tooltip>
          <button
            type="button"
            className="select-player-btn"
            onClick={handleSelectPlayer}
            title="Select player path"
          >
            Select
          </button>
        </div>
      </div>
      <RoomMemberList />
    </div>
  );
}

export default observer(Sidebar);
