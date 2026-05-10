import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ReactionSemaforo from "../components/ReactionSemaforo";
import { isSupabaseConfigured } from "../lib/supabaseEnv";
import { insertPublicCalcRecord } from "../services/calcRecordsService";
import {
  accelerationFromRestToSpeed,
  kmhFromMs,
  velocityFromDistanceAndTime,
} from "../lib/physics";

const SKETCH_STORAGE_KEY = "orion_public_tools_sketch_v1";

const CATEGORIES = [
  { id: "professional", label: "Professional" },
  { id: "3d", label: "3D" },
  { id: "development", label: "Development" },
  { id: "entry", label: "Entry" },
];

const CALC = {
  V_DT: "velocity_distance_time",
  REACT_SEMAFORO: "reaction_semaphore",
  ACCEL: "acceleration_speed_time",
};

const CALC_LABELS = {
  [CALC.V_DT]: "Speed (distance / time)",
  [CALC.REACT_SEMAFORO]: "Reaction (traffic light)",
  [CALC.ACCEL]: "Acceleration (from rest to speed)",
};

function parseNum(s) {
  const n = parseFloat(String(s ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function loadSketchRows() {
  // Historial local para no perder pruebas aunque falle la red/Supabase.
  try {
    const raw = localStorage.getItem(SKETCH_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSketchRows(rows) {
  try {
    localStorage.setItem(SKETCH_STORAGE_KEY, JSON.stringify(rows.slice(0, 100)));
  } catch {
    /* ignore quota */
  }
}

export default function PublicToolsPage() {
  const [phase, setPhase] = useState("pick");
  const [gateTeam, setGateTeam] = useState("");
  const [gateEmail, setGateEmail] = useState("");
  const [gateCategoryId, setGateCategoryId] = useState("entry");
  const [gateErr, setGateErr] = useState(null);

  const [sessionTeam, setSessionTeam] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [sessionCategory, setSessionCategory] = useState("");

  const [tab, setTab] = useState("vel");
  const [dM, setDM] = useState("20");
  const [tSec, setTSec] = useState("2.5");
  const [vKmh, setVKmh] = useState("80");
  const [tReach, setTReach] = useState("3");

  const [notes, setNotes] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [localRows, setLocalRows] = useState([]);
  const [remoteEnabled] = useState(() => isSupabaseConfigured());

  const resolvedCategoryLabel = useMemo(() => {
    const row = CATEGORIES.find((c) => c.id === gateCategoryId);
    return row?.label ?? "";
  }, [gateCategoryId]);

  const refreshLocalList = useCallback(() => {
    setLocalRows(loadSketchRows());
  }, []);

  useEffect(() => {
    if (phase === "workspace") refreshLocalList();
  }, [phase, refreshLocalList]);

  const visibleRows = useMemo(
    // El historial mostrado se limita al equipo/categoría actualmente seleccionados.
    () =>
      localRows.filter(
        (r) => r.team === sessionTeam && r.category === sessionCategory,
      ),
    [localRows, sessionTeam, sessionCategory],
  );

  const velResult = useMemo(() => {
    const d = parseNum(dM);
    const t = parseNum(tSec);
    if (d == null || t == null || d <= 0 || t <= 0) return null;
    const vMs = velocityFromDistanceAndTime(d, t);
    if (vMs == null) return null;
    return { vMs, vKmh: kmhFromMs(vMs), dM: d, tSec: t };
  }, [dM, tSec]);

  const accelResult = useMemo(() => {
    const vk = parseNum(vKmh);
    const tr = parseNum(tReach);
    if (vk == null || tr == null || tr <= 0 || vk < 0) return null;
    const vMs = vk / 3.6;
    const a = accelerationFromRestToSpeed(vMs, tr);
    if (a == null) return null;
    return { finalSpeedKmh: vk, reachTimeSec: tr, accelerationMs2: a };
  }, [vKmh, tReach]);

  const onPickContinue = (e) => {
    e.preventDefault();
    setGateErr(null);
    const team = gateTeam.trim();
    const cat = resolvedCategoryLabel;
    if (!team) {
      setGateErr("Please enter the team name.");
      return;
    }
    if (!cat) {
      setGateErr("Please choose a category.");
      return;
    }
    setSessionTeam(team);
    setSessionEmail(gateEmail.trim());
    setSessionCategory(cat);
    setPhase("workspace");
    setSaveMsg(null);
  };

  const onBackToPick = () => {
    setPhase("pick");
    setGateTeam(sessionTeam);
    setGateEmail(sessionEmail);
    setGateCategoryId(CATEGORIES.find((c) => c.label === sessionCategory)?.id ?? "entry");
    setSaveMsg(null);
  };

  const formatResultSummary = (calcKind, resultJson) => {
    const r = resultJson;
    if (calcKind === CALC.V_DT && r?.velocityKmh != null) return `${Number(r.velocityKmh).toFixed(2)} km/h`;
    if (calcKind === CALC.REACT_SEMAFORO && r?.reactionMs != null) {
      return `${r.reactionMs} ms`;
    }
    if (calcKind === CALC.ACCEL && r?.accelerationMs2 != null) return `${Number(r.accelerationMs2).toFixed(4)} m/s²`;
    return "—";
  };

  const saveSketch = async (calcKind, inputJson, resultJson) => {
    setSaveMsg(null);
    if (!sessionTeam.trim() || !sessionCategory.trim()) return;
    setSaveBusy(true);
    // Siempre guardamos copia local primero para resiliencia offline.
    const row = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      team: sessionTeam.trim(),
      category: sessionCategory.trim(),
      calcKind,
      calcLabel: CALC_LABELS[calcKind] ?? calcKind,
      resultSummary: formatResultSummary(calcKind, resultJson),
      inputJson,
      resultJson,
      notes: notes.trim() || null,
    };
    const next = [row, ...loadSketchRows()];
    persistSketchRows(next);
    setLocalRows(next);
    if (remoteEnabled) {
      // Segundo paso: sincronización remota en Supabase para visualización en laboratorio.
      const { error } = await insertPublicCalcRecord({
        contactEmail: sessionEmail || null,
        schoolTeamName: sessionTeam,
        category: sessionCategory,
        calcKind,
        inputJson,
        resultJson,
        notes,
      });
      if (error) {
        setSaveMsg(`Local save OK, but Supabase failed: ${error.message || "unknown error"}`);
        setSaveBusy(false);
        return;
      }
      setSaveMsg("Saved to Supabase and in this browser.");
    } else {
      setSaveMsg("Saved locally. For cloud sync, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    }
    setSaveBusy(false);
  };

  return (
    <div id="top">
      <Header />
      <main className="team-lab-main">
        <div className="container team-lab-container public-tools-page">
          <header className="team-lab-hero public-tools-hero">
            <p className="eyebrow eyebrow--pulse">Draft · Team tools</p>
            <h1 className="team-lab-page-title">Calculators for teams</h1>
            <p className="team-lab-lead">
              Draft flow: <strong>pick category (and team)</strong>, then move to the panel where teams enter{" "}
              <strong>speed, reaction, and acceleration</strong>. This can later be connected to Orion with
              database-backed workflows.
            </p>
          </header>

          {phase === "pick" ? (
            // Paso 1: identificar equipo y categoría antes de abrir los cálculos.
            <section className="clean-panel team-lab-card public-tools-auth">
              <h2 className="team-lab-card-head" style={{ marginBottom: 4 }}>
                Step 1 — Team and category
              </h2>
              <p className="team-lab-card-desc" style={{ marginBottom: 18 }}>
                Then you move to step 2 to enter measured data.
              </p>
              <form className="login-modal-form lab-login-form" onSubmit={onPickContinue}>
                <label className="login-modal-field">
                  <span>Team name</span>
                  <input
                    type="text"
                    required
                    value={gateTeam}
                    onChange={(e) => setGateTeam(e.target.value)}
                    placeholder="e.g. San Martin School — Team A"
                    autoComplete="organization"
                  />
                </label>
                <label className="login-modal-field">
                  <span>Contact email (optional)</span>
                  <input
                    type="email"
                    value={gateEmail}
                    onChange={(e) => setGateEmail(e.target.value)}
                    placeholder="team@school.edu"
                    autoComplete="email"
                  />
                </label>
                <div className="login-modal-field">
                  <span>Category</span>
                  <div className="public-tools-category-grid" role="radiogroup" aria-label="Team category">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={gateCategoryId === c.id}
                        className={`public-tools-category-btn ${gateCategoryId === c.id ? "is-active" : ""}`}
                        onClick={() => setGateCategoryId(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                {gateErr ? (
                  <p className="lab-login-error" role="alert">
                    {gateErr}
                  </p>
                ) : null}
                <button type="submit" className="btn btn-primary">
                  Go to data panel
                </button>
              </form>
            </section>
          ) : (
            <>
              {/* Paso 2: workspace de mediciones para ese equipo/categoría */}
              <section className="clean-panel public-tools-session">
                <div className="public-tools-session-row">
                  <div>
                    <p className="eyebrow" style={{ margin: "0 0 6px", letterSpacing: "0.12em" }}>
                      Step 2 — Measurement panel
                    </p>
                    <p className="team-lab-hint" style={{ margin: 0 }}>
                      Team: <strong>{sessionTeam}</strong> · Category: <strong>{sessionCategory}</strong>
                    </p>
                    {sessionEmail ? (
                      <p className="team-lab-hint" style={{ margin: "4px 0 0" }}>
                        Contact: <strong>{sessionEmail}</strong>
                      </p>
                    ) : null}
                  </div>
                  <button type="button" className="btn btn-ghost" onClick={onBackToPick}>
                    Change team / category
                  </button>
                </div>
                <label className="team-lab-field">
                  <span>Optional notes (copied on save)</span>
                  <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Track, weather, sensor..." />
                </label>
                {saveMsg ? <p className="team-lab-hint">{saveMsg}</p> : null}
              </section>

              <div className="public-tools-calc-tabs">
                {[
                  { id: "vel", label: "Speed" },
                  { id: "semaforo", label: "Traffic light" },
                  { id: "accel", label: "Acceleration" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`public-tools-calc-tab ${tab === id ? "is-active" : ""}`}
                    onClick={() => setTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "vel" ? (
                <section className="team-lab-card clean-panel public-tools-card">
                  <div className="team-lab-card-head">
                    <h2>Average speed</h2>
                    <p className="team-lab-card-desc">v = distance / time (straight-line approximation)</p>
                  </div>
                  <div className="team-lab-row team-lab-row--wrap">
                    <label className="team-lab-field">
                      <span>Distance (m)</span>
                      <input inputMode="decimal" value={dM} onChange={(e) => setDM(e.target.value)} />
                    </label>
                    <label className="team-lab-field">
                      <span>Time (s)</span>
                      <input inputMode="decimal" value={tSec} onChange={(e) => setTSec(e.target.value)} />
                    </label>
                  </div>
                  {velResult ? (
                    <div className="team-lab-kpi-grid">
                      <div className="team-lab-kpi">
                        <p className="team-lab-kpi-label">Speed</p>
                        <p className="team-lab-kpi-value">
                          {velResult.vMs.toFixed(3)} <span className="team-lab-metric-unit">m/s</span>
                        </p>
                      </div>
                      <div className="team-lab-kpi">
                        <p className="team-lab-kpi-label">Equiv.</p>
                        <p className="team-lab-kpi-value">
                          {velResult.vKmh.toFixed(2)} <span className="team-lab-metric-unit">km/h</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="team-lab-hint">Enter valid distance and time (&gt; 0).</p>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary team-lab-btn-block"
                    disabled={saveBusy || !velResult}
                    onClick={() =>
                      void saveSketch(
                        CALC.V_DT,
                        { distanceM: velResult.dM, timeSec: velResult.tSec },
                        { velocityMs: velResult.vMs, velocityKmh: velResult.vKmh },
                      )
                    }
                  >
                    {saveBusy ? "Saving..." : "Save data"}
                  </button>
                </section>
              ) : null}

              {tab === "semaforo" ? (
                <ReactionSemaforo
                  saveBusy={saveBusy}
                  onSave={({ inputJson, resultJson }) => {
                    void saveSketch(CALC.REACT_SEMAFORO, inputJson, resultJson);
                  }}
                />
              ) : null}

              {tab === "accel" ? (
                <section className="team-lab-card clean-panel public-tools-card">
                  <div className="team-lab-card-head">
                    <h2>Acceleration (desde reposo)</h2>
                    <p className="team-lab-card-desc">a ≈ v / t con v final en km/h y t en segundos.</p>
                  </div>
                  <div className="team-lab-row team-lab-row--wrap">
                    <label className="team-lab-field">
                      <span>Speed final (km/h)</span>
                      <input inputMode="decimal" value={vKmh} onChange={(e) => setVKmh(e.target.value)} />
                    </label>
                    <label className="team-lab-field">
                      <span>Time to reach that speed (s)</span>
                      <input inputMode="decimal" value={tReach} onChange={(e) => setTReach(e.target.value)} />
                    </label>
                  </div>
                  {accelResult ? (
                    <div className="team-lab-kpi-grid">
                      <div className="team-lab-kpi">
                        <p className="team-lab-kpi-label">Acceleration</p>
                        <p className="team-lab-kpi-value">
                          {accelResult.accelerationMs2.toFixed(4)}{" "}
                          <span className="team-lab-metric-unit">m/s²</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="team-lab-hint">Enter valid speed and time values.</p>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary team-lab-btn-block"
                    disabled={saveBusy || !accelResult}
                    onClick={() =>
                      void saveSketch(
                        CALC.ACCEL,
                        {
                          finalSpeedKmh: accelResult.finalSpeedKmh,
                          reachTimeSec: accelResult.reachTimeSec,
                        },
                        { accelerationMs2: accelResult.accelerationMs2 },
                      )
                    }
                  >
                    {saveBusy ? "Saving..." : "Save data"}
                  </button>
                </section>
              ) : null}

              <section className="team-lab-card clean-panel public-tools-card">
                <div className="team-lab-card-head">
                  <h2>Saved entries for this team (draft)</h2>
                  <p className="team-lab-card-desc">Only in this browser, for this team + category combination.</p>
                </div>
                {visibleRows.length === 0 ? (
                  <p className="team-lab-hint">You have not saved anything in this draft yet.</p>
                ) : (
                  <ul className="public-tools-history">
                    {visibleRows.map((r) => (
                      <li key={r.id}>
                        <span className="public-tools-history-date">
                          {new Date(r.createdAt).toLocaleString("es-AR")}
                        </span>
                        <span className="public-tools-history-kind">{r.calcLabel}</span>
                        <span className="public-tools-history-team">{r.resultSummary}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          <p className="team-lab-back">
            <Link to="/">← Volver al inicio</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
