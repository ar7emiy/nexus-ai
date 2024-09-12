// src/components/NexusSearch.js
import React, { useState } from 'react';

const NexusSearch = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
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

  const handleSend = () => {
    if (input.trim() !== '') {
      // Save the user input in the history
      setHistory([...history, input]);

      // Determine the appropriate response based on the input
      const responseKey = input.includes('CNN') ? 'Improve CNN' : null;
      const response = responseKey ? videoData[responseKey] : null;

      if (response) {
        const newMessages = [
          ...messages,
          { text: input, isUser: true },
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
        // Handle case when no appropriate response is found
        const newMessages = [
          ...messages,
          { text: input, isUser: true },
          { text: `Sorry, I couldn't find any information on "${input}".`, isUser: false },
        ];
        setMessages(newMessages);
      }

      setInput('');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '250px', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <select style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
          <option>Course #: Name</option>
          <option>Course 1</option>
          <option>Course 2</option>
        </select>
        <h3>Previous Results</h3>
        <ul>
          {history.map((item, index) => (
            <li key={index} style={{ marginBottom: '10px', listStyleType: 'none', backgroundColor: '#fff', padding: '10px', borderRadius: '5px' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '10px' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  maxWidth: '60%',
                  padding: '10px',
                  backgroundColor: msg.isUser ? '#d1e7dd' : '#f8d7da',
                  borderRadius: '10px',
                  wordBreak: 'break-word',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your question here"
            style={{
              flexGrow: 1,
              padding: '10px',
              borderRadius: '20px',
              border: '1px solid #ccc',
              marginRight: '10px',
            }}
          />
          <button onClick={handleSend} style={{ padding: '10px 20px', borderRadius: '20px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}>
            ▶️
          </button>
        </div>
      </div>
    </div>
  );
};

export default NexusSearch;
