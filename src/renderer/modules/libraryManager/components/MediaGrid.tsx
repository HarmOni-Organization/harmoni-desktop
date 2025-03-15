import React, { useMemo } from 'react';

import MediaCard from './MediaCard';
import type { MediaItem, MediaLibrary } from '../types';

interface MediaGridProps {
  library: MediaLibrary;
  searchQuery?: string;
  filters?: {
    genre?: string[];
    resolution?: string[];
    watched?: boolean | null;
    folder?: string[];
  };
  sortOption?: string;
  onPlayMedia: (mediaId: string) => void;
  onWatchStatusUpdate: (mediaId: string, watched: boolean) => void;
}

function MediaGrid({
  library,
  searchQuery = '',
  filters = {},
  sortOption = 'date_added_desc',
  onPlayMedia,
  onWatchStatusUpdate,
}: MediaGridProps) {
  // Flatten the library structure to get all media items
  const allMediaItems = useMemo(() => {
    if (!library || !library.folders) return [];
    const items: MediaItem[] = [];

    const collectMediaItems = (folder: any) => {
      if (!folder) return;

      // Add all files from this folder
      if (Array.isArray(folder.files)) {
        items.push(...folder.files.filter((file) => file && file.id));
      }

      // Recursively process subfolders
      if (Array.isArray(folder.subfolders)) {
        folder.subfolders.forEach((subfolder: any) => {
          if (subfolder) collectMediaItems(subfolder);
        });
      }
    };

    // Process all root folders
    if (Array.isArray(library.folders)) {
      library.folders.forEach(collectMediaItems);
    }

    return items;
  }, [library]);

  // Filter media items based on search query and filters
  const filteredItems = useMemo(() => {
    if (!allMediaItems.length) return [];

    return allMediaItems.filter((item) => {
      if (!item) return false;

      // Search query filter
      if (
        searchQuery &&
        !item.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.metadata?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Genre filter
      if (filters.genre && filters.genre.length > 0) {
        if (!item.metadata?.genres) return false;

        const hasMatchingGenre = filters.genre.some((genre: string) =>
          item.metadata.genres.includes(genre),
        );

        if (!hasMatchingGenre) return false;
      }

      // Resolution filter
      if (filters.resolution && filters.resolution.length > 0) {
        if (!item.resolution) return false;

        const hasMatchingResolution = filters.resolution.includes(
          item.resolution,
        );
        if (!hasMatchingResolution) return false;
      }

      // Watch status filter
      if (filters.watched !== null && filters.watched !== undefined) {
        if (item.watched !== filters.watched) return false;
      }

      return true;
    });
  }, [allMediaItems, searchQuery, filters]);

  // Sort the filtered items
  const sortedItems = useMemo(() => {
    if (!filteredItems.length) return [];

    const [field, order] = sortOption.split('_');

    return [...filteredItems].sort((a, b) => {
      if (!a || !b) return 0;

      let valueA;
      let valueB;

      switch (field) {
        case 'title':
          valueA = a.metadata?.title || a.name || '';
          valueB = b.metadata?.title || b.name || '';
          break;
        case 'dateAdded':
          valueA = a.lastModified || 0;
          valueB = b.lastModified || 0;
          break;
        case 'releaseDate':
          valueA = a.metadata?.releaseDate
            ? new Date(a.metadata.releaseDate).getTime()
            : 0;
          valueB = b.metadata?.releaseDate
            ? new Date(b.metadata.releaseDate).getTime()
            : 0;
          break;
        case 'rating':
          valueA = a.metadata?.rating || 0;
          valueB = b.metadata?.rating || 0;
          break;
        default:
          valueA = a.lastModified || 0;
          valueB = b.lastModified || 0;
      }

      if (order === 'asc') {
        return valueA > valueB ? 1 : -1;
      }
      return valueA < valueB ? 1 : -1;
    });
  }, [filteredItems, sortOption]);

  // Group media by folder when no search or filters are applied
  const groupedByFolder = useMemo(() => {
    if (
      searchQuery ||
      Object.keys(filters).some((key) => {
        if (Array.isArray(filters[key]) && filters[key].length > 0) return true;
        if (filters[key] !== null && filters[key] !== undefined) return true;
        return false;
      })
    ) {
      return null;
    }

    if (!allMediaItems.length) return null;

    const groups: Record<string, { name: string; items: MediaItem[] }> = {};

    // Group by parent folder name
    allMediaItems.forEach((item) => {
      if (!item || !item.path) return;

      const pathParts = item.path.split('/');
      const folderName =
        pathParts.length > 2 ? pathParts[pathParts.length - 2] : 'Other';

      if (!groups[folderName]) {
        groups[folderName] = {
          name: folderName,
          items: [],
        };
      }

      groups[folderName].items.push(item);
    });

    // Sort folders by name
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [allMediaItems, searchQuery, filters]);

  // Show recently added items if no search or filters are applied
  const recentlyAdded = useMemo(() => {
    if (
      searchQuery ||
      Object.keys(filters).some((key) => {
        if (Array.isArray(filters[key]) && filters[key].length > 0) return true;
        if (filters[key] !== null && filters[key] !== undefined) return true;
        return false;
      })
    ) {
      return null;
    }

    if (!library.recentlyAdded || !Array.isArray(library.recentlyAdded)) {
      return null;
    }

    return library.recentlyAdded.filter((item) => item && item.id).slice(0, 10);
  }, [library.recentlyAdded, searchQuery, filters]);

  // Show recently watched items if no search or filters are applied
  const recentlyWatched = useMemo(() => {
    if (
      searchQuery ||
      Object.keys(filters).some((key) => {
        if (Array.isArray(filters[key]) && filters[key].length > 0) return true;
        if (filters[key] !== null && filters[key] !== undefined) return true;
        return false;
      })
    ) {
      return null;
    }

    if (!library.recentlyWatched || !Array.isArray(library.recentlyWatched)) {
      return null;
    }

    return library.recentlyWatched
      .filter((item) => item && item.id)
      .slice(0, 10);
  }, [library.recentlyWatched, searchQuery, filters]);

  // Group media by content type (Anime, TV Shows, Movies)
  const groupedByType = useMemo(() => {
    if (!sortedItems.length) return null;

    const groups = {
      anime: { name: 'Anime', items: [] as MediaItem[] },
      tvShows: { name: 'TV Shows', items: [] as MediaItem[] },
      movies: { name: 'Movies', items: [] as MediaItem[] },
      other: { name: 'Other', items: [] as MediaItem[] },
    };

    sortedItems.forEach((item) => {
      if (!item || !item.path) {
        groups.other.items.push(item);
        return;
      }

      const folderName =
        item.path.split('/').slice(-2, -1)[0]?.toLowerCase() || '';
      const hasAnilistId = !!item.metadata?.anilistId;

      if (hasAnilistId || folderName.includes('anime')) {
        groups.anime.items.push(item);
      } else if (
        folderName.includes('tv') ||
        folderName.includes('series') ||
        folderName.includes('show')
      ) {
        groups.tvShows.items.push(item);
      } else if (folderName.includes('movie') || folderName.includes('film')) {
        groups.movies.items.push(item);
      } else {
        groups.other.items.push(item);
      }
    });

    // Only return groups that have items
    return Object.values(groups).filter((group) => group.items.length > 0);
  }, [sortedItems]);

  if (!allMediaItems.length) {
    return (
      <div className="library-empty">
        <p>No media found in your library.</p>
        <p>Try adding folders or scanning your library again.</p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="library-empty">
        <p>No results match your search criteria.</p>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="library-grid-container">
      {/* Recently Watched Section */}
      {recentlyWatched && recentlyWatched.length > 0 && (
        <div className="library-section">
          <h2 className="section-title">Continue Watching</h2>
          <div className="media-grid">
            {recentlyWatched.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onPlay={() => onPlayMedia(item.id)}
                onWatchStatusUpdate={(watched) =>
                  onWatchStatusUpdate(item.id, watched)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently Added Section */}
      {recentlyAdded && recentlyAdded.length > 0 && (
        <div className="library-section">
          <h2 className="section-title">Recently Added</h2>
          <div className="media-grid">
            {recentlyAdded.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onPlay={() => onPlayMedia(item.id)}
                onWatchStatusUpdate={(watched) =>
                  onWatchStatusUpdate(item.id, watched)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Folder-based organization */}
      {groupedByFolder && groupedByFolder.length > 0 && (
        <>
          {groupedByFolder.map((group) => (
            <div key={group.name} className="library-section">
              <h2 className="section-title">{group.name}</h2>
              <div className="media-grid">
                {group.items.slice(0, 12).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onPlay={() => onPlayMedia(item.id)}
                    onWatchStatusUpdate={(watched) =>
                      onWatchStatusUpdate(item.id, watched)
                    }
                  />
                ))}
              </div>
              {group.items.length > 12 && (
                <div className="view-more-link">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      /* TODO: Implement view all */
                    }}
                  >
                    View all {group.items.length} items
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Content type organization for search results */}
      {groupedByType && searchQuery && (
        <>
          <h2 className="section-title">
            Search Results ({sortedItems.length})
          </h2>

          {groupedByType.map((group) => (
            <div key={group.name} className="library-section">
              <h3 className="subsection-title">{group.name}</h3>
              <div className="media-grid">
                {group.items.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onPlay={() => onPlayMedia(item.id)}
                    onWatchStatusUpdate={(watched) =>
                      onWatchStatusUpdate(item.id, watched)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* All Media (when not showing folder-based or type-based organization) */}
      {!groupedByFolder && !groupedByType && (
        <div className="library-section">
          {searchQuery ||
          Object.keys(filters).some((key) => {
            if (Array.isArray(filters[key]) && filters[key].length > 0)
              return true;
            if (filters[key] !== null && filters[key] !== undefined)
              return true;
            return false;
          }) ? (
            <h2 className="section-title">
              Search Results ({sortedItems.length})
            </h2>
          ) : (
            <h2 className="section-title">All Media</h2>
          )}

          <div className="media-grid">
            {sortedItems.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onPlay={() => onPlayMedia(item.id)}
                onWatchStatusUpdate={(watched) =>
                  onWatchStatusUpdate(item.id, watched)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaGrid;
