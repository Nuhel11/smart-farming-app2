import React, { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

const styles = {
  card: {
    margin: "18px 0 10px",
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(52,152,219,0.12), rgba(46,204,113,0.12))",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.07)",
    overflow: "hidden",
  },
  header: {
    padding: "12px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.75)",
  },
  title: { margin: 0, fontWeight: 900, color: "#111827" },
  select: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#fff",
    fontWeight: 700,
  },
  body: { padding: "12px 14px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  tile: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  k: { fontSize: 12, color: "#6b7280", fontWeight: 900, marginBottom: 6 },
  v: { fontSize: 18, fontWeight: 950, color: "#111827" },
  small: { fontSize: 12, color: "#6b7280" },
  list: { marginTop: 10, display: "grid", gap: 8 },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    background: "rgba(255,255,255,0.82)",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.06)",
  },
  pill: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(17,24,39,0.06)",
    border: "1px solid rgba(0,0,0,0.06)",
    fontWeight: 900,
    fontSize: 12,
    color: "#111827",
    whiteSpace: "nowrap",
  },
};

function fmt(n, suffix = "") {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "-";
  return `${Number(n).toFixed(1)}${suffix}`;
}

export default function WeatherWidget({ fields }) {
  const token = localStorage.getItem("authToken");
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const safeFields = Array.isArray(fields) ? fields : [];
  const [selectedId, setSelectedId] = useState(safeFields[0]?.field_id || "");

  const selected = useMemo(
    () => safeFields.find((f) => String(f.field_id) === String(selectedId)) || safeFields[0],
    [safeFields, selectedId]
  );

  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selected) return;
    setSelectedId(selected.field_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeFields?.length]);

  useEffect(() => {
    const run = async () => {
      if (!selected?.latitude || !selected?.longitude) return;
      setLoading(true);
      setError("");
      try {
        const urlC = `${API}/weather/current?lat=${selected.latitude}&lon=${selected.longitude}`;
        const urlF = `${API}/weather/forecast?lat=${selected.latitude}&lon=${selected.longitude}&points=8`;

        const [rc, rf] = await Promise.all([fetch(urlC, { headers }), fetch(urlF, { headers })]);
        const dc = await rc.json();
        const df = await rf.json();

        if (!rc.ok) throw new Error(dc.message || "Failed to load current weather");
        if (!rf.ok) throw new Error(df.message || "Failed to load forecast");

        setCurrent(dc.weather || null);
        setForecast(df.forecast?.points || []);
      } catch (e) {
        setError(e.message || "Weather service error");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [selected?.latitude, selected?.longitude, headers]);

  if (!selected) return null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Live Weather Forecast</h3>
          <div style={styles.small}>
            Location: <b>{selected.field_name}</b> ({selected.latitude}, {selected.longitude})
          </div>
        </div>

        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={styles.select}>
          {safeFields.map((f) => (
            <option key={f.field_id} value={f.field_id}>
              {f.field_name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.body}>
        {error ? (
          <div style={{ ...styles.tile, borderColor: "rgba(231,76,60,0.35)", color: "#9b2d23" }}>
            {error}
            <div style={{ ...styles.small, marginTop: 6 }}>
              Tip: Ensure your backend has <b>OWM_API_KEY</b> configured.
            </div>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              <div style={styles.tile}>
                <div style={styles.k}>Current Temperature</div>
                <div style={styles.v}>{current ? fmt(current.temperature_c, "°C") : loading ? "..." : "-"}</div>
              </div>
              <div style={styles.tile}>
                <div style={styles.k}>Humidity</div>
                <div style={styles.v}>{current ? fmt(current.humidity_percent, "%") : loading ? "..." : "-"}</div>
              </div>
              <div style={styles.tile}>
                <div style={styles.k}>Rain (last hour)</div>
                <div style={styles.v}>{current ? fmt(current.rainfall_mm, " mm") : loading ? "..." : "-"}</div>
              </div>
            </div>

            <div style={{ marginTop: 14, fontWeight: 950, color: "#111827" }}>Next 24 hours (approx.)</div>
            <div style={styles.list}>
              {forecast.length === 0 && (
                <div style={styles.row}>
                  <span style={styles.small}>{loading ? "Loading forecast..." : "No forecast data yet."}</span>
                </div>
              )}
              {forecast.map((p) => (
                <div key={p.dt} style={styles.row}>
                  <span style={styles.small}>{p.time_text || new Date(p.dt * 1000).toLocaleString()}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {p.condition ? <span style={styles.pill}>{p.condition}</span> : null}
                    <span style={styles.pill}>{fmt(p.temperature_c, "°C")}</span>
                    <span style={styles.pill}>{fmt(p.humidity_percent, "%")}</span>
                    <span style={styles.pill}>{fmt(p.rainfall_mm, " mm")}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
