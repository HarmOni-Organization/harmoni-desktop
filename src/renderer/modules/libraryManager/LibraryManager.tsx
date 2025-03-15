import React from 'react';

import LibraryManagerSection from './LibraryManagerSection';
import { DisplayManagerProvider } from '../../components/DisplayManager/DisplayManagerContext';

/**
 * LibraryManager component wrapped with DisplayManagerProvider
 * This component is used in the navigation configuration
 */
function LibraryManager() {
  return (
    <DisplayManagerProvider>
      <LibraryManagerSection />
    </DisplayManagerProvider>
  );
}

export default LibraryManager;
