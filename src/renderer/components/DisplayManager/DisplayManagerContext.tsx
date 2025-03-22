import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';

interface DisplayManagerState {
  activeKey: string;
  components: Record<string, ReactNode>;
  history: string[];
}

type Action =
  | { type: 'NAVIGATE'; payload: string }
  | { type: 'GO_BACK' }
  | {
      type: 'REGISTER_COMPONENT';
      payload: { key: string; component: ReactNode };
    }
  | { type: 'REMOVE_COMPONENT'; payload: string };

const DisplayManagerContext = createContext<{
  state: DisplayManagerState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

interface DisplayManagerProviderProps {
  children: ReactNode;
}

const reducer = (
  state: DisplayManagerState,
  action: Action,
): DisplayManagerState => {
  const { activeKey, history } = state;
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        activeKey: action.payload,
        history: [...history, activeKey],
      };
    case 'GO_BACK': {
      if (history.length === 0) return state;
      const lastKey = history[history.length - 1];
      return {
        ...state,
        activeKey: lastKey,
        history: history.slice(0, -1),
      };
    }
    case 'REGISTER_COMPONENT':
      return {
        ...state,
        components: {
          ...state.components,
          [action.payload.key]: action.payload.component,
        },
      };
    case 'REMOVE_COMPONENT': {
      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
      const { [action.payload]: _, ...remainingComponents } = state.components;
      return { ...state, components: remainingComponents };
    }
    default:
      throw new Error(`Unhandled action type: ${(action as Action).type}`);
  }
};

export const useDisplayManagerContext = () => {
  const context = useContext(DisplayManagerContext);
  if (!context) {
    throw new Error(
      'useDisplayManagerContext must be used within a DisplayManagerProvider',
    );
  }
  return context;
};

export function DisplayManagerProvider({
  children,
}: DisplayManagerProviderProps) {
  const [state, originalDispatch] = useReducer(reducer, {
    activeKey: '',
    components: {},
    history: [],
  });

  const dispatch = useCallback(originalDispatch, []);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <DisplayManagerContext.Provider value={contextValue}>
      {children}
    </DisplayManagerContext.Provider>
  );
}
