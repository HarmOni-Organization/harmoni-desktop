import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Heart,
  PlusCircle,
  Search,
  Trash2,
} from 'lucide-react';

import { CONTENT_TYPES, IPC_CHANNELS } from '../constants';
import type { Wishlist } from '../types';

function WishlistManager() {
  const [wishlistItems, setWishlistItems] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Wishlist>>({
    title: '',
    mediaType: 'movie',
    priority: 'medium',
  });

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        const items = await window.electron.ipcRenderer.invoke(
          IPC_CHANNELS.GET_WISHLIST,
        );

        if (items) {
          setWishlistItems(items);
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const handleAddItem = async () => {
    if (!newItem.title) return;

    try {
      const wishlistItem = await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.ADD_TO_WISHLIST,
        {
          ...newItem,
          id: `wishlist-${Date.now()}`,
          addedAt: Date.now(),
        },
      );

      if (wishlistItem) {
        setWishlistItems([...wishlistItems, wishlistItem]);
        setNewItem({
          title: '',
          mediaType: 'movie',
          priority: 'medium',
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.REMOVE_FROM_WISHLIST,
        id,
      );

      setWishlistItems(wishlistItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
    }
  };

  const handleChangePriority = async (
    id: string,
    priority: 'low' | 'medium' | 'high',
  ) => {
    try {
      const item = wishlistItems.find((item) => item.id === id);
      if (!item) return;

      const updatedItem = await window.electron.ipcRenderer.invoke(
        IPC_CHANNELS.UPDATE_WISHLIST_ITEM,
        {
          ...item,
          priority,
        },
      );

      if (updatedItem) {
        setWishlistItems(
          wishlistItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        );
      }
    } catch (error) {
      console.error('Failed to update wishlist item:', error);
    }
  };

  // Filter wishlist items based on search query
  const filteredItems = wishlistItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort items by priority (high to low) and then by added date (most recent first)
  const sortedItems = [...filteredItems].sort((a, b) => {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority];

    if (priorityDiff !== 0) return priorityDiff;
    return b.addedAt - a.addedAt;
  });

  if (isLoading) {
    return (
      <div className="wishlist-loading">
        <div className="loading-spinner" />
        <p>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-manager">
      <div className="wishlist-header">
        <h2>Wishlist</h2>
        <div className="wishlist-actions">
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
            type="button"
          >
            <PlusCircle size={16} />
            Add Item
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-wishlist-form">
          <div className="form-header">
            <h3>Add to Wishlist</h3>
            <button className="btn-close" onClick={() => setShowAddForm(false)} type="button">
              ×
            </button>
          </div>

          <div className="form-body">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={newItem.title}
                onChange={(e) =>
                  setNewItem({ ...newItem, title: e.target.value })
                }
                placeholder="Enter media title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="media-type">Media Type</label>
              <select
                id="media-type"
                value={newItem.mediaType}
                onChange={(e) =>
                  setNewItem({ ...newItem, mediaType: e.target.value as any })
                }
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={newItem.priority}
                onChange={(e) =>
                  setNewItem({ ...newItem, priority: e.target.value as any })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setShowAddForm(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAddItem}
              type="button"
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      )}

      {sortedItems.length > 0 ? (
        <div className="wishlist-items">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className={`wishlist-item priority-${item.priority}`}
            >
              <div className="item-icon">
                <Heart size={16} />
              </div>

              <div className="item-content">
                <h4>{item.title}</h4>
                <div className="item-meta">
                  <span className="media-type">
                    {
                      CONTENT_TYPES.find((type) => type.id === item.mediaType)
                        ?.name
                    }
                  </span>
                  <span className="added-date">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="item-priority">
                <span className={`priority-badge ${item.priority}`}>
                  {item.priority.charAt(0).toUpperCase() +
                    item.priority.slice(1)}
                </span>

                <div className="priority-controls">
                  {item.priority !== 'high' && (
                    <button
                      className="btn-icon"
                      onClick={() =>
                        handleChangePriority(
                          item.id,
                          item.priority === 'low' ? 'medium' : 'high',
                        )
                      }
                      title="Increase Priority"
                      type="button"
                    >
                      <ChevronUp size={14} />
                    </button>
                  )}

                  {item.priority !== 'low' && (
                    <button
                      className="btn-icon"
                      onClick={() =>
                        handleChangePriority(
                          item.id,
                          item.priority === 'high' ? 'medium' : 'low',
                        )
                      }
                      title="Decrease Priority"
                      type="button"
                    >
                      <ChevronDown size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="item-actions">
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleRemoveItem(item.id)}
                  title="Remove from Wishlist"
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="wishlist-empty">
          {searchQuery ? (
            <p>No matching items found in your wishlist.</p>
          ) : (
            <>
              <p>
                Your wishlist is empty. Add items you plan to acquire in the
                future.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
                type="button"
              >
                <PlusCircle size={16} />
                Add Your First Item
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default WishlistManager;
