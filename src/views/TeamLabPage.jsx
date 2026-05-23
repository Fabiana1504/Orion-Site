"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AiChartPanels from "../components/AiChartPanels";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { computeKinematicsSummary } from "../lib/physics";
import { isSupabaseConfigured } from "../lib/supabaseEnv";
import { runAiAnalysis } from "../lib/telemetryAiAnalysis";
import {
  buildNormalizedRunPayload,
  createRunComplete,
  fetchRunDashboard,
  markRunPublished,
  saveTelemetryRun,
} from "../lib/telemetryRemote";
import { loadDraft, saveDraft, savePublished } from "../lib/telemetryStore";

function parseSensorLine(line) {
  const t = line.trim();
  const m1 = t.match(/^S1[:;]\s*([\d.,]+)/i);
  const m2 = t.match(/^S2[:;]\s*([\d.,]+)/i);
  if (m1) return { which: 1, sec: parseFloat(m1[1].replace(",", ".")) };
  if (m2) return { which: 2, sec: parseFloat(m2[1].replace(",", ".")) };
  return null;
}

export default function TeamLabPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [oilType, setOilType] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carWeightG, setCarWeightG] = useState("");
  const [observations, setObservations] = useState("");
  const [trackLengthM, setTrackLengthM] = useState("20");
  const [finalSpeedKmh, setFinalSpeedKmh] = useState("");
  const [reachSpeedTimeSec, setReachSpeedTimeSec] = useState("");
  const [manualTrackSec, setManualTrackSec] = useState("");
  const [lapInput, setLapInput] = useState("");
  const [reactInput, setReactInput] = useState("");
  const [lapTimesSec, setLapTimesSec] = useState([]);
  const [reactionTimesMs, setReactionTimesMs] = useState([]);
  const [sensorDurationsSec, setSensorDurationsSec] = useState([null, null]);
  const [arduinoLog, setArduinoLog] = useState("");
  const [serialLog, setSerialLog] = useState("");
  const [aiPreview, setAiPreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [remoteSaveMsg, setRemoteSaveMsg] = useState(null);
  const [currentRunId, setCurrentRunId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dashboardRow, setDashboardRow] = useState(null);
  const [serialSupported] = useState(() => typeof navigator !== "undefined" && "serial" in navigator);
  const [serialConnected, setSerialConnected] = useState(false);
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const abortReadRef = useRef(false);

  useEffect(() => {
    const d = loadDraft();
    if (d?.oilType != null) setOilType(d.oilType);
    if (d?.carModel != null) setCarModel(d.carModel);
    if (d?.carWeightG != null && d.carWeightG !== "") setCarWeightG(String(d.carWeightG));
    if (d?.observations != null) setObservations(d.observations);
    if (d?.trackLengthM != null && d.trackLengthM !== "") setTrackLengthM(String(d.trackLengthM));
    if (d?.finalSpeedKmh != null && d.finalSpeedKmh !== "") setFinalSpeedKmh(String(d.finalSpeedKmh));
    if (d?.reachSpeedTimeSec != null && d.reachSpeedTimeSec !== "") setReachSpeedTimeSec(String(d.reachSpeedTimeSec));
    if (Array.isArray(d?.lapTimesSec)) setLapTimesSec(d.lapTimesSec);
    if (Array.isArray(d?.reactionTimesMs)) setReactionTimesMs(d.reactionTimesMs);
    if (d?.manualTrackSec != null && d.manualTrackSec !== "") setManualTrackSec(String(d.manualTrackSec));
    if (Array.isArray(d?.sensorDurationsSec) && d.sensorDurationsSec.length >= 2) {
      setSensorDurationsSec([d.sensorDurationsSec[0], d.sensorDurationsSec[1]]);
    }
  }, []);

  const manualTrackParsed = useMemo(() => {
    const s = String(manualTrackSec).trim().replace(",", ".");
    if (s === "") return null;
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [manualTrackSec]);

  const trackLengthParsed = useMemo(() => {
    const s = String(trackLengthM).trim().replace(",", ".");
    if (s === "") return null;
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [trackLengthM]);

  const finalSpeedParsed = useMemo(() => {
    const s = String(finalSpeedKmh).trim().replace(",", ".");
    if (s === "") return null;
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [finalSpeedKmh]);

  const reachTimeParsed = useMemo(() => {
    const s = String(reachSpeedTimeSec).trim().replace(",", ".");
    if (s === "") return null;
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [reachSpeedTimeSec]);

  const carWeightParsed = useMemo(() => {
    const s = String(carWeightG).trim().replace(",", ".");
    if (s === "") return null;
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [carWeightG]);

  const kinematics = useMemo(
    () =>
      computeKinematicsSummary({
        trackLengthM: trackLengthParsed,
        manualTrackSec: manualTrackParsed,
        lapTimesSec,
        finalSpeedKmh: finalSpeedParsed,
        reachSpeedTimeSec: reachTimeParsed,
      }),
    [trackLengthParsed, manualTrackParsed, lapTimesSec, finalSpeedParsed, reachTimeParsed],
  );

  const sensorPair = useMemo(() => {
    const a = sensorDurationsSec[0];
    const b = sensorDurationsSec[1];
    const na = a != null && Number.isFinite(Number(a)) ? Number(a) : null;
    const nb = b != null && Number.isFinite(Number(b)) ? Number(b) : null;
    if (na != null && nb != null) return [na, nb];
    if (na != null) return [na];
    if (nb != null) return [nb];
    return [];
  }, [sensorDurationsSec]);

  const telemetry = useMemo(
    () => ({
      oilType,
      carModel: carModel.trim(),
      carWeightG: carWeightParsed,
      observations: observations.trim(),
      trackLengthM: trackLengthParsed,
      manualTrackSec: manualTrackParsed,
      totalTimeSec: kinematics.totalTimeSec,
      velocityMs: kinematics.velocityMs,
      velocityKmh: kinematics.velocityKmh,
      accelerationMs2: kinematics.accelerationMs2,
      sensorDurationsSec: sensorPair,
      lapTimesSec,
      reactionTimesMs,
    }),
    [
      oilType,
      carModel,
      carWeightParsed,
      observations,
      trackLengthParsed,
      manualTrackParsed,
      kinematics,
      sensorPair,
      lapTimesSec,
      reactionTimesMs,
    ],
  );

  const persistDraft = useCallback(() => {
    saveDraft({
      oilType,
      carModel,
      carWeightG: carWeightParsed,
      observations,
      trackLengthM: trackLengthParsed,
      finalSpeedKmh: finalSpeedParsed,
      reachSpeedTimeSec: reachTimeParsed,
      manualTrackSec: manualTrackParsed,
      sensorDurationsSec: sensorPair,
      lapTimesSec,
      reactionTimesMs,
      updatedAt: new Date().toISOString(),
    });
  }, [
    oilType,
    carModel,
    carWeightParsed,
    observations,
    trackLengthParsed,
    finalSpeedParsed,
    reachTimeParsed,
    manualTrackParsed,
    sensorPair,
    lapTimesSec,
    reactionTimesMs,
  ]);

  useEffect(() => {
    persistDraft();
  }, [persistDraft]);

  const appendSerialLine = useCallback((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    setSerialLog((prev) => {
      const next = prev ? `${prev}\n${trimmed}` : trimmed;
      const lines = next.split("\n");
      return lines.slice(-40).join("\n");
    });
    const parsed = parseSensorLine(trimmed);
    if (parsed && Number.isFinite(parsed.sec) && parsed.sec > 0) {
      setSensorDurationsSec((prev) => {
        const next = [...prev];
        if (parsed.which === 1) next[0] = parsed.sec;
        else next[1] = parsed.sec;
        return next;
      });
    }
  }, []);

  const disconnectSerial = useCallback(async () => {
    abortReadRef.current = true;
    try {
      await readerRef.current?.cancel();
    } catch {
      /* ignore */
    }
    readerRef.current = null;
    try {
      await portRef.current?.close();
    } catch {
      /* ignore */
    }
    portRef.current = null;
    setSerialConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnectSerial();
    };
  }, [disconnectSerial]);

  const logout = async () => {
    await signOut();
    router.push("/");
  };

  const connectArduino = async () => {
    if (!serialSupported) {
      window.alert("Web Serial is not available. Use Chrome or Edge on desktop.");
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      abortReadRef.current = false;
      setSerialConnected(true);
      setSerialLog((s) => (s ? `${s}\n— Conectado —` : "— Conectado —"));

      const reader = port.readable.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = "";

      const pump = async () => {
        try {
          while (!abortReadRef.current) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split(/\r?\n/);
            buffer = parts.pop() || "";
            for (const part of parts) appendSerialLine(part);
          }
        } catch (e) {
          if (!abortReadRef.current) console.warn(e);
        } finally {
          try {
            reader.releaseLock();
          } catch {
            /* ignore */
          }
        }
      };
      pump();
    } catch (e) {
      if (e?.name !== "NotFoundError") {
        console.warn(e);
        window.alert("Could not connect to Arduino. Check cable and port.");
      }
    }
  };

  const addLap = () => {
    const n = parseFloat(String(lapInput).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    setLapTimesSec((x) => [...x, n]);
    setLapInput("");
  };

  const addReaction = () => {
    const n = parseFloat(String(reactInput).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    setReactionTimesMs((x) => [...x, n]);
    setReactInput("");
  };

  const runAi = async () => {
    setAiLoading(true);
    setAnalyzeError(null);
    try {
      const ai = await runAiAnalysis(telemetry, { runId: currentRunId });
      setAiPreview(ai);
      if (ai?._analyzeError) setAnalyzeError(ai._analyzeError);
    } finally {
      setAiLoading(false);
    }
  };

  const saveRunToSupabase = async () => {
    if (!isSupabaseConfigured()) {
      setRemoteSaveMsg("Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to save normalized runs.");
      return;
    }
    setSaveLoading(true);
    setRemoteSaveMsg(null);
    try {
      const payload = buildNormalizedRunPayload({
        source: "web",
        oil_type: telemetry.oilType || null,
        car_model: telemetry.carModel || null,
        observations: telemetry.observations || null,
        car_weight_g: telemetry.carWeightG ?? null,
        track_length_m: telemetry.trackLengthM ?? 20,
        final_speed_kmh: finalSpeedParsed,
        accel_sample_time_sec: reachTimeParsed,
        total_time_sec: kinematics.totalTimeSec ?? null,
        sensor_s1_sec: sensorPair[0] ?? null,
        sensor_s2_sec: sensorPair[1] ?? null,
        lap_times_sec: lapTimesSec,
        reaction_times_ms: reactionTimesMs,
        telemetry_payload: { ...telemetry, kinematicsSnapshot: kinematics },
      });
      const res = await createRunComplete(payload);
      if (!res.ok) {
        setRemoteSaveMsg(res.error ? `Run was not saved: ${res.error}` : "Run was not saved.");
        return;
      }
      setCurrentRunId(res.runId);
      const dash = await fetchRunDashboard(res.runId);
      setDashboardRow(dash.ok ? dash.row : null);
      setRemoteSaveMsg("Run saved (runs + sensors). Metrics computed in database.");
    } finally {
      setSaveLoading(false);
    }
  };

  const hasAnyData =
    lapTimesSec.length > 0 ||
    reactionTimesMs.length > 0 ||
    manualTrackParsed != null ||
    sensorPair.length > 0 ||
    (oilType && oilType.trim().length > 0) ||
    (carModel && carModel.trim().length > 0) ||
    trackLengthParsed != null;

  const publish = async () => {
    if (!aiPreview) return;
    const ai = { ...aiPreview };
    delete ai._fallback;
    delete ai._analyzeError;
    delete ai._serverInsight;
    const payload = {
      telemetry: { ...telemetry },
      ai,
      publishedAt: new Date().toISOString(),
      runId: currentRunId,
    };
    savePublished(payload);
    const notes = [];
    if (currentRunId && isSupabaseConfigured()) {
      const pub = await markRunPublished(currentRunId, true);
      if (!pub.ok && !pub.skipped) {
        notes.push(`Could not set is_published: ${pub.error || "error"}`);
      }
    }
    const remote = await saveTelemetryRun({
      source: "web",
      oil_type: telemetry.oilType || null,
      car_model: telemetry.carModel || null,
      track_length_m: telemetry.trackLengthM ?? null,
      manual_track_sec: telemetry.manualTrackSec ?? null,
      total_time_sec: telemetry.totalTimeSec ?? null,
      sensor_s1_sec: sensorPair[0] ?? null,
      sensor_s2_sec: sensorPair[1] ?? null,
      lap_times_sec: lapTimesSec,
      reaction_times_ms: reactionTimesMs,
      velocity_ms: telemetry.velocityMs ?? null,
      acceleration_ms2: telemetry.accelerationMs2 ?? null,
      ai_payload: ai,
      telemetry_payload: telemetry,
    });
    if (remote.skipped && !isSupabaseConfigured()) {
      notes.push("Saved locally only. Configure Supabase in .env.local for cloud sync.");
    } else if (remote.ok && !remote.skipped) {
      notes.push("Copia en telemetry_runs (legacy) OK.");
    } else if (!remote.ok) {
      notes.push(`telemetry_runs: ${remote.error || "error"}`);
    }
    setRemoteSaveMsg(notes.length ? notes.join(" · ") : "Done.");
  };

  const simulateArduino = () => {
    setSensorDurationsSec([0.452, 0.448]);
    setLapTimesSec([1.12, 1.08, 1.15, 1.09, 1.11]);
    setReactionTimesMs([175, 182, 168, 190]);
    setOilType((o) => o || "5W-30 synthetic");
    setTrackLengthM((t) => (t && String(t).trim() !== "" ? t : "20"));
    setManualTrackSec((m) => m || "1.105");
    setArduinoLog("Simulation: sensors + laps + reactions (demo).");
  };

  const parseArduinoPaste = () => {
    const lines = arduinoLog.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const laps = [];
    const reacts = [];
    let s1 = sensorDurationsSec[0];
    let s2 = sensorDurationsSec[1];
    let newManual = null;
    let newModel = null;
    for (const line of lines) {
      const m = line.match(/^LAP[:;]\s*([\d.,]+)/i);
      const r = line.match(/^REACT(?:ION)?[:;]\s*([\d.,]+)/i);
      const tot = line.match(/^TOT(?:AL)?[:;]\s*([\d.,]+)/i);
      const mo = line.match(/^(?:MODEL|CAR|MODELO)[:;]\s*(.+)$/i);
      const p = parseSensorLine(line);
      if (m) laps.push(parseFloat(m[1].replace(",", ".")));
      if (r) reacts.push(parseFloat(r[1].replace(",", ".")));
      if (tot) newManual = String(tot[1]).replace(",", ".");
      if (mo) newModel = mo[1].trim();
      if (p?.which === 1) s1 = p.sec;
      if (p?.which === 2) s2 = p.sec;
    }
    if (newManual != null) setManualTrackSec(newManual);
    if (newModel) setCarModel(newModel);
    if (laps.length) setLapTimesSec((x) => [...x, ...laps]);
    if (reacts.length) setReactionTimesMs((x) => [...x, ...reacts]);
    if (s1 != null || s2 != null) {
      setSensorDurationsSec((prev) => [s1 != null ? s1 : prev[0], s2 != null ? s2 : prev[1]]);
    }
  };

  return (
    <div id="top">
      <Header />
      <main className="team-lab-main">
        <div className="container team-lab-container">
          <motion.div
            className="team-lab-hero"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="eyebrow eyebrow--pulse">Laboratory</p>
            <h1 className="team-lab-page-title">Data laboratory</h1>
            <p className="team-lab-lead">
              Connect Arduino by USB (Web Serial), enter <strong>oil</strong>, <strong>weight</strong>,{" "}
              <strong>observations</strong>, <strong>manual track time</strong>, <strong>reactions</strong>, and
              optional laps. Firmware should send lines <code className="inline-code">S1:0.452</code> and{" "}
              <code className="inline-code">S2:0.448</code> (seconds between beams). With{" "}
              <code className="inline-code">VITE_SUPABASE_URL</code> and{" "}
              <code className="inline-code">VITE_SUPABASE_ANON_KEY</code> you can save runs into normalized tables
              and execute the Edge Function <code className="inline-code">analyze-run</code> (OpenAI server-side).
              Without Supabase, analysis runs locally. UNO R4 WiFi can use{" "}
              <code className="inline-code">/rest/v1/rpc/create_run_complete</code> or{" "}
              <code className="inline-code">ingest-device</code>.
            </p>
            <div className="team-lab-toolbar">
              <Link href="/#datos" className="btn btn-ghost team-lab-btn-pub">
                View public results
              </Link>
              <Link href="/equipo/calculos-visitantes" className="btn btn-ghost team-lab-btn-pub">
                Team data (calculators)
              </Link>
              <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
                Sign out
              </button>
            </div>
          </motion.div>

          <div className="team-lab-grid">
            <section className="team-lab-card clean-panel team-lab-card--telemetry">
              <div className="team-lab-card-head">
                <h2>Telemetry</h2>
                <p className="team-lab-card-desc">Oil, manual track time, laps, and reactions</p>
              </div>
              <label className="team-lab-field">
                <span>Oil type</span>
                <input
                  type="text"
                  value={oilType}
                  onChange={(e) => setOilType(e.target.value)}
                  placeholder="e.g. 5W-30 synthetic"
                />
              </label>
              <label className="team-lab-field">
                <span>Modelo de carro</span>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="ej. prototipo 2025 / reglamento CO2"
                />
              </label>
              <label className="team-lab-field">
                <span>Peso del carro (g)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={carWeightG}
                  onChange={(e) => setCarWeightG(e.target.value)}
                  placeholder="ej. 95 (balanza)"
                />
              </label>
              <label className="team-lab-field">
                <span>Observaciones</span>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Team notes, weather, tires, etc."
                />
              </label>
              <label className="team-lab-field">
                <span>Track length L (m)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={trackLengthM}
                  onChange={(e) => setTrackLengthM(e.target.value)}
                  placeholder="20 — typical CO2 track"
                />
              </label>
              <label className="team-lab-field">
                <span>Track time (manual, s)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={manualTrackSec}
                  onChange={(e) => setManualTrackSec(e.target.value)}
                  placeholder="ej. 1.105 — opcional"
                />
              </label>
              <div className="team-lab-row">
                <label className="team-lab-field team-lab-field--grow">
                  <span>Tiempo de vuelta extra (s)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={lapInput}
                    onChange={(e) => setLapInput(e.target.value)}
                    placeholder="1.12"
                  />
                </label>
                <button type="button" className="btn btn-primary team-lab-add" onClick={addLap}>
                  Add lap
                </button>
              </div>
              <div className="team-lab-row">
                <label className="team-lab-field team-lab-field--grow">
                  <span>Reaction time (ms)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={reactInput}
                    onChange={(e) => setReactInput(e.target.value)}
                    placeholder="180"
                  />
                </label>
                <button type="button" className="btn btn-primary team-lab-add" onClick={addReaction}>
                  Add reaction
                </button>
              </div>
              <div className="team-lab-row">
                <label className="team-lab-field team-lab-field--grow">
                  <span>Final speed (km/h, optional)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={finalSpeedKmh}
                    onChange={(e) => setFinalSpeedKmh(e.target.value)}
                    placeholder="for acceleration from rest"
                  />
                </label>
                <label className="team-lab-field team-lab-field--grow">
                  <span>Time to reach that v (s)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={reachSpeedTimeSec}
                    onChange={(e) => setReachSpeedTimeSec(e.target.value)}
                    placeholder="t used in a ≈ v/t"
                  />
                </label>
              </div>
              {(kinematics.velocityKmh != null || kinematics.accelerationMs2 != null) && (
                <p className="team-lab-hint team-lab-kinematics">
                  {kinematics.velocityKmh != null ? (
                    <>
                      <strong>v̄</strong> ≈ {kinematics.velocityKmh.toFixed(2)} km/h (
                      {kinematics.velocityMs?.toFixed(3)} m/s)
                    </>
                  ) : null}
                  {kinematics.accelerationMs2 != null ? (
                    <>
                      {kinematics.velocityKmh != null ? " · " : null}
                      <strong>a</strong> ≈ {kinematics.accelerationMs2.toFixed(3)} m/s²
                    </>
                  ) : null}
                </p>
              )}
              <div className="team-lab-chip-group">
                <span className="team-lab-chip-label">Laps</span>
                <ul className="team-lab-chips team-lab-chips--laps">
                  {lapTimesSec.length ? (
                    lapTimesSec.map((v, i) => (
                      <li key={`lap-${i}`}>
                        L{i + 1}: {v.toFixed(3)}s
                      </li>
                    ))
                  ) : (
                    <li className="team-lab-chips-empty">None yet</li>
                  )}
                </ul>
              </div>
              <div className="team-lab-chip-group">
                <span className="team-lab-chip-label">Reactions</span>
                <ul className="team-lab-chips team-lab-chips--rx">
                  {reactionTimesMs.length ? (
                    reactionTimesMs.map((v, i) => (
                      <li key={`r-${i}`}>
                        R{i + 1}: {v.toFixed(0)} ms
                      </li>
                    ))
                  ) : (
                    <li className="team-lab-chips-empty">None yet</li>
                  )}
                </ul>
              </div>
            </section>

            <section className="team-lab-card clean-panel team-lab-card--arduino">
              <div className="team-lab-card-head">
                <h2>Arduino (Web Serial)</h2>
                <p className="team-lab-card-desc">Sensores en serie · 115200 baud</p>
              </div>
              <p className="team-lab-hint">
                Two sensors measure the time it takes the car to travel between beams. Arduino sends one line
                per reading over serial: <code className="inline-code">S1:0.452</code> and{" "}
                <code className="inline-code">S2:0.448</code> (seconds). Baud rate: 115200.
              </p>
              <div className="team-lab-serial-bar">
                <button
                  type="button"
                  className={`btn btn-primary team-lab-connect-btn ${serialConnected ? "is-connected" : ""}`}
                  onClick={serialConnected ? disconnectSerial : connectArduino}
                >
                  {serialConnected ? "Disconnect Arduino" : "Connect Arduino"}
                </button>
                {serialSupported ? (
                  <span
                    className={`team-lab-serial-pill ${serialConnected ? "team-lab-serial-pill--on" : ""}`}
                    aria-live="polite"
                  >
                    <span className="team-lab-serial-dot" />
                    {serialConnected ? "Connected" : "Disconnected"}
                  </span>
                ) : (
                  <span className="team-lab-hint team-lab-hint--inline">Web Serial is not available in this browser.</span>
                )}
              </div>
              <div className="team-lab-metrics" aria-label="Latest sensor readings">
                <div className="team-lab-metric">
                  <span className="team-lab-metric-label">S1</span>
                  <span className="team-lab-metric-value">
                    {sensorDurationsSec[0] != null ? Number(sensorDurationsSec[0]).toFixed(4) : "—"}{" "}
                    <span className="team-lab-metric-unit">s</span>
                  </span>
                </div>
                <div className="team-lab-metric">
                  <span className="team-lab-metric-label">S2</span>
                  <span className="team-lab-metric-value">
                    {sensorDurationsSec[1] != null ? Number(sensorDurationsSec[1]).toFixed(4) : "—"}{" "}
                    <span className="team-lab-metric-unit">s</span>
                  </span>
                </div>
              </div>
              <label className="team-lab-field">
                <span>Serial log (latest lines)</span>
                <textarea rows={4} readOnly value={serialLog} placeholder="Connect to view data..." />
              </label>
              <button type="button" className="btn btn-ghost team-lab-btn-block" onClick={simulateArduino}>
                Simulate data (without Arduino)
              </button>
              <label className="team-lab-field">
                <span>Pegar log / importar</span>
                <textarea
                  rows={4}
                  value={arduinoLog}
                  onChange={(e) => setArduinoLog(e.target.value)}
                  placeholder={"S1:0.452\nS2:0.448\nTOT:1.105\nLAP:1.12\nREACT:180\nMODELO:Proto-A"}
                />
              </label>
              <button type="button" className="btn btn-ghost team-lab-btn-block" onClick={parseArduinoPaste}>
                Parse S1/S2, LAP, and REACT lines
              </button>
            </section>
          </div>

          <section className="team-lab-card clean-panel team-lab-ai team-lab-card--analysis">
            <div className="team-lab-card-head team-lab-card-head--analysis">
              <h2>Assisted analysis</h2>
              <p className="team-lab-card-desc">Summary, charts, and publishing</p>
            </div>
            <p className="team-lab-hint">
              First <strong>save the run</strong> to Supabase to compute database metrics. Then{" "}
              <strong>run analysis</strong>: with a saved run it calls{" "}
              <code className="inline-code">analyze-run</code> (server-side AI). Without saving, you only get
              local analysis. Publish to homepage when ready.
            </p>
            {currentRunId ? (
              <p className="team-lab-hint team-lab-run-id">
                Cloud run: <code className="inline-code">{currentRunId}</code>
              </p>
            ) : null}
            {dashboardRow && (
              <div className="team-lab-kpi-grid" aria-label="Computed metrics (Postgres)">
                <div className="team-lab-kpi clean-panel">
                  <span className="team-lab-kpi-label">v̄ (km/h)</span>
                  <span className="team-lab-kpi-value">
                    {dashboardRow.average_speed_kmh != null && Number.isFinite(Number(dashboardRow.average_speed_kmh))
                      ? Number(dashboardRow.average_speed_kmh).toFixed(2)
                      : "—"}
                  </span>
                </div>
                <div className="team-lab-kpi clean-panel">
                  <span className="team-lab-kpi-label">v̄ (m/s)</span>
                  <span className="team-lab-kpi-value">
                    {dashboardRow.average_speed_ms != null && Number.isFinite(Number(dashboardRow.average_speed_ms))
                      ? Number(dashboardRow.average_speed_ms).toFixed(3)
                      : "—"}
                  </span>
                </div>
                <div className="team-lab-kpi clean-panel">
                  <span className="team-lab-kpi-label">Best time (s)</span>
                  <span className="team-lab-kpi-value">
                    {dashboardRow.best_time_sec != null && Number.isFinite(Number(dashboardRow.best_time_sec))
                      ? Number(dashboardRow.best_time_sec).toFixed(4)
                      : "—"}
                  </span>
                </div>
                <div className="team-lab-kpi clean-panel">
                  <span className="team-lab-kpi-label">Reaction avg (ms)</span>
                  <span className="team-lab-kpi-value">
                    {dashboardRow.average_reaction_ms != null &&
                    Number.isFinite(Number(dashboardRow.average_reaction_ms))
                      ? Math.round(Number(dashboardRow.average_reaction_ms))
                      : "—"}
                  </span>
                </div>
                <div className="team-lab-kpi clean-panel">
                  <span className="team-lab-kpi-label">a estimada (m/s²)</span>
                  <span className="team-lab-kpi-value">
                    {dashboardRow.estimated_acceleration_ms2 != null &&
                    Number.isFinite(Number(dashboardRow.estimated_acceleration_ms2))
                      ? Number(dashboardRow.estimated_acceleration_ms2).toFixed(3)
                      : "—"}
                  </span>
                </div>
              </div>
            )}
            <div className="team-lab-ai-actions team-lab-ai-actions--split">
              <button
                type="button"
                className="btn btn-ghost team-lab-ai-secondary"
                onClick={() => void saveRunToSupabase()}
                disabled={saveLoading || !hasAnyData}
              >
                {saveLoading ? "Guardando…" : "Save run (Supabase)"}
              </button>
              <button
                type="button"
                className="btn btn-primary team-lab-ai-primary"
                onClick={runAi}
                disabled={aiLoading || !hasAnyData}
              >
                {aiLoading ? "Analyzing..." : currentRunId ? "AI analysis (server)" : "Local analysis"}
              </button>
              <button
                type="button"
                className="btn btn-ghost team-lab-ai-secondary"
                onClick={() => void publish()}
                disabled={!aiPreview}
              >
                Publish on homepage
              </button>
            </div>
            {analyzeError ? (
              <p className="team-lab-hint team-lab-hint--banner" role="alert">
                {analyzeError}
              </p>
            ) : null}
            {remoteSaveMsg ? <p className="team-lab-hint team-lab-remote-msg">{remoteSaveMsg}</p> : null}
            {aiPreview && (
              <div className="team-lab-ai-out">
                {aiPreview._fallback ? (
                  <p className="team-lab-hint team-lab-hint--banner">
                    {currentRunId
                      ? "Server did not return AI output; showing local analysis."
                      : "Local analysis (save the run in Supabase for server AI)."}
                  </p>
                ) : null}
                {aiPreview.confidence != null && Number.isFinite(Number(aiPreview.confidence)) ? (
                  <p className="team-lab-confidence">
                    Model confidence: <strong>{(Number(aiPreview.confidence) * 100).toFixed(0)}%</strong>
                  </p>
                ) : null}
                <div className="team-lab-ai-text-block">
                  <p className="team-lab-ai-narrative">{aiPreview.narrative}</p>
                  {Array.isArray(aiPreview.alerts) && aiPreview.alerts.length > 0 ? (
                    <div className="team-lab-ai-subblock">
                      <p className="team-lab-ai-subtitle">Alertas</p>
                      <ul className="team-lab-ai-bullets team-lab-ai-bullets--alerts">
                        {aiPreview.alerts.map((b, i) => (
                          <li key={`a-${i}`}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {Array.isArray(aiPreview.recommendations) && aiPreview.recommendations.length > 0 ? (
                    <div className="team-lab-ai-subblock">
                      <p className="team-lab-ai-subtitle">Recomendaciones</p>
                      <ul className="team-lab-ai-bullets team-lab-ai-bullets--recs">
                        {aiPreview.recommendations.map((b, i) => (
                          <li key={`r-${i}`}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {aiPreview.bullets?.length ? (
                    <ul className="team-lab-ai-bullets">
                      {aiPreview.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {aiPreview.chartPanels?.length ? (
                  <div className="team-lab-ai-charts-wrap">
                    <p className="team-lab-ai-charts-label">Charts by category</p>
                    <AiChartPanels panels={aiPreview.chartPanels} className="team-lab-ai-charts" />
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
