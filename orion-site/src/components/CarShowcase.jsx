import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import CarModelViewer from "./CarModelViewer";

export default function CarShowcase() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.88, 1], [0.5, 1, 1, 0.88]);
  const beamX = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section id="car" className="section car-section" ref={sectionRef}>
      <div className="container">
        <div className="car-heading">
          <p className="eyebrow">Vehicle</p>
          <h2>The car in 360°.</h2>
          <p className="section-text">
            3D model from <code className="inline-code">public/gulf_mclaren_f1_2022_car.glb</code>.
            Drag with mouse or finger to rotate the camera around the car; zoom with wheel or pinch.
          </p>
        </div>

        <div
          className={`car-scroll-stage car-scroll-stage--integrated ${reduceMotion ? "car-scroll-stage--reduced" : ""}`}
        >
          {!reduceMotion && <motion.div className="car-stage-beam car-stage-beam--soft" style={{ x: beamX }} aria-hidden />}

          <div className="car-track-line car-track-line--soft" />
          <div className="car-floor-ring car-floor-ring--soft" />

          <div className="car-badge-wrap">
            <span className="car-badge">ORION</span>
            <span className="car-badge-sub">STEM · F1 in Schools</span>
          </div>

          <motion.div
            className="f1-scroll-car-pivot f1-scroll-car-pivot--frames"
            style={{ scale, opacity }}
          >
            <CarModelViewer />
          </motion.div>
        </div>

        <div className="car-note">
          <span>Drag to rotate · wheel or pinch to zoom</span>
          <p>
            If you prefer less motion across the page, enable "Reduce motion" in your system settings
            (model controls remain available).
          </p>
        </div>
      </div>
    </section>
  );
}
