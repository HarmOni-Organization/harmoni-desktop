import React from 'react';

interface EmptyLibraryProps {
  onAddFolder: () => void;
}

function EmptyLibrary({ onAddFolder }: EmptyLibraryProps) {
  return (
    <div className="empty-library">
      <div className="empty-library-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>
      <h2 className="empty-library-title">Your Library is Empty</h2>
      <p className="empty-library-description">
        Create a collection for your anime, TV shows, or movies to get started.
        HarmOni will scan your files and organize them automatically based on
        your collection settings.
      </p>
      <div className="empty-library-tips">
        <h3>Tips for best results:</h3>
        <ul>
          <li>
            Create separate collections by media type (Anime, TV Shows, Movies)
          </li>
          <li>Organize your media into folders by season for TV shows</li>
          <li>Keep episode files in their respective season folders</li>
          <li>Use standard naming conventions (ShowName.S01E01.mp4)</li>
        </ul>
      </div>
      <button
        className="btn btn-primary"
        onClick={onAddFolder}
        type="button"
        aria-label="Create new collection"
      >
        Create Collection
      </button>
    </div>
  );
}

export default EmptyLibrary;
