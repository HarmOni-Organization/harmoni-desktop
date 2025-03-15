import React, { useMemo, useState } from 'react';

import type { MediaFolder, MediaItem } from '../types';

interface FolderViewProps {
  folders: MediaFolder[];
  onSelectFolder: (folder: MediaFolder) => void;
  onSelectMedia: (media: MediaItem) => void;
}

function FolderView({
  folders,
  onSelectFolder,
  onSelectMedia,
}: FolderViewProps) {
  const [currentPath, setCurrentPath] = useState<MediaFolder[]>([]);
  const [quickFilter, setQuickFilter] = useState('');

  // Get the current folder being viewed
  const currentFolder =
    currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

  // Get the folders to display (either top-level or subfolders of current folder)
  const foldersToDisplay = useMemo(() => {
    const baseFolders = currentFolder ? currentFolder.subfolders : folders;

    if (!quickFilter) return baseFolders;

    return baseFolders.filter((folder) =>
      folder.name.toLowerCase().includes(quickFilter.toLowerCase()),
    );
  }, [currentFolder, folders, quickFilter]);

  // Get all files in the current folder, filtered if needed
  const currentFolderFiles = useMemo(() => {
    if (!currentFolder) return [];

    if (!quickFilter) return currentFolder.files;

    return currentFolder.files.filter((file) =>
      (file.metadata?.title || file.name)
        .toLowerCase()
        .includes(quickFilter.toLowerCase()),
    );
  }, [currentFolder, quickFilter]);

  // Calculate folder statistics
  const folderStats = useMemo(() => {
    if (!currentFolder) {
      // Calculate stats for all top-level folders
      let totalFiles = 0;
      let totalSize = 0;
      let watchedCount = 0;

      const countStats = (folder: MediaFolder) => {
        folder.files.forEach((file) => {
          totalFiles += 1;
          totalSize += file.size;
          if (file.watched) watchedCount += 1;
        });

        folder.subfolders.forEach(countStats);
      };

      folders.forEach(countStats);

      return {
        totalFiles,
        totalSize,
        watchedCount,
        watchedPercentage:
          totalFiles > 0 ? Math.round((watchedCount / totalFiles) * 100) : 0,
      };
    }
    // Calculate stats for current folder
    let totalFiles = 0;
    let totalSize = 0;
    let watchedCount = 0;

    const countStats = (folder: MediaFolder) => {
      folder.files.forEach((file) => {
        totalFiles += 1;
        totalSize += file.size;
        if (file.watched) watchedCount += 1;
      });

      folder.subfolders.forEach(countStats);
    };

    // Count current folder's files
    currentFolder.files.forEach((file) => {
      totalFiles += 1;
      totalSize += file.size;
      if (file.watched) watchedCount += 1;
    });

    // Count subfolders
    currentFolder.subfolders.forEach(countStats);

    return {
      totalFiles,
      totalSize,
      watchedCount,
      watchedPercentage:
        totalFiles > 0 ? Math.round((watchedCount / totalFiles) * 100) : 0,
    };
  }, [currentFolder, folders]);

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  // Get all files in the current view (including subfolders' files for the top level)
  const allFilesInView = useMemo(() => {
    const files = currentFolder
      ? currentFolder.files
      : folders.flatMap((folder) => folder.files);

    if (!quickFilter) return files;

    return files.filter((file) =>
      (file.metadata?.title || file.name)
        .toLowerCase()
        .includes(quickFilter.toLowerCase()),
    );
  }, [currentFolder, folders, quickFilter]);

  // Generate a background color based on the folder name for consistent placeholder colors
  const generateColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      // eslint-disable-next-line no-bitwise
      hash = str.charCodeAt(i) + (hash * 32 - hash);
    }

    // Generate hue (0-360), with moderate saturation and lightness
    const h = hash % 360;
    const s = 25 + (hash % 20); // 25-45% saturation
    const l = 20 + (hash % 15); // 20-35% lightness

    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  // Navigate to a subfolder
  const navigateToFolder = (folder: MediaFolder) => {
    if (folder.subfolders.length > 0 || folder.files.length > 0) {
      // If the folder has subfolders or files, navigate into it
      setCurrentPath([...currentPath, folder]);
      setQuickFilter(''); // Reset filter when navigating
    } else {
      // If the folder is empty, use the parent component's handler
      onSelectFolder(folder);
    }
  };

  // Navigate back to the parent folder
  const navigateBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
      setQuickFilter(''); // Reset filter when navigating back
    }
  };

  return (
    <div className="folder-view">
      {/* Breadcrumb navigation */}
      <div className="folder-header">
        {currentPath.length > 0 ? (
          <div className="folder-breadcrumb">
            <button
              className="btn btn-secondary back-button"
              onClick={navigateBack}
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
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
            <div className="breadcrumb-path">
              <span
                onClick={() => {
                  setCurrentPath([]);
                  setQuickFilter('');
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCurrentPath([]);
                    setQuickFilter('');
                  }
                }}
              >
                Home
              </span>
              {currentPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <span className="breadcrumb-separator">/</span>
                  <span
                    onClick={() => {
                      setCurrentPath(currentPath.slice(0, index + 1));
                      setQuickFilter('');
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setCurrentPath(currentPath.slice(0, index + 1));
                        setQuickFilter('');
                      }
                    }}
                  >
                    {folder.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <h2 className="section-title">Your Media Folders</h2>
        )}

        <div className="folder-quick-filter">
          <input
            type="text"
            placeholder="Quick filter..."
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            aria-label="Quick filter"
            id="quick-filter-input"
          />
          <label htmlFor="quick-filter-input" className="visually-hidden">
            Quick filter
          </label>
          {quickFilter && (
            <button
              className="clear-filter"
              onClick={() => setQuickFilter('')}
              type="button"
              aria-label="Clear filter"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Folder statistics */}
      <div className="folder-statistics">
        <div className="stat-item">
          <span className="stat-value">{folderStats.totalFiles}</span>
          <span className="stat-label">Files</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {formatFileSize(folderStats.totalSize)}
          </span>
          <span className="stat-label">Total Size</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{folderStats.watchedCount}</span>
          <span className="stat-label">Watched</span>
        </div>
        <div className="stat-item">
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${folderStats.watchedPercentage}%` }}
              aria-valuenow={folderStats.watchedPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
          <span className="stat-label">
            {folderStats.watchedPercentage}% Complete
          </span>
        </div>
      </div>

      <h2 className="content-title">
        {currentFolder ? currentFolder.name : 'Folders'}
        {quickFilter && <span className="filter-indicator"> (filtered)</span>}
      </h2>

      {/* Show folders */}
      {foldersToDisplay.length > 0 && (
        <div className="folder-grid">
          {foldersToDisplay.map((folder) => (
            <div
              key={folder.id}
              className="folder-card"
              onClick={() => navigateToFolder(folder)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateToFolder(folder);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${folder.name} folder`}
            >
              <div
                className="folder-icon"
                style={{
                  background: `linear-gradient(135deg, ${generateColorFromString(folder.name)} 0%, rgba(20, 20, 20, 0.8) 100%)`,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="folder-name">{folder.name}</div>
              <div className="folder-info">
                {folder.files.length} files
                {folder.subfolders.length > 0 &&
                  `, ${folder.subfolders.length} subfolders`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show message when no folders match filter */}
      {quickFilter &&
        foldersToDisplay.length === 0 &&
        currentFolderFiles.length === 0 && (
          <div className="no-results">
            <p>
              No folders or files match your filter: &ldquo;{quickFilter}&rdquo;
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => setQuickFilter('')}
              type="button"
            >
              Clear Filter
            </button>
          </div>
        )}

      {/* Show files in the current folder */}
      {currentFolderFiles.length > 0 && (
        <div className="folder-files">
          <h3 className="subsection-title">
            Files in this folder
            {quickFilter &&
              currentFolder?.files.length !== currentFolderFiles.length &&
              ` (${currentFolderFiles.length} of ${currentFolder?.files.length})`}
          </h3>
          <div className="folder-files-grid">
            {currentFolderFiles.map((file) => (
              <div
                key={file.id}
                className="media-card"
                onClick={() => onSelectMedia(file)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectMedia(file);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${file.name} details`}
              >
                <div
                  className="media-thumbnail"
                  style={{
                    backgroundImage: file.metadata?.coverImage
                      ? `url(${file.metadata.coverImage})`
                      : 'none',
                    backgroundColor: !file.metadata?.coverImage
                      ? generateColorFromString(file.name)
                      : 'transparent',
                  }}
                >
                  {!file.metadata?.coverImage && (
                    <span className="media-thumbnail-placeholder">
                      {file.name.substring(0, 1).toUpperCase()}
                    </span>
                  )}
                  {file.watched && <div className="media-watched-badge">✓</div>}
                  <div className="media-size-badge">
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <div className="media-title">
                  {file.metadata?.title || file.name}
                </div>
                <div className="media-details">
                  {file.metadata?.season && file.metadata?.episode && (
                    <span className="media-episode">
                      S{file.metadata.season} E{file.metadata.episode}
                    </span>
                  )}
                  <span className="media-date">
                    {new Date(file.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show recently added media only at the top level */}
      {currentPath.length === 0 && allFilesInView.length > 0 && (
        <div className="recent-media">
          <h3 className="subsection-title">Recently Added Media</h3>
          <div className="recent-media-grid">
            {allFilesInView
              .sort((a, b) => b.lastModified - a.lastModified)
              .slice(0, 6)
              .map((file) => (
                <div
                  key={file.id}
                  className="recent-media-card"
                  onClick={() => onSelectMedia(file)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectMedia(file);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${file.name} details`}
                >
                  <div
                    className="media-thumbnail"
                    style={{
                      backgroundImage: file.metadata?.coverImage
                        ? `url(${file.metadata.coverImage})`
                        : 'none',
                      backgroundColor: !file.metadata?.coverImage
                        ? generateColorFromString(file.name)
                        : 'transparent',
                    }}
                  >
                    {!file.metadata?.coverImage && (
                      <span className="media-thumbnail-placeholder">
                        {file.name.substring(0, 1).toUpperCase()}
                      </span>
                    )}
                    {file.watched && (
                      <div className="media-watched-badge-small">✓</div>
                    )}
                  </div>
                  <div className="media-info">
                    <div className="media-title">
                      {file.metadata?.title || file.name}
                    </div>
                    <div className="media-folder">
                      {folders.find((f) => file.path.includes(f.path))?.name ||
                        ''}
                      {file.metadata?.season && file.metadata?.episode && (
                        <span className="media-episode-small">
                          • S{file.metadata.season}E{file.metadata.episode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty state when no content is available */}
      {currentPath.length > 0 &&
        foldersToDisplay.length === 0 &&
        currentFolderFiles.length === 0 &&
        !quickFilter && (
          <div className="empty-folder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p>This folder is empty</p>
          </div>
        )}
    </div>
  );
}

export default FolderView;
