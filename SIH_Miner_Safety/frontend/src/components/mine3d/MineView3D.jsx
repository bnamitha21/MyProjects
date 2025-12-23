import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sky } from '@react-three/drei';
import Worker3D from './Worker3D';
import DangerZone3D from './DangerZone3D';
import MineStructure3D from './MineStructure3D';
import RiskZone3D from './RiskZone3D';

const MineView3D = ({ 
  workers, 
  dangerZones, 
  tunnels, 
  onWorkerClick, 
  onDangerZoneClick,
  riskZones = [],
  onRiskZoneClick,
  cameraPosition = [40, 20, 40]
}) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={cameraPosition} fov={60} />
          
          {/* Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={150}
            maxPolarAngle={Math.PI} // Allow full rotation including underground view
            minPolarAngle={0}
            enableRotate={true}
            enablePan={true}
            enableZoom={true}
            target={[0, -15, 0]} // Focus deeper in the mine
            panSpeed={2}
            rotateSpeed={1}
            zoomSpeed={1.2}
          />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[50, 50, 25]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={100}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />
          <hemisphereLight intensity={0.2} groundColor="#1a202c" />

          {/* Environment */}
          <Sky 
            distance={450000} 
            sunPosition={[50, 50, 25]} 
            inclination={0.6} 
            azimuth={0.25} 
          />
          <Environment preset="sunset" />
          
          {/* Fog for depth perception */}
          <fog attach="fog" args={['#1a202c', 30, 100]} />

          {/* Mine Structure */}
          <MineStructure3D tunnels={tunnels} />

          {/* Workers */}
          {workers.map((worker) => (
            <Worker3D
              key={worker.id}
              worker={worker}
              onClick={onWorkerClick}
            />
          ))}

          {/* Danger Zones - static / sensor-based */}
          {dangerZones.map((zone) => (
            <DangerZone3D
              key={zone.id}
              zone={zone}
              onClick={onDangerZoneClick}
            />
          ))}

          {/* AI-predicted Risk Zones (admin only, passed from parent) */}
          {Array.isArray(riskZones) && riskZones.map((rz) => (
            <RiskZone3D
              key={rz.id ?? rz.zoneId}
              riskZone={rz}
              onClick={onRiskZoneClick}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default MineView3D;
