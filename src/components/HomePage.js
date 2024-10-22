import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import NexusLogo from './NexusLogo';
import NexusLogoBig from './NexusLogo_big';
import './HomePage.css';

const courses = [
  { name: 'Advanced Machine Learning II', id: 1, code: 'CSC 580' },
  { name: 'Natural Language Processing', id: 2, code: 'CSC 583' },
  { name: 'Neural Networks & Deep Learning', id: 3, code: 'CSC 578' },
];

const ProfileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="16" fill="#5fb7f5"/>
    <path d="M22.3999 24.0001H9.59985V22.4001C9.59985 20.191 11.3907 18.4001 13.5999 18.4001H18.3999C20.609 18.4001 22.3999 20.191 22.3999 22.4001V24.0001ZM15.9999 16.8001C13.3489 16.8001 11.1999 14.651 11.1999 12.0001C11.1999 9.34911 13.3489 7.20007 15.9999 7.20007C18.6508 7.20007 20.7999 9.34911 20.7999 12.0001C20.7999 14.651 18.6508 16.8001 15.9999 16.8001Z" fill="white"/>
  </svg>
);

const HomePage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'video/mp4') {
        setUploadedFile(file);
      } else {
        alert('Please upload an MP4 file.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'video/mp4',
    multiple: false
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploadStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Replace with your actual upload endpoint
      const response = await fetch('https://your-upload-endpoint.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    }
  };

  return (
    <div className="home-page">
      <header className="home-page__header">
        <NexusLogo />
        <ProfileIcon />
      </header>

      <main className="home-page__main-content">
        <div className="home-page__welcome-message">
          <h1 className="home-page__welcome-title">
            Welcome to <NexusLogoBig />
          </h1>
          <p className="home-page__welcome-subtitle">
            Start learning faster than ever with Nexus-ai
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
        </div>

        <div className="home-page__file-upload-area">
          <h2 className="home-page__file-upload-title">
            Upload Your Own Files
          </h2>
          <div {...getRootProps()} className={`home-page__file-upload-box ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {uploadedFile ? (
              <div className="home-page__uploaded-file">
                <p>{uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}>Remove</button>
              </div>
            ) : (
              <p>Drag and drop your MP4 file here, or click to select a file</p>
            )}
          </div>
          {uploadedFile && (
            <button 
              className="home-page__upload-button" 
              onClick={handleUpload}
              disabled={uploadStatus === 'uploading'}
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload and Process'}
            </button>
          )}
          {uploadStatus === 'uploading' && <div className="home-page__loading">Processing your file...</div>}
          {uploadStatus === 'success' && (
            <div className="home-page__success">
              <p>Success! Have fun learning!</p>
              <button onClick={() => navigate('/main')} className="home-page__go-to-main-button">
                Go to Main Page
              </button>
            </div>
          )}
          {uploadStatus === 'error' && <div className="home-page__error">Upload failed. Please try again.</div>}
        </div>
      </main>
    </div>
  );
};

export default HomePage;