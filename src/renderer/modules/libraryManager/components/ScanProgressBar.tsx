import React from 'react';

import type { ScanProgress } from '../types';

interface ScanProgressBarProps {
  progress: ScanProgress;
}

function ScanProgressBar({ progress }: ScanProgressBarProps) {
  const getStatusText = () => {
    switch (progress.status) {
      case 'scanning':
        return 'Scanning files...';
      case 'processing':
        return 'Processing metadata...';
      case 'complete':
        return 'Scan complete!';
      case 'error':
        return `Error: ${progress.error || 'Unknown error'}`;
      default:
        return 'Preparing to scan...';
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'scanning':
      case 'processing':
        return (
          <svg
            className="status-icon spinning"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        );
      case 'complete':
        return (
          <svg
            className="status-icon success"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="status-icon error"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="scan-progress-bar">
      <div className="scan-progress-info">
        <span className="scan-status">
          {getStatusIcon()}
          {getStatusText()}
        </span>
        <span className="scan-count">
          {progress.processedFiles && progress.totalFiles
            ? `${progress.processedFiles} / ${progress.totalFiles} files`
            : ''}
        </span>
      </div>
      <div className="scan-progress-bar-outer">
        <div
          className="scan-progress-bar-inner"
          style={{ width: `${progress.progress}%` }}
          role="progressbar"
          aria-valuenow={progress.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scan progress"
        />
      </div>
      {progress.currentFile && (
        <div className="scan-progress-current-file">
          <small>{progress.currentFile}</small>
        </div>
      )}
    </div>
  );
}

export default ScanProgressBar;
