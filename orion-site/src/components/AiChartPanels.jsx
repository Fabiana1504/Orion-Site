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

const COLORS = ["#3d8cff", "#6366f1", "#22d3ee", "#a78bfa", "#f472b6", "#fb923c"];

const tickStyle = { fill: "rgba(244, 246, 251, 0.55)", fontSize: 10 };
const tooltipStyle = {
  backgroundColor: "rgba(21, 26, 36, 0.96)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  color: "#f4f6fb",
};

function truncateName(s, max = 14) {
  const t = String(s || "");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/**
 * @param {{ panels?: Array<{ id: string, title: string, type?: string, unit?: string, data: { name: string, value: number }[] }> }} props
 */
export default function AiChartPanels({ panels, className = "" }) {
  const valid = (Array.isArray(panels) ? panels : []).filter((p) => p && Array.isArray(p.data) && p.data.length > 0);
  if (!valid.length) return null;

  return (
    <div className={`ai-chart-panels ${className}`.trim()}>
      {valid.map((panel) => {
        const type = panel.type === "pie" ? "pie" : "bar";
        const data = (panel.data || []).map((d) => ({
          name: truncateName(d.name, 18),
          fullName: String(d.name || ""),
          value: typeof d.value === "number" && Number.isFinite(d.value) ? d.value : 0,
        }));

        return (
          <div key={panel.id} className="ai-chart-panel clean-panel">
            <div className="ai-chart-panel-head">
              <h3 className="ai-chart-panel-title">{panel.title}</h3>
              {panel.unit ? <span className="ai-chart-panel-unit">{panel.unit}</span> : null}
            </div>
            <div className="ai-chart-panel-chart">
              <ResponsiveContainer width="100%" height={220}>
                {type === "pie" ? (
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    >
                      {data.map((_, i) => (
                        <Cell key={`c-${panel.id}-${i}`} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.15)" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: "rgba(244,246,251,0.65)", fontSize: 11 }} />
                  </PieChart>
                ) : (
                  <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={tickStyle}
                      axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                      interval={0}
                      angle={data.length > 4 ? -28 : 0}
                      textAnchor={data.length > 4 ? "end" : "middle"}
                      height={data.length > 4 ? 56 : 32}
                    />
                    <YAxis tick={tickStyle} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} width={44} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v, _l, item) => {
                        const full = item?.payload?.fullName;
                        return [Number(v).toFixed(panel.unit === "ms" ? 0 : panel.unit === "s" ? 4 : 2), full || "Valor"];
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
                      {data.map((_, i) => (
                        <Cell key={`b-${panel.id}-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
