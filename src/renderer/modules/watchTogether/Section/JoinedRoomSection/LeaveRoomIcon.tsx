import React from 'react';

interface LeaveRoomIconProps extends React.SVGProps<SVGSVGElement> {}

/**
 * LeaveRoomIcon Component
 *
 * A reusable SVG component representing a "Leave Room" icon. It features a smooth
 * rounded arrow pointing left, symbolizing an exit action. The icon can be customized
 * using props such as `width`, `height`, `color`, and more.
 *
 * @param {LeaveRoomIconProps} props - Props passed to the SVG element for customization.
 * @returns {JSX.Element} The LeaveRoomIcon SVG component.
 */
function LeaveRoomIcon(props: LeaveRoomIconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      viewBox="0 0 24 24"
      fill="currentColor"
      // stroke="currentColor"
      {...props}
    >
      <path d="M14 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2v-4h-2v4H5V5h9v4h2V5c0-1.1-.9-2-2-2z" />

      <path d="M11 16.5c-.3 0-.6-.1-.8-.4l-3.5-3.5c-.4-.4-.4-1 0-1.4l3.5-3.5c.4-.4 1-.4 1.4 0s.4 1 0 1.4L9.4 11H19c.6 0 1 .4 1 1s-.4 1-1 1H9.4l2.2 2.2c.4.4.4 1 0 1.4-.2.3-.5.4-.8.4z" />
    </svg>
  );
}

export default LeaveRoomIcon;
