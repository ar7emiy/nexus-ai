// import React from 'react';
// import './AITutor.css';

// const AITutor = () => {
//   return (
//     <div className="ai-tutor">
//       <img src={`${process.env.PUBLIC_URL}/mind_map.png`} alt="Mind Map" className="ai-tutor__mind-map" />
//     </div>
//   );
// };

// export default AITutor;


import React, { useState, useEffect } from 'react';
import InteractiveMindMap from './InteractiveMindMap';
import './AITutor.css';

const AITutor = () => {
  const [mindMapData, setMindMapData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the mind map data
    fetch(`${process.env.PUBLIC_URL}/mind_map_data.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setMindMapData(data))
      .catch(e => {
        console.error("Fetch error:", e);
        setError("Failed to load mind map data");
      });
  }, []);

  if (error) return <div className="ai-tutor">Error: {error}</div>;

  return (
    <div className="ai-tutor">
      {mindMapData ? (
        <InteractiveMindMap data={mindMapData} />
      ) : (
        <p>Loading mind map...</p>
      )}
    </div>
  );
};

export default AITutor;