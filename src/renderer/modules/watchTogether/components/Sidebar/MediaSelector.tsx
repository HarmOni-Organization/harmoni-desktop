import { Tooltip } from 'react-tooltip';
import { observer } from 'mobx-react-lite';

import watchTogetherStore from '@modules/watchTogether/core/store/WatchTogetherStore';

function MediaSelector() {
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
    <div className="media-selector">
      <div className="file-display">
        <span className="label file-name">File Name</span>
        <span className="value file-name-container ellipsis">
          {watchTogetherStore.fileName || 'No file selected'}
        </span>
        <Tooltip anchorSelect=".file-name-container" place="top">
          {watchTogetherStore.fileName}
        </Tooltip>
      </div>
      <button
        className="select-file-button"
        onClick={handleSelectFile}
        type="button"
      >
        Select File
      </button>
    </div>
  );
}

export default observer(MediaSelector);
