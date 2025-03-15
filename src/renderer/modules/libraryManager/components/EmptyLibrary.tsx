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
        Add a folder containing your anime, TV shows, or movies to get started.
        HarmOni will scan your files and organize them automatically based on
        folder structure.
      </p>
      <div className="empty-library-tips">
        <h3>Tips for best results:</h3>
        <ul>
          <li>
            Organize your media into folders by type (Anime, TV Shows, Movies)
          </li>
          <li>Use season folders for TV shows (e.g., Season 1, Season 2)</li>
          <li>Keep episode files in their respective season folders</li>
          <li>Use standard naming conventions (ShowName.S01E01.mp4)</li>
        </ul>
      </div>
      <button
        className="btn btn-primary"
        onClick={onAddFolder}
        type="button"
        aria-label="Add folder to library"
      >
        Add Folder
      </button>
    </div>
  );
}

export default EmptyLibrary;
