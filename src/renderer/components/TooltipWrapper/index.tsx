import './style.scss';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';

interface TooltipWrapperProps {
  content: string;
  className?: string;
  children: ReactNode;
}

function TooltipWrapper({ content, className, children }: TooltipWrapperProps) {
  const tooltipRef = useRef<HTMLDivElement>(null); // Ref to the tooltip container

  useEffect(() => {
    if (tooltipRef.current) {
      const parent = tooltipRef.current.closest('div');
      if (parent) {
        parent.classList.add('relative');
      }
    }
  }, []);

  return (
    <>
      <span className={clsx('tooltip-container', className)} ref={tooltipRef}>
        {children}
      </span>
      <div className="tooltip-text">{content}</div>
    </>
  );
}

export default TooltipWrapper;
