import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AiChartPanels from "./AiChartPanels";
import { useTelemetryPublished } from "../hooks/useTelemetryPublished";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = ["#3d8cff", "#6366f1", "#22d3ee", "#a78bfa", "#f472b6"];

const DEFAULT_DIST_M = "25";
const DEFAULT_TIME_S = "1.2";
const DEFAULT_REACTION_MS = "180";
const DEFAULT_REACTION_SPEED_KMH = "48";
const DEFAULT_MASS_G = "85";
const DEFAULT_MASS_TARGET_G = "100";
const DEFAULT_ACCEL_V0 = "0";
const DEFAULT_ACCEL_V1 = "12";
const DEFAULT_ACCEL_T = "2.5";
const DEFAULT_BAR_ROWS = [
  { id: "1", label: "Prueba 1", value: "42" },
  { id: "2", label: "Prueba 2", value: "38" },
  { id: "3", label: "Prueba 3", value: "51" },
  { id: "4", label: "Objetivo", value: "48" },
];
const DEFAULT_PIE_ROWS = [
  { id: "1", label: "Rectas", value: "38" },
  { id: "2", label: "Curvas lentas", value: "27" },
  { id: "3", label: "Fast corners", value: "35" },
];

/** 1 US fl oz → ml (líquido) */
const US_FLOZ_ML = 29.5735295625;

