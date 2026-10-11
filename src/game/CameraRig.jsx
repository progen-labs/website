import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const desired = new THREE.Vector3(0, 8, 13);
const look = new THREE.Vector3();
const curLook = new THREE.Vector3(0, 1.6, -3);

/** Third-person follow camera; flies into the gate during the 'entering' cinematic. */
export default function CameraRig({ posRef, phase, spectraPos }) {
  const { camera } = useThree();
  useFrame(() => {
    let lp = 0.08;
    let ll = 0.1;
    if (phase === 'entering') {
      desired.set(spectraPos[0], 2.7, spectraPos[2] + 3);
      look.set(spectraPos[0], 2.7, spectraPos[2] - 6);
      lp = 0.035;
      ll = 0.05;
    } else {
      desired.set(posRef.current.x, 8, posRef.current.z + 13);
      look.set(posRef.current.x, 1.6, posRef.current.z - 3);
    }
    camera.position.lerp(desired, lp);
    curLook.lerp(look, ll);
    camera.lookAt(curLook);
  });
  return null;
}
