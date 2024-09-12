import React from 'react';
import { useNavigate } from 'react-router-dom';

const NexusLogo = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <svg width="192" height="96" viewBox="0 0 192 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="192" height="96" fill="#A65D3A"/>
            <path d="M174 72H148V57.0622H157.909V62.9046H164.058V55.2697L148 43.2199V24L174 24V38.2739H164.712V33.1618H158.236V39.4357L174 51.4523V72Z" fill="#FFFFFF"/>
            <path d="M142 72H113V24H123.277V62.9046H131.689V24H142V72Z" fill="#FFFFFF"/>
            <path d="M37.575 51.5519V24H47V72H37.1136L27.3591 44.4481V72H18V24H27.8864L37.575 51.5519Z" fill="#FFFFFF"/>
            <path d="M53 24H76.6629V33.1286H63.1124V42.39H75.9888V51.3527H63.2472V62.9046H77V72H53V24Z" fill="#FFFFFF"/>
            <path d="M82.9868 12H10V84H82.9868L110.145 12H182V84H110.145L82.9868 12Z" stroke="#FFFFFF" stroke-width="8"/>
        </svg>
    </div>
  );
};

export default NexusLogo;
