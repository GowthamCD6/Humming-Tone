// import React from 'react';

// const LongSleeve3D = ({ color = '#ffffff', design, side = 'front' }) => {
//   const filterId = React.useId().replace(/:/g, "");

//   return (
//     <svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
//       <defs>
//         {/* Shadow filter for 3D depth */}
//         <filter id={`depth-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
//           <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
//           <feOffset in="blur" dx="2" dy="4" result="offsetBlur" />
//           <feComponentTransfer in="offsetBlur" result="shadow">
//             <feFuncA type="linear" slope="0.3" />
//           </feComponentTransfer>
//           <feMerge>
//             <feMergeNode in="shadow" />
//             <feMergeNode in="SourceGraphic" />
//           </feMerge>
//         </filter>

//         {/* Shading Gradient for Body Curvature */}
//         <linearGradient id={`shading-${filterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
//           <stop offset="0%" stopColor="black" stopOpacity="0.15" />
//           <stop offset="20%" stopColor="white" stopOpacity="0.05" />
//           <stop offset="50%" stopColor="white" stopOpacity="0" />
//           <stop offset="80%" stopColor="white" stopOpacity="0.05" />
//           <stop offset="100%" stopColor="black" stopOpacity="0.2" />
//         </linearGradient>
//       </defs>

//       <g filter={`url(#depth-${filterId})`}>
//         {/* Main Garment Silhouette */}
//         <path
//           d="M175 80 
//              Q250 100 325 80
//              L410 115 L445 420 L405 420 L380 155
//              V440 H120 V155
//              L95 420 L55 420 L90 115 Z"
//           fill={color}
//           stroke="#1a1a1a"
//           strokeWidth="1.2"
//         />

//         {/* 3D Curvature Overlay */}
//         <path
//           d="M175 80 Q250 100 325 80 L410 115 L445 420 L405 420 L380 155 V440 H120 V155 L95 420 L55 420 L90 115 Z"
//           fill={`url(#shading-${filterId})`}
//           pointerEvents="none"
//         />

//         {/* Neckline Details */}
//         {side === 'front' ? (
//           <>
//             {/* Back inner collar depth */}
//             <path d="M175 80 Q250 105 325 80" fill="#333" opacity="0.2" />
//             {/* Front collar rim */}
//             <path d="M175 80 Q250 140 325 80" fill="none" stroke="#1a1a1a" strokeWidth="2" />
//             {/* Collar Stitching */}
//             <path d="M185 92 Q250 145 315 92" fill="none" stroke="#4b5563" strokeWidth="0.8" strokeDasharray="3 2" />
//           </>
//         ) : (
//           <>
//             <path d="M175 80 Q250 115 325 80" fill="none" stroke="#1a1a1a" strokeWidth="2" />
//           </>
//         )}

//         {/* Hem and Cuff Stitching */}
//         <g stroke="#4b5563" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6">
//           <path d="M120 425 H380" /> {/* Bottom Hem */}
//           <path d="M57 408 L93 408" /> {/* Left Cuff */}
//           <path d="M407 408 L443 408" /> {/* Right Cuff */}
//         </g>
//       </g>

//       {/* Design Placement (Chest Area) */}
//       {side === 'front' && design && (
//         <g transform="translate(250, 230)">
//           {design.type === 'text' ? (
//             <text
//               textAnchor="middle"
//               dominantBaseline="middle"
//               fill={design.color}
//               fontSize={design.size}
//               fontFamily={design.font || 'sans-serif'}
//               fontWeight={design.bold ? 'bold' : 'normal'}
//               style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }}
//             >
//               {design.content}
//             </text>
//           ) : (
//             <image href={design.content} x="-50" y="-50" width="100" height="100" preserveAspectRatio="xMidYMid meet" />
//           )}
//         </g>
//       )}
//     </svg>
//   );
// };

// export default LongSleeve3D;

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Center, 
  Decal, 
  Text, 
  useTexture, 
  Environment, 
  ContactShadows,
  PerspectiveCamera 
} from '@react-three/drei';
import * as THREE from 'three';

/**
 * DesignComponent: Handles rendering either text or an image onto the 3D mesh
 */
const DesignComponent = ({ design }) => {
  if (!design) return null;

  // Use a hook to load texture if it's an image. 
  // Note: For a live app, ensure the URL is CORS-friendly.
  const texture = design.type === 'image' ? useTexture(design.content) : null;

  return (
    <Decal
      position={[0, 0.1, 0.2]} // Positioned on the chest
      rotation={[0, 0, 0]}
      scale={design.type === 'text' ? [0.5, 0.2, 0.2] : [0.3, 0.3, 0.3]}
    >
      {design.type === 'text' ? (
        <meshBasicMaterial transparent opacity={0}>
          <Text
            color={design.color || "black"}
            fontSize={0.12}
            font={design.font}
            anchorX="center"
            anchorY="middle"
            depthOffset={-1}
          >
            {design.content}
          </Text>
        </meshBasicMaterial>
      ) : (
        <meshStandardMaterial
          map={texture}
          transparent
          polygonOffset
          polygonOffsetFactor={-1}
        />
      )}
    </Decal>
  );
};

/**
 * ShirtMesh: The 3D geometry representing the garment
 */
const ShirtMesh = ({ color, design }) => {
  return (
    <group>
      {/* Torso */}
      <mesh castShadow>
        <cylinderGeometry args={[0.45, 0.5, 1.2, 32]} />
        <meshStandardMaterial color={color} roughness={0.6} />
        <DesignComponent design={design} />
      </mesh>

      {/* Collar Area */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.2, 0.02, 16, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Left Sleeve */}
      <mesh position={[-0.65, 0.2, 0]} rotation={[0, 0, Math.PI / 4.5]}>
        <cylinderGeometry args={[0.16, 0.12, 0.9, 32]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Right Sleeve */}
      <mesh position={[0.65, 0.2, 0]} rotation={[0, 0, -Math.PI / 4.5]}>
        <cylinderGeometry args={[0.16, 0.12, 0.9, 32]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
};

/**
 * Main LongSleeve3D Component
 */
const LongSleeve3D = ({ color = '#ffffff', design, side = 'front' }) => {
  // Logic to rotate the garment based on the "side" prop
  const rotationY = side === 'front' ? 0 : Math.PI;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px', background: '#e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Adds realistic reflections and lighting */}
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <Center top>
            <group rotation={[0, rotationY, 0]}>
              <ShirtMesh color={color} design={design} />
            </group>
          </Center>

          {/* Realistic Floor Shadow */}
          <ContactShadows 
            position={[0, -0.65, 0]} 
            opacity={0.4} 
            scale={3} 
            blur={2} 
            far={1} 
          />
        </Suspense>

        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          makeDefault 
        />
      </Canvas>
    </div>
  );
};

export default LongSleeve3D;

// Example Usage:
/*
<LongSleeve3D 
  color="#ef4444" 
  side="front"
  design={{
    type: 'text',
    content: 'CUSTOM BRAND',
    color: 'white'
  }}
/>
*/