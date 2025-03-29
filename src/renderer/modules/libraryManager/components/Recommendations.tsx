import React, { useEffect, useState } from 'react';
import { Clock, PlayCircle, ThumbsUp, TrendingUp } from 'lucide-react';

import { IPC_CHANNELS } from '../constants';
import type { MediaItem } from '../types';

interface RecommendationsProps {
  onPlayMedia: (mediaId: string) => void;
  onViewDetails: (mediaId: string) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  onPlayMedia,
  onViewDetails,
}) => {
  const [continueWatching, setContinueWatching] = useState<MediaItem[]>([]);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);

        // Simulate API calls to get different recommendation types
        // In a real implementation, these would be separate calls to the backend
        const libraryData = await window.electron.ipcRenderer.invoke(
          IPC_CHANNELS.GET_LIBRARY,
        );

        if (libraryData) {
          // For now, we'll just simulate different recommendation types
          // In the actual implementation, these would come from different endpoints

          // Continue watching: Recently watched but not completed
          const continueItems = libraryData.recentlyWatched
            .filter(
              (item: MediaItem) =>
                !item.watched && item.watchProgress && item.watchProgress > 0,
            )
            .slice(0, 10);

          setContinueWatching(continueItems);

          // Recently added
          setRecentlyAdded(libraryData.recentlyAdded.slice(0, 10));

          // Recommendations based on watch history
          // For now, we're just getting some random items from the library
          // In a real implementation, this would use an algorithm to find similar content
          const allMedia: MediaItem[] = [];

          const extractMedia = (folder: any) => {
            allMedia.push(...folder.files);
            folder.subfolders.forEach(extractMedia);
          };

          libraryData.folders.forEach(extractMedia);

          // Randomly select some recommendations
          // In a real implementation, this would be based on user preferences and viewing history
          const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
          setRecommendations(shuffled.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="recommendations-loading">
        <div className="loading-spinner" />
        <p>Personalizing your recommendations...</p>
      </div>
    );
  }

  return (
    <div className="recommendations">
      <h2>Personalized Recommendations</h2>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <section className="recommendation-section">
          <h3>
            <Clock size={18} />
            Continue Watching
          </h3>

          <div className="media-carousel">
            {continueWatching.map((item) => (
              <div key={item.id} className="media-card">
                <div className="media-thumbnail">
                  {item.metadata?.coverImage ? (
                    <img
                      src={item.metadata.coverImage}
                      alt={item.metadata?.title || item.name}
                    />
                  ) : (
                    <div className="default-thumbnail">
                      {(item.metadata?.title || item.name).charAt(0)}
                    </div>
                  )}

                  {item.watchProgress !== undefined && item.duration && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(item.watchProgress / item.duration) * 100}%`,
                        }}
                      />
                    </div>
                  )}

                  <div className="media-actions">
                    <button
                      className="action-button play-button"
                      onClick={() => onPlayMedia(item.id)}
                      type="button"
                    >
                      <PlayCircle size={24} />
                    </button>
                  </div>
                </div>

                <div
                  className="media-info"
                  onClick={() => onViewDetails(item.id)}
                >
                  <h4>{item.metadata?.title || item.name}</h4>

                  <div className="media-meta">
                    {item.watchProgress !== undefined && item.duration && (
                      <span className="time-remaining">
                        {Math.floor((item.duration - item.watchProgress) / 60)}{' '}
                        min left
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended for You Section */}
      {recommendations.length > 0 && (
        <section className="recommendation-section">
          <h3>
            <ThumbsUp size={18} />
            Recommended for You
          </h3>

          <div className="media-carousel">
            {recommendations.map((item) => (
              <div key={item.id} className="media-card">
                <div className="media-thumbnail">
                  {item.metadata?.coverImage ? (
                    <img
                      src={item.metadata.coverImage}
                      alt={item.metadata?.title || item.name}
                    />
                  ) : (
                    <div className="default-thumbnail">
                      {(item.metadata?.title || item.name).charAt(0)}
                    </div>
                  )}

                  <div className="media-actions">
                    <button
                      className="action-button play-button"
                      onClick={() => onPlayMedia(item.id)}
                      type="button"
                    >
                      <PlayCircle size={24} />
                    </button>
                  </div>
                </div>

                <div
                  className="media-info"
                  onClick={() => onViewDetails(item.id)}
                >
                  <h4>{item.metadata?.title || item.name}</h4>

                  <div className="media-meta">
                    {item.metadata?.releaseDate && (
                      <span className="release-year">
                        {new Date(item.metadata.releaseDate).getFullYear()}
                      </span>
                    )}

                    {item.contentType && (
                      <span className="content-type">
                        {item.contentType.charAt(0).toUpperCase() +
                          item.contentType.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      {recentlyAdded.length > 0 && (
        <section className="recommendation-section">
          <h3>
            <TrendingUp size={18} />
            Recently Added
          </h3>

          <div className="media-carousel">
            {recentlyAdded.map((item) => (
              <div key={item.id} className="media-card">
                <div className="media-thumbnail">
                  {item.metadata?.coverImage ? (
                    <img
                      src={item.metadata.coverImage}
                      alt={item.metadata?.title || item.name}
                    />
                  ) : (
                    <div className="default-thumbnail">
                      {(item.metadata?.title || item.name).charAt(0)}
                    </div>
                  )}

                  <div className="media-actions">
                    <button
                      className="action-button play-button"
                      onClick={() => onPlayMedia(item.id)}
                      type="button"
                    >
                      <PlayCircle size={24} />
                    </button>
                  </div>
                </div>

                <div
                  className="media-info"
                  onClick={() => onViewDetails(item.id)}
                >
                  <h4>{item.metadata?.title || item.name}</h4>

                  <div className="media-meta">
                    {item.metadata?.releaseDate && (
                      <span className="release-year">
                        {new Date(item.metadata.releaseDate).getFullYear()}
                      </span>
                    )}

                    {item.contentType && (
                      <span className="content-type">
                        {item.contentType.charAt(0).toUpperCase() +
                          item.contentType.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {continueWatching.length === 0 &&
        recommendations.length === 0 &&
        recentlyAdded.length === 0 && (
          <div className="no-recommendations">
            <p>
              As you watch more media, we'll provide personalized
              recommendations for you.
            </p>
            <p>Start watching to build your profile!</p>
          </div>
        )}
    </div>
  );
};

export default Recommendations;
