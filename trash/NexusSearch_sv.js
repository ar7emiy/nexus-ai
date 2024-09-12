import React, { useState, useEffect } from 'react';

const NexusSearch = ({ inputValue, setInputValue, sendTrigger }) => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);

  // Sample data for videos, summaries, and citations
  const videoData = {
    'Improve CNN': {
      video: '/videos/improve_cnn.mp4',
      thumbnail: '/thumbnails/improve_cnn.png',
      summary: 'This video explains how data augmentation can improve the performance of CNN models in image classification tasks.',
      citations: [
        'Author A, "Improving CNN Performance," Journal of AI, 2023.',
        'Author B, "Data Augmentation Techniques," AI Review, 2022.',
      ],
    },
    // Add more video data as needed
  };

  const ProfileIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#2C2E3A"/>
      <path d="M22.3999 24.0001H9.59985V22.4001C9.59985 20.191 11.3907 18.4001 13.5999 18.4001H18.3999C20.609 18.4001 22.3999 20.191 22.3999 22.4001V24.0001ZM15.9999 16.8001C13.3489 16.8001 11.1999 14.651 11.1999 12.0001C11.1999 9.34911 13.3489 7.20007 15.9999 7.20007C18.6508 7.20007 20.7999 9.34911 20.7999 12.0001C20.7999 14.651 18.6508 16.8001 15.9999 16.8001Z" fill="white"/>
    </svg>
  );


  const ChatbotIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#0A21BF"/>
      <path d="M12.7053 11.2H4.80005V20.8H12.7053L19.4422 11.2H27.2V20.8H19.4422L12.7053 11.2Z" stroke="white" stroke-width="2"/>
    </svg>
  );

  const handleSend = () => {
    if (inputValue.trim() !== '') {
      // Determine the appropriate response based on the input
      const responseKey = inputValue.includes('CNN') ? 'Improve CNN' : null;
      const response = responseKey ? videoData[responseKey] : null;

      let systemResponse;

      if (response) {
        systemResponse = `Video: ${responseKey}, Summary: ${response.summary}`;
        const newMessages = [
          ...messages,
          { text: inputValue, isUser: true },
          {
            text: (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <img src={response.thumbnail} alt="Thumbnail" style={{ width: '100%' }} />
                  <video controls src={response.video} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Summary</div>
                <p>{response.summary}</p>
                <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Citations</div>
                <ul>
                  {response.citations.map((citation, index) => (
                    <li key={index}>{citation}</li>
                  ))}
                </ul>
              </div>
            ),
            isUser: false,
          },
        ];

        setMessages(newMessages);
      } else {
        systemResponse = `No information found for: "${inputValue}"`;
        // Handle case when no appropriate response is found
        const newMessages = [
          ...messages,
          { text: inputValue, isUser: true },
          { text: systemResponse, isUser: false },
        ];
        setMessages(newMessages);
      }

      // Save the system response in the history
      setHistory([...history, systemResponse]);

      setInputValue('');
    }
  };

  // Use effect to handle changes in sendTrigger
  useEffect(() => {
    if (sendTrigger > 0) {
      handleSend();
    }
  }, [sendTrigger]);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ width: '250px', padding: '10px', backgroundColor: '#ffffff', borderRight: '1px solid #e0e0e0' }}>
        <select style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
          <option>Course #: Name</option>
          <option>Course 1</option>
          <option>Course 2</option>
        </select>
        <h3>Previous Results</h3>
        <ul style={{ padding: 0, margin: 0 }}>
          {history.map((item, index) => (
            <li key={index} style={{ marginBottom: '10px', listStyleType: 'none', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '10px', backgroundColor: '#F0F1FA' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              {!msg.isUser && <ChatbotIcon />}
              <div
                style={{
                  maxWidth: '60%',
                  padding: '10px',
                  backgroundColor: msg.isUser ? '#2C2E3A' : '#ffffff',
                  color: msg.isUser ? '#ffffff' : '#2C2E3A',
                  borderRadius: '10px',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  marginLeft: msg.isUser ? '0' : '10px',
                  marginRight: msg.isUser ? '10px' : '0',
                }}
              >
                {msg.text}
              </div>
              {msg.isUser && <ProfileIcon />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NexusSearch;





