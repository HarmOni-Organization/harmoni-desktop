export const WatchTogetherIDs = {
  JOIN_ROOM_INPUT: 'join-room-code',
  JOIN_AND_INVITE_SECTION: 'join-invite-section',
  JOIN_BUTTON: 'join-room-button',
  START_BUTTON: 'watchtogether-start-button',
  LEAVE_BUTTON: 'watchtogether-leave-button',
  JOINED_ROOM_SECTION: 'joined-room-section',
  ACTION_SECTION: 'watchtogether-action-section',
  CREATE_ROOM_BUTTON: 'watchtogether-create-room-button',
};

export const SECTION_NAMES = {
  JOIN_AND_INVITE: 'JOIN_AND_INVITE',
  JOINED_ROOM: 'JOINED_ROOM',
};

export const WatchTogetherMessages = {
  START_SUCCESS: 'WatchTogether session started successfully!',
  JOIN_SUCCESS: 'Joined the WatchTogether session!',
  LEAVE_SUCCESS: 'You have left the WatchTogether session.',
  INVALID_ARGS: 'Missing required arguments. Please check the usage.',
  CLICK_SECTION_ERROR:
    'Failed to click on "Watch Together" section. Please check the page layout and ensure the section is present.',
  MISSING_JOIN_INVITE_SECTION:
    'Join and invite section is missing. Please verify the page layout.',
  ROOM_INPUT_ERROR:
    'Failed to find or type into the room input field. Please ensure it is present on the page.',
  JOIN_BUTTON_ERROR:
    'Join button is missing or not clickable. Verify the page layout.',
};
