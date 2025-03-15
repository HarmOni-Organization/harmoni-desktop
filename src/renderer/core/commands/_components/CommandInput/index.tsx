import './style.scss';

import commandConfig from '@core/commands/commandConfig';

import useCommandInput from './helper/useCommandInput';

function CommandInput() {
  const {
    inputRef,
    input,
    suggestions,
    shadowText,
    error,
    suggestionPosition,
    activeSuggestionIndex,
    handleSuggestionClick,
    handleInputChange,
    handleKeyDown,
  } = useCommandInput(commandConfig);

  return (
    <div className="command-input hidden">
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className={`input ${error ? 'error' : ''}`}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="/<feature> [<action>] [<flags>]"
        />
        {!error && shadowText && input && (
          <div className="shadow-text">
            <span style={{ color: 'transparent' }}> {input}</span>
            <span>{shadowText}</span>
          </div>
        )}
      </div>
      {suggestions.length > 0 && !error && input && (
        <ul
          className="suggestion-list"
          style={{
            top: `${suggestionPosition.top}px`,
            left: `${suggestionPosition.left}px`,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              type="button"
              onKeyDown={(e) =>
                e.key === 'Enter' && handleSuggestionClick(suggestion)
              }
              className={`suggestion-item ${
                index === activeSuggestionIndex ? 'active' : ''
              }`}
            >
              {suggestion.replace(' ""', '')}
              {suggestion.includes(' ""') && (
                <span className="flag-required"> (Requires value)</span>
              )}
            </button>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommandInput;
