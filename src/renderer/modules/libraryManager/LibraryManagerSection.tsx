import './styles.scss';

import React, { useEffect, useMemo, useState } from 'react';

import { DisplayManager } from '../../components/DisplayManager';
import { useDisplayManager } from '../../components/DisplayManager/useDisplayManager';
import EmptyLibrary from './components/EmptyLibrary';
import FolderView from './components/FolderView';
import LibraryHeader from './components/LibraryHeader';
import MediaDetailsView from './components/MediaDetailsView';
import MediaGrid from './components/MediaGrid';
import ScanProgressBar from './components/ScanProgressBar';
import { IPC_CHANNELS } from './constants';
import { useLibraryManager } from './core/useLibraryManager';
import type { MediaFolder, MediaItem } from './types';

// Define FilterOptions interface to match LibraryHeader props
interface FilterOptions {
  genre: string[];
  resolution: string[];
  watched: boolean | null;
  folder: string[];
}

// Display keys for the DisplayManager
const DISPLAY_KEYS = {
  FOLDERS: 'folders',
  MEDIA_DETAILS: 'media_details',
  ALL_MEDIA: 'all_media',
};

function LibraryManagerSection() {
  const {
    library,
    isLoading,
    scanProgress,
    settings,
    scanLibrary,
    selectFolder,
    playMedia,
    updateWatchStatus,
  } = useLibraryManager();

  const { state, registerComponent, navigate } = useDisplayManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    genre: [],
    resolution: [],
    watched: null,
    folder: [],
  });
  const [sortOption, setSortOption] = useState('date_added_desc');
  const [selectedFolder, setSelectedFolder] = useState<MediaFolder | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Extract all folder paths from the library
  const folderPaths = useMemo(() => {
    if (!library) return [];

    const paths: string[] = [];

    const extractFolderPaths = (folder: MediaFolder) => {
      paths.push(folder.path);
      folder.subfolders.forEach(extractFolderPaths);
    };

    library.folders.forEach(extractFolderPaths);

    return paths;
  }, [library]);

  // Register components with the DisplayManager
  useEffect(() => {
    if (!library) return;

    // Register the folder view
    registerComponent(
      DISPLAY_KEYS.FOLDERS,
      <FolderView
        folders={library.folders}
        onSelectFolder={(folder) => {
          setSelectedFolder(folder);
          navigate(DISPLAY_KEYS.MEDIA_DETAILS);
        }}
        onSelectMedia={(media) => {
          // Find the parent folder of this media
          let parentFolder: MediaFolder | null = null;

          const findParentFolder = (folder: MediaFolder): boolean => {
            if (folder.files.some((file) => file.id === media.id)) {
              parentFolder = folder;
              return true;
            }

            for (const subfolder of folder.subfolders) {
              if (findParentFolder(subfolder)) {
                return true;
              }
            }

            return false;
          };

          library.folders.forEach((folder) => {
            if (!parentFolder) {
              findParentFolder(folder);
            }
          });

          if (parentFolder) {
            setSelectedFolder(parentFolder);
            setSelectedMedia(media);
            navigate(DISPLAY_KEYS.MEDIA_DETAILS);
          }
        }}
      />,
    );

    // Register the media details view
    if (selectedFolder) {
      registerComponent(
        DISPLAY_KEYS.MEDIA_DETAILS,
        <MediaDetailsView
          folder={selectedFolder}
          selectedMedia={selectedMedia || undefined}
          onSelectMedia={(media) => setSelectedMedia(media)}
          onPlayMedia={playMedia}
          onWatchStatusUpdate={updateWatchStatus}
          onGoBack={() => {
            setSelectedMedia(null);
            navigate(DISPLAY_KEYS.FOLDERS);
          }}
        />,
      );
    }

    // Register the all media view (traditional grid view)
    registerComponent(
      DISPLAY_KEYS.ALL_MEDIA,
      <MediaGrid
        library={library}
        searchQuery={searchQuery}
        filters={activeFilters}
        sortOption={sortOption}
        onPlayMedia={playMedia}
        onWatchStatusUpdate={updateWatchStatus}
      />,
    );

    // Set default view if none is active
    if (!state.activeKey) {
      navigate(DISPLAY_KEYS.FOLDERS);
    }
  }, [
    library,
    registerComponent,
    navigate,
    state.activeKey,
    selectedFolder,
    selectedMedia,
    searchQuery,
    activeFilters,
    sortOption,
    playMedia,
    updateWatchStatus,
  ]);

  useEffect(() => {
    // Listen for scan progress updates
    const removeListener = window.electron.ipcRenderer.on(
      IPC_CHANNELS.SCAN_PROGRESS,
      () => {
        // Progress is handled in the useLibraryManager hook
      },
    );

    return () => {
      removeListener();
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // When searching, switch to the all media view
    if (query) {
      navigate(DISPLAY_KEYS.ALL_MEDIA);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
    // When filtering, switch to the all media view
    if (
      filters.genre.length > 0 ||
      filters.resolution.length > 0 ||
      filters.watched !== null ||
      filters.folder.length > 0
    ) {
      navigate(DISPLAY_KEYS.ALL_MEDIA);
    }
  };

  const handleSortChange = (sortId: string) => {
    setSortOption(sortId);
  };

  const handleAddFolder = async () => {
    await selectFolder();
  };

  const handleScanLibrary = () => {
    scanLibrary();
  };

  const handleViewAllMedia = () => {
    navigate(DISPLAY_KEYS.ALL_MEDIA);
  };

  const handleViewFolders = () => {
    navigate(DISPLAY_KEYS.FOLDERS);
  };

  if (isLoading) {
    return (
      <div className="library-loading">
        <div className="loading-spinner" />
        <p>Loading your media library...</p>
      </div>
    );
  }

  // Show empty state if no folders are configured
  if (!settings.libraryFolders.length) {
    return <EmptyLibrary onAddFolder={handleAddFolder} />;
  }

  // Show scan progress if scanning
  if (
    scanProgress.status === 'scanning' ||
    scanProgress.status === 'processing'
  ) {
    return (
      <div className="library-container">
        <LibraryHeader
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onScanLibrary={handleScanLibrary}
          onAddFolder={handleAddFolder}
          folderList={folderPaths}
        />
        <ScanProgressBar progress={scanProgress} />
        <div className="library-content">
          <DisplayManager />
        </div>
      </div>
    );
  }

  return (
    <div className="library-container">
      <LibraryHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onScanLibrary={handleScanLibrary}
        onAddFolder={handleAddFolder}
        folderList={folderPaths}
      />

      {/* View toggle buttons */}
      <div className="view-toggle">
        <button
          className={`btn ${state.activeKey === DISPLAY_KEYS.FOLDERS ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleViewFolders}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Folders View
        </button>
        <button
          className={`btn ${state.activeKey === DISPLAY_KEYS.ALL_MEDIA ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleViewAllMedia}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Grid View
        </button>
      </div>

      <div className="library-content">
        {library ? (
          <DisplayManager />
        ) : (
          <div className="library-empty">
            <p>No media found. Try scanning your library.</p>
            <button
              className="btn btn-primary"
              onClick={handleScanLibrary}
              type="button"
            >
              Scan Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LibraryManagerSection;
