import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getRiskLevelColor } from '../../utils/mineData';

/**
 * RiskZone3D renders a semi-transparent sphere representing an AI-predicted
 * risk-prone area for admins only. It is intentionally similar to DangerZone3D
 * but uses riskLevel instead of severity, and shows model explanations.
 *
 * Expected riskZone shape (coming from backend):
 * {
 *   id: string | number,
 *   zoneId: string,
 *   position: [number, number, number],
 *   radius: number,
 *   riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
 *   riskScore: number,           // 0-1
 *   topReasons?: string[],       // explanation tags
 * }
 */
const RiskZone3D = ({ riskZone, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Gentle pulsing animation to draw admin attention
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.8) * 0.08 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const color = getRiskLevelColor(riskZone.riskLevel);

  return (
    <group position={riskZone.position}>
      {/* Main risk volume */}
      <mesh
        ref={meshRef}
        onClick={() => onClick?.(riskZone)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[riskZone.radius ?? 4, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.35}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Wireframe outline for clarity */}
      <mesh>
        <sphereGeometry args={[riskZone.radius ? riskZone.radius + 0.3 : 4.3, 16, 16]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Central core */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Tooltip with AI explanation */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg border-2 border-blue-500 min-w-[260px] max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm uppercase tracking-wide">AI Risk Prediction</div>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: color }}
              >
                {riskZone.riskLevel}
              </span>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Risk score:</span>
                <span className="font-semibold">{(riskZone.riskScore * 100).toFixed(0)}%</span>
              </div>
              {riskZone.zoneId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Zone:</span>
                  <span className="font-mono">{riskZone.zoneId}</span>
                </div>
              )}
              {Array.isArray(riskZone.topReasons) && riskZone.topReasons.length > 0 && (
                <div className="pt-2 mt-1 border-t border-gray-700 text-gray-200">
                  <div className="font-semibold mb-1">Why this area is risky:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {riskZone.topReasons.slice(0, 3).map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!riskZone.topReasons && (
                <div className="pt-2 mt-1 border-t border-gray-700 text-gray-300">
                  Model indicates elevated risk compared to nearby zones.
                </div>
              )}
            </div>
          </div>
        </Html>
      )}

      {/* Soft glow light */}
      <pointLight
        color={color}
        intensity={riskZone.riskLevel === 'CRITICAL' ? 2 : 1.2}
        distance={(riskZone.radius ?? 4) * 2}
      />
    </group>
  );
};

export default RiskZone3D;
