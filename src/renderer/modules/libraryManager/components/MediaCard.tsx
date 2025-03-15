import React, { useState } from 'react';

import type { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onPlay: () => void;
  onWatchStatusUpdate: (watched: boolean) => void;
}

function MediaCard({ item, onPlay, onWatchStatusUpdate }: MediaCardProps) {
  const [imageError, setImageError] = useState(false);

  // Handle potentially missing data with fallbacks
  const title = item?.metadata?.title || item?.name || 'Unknown';
  const coverImage = item?.metadata?.coverImage;
  const resolution = item?.resolution || 'Unknown';
  const genres = item?.metadata?.genres || [];

  // Safely extract folder name from path
  const folderName = item?.path ? item.path.split('/').slice(-2, -1)[0] : '';

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

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay();
  };

  const handleWatchedToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWatchStatusUpdate(!item?.watched);
  };

  // Determine content type based on folder name or metadata
  const getContentType = (): string => {
    if (!folderName) return '';

    const folderLower = folderName.toLowerCase();
    if (folderLower.includes('anime') || item?.metadata?.anilistId) {
      return 'Anime';
    }
    if (
      folderLower.includes('tv') ||
      folderLower.includes('series') ||
      folderLower.includes('show')
    ) {
      return 'TV Show';
    }
    if (folderLower.includes('movie') || folderLower.includes('film')) {
      return 'Movie';
    }
    return '';
  };

  const contentType = getContentType();

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

  const placeholderColor = generateColorFromString(title);

  return (
    <div
      className="media-card"
      onClick={handlePlayClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Play ${title}`}
    >
      <div className="media-card-poster-container">
        {item?.watched && (
          <div className="media-card-watched-badge">
            <span>✓</span>
          </div>
        )}
        {contentType && (
          <div className="media-card-type-badge">{contentType}</div>
        )}
        {coverImage && !imageError ? (
          <img
            src={coverImage}
            alt={title}
            className="media-card-poster"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="media-card-poster media-card-poster-placeholder"
            style={{
              background: `linear-gradient(135deg, ${placeholderColor} 0%, rgba(20, 20, 20, 0.8) 100%)`,
            }}
          >
            <span>{title.substring(0, 1).toUpperCase()}</span>
            {folderName && <small className="folder-name">{folderName}</small>}
          </div>
        )}
        <div className="media-card-overlay">
          <div className="media-card-info">
            {resolution && (
              <span className="media-card-resolution">{resolution}</span>
            )}
            {item?.duration && (
              <span className="media-card-duration">
                {formatDuration(item.duration)}
              </span>
            )}
            {genres.length > 0 && (
              <div className="media-card-genres">
                {genres.slice(0, 2).map((genre) => (
                  <span key={genre} className="media-card-genre">
                    {genre}
                  </span>
                ))}
              </div>
            )}
            {folderName && (
              <div className="media-card-folder">
                <span title={folderName}>{folderName}</span>
              </div>
            )}
          </div>
          <div className="media-card-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePlayClick}
              type="button"
            >
              Play
            </button>
            <button
              className={`btn ${item?.watched ? 'btn-success' : 'btn-secondary'} btn-sm`}
              onClick={handleWatchedToggle}
              type="button"
            >
              {item?.watched ? 'Watched' : 'Mark Watched'}
            </button>
          </div>
        </div>
      </div>
      <div className="media-card-title" title={title}>
        {title}
      </div>
      <div className="media-card-details">
        <span className="media-card-size">
          {formatFileSize(item?.size || 0)}
        </span>
        {item?.metadata?.episode && (
          <span className="media-card-episode">
            {item.metadata.season ? `S${item.metadata.season}` : ''}
            {item.metadata.episode ? `E${item.metadata.episode}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export default MediaCard;
