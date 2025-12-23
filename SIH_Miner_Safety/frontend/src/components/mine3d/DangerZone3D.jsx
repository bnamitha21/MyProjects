import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getSeverityColor } from '../../utils/mineData';

const DangerZone3D = ({ zone, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Pulsing animation for danger zones
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const color = getSeverityColor(zone.severity);

  const getIcon = () => {
    switch (zone.type) {
      case 'gas':
        return '☁️';
      case 'structural':
        return '⚠️';
      case 'temperature':
        return '🔥';
      default:
        return '⚡';
    }
  };

  return (
    <group position={zone.position}>
      {/* Danger zone sphere */}
      <mesh
        ref={meshRef}
        onClick={() => onClick(zone)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[zone.radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.3}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Warning wireframe */}
      <mesh>
        <sphereGeometry args={[zone.radius + 0.2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Central warning icon */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Rotating warning rings */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[zone.radius * 0.5, 0.1, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
          />
        </mesh>
      </group>

      {/* Info tooltip */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg border-2 border-red-500 min-w-[250px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getIcon()}</span>
              <div className="font-bold text-sm uppercase">{zone.type} Hazard</div>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Severity:</span>
                <span className={`font-bold ${
                  zone.severity === 'critical' ? 'text-red-400' :
                  zone.severity === 'high' ? 'text-orange-400' :
                  'text-yellow-400'
                }`}>
                  {zone.severity.toUpperCase()}
                </span>
              </div>
              {zone.gasType && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Type:</span>
                  <span>{zone.gasType}</span>
                </div>
              )}
              {zone.level && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Level:</span>
                  <span className="text-red-400">{zone.level} ppm</span>
                </div>
              )}
              {zone.temperature && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Temperature:</span>
                  <span className="text-orange-400">{zone.temperature}°C</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-gray-700 text-gray-300">
                {zone.description}
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Warning light effect */}
      <pointLight
        color={color}
        intensity={zone.severity === 'critical' ? 2 : 1}
        distance={zone.radius * 2}
      />
    </group>
  );
};

export default DangerZone3D;