function parseNum(s) {
  const n = parseFloat(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

const tickStyle = { fill: "rgba(244, 246, 251, 0.55)", fontSize: 11 };
const tooltipStyle = {
  backgroundColor: "rgba(21, 26, 36, 0.96)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  color: "#f4f6fb",
};

export default function DataAnalysisSection() {
  const published = useTelemetryPublished();
  const [tab, setTab] = useState("calc");

  const barRowsIn = useMemo(() => {
    const chart = published?.ai?.barChart;
    if (chart?.length) {
      return chart.map((r, i) => ({
        id: String(i + 1),
        label: r.name,
        value: String(r.value),
      }));
    }
    return DEFAULT_BAR_ROWS;
  }, [published]);

  const pieRowsIn = useMemo(() => {
    const chart = published?.ai?.pieChart;
    if (chart?.length) {
      return chart.map((r, i) => ({
        id: String(i + 1),
        label: r.name,
        value: String(r.value),
      }));
    }
    return DEFAULT_PIE_ROWS;
  }, [published]);

  const distIn = DEFAULT_DIST_M;
  const timeIn = DEFAULT_TIME_S;
  const reactionMsIn =
    published?.ai?.reactionAvgMs != null
      ? String(Math.round(published.ai.reactionAvgMs * 10) / 10)
      : DEFAULT_REACTION_MS;
  const reactionSpeedIn = DEFAULT_REACTION_SPEED_KMH;
  const massGIn = DEFAULT_MASS_G;
  const massTargetIn = DEFAULT_MASS_TARGET_G;
  const accelV0In = DEFAULT_ACCEL_V0;
  const accelV1In = DEFAULT_ACCEL_V1;
  const accelTIn = DEFAULT_ACCEL_T;

  const calcResult = useMemo(() => {
    const d = parseNum(distIn);
    const t = parseNum(timeIn);
    if (d <= 0 || t <= 0) return null;
    const vMs = d / t;
    const vKmh = vMs * 3.6;
    return { vMs, vKmh, d, t };
  }, [distIn, timeIn]);

  const reactionResult = useMemo(() => {
    const tMs = parseNum(reactionMsIn);
    const vKmh = parseNum(reactionSpeedIn);
    if (tMs <= 0 || vKmh < 0) return null;
    const vMs = vKmh / 3.6;
    const tS = tMs / 1000;
    const dM = vMs * tS;
    return { tMs, vKmh, vMs, dM, tS };
  }, [reactionMsIn, reactionSpeedIn]);

  const massResult = useMemo(() => {
    const g = parseNum(massGIn);
    const target = parseNum(massTargetIn);
    if (g <= 0) return null;
    const kg = g / 1000;
    const lb = g / 453.59237;
    return { g, kg, lb, target: target > 0 ? target : null };
  }, [massGIn, massTargetIn]);

  const massBarData = useMemo(() => {
    if (!massResult) return [];
    const rows = [{ name: "Tu masa", valor: massResult.g }];
    if (massResult.target) {
      rows.push({ name: "Target / limit", valor: massResult.target });
    }
    return rows;
  }, [massResult]);

  const accelResult = useMemo(() => {
    const v0 = parseNum(accelV0In);
    const v1 = parseNum(accelV1In);
    const t = parseNum(accelTIn);
    if (t <= 0) return null;
    const a = (v1 - v0) / t;
    return { v0, v1, t, a };
  }, [accelV0In, accelV1In, accelTIn]);

  const co2Specs = useMemo(() => {
    const oz8 = 8;
    const oz12 = 12;
    const ml8 = oz8 * US_FLOZ_ML;
    const ml12 = oz12 * US_FLOZ_ML;
    const ratio = ml12 / ml8;
    return {
      oz8,
      oz12,
      ml8,
      ml12,
      ratio,
      barData: [
        { name: "8 fl oz", ml: Math.round(ml8 * 10) / 10 },
        { name: "12 fl oz", ml: Math.round(ml12 * 10) / 10 },
      ],
    };
  }, []);

  const barData = useMemo(
    () =>
      barRowsIn.map((r) => ({
        name: r.label.length > 12 ? `${r.label.slice(0, 11)}…` : r.label,
        velocidad: Math.max(0, parseNum(r.value)),
      })),
    [barRowsIn]
  );

  const pieData = useMemo(
    () =>
      pieRowsIn.map((r) => ({
        name: r.label,
        value: Math.max(0, parseNum(r.value)),
      })),
    [pieRowsIn]
  );

  const pieTotal = pieData.reduce((a, b) => a + b.value, 0);

  const gridClass = "analytics-calc-grid analytics-calc-grid--public";

  return (
    <section id="datos" className="section section-analytics">
      <div className="container">
        <motion.div
          className="section-head section-head--analytics"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow eyebrow--pulse">Laboratory</p>
          <h2 className="section-title-gradient">Data analysis</h2>
          <p className="section-lead section-lead-interactive">
            <strong>Public view</strong>: fixed examples and, if Orion published from the lab, assisted-analysis
            charts. Sensitive data and Arduino workflows stay inside{" "}
            <Link to="/equipo/laboratorio">
              laboratory
            </Link>{" "}
            (sign-in required). Below that, you can access{" "}
            <Link to="/herramientas-equipos">the public tools draft for other teams</Link> (no password).
          </p>
        </motion.div>

        <motion.div
          className="analytics-shell clean-panel"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {published?.ai && (
            <div className="analytics-published clean-panel">
              <p className="eyebrow">Published telemetry</p>
              {published.telemetry?.oilType ? (
                <p className="analytics-published-oil">
                  Reference oil: <strong>{published.telemetry.oilType}</strong>
                </p>
              ) : null}
              {published.telemetry?.manualTrackSec != null &&
              Number.isFinite(Number(published.telemetry.manualTrackSec)) ? (
                <p className="analytics-published-oil">
                  Track time (manual):{" "}
                  <strong>{Number(published.telemetry.manualTrackSec).toFixed(3)} s</strong>
                </p>
              ) : null}
              {Array.isArray(published.telemetry?.sensorDurationsSec) &&
              published.telemetry.sensorDurationsSec.length > 0 ? (
                <p className="analytics-published-oil">
                  Arduino sensors (s):{" "}
                  <strong>
                    {published.telemetry.sensorDurationsSec
                      .map((x) => (x != null && Number.isFinite(Number(x)) ? Number(x).toFixed(4) : "—"))
                      .join(" · ")}
                  </strong>
                </p>
              ) : null}
              {published.ai.chartPanels?.length ? (
                <div className="analytics-published-charts-block">
                  <p className="analytics-published-charts-title">Recorded results</p>
                  <AiChartPanels panels={published.ai.chartPanels} className="analytics-published-charts" />
                </div>
              ) : null}
              <p className="analytics-published-narrative">{published.ai.narrative}</p>
              {published.ai.confidence != null && Number.isFinite(Number(published.ai.confidence)) ? (
                <p className="analytics-published-confidence">
                  AI confidence: <strong>{(Number(published.ai.confidence) * 100).toFixed(0)}%</strong>
                </p>
              ) : null}
              {Array.isArray(published.ai.alerts) && published.ai.alerts.length > 0 ? (
                <div className="analytics-published-sub">
                  <p className="analytics-published-subtitle">Alerts</p>
                  <ul className="analytics-published-bullets analytics-published-bullets--alerts">
                    {published.ai.alerts.map((b, i) => (
                      <li key={`pa-${i}`}>{b}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {Array.isArray(published.ai.recommendations) && published.ai.recommendations.length > 0 ? (
                <div className="analytics-published-sub">
                  <p className="analytics-published-subtitle">Recommendations</p>
                  <ul className="analytics-published-bullets analytics-published-bullets--recs">
                    {published.ai.recommendations.map((b, i) => (
                      <li key={`pr-${i}`}>{b}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {published.ai.bullets?.length ? (
                <ul className="analytics-published-bullets">
                  {published.ai.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : null}
              <p className="analytics-published-meta">
                Model: {published.ai.model || "local"} · Published{" "}
                {published.publishedAt
                  ? new Date(published.publishedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          )}

          <div className="analytics-gate">
            <div className="analytics-gate-copy">
              <span className="analytics-gate-badge">Results-only view</span>
              <p>
                <strong>Laboratory</strong> (blue button): Orion telemetry, Arduino, and restricted analysis.
                <strong>Team tools</strong> (next to it): public draft so other categories can submit
                measurements without entering the lab.
              </p>
            </div>
            <div className="analytics-gate-actions">
              <Link to="/herramientas-equipos" className="btn btn-ghost analytics-sketch-btn">
                Team tools
              </Link>
              <Link
                to="/equipo/laboratorio"
                className="btn btn-primary analytics-login-btn"
              >
                Enter the laboratory
              </Link>
            </div>
          </div>

          <div className="analytics-tabs analytics-tabs--many" role="tablist" aria-label="Analysis type">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "calc"}
              className={`analytics-tab ${tab === "calc" ? "is-active" : ""}`}
              onClick={() => setTab("calc")}
            >
              Speed
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "reaction"}
              className={`analytics-tab ${tab === "reaction" ? "is-active" : ""}`}
              onClick={() => setTab("reaction")}
            >
              Reaction
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "mass"}
              className={`analytics-tab ${tab === "mass" ? "is-active" : ""}`}
              onClick={() => setTab("mass")}
            >
              Peso
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "co2"}
              className={`analytics-tab ${tab === "co2" ? "is-active" : ""}`}
              onClick={() => setTab("co2")}
            >
              CO₂ 8/12 oz
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "accel"}
              className={`analytics-tab ${tab === "accel" ? "is-active" : ""}`}
              onClick={() => setTab("accel")}
            >
              Acceleration
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "bars"}
              className={`analytics-tab ${tab === "bars" ? "is-active" : ""}`}
              onClick={() => setTab("bars")}
            >
              Barras
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "pie"}
              className={`analytics-tab ${tab === "pie" ? "is-active" : ""}`}
              onClick={() => setTab("pie")}
            >
              Circular
            </button>
          </div>

          {tab === "calc" && (
            <div className="analytics-panel" role="tabpanel">
              <div className={gridClass}>
                <div className="analytics-result clean-panel">
                  {calcResult ? (
                    <>
                      <p className="analytics-result-label">Speed media</p>
                      <p className="analytics-result-big">
                        {calcResult.vKmh.toFixed(2)}
                        <span className="analytics-result-unit">km/h</span>
                      </p>
                      <p className="analytics-result-sub">
                        {(calcResult.vMs * 100).toFixed(1)} cm/s · {calcResult.vMs.toFixed(3)} m/s
                      </p>
                      <p className="analytics-result-meta">
                        {calcResult.d} m en {calcResult.t} s
                      </p>
                    </>
                  ) : (
                    <p className="analytics-result-empty">
                      Enter distance and time greater than zero.
                    </p>
                  )}
                </div>
              </div>

              {calcResult && (
                <div className="analytics-chart-wrap analytics-chart-wrap--tight">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[{ name: "Your result", v: calcResult.vKmh }]}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} />
                      <YAxis
                        tick={tickStyle}
                        axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                        label={{
                          value: "km/h",
                          angle: -90,
                          position: "insideLeft",
                          fill: "rgba(244,246,251,0.45)",
                          fontSize: 11,
                        }}
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(2)} km/h`, "Speed"]} />
                      <Bar dataKey="v" name="Speed" fill="url(#analyticsCalcGrad)" radius={[10, 10, 0, 0]} maxBarSize={120} />
                      <defs>
                        <linearGradient id="analyticsCalcGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3d8cff" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {tab === "reaction" && (
            <div className="analytics-panel" role="tabpanel">
              <p className="analytics-panel-intro">
                Distance covered during <strong>reaction time</strong> when the car is already moving at
                constant speed (simple model: no acceleration during those milliseconds).
              </p>
              <div className={gridClass}>
                <div className="analytics-result clean-panel">
                  {reactionResult ? (
                    <>
                      <p className="analytics-result-label">Distancia en ese lapso</p>
                      <p className="analytics-result-big">
                        {(reactionResult.dM * 100).toFixed(2)}
                        <span className="analytics-result-unit">cm</span>
                      </p>
                      <p className="analytics-result-sub">
                        {reactionResult.dM.toFixed(4)} m · {reactionResult.dM * 1000} mm
                      </p>
                      <p className="analytics-result-meta">
                        {reactionResult.tMs} ms a {reactionResult.vKmh.toFixed(1)} km/h
                      </p>
                    </>
                  ) : (
                    <p className="analytics-result-empty">Enter a reaction time greater than zero.</p>
                  )}
                </div>
              </div>
              {reactionResult && (
                <div className="analytics-chart-wrap analytics-chart-wrap--tight">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[{ name: "Distancia (m)", v: reactionResult.dM }]}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} />
                      <YAxis tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(4)} m`, "Distancia"]} />
                      <Bar dataKey="v" fill="url(#analyticsReactGrad)" radius={[10, 10, 0, 0]} maxBarSize={120} />
                      <defs>
                        <linearGradient id="analyticsReactGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {tab === "mass" && (
            <div className="analytics-panel" role="tabpanel">
              <p className="analytics-panel-intro">
                <strong>Vehicle mass</strong> in grams (scale reading). “Target / limit” is a value you
                provide (for example a design target or a rules limit).
              </p>
              <div className={gridClass}>
                <div className="analytics-result clean-panel">
                  {massResult ? (
                    <>
                      <p className="analytics-result-label">Conversiones</p>
                      <p className="analytics-result-sub">
                        <strong>{massResult.g.toFixed(1)} g</strong> = {massResult.kg.toFixed(4)} kg ={" "}
                        {massResult.lb.toFixed(3)} lb
                      </p>
                      {massResult.target && (
                        <p className="analytics-result-meta">
                          Diferencia vs meta:{" "}
                          <strong>
                            {(massResult.g - massResult.target).toFixed(1)} g
                          </strong>{" "}
                          {massResult.g <= massResult.target ? "(por debajo o igual)" : "(por encima)"}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="analytics-result-empty">Enter a mass greater than zero.</p>
                  )}
                </div>
              </div>
              {massResult && massBarData.length > 0 && (
                <div className="analytics-chart-wrap analytics-chart-wrap--tight">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={massBarData} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} />
                      <YAxis
                        tick={tickStyle}
                        axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                        label={{
                          value: "g",
                          angle: -90,
                          position: "insideLeft",
                          fill: "rgba(244,246,251,0.45)",
                          fontSize: 11,
                        }}
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)} g`, "Masa"]} />
                      <Bar dataKey="valor" radius={[8, 8, 0, 0]} maxBarSize={72}>
                        {massBarData.map((_, index) => (
                          <Cell key={`mass-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {tab === "co2" && (
            <div className="analytics-panel" role="tabpanel">
              <p className="analytics-panel-intro">
                Volume comparison between <strong>8 fl oz</strong> and <strong>12 fl oz</strong> tanks
                (US fluid ounces). Milliliter equivalents are shown; real performance depends on your
                system, valve, and competition rules.
              </p>
              <div className="analytics-co2-cards">
                <div className="analytics-co2-card clean-panel">
                  <p className="analytics-co2-oz">8 fl oz</p>
                  <p className="analytics-co2-ml">{co2Specs.ml8.toFixed(1)} ml</p>
                </div>
                <div className="analytics-co2-card clean-panel">
                  <p className="analytics-co2-oz">12 fl oz</p>
                  <p className="analytics-co2-ml">{co2Specs.ml12.toFixed(1)} ml</p>
                </div>
                <div className="analytics-co2-card clean-panel analytics-co2-card--wide">
                  <p className="analytics-co2-oz">12 / 8 ratio</p>
                  <p className="analytics-co2-ml">× {co2Specs.ratio.toFixed(3)} (50% more volume than 8 oz)</p>
                </div>
              </div>
              <div className="analytics-chart-wrap analytics-chart-wrap--tight">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={co2Specs.barData} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} />
                    <YAxis
                      tick={tickStyle}
                      axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                      label={{
                        value: "ml",
                        angle: -90,
                        position: "insideLeft",
                        fill: "rgba(244,246,251,0.45)",
                        fontSize: 11,
                      }}
                    />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)} ml`, "Volumen"]} />
                    <Bar dataKey="ml" radius={[8, 8, 0, 0]} maxBarSize={80}>
                      <Cell fill={CHART_COLORS[0]} />
                      <Cell fill={CHART_COLORS[1]} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === "accel" && (
            <div className="analytics-panel" role="tabpanel">
              <p className="analytics-panel-intro">
                Average acceleration when going from initial speed to final speed over a given time:{" "}
                <code className="inline-code">a = (v₁ − v₀) / t</code>. Speedes en <strong>m/s</strong>.
              </p>
              <div className={gridClass}>
                <div className="analytics-result clean-panel">
                  {accelResult ? (
                    <>
                      <p className="analytics-result-label">Acceleration media</p>
                      <p className="analytics-result-big">
                        {accelResult.a.toFixed(3)}
                        <span className="analytics-result-unit">m/s²</span>
                      </p>
                      <p className="analytics-result-sub">
                        Δv = {(accelResult.v1 - accelResult.v0).toFixed(3)} m/s en {accelResult.t} s
                      </p>
                    </>
                  ) : (
                    <p className="analytics-result-empty">Time must be greater than zero.</p>
                  )}
                </div>
              </div>
              {accelResult && (
                <div className="analytics-chart-wrap analytics-chart-wrap--tight">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "v₀", v: accelResult.v0 },
                        { name: "v₁", v: accelResult.v1 },
                        { name: "a (×10)", v: accelResult.a * 10 },
                      ]}
                      margin={{ top: 12, right: 12, left: 4, bottom: 8 }}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} />
                      <YAxis tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name, props) => {
                          const n = props.payload.name;
                          if (n === "a (×10)") return [`${(Number(value) / 10).toFixed(3)} m/s²`, "a"];
                          return [`${Number(value).toFixed(2)} m/s`, "v"];
                        }}
                      />
                      <Bar dataKey="v" radius={[8, 8, 0, 0]} maxBarSize={64}>
                        <Cell fill={CHART_COLORS[2]} />
                        <Cell fill={CHART_COLORS[0]} />
                        <Cell fill={CHART_COLORS[4]} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="analytics-footnote">
                The <strong>a (×10)</strong> bar is scaled by ×10 only for readability next to speed values;
                the tooltip shows real acceleration.
              </p>
            </div>
          )}

          {tab === "bars" && (
            <div className="analytics-panel" role="tabpanel">
              <p className="analytics-panel-intro">
                Compare up to four speed values (e.g., km/h or any unit that is consistent across entries).
              </p>
              <p className="analytics-public-lock">
                {published?.ai?.barChart?.length ? (
                  <>Series based on the latest published analysis. Edit in </>
                ) : (
                  <>Fixed example. Edit series in </>
                )}
                <Link to="/equipo/laboratorio">
                  laboratory
                </Link>
                .
              </p>
              <div className="analytics-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} interval={0} />
                    <YAxis tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v).toFixed(2), "Valor"]} />
                    <Bar dataKey="velocidad" name="Value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                      {barData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === "pie" && (
            <div className="analytics-panel" role="tabpanel">
              <p className="analytics-panel-intro">
                Distribution chart for “track sections” or percentages: values are normalized to total.
              </p>
              <p className="analytics-public-lock">
                {published?.ai?.pieChart?.length ? (
                  <>Distribution based on the latest published analysis. Update values in </>
                ) : (
                  <>Fixed example. Update sectors in </>
                )}
                <Link to="/equipo/laboratorio">
                  laboratory
                </Link>
                .
              </p>
              {pieTotal > 0 ? (
                <div className="analytics-chart-wrap analytics-chart-wrap--pie">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={112}
                        paddingAngle={3}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "rgba(255,255,255,0.25)" }}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`slice-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ color: "rgba(244,246,251,0.7)", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="analytics-result-empty analytics-result-empty--inline">
                  Add values greater than zero to render the pie chart.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
