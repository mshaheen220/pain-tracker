import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';

function Model(props) {
  const { scene } = useGLTF('/src/assets/human_body.glb');

  // Traverse the model's nodes to set shadow properties on each mesh
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} {...props} />;
}

function PainPointMarker({ position, isHovered }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      if (isHovered) {
        // Create a pulsing effect using a sine wave
        const scale = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.2;
        meshRef.current.scale.set(scale, scale, scale);
      } else {
        // Reset scale when not hovered
        meshRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[isHovered ? 0.07 : 0.05, 16, 16]} />
      <meshStandardMaterial color={isHovered ? '#ff4d4d' : 'yellow'} emissive={isHovered ? '#ff4d4d' : 'yellow'} emissiveIntensity={isHovered ? 2 : 1.5} toneMapped={false} transparent opacity={isHovered ? 0.8 : 1} />
    </mesh>
  );
}

export default function HumanModel({ onPointClick, clickedPoint, painPoints = [], hoveredPainId }) {
  return (
    <div style={{ height: '60vh', width: '100%', maxWidth: '400px' }}>
    <Canvas shadows style={{ background: '#f0f0f0' }} camera={{ position: [0, 0, 3.5] }}>
      {/* Lower ambient light to make shadows more pronounced */}
      <ambientLight intensity={0.7} />
      {/* A directional light is great for casting shadows */}
      <directionalLight
        castShadow
        position={[5, 10, 7.5]}
        intensity={1.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, -10, -10]} />
      <Suspense fallback={null}>
        <Model
          position={[0, -1.75, 0]}
          onClick={(event) => {
            // stopPropagation is needed to prevent the OrbitControls from being triggered
            event.stopPropagation();
            if (onPointClick) {
              onPointClick({ x: event.point.x, y: event.point.y, z: event.point.z });
            }
          }}
        />
        <OrbitControls />
        {/* Render a marker for the point that was just clicked (for a new entry) */}
        {clickedPoint && (
          <mesh position={[clickedPoint.x, clickedPoint.y, clickedPoint.z]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
          </mesh>
        )}
        {/* Render markers for all existing pain log entries */}
        {painPoints.map((point) => point.location.coordinates ? (
          <PainPointMarker
            key={point.id}
            position={[point.location.coordinates.x, point.location.coordinates.y, point.location.coordinates.z]}
            isHovered={point.id === hoveredPainId}
          />
        ) : null)}
        {/* A ground plane to receive the shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.3} />
        </mesh>
      </Suspense>
    </Canvas>
    </div>
  );
}
