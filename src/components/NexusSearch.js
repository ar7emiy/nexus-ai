import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const NexusSearch = ({ inputValue, setInputValue, sendTrigger }) => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);

  const ChatbotIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#105766"/>
      <path d="M12.7053 11.2H4.80005V20.8H12.7053L19.4422 11.2H27.2V20.8H19.4422L12.7053 11.2Z" stroke="white" strokeWidth="2"/>
    </svg>
  );

  // Memoize handleSend to prevent it from being recreated on every render
  const handleSend = useCallback(async () => {
    if (inputValue.trim() !== '') {
      try {
        // Add user message to the chat
        setMessages(prevMessages => [...prevMessages, { text: inputValue, isUser: true }]);

        // Make API call to GCP function
        const response = await axios.post('https://us-central1-silver-idea-432502-c0.cloudfunctions.net/nxsFunction-main', { input: inputValue });

        // Add API response to the chat
        setMessages(prevMessages => [...prevMessages, { text: JSON.stringify(response.data), isUser: false }]);

        // Save the system response in the history
        setHistory(prevHistory => [...prevHistory, JSON.stringify(response.data)]);

        setInputValue('');
      } catch (error) {
        console.error('Error calling API:', error);
        setMessages(prevMessages => [...prevMessages, { text: 'Error processing your request', isUser: false }]);
      }
    }
  }, [inputValue, setInputValue]);  // Dependencies are inputValue and setInputValue

  // Use effect to handle changes in sendTrigger
  useEffect(() => {
    if (sendTrigger > 0) {
      handleSend();
    }
  }, [sendTrigger, handleSend]);  // Now handleSend is stable and memoized

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ width: '250px', minWidth: '250px', padding: '10px', backgroundColor: '#C9A58A', borderRight: '1px solid #e0e0e0', boxSizing: 'border-box', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <select style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
          <option>Course #: Name</option>
          <option>Course 1</option>
          <option>Course 2</option>
        </select>
        <h3>Previous Results</h3>
        <ul style={{ padding: 0, margin: 0 }}>
          {history.map((item, index) => (
            <li key={index} style={{ marginBottom: '10px', listStyleType: 'none', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.split(',')[0]}  {/* Display only the part before the first comma */}
            </li>
          ))}
        </ul>
      </div>



      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '40px', backgroundColor: '#F0E0D1' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px', padding: '20px', boxSizing: 'border-box' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                alignItems: 'center',
                marginBottom: '15px',  // Increased spacing between messages
              }}
            >
              {!msg.isUser && <ChatbotIcon />}
              <div
                style={{
                  maxWidth: '60%',
                  padding: '15px',  // Increased padding within the message bubble
                  backgroundColor: msg.isUser ? '#C9A58A' : '#ffffff',
                  color: msg.isUser ? '#ffffff' : '#C9A58A',
                  borderRadius: '10px',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  marginLeft: msg.isUser ? '0' : '15px',  // Increased margin between the bubble and the icon
                  marginRight: msg.isUser ? '15px' : '0',  // Increased margin between the bubble and the icon
                }}
              >
                {msg.text}
              </div>
              {/* {msg.isUser && <ProfileIcon />} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NexusSearch;
