import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function useCameraFocus(focusedPainPoint, controlsRef) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 4.2));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimatingCamera = useRef(false);

  useEffect(() => {
    if (focusedPainPoint && focusedPainPoint.location.coordinates) {
      const coords = focusedPainPoint.location.coordinates;
      const pointVec = new THREE.Vector3(coords.x, coords.y, coords.z);
      const modelCenter = new THREE.Vector3(0, 0, 0);

      const pointToCamera = camera.position.clone().sub(pointVec);
      const pointToCenter = modelCenter.clone().sub(pointVec);

      if (pointToCamera.dot(pointToCenter) > 0.1) {
        const newPos = pointVec.clone().sub(modelCenter).setLength(2.5).add(pointVec);
        if (newPos.y < -1.5) {
          newPos.y = -1.5;
        }
        targetPosition.current.copy(newPos);
      } else {
        const newPos = pointToCamera.setLength(2).add(pointVec);
        targetPosition.current.copy(newPos);
      }

      targetLookAt.current.copy(pointVec);
      isAnimatingCamera.current = true;
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    } else {
      targetPosition.current.set(0, 0, 4.2);
      targetLookAt.current.set(0, 0, 0);
      isAnimatingCamera.current = true;
    }
  }, [focusedPainPoint, camera, controlsRef]);

  useFrame(() => {
    if (isAnimatingCamera.current) {
      const speed = 0.05;

      camera.position.lerp(targetPosition.current, speed);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, speed);
        controlsRef.current.update();
      }

      if (
        camera.position.distanceTo(targetPosition.current) < 0.01 &&
        (controlsRef.current && controlsRef.current.target.distanceTo(targetLookAt.current) < 0.01)
      ) {
        isAnimatingCamera.current = false;
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      }
    }
  });
}
