import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const SimplifiedPDFViewer = ({ pdfUrl, initialSnippet }) => {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageText, setPageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        
        if (initialSnippet) {
          const snippetPage = await findSnippetPage(pdf, initialSnippet);
          if (snippetPage) {
            setPageNum(snippetPage);
            renderPage(snippetPage, pdf);
          } else {
            renderPage(1, pdf);
          }
        } else {
          renderPage(1, pdf);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError('Failed to load PDF. Please check the URL and try again.');
      }
    };

    if (pdfUrl) {
      loadPDF();
    }
  }, [pdfUrl, initialSnippet]);

  const findSnippetPage = async (pdf, snippet) => {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      if (pageText.includes(snippet)) {
        return i;
      }
    }
    return null;
  };

  const renderPage = async (num, doc = pdfDoc) => {
    if (!doc) return;

    const page = await doc.getPage(num);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    await page.render(renderContext);

    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    setPageText(text);

    // Highlight the initial snippet if we're on the correct page
    if (initialSnippet && text.includes(initialSnippet)) {
      highlightText(initialSnippet);
    }
  };

  const changePage = (offset) => {
    const newPageNum = pageNum + offset;
    if (newPageNum >= 1 && newPageNum <= totalPages) {
      setPageNum(newPageNum);
      renderPage(newPageNum);
    }
  };

  const handleSearch = () => {
    if (searchTerm) {
      highlightText(searchTerm);
    }
  };

  const highlightText = (text) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const regex = new RegExp(text, 'gi');
    const matches = [...pageText.matchAll(regex)];

    context.fillStyle = 'rgba(255, 255, 0, 0.3)';
    
    matches.forEach(match => {
      // This is a basic highlighting method and may not be perfectly accurate
      const x = 10; // You'd need to calculate this based on match.index
      const y = match.index / pageText.length * canvas.height; // Rough estimate
      context.fillRect(x, y, match[0].length * 10, 20);
    });
  };

  return (
    <div className="pdf-viewer">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="search-bar">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search term"
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          <canvas ref={canvasRef}></canvas>
          <div className="page-navigation">
            <button onClick={() => changePage(-1)} disabled={pageNum <= 1}>Previous</button>
            <span>Page {pageNum} of {totalPages}</span>
            <button onClick={() => changePage(1)} disabled={pageNum >= totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SimplifiedPDFViewer;