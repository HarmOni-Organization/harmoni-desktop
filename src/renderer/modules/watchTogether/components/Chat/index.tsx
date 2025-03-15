import '@chatui/core/dist/index.css';
import './style.scss'; // Import custom styles

import moment from 'moment';

import type { ChatProps } from '@chatui/core';
import Chat, { Bubble, useMessages } from '@chatui/core';

// Placeholder for assistant avatar
const assistantAvatarURL =
  'data:image/jpeg;base64,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';

/**
 * Renders the chat interface for the "Watch Together" feature, allowing synchronized messaging between users.
 *
 * @returns {JSX.Element} WatchTogetherChat - A chat component with typing indicators and simulated assistant responses.
 */
function WatchTogetherChat() {
  const { messages, appendMsg, deleteMsg } = useMessages([]);

  /**
   * Updates the typing indicator for a user in the chat.
   *
   * @param {boolean} isTyping - Indicates if the user is currently typing.
   * @param {string} typingMsgId - Unique identifier for the typing indicator message.
   * @param {Object} user - Information about the user, including avatar and name.
   */
  const setTypingIndicator = (
    isTyping: boolean,
    typingMsgId: string,
    user: { avatar: string; name: string },
  ) => {
    if (isTyping) {
      appendMsg({
        _id: typingMsgId,
        type: 'text',
        content: { text: 'typing...' },
        position: 'left',
        user: {
          ...user,
          isTyping: true,
        },
      });
    } else {
      deleteMsg(typingMsgId);
    }
  };

  /**
   * Handles sending messages in the chat.
   *
   * @param {string} messageType - The type of message being sent (e.g., 'text').
   * @param {string} messageValue - The content of the message.
   */
  const handleSendMessage: ChatProps['onSend'] = (
    messageType,
    messageValue,
  ) => {
    if (messageType === 'text' && messageValue.trim()) {
      appendMsg({
        type: 'text',
        content: { text: messageValue },
        position: 'right',
      });

      const typingMessageId = `_TYPING_${moment.now()}`;
      const assistant = {
        avatar: assistantAvatarURL,
        name: 'Assistant',
      };

      // Display typing indicator for the assistant
      setTypingIndicator(true, typingMessageId, assistant);

      // Simulate a delay before showing the assistant's response
      setTimeout(() => {
        appendMsg({
          type: 'text',
          content: { text: 'This is a simulated response.' },
          position: 'left',
          user: assistant,
        });

        // Remove the typing indicator after the assistant responds
        setTypingIndicator(false, typingMessageId, assistant);
      }, 1000);
    }
  };

  /**
   * Renders the content of each message, including typing indicators and message bubbles.
   *
   * @param {Object} message - The message object to render.
   * @returns {JSX.Element} Rendered message content.
   */
  const renderMessageContent = (message) => {
    const { content, type, createdAt, user } = message;

    return (
      <div>
        {user?.isTyping ? (
          <div className="Message-inner">
            <div className="Message-author">Assistant</div>
            <div
              className="Message-content"
              role="alert"
              aria-live="assertive"
              aria-atomic="false"
            >
              <div className="Bubble typing" data-type="typing">
                <div className="Typing" aria-busy="true">
                  <div className="Typing-dot" />
                  <div className="Typing-dot" />
                  <div className="Typing-dot" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Bubble content={content.text} type={type} />
        )}

        {!user?.isTyping && user?.name && (
          <div className="Message-author">
            <span className="Message-author--name">{user.name}</span>
            <span className="Message-author--data">
              {moment(createdAt).format('HH:mm A')}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Chat
      locale="en"
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSendMessage}
      placeholder="Type a message..."
    />
  );
}

export default WatchTogetherChat;
