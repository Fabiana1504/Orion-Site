"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
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
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.88, 1],
    [0.5, 1, 1, 0.88],
  );
  const beamX = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section id="car" className="relative pb-[112px] pt-8" ref={sectionRef}>
      <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
        <div className="mb-7 max-w-[36rem]">
          <p className="mb-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
            Vehicle
          </p>
          <h2>The car in 360°.</h2>
        </div>

        <div
          className="relative flex h-[clamp(420px,68svh,760px)] items-center justify-center overflow-hidden rounded-[24px] p-[clamp(22px,4vw,40px)_clamp(14px,3vw,24px)] backdrop-blur-[20px]"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
          }}
        >
          {!reduceMotion && (
            <motion.div
              className="pointer-events-none absolute left-[-30%] top-[8%] z-[1] size-[160%_55%] mix-blend-screen opacity-[0.28]"
              aria-hidden
              style={{
                background:
                  "linear-gradient(105deg, transparent, rgba(61,140,255,0.04) 40%, rgba(255,255,255,0.03) 50%, rgba(61,140,255,0.04) 60%, transparent)",
                x: beamX,
              }}
            />
          )}

          <div
            className="absolute bottom-[21%] left-[10%] right-[10%] z-[2] h-px opacity-55"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(120,190,255,0.35), transparent)",
              boxShadow: "0 0 12px rgba(120,190,255,0.2)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-[16%] left-1/2 z-[1] -translate-x-1/2 rounded-full opacity-55 blur-[22px]"
            style={{
              width: "min(76%, 680px)",
              height: "88px",
              background:
                "radial-gradient(ellipse at center, rgba(61,140,255,0.28), rgba(99,102,241,0.08) 45%, transparent 72%)",
            }}
          />

          <motion.div
            className="relative z-[4] w-full h-full"
            style={{ scale, opacity }}
          >
            <CarModelViewer />
          </motion.div>
        </div>

        <div className="mt-[22px] flex max-w-[36rem] flex-col gap-[6px] text-[0.88rem] leading-[1.5] text-[rgba(244,246,251,0.58)]">
          <span className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white/55">
            Drag to rotate · wheel or pinch to zoom
          </span>
        </div>
      </div>
    </section>
  );
}
