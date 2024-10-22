import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import * as pdfjsLib from 'pdfjs-dist';
import NexusLogo from './NexusLogo';
import './EnhancedPDFViewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const EnhancedPDFViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pdfUrl, searchTerm, results, relationSummary } = location.state || {};

  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const renderTaskRef = useRef(null);

  const renderPage = useCallback(async (num) => {
    if (!pdfDoc) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(num);
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

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
    } catch (err) {
      if (err instanceof pdfjsLib.RenderingCancelledException) {
        console.log('Rendering cancelled');
      } else {
        console.error('Error rendering page:', err);
        setError('Failed to render PDF page.');
      }
    } finally {
      renderTaskRef.current = null;
    }
  }, [pdfDoc]);

  useEffect(() => {
    if (!pdfUrl) {
      setError("No PDF URL provided");
      return;
    }

    let isMounted = true;

    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        if (isMounted) {
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          setError(`Failed to load PDF: ${err.message}. Please check the URL and try again.`);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum);
    }
  }, [pdfDoc, pageNum, renderPage]);

  const changePage = useCallback((offset) => {
    setPageNum((prevPageNum) => {
      const newPageNum = prevPageNum + offset;
      if (newPageNum >= 1 && newPageNum <= totalPages) {
        return newPageNum;
      }
      return prevPageNum;
    });
  }, [totalPages]);

  const ProfileIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#5fb7f5"/>
      <path d="M22.3999 24.0001H9.59985V22.4001C9.59985 20.191 11.3907 18.4001 13.5999 18.4001H18.3999C20.609 18.4001 22.3999 20.191 22.3999 22.4001V24.0001ZM15.9999 16.8001C13.3489 16.8001 11.1999 14.651 11.1999 12.0001C11.1999 9.34911 13.3489 7.20007 15.9999 7.20007C18.6508 7.20007 20.7999 9.34911 20.7999 12.0001C20.7999 14.651 18.6508 16.8001 15.9999 16.8001Z" fill="white"/>
    </svg>
  );

  return (
    <div className="pdf-viewer">
      <header className="pdf-viewer__header">
        <NexusLogo />
        <div className="pdf-viewer__buttons">
          <button className="pdf-viewer__button" onClick={() => navigate(-1)}>Back to Results</button>
          <select className="pdf-viewer__select">
            <option>Select PDF</option>
            {'No other PDFs'}
          </select>
        </div>
        <ProfileIcon />
      </header>
      <main className="pdf-viewer__main-content">
        <section className="pdf-viewer__pdf-section">
          {error ? (
            <p className="pdf-viewer__error-message">{error}</p>
          ) : (
            <div className="pdf-viewer__pdf-container">
              <div className="pdf-viewer__canvas-container">
                <canvas ref={canvasRef} className="pdf-viewer__canvas"></canvas>
              </div>
              <div className="pdf-viewer__page-navigation">
                <button 
                  className="pdf-viewer__nav-button" 
                  onClick={() => changePage(-1)} 
                  disabled={pageNum <= 1}
                >
                  Previous
                </button>
                <span>Page {pageNum} of {totalPages}</span>
                <button 
                  className="pdf-viewer__nav-button" 
                  onClick={() => changePage(1)} 
                  disabled={pageNum >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
        <section className="pdf-viewer__snippets-section">
          <h3 className="pdf-viewer__snippets-title">Search Results for: {searchTerm}</h3>
          <div className="pdf-viewer__snippets-container">
            <div className="pdf-viewer__snippet-item pdf-viewer__relation-summary">
              <h4>Relation Summary</h4>
              <div className="pdf-viewer__markdown-content">
                <ReactMarkdown>{relationSummary}</ReactMarkdown>
              </div>
            </div>
            {results && results.map((result, index) => (
              <div key={index} className="pdf-viewer__snippet-item">
                <h4>Snippet {index + 1}</h4>
                <p><strong>Text:</strong> {result.text}</p>
                <p><strong>Page:</strong> {result.page_number}</p>
                <p className="pdf-viewer__similarity"><strong>Similarity:</strong> {result.similarity.toFixed(4)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default EnhancedPDFViewer;