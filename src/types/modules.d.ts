// Declare module paths for components
declare module 'src/renderer/modules/libraryManager/components/MediaCard' {
  import type { FC } from 'react';
  import type { MediaItem } from 'src/renderer/modules/libraryManager/types';

  interface MediaCardProps {
    item: MediaItem;
    onPlay: () => void;
    onWatchStatusUpdate: (watched: boolean) => void;
  }

  const MediaCard: FC<MediaCardProps>;
  export default MediaCard;
}

declare module 'src/renderer/modules/libraryManager/components/EmptyLibrary' {
  import type { FC } from 'react';

  interface EmptyLibraryProps {
    onAddFolder: () => void;
  }

  const EmptyLibrary: FC<EmptyLibraryProps>;
  export default EmptyLibrary;
}

declare module 'src/renderer/modules/libraryManager/components/LibraryHeader' {
  import type { FC } from 'react';

  interface FilterOptions {
    genre: string[];
    resolution: string[];
    watched: boolean | null;
    folder: string[];
  }

  interface LibraryHeaderProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: FilterOptions) => void;
    onSortChange: (sortId: string) => void;
    onScanLibrary: () => void;
    onAddFolder: () => void;
    folderList?: string[];
  }

  const LibraryHeader: FC<LibraryHeaderProps>;
  export default LibraryHeader;
}

declare module 'src/renderer/modules/libraryManager/components/MediaGrid' {
  import type { FC } from 'react';
  import type { MediaLibrary } from 'src/renderer/modules/libraryManager/types';

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

  const MediaGrid: FC<MediaGridProps>;
  export default MediaGrid;
}

declare module 'src/renderer/modules/libraryManager/components/ScanProgressBar' {
  import type { FC } from 'react';
  import type { ScanProgress } from 'src/renderer/modules/libraryManager/types';

  interface ScanProgressBarProps {
    progress: ScanProgress;
  }

  const ScanProgressBar: FC<ScanProgressBarProps>;
  export default ScanProgressBar;
}

declare module 'src/renderer/modules/libraryManager/core/useLibraryManager' {
  import type {
    LibrarySettings,
    MediaLibrary,
    ScanProgress,
  } from 'src/renderer/modules/libraryManager/types';

  interface UseLibraryManagerReturn {
    library: MediaLibrary | null;
    isLoading: boolean;
    scanProgress: ScanProgress;
    settings: LibrarySettings;
    scanLibrary: () => Promise<void>;
    selectFolder: () => Promise<void>;
    updateSettings: (newSettings: Partial<LibrarySettings>) => Promise<void>;
    playMedia: (mediaId: string) => Promise<void>;
    updateWatchStatus: (mediaId: string, watched: boolean) => Promise<void>;
  }

  export function useLibraryManager(): UseLibraryManagerReturn;
}
