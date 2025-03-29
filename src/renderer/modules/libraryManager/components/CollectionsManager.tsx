import React, { useEffect, useState } from 'react';
import {
  Clock,
  Edit2,
  Folder,
  PlusCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';

import {
  CONTENT_TYPES,
  IPC_CHANNELS,
  METADATA_SOURCES,
  SCHEDULE_OPTIONS,
} from '../constants';
import type { Collection } from '../types';

interface CollectionsManagerProps {
  onCollectionSelect: (collectionId: string) => void;
}

interface CollectionFormModalProps {
  onClose: () => void;
  onSubmit: (collection: Collection) => void;
  collection?: Collection;
}

function CollectionFormModal({
  onClose,
  onSubmit,
  collection,
}: CollectionFormModalProps) {
  const [name, setName] = useState(collection?.name || '');
  const [contentType, setContentType] = useState<string>(
    collection?.contentType || CONTENT_TYPES[0].id,
  );
  const [directories, setDirectories] = useState<string[]>(
    collection?.directories || [],
  );
  const [autoScan, setAutoScan] = useState(collection?.autoScan ?? true);
  const [scanSchedule, setScanSchedule] = useState<string>(
    collection?.scanSchedule || SCHEDULE_OPTIONS[0].id,
  );
  const [metadataProvider, setMetadataProvider] = useState<
    'tmdb' | 'anilist' | 'mal' | 'imdb' | 'musicbrainz' | 'tvmaze' | ''
  >(collection?.metadataProvider || '');

  const handleAddDirectory = async () => {
    try {
      const selectedFolder = await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.SELECT_FOLDER,
      );

      if (selectedFolder && !directories.includes(selectedFolder)) {
        setDirectories([...directories, selectedFolder]);
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  };

  const handleRemoveDirectory = (dir: string) => {
    setDirectories(directories.filter((d) => d !== dir));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || directories.length === 0) {
      return; // Simple validation
    }

    const collectionData = {
      ...(collection || { id: '', createdAt: 0, updatedAt: 0 }),
      name,
      contentType: contentType as 'movie' | 'tvshow' | 'anime' | 'music',
      directories,
      autoScan,
      scanSchedule: autoScan
        ? (scanSchedule as 'daily' | 'weekly' | 'monthly')
        : undefined,
      metadataProvider: metadataProvider || undefined,
    };

    onSubmit(collectionData);
  };

  // Filter metadata providers based on selected content type
  const filteredProviders = METADATA_SOURCES.filter((source) =>
    source.contentTypes.includes(
      contentType as 'movie' | 'tvshow' | 'anime' | 'music',
    ),
  );

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{collection ? 'Edit Collection' : 'Create New Collection'}</h3>
          <button className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="collection-name">
              Collection Name
              <input
                id="collection-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My Movies, Anime Collection"
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="content-type">
              Content Type
              <select
                id="content-type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="directories-section">
              Directories
              <div className="directories-list" id="directories-section">
                {directories.length > 0 ? (
                  <ul>
                    {directories.map((dir) => (
                      <li key={dir}>
                        <span className="directory-path">{dir}</span>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleRemoveDirectory(dir)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="directories-empty">No directories added</p>
                )}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddDirectory}
                >
                  <Folder size={14} />
                  Add Directory
                </button>
              </div>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="auto-scan">
              <input
                id="auto-scan"
                type="checkbox"
                checked={autoScan}
                onChange={(e) => setAutoScan(e.target.checked)}
              />
              Auto-scan for changes
            </label>
          </div>

          {autoScan && (
            <div className="form-group">
              <label htmlFor="scan-schedule">
                Scan Schedule
                <select
                  id="scan-schedule"
                  value={scanSchedule}
                  onChange={(e) => setScanSchedule(e.target.value)}
                >
                  {SCHEDULE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="metadata-provider">
              Preferred Metadata Provider
              <select
                id="metadata-provider"
                value={metadataProvider}
                onChange={(e) => setMetadataProvider(
                  e.target.value as
                    | 'tmdb'
                    | 'anilist'
                    | 'mal'
                    | 'imdb'
                    | 'musicbrainz'
                    | 'tvmaze'
                    | '',
                )}
              >
                <option value="">Auto (Recommended)</option>
                {filteredProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <small>
                The system will automatically choose the best provider if none
                is selected.
              </small>
            </label>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {collection ? 'Update Collection' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CollectionsManager({ onCollectionSelect }: CollectionsManagerProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setIsLoading(true);
        const collectionsData = await window.electron.ipcRenderer.invoke(
          IPC_CHANNELS.GET_COLLECTIONS,
        );

        if (collectionsData) {
          setCollections(collectionsData);
        }
      } catch (error) {
        console.error('Failed to load collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);

  const handleCreateCollection = async (
    collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    try {
      const newCollection = await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.CREATE_COLLECTION,
        {
          ...collectionData,
          id: `collection-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      );

      if (newCollection) {
        setCollections([...collections, newCollection]);
      }
      setShowNewCollectionModal(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleUpdateCollection = async (collectionData: Collection) => {
    try {
      const updatedCollection = await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.UPDATE_COLLECTION,
        {
          ...collectionData,
          updatedAt: Date.now(),
        },
      );

      if (updatedCollection) {
        setCollections(
          collections.map((c) =>
            c.id === updatedCollection.id ? updatedCollection : c,
          ),
        );
      }
      setEditingCollection(null);
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this collection? This will not delete the files.',
      )
    ) {
      try {
        await window.electron.ipcRenderer.invoke(
          IPC_CHANNELS.DELETE_COLLECTION,
          collectionId,
        );

        setCollections(collections.filter((c) => c.id !== collectionId));
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    }
  };

  const handleScanCollection = async (collectionId: string) => {
    try {
      await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.SCAN_LIBRARY,
        collectionId,
      );
    } catch (error) {
      console.error('Failed to scan collection:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="collections-loading">
        <div className="loading-spinner" />
        <p>Loading collections...</p>
      </div>
    );
  }

  return (
    <div className="collections-manager">
      <div className="collections-header">
        <h2>Collections</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowNewCollectionModal(true)}
          type="button"
        >
          <PlusCircle size={16} />
          Create Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="collections-empty">
          <p>
            No collections yet. Create your first collection to get started.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowNewCollectionModal(true)}
            type="button"
          >
            <PlusCircle size={16} />
            Create Collection
          </button>
        </div>
      ) : (
        <div className="collections-grid">
          {collections.map((collection) => (
            <div key={collection.id} className="collection-card">
              <div className="collection-header">
                <h3>{collection.name}</h3>
                <div className="collection-type">
                  {
                    CONTENT_TYPES.find(
                      (type) => type.id === collection.contentType,
                    )?.name
                  }
                </div>
              </div>

              <div className="collection-info">
                <div className="collection-dirs">
                  <Folder size={16} />
                  <span>{collection.directories.length} directories</span>
                </div>

                {collection.scanSchedule && (
                  <div className="collection-schedule">
                    <Clock size={16} />
                    <span>Scans {collection.scanSchedule}</span>
                  </div>
                )}

                <div className="collection-metadata">
                  <span>
                    Metadata:{' '}
                    {METADATA_SOURCES.find(
                      (source) => source.id === collection.metadataProvider,
                    )?.name || 'Auto'}
                  </span>
                </div>
              </div>

              <div className="collection-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onCollectionSelect(collection.id)}
                  type="button"
                >
                  View
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleScanCollection(collection.id)}
                  type="button"
                >
                  <RefreshCw size={14} />
                  Scan
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditingCollection(collection)}
                  type="button"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteCollection(collection.id)}
                  type="button"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewCollectionModal && (
        <CollectionFormModal
          onClose={() => setShowNewCollectionModal(false)}
          onSubmit={handleCreateCollection}
        />
      )}

      {editingCollection && (
        <CollectionFormModal
          onClose={() => setEditingCollection(null)}
          onSubmit={handleUpdateCollection}
          collection={editingCollection}
        />
      )}
    </div>
  );
}

export default CollectionsManager;
