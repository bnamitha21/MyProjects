import { Line } from '@react-three/drei';
import * as THREE from 'three';

const MineStructure3D = ({ tunnels }) => {
  return (
    <group>
      {/* Ground/Surface level */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#4a5568" 
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* Grid on ground */}
      <gridHelper args={[100, 20, '#718096', '#4a5568']} position={[0, 0.1, 0]} />

      {/* Render tunnels */}
      {tunnels.map((tunnel) => {
        const start = new THREE.Vector3(...tunnel.start);
        const end = new THREE.Vector3(...tunnel.end);
        const direction = end.clone().sub(start);
        const length = direction.length();
        const center = start.clone().add(end).multiplyScalar(0.5);

        // Calculate rotation
        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(axis, direction.clone().normalize());
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        return (
          <group key={tunnel.id}>
            {/* Tunnel tube */}
            <mesh
              position={center}
              rotation={[euler.x, euler.y, euler.z]}
            >
              <cylinderGeometry args={[tunnel.width / 2, tunnel.width / 2, length, 16]} />
              <meshStandardMaterial
                color="#2d3748"
                metalness={0.2}
                roughness={0.8}
                transparent
                opacity={0.4} // More transparent for better visibility
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Tunnel outline for better visibility */}
            <mesh
              position={center}
              rotation={[euler.x, euler.y, euler.z]}
            >
              <cylinderGeometry args={[tunnel.width / 2 + 0.1, tunnel.width / 2 + 0.1, length, 16]} />
              <meshBasicMaterial
                color={tunnel.type === 'main' ? '#fbbf24' : '#60a5fa'}
                wireframe
                transparent
                opacity={0.3}
              />
            </mesh>

            {/* Tunnel support beams */}
            {Array.from({ length: Math.floor(length / 5) }).map((_, i) => {
              const t = i / Math.floor(length / 5);
              const beamPos = start.clone().lerp(end, t);
              
              return (
                <group key={`beam-${tunnel.id}-${i}`} position={beamPos}>
                  {/* Vertical supports */}
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <torusGeometry args={[tunnel.width / 2, 0.1, 8, 16]} />
                    <meshStandardMaterial 
                      color="#a0522d" 
                      metalness={0.6}
                      roughness={0.4}
                    />
                  </mesh>
                </group>
              );
            })}

            {/* Tunnel centerline for visualization */}
            <Line
              points={[tunnel.start, tunnel.end]}
              color={tunnel.type === 'main' ? '#fbbf24' : '#60a5fa'}
              lineWidth={2}
              dashed={false}
            />

            {/* Tunnel lighting */}
            {Array.from({ length: Math.floor(length / 8) }).map((_, i) => {
              const t = i / Math.floor(length / 8);
              const lightPos = start.clone().lerp(end, t);
              
              return (
                <pointLight
                  key={`light-${tunnel.id}-${i}`}
                  position={lightPos}
                  intensity={0.5}
                  distance={10}
                  color="#fff5e6"
                />
              );
            })}
          </group>
        );
      })}

      {/* Main entrance marker */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[2, 3, 4]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive="#fbbf24"
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
        
        {/* Entrance sign */}
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[3, 1, 0.2]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      </group>

      {/* Rock walls/environment - Now transparent */}
      <group>
        {/* Underground rock layers */}
        <mesh position={[0, -15, 0]} receiveShadow>
          <boxGeometry args={[80, 0.5, 80]} />
          <meshStandardMaterial 
            color="#1a202c" 
            metalness={0.1}
            roughness={1}
            transparent
            opacity={0.1}
          />
        </mesh>
        <mesh position={[0, -25, 0]} receiveShadow>
          <boxGeometry args={[90, 0.5, 90]} />
          <meshStandardMaterial 
            color="#171923" 
            metalness={0.1}
            roughness={1}
            transparent
            opacity={0.1}
          />
        </mesh>
      </group>

      {/* Depth Level Indicators */}
      <group>
        {/* Surface level (0m) */}
        <mesh position={[-35, 0, 0]}>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Level 1 (-10m) */}
        <mesh position={[-35, -10, 0]}>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Level 2 (-20m) */}
        <mesh position={[-35, -20, 0]}>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Vertical reference line */}
        <Line
          points={[[-35, 2, 0], [-35, -25, 0]]}
          color="#6b7280"
          lineWidth={1}
          dashed={true}
          dashScale={2}
        />
      </group>
    </group>
  );
};

export default MineStructure3D;
