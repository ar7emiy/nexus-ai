import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import './AITutor.css';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'monospace',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
    nodeSpacing: 100,
    rankSpacing: 100,
    wrap: true,
    fontSize: 12,
    labelBackground: 'transparent',
    rankDir: 'TB',        // Top to Bottom direction
    ranker: 'tight-tree'  // Use tree-like layout
  }
});
const generateMermaidChart = (data) => {
  let chart = 'graph TD\n';  // Changed to TD (top-down) layout
  
  // Add central topic
  chart += '    Main[Machine Learning in Healthcare]\n';
  
  // Add topics radially around the center
  data.topics.forEach((topic, index) => {
    const formattedName = topic.name.replace(/ /g, '<br/>');
    chart += `    Main --- ${topic.id}["${formattedName}"]\n`;
    
    // Add questions in a structured way below each topic
    topic.queries.forEach(query => {
      const words = query.text.split(' ');
      let formattedText = '';
      for (let i = 0; i < words.length; i += 6) {
        formattedText += words.slice(i, i + 6).join(' ') + '<br/>';
      }
      formattedText = formattedText.replace(/<br\/>$/, '');
      
      chart += `    ${topic.id} --> ${query.id}["${formattedText}"]\n`;
    });
  });
  
  // Add connections between questions with curved lines
  data.connections.forEach(([from, to]) => {
    chart += `    ${from} -.-o ${to}\n`;  // Changed to dotted lines with circle
  });
  
  // Enhanced styling
  chart += `
    classDef main fill:#2C3E50,stroke:#2C3E50,stroke-width:2px,rx:8,ry:8,font-size:22px,color:white
    classDef topic fill:#084a78,stroke:#333,stroke-width:2px,rx:8,ry:8,font-size:18px,color:white
    classDef question fill:#bee1fa,stroke:#666,stroke-width:1px,rx:5,ry:5,width:250px,font-size:16px
    classDef edgeLabel background:none,font-size:10px
    class Main main
    class ${data.topics.map(t => t.id).join(',')} topic
    class ${data.topics.flatMap(t => t.queries.map(q => q.id)).join(',')} question
  `;
  
  return chart;
};

const AITutor = () => {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  const data = {
    "topics": [
      {
        "id": "T1",
        "name": "Machine Learning Fundamentals",
        "queries": [
          {"id": "Q1", "text": "How does the naive Bayes approach function in terms of learning and classification?"},
          {"id": "Q2", "text": "What strategies can be employed to mitigate bias in machine learning datasets?"},
          {"id": "Q3", "text": "How do unsupervised and supervised learning differ in terms of their goals and methodologies?"},
          {"id": "Q4", "text": "What are the key differences between random forests and gradient boosting algorithms?"},
          {"id": "Q5", "text": "How are performance measures calculated for regression and classification models?"},
          {"id": "Q6", "text": "What is the role of feature selection in improving model accuracy?"}
        ]
      },
      {
        "id": "T2",
        "name": "Clinical Applications",
        "queries": [
          {"id": "Q7", "text": "How can machine learning enhance the range of questions addressed by clinical pharmacology?"},
          {"id": "Q8", "text": "What are the potential applications of AI in personalized medicine?"},
          {"id": "Q9", "text": "How is natural language processing being used to analyze electronic health records?"},
          {"id": "Q10", "text": "What ethical considerations arise when implementing AI in clinical decision support systems?"},
          {"id": "Q11", "text": "How can machine learning models be validated for use in clinical settings?"}
        ]
      },
      {
        "id": "T3",
        "name": "AI Ethics and Governance",
        "queries": [
          {"id": "Q12", "text": "What are the key ethical challenges in developing AI for healthcare applications?"},
          {"id": "Q13", "text": "How can we ensure fairness and transparency in AI-driven decision-making processes?"},
          {"id": "Q14", "text": "What regulatory frameworks are being developed to govern the use of AI in medicine?"}
        ]
      },
      {
        "id": "T4",
        "name": "Neural Networks in Pharmacology",
        "queries": [
          {"id": "Q15", "text": "How do recurrent neural networks handle time-series data in pharmacokinetic modeling?"},
          {"id": "Q16", "text": "What are the advantages of using LSTM networks for longitudinal clinical data?"},
          {"id": "Q17", "text": "How can neural networks be integrated with traditional pharmacometric approaches?"}
        ]
      },
      {
        "id": "T5",
        "name": "Clustering and Dimensionality Reduction",
        "queries": [
          {"id": "Q18", "text": "How does k-means clustering help identify patient subtypes in clinical data?"},
          {"id": "Q19", "text": "What role does density-based clustering play in analyzing molecular data?"},
          {"id": "Q20", "text": "How can dimensionality reduction techniques improve high-dimensional pharmacological data analysis?"}
        ]
      },
      {
        "id": "T6",
        "name": "Model Performance and Validation",
        "queries": [
          {"id": "Q21", "text": "How does cross-validation help prevent overfitting in pharmacological models?"},
          {"id": "Q22", "text": "What metrics are most appropriate for evaluating drug response prediction models?"},
          {"id": "Q23", "text": "How can we assess the generalizability of ML models in clinical applications?"}
        ]
      }
    ],
    "connections": [
      ["Q1", "Q7"],
      ["Q2", "Q10"],
      ["Q3", "Q8"],
      ["Q5", "Q11"],
      ["Q6", "Q9"],
      ["Q4", "Q13"],
      ["Q12", "Q11"],
      ["Q14", "Q10"],
      // New connections for neural networks
      ["Q15", "Q7"],
      ["Q16", "Q8"],
      ["Q17", "Q11"],
      // New connections for clustering
      ["Q18", "Q3"],
      ["Q19", "Q6"],
      ["Q20", "Q5"],
      // New connections for model performance
      ["Q21", "Q5"],
      ["Q22", "Q11"],
      ["Q23", "Q13"]
    ]
  };

  useEffect(() => {
    mermaid.contentLoaded();
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="ai-tutor">
      <div className="zoom-controls">
        <button onClick={handleZoomIn} className="zoom-button">
          <span>+</span>
        </button>
        <button onClick={handleZoomOut} className="zoom-button">
          <span>-</span>
        </button>
        <button onClick={handleReset} className="zoom-button">
          <span>Reset</span>
        </button>
      </div>
      <div 
        className="mermaid-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="mermaid"
          style={{
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {generateMermaidChart(data)}
        </div>
      </div>
    </div>
  );
};

export default AITutor;