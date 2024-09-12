import React from 'react';
import './TextInputBar.css';

const TextInputBar = ({ value, onChange, onSend }) => {
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSend();
  };

  return (
    <div className="text-input-container">
      <div className="text-input-wrapper">
        <form className="text-input-bar" onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="text-input"
          />
          <button type="submit" className="submit-button" aria-label="Send">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TextInputBar;