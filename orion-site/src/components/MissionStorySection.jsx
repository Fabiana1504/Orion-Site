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

/** Siete ejes = las siete estrellas del asterismo: foco 2026 */
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
    <section id="historia" className="section section-mission">
      <div className="container">
        <div className="section-head section-head--center">
          <p className="eyebrow">Story & data</p>
          <h2>The mission behind the car</h2>
          <p className="section-lead section-lead--center">
            Orion is more than a name: it is constellation, team, and promise. Here is the story that defines
            us, plus two data views: the sky we chose as our map and the 2026 season radar.
          </p>
        </div>

        <div className="mission-grid mission-grid--stacked">
          <OrionConstellation />

          <div className="mission-narrative clean-panel mission-narrative--after-constellation">
            <p className="mission-text">
              Our story says we are <strong>seven stars</strong> in the <strong>Orion</strong> constellation:
              a map in the sky that reminds us to move in alignment. For those in the team who share faith,
              there is also room for <strong>God</strong> in that same sky that names us.
            </p>
            <p className="mission-text">
              We came to Earth to build the <strong>fastest car</strong>. But during our trip to
              <strong> Mexico</strong> we understood something deeper: the new mission was not just speed,
              but <strong>innovation</strong> in how we design, test, and communicate what we do.
            </p>
            <p className="mission-text mission-text--highlight">
              <strong>2025</strong> is already written: <strong>we participated and won</strong>. <strong>2026</strong>
              is the season where that mission becomes evidence, with <strong>innovation</strong> in every
              delivery, every test, and every presentation.
            </p>
          </div>
        </div>

        <div className="mission-radar-block clean-panel">
          <div className="mission-radar-head">
            <h3 className="mission-chart-title">The seven stars: 2026 focus</h3>
            <p className="mission-chart-caption">
              Seven-axis radar to show where we focus our energy this season (illustrative values).
            </p>
          </div>
          <div className="mission-radar-wrap">
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
