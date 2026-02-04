import React, { useState, useEffect } from 'react';

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
 * Realistic T-Shirt SVG with smooth 3D rotation animation
 * @param {Object} props
 * @param {string} [props.color]
 * @param {'front'|'back'} [props.side]
 * @param {Design} [props.design]
 */
const TShirtMockup = ({ color = '#ffffff', side = 'front', design }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSide, setCurrentSide] = useState(side);
  const [rotationProgress, setRotationProgress] = useState(0);

  // Animate when side prop changes
  useEffect(() => {
    if (side !== currentSide) {
      setIsAnimating(true);
      let progress = 0;
      const duration = 600; // milliseconds
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        setRotationProgress(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          setCurrentSide(side);
          setRotationProgress(0);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [side, currentSide]);

  // Calculate scale for 3D flip effect
  const getScaleX = () => {
    if (!isAnimating) return 1;
    // Scale from 1 to 0 to 1 during rotation
    return Math.abs(Math.cos(rotationProgress * Math.PI));
  };

  // Determine which side to show during animation
  const displaySide = isAnimating && rotationProgress > 0.5 ? side : currentSide;
  const scaleX = getScaleX();
  const translateX = 200 * (1 - scaleX); // Keep center point fixed
  // Helper function to calculate darker/lighter shades for realistic depth
  const adjustColor = (hexColor, percent) => {
    const num = parseInt(hexColor.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const darkerShade = adjustColor(color, -15);
  const darkestShade = adjustColor(color, -30);
  const lighterShade = adjustColor(color, 10);
  const highlightShade = adjustColor(color, 25);

  return (
    <svg 
      width="400" 
      height="500" 
      viewBox="0 0 400 500" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        display: 'block',
        transition: isAnimating ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      <defs>
        {/* Realistic fabric texture gradient */}
        <linearGradient id={`bodyGradient-${displaySide}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={darkerShade} stopOpacity="1" />
          <stop offset="15%" stopColor={color} stopOpacity="1" />
          <stop offset="50%" stopColor={lighterShade} stopOpacity="1" />
          <stop offset="85%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={darkerShade} stopOpacity="1" />
        </linearGradient>

        {/* Sleeve shadow gradient */}
        <radialGradient id={`sleeveShadow-${displaySide}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="70%" stopColor={darkerShade} stopOpacity="1" />
          <stop offset="100%" stopColor={darkestShade} stopOpacity="1" />
        </radialGradient>

        {/* Soft shadow for depth */}
        <filter id={`softShadow-${displaySide}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="4" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Fabric texture pattern */}
        <pattern id={`fabricTexture-${displaySide}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill={color} opacity="0"/>
          <circle cx="1" cy="1" r="0.3" fill={darkerShade} opacity="0.08"/>
          <circle cx="3" cy="3" r="0.3" fill={lighterShade} opacity="0.08"/>
        </pattern>

        {/* Wrinkle shadow gradient */}
        <linearGradient id={`wrinkleGradient-${displaySide}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={darkestShade} stopOpacity="0.15" />
          <stop offset="50%" stopColor={color} stopOpacity="0" />
          <stop offset="100%" stopColor={darkestShade} stopOpacity="0.15" />
        </linearGradient>

        {/* Highlight for realistic lighting */}
        <linearGradient id={`highlight-${displaySide}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={highlightShade} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Animated transform group for 3D rotation effect */}
      <g transform={`translate(${translateX}, 0) scale(${scaleX}, 1)`}>
        {/* Shadow beneath T-shirt - adjusts with animation */}
        <ellipse 
          cx="200" 
          cy="460" 
          rx={120 * scaleX} 
          ry="15" 
          fill="rgba(0,0,0,0.1)" 
          opacity={0.8 + (0.2 * scaleX)}
        />

        {/* Main Body with realistic gradient */}
        <path 
          d="M110,135 L110,440 Q110,445 115,445 L285,445 Q290,445 290,440 L290,135" 
          fill={`url(#bodyGradient-${displaySide})`} 
          filter={`url(#softShadow-${displaySide})`}
        />

        {/* Fabric texture overlay */}
        <path 
          d="M110,135 L110,440 Q110,445 115,445 L285,445 Q290,445 290,440 L290,135" 
          fill={`url(#fabricTexture-${displaySide})`} 
        />

        {/* Body center highlight (chest area) */}
        <ellipse 
          cx="200" 
          cy="260" 
          rx="60" 
          ry="100" 
          fill={`url(#highlight-${displaySide})`} 
          opacity="0.5"
        />

        {/* Natural wrinkles on sides */}
        <path 
          d="M115,180 Q112,250 115,320" 
          fill="none" 
          stroke={darkestShade} 
          strokeWidth="0.8" 
          opacity="0.2"
        />
        <path 
          d="M285,180 Q288,250 285,320" 
          fill="none" 
          stroke={darkestShade} 
          strokeWidth="0.8" 
          opacity="0.2"
        />

        {/* Subtle vertical fabric folds */}
        <path 
          d="M160,160 Q158,280 160,400" 
          fill="none" 
          stroke={darkerShade} 
          strokeWidth="0.5" 
          opacity="0.15"
        />
        <path 
          d="M240,160 Q242,280 240,400" 
          fill="none" 
          stroke={darkerShade} 
          strokeWidth="0.5" 
          opacity="0.15"
        />

        {/* Left Sleeve with realistic shading */}
        <path 
          d="M110,135 L45,215 Q42,220 45,225 L105,285 Q108,287 110,283 L110,250" 
          fill={`url(#sleeveShadow-${displaySide})`} 
          filter={`url(#softShadow-${displaySide})`}
        />
        <path 
          d="M110,135 L45,215 Q42,220 45,225 L105,285 Q108,287 110,283 L110,250" 
          fill={`url(#fabricTexture-${displaySide})`} 
        />

        {/* Left sleeve fold shadow */}
        <path 
          d="M75,230 Q70,245 75,260" 
          fill="none" 
          stroke={darkestShade} 
          strokeWidth="1.5" 
          opacity="0.25"
        />

        {/* Right Sleeve with realistic shading */}
        <path 
          d="M290,135 L355,215 Q358,220 355,225 L295,285 Q292,287 290,283 L290,250" 
          fill={`url(#sleeveShadow-${displaySide})`} 
          filter={`url(#softShadow-${displaySide})`}
        />
        <path 
          d="M290,135 L355,215 Q358,220 355,225 L295,285 Q292,287 290,283 L290,250" 
          fill={`url(#fabricTexture-${displaySide})`} 
        />

        {/* Right sleeve fold shadow */}
        <path 
          d="M325,230 Q330,245 325,260" 
          fill="none" 
          stroke={darkestShade} 
          strokeWidth="1.5" 
          opacity="0.25"
        />

        {/* Shoulder seam with natural stitching */}
        <path 
          d="M110,135 Q200,95 290,135" 
          fill="none" 
          stroke={darkestShade} 
          strokeWidth="1.2" 
          opacity="0.6"
        />

        {/* Shoulder highlight (natural light reflection) */}
        <path 
          d="M110,135 Q200,95 290,135" 
          fill="none" 
          stroke={highlightShade} 
          strokeWidth="0.8" 
          opacity="0.4"
          transform="translate(0,-1)"
        />

        {/* Realistic sleeve hem stitching */}
        <path 
          d="M47,222 L103,283" 
          fill="none" 
          stroke={darkestShade} 
          strokeWidth="1" 
          strokeDasharray="2,3" 
          opacity="0.4"
        />
        <path 
          d="M353,222 L297,283" 
          fill="none" 
          stroke={darkestShade} 
          strokeWidth="1" 
          strokeDasharray="2,3" 
          opacity="0.4"
        />

        {/* Side and position specific details */}
        {displaySide === 'front' ? (
          <>
            {/* Front collar ribbing with depth */}
            <path 
              d="M155,118 Q200,175 245,118" 
              fill={darkerShade} 
            />
            <path 
              d="M155,118 Q200,100 245,118" 
              fill="none" 
              stroke={darkestShade} 
              strokeWidth="1.2" 
            />
            
            {/* Collar shadow for depth */}
            <path 
              d="M160,120 Q200,170 240,120" 
              fill={`url(#wrinkleGradient-${displaySide})`} 
              opacity="0.3"
            />

            {/* Collar stitching - realistic double stitch */}
            <path 
              d="M160,128 Q200,165 240,128" 
              fill="none" 
              stroke={darkestShade} 
              strokeWidth="0.8" 
              strokeDasharray="2,2" 
              opacity="0.5"
            />
            <path 
              d="M162,130 Q200,162 238,130" 
              fill="none" 
              stroke={darkestShade} 
              strokeWidth="0.8" 
              strokeDasharray="2,2" 
              opacity="0.5"
            />

            {/* Chest area natural fold */}
            <path 
              d="M140,210 Q200,215 260,210" 
              fill="none" 
              stroke={darkerShade} 
              strokeWidth="0.6" 
              opacity="0.2"
            />
          </>
        ) : (
          <>
            {/* Back collar with natural curve */}
            <path 
              d="M155,118 Q200,145 245,118" 
              fill="none" 
              stroke={darkestShade} 
              strokeWidth="1.2" 
            />
            
            {/* Back collar stitching */}
            <path 
              d="M158,125 Q200,138 242,125" 
              fill="none" 
              stroke={darkestShade} 
              strokeWidth="0.8" 
              strokeDasharray="2,2" 
              opacity="0.5"
            />

            {/* Back shoulder blade wrinkles */}
            <path 
              d="M145,180 Q150,220 145,260" 
              fill="none" 
              stroke={darkerShade} 
              strokeWidth="0.7" 
              opacity="0.2"
            />
            <path 
              d="M255,180 Q250,220 255,260" 
              fill="none" 
              stroke={darkerShade} 
              strokeWidth="0.7" 
              opacity="0.2"
            />
          </>
        )}

        {/* Bottom hem with realistic stitching */}
        <line 
          x1="115" 
          y1="442" 
          x2="285" 
          y2="442" 
          stroke={darkestShade} 
          strokeWidth="1" 
          strokeDasharray="3,2" 
          opacity="0.4"
        />

        {/* Hem shadow for depth */}
        <rect 
          x="110" 
          y="438" 
          width="180" 
          height="7" 
          fill={darkestShade} 
          opacity="0.15"
        />

        {/* Design overlay with realistic placement - only show on front and when not mid-rotation */}
        {displaySide === 'front' && design && scaleX > 0.3 && (
          <g transform="translate(200, 250)" opacity={scaleX}>
            {design.type === 'text' ? (
              <>
                {/* Text shadow for depth */}
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(0,0,0,0.15)"
                  fontSize={design.size}
                  fontFamily={design.font}
                  fontWeight={design.bold ? 'bold' : 'normal'}
                  transform="translate(2, 2)"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {design.content}
                </text>
                {/* Main text */}
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
              </>
            ) : design.type === 'image' && design.content ? (
              <>
                {/* Image shadow */}
                <image
                  href={design.content}
                  x="-48"
                  y="-48"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid meet"
                  opacity="0.2"
                  filter={`url(#softShadow-${displaySide})`}
                  style={{ pointerEvents: 'none' }}
                />
                {/* Main image */}
                <image
                  href={design.content}
                  x="-50"
                  y="-50"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ pointerEvents: 'none' }}
                />
              </>
            ) : null}
          </g>
        )}
      </g>
    </svg>
  );
};

export default TShirtMockup;