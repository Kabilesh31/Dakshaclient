import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Dummy data — shaped like "SREE DAKSHA PROPERTY DEVELOPERS" weekly wage
// sheets. SR-69 below mirrors the sample sheet photo exactly (dates, per-day
// units, totals, wage rate and payout all reconcile to the printed totals).
// ---------------------------------------------------------------------------
const COMPANY_NAME = "SREE DAKSHA PROPERTY DEVELOPERS (INDIA) PVT LTD.,";

const SALARY_REPORTS = [
  {
    id: "sr-69",
    project: "NMR",
    team: "69",
    raBill: "RA BILL:69",
    periodFrom: "2026-07-16",
    periodTo: "2026-07-22",
    foodAmount: 400,
    dates: ["16.07.26", "17.07.26", "18.07.26", "19.07.26", "20.07.26", "21.07.26", "22.07.26"],
    workers: [
      { name: "MINAJ", rate: 1100, days: [1.5, 1.5, 1.625, 0, 1.5625, 1.5, 1.5] },
      { name: "INFAN", rate: 1200, days: [1.25, 1.375, 1.6875, 0, 1.625, 1.5, 1.375] },
      { name: "MOKTHAR", rate: 650, days: [1.5, 1.375, 1.375, 0, 1.625, 1.625, 1.5] },
      { name: "NOVSAD", rate: 900, days: [1.5, 1.375, 1.125, 0, 1.625, 1.625, 1.5] },
      { name: "ASRAF", rate: 700, days: [1.25, 1.375, 1.6875, 0, 1.625, 1.375, 1.3125] },
      { name: "ISAMUL", rate: 850, days: [1.25, 1.375, 1.6875, 0, 1.625, 1.5, 1.375] },
      { name: "SHAHID", rate: 600, days: [0, 1.375, 1.375, 0, 1.5625, 1.5, 1.5] },
      { name: "JAVED", rate: 850, days: [1.5, 1.375, 1.6875, 0, 1.625, 1.5, 1.375] },
      { name: "MANOVAR MOHAMMED", rate: 500, days: [1.5, 1.375, 1.125, 0, 1.1875, 1.5, 1.3125] },
      { name: "SAMIR", rate: 850, days: [0, 1.375, 1.625, 0, 1.625, 1.375, 1.5625] },
      { name: "SURFUDDIN", rate: 700, days: [1.5, 1.375, 1.625, 0, 1.625, 1.5, 1.5625] },
      { name: "SERAJ", rate: 750, days: [1.5, 1.625, 1.5625, 0, 1.5, 1.5, 1.5] },
      { name: "MANOVAR SAW", rate: 800, days: [1.5, 1.125, 1.625, 0, 1.5, 1.375, 1.5] },
    ],
  },
  {
    id: "sr-70",
    project: "NMR",
    team: "70",
    raBill: "RA BILL:70",
    periodFrom: "2026-07-23",
    periodTo: "2026-07-29",
    foodAmount: 350,
    dates: ["23.07.26", "24.07.26", "25.07.26", "26.07.26", "27.07.26", "28.07.26", "29.07.26"],
    workers: [
      { name: "MINAJ", rate: 1100, days: [1.5, 1.5, 1.5, 0, 1.625, 1.5, 1.375] },
      { name: "INFAN", rate: 1200, days: [1.375, 1.5, 1.625, 0, 1.5, 1.5, 1.5] },
      { name: "ASRAF", rate: 700, days: [1.5, 1.375, 1.625, 0, 1.5, 1.375, 1.5] },
      { name: "JAVED", rate: 850, days: [1.5, 1.5, 1.625, 0, 1.5, 1.5, 1.375] },
      { name: "SERAJ", rate: 750, days: [1.5, 1.5, 1.625, 0, 1.5, 1.5, 1.5] },
    ],
  },
  {
    id: "sr-68",
    project: "AROUSH",
    team: "12",
    raBill: "RA BILL:68",
    periodFrom: "2026-07-09",
    periodTo: "2026-07-15",
    foodAmount: 300,
    dates: ["09.07.26", "10.07.26", "11.07.26", "12.07.26", "13.07.26", "14.07.26", "15.07.26"],
    workers: [
      { name: "MOKTHAR", rate: 650, days: [1.5, 1.375, 1.5, 0, 1.625, 1.5, 1.375] },
      { name: "NOVSAD", rate: 900, days: [1.5, 1.375, 1.5, 0, 1.625, 1.5, 1.375] },
      { name: "SHAHID", rate: 600, days: [1.375, 1.375, 1.5, 0, 1.5, 1.375, 1.5] },
      { name: "SAMIR", rate: 850, days: [1.5, 1.375, 1.625, 0, 1.5, 1.5, 1.375] },
    ],
  },
];

