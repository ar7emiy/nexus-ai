import React, { useState } from 'react';
import NexusSearch from './NexusSearch';
import AITutor from './AITutor';
import TextInputBar from './TextInputBar';
import NexusLogo from './NexusLogo';

const MainPage = () => {
  const [activeTab, setActiveTab] = useState('nexus');
  const [input, setInput] = useState('');
  const [sendTrigger, setSendTrigger] = useState(0);

  const handleInputChange = (newInput) => {
    setInput(newInput);
  };

  const handleSend = () => {
    setSendTrigger(prev => prev + 1);
  };

  const buttonStyle = (tab) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: activeTab === tab ? '#A65D3A' : 'transparent',
    color: activeTab === tab ? '#fff' : '#A65D3A',
    borderRadius: tab === 'nexus' ? '8px 0 0 8px' : '0 8px 8px 0',
    transition: 'background-color 0.3s, color 0.3s',
  });

  const ProfileIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#A65D3A"/>
      <path d="M22.3999 24.0001H9.59985V22.4001C9.59985 20.191 11.3907 18.4001 13.5999 18.4001H18.3999C20.609 18.4001 22.3999 20.191 22.3999 22.4001V24.0001ZM15.9999 16.8001C13.3489 16.8001 11.1999 14.651 11.1999 12.0001C11.1999 9.34911 13.3489 7.20007 15.9999 7.20007C18.6508 7.20007 20.7999 9.34911 20.7999 12.0001C20.7999 14.651 18.6508 16.8001 15.9999 16.8001Z" fill="white"/>
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px', 
        backgroundColor: '#C9A58A', // Updated color for header
        borderBottom: '1px solid #E0E0E0'
      }}>
        <NexusLogo />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            backgroundColor: '#F0F1FA', 
            borderRadius: '8px', 
            display: 'inline-flex',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <button
              style={buttonStyle('nexus')}
              onClick={() => setActiveTab('nexus')}
            >
              Nexus Search
            </button>
            <button
              style={buttonStyle('ai')}
              onClick={() => setActiveTab('ai')}
            >
              AI Tutor
            </button>
          </div>
        </div>
        <ProfileIcon />
      </div>
      <div style={{ flex: 1, display: 'flex', backgroundColor: '#F0F1FA' }}>
        {activeTab === 'nexus' && <NexusSearch inputValue={input} setInputValue={setInput} sendTrigger={sendTrigger} />}
        {activeTab === 'ai' && <AITutor />}
      </div>
      <TextInputBar value={input} onChange={handleInputChange} onSend={handleSend} />
    </div>
  );
};

export default MainPage;
