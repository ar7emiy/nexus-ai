import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SimplifiedPDFViewer from './SimplifiedPDFViewer';

const PDFViewerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pdfUrl, searchTerm, results } = location.state || {};

  // Assume the first result is the most relevant
  const initialSnippet = results && results.length > 0 ? results[0].text : '';

  return (
    <div className="pdf-viewer-page">
      <button onClick={() => navigate(-1)} className="back-button">Back to Results</button>
      <SimplifiedPDFViewer pdfUrl={pdfUrl} initialSnippet={initialSnippet} />
      <div className="results-sidebar">
        <h3>Search Results</h3>
        {results && results.map((result, index) => (
          <div key={index} className="result-item">
            <p>{result.summary}</p>
            <span className="similarity">Similarity: {result.similarity.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewerPage;