import React from 'react';

const PoloShirt3D = ({ color = '#ffffff', design, side = 'front' }) => {
  const id = React.useId().replace(/:/g, "");

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Shadow filters */}
        <filter id={`shadow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="0" dy="3" result="offsetblur"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Smooth body shading gradient */}
        <radialGradient id={`bodyShade-${id}`} cx="50%" cy="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.15"/>
          <stop offset="40%" stopColor="#fff" stopOpacity="0.05"/>
          <stop offset="70%" stopColor="#000" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.2"/>
        </radialGradient>

        {/* Left sleeve gradient - smooth cylindrical */}
        <radialGradient id={`leftSleeveShade-${id}`} cx="30%" cy="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.1"/>
          <stop offset="50%" stopColor="#000" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.3"/>
        </radialGradient>

        {/* Right sleeve gradient - smooth cylindrical */}
        <radialGradient id={`rightSleeveShade-${id}`} cx="70%" cy="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.1"/>
          <stop offset="50%" stopColor="#000" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.3"/>
        </radialGradient>

        {/* Collar shadow */}
        <radialGradient id={`collarShadow-${id}`} cx="50%" cy="30%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0"/>
        </radialGradient>

        {/* Sleeve cuff shadow */}
        <linearGradient id={`cuffShade-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0"/>
        </linearGradient>

        {/* Neck opening gradient */}
        <radialGradient id={`neckShade-${id}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {side === 'front' ? (
        <g filter={`url(#shadow-${id})`}>
          {/* MAIN BODY - Smooth curved shape */}
          <path
            d="M 130 95 
               Q 110 100 80 115
               L 40 150 
               L 20 280 
               L 60 300 
               Q 70 250 85 200
               L 85 545
               Q 85 555 95 555
               L 405 555
               Q 415 555 415 545
               L 415 200
               Q 430 250 440 300
               L 480 280
               L 460 150
               L 420 115
               Q 390 100 370 95
               Z"
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Smooth body shading overlay */}
          <path
            d="M 130 95 
               Q 110 100 80 115
               L 40 150 
               L 20 280 
               L 60 300 
               Q 70 250 85 200
               L 85 545
               Q 85 555 95 555
               L 405 555
               Q 415 555 415 545
               L 415 200
               Q 430 250 440 300
               L 480 280
               L 460 150
               L 420 115
               Q 390 100 370 95
               Z"
            fill={`url(#bodyShade-${id})`}
          />

          {/* SLEEVES - Wider short sleeves with smooth curves */}
          {/* Left Sleeve */}
          <path
            d="M 80 115 
               Q 60 130 45 160
               L 20 280
               L 60 300
               Q 75 260 85 200
               Z"
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Left sleeve smooth shading */}
          <path
            d="M 80 115 
               Q 60 130 45 160
               L 20 280
               L 60 300
               Q 75 260 85 200
               Z"
            fill={`url(#leftSleeveShade-${id})`}
          />
          {/* Left sleeve cuff band - wider */}
          <ellipse 
            cx="40" 
            cy="290" 
            rx="22" 
            ry="12"
            fill="#c8c8c8"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          <ellipse 
            cx="40" 
            cy="290" 
            rx="22" 
            ry="12"
            fill={`url(#cuffShade-${id})`}
          />
          <line x1="18" y1="290" x2="62" y2="290" stroke="#1a1a1a" strokeWidth="1.2"/>

          {/* Right Sleeve */}
          <path
            d="M 420 115 
               Q 440 130 455 160
               L 480 280
               L 440 300
               Q 425 260 415 200
               Z"
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Right sleeve smooth shading */}
          <path
            d="M 420 115 
               Q 440 130 455 160
               L 480 280
               L 440 300
               Q 425 260 415 200
               Z"
            fill={`url(#rightSleeveShade-${id})`}
          />
          {/* Right sleeve cuff band - wider */}
          <ellipse 
            cx="460" 
            cy="290" 
            rx="22" 
            ry="12"
            fill="#c8c8c8"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          <ellipse 
            cx="460" 
            cy="290" 
            rx="22" 
            ry="12"
            fill={`url(#cuffShade-${id})`}
          />
          <line x1="438" y1="290" x2="482" y2="290" stroke="#1a1a1a" strokeWidth="1.2"/>

          {/* COLLAR - Detailed front collar with smooth curves */}
          {/* Neck opening shadow */}
          <ellipse cx="250" cy="82" rx="65" ry="18" fill={`url(#neckShade-${id})`}/>
          
          {/* Left collar - smooth */}
          <path
            d="M 185 82 
               Q 180 90 175 100
               L 215 128
               Q 225 115 235 105
               Z"
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          
          {/* Right collar - smooth */}
          <path
            d="M 315 82 
               Q 320 90 325 100
               L 285 128
               Q 275 115 265 105
               Z"
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Collar tips shading */}
          <path d="M 185 82 L 200 95" stroke="#666" strokeWidth="0.5" opacity="0.4"/>
          <path d="M 315 82 L 300 95" stroke="#666" strokeWidth="0.5" opacity="0.4"/>

          {/* BUTTON PLACKET - smoother */}
          <rect 
            x="232" 
            y="105" 
            width="36" 
            height="120" 
            rx="2"
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          
          {/* Placket shading */}
          <rect 
            x="232" 
            y="105" 
            width="36" 
            height="120" 
            rx="2"
            fill="#000"
            opacity="0.03"
          />

          {/* Placket center stitching */}
          <line x1="250" y1="108" x2="250" y2="222" stroke="#777" strokeWidth="0.7" strokeDasharray="4 3" opacity="0.6"/>
          <line x1="235" y1="108" x2="235" y2="222" stroke="#888" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.4"/>
          <line x1="265" y1="108" x2="265" y2="222" stroke="#888" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.4"/>

          {/* BUTTONS - 3 buttons with realistic detail and shadows */}
          <g>
            <ellipse cx="250" cy="135" rx="4.5" ry="4" fill="#000" opacity="0.1"/>
            <circle cx="250" cy="134" r="4.5" fill="#f8f8f8" stroke="#555" strokeWidth="0.8"/>
            <circle cx="250" cy="134" r="2.2" fill="none" stroke="#999" strokeWidth="0.5"/>
            <line x1="248.3" y1="132.3" x2="251.7" y2="135.7" stroke="#aaa" strokeWidth="0.4"/>
            <line x1="251.7" y1="132.3" x2="248.3" y2="135.7" stroke="#aaa" strokeWidth="0.4"/>
          </g>
          
          <g>
            <ellipse cx="250" cy="166" rx="4.5" ry="4" fill="#000" opacity="0.1"/>
            <circle cx="250" cy="165" r="4.5" fill="#f8f8f8" stroke="#555" strokeWidth="0.8"/>
            <circle cx="250" cy="165" r="2.2" fill="none" stroke="#999" strokeWidth="0.5"/>
            <line x1="248.3" y1="163.3" x2="251.7" y2="166.7" stroke="#aaa" strokeWidth="0.4"/>
            <line x1="251.7" y1="163.3" x2="248.3" y2="166.7" stroke="#aaa" strokeWidth="0.4"/>
          </g>
          
          <g>
            <ellipse cx="250" cy="197" rx="4.5" ry="4" fill="#000" opacity="0.1"/>
            <circle cx="250" cy="196" r="4.5" fill="#f8f8f8" stroke="#555" strokeWidth="0.8"/>
            <circle cx="250" cy="196" r="2.2" fill="none" stroke="#999" strokeWidth="0.5"/>
            <line x1="248.3" y1="194.3" x2="251.7" y2="197.7" stroke="#aaa" strokeWidth="0.4"/>
            <line x1="251.7" y1="194.3" x2="248.3" y2="197.7" stroke="#aaa" strokeWidth="0.4"/>
          </g>

          {/* BOTTOM HEM with stitching */}
          <path d="M 95 555 L 405 555" stroke="#777" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.6"/>
          <path d="M 95 548 L 405 548" stroke="#888" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.4"/>

          {/* Side seams - subtle */}
          <path d="M 85 200 L 85 545" stroke="#888" strokeWidth="0.5" strokeDasharray="6 4" opacity="0.3"/>
          <path d="M 415 200 L 415 545" stroke="#888" strokeWidth="0.5" strokeDasharray="6 4" opacity="0.3"/>

          {/* Design placement area */}
          {design && (
            <g transform="translate(330, 240)">
              {design.type === 'text' ? (
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={design.color || '#000'}
                  fontSize={design.size || 24}
                  fontFamily={design.font || 'Arial, sans-serif'}
                  fontWeight={design.bold ? 'bold' : 'normal'}
                >
                  {design.content}
                </text>
              ) : (
                <image 
                  href={design.content} 
                  x="-40" 
                  y="-40" 
                  width="80" 
                  height="80" 
                  preserveAspectRatio="xMidYMid meet"
                />
              )}
            </g>
          )}
        </g>
      ) : (
        <g filter={`url(#shadow-${id})`}>
          {/* BACK VIEW - Main body with smooth curves */}
          <path
            d="M 130 95 
               Q 110 100 80 115
               L 40 150 
               L 20 280 
               L 60 300 
               Q 70 250 85 200
               L 85 545
               Q 85 555 95 555
               L 405 555
               Q 415 555 415 545
               L 415 200
               Q 430 250 440 300
               L 480 280
               L 460 150
               L 420 115
               Q 390 100 370 95
               Z"
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Body shading overlay */}
          <path
            d="M 130 95 
               Q 110 100 80 115
               L 40 150 
               L 20 280 
               L 60 300 
               Q 70 250 85 200
               L 85 545
               Q 85 555 95 555
               L 405 555
               Q 415 555 415 545
               L 415 200
               Q 430 250 440 300
               L 480 280
               L 460 150
               L 420 115
               Q 390 100 370 95
               Z"
            fill={`url(#bodyShade-${id})`}
          />

          {/* SLEEVES - Back view with wider sleeves */}
          {/* Left Sleeve */}
          <path
            d="M 80 115 
               Q 60 130 45 160
               L 20 280
               L 60 300
               Q 75 260 85 200
               Z"
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M 80 115 
               Q 60 130 45 160
               L 20 280
               L 60 300
               Q 75 260 85 200
               Z"
            fill={`url(#leftSleeveShade-${id})`}
          />
          <ellipse 
            cx="40" 
            cy="290" 
            rx="22" 
            ry="12"
            fill="#c8c8c8"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          <ellipse 
            cx="40" 
            cy="290" 
            rx="22" 
            ry="12"
            fill={`url(#cuffShade-${id})`}
          />
          <line x1="18" y1="290" x2="62" y2="290" stroke="#1a1a1a" strokeWidth="1.2"/>

          {/* Right Sleeve */}
          <path
            d="M 420 115 
               Q 440 130 455 160
               L 480 280
               L 440 300
               Q 425 260 415 200
               Z"
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M 420 115 
               Q 440 130 455 160
               L 480 280
               L 440 300
               Q 425 260 415 200
               Z"
            fill={`url(#rightSleeveShade-${id})`}
          />
          <ellipse 
            cx="460" 
            cy="290" 
            rx="22" 
            ry="12"
            fill="#c8c8c8"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          <ellipse 
            cx="460" 
            cy="290" 
            rx="22" 
            ry="12"
            fill={`url(#cuffShade-${id})`}
          />
          <line x1="438" y1="290" x2="482" y2="290" stroke="#1a1a1a" strokeWidth="1.2"/>

          {/* BACK COLLAR - Smooth rounded neck */}
          <ellipse 
            cx="250" 
            cy="88" 
            rx="68" 
            ry="22" 
            fill={color}
            stroke="#1a1a1a"
            strokeWidth="1.8"
          />
          
          {/* Collar band with smooth curve */}
          <path
            d="M 182 82 
               Q 250 72 318 82 
               Q 250 92 182 82"
            fill="#d8d8d8"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          
          {/* Collar band shading */}
          <path
            d="M 182 82 
               Q 250 72 318 82 
               Q 250 92 182 82"
            fill={`url(#cuffShade-${id})`}
          />

          {/* Center back seam */}
          <line x1="250" y1="95" x2="250" y2="555" stroke="#777" strokeWidth="0.6" strokeDasharray="6 4" opacity="0.4"/>

          {/* BOTTOM HEM */}
          <path d="M 95 555 L 405 555" stroke="#777" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.6"/>
          <path d="M 95 548 L 405 548" stroke="#888" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.4"/>

          {/* Side seams */}
          <path d="M 85 200 L 85 545" stroke="#888" strokeWidth="0.5" strokeDasharray="6 4" opacity="0.3"/>
          <path d="M 415 200 L 415 545" stroke="#888" strokeWidth="0.5" strokeDasharray="6 4" opacity="0.3"/>

          {/* Design placement area for back */}
          {design && design.showOnBack && (
            <g transform="translate(250, 320)">
              {design.type === 'text' ? (
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={design.color || '#000'}
                  fontSize={design.size || 36}
                  fontFamily={design.font || 'Arial, sans-serif'}
                  fontWeight={design.bold ? 'bold' : 'normal'}
                >
                  {design.content}
                </text>
              ) : (
                <image 
                  href={design.content} 
                  x="-60" 
                  y="-60" 
                  width="120" 
                  height="120" 
                  preserveAspectRatio="xMidYMid meet"
                />
              )}
            </g>
          )}
        </g>
      )}
    </svg>
  );
};

export default PoloShirt3D;
