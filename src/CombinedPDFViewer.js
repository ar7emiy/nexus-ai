import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Levenshtein distance function for fuzzy matching
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

const CombinedPDFViewer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pdfUrl, results } = location.state || {};
  
    const canvasRef = useRef(null);
    const textLayerRef = useRef(null);
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
  
        // Render text layer
        const textContent = await page.getTextContent();
        if (textLayerRef.current) {
          textLayerRef.current.innerHTML = '';
          
          const textLayer = new pdfjsLib.TextLayer({
            textContentSource: textContent,
            container: textLayerRef.current,
            viewport: viewport,
            textDivs: []
          });
  
          await textLayer.render();
        }
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
  
  
    const searchAndHighlight = useCallback(async (searchText) => {
      if (!pdfDoc) return;
  
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
  
        // Find the closest matching text in the page
        let bestMatch = '';
        let bestDistance = Infinity;
        const words = pageText.split(/\s+/);
        const searchWords = searchText.split(/\s+/);
  
        for (let j = 0; j < words.length - searchWords.length + 1; j++) {
          const candidateText = words.slice(j, j + searchWords.length).join(' ');
          const distance = levenshteinDistance(candidateText.toLowerCase(), searchText.toLowerCase());
          if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = candidateText;
          }
        }
  
        if (bestMatch) {
          setPageNum(i);
          await renderPage(i);
  
          // Highlight the best match
          const textLayer = textLayerRef.current;
          if (textLayer) {
            const regex = new RegExp(bestMatch.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
            textLayer.innerHTML = textLayer.innerHTML.replace(regex, match => `<mark>${match}</mark>`);
          }
  
          break;
        }
      }
    }, [pdfDoc, renderPage]);
  
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
    
      const handleSnippetClick = useCallback((snippet) => {
        searchAndHighlight(snippet.summary);
      }, [searchAndHighlight]);
    
      return (
        <div className="pdf-viewer-page">
          <button onClick={() => navigate(-1)} className="back-button">Back to Results</button>
          <div className="pdf-viewer-container">
            <div className="results-sidebar">
              <h3>Search Results</h3>
              {results && results.map((result, index) => (
                <div 
                  key={index} 
                  className="result-item"
                  onClick={() => handleSnippetClick(result)}
                >
                  <p>{result.summary}</p>
                  <span className="similarity">Similarity: {result.similarity.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {error ? (
              <p className="error-message">{error}</p>
            ) : (
              <div className="pdf-viewer">
                <div className="pdf-content">
                  <div className="canvas-container">
                    <canvas ref={canvasRef}></canvas>
                    <div ref={textLayerRef} className="textLayer"></div>
                  </div>
                </div>
                <div className="page-navigation">
                  <button onClick={() => changePage(-1)} disabled={pageNum <= 1}>Previous</button>
                  <span>Page {pageNum} of {totalPages}</span>
                  <button onClick={() => changePage(1)} disabled={pageNum >= totalPages}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };
    
    export default CombinedPDFViewer;