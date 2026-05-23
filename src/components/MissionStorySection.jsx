"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import OrionConstellation from "./OrionConstellation";

const RADAR_MISION = [
  { eje: "Innovation", valor: 98 },
  { eje: "Speed", valor: 90 },
  { eje: "Teamwork", valor: 92 },
  { eje: "Communication", valor: 85 },
  { eje: "Precision", valor: 88 },
  { eje: "Responsibility", valor: 87 },
  { eje: "Identity", valor: 91 },
];

const tooltipStyle = {
  backgroundColor: "rgba(21, 26, 36, 0.96)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  color: "#f4f6fb",
};

export default function MissionStorySection() {
  return (
    <section id="historia" className="relative py-[clamp(72px,10vw,96px)]">
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "min(900px, 90vw)",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
        }}
      />
      <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
        <div className="mx-auto mb-7 max-w-[48rem] text-center">
          <p className="mb-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
            Story &amp; data
          </p>
          <h2>The mission behind the car</h2>
          <p className="m-0 mx-auto max-w-[42rem] text-[0.95rem] leading-[1.55] text-[rgba(244,246,251,0.58)]">
            Orion is more than a name: it is constellation, team, and promise. Here is the story that defines
            us, plus two data views: the sky we chose as our map and the 2026 season radar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-[18px]">
          <OrionConstellation />

          <div
            className="mt-[2px] rounded-[22px] border border-white/10 p-[clamp(22px,4vw,32px)] backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            <p className="m-0 mb-4 text-[0.95rem] leading-[1.7] text-[rgba(244,246,251,0.8)]">
              Our story says we are <strong>seven stars</strong> in the <strong>Orion</strong> constellation:
              a map in the sky that reminds us to move in alignment. For those in the team who share faith,
              there is also room for <strong>God</strong> in that same sky that names us.
            </p>
            <p className="m-0 mb-4 text-[0.95rem] leading-[1.7] text-[rgba(244,246,251,0.8)]">
              We came to Earth to build the <strong>fastest car</strong>. But during our trip to
              <strong> Mexico</strong> we understood something deeper: the new mission was not just speed,
              but <strong>innovation</strong> in how we design, test, and communicate what we do.
            </p>
            <p
              className="m-0 rounded-[14px] border px-4 py-[14px] text-[0.95rem] leading-[1.7] text-[rgba(244,246,251,0.92)]"
              style={{
                borderColor: "rgba(61, 140, 255, 0.22)",
                background: "linear-gradient(135deg, rgba(61,140,255,0.1), rgba(99,102,241,0.06))",
              }}
            >
              <strong>2025</strong> is already written: <strong>we participated and won</strong>. <strong>2026</strong>
              is the season where that mission becomes evidence, with <strong>innovation</strong> in every
              delivery, every test, and every presentation.
            </p>
          </div>
        </div>

        <div
          className="mt-7 rounded-[22px] border border-white/10 p-[clamp(20px,3vw,28px)] backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)] max-[640px]:rounded-[16px]"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
          }}
        >
          <div className="mb-2">
            <h3 className="m-0 mb-2 text-[1.05rem] font-semibold text-[rgba(255,255,255,0.95)]">
              The seven stars: 2026 focus
            </h3>
            <p className="m-0 mb-[14px] text-[0.82rem] leading-[1.45] text-[rgba(244,246,251,0.58)]">
              Seven-axis radar to show where we focus our energy this season (illustrative values).
            </p>
          </div>
          <div className="size-full h-[clamp(280px,48vw,400px)] w-full max-[640px]:h-[clamp(260px,78vw,340px)]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="52%"
                outerRadius="78%"
                data={RADAR_MISION}
                margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
              >
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="eje" tick={{ fill: "rgba(244,246,251,0.65)", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "rgba(244,246,251,0.4)", fontSize: 10 }} />
                <Radar
                  name="Orion 2026"
                  dataKey="valor"
                  stroke="#3d8cff"
                  strokeWidth={2}
                  fill="url(#missionRadarFill)"
                  fillOpacity={0.45}
                />
                <defs>
                  <linearGradient id="missionRadarFill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3d8cff" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${Number(v).toFixed(0)} / 100`, "Relative weight"]}
                />
                <Legend
                  wrapperStyle={{ color: "rgba(244,246,251,0.75)", fontSize: 12 }}
                  formatter={() => "Focus projection"}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
