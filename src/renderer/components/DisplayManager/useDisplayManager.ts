import { useCallback } from 'react';

import { useDisplayManagerContext } from './DisplayManagerContext';

export const useDisplayManager = () => {
  const { state, dispatch } = useDisplayManagerContext();

  // Memoize functions using useCallback to ensure stability
  const registerComponent = useCallback(
    (key: string, component: React.ReactNode) => {
      dispatch({ type: 'REGISTER_COMPONENT', payload: { key, component } });
    },
    [dispatch],
  );

  const registerComponents = useCallback(
    (components: Record<string, React.ReactNode>) => {
      Object.entries(components).forEach(([key, component]) => {
        dispatch({ type: 'REGISTER_COMPONENT', payload: { key, component } });
      });
    },
    [dispatch],
  );

  const removeComponent = useCallback(
    (key: string) => {
      dispatch({ type: 'REMOVE_COMPONENT', payload: key });
    },
    [dispatch],
  );

  const navigate = useCallback(
    (key: string) => {
      dispatch({ type: 'NAVIGATE', payload: key });
    },
    [dispatch],
  );

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, [dispatch]);

  return {
    state,
    registerComponent,
    registerComponents,
    removeComponent,
    navigate,
    goBack,
  };
};
