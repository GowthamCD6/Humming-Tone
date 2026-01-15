import React from 'react';

const HoodieSVG = ({ color = '#ffffff', design, side = 'front' }) => {
  const stroke = '#0f172a';
  const stitch = '#475569';

  return (
    <svg width="480" height="560" viewBox="0 0 480 560">

      {/* ================= BODY ================= */}
      <path
        d="
          M140 130
          L70 210
          V360
          L120 360
          V500
          H360
          V360
          L410 360
          V210
          L340 130
          Z
        "
        fill={color}
        stroke={stroke}
        strokeWidth="1.6"
      />

      {/* ================= SLEEVES ================= */}
      <path
        d="M140 130 L70 210 L120 360 L150 340 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1.6"
      />
      <path
        d="M340 130 L410 210 L360 360 L330 340 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1.6"
      />

      {/* ================= RIB HEM ================= */}
      <rect
        x="120"
        y="500"
        width="240"
        height="25"
        fill={color}
        stroke={stroke}
        strokeWidth="1.2"
      />

      {/* ================= CUFFS ================= */}
      <rect
        x="90"
        y="360"
        width="45"
        height="25"
        fill={color}
        stroke={stroke}
        strokeWidth="1.2"
      />
      <rect
        x="345"
        y="360"
        width="45"
        height="25"
        fill={color}
        stroke={stroke}
        strokeWidth="1.2"
      />

      {/* ================= HOOD ================= */}
      {side === 'front' ? (
        <>
          {/* Outer Hood */}
          <path
            d="
              M150 130
              Q240 30 330 130
              Q240 155 150 130
              Z
            "
            fill={color}
            stroke={stroke}
            strokeWidth="1.6"
          />

          {/* Inner Hood */}
          <path
            d="
              M180 130
              Q240 95 300 130
              Q240 120 180 130
              Z
            "
            fill="#e5e7eb"
            stroke={stroke}
            strokeWidth="1.2"
          />

          {/* Drawstrings */}
          <line x1="230" y1="145" x2="230" y2="260" stroke={stroke} strokeWidth="1.2" />
          <line x1="250" y1="145" x2="250" y2="260" stroke={stroke} strokeWidth="1.2" />
        </>
      ) : (
        <>
          {/* Back Hood */}
          <path
            d="
              M150 130
              Q240 30 330 130
              Q240 150 150 130
              Z
            "
            fill={color}
            stroke={stroke}
            strokeWidth="1.6"
          />

          {/* Center Dart Seam */}
          <line
            x1="240"
            y1="30"
            x2="240"
            y2="135"
            stroke={stroke}
            strokeWidth="1.2"
          />
        </>
      )}

      {/* ================= KANGAROO POCKET ================= */}
      {side === 'front' && (
        <path
          d="
            M160 340
            H320
            L345 430
            H135
            Z
          "
          fill="none"
          stroke={stroke}
          strokeWidth="1.4"
        />
      )}

      {/* ================= STITCHING ================= */}
      <line
        x1="150"
        y1="130"
        x2="150"
        y2="500"
        stroke={stitch}
        strokeDasharray="4 3"
        strokeWidth="1"
      />
      <line
        x1="330"
        y1="130"
        x2="330"
        y2="500"
        stroke={stitch}
        strokeDasharray="4 3"
        strokeWidth="1"
      />

      {/* Sleeve Stitch */}
      <line
        x1="110"
        y1="220"
        x2="145"
        y2="330"
        stroke={stitch}
        strokeDasharray="4 3"
        strokeWidth="1"
      />
      <line
        x1="370"
        y1="220"
        x2="335"
        y2="330"
        stroke={stitch}
        strokeDasharray="4 3"
        strokeWidth="1"
      />

      {/* ================= DESIGN ================= */}
      {side === 'front' && design && (
        <g transform="translate(240, 270)">
          {design.type === 'text' ? (
            <text
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
          ) : (
            <image
              href={design.content}
              x="-50"
              y="-50"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid meet"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      )}

      {/* ================= LABEL ================= */}
      <g>
        <rect x="185" y="530" width="110" height="26" rx="13" fill="#020617" />
        <text
          x="240"
          y="548"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="12"
          fontWeight="600"
          letterSpacing="1"
        >
          {side === 'front' ? 'FRONT VIEW' : 'BACK VIEW'}
        </text>
      </g>

    </svg>
  );
};

export default HoodieSVG;