const inr = (n) =>
  n == null
    ? ""
    : Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Comma-grouped, no forced decimals — e.g. 1512.5 -> "1,512.5", 1375 -> "1,375".
const fmtAmt = (n) =>
  n == null ? "" : Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const fmt3 = (n) => Number(n).toFixed(3).replace(/0+$/, "").replace(/\.$/, ".000").slice(0, 5);

const numberToWords = (num) => {
  const a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const toWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + toWords(n % 100) : "");
    if (n < 100000) return toWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + toWords(n % 1000) : "");
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + " lakh" + (n % 100000 ? " " + toWords(n % 100000) : "");
    return String(n);
  };
  const whole = Math.round(num);
  if (whole === 0) return "zero";
  const words = toWords(whole);
  return words.charAt(0).toUpperCase() + words.slice(1);
};

// Pre-compute per-worker totals/wages and the report grand total.
const withTotals = (report) => {
  const workers = report.workers.map((w) => {
    const totalDays = w.days.reduce((s, d) => s + d, 0);
    const total = totalDays * w.rate;
    return { ...w, totalDays, total };
  });
  const grandTotal = workers.reduce((s, w) => s + w.total, 0) + report.foodAmount;
  return { ...report, workers, grandTotal };
};

const SalaryReport = () => {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const reports = useMemo(() => SALARY_REPORTS.map(withTotals), []);

  const projects = useMemo(
    () => Array.from(new Set(reports.map((r) => r.project))).sort(),
    [reports]
  );

  const [selectedProject, setSelectedProject] = useState(reports[0]?.project || "");
  const [selectedId, setSelectedId] = useState(reports[0]?.id || null);

  // Work orders (RA bills) that belong to the chosen project, further
  // narrowed by search text and the period date filter.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports
      .filter((r) => r.project === selectedProject)
      .filter((r) => {
        const matchesSearch =
          !q ||
          r.team.toLowerCase().includes(q) ||
          r.raBill.toLowerCase().includes(q) ||
          r.workers.some((w) => w.name.toLowerCase().includes(q));
        const matchesFrom = !dateFrom || r.periodTo >= dateFrom;
        const matchesTo = !dateTo || r.periodFrom <= dateTo;
        return matchesSearch && matchesFrom && matchesTo;
      })
      .sort((a, b) => (a.periodFrom < b.periodFrom ? 1 : -1));
  }, [reports, selectedProject, search, dateFrom, dateTo]);

  const selected = useMemo(() => {
    if (selectedId && filtered.some((r) => r.id === selectedId)) {
      return filtered.find((r) => r.id === selectedId);
    }
    return filtered[0] || null;
  }, [filtered, selectedId]);

  const handleProjectChange = (project) => {
    setSelectedProject(project);
    setSelectedId(null); // let `selected` fall back to the first work order in the new project
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
  };

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    if (!selected) return;
    const rows = selected.dates.map((d, di) => {
      const row = { "S.No": di + 1, Date: d };
      selected.workers.forEach((w) => (row[w.name] = w.days[di] ? Math.round(w.days[di] * w.rate * 100) / 100 : ""));
      return row;
    });
    const totalsRow = { "S.No": "", Date: "Total" };
    const wagesRow = { "S.No": "", Date: "Wages" };
    const grandRow = { "S.No": "", Date: "Total (Rs.)" };
    selected.workers.forEach((w) => {
      totalsRow[w.name] = fmt3(w.totalDays);
      wagesRow[w.name] = w.rate;
      grandRow[w.name] = w.total;
    });
    rows.push({}, totalsRow, wagesRow, grandRow);
    rows.push({});
    rows.push({ Date: "Food", [selected.workers[0]?.name || "Amount"]: selected.foodAmount });
    rows.push({ Date: "Grand total", [selected.workers[0]?.name || "Amount"]: selected.grandTotal });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 6 }, { wch: 10 }, ...selected.workers.map(() => ({ wch: 12 }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selected.raBill);
    XLSX.writeFile(wb, `${selected.raBill.replace(/[:\s]+/g, "_")}_salary_report.xlsx`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
        .sr-row { transition: background-color 0.12s ease; cursor: pointer; }
        .sr-row:hover { background-color: #eef2ff; }
        .sr-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .sr-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{
        padding: "24px 20px 0 20px",
        marginTop : "60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>Salary Report</h2>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>Weekly attendance and wages by team</p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={handleExportExcel}
            disabled={!selected}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
              borderRadius: 8, border: "1px solid #d1d5db", background: "#ffffff", color: "#374151",
              cursor: selected ? "pointer" : "not-allowed", opacity: selected ? 1 : 0.5,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Excel
          </button>
          <button
            onClick={handlePrint}
            disabled={!selected}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
              borderRadius: 8, border: "none", background: "#4338ca", color: "#ffffff",
              cursor: selected ? "pointer" : "not-allowed", opacity: selected ? 1 : 0.5,
              boxShadow: "0 1px 3px rgba(67, 56, 202, 0.3)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M18 9H6" />
              <path d="M18 13H6" />
              <path d="M18 17H6" />
              <rect x="2" y="9" width="20" height="14" rx="2" ry="2" />
            </svg>
            Print
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, padding: 24, maxWidth: 1700, margin: "0 auto", alignItems: "flex-start" }}>
        {/* Left Panel — Report list */}
        <div
          className="no-print"
          style={{
            width: 320,
            flexShrink: 0,
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Project</div>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8,
                border: "1px solid #d1d5db", fontSize: 14, outline: "none", marginBottom: 14,
                background: "#ffffff", color: "#111827", fontWeight: 600, cursor: "pointer",
              }}
            >
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search work order, worker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8,
                border: "1px solid #d1d5db", fontSize: 14, outline: "none", marginBottom: 10,
              }}
            />

            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Filter by period</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  flex: 1, minWidth: 0, boxSizing: "border-box", padding: "7px 8px", borderRadius: 8,
                  border: "1px solid #d1d5db", fontSize: 12.5, outline: "none", color: "#374151",
                }}
              />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  flex: 1, minWidth: 0, boxSizing: "border-box", padding: "7px 8px", borderRadius: 8,
                  border: "1px solid #d1d5db", fontSize: 12.5, outline: "none", color: "#374151",
                }}
              />
            </div>

            {(dateFrom || dateTo) && (
              <button
                onClick={clearDateFilter}
                style={{ marginTop: 8, fontSize: 12, color: "#4338ca", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
              >
                Clear date filter
              </button>
            )}

            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 10 }}>
              {filtered.length} work order{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="sr-scroll" style={{ maxHeight: 560, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: 20, fontSize: 13, color: "#9ca3af", textAlign: "center" }}>No matching work orders</div>
            )}
            {filtered.map((r) => {
              const active = selected && r.id === selected.id;
              return (
                <div
                  key={r.id}
                  className="sr-row"
                  onClick={() => setSelectedId(r.id)}
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    background: active ? "#eef2ff" : "transparent",
                    borderLeft: active ? "3px solid #4338ca" : "3px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{r.raBill}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>
                      {r.periodFrom.split("-").reverse().join("-")}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    Team {r.team} &middot; {r.workers.length} worker{r.workers.length !== 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#4338ca", marginTop: 6 }}>
                    &#8377; {inr(r.grandTotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel — Selected report / print area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="print-area sr-scroll"
            style={{
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              padding: "24px 24px",
              minHeight: 300,
              overflowX: "auto",
            }}
          >
            {!selected ? (
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: "60px 0" }}>
                No salary report for the selected filters.
              </div>
            ) : (
              <div style={{ minWidth: 220 + selected.workers.length * 110 }}>
                {/* Sheet header */}
                <div style={{ borderBottom: "2px solid #111827", paddingBottom: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{COMPANY_NAME}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12.5, color: "#374151", flexWrap: "wrap", gap: 8 }}>
                    <span><strong>PROJECT:</strong> {selected.project} &nbsp; <strong>TEAM:</strong> {selected.team}</span>
                    <span><strong>{selected.raBill}</strong></span>
                    <span>
                      <strong>PERIOD:</strong> ({selected.dates[0]} TO {selected.dates[selected.dates.length - 1]})
                    </span>
                  </div>
                </div>

                {/* Matrix table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginTop: 8 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      <th style={{ ...cellStyle, fontWeight: 700, minWidth: 40 }}>S.No</th>
                      <th style={{ ...cellStyle, fontWeight: 700, minWidth: 80 }}>Date</th>
                      {selected.workers.map((w) => (
                        <th key={w.name} style={{ ...cellStyle, fontWeight: 700, minWidth: 100, textAlign: "center" }}>
                          {w.name}
                        </th>
                      ))}
                      <th style={{ ...cellStyle, fontWeight: 700, minWidth: 70, textAlign: "center" }}>FOOD</th>
                      <th style={{ ...cellStyle, fontWeight: 700, minWidth: 90, textAlign: "center" }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.dates.map((d, di) => (
                      <tr key={d}>
                        <td style={cellStyle}>{di + 1}</td>
                        <td style={cellStyle}>{d}</td>
                        {selected.workers.map((w) => (
                          <td key={w.name} style={{ ...cellStyle, textAlign: "center" }}>
                            {w.days[di] ? fmtAmt(w.days[di] * w.rate) : ""}
                          </td>
                        ))}
                        <td style={{ ...cellStyle, textAlign: "center" }}>{di === 0 ? inr(selected.foodAmount).replace(".00", "") : ""}</td>
                        <td style={cellStyle}></td>
                      </tr>
                    ))}

                    {/* Total days row */}
                    <tr style={{ background: "#f3f4f6", fontWeight: 700 }}>
                      <td style={cellStyle} colSpan={2}>Total</td>
                      {selected.workers.map((w) => (
                        <td key={w.name} style={{ ...cellStyle, textAlign: "center" }}>{fmt3(w.totalDays)}</td>
                      ))}
                      <td style={cellStyle}></td>
                      <td style={cellStyle}></td>
                    </tr>

                    {/* Wages (per-day rate) row */}
                    <tr style={{ background: "#fef3c7", fontWeight: 700 }}>
                      <td style={cellStyle} colSpan={2}>Wages</td>
                      {selected.workers.map((w) => (
                        <td key={w.name} style={{ ...cellStyle, textAlign: "center" }}>{inr(w.rate).replace(".00", "")}</td>
                      ))}
                      <td style={{ ...cellStyle, textAlign: "center" }}>{inr(selected.foodAmount).replace(".00", "")}</td>
                      <td style={{ ...cellStyle, textAlign: "center" }}>{inr(selected.grandTotal).replace(".00", "")}</td>
                    </tr>

                    {/* Grand total row */}
                    <tr style={{ background: "#fde68a", fontWeight: 700 }}>
                      <td style={cellStyle} colSpan={2}>Total</td>
                      {selected.workers.map((w) => (
                        <td key={w.name} style={{ ...cellStyle, textAlign: "center" }}>{inr(w.total).replace(".00", "")}</td>
                      ))}
                      <td style={cellStyle}></td>
                      <td style={cellStyle}></td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 10, fontStyle: "italic" }}>
                  Amount chargeable in words: Rupees {numberToWords(selected.grandTotal)} only.
                </div>

                {/* Signatures */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 50 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ borderTop: "1px solid #9ca3af", width: 160, paddingTop: 6, fontSize: 12, color: "#374151" }}>
                      Prepared By
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ borderTop: "1px solid #9ca3af", width: 160, paddingTop: 6, fontSize: 12, color: "#374151" }}>
                      Authorised Signatory
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const cellStyle = { border: "1px solid #d1d5db", padding: "6px 8px", color: "#1f2937" };

export default SalaryReport;