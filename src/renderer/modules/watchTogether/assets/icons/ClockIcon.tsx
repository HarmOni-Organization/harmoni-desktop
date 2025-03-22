import React from 'react';

interface ClockIconProps extends React.SVGProps<SVGSVGElement> {}

function ClockIcon(props: ClockIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      width="256"
      height="256"
      viewBox="0 0 256 256"
      xmlSpace="preserve"
      {...props}
    >
      <g
        style={{
          stroke: 'none',
          strokeWidth: 0,
          strokeDasharray: 'none',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeMiterlimit: 10,
          fill: 'none',
          fillRule: 'nonzero',
          opacity: 1,
        }}
        transform="translate(1.407 1.407) scale(2.81 2.81)"
      >
        <path
          d="M 35.477 90 c -0.928 0 -1.818 -0.369 -2.475 -1.025 L 1.025 56.997 c -1.367 -1.366 -1.367 -3.583 0 -4.949 c 9.569 -9.568 22.492 -13.69 32.912 -10.713 l 7.399 -7.398 c -2.979 -10.422 1.144 -23.343 10.712 -32.911 c 1.312 -1.313 3.636 -1.313 4.949 0 l 31.978 31.978 c 1.367 1.366 1.367 3.583 0 4.949 c -9.568 9.567 -22.487 13.689 -32.911 10.713 l -7.399 7.398 c 2.979 10.422 -1.144 23.343 -10.712 32.911 C 37.295 89.631 36.405 90 35.477 90 z M 8.57 54.644 L 35.356 81.43 c 6.463 -7.867 8.952 -17.756 6.045 -24.998 c -0.522 -1.301 -0.218 -2.788 0.773 -3.778 l 10.478 -10.478 c 0.99 -0.993 2.477 -1.298 3.778 -0.773 c 7.241 2.906 17.132 0.418 24.998 -6.046 L 54.644 8.571 c -6.463 7.867 -8.952 17.755 -6.045 24.998 c 0.521 1.301 0.218 2.787 -0.773 3.778 L 37.348 47.824 c -0.992 0.99 -2.479 1.296 -3.778 0.773 C 26.326 45.691 16.438 48.181 8.57 54.644 z"
          style={{
            stroke: 'none',
            strokeWidth: 1,
            fill: 'var(--color--background--100)', // Using CSS variable for fill
            fillRule: 'nonzero',
            opacity: 1,
          }}
        />
        <path
          d="M 55.022 90.002 c -1.019 0 -2.04 -0.037 -3.066 -0.112 c -1.928 -0.141 -3.377 -1.817 -3.235 -3.745 c 0.14 -1.928 1.819 -3.387 3.745 -3.235 c 10.526 0.761 20.703 -3.258 27.908 -11.047 c 1.312 -1.419 3.525 -1.507 4.946 -0.192 c 1.419 1.313 1.505 3.526 0.192 4.946 C 77.556 85.219 66.58 90.002 55.022 90.002 z"
          style={{
            stroke: 'none',
            strokeWidth: 1,
            fill: 'var(--color--background--100)', // Using CSS variable for fill
            fillRule: 'nonzero',
            opacity: 1,
          }}
        />
        <path
          d="M 6.235 19.26 c -0.85 0 -1.702 -0.308 -2.375 -0.931 c -1.419 -1.313 -1.505 -3.527 -0.193 -4.946 C 12.324 4.024 24.552 -0.813 37.224 0.11 c 1.928 0.141 3.376 1.817 3.236 3.746 c -0.14 1.928 -1.819 3.379 -3.746 3.236 C 26.186 6.325 16.009 10.349 8.805 18.137 C 8.115 18.883 7.177 19.26 6.235 19.26 z"
          style={{
            stroke: 'none',
            strokeWidth: 1,
            fill: 'var(--color--background--100)', // Using CSS variable for fill
            fillRule: 'nonzero',
            opacity: 1,
          }}
        />
      </g>
    </svg>
  );
}

export default ClockIcon;
