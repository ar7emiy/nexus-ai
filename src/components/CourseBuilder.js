import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import NexusLogo from './NexusLogo';
import './CourseBuilder.css';

const ProfileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="16" fill="#5fb7f5"/>
    <path d="M22.3999 24.0001H9.59985V22.4001C9.59985 20.191 11.3907 18.4001 13.5999 18.4001H18.3999C20.609 18.4001 22.3999 20.191 22.3999 22.4001V24.0001ZM15.9999 16.8001C13.3489 16.8001 11.1999 14.651 11.1999 12.0001C11.1999 9.34911 13.3489 7.20007 15.9999 7.20007C18.6508 7.20007 20.7999 9.34911 20.7999 12.0001C20.7999 14.651 18.6508 16.8001 15.9999 16.8001Z" fill="white"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const RemoveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  
  const Module = ({ index, module, onFileChange, onNameChange, onRemove }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: files => {
        if (files.length > 0) {
          onFileChange(index, files[0]);
        }
      },
      accept: 'video/mp4',
      multiple: false
    });
  
    return (
      <div className="course-builder__module">
        <div className="course-builder__module-header">
          <input
            type="text"
            placeholder="Module Name"
            value={module.name}
            onChange={(e) => onNameChange(index, e.target.value)}
            className="course-builder__input"
          />
          <button 
            className="course-builder__remove-module"
            onClick={() => onRemove(index)}
            title="Remove Module"
          >
            <RemoveIcon />
          </button>
        </div>
      <div {...getRootProps()} className={`course-builder__upload-box ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {module.file ? (
          <div className="course-builder__file-info">
            <p>{module.file.name} ({(module.file.size / 1024 / 1024).toFixed(2)} MB)</p>
            <button onClick={(e) => { e.stopPropagation(); onFileChange(index, null); }}>Remove</button>
          </div>
        ) : (
          <p>Drag and drop your MP4 file here, or click to select a file</p>
        )}
      </div>
    </div>
  );
};

const CourseBuilder = () => {
  const [courseName, setCourseName] = useState('');
  const [modules, setModules] = useState([{ id: 1, name: '', file: null }]);
  //const navigate = useNavigate();

  const addModule = () => {
    setModules([...modules, { id: modules.length + 1, name: '', file: null }]);
  };

  const removeModule = (index) => {
    if (modules.length > 1) {
      const newModules = modules.filter((_, i) => i !== index);
      setModules(newModules);
    }
  };


  const handleModuleNameChange = (index, name) => {
    const newModules = [...modules];
    newModules[index].name = name;
    setModules(newModules);
  };

  const handleFileChange = (index, file) => {
    const newModules = [...modules];
    newModules[index].file = file;
    setModules(newModules);
  };

  return (
    <div className="home-page">
      <header className="home-page__header">
        <NexusLogo />
        <ProfileIcon />
      </header>

      <main className="course-builder__main">
        <Link to="/" className="course-builder__back-button">
          Return to Homepage
        </Link>

        <div className="course-builder__content">
          <div className="course-builder__course-section">
            <input
              type="text"
              placeholder="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="course-builder__input course-builder__input--large"
            />
          </div>

          <div className="course-builder__modules-section">
            {modules.map((module, index) => (
              <Module
                key={module.id}
                index={index}
                module={module}
                onFileChange={handleFileChange}
                onNameChange={handleModuleNameChange}
                onRemove={removeModule}
              />
            ))}
          </div>

          <button className="course-builder__add-module" onClick={addModule}>
            <PlusIcon />
            Add Module
          </button>

          <div className="course-builder__actions">
            <button className="course-builder__button course-builder__button--save">
              Save Draft
            </button>
            <button className="course-builder__button course-builder__button--submit">
              Submit Course
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseBuilder;