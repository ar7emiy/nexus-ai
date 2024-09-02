// src/components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const courses = [
  { name: 'Course 1', id: 1 },
  { name: 'Course 2', id: 2 },
  { name: 'Course 3', id: 3 },
  { name: 'Course 4', id: 4 },
  { name: 'Course 5', id: 5 },
  { name: 'Course 6', id: 6 },
  { name: 'Course 7', id: 7 },
  { name: 'Course 8', id: 8 },
  { name: 'Course 9', id: 9 },
  { name: 'Course 10', id: 10 }
];

const HomePage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome to NXS.AI</h1>
      <p>Start learning faster than ever with Nexus</p>
      
      <div style={{ margin: '10px 0', textAlign: 'left', paddingLeft:'180px' }}>
      <p>Select a course you want to learn</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {courses.slice(0, 5).map(course => (
          <div 
            key={course.id} 
            style={{ 
              border: '1px solid #000', 
              margin: '10px', 
              padding: '20px', 
              width: '150px', 
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <Link to="/main" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3>{course.name}</h3>
              <p>Course # {course.id}</p>
            </Link>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {courses.slice(5).map(course => (
          <div 
            key={course.id} 
            style={{ 
              border: '1px solid #000', 
              margin: '10px', 
              padding: '20px', 
              width: '150px', 
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <Link to="/main" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3>{course.name}</h3>
              <p>Course # {course.id}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
