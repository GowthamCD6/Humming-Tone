import React from 'react';

const LongSleeve3D = ({ color = '#ffffff', design, side = 'front' }) => {
  const filterId = React.useId().replace(/:/g, "");

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Shadow filter for 3D depth */}
        <filter id={`depth-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
          <feOffset in="blur" dx="2" dy="4" result="offsetBlur" />
          <feComponentTransfer in="offsetBlur" result="shadow">
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shading Gradient for Body Curvature */}
        <linearGradient id={`shading-${filterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="black" stopOpacity="0.15" />
          <stop offset="20%" stopColor="white" stopOpacity="0.05" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="80%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="black" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <g filter={`url(#depth-${filterId})`}>
        {/* Main Garment Silhouette */}
        <path
          d="M175 80 
             Q250 100 325 80
             L410 115 L445 420 L405 420 L380 155
             V440 H120 V155
             L95 420 L55 420 L90 115 Z"
          fill={color}
          stroke="#1a1a1a"
          strokeWidth="1.2"
        />

        {/* 3D Curvature Overlay */}
        <path
          d="M175 80 Q250 100 325 80 L410 115 L445 420 L405 420 L380 155 V440 H120 V155 L95 420 L55 420 L90 115 Z"
          fill={`url(#shading-${filterId})`}
          pointerEvents="none"
        />

        {/* Neckline Details */}
        {side === 'front' ? (
          <>
            {/* Back inner collar depth */}
            <path d="M175 80 Q250 105 325 80" fill="#333" opacity="0.2" />
            {/* Front collar rim */}
            <path d="M175 80 Q250 140 325 80" fill="none" stroke="#1a1a1a" strokeWidth="2" />
            {/* Collar Stitching */}
            <path d="M185 92 Q250 145 315 92" fill="none" stroke="#4b5563" strokeWidth="0.8" strokeDasharray="3 2" />
          </>
        ) : (
          <>
            <path d="M175 80 Q250 115 325 80" fill="none" stroke="#1a1a1a" strokeWidth="2" />
          </>
        )}

        {/* Hem and Cuff Stitching */}
        <g stroke="#4b5563" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6">
          <path d="M120 425 H380" /> {/* Bottom Hem */}
          <path d="M57 408 L93 408" /> {/* Left Cuff */}
          <path d="M407 408 L443 408" /> {/* Right Cuff */}
        </g>
      </g>

      {/* Design Placement (Chest Area) */}
      {side === 'front' && design && (
        <g transform="translate(250, 230)">
          {design.type === 'text' ? (
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill={design.color}
              fontSize={design.size}
              fontFamily={design.font || 'sans-serif'}
              fontWeight={design.bold ? 'bold' : 'normal'}
              style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }}
            >
              {design.content}
            </text>
          ) : (
            <image href={design.content} x="-50" y="-50" width="100" height="100" preserveAspectRatio="xMidYMid meet" />
          )}
        </g>
      )}
    </svg>
  );
};

export default LongSleeve3D;
