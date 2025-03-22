/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { uiStore } from './UIStore';

interface WithUIStoreProps {
  id: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}

export const withUIStore = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<Omit<P, 'onChange' | 'value'> & WithUIStoreProps> => {
  const UIStoreInputWrapper = forwardRef<
    HTMLDivElement,
    Omit<P, 'onChange' | 'value'> & WithUIStoreProps
  >(({ id, onChange, defaultValue = '', ...props }: any, ref) => {
    // Ensure value is always controlled
    const value = uiStore.getInputValue<string>(id) ?? defaultValue ?? '';

    // Set defaultValue in the store if provided
    useEffect(() => {
      // if (defaultValue !== undefined) {
      uiStore.setInputValue(id, defaultValue || null);
      // }
    }, [id, defaultValue]);

    // Handle value changes and update both the store and onChange prop
    const handleChange = useCallback(
      (newValue: string) => {
        uiStore.setInputValue(id, newValue);
        if (onChange) {
          onChange(newValue);
        }
      },
      [id, onChange],
    );

    // Render the wrapped component with injected value and onChange
    return (
      <WrappedComponent
        {...(props as P)}
        ref={ref}
        value={value}
        onChange={handleChange}
        id={id}
      />
    );
  });

  // Using type assertion to tell TypeScript that observer(UIStoreInputWrapper) is compatible
  return observer(UIStoreInputWrapper) as unknown as React.FC<
    Omit<P, 'onChange' | 'value'> & WithUIStoreProps
  >;
};

export default withUIStore;
