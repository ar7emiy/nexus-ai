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
    <rect width="32" height="32" rx="16" fill="#5fb7f5"/>
    <path d="M22.3999 24.0001H9.59985V22.4001C9.59985 20.191 11.3907 18.4001 13.5999 18.4001H18.3999C20.609 18.4001 22.3999 20.191 22.3999 22.4001V24.0001ZM15.9999 16.8001C13.3489 16.8001 11.1999 14.651 11.1999 12.0001C11.1999 9.34911 13.3489 7.20007 15.9999 7.20007C18.6508 7.20007 20.7999 9.34911 20.7999 12.0001C20.7999 14.651 18.6508 16.8001 15.9999 16.8001Z" fill="white"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8.33334V31.6667" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M31.6667 20H8.33334" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="home-page__header">
        <NexusLogo />
        <ProfileIcon />
      </header>

      <main className="home-page__main-content">
        <div className="home-page__welcome-message">
          <h1 className="home-page__welcome-title">
            Welcome to <NexusLogo />
          </h1>
          <p className="home-page__welcome-subtitle">
            Start learning faster than ever with Nexus.ai
          </p>
        </div>

        <div className="home-page__course-list">
          {courses.map(course => (
            <Link 
              key={course.id} 
              to="/main" 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="home-page__course-item">
                <h3 className="home-page__course-name">{course.name}</h3>
                <p className="home-page__course-code">{course.code}</p>
              </div>
            </Link>
          ))}
          <Link 
            to="/course-builder" 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="home-page__course-item">
              <h3 className="home-page__course-name">Create Your Own</h3>
              <div className="home-page__plus-icon">
                <PlusIcon />
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;