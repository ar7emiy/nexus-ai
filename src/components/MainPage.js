import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AITutor from './AITutor';
import TextInputBar from './TextInputBar';
import NexusLogo from './NexusLogo';
import VideoPlayer from './VideoPlayer';
import './MainPage.css';

const MainPage = () => {
  const [activeTab, setActiveTab] = useState('nexus');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedVideoSnippet, setSelectedVideoSnippet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleInputChange = useCallback((newInput) => {
    setInput(newInput);
  }, []);

  const handleSend = useCallback(async () => {
    if (input.trim() !== '') {
      try {
        setIsLoading(true);
        setMessages(prevMessages => [...prevMessages, { text: input, isUser: true }]);

        // Make both API calls
        const videoResponse = await fetch('https://nxs-function-874406122772.us-central1.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        });
        const videoData = await videoResponse.json();

        const pdfResponse = await fetch('https://us-central1-silver-idea-432502-c0.cloudfunctions.net/pdf_retrieval_function', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        });
        const pdfData = await pdfResponse.json();

        setVideoUrl(videoData.video_url);
        setPdfUrl(pdfData.pdf_url);

        setMessages(prevMessages => [
          ...prevMessages,
          { 
            isUser: false, 
            customContent: true,
            videoData: videoData,
            pdfData: pdfData
          },
        ]);

        setHistory(prevHistory => [...prevHistory, input]);
        setSelectedVideoSnippet(videoData.results[0]);
        setInput('');
      } catch (error) {
        console.error('Error processing request:', error);
        setMessages(prevMessages => [...prevMessages, { text: 'Error processing your request', isUser: false }]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [input]);

  const handleVideoSnippetClick = useCallback((snippet) => {
    setSelectedVideoSnippet(snippet);
  }, []);

  const handleViewPDF = useCallback(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && !lastMessage.isUser) {
      navigate('/pdf-viewer', { 
        state: { 
          pdfUrl: pdfUrl, 
          searchTerm: input, 
          results: lastMessage.pdfData.results 
        } 
      });
    }
  }, [messages, pdfUrl, input, navigate]);

  const formatTimestamp = (timestamp) => {
    return timestamp.split('.')[0];
  };

  const ProfileIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#A65D3A"/>
      <path d="M22.3999 24.0001H9.59985V22.4001C9.59985 20.191 11.3907 18.4001 13.5999 18.4001H18.3999C20.609 18.4001 22.3999 20.191 22.3999 22.4001V24.0001ZM15.9999 16.8001C13.3489 16.8001 11.1999 14.651 11.1999 12.0001C11.1999 9.34911 13.3489 7.20007 15.9999 7.20007C18.6508 7.20007 20.7999 9.34911 20.7999 12.0001C20.7999 14.651 18.6508 16.8001 15.9999 16.8001Z" fill="white"/>
    </svg>
  );

  const BotIcon = () => (
    <div className="bot-icon">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="16" fill="#A65D3A"/>
        <path d="M12.7053 11.2H4.80005V20.8H12.7053L19.4422 11.2H27.2V20.8H19.4422L12.7053 11.2Z" stroke="white" strokeWidth="2"/>
      </svg>
    </div>
  );

  const VideoSnippetList = React.memo(({ snippets, onSnippetClick, selectedSnippet }) => (
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

  const PDFSnippetList = React.memo(({ snippets }) => (
    <div className="snippet-list">
      {snippets.map((snippet, index) => (
        <div key={index} className="snippet-item">
          <p>{snippet.summary}</p>
          <span className="similarity">Similarity: {snippet.similarity.toFixed(2)}</span>
        </div>
      ))}
    </div>
  ));

  return (
    <div className="main-container">
      <header className="header">
        <NexusLogo />
        <div className="tab-container">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'nexus' ? 'active' : ''}`}
              onClick={() => setActiveTab('nexus')}
            >
              Nexus Search
            </button>
            <button
              className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              AI Tutor
            </button>
          </div>
        </div>
        <ProfileIcon />
      </header>
      <div className="content-area">
        {activeTab === 'nexus' && (
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
                    {!msg.isUser && <BotIcon />}
                    <div className="message-content">
                      {msg.customContent ? (
                        <>
                          <h3>Video Results</h3>
                          <VideoPlayer
                            videoUrl={videoUrl}
                            snippets={msg.videoData.results}
                            currentTimeRange={selectedVideoSnippet?.time_stamp}
                            onTimeUpdate={() => {}}
                            selectedSnippet={selectedVideoSnippet}
                          />
                          <VideoSnippetList
                            snippets={msg.videoData.results}
                            onSnippetClick={handleVideoSnippetClick}
                            selectedSnippet={selectedVideoSnippet}
                          />
                          <h3>PDF Results</h3>
                          <button onClick={handleViewPDF}>View PDF</button>
                          <PDFSnippetList snippets={msg.pdfData.results} />
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
        )}
        {activeTab === 'ai' && <AITutor />}
      </div>
      <TextInputBar value={input} onChange={handleInputChange} onSend={handleSend} />
    </div>
  );
};

export default MainPage;