import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Edit,
  Heart,
  List,
  MessageCircle,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react';

import { IPC_CHANNELS } from '../constants';
import type { MediaItem, UserAnnotation } from '../types';

interface MediaDetailsPageProps {
  media: MediaItem;
  onBack: () => void;
  onPlay: (mediaId: string) => void;
  onWatchStatusUpdate: (mediaId: string, watched: boolean) => void;
  onAddToWishlist?: () => void;
}

const MediaDetailsPage: React.FC<MediaDetailsPageProps> = ({
  media,
  onBack,
  onPlay,
  onWatchStatusUpdate,
  onAddToWishlist,
}) => {
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isRefreshingMetadata, setIsRefreshingMetadata] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'annotations'>('info');
  const [annotations, setAnnotations] = useState<UserAnnotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState({
    text: '',
    timestamp: 0,
  });
  const [showAddAnnotation, setShowAddAnnotation] = useState(false);

  const handleRefreshMetadata = async () => {
    try {
      setIsRefreshingMetadata(true);
      await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.FETCH_METADATA,
        media.id,
      );
      setIsRefreshingMetadata(false);
    } catch (error) {
      console.error('Failed to refresh metadata:', error);
      setIsRefreshingMetadata(false);
    }
  };

  const handleCreateAnnotation = async () => {
    if (!newAnnotation.text.trim()) return;

    try {
      const annotation = await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.CREATE_ANNOTATION,
        {
          mediaId: media.id,
          text: newAnnotation.text,
          timestamp: newAnnotation.timestamp,
          visibility: 'private',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      );

      if (annotation) {
        setAnnotations([...annotations, annotation]);
        setNewAnnotation({ text: '', timestamp: 0 });
        setShowAddAnnotation(false);
      }
    } catch (error) {
      console.error('Failed to create annotation:', error);
    }
  };

  const loadAnnotations = async () => {
    try {
      const mediaAnnotations = await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.GET_ANNOTATIONS,
        media.id,
      );

      if (mediaAnnotations) {
        setAnnotations(mediaAnnotations);
      }
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="media-details-page">
      <div className="details-header">
        <button className="btn btn-secondary" onClick={onBack} type="button">
          Back
        </button>
        <h2>{media.metadata?.title || media.name}</h2>
      </div>

      <div className="media-hero">
        {media.metadata?.bannerImage ? (
          <div
            className="banner-image"
            style={{ backgroundImage: `url(${media.metadata.bannerImage})` }}
          >
            {!media.metadata?.bannerImage && media.metadata?.coverImage && (
              <img
                src={media.metadata.coverImage}
                alt={media.metadata.title || media.name}
                className="cover-image-fallback"
              />
            )}
            <div className="banner-overlay" />
          </div>
        ) : (
          <div className="banner-placeholder">
            {media.metadata?.coverImage ? (
              <img
                src={media.metadata.coverImage}
                alt={media.metadata.title || media.name}
                className="cover-image"
              />
            ) : (
              <div className="cover-placeholder">{media.name.charAt(0)}</div>
            )}
          </div>
        )}

        <div className="media-quick-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => onPlay(media.id)}
            type="button"
          >
            <Play size={20} />
            Play
          </button>

          <button
            className={`btn ${media.watched ? 'btn-success' : 'btn-secondary'} btn-icon`}
            onClick={() => onWatchStatusUpdate(media.id, !media.watched)}
            title={media.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
            type="button"
          >
            {media.watched ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {media.watched ? 'Watched' : 'Unwatched'}
          </button>

          {media.contentType === 'movie' && onAddToWishlist && (
            <button
              className="btn btn-secondary btn-icon"
              onClick={onAddToWishlist}
              title="Add to Wishlist"
              type="button"
            >
              <Heart size={16} />
              Wishlist
            </button>
          )}
        </div>
      </div>

      <div className="details-tabs">
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
          type="button"
        >
          <List size={16} />
          Information
        </button>
        <button
          className={`tab-button ${activeTab === 'annotations' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('annotations');
            loadAnnotations();
          }}
          type="button"
        >
          <MessageCircle size={16} />
          Annotations
        </button>
      </div>

      <div className="details-content">
        {activeTab === 'info' && (
          <div className="media-info">
            {/* General Info */}
            <div className="info-section">
              <div className="info-header">
                <h3>General Information</h3>
                <div className="info-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsEditingMetadata(true)}
                    type="button"
                  >
                    <Edit size={14} />
                    Edit
                  </button>

                  <button
                    className={`btn btn-secondary btn-sm ${isRefreshingMetadata ? 'loading' : ''}`}
                    onClick={handleRefreshMetadata}
                    disabled={isRefreshingMetadata}
                    type="button"
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                </div>
              </div>

              {!isEditingMetadata ? (
                <div className="info-grid">
                  {media.metadata?.originalTitle && (
                    <div className="info-item">
                      <span className="info-label">Original Title</span>
                      <span className="info-value">
                        {media.metadata.originalTitle}
                      </span>
                    </div>
                  )}

                  {media.metadata?.releaseDate && (
                    <div className="info-item">
                      <span className="info-label">Release Date</span>
                      <span className="info-value">
                        {media.metadata.releaseDate}
                      </span>
                    </div>
                  )}

                  {media.metadata?.genres &&
                    media.metadata.genres.length > 0 && (
                      <div className="info-item">
                        <span className="info-label">Genres</span>
                        <div className="info-value genres-list">
                          {media.metadata.genres.map((genre) => (
                            <span key={genre} className="genre-tag">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {media.metadata?.rating && (
                    <div className="info-item">
                      <span className="info-label">Rating</span>
                      <span className="info-value">
                        {media.metadata.rating}
                      </span>
                    </div>
                  )}

                  {media.metadata?.duration && (
                    <div className="info-item">
                      <span className="info-label">Duration</span>
                      <span className="info-value">
                        {Math.floor(media.metadata.duration / 60)}min
                      </span>
                    </div>
                  )}

                  {media.contentType === 'tvshow' && (
                    <>
                      {media.metadata?.season && (
                        <div className="info-item">
                          <span className="info-label">Season</span>
                          <span className="info-value">
                            {media.metadata.season}
                          </span>
                        </div>
                      )}

                      {media.metadata?.episode && (
                        <div className="info-item">
                          <span className="info-label">Episode</span>
                          <span className="info-value">
                            {media.metadata.episode}
                            {media.metadata?.totalEpisodes &&
                              ` of ${media.metadata.totalEpisodes}`}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {media.contentType === 'music' && (
                    <>
                      {media.metadata?.artist && (
                        <div className="info-item">
                          <span className="info-label">Artist</span>
                          <span className="info-value">
                            {media.metadata.artist}
                          </span>
                        </div>
                      )}

                      {media.metadata?.album && (
                        <div className="info-item">
                          <span className="info-label">Album</span>
                          <span className="info-value">
                            {media.metadata.album}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="metadata-edit-form">
                  {/* Metadata editing form would go here */}
                  <div className="form-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setIsEditingMetadata(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button className="btn btn-primary" type="button">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Synopsis */}
            {media.metadata?.synopsis && (
              <div className="info-section">
                <h3>Synopsis</h3>
                <p className="synopsis-text">{media.metadata.synopsis}</p>
              </div>
            )}

            {/* Technical Details */}
            <div className="info-section">
              <h3>Technical Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Format</span>
                  <span className="info-value">{media.format}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Size</span>
                  <span className="info-value">
                    {Math.round(media.size / (1024 * 1024))} MB
                  </span>
                </div>

                {media.resolution && (
                  <div className="info-item">
                    <span className="info-label">Resolution</span>
                    <span className="info-value">{media.resolution}</span>
                  </div>
                )}

                <div className="info-item">
                  <span className="info-label">Path</span>
                  <span className="info-value path-value">{media.path}</span>
                </div>
              </div>
            </div>

            {/* Trailer */}
            {media.metadata?.trailer && (
              <div className="info-section">
                <h3>Trailer</h3>
                <div className="trailer-embed">
                  <iframe
                    src={media.metadata.trailer}
                    title="Trailer"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'annotations' && (
          <div className="annotations-section">
            <div className="annotations-header">
              <h3>Annotations & Notes</h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddAnnotation(true)}
                type="button"
              >
                Add Annotation
              </button>
            </div>

            {showAddAnnotation && (
              <div className="add-annotation-form">
                <div className="form-group">
                  <label>
                    Timestamp:
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={newAnnotation.timestamp}
                      onChange={(e) =>
                        setNewAnnotation({
                          ...newAnnotation,
                          timestamp: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    Note:
                    <textarea
                      value={newAnnotation.text}
                      onChange={(e) =>
                        setNewAnnotation({
                          ...newAnnotation,
                          text: e.target.value,
                        })
                      }
                      placeholder="Add your notes or thoughts..."
                      rows={4}
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAddAnnotation(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateAnnotation}
                    type="button"
                  >
                    Save Annotation
                  </button>
                </div>
              </div>
            )}

            {annotations.length > 0 ? (
              <div className="annotations-list">
                {annotations.map((annotation) => (
                  <div key={annotation.id} className="annotation-item">
                    <div className="annotation-header">
                      <div className="annotation-timestamp">
                        <Clock size={14} />
                        {formatTime(annotation.timestamp)}
                      </div>
                      <div className="annotation-date">
                        {new Date(annotation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="annotation-content">{annotation.text}</div>
                    {annotation.attachments &&
                      annotation.attachments.length > 0 && (
                        <div className="annotation-attachments">
                          {annotation.attachments.map((attachment, index) => (
                            <div key={index} className="attachment-item">
                              {attachment.type === 'image' && (
                                <img src={attachment.url} alt="Attachment" />
                              )}
                              {attachment.type === 'gif' && (
                                <img src={attachment.url} alt="Animated GIF" />
                              )}
                              {attachment.type === 'link' && (
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {attachment.url}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    <div className="annotation-actions">
                      <button className="btn btn-text" type="button">Edit</button>
                      <button className="btn btn-text btn-danger" type="button">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-annotations">
                <p>
                  No annotations added yet. Add your first annotation to keep
                  notes about this media.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaDetailsPage;
