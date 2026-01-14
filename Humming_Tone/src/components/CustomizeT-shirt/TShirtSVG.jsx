import React from 'react';

const TShirtSVG = ({ color = '#ffffff', design, side = 'front' }) => {
  const strokeColor = "#1a1a1a";
  const stitchColor = "#4b5563";

  return (
    <svg width="400" height="400" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      {/* Main Body & Sleeves - Unified path for clean silhouette */}
      <path
        d="M150 110 
           Q250 145 350 110 
           L470 210 L410 275 L365 240 
           V450 H135 V240 
           L90 275 L30 210 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sleeve Seams */}
      <path d="M135 240 L150 110" fill="none" stroke={strokeColor} strokeWidth="2" />
      <path d="M365 240 L350 110" fill="none" stroke={strokeColor} strokeWidth="2" />

      {/* Neckline Details */}
      {side === 'front' ? (
        <>
          {/* Back of neck visible from front */}
          <path d="M150 110 Q250 130 350 110" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          {/* Front neck curve */}
          <path d="M150 110 Q250 175 350 110" fill="none" stroke={strokeColor} strokeWidth="2" />
          {/* Stitching on collar */}
          <path 
            d="M158 122 Q250 178 342 122" 
            fill="none" 
            stroke={stitchColor} 
            strokeWidth="1" 
            strokeDasharray="4 3" 
          />
        </>
      ) : (
        <>
          {/* Back neck curve (higher) */}
          <path d="M150 110 Q250 135 350 110" fill="none" stroke={strokeColor} strokeWidth="2" />
          <path 
            d="M155 118 Q250 140 345 118" 
            fill="none" 
            stroke={stitchColor} 
            strokeWidth="1" 
            strokeDasharray="4 3" 
          />
        </>
      )}

      {/* Hem Stitching (Sleeves and Bottom) */}
      {/* Left Sleeve Hem */}
      <path d="M42 220 L98 266" fill="none" stroke={stitchColor} strokeWidth="1" strokeDasharray="4 3" />
      {/* Right Sleeve Hem */}
      <path d="M458 220 L402 266" fill="none" stroke={stitchColor} strokeWidth="1" strokeDasharray="4 3" />
      {/* Bottom Hem */}
      <path d="M135 435 H365" fill="none" stroke={stitchColor} strokeWidth="1" strokeDasharray="4 3" />

      {/* Design Overlay (Front Only) */}
      {side === 'front' && design && (
        <g transform="translate(250, 260)">
          {design.type === 'text' ? (
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill={design.color}
              fontSize={design.size}
              fontFamily={design.font}
              fontWeight={design.bold ? 'bold' : 'normal'}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {design.content}
            </text>
          ) : design.type === 'image' && design.content ? (
            <image
              href={design.content}
              x="-60"
              y="-60"
              width="120"
              height="120"
              preserveAspectRatio="xMidYMid meet"
              style={{ pointerEvents: 'none' }}
            />
          ) : null}
        </g>
      )}
    </svg>
  );
};

export default TShirtSVG;