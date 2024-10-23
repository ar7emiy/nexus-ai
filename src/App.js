// src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import HomePage from './components/HomePage';
// import MainPage from './components/MainPage';
// import CombinedPDFViewer from './components/CombinedPDFViewer';
// //import TestPage from './pages/TestPage';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/main" element={<MainPage />} />
//         <Route path="/pdf-viewer" element={<CombinedPDFViewer />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import MainPage from './components/MainPage';
import EnhancedPDFViewer from './components/EnhancedPDFViewer';
import CourseBuilder from './components/CourseBuilder';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/pdf-viewer" element={<EnhancedPDFViewer />} />
        <Route path="/course-builder" element={<CourseBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;