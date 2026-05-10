import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import SafeImage from "./SafeImage";

const CAR_GLB_PATH = "/gulf_mclaren_f1_2022_car.glb";

function CarModel() {
  const { scene } = useGLTF(CAR_GLB_PATH);
  const cloned = useMemo(() => scene.clone(), [scene]);

  return (
    <group position={[0, -0.45, 0]}>
      <primitive object={cloned} scale={0.95} />
    </group>
  );
}

export default function CarModelViewer() {
  return (
    <div className="car-model-wrapper" aria-label="Modelo 3D del auto Orion">
      <Canvas
        className="car-model-canvas"
        camera={{ position: [0, 1.15, 3.4], fov: 36 }}
        dpr={[1, 1.75]}
      >
        <color attach="background" args={["#00000000"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 6, 3]} intensity={1.6} />
        <directionalLight position={[-3, 2, -2]} intensity={0.55} />

        <Suspense fallback={null}>
          <CarModel />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={2.2}
          maxDistance={6.5}
          target={[0, 0.15, 0]}
        />

        <ContactShadows
          position={[0, -0.93, 0]}
          opacity={0.35}
          scale={6}
          blur={2.5}
          far={1.8}
        />
      </Canvas>

      <div className="car-model-fallback">
        <SafeImage
          src="/images/hero-car.png"
          alt="Car Orion"
          className="f1-scroll-car"
          loading="eager"
          draggable={false}
        />
      </div>
    </div>
  );
}

