import React, { useState, useEffect, useCallback, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import './NexusSearch.css';

const NexusSearch = ({ inputValue, setInputValue, sendTrigger }) => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentInput, setCurrentInput] = useState('');

  const localVideoPath = process.env.PUBLIC_URL + "/cornellLecture.mp4";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = useCallback(async () => {
    if (currentInput.trim() !== '') {
      try {
        setIsLoading(true);
        setMessages(prevMessages => [...prevMessages, { text: currentInput, isUser: true }]);

        const response = await fetch('https://us-central1-silver-idea-432502-c0.cloudfunctions.net/nxsFunction-main', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: currentInput }),
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

        setHistory(prevHistory => [...prevHistory, currentInput]);
        setSelectedSnippet(data.results[0]);
        setCurrentInput('');
      } catch (error) {
        console.error('Error processing request:', error);
        setMessages(prevMessages => [...prevMessages, { text: 'Error processing your request', isUser: false }]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentInput, localVideoPath]);

  useEffect(() => {
    if (sendTrigger > 0) {
      setCurrentInput(inputValue);
      handleSend();
    }
  }, [sendTrigger, inputValue, handleSend]);

  const handleSnippetClick = useCallback((snippet) => {
    setSelectedSnippet(snippet);
  }, []);

  const formatTimestamp = (timestamp) => {
    return timestamp.split('.')[0];
  };

  const SnippetList = React.memo(({ snippets, onSnippetClick, selectedSnippet }) => (
    <div className="snippet-list">
      {snippets.map((snippet, index) => (
        <div 
          key={index}
          onClick={() => onSnippetClick(snippet)}
          className={`snippet-item ${selectedSnippet === snippet ? 'selected' : ''}`}
        >
          {snippet.summary} 
          <span className="timestamp">
            [{formatTimestamp(snippet.time_stamp.start_time)} - {formatTimestamp(snippet.time_stamp.end_time)}]
          </span>
        </div>
      ))}
    </div>
  ));

  return (
    <div className="nexus-search">
      <div className="sidebar">
        <select className="course-select">
          <option>Course #: Name</option>
          <option>Course 1</option>
          <option>Course 2</option>
        </select>
        <h3>Previous Results</h3>
        <ul className="history-list">
          {history.map((item, index) => (
            <li key={index} className="history-item">{item}</li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <div className="message-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
              {!msg.isUser && <div className="bot-icon"></div>}
              <div className="message-content">
                {msg.customContent ? (
                  <>
                    <VideoPlayer
                      videoUrl={msg.data.video_url}
                      snippets={msg.data.results}
                      currentTimeRange={selectedSnippet?.time_stamp}
                      onTimeUpdate={() => {}}
                      selectedSnippet={selectedSnippet}
                    />
                    <SnippetList
                      snippets={msg.data.results}
                      onSnippetClick={handleSnippetClick}
                      selectedSnippet={selectedSnippet}
                    />
                  </>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {isLoading && <div className="loading">Processing your request...</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(NexusSearch);