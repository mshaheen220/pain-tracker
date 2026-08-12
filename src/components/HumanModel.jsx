import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three'; // Import THREE

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
  const { camera } = useThree();
  const controlsRef = useRef();

  const targetPosition = useRef(new THREE.Vector3(0, 0, 4.2)); // Initial camera position
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0)); // Initial look-at (center of model)
  const isAnimatingCamera = useRef(false);

  useEffect(() => {
    if (focusedPainPoint && focusedPainPoint.location.coordinates) {
      const coords = focusedPainPoint.location.coordinates;
      const pointVec = new THREE.Vector3(coords.x, coords.y, coords.z);
      const modelCenter = new THREE.Vector3(0, 0, 0); // A rough center for the model

      // Vector from the point to the camera
      const pointToCamera = camera.position.clone().sub(pointVec);
      // Vector from the point to the model's center (approximates the surface normal)
      const pointToCenter = modelCenter.clone().sub(pointVec);

      // If the point is on the "back" relative to the camera, we need to swing around
      if (pointToCamera.dot(pointToCenter) > 0.1) { // Added a small threshold
        // Calculate a new camera position that is behind the point, looking at it.
        const newPos = pointVec.clone().sub(modelCenter).setLength(2.5).add(pointVec);

        // Prevent camera from going below the model's feet
        if (newPos.y < -1.5) {
          newPos.y = -1.5;
        }

        targetPosition.current.copy(newPos);
      } else {
        // Otherwise, just zoom in from the current camera angle
        const newPos = pointToCamera.setLength(2).add(pointVec);
        targetPosition.current.copy(newPos);
      }

      targetLookAt.current.copy(pointVec);
      isAnimatingCamera.current = true;
      if (controlsRef.current) {
        controlsRef.current.enabled = false; // Disable controls during animation
      }
    } else {
      // Reset to default view
      targetPosition.current.set(0, 0, 4.2); // Default camera position
      targetLookAt.current.set(0, 0, 0); // Default look-at
      isAnimatingCamera.current = true;
    }
  }, [focusedPainPoint]);

  useFrame(() => {
    if (isAnimatingCamera.current) {
      const speed = 0.05; // Animation speed

      // Interpolate camera position
      camera.position.lerp(targetPosition.current, speed);

      // Interpolate OrbitControls target
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, speed);
        controlsRef.current.update(); // Important to update controls after changing target
      }

      // Check if animation is close to completion
      if (camera.position.distanceTo(targetPosition.current) < 0.01 &&
          (controlsRef.current && controlsRef.current.target.distanceTo(targetLookAt.current) < 0.01)) {
        isAnimatingCamera.current = false;
        if (controlsRef.current) {
          controlsRef.current.enabled = true; // Re-enable controls after animation
        }
      }
    }
  });

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
