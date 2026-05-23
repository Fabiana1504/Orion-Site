"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Helper component for animating SVG paths
const AnimatedPath = ({ d, color, delay, strokeWidth = 4 }) => {
  return (
    <motion.path
      d={d}
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, fillOpacity: 0 }}
      animate={{ pathLength: 1, fillOpacity: 1 }}
      transition={{
        pathLength: { delay, duration: 1.4, ease: "easeInOut" },
        fillOpacity: { delay: delay + 1.1, duration: 0.8, ease: "easeOut" }
      }}
    />
  );
};

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[min(760px,86svh)] flex-col items-center justify-center overflow-hidden px-[clamp(16px,4vw,32px)] pb-[clamp(28px,6svh,56px)] pt-[clamp(36px,7svh,76px)] backdrop-blur-[3px]"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[28%] z-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px]"
        aria-hidden
        style={{
          width: "min(115vw, 960px)",
          aspectRatio: 1,
          background: "radial-gradient(circle, rgba(255,255,255,0.04), rgba(255,255,255,0.015) 42%, transparent 68%)",
        }}
      />
      <div className="relative z-10 flex w-[min(100%,1180px)] flex-col items-center gap-[clamp(8px,1.6svh,16px)] text-center">
        <motion.div
          className="flex w-[min(100%,1120px)] items-center justify-center mt-[clamp(40px,8svh,100px)] mb-[clamp(60px,10svh,120px)]"
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg
            id="Capa_1"
            data-name="Capa 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="20 470 1040 265"
            className="w-full object-contain"
            style={{
              maxHeight: "clamp(320px, 65svh, 760px)",
              filter: "drop-shadow(0 0 52px rgba(61,140,255,0.22)) drop-shadow(0 32px 72px rgba(0,0,0,0.55))",
            }}
          >
            {/* Path 6: Star Logo (Blue) */}
            <AnimatedPath
              d="M111.06,486.27h0m-16.38,52.6c3.07,5.74,5.78,9.72,8.34,12.45h0a60.26,60.26,0,0,0,11.1,9.68A70.4,70.4,0,0,0,94.7,585.14a88,88,0,0,0-9.8-13.81A85,85,0,0,0,74,560.79a74.13,74.13,0,0,0,12.59-10.55l-.34-.32a50.85,50.85,0,0,0,8.45-11M95,482.29h0c-.32,0-.49,1.72-.9,4.64-.37,2.71-.91,5.39-1.3,8.09-3.93,27.78-18.32,43.66-18.32,43.66C57.63,556.33,34.8,557.72,29,557.9c11.07,2.4,29.39,8.41,43.23,24.39,14.84,17.12,18.5,38.75,21,53.56,1,5.93,1.47,10.88,1.71,14.23.36-2.46.92-6.06,1.73-10.39,3.42-18.33,7.18-38.44,15.85-52.23,3.28-5.22,15.52-22.67,48.36-30.3h-.33c-8.23,0-30.92-1.16-45.1-17,0,0-12.45-13.9-18-45.14-.41-2.32-.92-4.63-1.31-6.95-.65-3.78-.89-5.78-1.23-5.78Zm65.94,74.87h0Z"
              color="#005ece"
              delay={0.2}
            />
            {/* Path 1: Letter 'O' (White) */}
            <AnimatedPath
              d="M316.73,583.08a10.85,10.85,0,0,0-5.91-6.09c-2.7-1.13-5.71-1.09-8.65-1-50.51,1-99-.66-149.48.38-8.63.19-16.74,3.45-20.1,9.69a21.67,21.67,0,0,0-2,5.73c-2.94,13.45-6,26.77-9.39,40.11-1.93,7.56-3.36,18.56,7.45,18.56q81,0,161.93,0c3.53,0,7.35-.11,10.2-2.19,3.22-2.34,4.37-6.56,5.32-10.44q5.09-20.92,10.16-41.81C317.28,591.73,318.28,587.16,316.73,583.08Zm-39.9,26.52c-1.22,3.71-2.42,7.43-3.63,11.14a2.13,2.13,0,0,1-2,1.49l-111.61.7c-1.53,0-2.55-1-2-2.46,1.39-3.65,2.8-7.32,4.18-11,.59-1.46,1-2.48,2.68-2.71a51.68,51.68,0,0,1,6.59-.12q7,0,14.09,0,14.1,0,28.19.09c18.79.11,37.59.26,56.38.09l5.07,0A2.18,2.18,0,0,1,276.83,609.6Z"
              color="#ffffff"
              delay={0.4}
            />
            {/* Path 7: Letter 'R' (White) */}
            <AnimatedPath
              d="M503.27,648.62c3.2-2.34,4.36-6.57,5.3-10.44q5.07-20.89,10.18-41.82c1-4.24,2-8.81.49-12.89a11,11,0,0,0-5.92-6.1c-2.69-1.12-5.71-1.08-8.65-1-50.52,1-101.3-1-151.82,0-8.63.19-14.39,3.86-17.78,10.08a22.44,22.44,0,0,0-2,5.73c-2.94,13.44-6,26.78-9.38,40.1a35,35,0,0,0-1.33,9.54,16.61,16.61,0,0,0,1.59,8.25c2.79,5.58,7.6,7.4,12.35,10.69,4,2.76,9,7.56,13.08,16.53a1.89,1.89,0,0,0,1.71,1.12h41.49a1.89,1.89,0,0,0,1.76-2.54,67.8,67.8,0,0,0-7.79-15.11,70,70,0,0,0-5.31-6.82,1.87,1.87,0,0,1,1.42-3.1q25.3,0,50.61,0a1.88,1.88,0,0,1,1.22.45L466.1,678.1a1.88,1.88,0,0,0,1.22.45h42.43c3.46,0,5.19-3.54,2.74-5.62l-22.14-18.82a1.88,1.88,0,0,1,1.22-3.31h1.5C496.6,650.8,500.39,650.72,503.27,648.62ZM359.75,620.47l4.18-11c.33-.82,2.13-2.73,3-2.75,37-.45,73,.44,110,0A2.18,2.18,0,0,1,479,609.6c-1.2,3.71-2.42,7.43-3.63,11.14a2.13,2.13,0,0,1-2,1.49l-111.71.7C360.12,623,359.2,621.9,359.75,620.47Z"
              color="#ffffff"
              delay={0.5}
            />
            {/* Path 5: Letter 'I' (White) */}
            <AnimatedPath
              d="M544.82,581.73,525.5,669.64c-1,4.51,3,8.69,8.48,8.81l24.69.52c4.47.1,8.33-2.62,9-6.34l15.72-88.44c.8-4.5-3.35-8.55-8.76-8.55H553.53C549.26,575.64,545.6,578.2,544.82,581.73Z"
              color="#ffffff"
              delay={0.6}
            />
            {/* Path 2: Letter 'O' (White) */}
            <AnimatedPath
              d="M783.51,582.64a10.88,10.88,0,0,0-5.9-6.1c-2.71-1.12-5.73-1.08-8.65-1-50.52,1-101-.21-151.51.83-8.65.19-14.73,3-18.09,9.24a21.62,21.62,0,0,0-2,5.74c-2.94,13.44-6,26.78-9.38,40.1C586,639,584.59,650,595.4,650q81,0,162,0c3.52,0,7.32-.08,10.17-2.18,3.23-2.35,4.39-6.57,5.33-10.45q5.07-20.93,10.16-41.81C784.06,591.28,785.08,586.72,783.51,582.64Zm-40.43,27.41q-1.82,5.57-3.61,11.14a2.2,2.2,0,0,1-2,1.49l-111.58,1.2a2.17,2.17,0,0,1-2-3c1.41-3.65,2.8-7.32,4.21-11a2.16,2.16,0,0,1,2-1.39l111-1.37A2.17,2.17,0,0,1,743.08,610.05Z"
              color="#ffffff"
              delay={0.7}
            />
            {/* Path 3: Letter 'N' (White) */}
            <AnimatedPath
              d="M983.8,595.25q-5.1,20.91-10.17,41.8c-.94,3.9-2.1,8.11-5.32,10.46a17,17,0,0,1-10,2.93c-18,0-35.61-.15-53.62,0-1.86,0-4.41-1.46-5.81-2.62-1.61-1.34-3-3-4.54-4.34l-9-7.76-19.48-16.86-8.78-7.6a2.73,2.73,0,0,0-4.3,1l-6.49,15.5-5,12.06c-1.13,2.71-2,6.81-3.75,9.16a1.6,1.6,0,0,1-.64.54c-.49.22-1.42.9-2,.89-13-.22-25.47,0-38.5,0-10.81,0-9.57-11.74-7.64-19.29,3.38-13.33,6.45-26.65,9.38-40.11a22.27,22.27,0,0,1,2-5.74c3.38-6.22,8.94-8.78,17.59-8.95,9.38-.18,19.53.2,28.9,0,4.85-.1,9.83.1,14.68,0a21.44,21.44,0,0,1,8.17,1.65,39.17,39.17,0,0,1,5.3,3.07l9.74,5.6,23.73,13.64,15.67,9a2.81,2.81,0,0,0,1.35.36,2.77,2.77,0,0,0,2.68-2.2L932.86,584a10.35,10.35,0,0,1,9.92-8.22l27-.55c2.92-.06,5.95-.1,8.65,1a10.91,10.91,0,0,1,5.91,6.09C985.85,586.43,984.83,591,983.8,595.25Z"
              color="#ffffff"
              delay={0.8}
            />
            {/* Path 4: Blue curve accent (Blue) */}
            <AnimatedPath
              d="M119.84,663c14.45.9,51.79,5.13,81.42,31.81a107.56,107.56,0,0,1,19.54,23.37h61.89a77.15,77.15,0,0,0-24.76-36.35A89,89,0,0,0,215.58,663Z"
              color="#005ece"
              delay={0.9}
            />
            {/* Path 8: Blue long horizontal line (Blue) */}
            <AnimatedPath
              d="M261.58,663c7.7,4.21,21,12.69,31.14,27a70.58,70.58,0,0,1,12.1,28.19H1048.6l-36.18-23.93-678.19-.82a47.38,47.38,0,0,0-11.58-19.94A60,60,0,0,0,309.15,663Z"
              color="#005ece"
              delay={1.0}
            />
            {/* Path 9: Blue secondary horizontal line (Blue) */}
            <AnimatedPath
              d="M1000.14,678.48,578.36,679a1.07,1.07,0,0,1-1.05-1.31l2.27-9.74a6.32,6.32,0,0,1,6.16-4.89c86.9.15,193,.38,279.12.53L977.48,663a1.18,1.18,0,0,1,.55.14Z"
              color="#005ece"
              delay={1.1}
            />
          </svg>
        </motion.div>

        <motion.p
          className="w-full max-w-full text-[0.82rem] font-medium uppercase tracking-[0.2em] text-[rgba(255,255,255,0.48)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Precision · Identity · Performance
        </motion.p>

        <motion.div
          className="mt-2 flex w-full max-w-[34rem] flex-col items-center gap-[clamp(8px,1.4svh,12px)]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45 }}
        >
          <p className="m-0 w-full max-w-full text-[0.82rem] font-medium uppercase tracking-[0.2em] text-[rgba(255,255,255,0.48)]">
            Laboratory access
          </p>
          <div className="flex w-full flex-wrap items-center justify-center gap-3">
            <Link
              href="/equipo/laboratorio"
              className="inline-flex min-h-11 min-w-[min(11rem,100%)] items-center justify-center whitespace-nowrap rounded-[999px] px-[22px] py-[10px] text-center text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white no-underline transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #3d8cff, #2563c9 55%, #4f46e5 130%)",
                boxShadow: "0 8px 24px rgba(37, 99, 201, 0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.05)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(37, 99, 201, 0.42)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(37, 99, 201, 0.35)";
              }}
            >
              Private access
            </Link>
            <Link
              href="/herramientas-equipos"
              className="inline-flex min-h-11 min-w-[min(11rem,100%)] items-center justify-center whitespace-nowrap rounded-[999px] border border-white/16 bg-transparent px-[22px] py-[10px] text-center text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[rgba(244,246,251,0.9)] no-underline transition-all duration-200 hover:border-[rgba(61,140,255,0.5)] hover:text-white"
              style={{
                borderColor: "rgba(61, 140, 255, 0.32)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(61, 140, 255, 0.5)";
                e.currentTarget.style.background = "rgba(61, 140, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(61, 140, 255, 0.32)";
                e.currentTarget.style.background = "";
              }}
            >
              Team access
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
