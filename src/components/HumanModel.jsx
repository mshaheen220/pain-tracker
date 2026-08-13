import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three'; // Import THREE
import { useCameraFocus } from '../hooks/useCameraFocus';

function Model(props) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}human_body.glb`);

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

function PainPointMarker({ position, isHovered, color }) { // color is now the HSL string
  const meshRef = useRef();
  const materialRef = useRef();

  // Create a stable THREE.Color object for the hover color
  const hoverColor = useMemo(() => new THREE.Color('#ff4d4d'), []);

  // This effect will run whenever the hover state or the base color changes
  useEffect(() => {
    if (materialRef.current) {
      const targetColor = isHovered ? hoverColor : new THREE.Color(color);
      materialRef.current.color.copy(targetColor);
      materialRef.current.emissive.copy(targetColor);
    }
  }, [isHovered, color, hoverColor]);

  useFrame(({ clock }) => {
    if (meshRef.current && isHovered) {
      // Create a pulsing effect using a sine wave only when hovered
      const scale = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
    } else if (meshRef.current) {
      // Reset scale when not hovered
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[isHovered ? 0.07 : 0.05, 16, 16]} /> {/* Slightly larger when hovered */}
      <meshStandardMaterial
        ref={materialRef}
        color={color} // Set initial color declaratively
        emissive={color} // Set initial emissive declaratively
        emissiveIntensity={isHovered ? 2 : 1.5}
        toneMapped={false}
        transparent
        opacity={isHovered ? 0.9 : 0.7}
      />
    </mesh>
  );
}

function SceneContent({ onPointClick, clickedPoint, painPoints, hoveredPainId, focusedPainPoint }) {
  const controlsRef = useRef();
  useCameraFocus(focusedPainPoint, controlsRef);

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.7} />
      <directionalLight
        castShadow
        position={[5, 10, 7.5]}
        intensity={1.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, -10, -10]} />
      <Model
        position={[0, -1.75, 0]}
        onClick={(event) => {
          event.stopPropagation();
          if (onPointClick) {
            onPointClick({ x: event.point.x, y: event.point.y, z: event.point.z });
          }
        }}
      />
      <OrbitControls ref={controlsRef} />
      {clickedPoint && (
        <mesh position={[clickedPoint.x, clickedPoint.y, clickedPoint.z]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
        </mesh>
      )}
      {painPoints.map((point) => point.location.coordinates ? (
        <PainPointMarker
          key={point.id}
          position={[point.location.coordinates.x, point.location.coordinates.y, point.location.coordinates.z]}
          isHovered={point.id === hoveredPainId}
          color={point.color}
        />
      ) : null)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </Suspense>
  );
}

export default function HumanModel(props) {
  return (
    <div style={{ height: '60vh', width: '100%', maxWidth: '400px' }}>
    <Canvas shadows style={{ background: '#f0f0f0' }} camera={{ position: [0, 0, 4.2] }}>
      <SceneContent {...props} />
    </Canvas>
    </div>
  );
}
