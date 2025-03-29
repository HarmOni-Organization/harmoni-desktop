import React, { useState } from 'react';

import { COMMON_GENRES, RESOLUTION_OPTIONS, SORT_OPTIONS } from '../constants';

interface FilterOptions {
  genre: string[];
  resolution: string[];
  watched: boolean | null;
  collection: string[];
}

interface LibraryHeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sortId: string) => void;
  onScanLibrary: () => void;
  onAddCollection: () => void;
  collectionList?: string[]; // List of available collections
}

function LibraryHeader({
  onSearch,
  onFilterChange,
  onSortChange,
  onScanLibrary,
  onAddCollection,
  collectionList = [],
}: LibraryHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    genre: [],
    resolution: [],
    watched: null,
    collection: [],
  });
  const [sortOption, setSortOption] = useState('date_added_desc');

  // Extract unique collection names
  const uniqueCollections = React.useMemo(() => {
    return [...new Set(collectionList)].sort();
  }, [collectionList]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortId = e.target.value;
    setSortOption(sortId);
    onSortChange(sortId);
  };

  const handleFilterChange = (
    type: keyof FilterOptions,
    value: string[] | boolean | null,
  ) => {
    const updatedFilters = { ...filters, [type]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      genre: [],
      resolution: [],
      watched: null,
      collection: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="library-header">
      <div className="library-search">
        <input
          type="text"
          placeholder="Search your library..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search library"
        />
      </div>

      <div className="library-actions">
        <button
          className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
          onClick={toggleFilters}
          type="button"
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          <span className="filter-icon">
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
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </span>
          {showFilters ? 'Hide Filters' : 'Filters'}
        </button>

        <select
          value={sortOption}
          onChange={handleSortChange}
          className="sort-select"
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <button
          className="btn btn-secondary"
          onClick={onScanLibrary}
          type="button"
        >
          <span className="scan-icon">
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
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </span>
          Scan Library
        </button>

        <button className="btn btn-primary" onClick={onAddCollection} type="button">
          <span className="add-icon">
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
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </span>
          Create Collection
        </button>
      </div>

      {showFilters && (
        <div id="filter-panel" className="library-filters-panel">
          <div className="filter-section">
            <h3>Genres</h3>
            <div className="filter-options">
              {COMMON_GENRES.map((genre) => (
                <label
                  key={genre}
                  className="filter-checkbox"
                  htmlFor={`genre-${genre}`}
                >
                  <input
                    type="checkbox"
                    id={`genre-${genre}`}
                    checked={filters.genre.includes(genre)}
                    onChange={(e) => {
                      const newGenres = e.target.checked
                        ? [...filters.genre, genre]
                        : filters.genre.filter((g) => g !== genre);
                      handleFilterChange('genre', newGenres);
                    }}
                    aria-label={`Filter by ${genre} genre`}
                  />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {uniqueCollections.length > 0 && (
            <div className="filter-section">
              <h3>Collections</h3>
              <div className="filter-options">
                {uniqueCollections.map((collection) => (
                  <label
                    key={collection}
                    className="filter-checkbox"
                    htmlFor={`collection-${collection}`}
                  >
                    <input
                      type="checkbox"
                      id={`collection-${collection}`}
                      checked={filters.collection.includes(collection)}
                      onChange={(e) => {
                        const newCollections = e.target.checked
                          ? [...filters.collection, collection]
                          : filters.collection.filter((c) => c !== collection);
                        handleFilterChange('collection', newCollections);
                      }}
                      aria-label={`Filter by ${collection} collection`}
                    />
                    <span>{collection}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="filter-section">
            <h3>Resolution</h3>
            <div className="filter-options">
              {RESOLUTION_OPTIONS.map((resolution) => (
                <label
                  key={resolution.id}
                  className="filter-checkbox"
                  htmlFor={`resolution-${resolution.id}`}
                >
                  <input
                    type="checkbox"
                    id={`resolution-${resolution.id}`}
                    checked={filters.resolution.includes(resolution.id)}
                    onChange={(e) => {
                      const newResolutions = e.target.checked
                        ? [...filters.resolution, resolution.id]
                        : filters.resolution.filter((r) => r !== resolution.id);
                      handleFilterChange('resolution', newResolutions);
                    }}
                    aria-label={`Filter by ${resolution.name} resolution`}
                  />
                  <span>{resolution.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Watch Status</h3>
            <div className="filter-options filter-options-radio">
              <label className="filter-radio" htmlFor="watched-yes">
                <input
                  type="radio"
                  name="watched"
                  id="watched-yes"
                  checked={filters.watched === true}
                  onChange={() => handleFilterChange('watched', true)}
                  aria-label="Filter by watched status"
                />
                <span>Watched</span>
              </label>
              <label className="filter-radio" htmlFor="watched-no">
                <input
                  type="radio"
                  name="watched"
                  id="watched-no"
                  checked={filters.watched === false}
                  onChange={() => handleFilterChange('watched', false)}
                  aria-label="Filter by unwatched status"
                />
                <span>Unwatched</span>
              </label>
              <label className="filter-radio" htmlFor="watched-all">
                <input
                  type="radio"
                  name="watched"
                  id="watched-all"
                  checked={filters.watched === null}
                  onChange={() => handleFilterChange('watched', null)}
                  aria-label="Show all watch statuses"
                />
                <span>All</span>
              </label>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={clearFilters}
            type="button"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default LibraryHeader;
