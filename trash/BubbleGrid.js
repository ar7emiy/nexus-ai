import React from 'react';

const BubbleGrid = ({ snippets, onBubbleClick, selectedSnippet }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        {snippets.map((snippet, index) => (
          <div
            key={index}
            onClick={() => onBubbleClick(snippet)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: selectedSnippet === snippet ? '#A65D3A' : '#C9A58A',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              color: selectedSnippet === snippet ? 'white' : 'black',
              fontWeight: 'bold',
            }}
          >
            s{index + 1}
          </div>
        ))}
      </div>
      <div>
        {snippets.map((snippet, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>s{index + 1}: </strong>{snippet.summary}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BubbleGrid;