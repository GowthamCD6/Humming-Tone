// components/PoloSVG.jsx
import React from 'react';

const PoloShirtSVG = ({ color, design, side }) => {
  return (
    <svg width="300" height="400" viewBox="0 0 300 400" className="product-svg">
      {/* Polo Shirt Body */}
      <path 
        d="M150,50 C200,50 250,100 250,150 L250,300 C250,350 200,400 150,400 C100,400 50,350 50,300 L50,150 C50,100 100,50 150,50 Z" 
        fill={color}
        stroke="#333"
        strokeWidth="2"
      />
      
      {/* Polo Collar */}
      <path 
        d="M140,80 L150,70 L160,80 L160,100 L140,100 Z" 
        fill={color}
        stroke="#333"
        strokeWidth="1.5"
      />
      
      {/* Collar opening */}
      <line x1="150" y1="70" x2="150" y2="100" stroke="#333" strokeWidth="1.5" />
      
      {/* Button placket */}
      <rect x="148" y="80" width="4" height="40" fill="#333" />
      
      {/* Buttons */}
      <circle cx="150" cy="95" r="3" fill="#333" />
      <circle cx="150" cy="110" r="3" fill="#333" />
      
      {/* Polo sleeve plackets */}
      <path 
        d="M65,160 L55,170 L65,180" 
        fill="none"
        stroke="#333"
        strokeWidth="1.5"
      />
      <path 
        d="M235,160 L245,170 L235,180" 
        fill="none"
        stroke="#333"
        strokeWidth="1.5"
      />
      
      {/* Sleeves */}
      <path 
        d="M50,150 Q40,145 35,160 L30,180 Q28,200 35,220 L50,210 Q45,180 50,150 Z" 
        fill={color}
        stroke="#333"
        strokeWidth="2"
      />
      <path 
        d="M250,150 Q260,145 265,160 L270,180 Q272,200 265,220 L250,210 Q255,180 250,150 Z" 
        fill={color}
        stroke="#333"
        strokeWidth="2"
      />
      
      {/* Design Area Indicator */}
      <rect x="100" y="120" width="100" height="80" rx="5" fill="transparent" stroke="#666" strokeDasharray="4" strokeWidth="1" />
      
      {/* Current Design */}
      {design && (
        <g transform="translate(100, 120)">
          {design.type === 'text' ? (
            <text 
              x="50" 
              y="40" 
              textAnchor="middle"
              dominantBaseline="middle"
              fill={design.color}
              fontSize={design.size}
              fontFamily={design.font}
              fontWeight={design.bold ? 'bold' : 'normal'}
              style={{ pointerEvents: 'none' }}
            >
              {design.content}
            </text>
          ) : design.type === 'image' && design.content ? (
            <image 
              href={design.content} 
              width="100" 
              height="80" 
              preserveAspectRatio="xMidYMid meet"
              style={{ pointerEvents: 'none' }}
            />
          ) : null}
        </g>
      )}
      
      {/* Side Indicator */}
      <text x="150" y="380" textAnchor="middle" fill="#666" fontSize="14" fontFamily="Inter">
        {side === 'front' ? 'FRONT VIEW' : 'BACK VIEW'}
      </text>
    </svg>
  );
};

export default PoloShirtSVG;