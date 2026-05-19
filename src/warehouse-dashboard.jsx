import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { DATA_UPDATED_LABEL, REGIONS, WAREHOUSES } from "./generated/warehouse-data.jsx";

const systemFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const statusLabel = { "🔴": "Quá tải", "🟡": "Cảnh báo", "🟢": "Bình thường" };

const regionAliases = {
  dbsh: "dongbangsonghong",
  dongbangsonghong: "dongbangsonghong",
  hn: "hanoi",
  hanoi: "hanoi",
  hnplus: "hanoi",
  hanoiplus: "hanoi",
};

const regionKey = (value) => {
  const key = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  return regionAliases[key] ?? key;
};

const sameRegion = (left, right) => regionKey(left) === regionKey(right);

const countByStatus = (list) => ({
  red: list.filter(w => w.status === "🔴").length,
  yellow: list.filter(w => w.status === "🟡").length,
  green: list.filter(w => w.status === "🟢").length,
});

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [sortCol, setSortCol] = useState("pctDecl");
  const [sortAsc, setSortAsc] = useState(false);

  const wStats = countByStatus(WAREHOUSES);
  const totalCap = REGIONS.reduce((s, r) => s + r.capacity, 0);
  const totalDecl = REGIONS.reduce((s, r) => s + r.declared, 0);
  const totalUsed = REGIONS.reduce((s, r) => s + r.used, 0);

  const pieData = [
    { name: "Quá tải 🔴", value: wStats.red, color: "#ef4444" },
    { name: "Cảnh báo 🟡", value: wStats.yellow, color: "#f59e0b" },
    { name: "Bình thường 🟢", value: wStats.green, color: "#22c55e" },
  ];

  const filteredWH = selectedRegion
    ? WAREHOUSES.filter(w => sameRegion(w.region, selectedRegion))
    : WAREHOUSES;

  const sortedWH = [...filteredWH].sort((a, b) => {
    const va = a[sortCol] ?? 0;
    const vb = b[sortCol] ?? 0;
    return sortAsc ? va - vb : vb - va;
  });

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  return (
    <div style={{ fontFamily: systemFont, background: "#f8fbff", minHeight: "100vh", color: "#0f172a", padding: "0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderBottom: "1px solid #bfdbfe", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", background: "#2563eb", color: "#ffffff", borderRadius: 10, padding: "8px 12px" }}>
  <img src="https://cdnv2.tgdd.vn/webmwg/production-fe/tdm/static/images/Logo_ThoDMX.png" alt="Thợ Điện Máy Xanh" style={{ height: "30px", width: "auto" }} />
</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: 0 }}>
              PHÂN TÍCH TẢI KHO — THỢ ĐMX
            </div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Cập nhật: {DATA_UPDATED_LABEL} · {WAREHOUSES.length} kho · {REGIONS.length} vùng</div>
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 20 }}>
          {[
            { label: "Tổng năng lực", val: totalCap.toLocaleString(), sub: "Sản phẩm", color: "#2563eb" },
            { label: "Khai báo hệ thống", val: totalDecl.toLocaleString(), sub: `${Math.round(totalDecl/totalCap*100)}% năng lực`, color: totalDecl/totalCap > 1 ? "#f87171" : "#34d399" },
            { label: "Đã sử dụng", val: totalUsed.toLocaleString(), sub: `${Math.round(totalUsed/totalCap*100)}% năng lực`, color: "#1d4ed8" },
            { label: "Kho quá tải 🔴", val: wStats.red, sub: `/ ${WAREHOUSES.length} kho`, color: "#f87171" },
          ].map((k, i) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: 10, padding: "14px 16px", border: "1px solid #bfdbfe", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.08)" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: k.color, lineHeight: 1.2, marginTop: 4 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #bfdbfe", background: "#eff6ff", padding: "0 28px" }}>
        {[["overview", "📊 Tổng quan Vùng"], ["warehouses", "🏭 Danh sách Kho"], ["alerts", "🚨 Cảnh báo"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: "none", border: "none", color: tab === id ? "#2563eb" : "#64748b",
            borderBottom: tab === id ? "2px solid #2563eb" : "2px solid transparent",
            padding: "12px 18px", cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 700 : 400, transition: "all .15s"
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "24px 28px" }}>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div>
            {/* Pie + Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #bfdbfe", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.06)" }}>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 16, fontSize: 14 }}>Phân bố trạng thái kho</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v + " kho", n]} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8 }}>
                  {[["🔴", wStats.red, "#ef4444"], ["🟡", wStats.yellow, "#f59e0b"], ["🟢", wStats.green, "#22c55e"]].map(([e, v, c]) => (
                    <div key={e} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>kho {e}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #bfdbfe", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.06)" }}>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 16, fontSize: 14 }}>Khai báo HT / Năng lực theo Vùng (%)</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={REGIONS.map(r => ({ name: r.short, pct: r.pctDecl, status: r.status }))} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                    <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#475569", fontSize: 11 }} domain={[0, 140]} unit="%" />
                    <Tooltip formatter={(v) => [v + "%", "% Khai báo"]} contentStyle={{ background: "#ffffff", border: "1px solid #bfdbfe", color: "#0f172a" }} />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {REGIONS.map((r, i) => (
                        <Cell key={i} fill={r.pctDecl > 100 ? "#ef4444" : r.pctDecl >= 90 ? "#f59e0b" : "#22c55e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Region Cards */}
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 12, fontSize: 14 }}>Chi tiết theo Vùng</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {REGIONS.map((r, i) => {
                const whInRegion = WAREHOUSES.filter(w => sameRegion(w.region, r.name));
                const wSt = countByStatus(whInRegion);
                return (
                  <div key={i} style={{ background: "#ffffff", borderRadius: 12, padding: 16, border: `1px solid ${r.status === "🔴" ? "#fecaca" : r.status === "🟡" ? "#fde68a" : "#bfdbfe"}`, boxShadow: "0 8px 24px rgba(37, 99, 235, 0.06)", cursor: "pointer", transition: "transform .15s" }}
                    onClick={() => { setSelectedRegion(r.name); setTab("warehouses"); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>NL: {r.capacity.toLocaleString()} · {whInRegion.length} kho</div>
                      </div>
                      <div style={{ fontSize: 20 }}>{r.status}</div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginTop: 10, marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 4 }}>
                        <span>Khai báo/NL</span><span style={{ fontWeight: 700, color: r.pctDecl > 100 ? "#f87171" : r.pctDecl >= 90 ? "#fbbf24" : "#4ade80" }}>{r.pctDecl}%</span>
                      </div>
                      <div style={{ background: "#dbeafe", borderRadius: 4, height: 6 }}>
                        <div style={{ width: `${Math.min(r.pctDecl, 140)}%`, background: r.pctDecl > 100 ? "#ef4444" : r.pctDecl >= 90 ? "#f59e0b" : "#22c55e", height: 6, borderRadius: 4 }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {[["ML", r.pctAC], ["ĐHK", r.pctDHK]].map(([lbl, pct]) => (
                        <div key={lbl} style={{ flex: 1, background: "#eff6ff", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "#64748b" }}>{lbl}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: pct > 100 ? "#f87171" : pct >= 90 ? "#fbbf24" : "#4ade80" }}>{pct}%</div>
                        </div>
                      ))}
                      <div style={{ flex: 1, background: "#eff6ff", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#64748b" }}>🔴 kho</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: wSt.red > 0 ? "#f87171" : "#4ade80" }}>{wSt.red}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WAREHOUSES TAB */}
        {tab === "warehouses" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "#475569" }}>Lọc vùng:</div>
              <button onClick={() => setSelectedRegion(null)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #bfdbfe", cursor: "pointer", fontSize: 12, background: !selectedRegion ? "#2563eb" : "#ffffff", color: !selectedRegion ? "#ffffff" : "#1d4ed8" }}>Tất cả</button>
              {REGIONS.map(r => (
                <button key={r.name} onClick={() => setSelectedRegion(r.name)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #bfdbfe", cursor: "pointer", fontSize: 12, background: selectedRegion === r.name ? "#2563eb" : "#ffffff", color: selectedRegion === r.name ? "#ffffff" : "#1d4ed8" }}>{r.short}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>Hiển thị {sortedWH.length} kho · Nhấp tiêu đề để sắp xếp</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#dbeafe", color: "#1e3a8a" }}>
                    {[["name", "Tên kho"], ["region", "Vùng"], ["cap", "NL Tổng"], ["pctDecl", "% KB/NL"], ["pctAC", "% KB ML"], ["pctDHK", "% KB ĐHK"], ["foreAC", "% NL/DBA ML"], ["foreDHK", "% NL/DBA ĐHK"], ["status", "Trạng thái"]].map(([col, label]) => (
                      <th key={col} onClick={() => handleSort(col)} style={{ padding: "8px 10px", textAlign: "left", cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}>
                        {label} {sortCol === col ? (sortAsc ? "↑" : "↓") : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedWH.map((w, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fbff", borderBottom: "1px solid #dbeafe" }}>
                      <td style={{ padding: "7px 10px", color: "#0f172a", fontWeight: 600 }}>{w.name}</td>
                      <td style={{ padding: "7px 10px", color: "#475569", fontSize: 11 }}>{w.region}</td>
                      <td style={{ padding: "7px 10px", color: "#2563eb" }}>{w.cap}</td>
                      <td style={{ padding: "7px 10px", fontWeight: 700, color: w.pctDecl > 100 ? "#f87171" : w.pctDecl >= 90 ? "#fbbf24" : "#4ade80" }}>{w.pctDecl}%</td>
                      <td style={{ padding: "7px 10px", color: w.pctAC > 100 ? "#dc2626" : w.pctAC >= 90 ? "#d97706" : "#475569" }}>{w.pctAC}%</td>
                      <td style={{ padding: "7px 10px", color: w.pctDHK > 100 ? "#dc2626" : w.pctDHK >= 90 ? "#d97706" : "#475569" }}>{w.pctDHK}%</td>
                      <td style={{ padding: "7px 10px", color: w.foreAC > 100 ? "#dc2626" : "#475569" }}>{w.foreAC}%</td>
                      <td style={{ padding: "7px 10px", color: w.foreDHK > 100 ? "#dc2626" : "#475569" }}>{w.foreDHK}%</td>
                      <td style={{ padding: "7px 10px" }}><span style={{ background: w.status === "🔴" ? "#fee2e2" : w.status === "🟡" ? "#fef3c7" : "#dcfce7", color: w.status === "🔴" ? "#b91c1c" : w.status === "🟡" ? "#92400e" : "#166534", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{w.status} {statusLabel[w.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {tab === "alerts" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Top critical */}
              <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #bfdbfe", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.06)" }}>
                <div style={{ fontWeight: 700, color: "#f87171", marginBottom: 14, fontSize: 14 }}>🔴 Top kho khai báo vượt năng lực cao nhất</div>
                {WAREHOUSES.filter(w => w.pctDecl > 100).sort((a, b) => b.pctDecl - a.pctDecl).slice(0, 8).map((w, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #dbeafe" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{w.region}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#f87171" }}>{w.pctDecl}%</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>KB/NL</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ĐHK high */}
              <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #bfdbfe", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.06)" }}>
                <div style={{ fontWeight: 700, color: "#d97706", marginBottom: 14, fontSize: 14 }}>⚠️ Kho ĐHK khai báo vượt năng lực cao nhất</div>
                {WAREHOUSES.filter(w => w.pctDHK > 100).sort((a, b) => b.pctDHK - a.pctDHK).slice(0, 8).map((w, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #dbeafe" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{w.region} · ML: {w.pctAC}%</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#d97706" }}>{w.pctDHK}%</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>ĐHK/NL</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast alerts */}
            <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #bfdbfe", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.06)", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 14, fontSize: 14 }}>📈 Kho có % Dự báo Máy lạnh vượt 200% năng lực</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {WAREHOUSES.filter(w => w.foreAC > 200).sort((a, b) => b.foreAC - a.foreAC).map((w, i) => (
                  <div key={i} style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{w.region}</div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div><span style={{ fontSize: 11, color: "#64748b" }}>DBA ML:</span> <span style={{ fontWeight: 800, color: "#1d4ed8" }}>{w.foreAC}%</span></div>
                      <div><span style={{ fontSize: 11, color: "#64748b" }}>DBA ĐHK:</span> <span style={{ fontWeight: 700, color: "#475569" }}>{w.foreDHK}%</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { label: "Kho khai báo vượt 100% NL (Tổng)", val: WAREHOUSES.filter(w => w.pctDecl > 100).length, color: "#f87171", icon: "🔴" },
                { label: "Kho ĐHK vượt 100% NL", val: WAREHOUSES.filter(w => w.pctDHK > 100).length, color: "#fbbf24", icon: "❄️" },
                { label: "Kho ML vượt 100% NL", val: WAREHOUSES.filter(w => w.pctAC > 100).length, color: "#2563eb", icon: "🌡️" },
                { label: "Kho chưa khai báo (0%)", val: WAREHOUSES.filter(w => w.pctDecl === 0).length, color: "#475569", icon: "⬜" },
                { label: "Vùng quá tải (>100%)", val: REGIONS.filter(r => r.pctDecl > 100).length, color: "#f87171", icon: "📍" },
                { label: "Kho dự báo ML >200%", val: WAREHOUSES.filter(w => w.foreAC > 200).length, color: "#1d4ed8", icon: "📈" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#ffffff", borderRadius: 10, padding: "14px 16px", border: "1px solid #bfdbfe", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
