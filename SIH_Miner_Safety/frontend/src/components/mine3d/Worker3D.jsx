import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import { getWorkerStatusColor } from '../../utils/mineData';

const Worker3D = ({ worker, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = worker.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const color = getWorkerStatusColor(worker.status);

  return (
    <group position={worker.position}>
      {/* Worker body (capsule-like shape) */}
      <mesh
        ref={meshRef}
        onClick={() => onClick(worker)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <capsuleGeometry args={[0.3, 1, 8, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Worker helmet */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Helmet light */}
      <pointLight position={[0, 0.8, 0.5]} intensity={0.5} distance={5} color="#fff9e6" />
      <mesh position={[0, 0.8, 0.4]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#ffeb3b" 
          emissive="#ffeb3b"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Status indicator ring */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.05, 8, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Name label */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700 min-w-[200px]">
            <div className="font-bold text-sm mb-1">{worker.name}</div>
            <div className="text-xs text-gray-300">
              <div>Role: {worker.role}</div>
              <div>Status: {worker.status}</div>
              <div>Heart Rate: {worker.heartRate} bpm</div>
              <div>O₂: {worker.oxygenLevel}%</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Worker3D;
