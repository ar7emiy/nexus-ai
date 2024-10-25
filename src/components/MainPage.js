import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import AITutor from './AITutor';
import TextInputBar from './TextInputBar';
import NexusLogo from './NexusLogo';
import VideoPlayer from './VideoPlayer';
import './MainPage.css';

const MainPage = () => {
  const location = useLocation();
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

  // Restore state from navigation
  useEffect(() => {
    if (location.state?.messages) {
      setMessages(location.state.messages);
    }
    if (location.state?.history) {
      setHistory(location.state.history);
    }
    if (location.state?.videoUrl) {
      setVideoUrl(location.state.videoUrl);
    }
    if (location.state?.pdfUrl) {
      setPdfUrl(location.state.pdfUrl);
    }
    if (location.state?.selectedVideoSnippet) {
      setSelectedVideoSnippet(location.state.selectedVideoSnippet);
    }
  }, [location.state]);

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

        const pdfResponse = await fetch('https://pdf-retrieval-function-874406122772.us-central1.run.app', {
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
          results: lastMessage.pdfData.results,
          relationSummary: lastMessage.pdfData.relation_summary,
          messages: messages,
          history: history,
          videoUrl: videoUrl,
          selectedVideoSnippet: selectedVideoSnippet
        } 
      });
    }
  }, [messages, pdfUrl, input, navigate, history, videoUrl, selectedVideoSnippet]);

  const formatTimestamp = (timestamp) => {
    return timestamp.split('.')[0];
  };

  const ProfileIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#5fb7f5"/>
      <path d="M22.3999 24.0001H9.59985V22.4001C9.59985 20.191 11.3907 18.4001 13.5999 18.4001H18.3999C20.609 18.4001 22.3999 20.191 22.3999 22.4001V24.0001ZM15.9999 16.8001C13.3489 16.8001 11.1999 14.651 11.1999 12.0001C11.1999 9.34911 13.3489 7.20007 15.9999 7.20007C18.6508 7.20007 20.7999 9.34911 20.7999 12.0001C20.7999 14.651 18.6508 16.8001 15.9999 16.8001Z" fill="white"/>
    </svg>
  );

  const BotIcon = () => (
    <div className="main-page__bot-icon">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="16" fill="#5fb7f5"/>
        <path d="M12.7053 11.2H4.80005V20.8H12.7053L19.4422 11.2H27.2V20.8H19.4422L12.7053 11.2Z" stroke="white" strokeWidth="2"/>
      </svg>
    </div>
  );

  const VideoSnippetList = React.memo(({ snippets, onSnippetClick, selectedSnippet }) => (
    <div className="main-page__snippet-list">
      {snippets.map((snippet, index) => (
        <div 
          key={index}
          onClick={() => onSnippetClick(snippet)}
          className={`main-page__snippet-item ${selectedSnippet === snippet ? 'main-page__snippet-item--selected' : ''}`}
        >
          <div className="main-page__snippet-content">
            <ReactMarkdown className="main-page__markdown-content">
              {snippet.summary}
            </ReactMarkdown>
            <span className="main-page__timestamp">
              [{formatTimestamp(snippet.time_stamp.start_time)} - {formatTimestamp(snippet.time_stamp.end_time)}]
            </span>
          </div>
        </div>
      ))}
    </div>
  ));

  const PDFSummary = React.memo(({ relationSummary, onViewPDF }) => (
    <div className="main-page__pdf-summary">
      <div className="main-page__pdf-summary-header">
        <h3>PDF Summary</h3>
        <button onClick={onViewPDF} className="main-page__view-pdf-button">View Full PDF</button>
      </div>
      <div className="main-page__pdf-summary-content">
        <ReactMarkdown>{relationSummary}</ReactMarkdown>
      </div>
    </div>
  ));

  return (
    <div className="main-page">
      <header className="main-page__header">
        <NexusLogo />
        <div className="main-page__tab-container">
          <div className="main-page__tab-buttons">
            <button
              className={`main-page__tab-button ${activeTab === 'nexus' ? 'main-page__tab-button--active' : ''}`}
              onClick={() => setActiveTab('nexus')}
            >
              Nexus Search
            </button>
            <button
              className={`main-page__tab-button ${activeTab === 'ai' ? 'main-page__tab-button--active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              QnA-mapping
            </button>
          </div>
        </div>
        <ProfileIcon />
      </header>
      <div className="main-page__content-area">
        {activeTab === 'nexus' && (
          <div className="main-page__nexus-search">
            <div className="main-page__sidebar">
              <select className="main-page__course-select">
                <option>Advanced Machine Learning II</option>
                <option>Natural Language Processing</option>
                <option>Neural Networks & Deep Learning</option>
              </select>
              <h3>Previous Results</h3>
              <ul className="main-page__history-list">
                {history.map((item, index) => (
                  <li key={index} className="main-page__history-item">{item}</li>
                ))}
              </ul>
            </div>
            <div className="main-page__main-content">
              <div className="main-page__message-container">
                {messages.map((msg, index) => (
                  <div key={index} className={`main-page__message ${msg.isUser ? 'main-page__message--user' : ''}`}>
                    {!msg.isUser && <BotIcon />}
                    <div className="main-page__message-content">
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
                          <PDFSummary 
                            relationSummary={msg.pdfData.relation_summary}
                            onViewPDF={handleViewPDF}
                          />
                        </>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && <div className="main-page__loading">Processing your request...</div>}
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