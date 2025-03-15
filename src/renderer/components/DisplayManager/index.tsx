import './style.css';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { clsx } from '@chatui/core';

import { useDisplayManager } from './useDisplayManager';

interface DisplayManagerProps {
  duration?: number;
  fallback?: React.ReactNode;
  debug?: boolean;
  transitionType?: 'fade' | 'slide' | 'zoom';
  errorUI?: React.ReactNode;
}

export function DisplayManager({
  duration = 300,
  transitionType = 'fade',
  fallback = <div>Loading...</div>,
  debug = false,
  errorUI = <div>Component not found</div>,
}: DisplayManagerProps) {
  const {
    state: { activeKey, components },
  } = useDisplayManager();

  const previousKey = useRef(activeKey);

  const [currentKey, setCurrentKey] = useState(activeKey);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const safeDuration = useMemo(
    () => Math.max(100, Math.min(duration, 5000)),
    [duration],
  );

  useEffect(() => {
    if (currentKey !== activeKey) {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentKey(activeKey);
        setIsTransitioning(false);
      }, safeDuration); // Match duration with your CSS transition timing
    }
  }, [activeKey, currentKey, safeDuration]);

  if (debug && previousKey.current !== activeKey) {
    console.log(
      `[DisplayManager] Navigating from '${previousKey.current}' to '${activeKey}'`,
    );
    previousKey.current = activeKey;
  }

  if (!components[activeKey]) {
    return errorUI;
  }

  return (
    <div
      className={clsx('display-manager-container section-grid ', {
        [`${transitionType}-entering`]: !isTransitioning,
        [`${transitionType}-exiting`]: isTransitioning,
      })}
      style={
        {
          '--transition-duration': `${safeDuration}ms`,
        } as React.CSSProperties
      }
    >
      <React.Suspense fallback={fallback}>
        {components[currentKey]}
      </React.Suspense>
    </div>
  );
}
