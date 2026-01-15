import React from 'react';


// JSDoc for prop documentation (plain JS)
/**
 * @typedef {Object} Design
 * @property {'text'|'image'} type
 * @property {string} content
 * @property {string} [color]
 * @property {number|string} [size]
 * @property {string} [font]
 * @property {boolean} [bold]
 */

/**
 * @typedef {Object} TShirtMockupProps
 * @property {string} [color]
 * @property {'front'|'back'} [side]
 * @property {Design} [design]
 */

/**
 * @param {Object} props
 * @param {string} [props.color]
 * @param {'front'|'back'} [props.side]
 * @param {Design} [props.design]
 */
const TShirtMockup = ({ color = '#ffffff', side = 'front', design }) => {
  const strokeColor = "#1a1a1a";
  const shadowColor = "rgba(0,0,0,0.1)";

  return (
    <svg 
      width="400" 
      height="500" 
      viewBox="0 0 400 500" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }} // Removes inline spacing issues
    >
      {/* --- COMMON LAYERS (Shared by Front and Back) --- */}
      
      {/* Main Body Outline */}
      <path 
        d="M110,135 L110,440 L290,440 L290,135" 
        fill={color} 
        stroke={strokeColor} 
        strokeWidth="1.5" 
      />
      
      {/* Left Sleeve */}
      <path 
        d="M110,135 L45,215 L105,285 L110,250" 
        fill={color} 
        stroke={strokeColor} 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />
      
      {/* Right Sleeve */}
      <path 
        d="M290,135 L355,215 L295,285 L290,250" 
        fill={color} 
        stroke={strokeColor} 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />

      {/* Shoulders (Outer Line) */}
      <path 
        d="M110,135 Q200,95 290,135" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="1.5" 
      />

      {/* Sleeve Stitching (Left) */}
      <path 
        d="M55,228 L98,278" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="1" 
        strokeDasharray="3,2" 
      />
      
      {/* Sleeve Stitching (Right) */}
      <path 
        d="M345,228 L302,278" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="1" 
        strokeDasharray="3,2" 
      />

      {/* --- SPECIFIC LAYERS (Dependent on 'side' prop) --- */}

      {side === 'front' ? (
        <>
          {/* Front Collar Ribbing */}
          <path 
            d="M155,118 Q200,175 245,118" 
            fill={color} 
            stroke={strokeColor} 
            strokeWidth="1.5" 
          />
          <path 
            d="M155,118 Q200,100 245,118" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="1.5" 
          />
          {/* Front Collar Stitching */}
          <path 
            d="M160,128 Q200,165 240,128" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="1" 
            strokeDasharray="3,2" 
          />
        </>
      ) : (
        <>
          {/* Back Collar Line */}
          <path 
            d="M155,118 Q200,145 245,118" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="1.5" 
          />
          {/* Back Collar Stitching */}
          <path 
            d="M158,125 Q200,138 242,125" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="1" 
            strokeDasharray="3,2" 
          />
        </>
      )}

      {/* --- DESIGN OVERLAY (Front Only) --- */}
      {side === 'front' && design && (
        // Translated to center (x=200) and chest area (y=250) based on First Code coordinates
        <g transform="translate(200, 250)">
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
              x="-50"
              y="-50"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid meet"
              style={{ pointerEvents: 'none' }}
            />
          ) : null}
        </g>
      )}
    </svg>
  );
};

export default TShirtMockup;