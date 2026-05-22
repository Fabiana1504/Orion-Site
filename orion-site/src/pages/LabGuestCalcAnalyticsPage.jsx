import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { deleteCalcRecordById, fetchAllCalcRecordsForLab } from "../services/calcRecordsService";

const KIND_LABELS = {
  velocity_distance_time: "Speed (d/t)",
  reaction_time_ms: "Reaction (ms)",
  reaction_semaphore: "Reaction (traffic light)",
  acceleration_speed_time: "Acceleration",
  distance_speed_time: "Distance (v·t)",
  team_metrics_bundle: "Team metrics bundle",
};

const METRIC_FILTERS = {
  ALL: "all",
  SPEED: "speed",
  REACTION: "reaction",
  ACCELERATION: "acceleration",
};

const PIE_COLORS = ["#3d8cff", "#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#94a3b8"];

function toResultObject(raw) {
  // Soporta result_json en dos formatos posibles: objeto o string JSON serializado.
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

function shortResult(row) {
  // Priorizamos columnas explícitas; si no existen, caemos al JSON de resultado.
  const parts = [];
  if (row.velocity_kmh != null && Number.isFinite(Number(row.velocity_kmh))) {
    parts.push(`${Number(row.velocity_kmh).toFixed(2)} km/h`);
  }
  if (row.reaction_ms != null && Number.isFinite(Number(row.reaction_ms))) {
    parts.push(`${Number(row.reaction_ms).toFixed(0)} ms`);
  }
  if (row.acceleration_ms2 != null && Number.isFinite(Number(row.acceleration_ms2))) {
    parts.push(`${Number(row.acceleration_ms2).toFixed(4)} m/s²`);
  }
  if (parts.length) return parts.join(" · ");

  const r = toResultObject(row.result_json);
  if (!r || typeof r !== "object") return "—";
  if (r.velocityKmh != null) return `${Number(r.velocityKmh).toFixed(2)} km/h`;
  if (r.reactionMs != null) return `${r.reactionMs} ms`;
  if (r.accelerationMs2 != null) return `${Number(r.accelerationMs2).toFixed(4)} m/s²`;
  if (r.distanceM != null) return `${Number(r.distanceM).toFixed(2)} m`;
  return JSON.stringify(r);
}

function escapeCsvCell(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows) {
  // Export plano para análisis externo (Excel/Sheets/BI).
  const headers = [
    "created_at",
    "school_team_name",
    "category",
    "contact_email",
    "calc_kind",
    "result_summary",
    "notes",
    "user_id",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        escapeCsvCell(row.created_at),
        escapeCsvCell(row.school_team_name),
        escapeCsvCell(row.category),
        escapeCsvCell(row.contact_email),
        escapeCsvCell(row.calc_kind),
        escapeCsvCell(shortResult(row)),
        escapeCsvCell(row.notes),
        escapeCsvCell(row.user_id),
      ].join(","),
    );
  }
  return "\uFEFF" + lines.join("\n");
}

function detectMetricGroup(row) {
  // Clasificación robusta por:
  // 1) columnas explícitas, 2) calc_kind, 3) claves en result_json.
  const kind = String(row.calc_kind || "");
  if (row.velocity_kmh != null && Number.isFinite(Number(row.velocity_kmh))) return METRIC_FILTERS.SPEED;
  if (row.reaction_ms != null && Number.isFinite(Number(row.reaction_ms))) return METRIC_FILTERS.REACTION;
  if (row.acceleration_ms2 != null && Number.isFinite(Number(row.acceleration_ms2))) return METRIC_FILTERS.ACCELERATION;
  if (kind === "velocity_distance_time" || kind === "distance_speed_time") return METRIC_FILTERS.SPEED;
  if (kind === "reaction_time_ms" || kind === "reaction_semaphore") return METRIC_FILTERS.REACTION;
  if (kind === "acceleration_speed_time") return METRIC_FILTERS.ACCELERATION;
  if (kind.includes("vel") || kind.includes("speed")) return METRIC_FILTERS.SPEED;
  if (kind.includes("react")) return METRIC_FILTERS.REACTION;
  if (kind.includes("accel")) return METRIC_FILTERS.ACCELERATION;
  const r = toResultObject(row.result_json);
  if (r?.velocityKmh != null || r?.distanceM != null) return METRIC_FILTERS.SPEED;
  if (r?.reactionMs != null) return METRIC_FILTERS.REACTION;
  if (r?.accelerationMs2 != null) return METRIC_FILTERS.ACCELERATION;
  return METRIC_FILTERS.ALL;
}

export default function LabGuestCalcAnalyticsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [metricFilter, setMetricFilter] = useState(METRIC_FILTERS.ALL);
  const [teamCategoryFilter, setTeamCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteMsg, setDeleteMsg] = useState(null);

  const load = useCallback(async () => {
    // Carga principal del tablero. Se reutiliza en mount, refresh manual y auto-refresh.
    setLoading(true);
    setErr(null);
    setDeleteMsg(null);
    const { data, error } = await fetchAllCalcRecordsForLab(800);
    setLoading(false);
    if (error) {
      setErr(error.message || "Could not load data.");
      setRows([]);
      return;
    }
    setRows(data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      // Auto refresh para ver nuevos registros de equipos casi en tiempo real.
      void load();
    }, 6000);
    return () => clearInterval(id);
  }, [load]);

  const availableCategories = useMemo(() => {
    // Lista dinámica de categorías existentes en los datos actuales.
    const set = new Set();
    for (const r of rows) {
      const v = String(r.category ?? "").trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  useEffect(() => {
    if (teamCategoryFilter === "all") return;
    if (!availableCategories.includes(teamCategoryFilter)) {
      setTeamCategoryFilter("all");
    }
  }, [teamCategoryFilter, availableCategories]);

  const filteredRows = useMemo(() => {
    // Filtro compuesto: primero por tipo de métrica y luego por categoría de equipo.
    let next = rows;
    if (metricFilter !== METRIC_FILTERS.ALL) {
      next = next.filter((r) => detectMetricGroup(r) === metricFilter);
    }
    if (teamCategoryFilter !== "all") {
      next = next.filter((r) => String(r.category ?? "").trim() === teamCategoryFilter);
    }
    return next;
  }, [rows, metricFilter, teamCategoryFilter]);

  const pieData = useMemo(() => {
    // Agregación para gráfico de distribución por tipo de cálculo.
    const counts = new Map();
    for (const r of filteredRows) {
      const k = r.calc_kind || "otro";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, value]) => ({
      name: KIND_LABELS[name] ?? name,
      value,
    }));
  }, [filteredRows]);

  const downloadCsv = () => {
    // Descarga de la vista actual (respeta filtros activos).
    const blob = new Blob([rowsToCsv(filteredRows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orion-calc-equipos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDeleteRow = async (row) => {
    // Borrado con confirmación para evitar eliminación accidental.
    const summary = `${row.school_team_name} · ${KIND_LABELS[row.calc_kind] ?? row.calc_kind} · ${shortResult(row)}`;
    const ok = window.confirm(`Delete this record?\n\n${summary}\n\nThis will also delete it from Supabase.`);
    if (!ok) return;

    setDeleteMsg(null);
    setDeletingId(row.id);
    const { error } = await deleteCalcRecordById(row.id);
    setDeletingId(null);
    if (error) {
      setDeleteMsg(`Could not delete: ${error.message || "unknown error"}`);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setDeleteMsg("Record deleted from database.");
  };

  return (
    <div id="top">
      <Header />
      <main className="team-lab-main">
        <div className="container team-lab-container">
          <header className="team-lab-hero">
            <p className="eyebrow eyebrow--pulse">Laboratory</p>
            <h1 className="team-lab-page-title">Team data (public tools)</h1>
            <p className="team-lab-lead">
              Measurements saved by teams in{" "}
              <Link to="/herramientas-equipos">Team tools</Link>. Export CSV for Excel or external
              analysis.
            </p>
            <div className="team-lab-toolbar">
              <button type="button" className="btn btn-primary team-lab-btn-pub" onClick={() => void load()} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={downloadCsv} disabled={!filteredRows.length}>
                Download CSV
              </button>
              <Link to="/equipo/laboratorio" className="btn btn-ghost">
                Back to laboratory
              </Link>
            </div>
          </header>

          {err ? (
            <p className="lab-login-error team-lab-hint--banner" role="alert">
              {err}
            </p>
          ) : null}
          {deleteMsg ? (
            <p className="team-lab-hint team-lab-hint--banner" role="status">
              {deleteMsg}
            </p>
          ) : null}

          <section className="team-lab-card clean-panel public-tools-card" style={{ marginBottom: 24 }}>
            <div className="team-lab-card-head">
              <h2>Metric filter</h2>
              <p className="team-lab-card-desc">View by reaction, acceleration, speed, or all together.</p>
            </div>
            <div className="public-tools-calc-tabs">
              <button
                type="button"
                className={`public-tools-calc-tab ${metricFilter === METRIC_FILTERS.ALL ? "is-active" : ""}`}
                onClick={() => setMetricFilter(METRIC_FILTERS.ALL)}
              >
                All
              </button>
              <button
                type="button"
                className={`public-tools-calc-tab ${metricFilter === METRIC_FILTERS.REACTION ? "is-active" : ""}`}
                onClick={() => setMetricFilter(METRIC_FILTERS.REACTION)}
              >
                Reaction
              </button>
              <button
                type="button"
                className={`public-tools-calc-tab ${metricFilter === METRIC_FILTERS.ACCELERATION ? "is-active" : ""}`}
                onClick={() => setMetricFilter(METRIC_FILTERS.ACCELERATION)}
              >
                Acceleration
              </button>
              <button
                type="button"
                className={`public-tools-calc-tab ${metricFilter === METRIC_FILTERS.SPEED ? "is-active" : ""}`}
                onClick={() => setMetricFilter(METRIC_FILTERS.SPEED)}
              >
                Speed
              </button>
            </div>
            <div className="team-lab-row team-lab-row--wrap lab-guest-category-filter" style={{ marginTop: 14 }}>
              <label className="team-lab-field lab-guest-category-field" style={{ maxWidth: 340 }}>
                <span>Team category</span>
                <select
                  className="lab-guest-category-select"
                  value={teamCategoryFilter}
                  onChange={(e) => setTeamCategoryFilter(e.target.value)}
                >
                  <option value="all">All categories</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="team-lab-card clean-panel public-tools-card" style={{ marginBottom: 24 }}>
            <div className="team-lab-card-head">
              <h2>Summary by type</h2>
              <p className="team-lab-card-desc">Total records in view: {filteredRows.length}</p>
            </div>
            {pieData.length === 0 && !loading ? (
              <p className="team-lab-hint">No saved measurements yet.</p>
            ) : (
              <div className="lab-guest-chart-wrap" style={{ width: "100%", height: 280, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={96} label={false}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="team-lab-card clean-panel public-tools-card">
            <div className="team-lab-card-head">
              <h2>Table</h2>
              <p className="team-lab-card-desc">Latest {filteredRows.length} records in current filter.</p>
            </div>
            <div className="lab-guest-table-wrap">
              <table className="lab-guest-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Team</th>
                    <th>Category</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Result</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length ? (
                    filteredRows.map((r) => (
                      <tr key={r.id}>
                        <td>{new Date(r.created_at).toLocaleString("es-AR")}</td>
                        <td>{r.school_team_name}</td>
                        <td>{r.category ?? "—"}</td>
                        <td>{r.contact_email ?? "—"}</td>
                        <td>{KIND_LABELS[r.calc_kind] ?? r.calc_kind}</td>
                        <td>{shortResult(r)}</td>
                        <td className="lab-guest-table-notes">{r.notes ?? "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => void onDeleteRow(r)}
                            disabled={deletingId === r.id}
                          >
                            {deletingId === r.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", opacity: 0.8 }}>
                        No rows for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
