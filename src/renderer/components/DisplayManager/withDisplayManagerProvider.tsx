import React from 'react';

import { DisplayManagerProvider } from './DisplayManagerContext';

export const withDisplayManagerProvider = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> => {
  return function DisplayManagerProviderWrapper(props: P) {
    return (
      <DisplayManagerProvider>
        <WrappedComponent {...props} />
      </DisplayManagerProvider>
    );
  };
};
