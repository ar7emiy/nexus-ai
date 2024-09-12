import React from 'react';
import { Link } from 'react-router-dom';
import NexusLogo from './NexusLogo';
import './HomePage.css';

const courses = [
  { name: 'Artificial Intelligence II', id: 1, code: 'CSC 580' },
  { name: 'Natural Language Processing', id: 2, code: 'CSC 583' },
  { name: 'Neural Networks & Deep Learning', id: 3, code: 'CSC 578' },
];

const ProfileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="16" fill="#A65D3A"/>
    <path d="M22.3999 24.0001H9.59985V22.4001C9.59985 20.191 11.3907 18.4001 13.5999 18.4001H18.3999C20.609 18.4001 22.3999 20.191 22.3999 22.4001V24.0001ZM15.9999 16.8001C13.3489 16.8001 11.1999 14.651 11.1999 12.0001C11.1999 9.34911 13.3489 7.20007 15.9999 7.20007C18.6508 7.20007 20.7999 9.34911 20.7999 12.0001C20.7999 14.651 18.6508 16.8001 15.9999 16.8001Z" fill="white"/>
  </svg>
);

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="header">
        <NexusLogo />
        <ProfileIcon />
      </header>

      <main className="main-content">
        <div className="welcome-message">
          <h1 className="welcome-title">
            Welcome to <NexusLogo />
          </h1>
          <p className="welcome-subtitle">
            Start learning faster than ever with Nexus.ai
          </p>
        </div>

        <div className="course-list">
          {courses.map(course => (
            <Link 
              key={course.id} 
              to="/main" 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="course-item">
                <h3 className="course-name">{course.name}</h3>
                <p className="course-code">{course.code}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="file-upload-area">
          <h2 className="file-upload-title">
            Upload Your Own Files
          </h2>
          <div className="file-upload-box">
            <p>Drag and drop your MP4 or PDF files here, or click to select files</p>
            <input type="file" style={{ display: 'none' }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;