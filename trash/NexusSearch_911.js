import React, { useState, useEffect, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';

const NexusSearch = ({ inputValue, setInputValue, sendTrigger }) => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);

  const localVideoPath = process.env.PUBLIC_URL + "/cornellLecture.mp4";

  const ChatbotIcon = () => (
    <svg width="100" height="100" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#A65D3A"/>
      <path d="M12.7053 11.2H4.80005V20.8H12.7053L19.4422 11.2H27.2V20.8H19.4422L12.7053 11.2Z" stroke="white" strokeWidth="2"/>
    </svg>
  );

  const handleSend = useCallback(async () => {
    if (inputValue.trim() !== '') {
      try {
        setMessages(prevMessages => [...prevMessages, { text: inputValue, isUser: true }]);

        const response = await fetch('https://us-central1-silver-idea-432502-c0.cloudfunctions.net/nxsFunction-main', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: inputValue }),
        });
        const data = await response.json();

        setMessages(prevMessages => [
          ...prevMessages, 
          { 
            isUser: false, 
            customContent: true,
            data: {...data, video_url: localVideoPath}
          }
        ]);

        setHistory(prevHistory => [...prevHistory, inputValue]);

        // Select the first snippet by default
        setSelectedSnippet(data.results[0]);

        setInputValue('');
      } catch (error) {
        console.error('Error processing request:', error);
        setMessages(prevMessages => [...prevMessages, { text: 'Error processing your request', isUser: false }]);
      }
    }
  }, [inputValue, setInputValue, localVideoPath]);

  useEffect(() => {
    if (sendTrigger > 0) {
      handleSend();
    }
  }, [sendTrigger, handleSend]);

  const handleSnippetClick = (snippet) => {
    setSelectedSnippet(snippet);
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.split('.')[0]; // Remove milliseconds
  };

  const SnippetList = ({ snippets, onSnippetClick, selectedSnippet }) => {
    return (
      <div>
        {snippets.map((snippet, index) => (
          <div 
            key={index}
            onClick={() => onSnippetClick(snippet)}
            style={{ 
              marginBottom: '20px', 
              paddingBottom: '20px', 
              borderBottom: '1px solid #ddd',
              backgroundColor: selectedSnippet === snippet ? '#F0D0B0' : 'transparent',
              padding: '10px',
              borderRadius: '5px',
              color: 'black',
              cursor: 'pointer',
            }}
          >
            {snippet.summary} 
            <span style={{ display: 'block', color: '#666', marginTop: '5px' }}>
              [{formatTimestamp(snippet.time_stamp.start_time)} - {formatTimestamp(snippet.time_stamp.end_time)}]
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ width: '250px', minWidth: '250px', padding: '10px', backgroundColor: '#FFFFFF', borderRight: '1px solid #e0e0e0', boxSizing: 'border-box', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <select style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
          <option>Course #: Name</option>
          <option>Course 1</option>
          <option>Course 2</option>
        </select>
        <h3>Previous Results</h3>
        <ul style={{ padding: 0, margin: 0 }}>
          {history.map((item, index) => (
            <li key={index} style={{ marginBottom: '10px', listStyleType: 'none', backgroundColor: '#EBE6DA', padding: '10px', borderRadius: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '40px', backgroundColor: '#F3F2EC' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px', padding: '20px', boxSizing: 'border-box', maxWidth: '800px', margin: '0 auto' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                marginBottom: '15px',
              }}
            >
              {!msg.isUser && <ChatbotIcon />}
              <div
                style={{
                  maxWidth: msg.customContent ? '100%' : '60%',
                  padding: '15px',
                  backgroundColor: msg.isUser ? '#EBE6DA' : '#ffffff',
                  color: 'black', 
                  borderRadius: '10px',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  marginLeft: msg.isUser ? '0' : '15px',
                  marginRight: msg.isUser ? '15px' : '0',
                }}
              >
                {msg.customContent ? (
                  <>
                    <VideoPlayer
                      videoUrl={msg.data.video_url}
                      snippets={msg.data.results}
                      currentTimeRange={selectedSnippet?.time_stamp}
                      onTimeUpdate={() => {}}
                      selectedSnippet={selectedSnippet}
                    />
                    <div style={{ marginTop: '20px' }}>
                      <SnippetList
                        snippets={msg.data.results}
                        onSnippetClick={handleSnippetClick}
                        selectedSnippet={selectedSnippet}
                      />
                    </div>
                  </>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NexusSearch;