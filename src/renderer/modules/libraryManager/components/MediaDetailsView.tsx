import React from 'react';

import type { MediaFolder, MediaItem } from '../types';

interface MediaDetailsViewProps {
  folder: MediaFolder;
  selectedMedia?: MediaItem;
  onSelectMedia: (media: MediaItem) => void;
  onPlayMedia: (mediaId: string) => void;
  onWatchStatusUpdate: (mediaId: string, watched: boolean) => void;
  onGoBack: () => void;
}

function MediaDetailsView({
  folder,
  selectedMedia,
  onSelectMedia,
  onPlayMedia,
  onWatchStatusUpdate,
  onGoBack,
}: MediaDetailsViewProps) {
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  // Format duration to human-readable format
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Generate a background color based on the title for consistent placeholder colors
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

  return (
    <div className="media-details-view">
      <div className="media-details-header">
        <button
          className="btn btn-secondary back-button"
          onClick={onGoBack}
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
          Back to Folders
        </button>
        <h2 className="folder-title">{folder.name}</h2>
      </div>

      <div className="media-details-content">
        <div className="folder-files">
          <h3 className="subsection-title">Files in this folder</h3>
          <div className="media-list">
            {folder.files.map((media) => (
              <div
                key={media.id}
                className={`media-list-item ${selectedMedia?.id === media.id ? 'selected' : ''}`}
                onClick={() => onSelectMedia(media)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectMedia(media);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Select ${media.name}`}
              >
                <div
                  className="media-thumbnail"
                  style={{
                    backgroundImage: media.metadata?.coverImage
                      ? `url(${media.metadata.coverImage})`
                      : 'none',
                    backgroundColor: !media.metadata?.coverImage
                      ? generateColorFromString(media.name)
                      : 'transparent',
                  }}
                >
                  {!media.metadata?.coverImage && (
                    <span className="media-thumbnail-placeholder">
                      {media.name.substring(0, 1).toUpperCase()}
                    </span>
                  )}
                  {media.watched && (
                    <div className="media-watched-badge">✓</div>
                  )}
                </div>
                <div className="media-info">
                  <div className="media-title">
                    {media.metadata?.title || media.name}
                  </div>
                  <div className="media-details">
                    {media.resolution && (
                      <span className="media-resolution">
                        {media.resolution}
                      </span>
                    )}
                    <span className="media-size">
                      {formatFileSize(media.size || 0)}
                    </span>
                    {media.duration && (
                      <span className="media-duration">
                        {formatDuration(media.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedMedia && (
          <div className="selected-media-details">
            <div className="media-banner">
              {selectedMedia.metadata?.bannerImage ? (
                <img
                  src={selectedMedia.metadata.bannerImage}
                  alt={selectedMedia.metadata?.title || selectedMedia.name}
                  className="banner-image"
                />
              ) : (
                <div
                  className="banner-placeholder"
                  style={{
                    background: `linear-gradient(135deg, ${generateColorFromString(
                      selectedMedia.metadata?.title || selectedMedia.name,
                    )} 0%, rgba(20, 20, 20, 0.8) 100%)`,
                  }}
                >
                  <h3>{selectedMedia.metadata?.title || selectedMedia.name}</h3>
                </div>
              )}
            </div>

            <div className="media-actions">
              <button
                className="btn btn-primary"
                onClick={() => onPlayMedia(selectedMedia.id)}
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
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Play
              </button>
              <button
                className={`btn ${
                  selectedMedia.watched ? 'btn-success' : 'btn-secondary'
                }`}
                onClick={() =>
                  onWatchStatusUpdate(selectedMedia.id, !selectedMedia.watched)
                }
                type="button"
              >
                {selectedMedia.watched ? 'Watched' : 'Mark as Watched'}
              </button>
            </div>

            <div className="media-metadata">
              <h3>{selectedMedia.metadata?.title || selectedMedia.name}</h3>

              {selectedMedia.metadata?.episode && (
                <div className="media-episode">
                  {selectedMedia.metadata.season
                    ? `Season ${selectedMedia.metadata.season}`
                    : ''}
                  {selectedMedia.metadata.episode
                    ? ` Episode ${selectedMedia.metadata.episode}`
                    : ''}
                </div>
              )}

              {selectedMedia.metadata?.releaseDate && (
                <div className="media-release-date">
                  Released:{' '}
                  {new Date(selectedMedia.metadata.releaseDate).getFullYear()}
                </div>
              )}

              {selectedMedia.metadata?.genres &&
                selectedMedia.metadata.genres.length > 0 && (
                  <div className="media-genres">
                    {selectedMedia.metadata.genres.map((genre) => (
                      <span key={genre} className="genre-tag">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

              {selectedMedia.metadata?.synopsis && (
                <div className="media-synopsis">
                  <p>{selectedMedia.metadata.synopsis}</p>
                </div>
              )}

              <div className="media-file-info">
                <div className="info-item">
                  <span className="info-label">File:</span>
                  <span className="info-value">{selectedMedia.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size:</span>
                  <span className="info-value">
                    {formatFileSize(selectedMedia.size || 0)}
                  </span>
                </div>
                {selectedMedia.resolution && (
                  <div className="info-item">
                    <span className="info-label">Resolution:</span>
                    <span className="info-value">
                      {selectedMedia.resolution}
                    </span>
                  </div>
                )}
                {selectedMedia.duration && (
                  <div className="info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">
                      {formatDuration(selectedMedia.duration)}
                    </span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Last Modified:</span>
                  <span className="info-value">
                    {new Date(selectedMedia.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaDetailsView;
