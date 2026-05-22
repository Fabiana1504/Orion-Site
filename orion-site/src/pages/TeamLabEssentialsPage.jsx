import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { loadDraft, saveDraft } from "../lib/telemetryStore";

function parseSensorLine(line) {
  const t = line.trim();
  const m1 = t.match(/^S1[:;]\s*([\d.,]+)/i);
  const m2 = t.match(/^S2[:;]\s*([\d.,]+)/i);
  if (m1) return { which: 1, sec: parseFloat(m1[1].replace(",", ".")) };
  if (m2) return { which: 2, sec: parseFloat(m2[1].replace(",", ".")) };
  return null;
}

export default function TeamLabEssentialsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [oilType, setOilType] = useState("");
  const [observations, setObservations] = useState("");
  const [reactInput, setReactInput] = useState("");
  const [reactionTimesMs, setReactionTimesMs] = useState([]);
  const [sensorDurationsSec, setSensorDurationsSec] = useState([null, null]);
  const [arduinoLog, setArduinoLog] = useState("");
  const [serialLog, setSerialLog] = useState("");
  const [exportMsg, setExportMsg] = useState(null);

  const [serialSupported] = useState(() => typeof navigator !== "undefined" && "serial" in navigator);
  const [serialConnected, setSerialConnected] = useState(false);
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const abortReadRef = useRef(false);

  useEffect(() => {
    const d = loadDraft();
    if (d?.oilType != null) setOilType(d.oilType);
    if (d?.observations != null) setObservations(d.observations);
    if (Array.isArray(d?.reactionTimesMs)) setReactionTimesMs(d.reactionTimesMs);
    if (Array.isArray(d?.sensorDurationsSec) && d.sensorDurationsSec.length >= 2) {
      setSensorDurationsSec([d.sensorDurationsSec[0], d.sensorDurationsSec[1]]);
    }
  }, []);

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

  useEffect(() => {
    saveDraft({
      oilType,
      observations,
      reactionTimesMs,
      sensorDurationsSec: sensorPair,
      updatedAt: new Date().toISOString(),
    });
  }, [oilType, observations, reactionTimesMs, sensorPair]);

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
      setSerialLog((s) => (s ? `${s}\n— Connected —` : "— Connected —"));

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

  const addReaction = () => {
    const n = parseFloat(String(reactInput).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    setReactionTimesMs((x) => [...x, n]);
    setReactInput("");
  };

  const parseArduinoPaste = () => {
    const lines = arduinoLog.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const reacts = [];
    let s1 = sensorDurationsSec[0];
    let s2 = sensorDurationsSec[1];
    for (const line of lines) {
      const r = line.match(/^REACT(?:ION)?[:;]\s*([\d.,]+)/i);
      const p = parseSensorLine(line);
      if (r) reacts.push(parseFloat(r[1].replace(",", ".")));
      if (p?.which === 1) s1 = p.sec;
      if (p?.which === 2) s2 = p.sec;
    }
    if (reacts.length) setReactionTimesMs((x) => [...x, ...reacts]);
    if (s1 != null || s2 != null) {
      setSensorDurationsSec((prev) => [s1 != null ? s1 : prev[0], s2 != null ? s2 : prev[1]]);
    }
  };

  const hasEssentialData =
    (oilType && oilType.trim().length > 0) ||
    (observations && observations.trim().length > 0) ||
    reactionTimesMs.length > 0 ||
    sensorPair.length > 0;

  const exportForExcel = () => {
    if (!hasEssentialData) {
      setExportMsg("Add at least one essential value before exporting.");
      return;
    }
    const headers = [
      "exported_at",
      "oil_type",
      "observations",
      "reaction_times_ms",
      "sensor_s1_sec",
      "sensor_s2_sec",
    ];
    const row = [
      new Date().toISOString(),
      oilType.trim(),
      observations.trim(),
      reactionTimesMs.join("|"),
      sensorDurationsSec[0] != null ? String(sensorDurationsSec[0]) : "",
      sensorDurationsSec[1] != null ? String(sensorDurationsSec[1]) : "",
    ];
    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
    const csv = `${headers.map(escapeCsv).join(",")}\n${row.map(escapeCsv).join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orion-lab-essentials-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg("Excel-compatible CSV exported.");
  };

  const logout = async () => {
    await signOut();
    navigate("/");
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
            <h1 className="team-lab-page-title">Internal lab</h1>
            <p className="team-lab-lead">
              Simplified panel with only essential inputs: oil, observations, manual reaction time, and Arduino data.
            </p>
            <div className="team-lab-toolbar">
              <Link to="/equipo/calculos-visitantes" className="btn btn-ghost team-lab-btn-pub">
                View team results
              </Link>
              <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
                Sign out
              </button>
            </div>
          </motion.div>

          <div className="team-lab-grid">
            <section className="team-lab-card clean-panel team-lab-card--telemetry">
              <div className="team-lab-card-head">
                <h2>Essential data</h2>
                <p className="team-lab-card-desc">Oil, observations, and manual reaction times</p>
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
                <span>Observations</span>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Team notes, weather, setup..."
                />
              </label>
              <div className="team-lab-row">
                <label className="team-lab-field team-lab-field--grow">
                  <span>Manual reaction time (ms)</span>
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
              <button
                type="button"
                className="btn btn-primary team-lab-btn-block"
                onClick={exportForExcel}
                disabled={!hasEssentialData}
              >
                Export to Excel (.csv)
              </button>
              {exportMsg ? <p className="team-lab-hint team-lab-hint--banner">{exportMsg}</p> : null}
            </section>

            <section className="team-lab-card clean-panel team-lab-card--arduino">
              <div className="team-lab-card-head">
                <h2>Arduino (Web Serial)</h2>
                <p className="team-lab-card-desc">Serial sensors · 115200 baud</p>
              </div>
              <p className="team-lab-hint">
                Arduino can send lines like <code className="inline-code">S1:0.452</code> and{" "}
                <code className="inline-code">S2:0.448</code>.
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
              <label className="team-lab-field">
                <span>Paste log / import</span>
                <textarea
                  rows={4}
                  value={arduinoLog}
                  onChange={(e) => setArduinoLog(e.target.value)}
                  placeholder={"S1:0.452\nS2:0.448\nREACT:180"}
                />
              </label>
              <button type="button" className="btn btn-ghost team-lab-btn-block" onClick={parseArduinoPaste}>
                Parse S1/S2 and REACT lines
              </button>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
