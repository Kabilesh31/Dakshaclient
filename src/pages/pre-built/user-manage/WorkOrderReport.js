import React, { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Dummy data — shaped like "SREE DAKSHA INDUSTRIES" fabrication rate bills.
// Bill BILL-07 below mirrors the sample bill photo exactly.
// ---------------------------------------------------------------------------
const COMPANY_NAME = "SREE DAKSHA INDUSTRIES";
const ALL_SITES_KEY = "__ALL_SITES__";

const WORK_ORDERS = [
  {
    id: "wo-07",
    billNo: "BILL-07",
    date: "2026-01-15",
    factoryExpenses: 35537.5,
    items: [
      { sno: 1, date: "2026-01-10", siteName: "Kavundampalayam", workOrderNo: "258", invoiceNo: "F-049", description: "Window gril - Maice officeroom", kgs: 149.95, sft: null, rate: 30, amount: 4498.5 },
      { sno: 2, date: "2026-01-11", siteName: "Thondamuthur", workOrderNo: "262", invoiceNo: "F-050", description: "Ladder - 12 feet", kgs: 43.9, sft: null, rate: 30, amount: 1317.0 },
      { sno: 3, date: "2026-01-12", siteName: "Sulur", workOrderNo: "235", invoiceNo: "F-051", description: "Dressing L-angle", kgs: 46.6, sft: null, rate: 30, amount: 1398.0 },
      { sno: 4, date: "2026-01-12", siteName: "Sulur", workOrderNo: "235", invoiceNo: "F-051", description: "Labour for dressing L angle fixing", kgs: null, sft: 1550.0, rate: 1, amount: 1550.0 },
      { sno: 5, date: "2026-01-13", siteName: "Thudiyalur", workOrderNo: "257", invoiceNo: "F-052", description: "Garden chair - rework alteration, 4 chairs", kgs: 28.5, sft: null, rate: 35, amount: 997.5 },
      { sno: 6, date: "2026-01-13", siteName: "Thudiyalur", workOrderNo: "257", invoiceNo: "F-052", description: "Labour for garden chair rework", kgs: null, sft: 5300.0, rate: 1, amount: 5300.0 },
      { sno: 7, date: "2026-01-14", siteName: "Annur", workOrderNo: "271", invoiceNo: "F-053", description: "Swing leg", kgs: 111.95, sft: null, rate: 35, amount: 3918.25 },
      { sno: 8, date: "2026-01-14", siteName: "Annur", workOrderNo: "271", invoiceNo: "F-053", description: "Sea saw leg", kgs: 63.35, sft: null, rate: 35, amount: 2217.25 },
      { sno: 9, date: "2026-01-15", siteName: "Saravanampatti", workOrderNo: "193, 194", invoiceNo: "F-054", description: "Window gril - 3rd, 4th floor", kgs: 1657.9, sft: null, rate: 30, amount: 49737.0 },
    ],
  },
  {
    id: "wo-06",
    billNo: "BILL-06",
    date: "2025-12-20",
    factoryExpenses: 21400.0,
    items: [
      { sno: 1, date: "2025-12-16", siteName: "Keeranatham", workOrderNo: "241", invoiceNo: "F-041", description: "Balcony railing fabrication", kgs: 210.4, sft: null, rate: 30, amount: 6312.0 },
      { sno: 2, date: "2025-12-17", siteName: "Keeranatham", workOrderNo: "241", invoiceNo: "F-041", description: "Labour for railing fixing", kgs: null, sft: 2100.0, rate: 1, amount: 2100.0 },
      { sno: 3, date: "2025-12-18", siteName: "Balu Garden", workOrderNo: "248", invoiceNo: "F-042", description: "Main gate fabrication", kgs: 340.75, sft: null, rate: 32, amount: 10904.0 },
      { sno: 4, date: "2025-12-20", siteName: "Balu Garden", workOrderNo: "248", invoiceNo: "F-043", description: "Staircase handrail", kgs: 96.5, sft: null, rate: 30, amount: 2895.0 },
    ],
  },
  {
    id: "wo-05",
    billNo: "BILL-05",
    date: "2025-11-28",
    factoryExpenses: 18250.0,
    items: [
      { sno: 1, date: "2025-11-24", siteName: "Vasanth Promotors", workOrderNo: "219", invoiceNo: "F-033", description: "Window grill, ground floor", kgs: 420.6, sft: null, rate: 30, amount: 12618.0 },
      { sno: 2, date: "2025-11-25", siteName: "Vasanth Promotors", workOrderNo: "219", invoiceNo: "F-034", description: "Labour for grill fixing", kgs: null, sft: 3800.0, rate: 1, amount: 3800.0 },
      { sno: 3, date: "2025-11-28", siteName: "Star Town", workOrderNo: "224", invoiceNo: "F-035", description: "Compound fence gate", kgs: 118.4, sft: null, rate: 32, amount: 3788.8 },
    ],
  },
  {
    id: "wo-08",
    billNo: "BILL-08",
    date: "2026-02-10",
    factoryExpenses: 27600.0,
    items: [
      { sno: 1, date: "2026-02-05", siteName: "Kavundampalayam", workOrderNo: "265", invoiceNo: "F-055", description: "Terrace pergola frame", kgs: 560.2, sft: null, rate: 30, amount: 16806.0 },
      { sno: 2, date: "2026-02-06", siteName: "Sulur", workOrderNo: "259", invoiceNo: "F-056", description: "Garden bench fabrication, 2 units", kgs: 74.3, sft: null, rate: 35, amount: 2600.5 },
      { sno: 3, date: "2026-02-08", siteName: "Thudiyalur", workOrderNo: "276", invoiceNo: "F-057", description: "Swing set fabrication", kgs: 189.6, sft: null, rate: 35, amount: 6636.0 },
      { sno: 4, date: "2026-02-08", siteName: "Thudiyalur", workOrderNo: "276", invoiceNo: "F-057", description: "Labour for swing set fixing", kgs: null, sft: 1150.0, rate: 1, amount: 1150.0 },
    ],
  },
];

// Flatten every bill's items into one list, carrying the parent bill's
// billNo/date along with each row — this is what site filtering runs over.
const ALL_ITEMS = WORK_ORDERS.flatMap((wo) =>
  wo.items.map((it) => ({ ...it, billNo: wo.billNo, itemDate: it.date || wo.date }))
);

const inr = (n) =>
  n == null
    ? ""
    : Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

const WorkOrderReportPage = () => {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Refs for date inputs
  const dateFromRef = useRef(null);
  const dateToRef = useRef(null);

  // Items that survive the date filter, used to build the site list and
  // (once a site is picked) the right-hand table.
  const isDateFiltered = Boolean(dateFrom || dateTo);

  const dateFilteredItems = useMemo(
    () =>
      ALL_ITEMS.filter((it) => {
        const matchesFrom = !dateFrom || it.itemDate >= dateFrom;
        const matchesTo = !dateTo || it.itemDate <= dateTo;
        return matchesFrom && matchesTo;
      }),
    [dateFrom, dateTo]
  );

  const sites = useMemo(() => {
    const map = new Map();
    dateFilteredItems.forEach((it) => {
      if (!map.has(it.siteName)) map.set(it.siteName, { name: it.siteName, count: 0, amount: 0, lastDate: it.itemDate });
      const entry = map.get(it.siteName);
      entry.count += 1;
      entry.amount += it.amount;
      if (it.itemDate > entry.lastDate) entry.lastDate = it.itemDate;
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [dateFilteredItems]);

  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((s) => s.name.toLowerCase().includes(q));
  }, [sites, search]);

  // "All Sites" is a pinned, mixed-workorders view — every site's rows,
  // filtered by date but not narrowed to one site. It's the default view
  // whenever a date range is applied, but the user can pick it any time.
  const [selectedSite, setSelectedSite] = useState(ALL_SITES_KEY);

  // Keep selection valid as filters change: stay on "All Sites" or the
  // chosen site, falling back gracefully if that site drops out of range.
  const activeSite = useMemo(() => {
    if (selectedSite === ALL_SITES_KEY) return ALL_SITES_KEY;
    if (selectedSite && sites.some((s) => s.name === selectedSite)) return selectedSite;
    return sites[0]?.name || null;
  }, [selectedSite, sites]);

  // A date filter always searches across every site — mixed results with
  // the Site Name column shown — even if a single site was previously picked.
  const isAllSites = activeSite === ALL_SITES_KEY || isDateFiltered;

  const siteItems = useMemo(() => {
    const items = isAllSites
      ? dateFilteredItems
      : activeSite
      ? dateFilteredItems.filter((it) => it.siteName === activeSite)
      : [];
    return [...items].sort((a, b) => {
      if (a.itemDate !== b.itemDate) return a.itemDate < b.itemDate ? -1 : 1;
      return a.siteName.localeCompare(b.siteName);
    });
  }, [dateFilteredItems, activeSite, isAllSites]);

  const totalAmount = useMemo(() => siteItems.reduce((sum, it) => sum + it.amount, 0), [siteItems]);

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
  };

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    const rows = siteItems.map((it, i) => ({
      "S.No": i + 1,
      Date: it.itemDate.split("-").reverse().join("-"),
      ...(isAllSites ? { "Site Name": it.siteName } : {}),
      "Bill No": it.billNo,
      "Work Order No": it.workOrderNo,
      "Invoice No": it.invoiceNo,
      "Description of Work": it.description,
      Kgs: it.kgs ?? "",
      Sft: it.sft ?? "",
      Rate: it.rate,
      Amount: it.amount,
    }));
    rows.push({});
    rows.push({ "Description of Work": "Total amount", Amount: totalAmount });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = isAllSites
      ? [{ wch: 6 }, { wch: 11 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 36 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 14 }]
      : [{ wch: 6 }, { wch: 11 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 36 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isAllSites ? "All Sites" : activeSite);
    XLSX.writeFile(wb, `${isAllSites ? "all_sites" : activeSite.replace(/\s+/g, "_")}_work_order_report.xlsx`);
  };

  // Handle date input focus to prevent issues
  const handleDateFocus = (e) => {
    e.target.showPicker && e.target.showPicker();
  };

  const tableHeaders = isAllSites
    ? ["S.No", "Date", "Site Name", "Work Order No", "Invoice No", "Description of Work", "Kgs", "Sft", "Rate", "Amount"]
    : ["S.No", "Date","Work Order No", "Invoice No", "Description of Work", "Kgs", "Sft", "Rate", "Amount"];

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
        .site-row { transition: background-color 0.12s ease; cursor: pointer; }
        .site-row:hover { background-color: #eef2ff; }
        .wo-scroll::-webkit-scrollbar { width: 6px; }
        .wo-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        /* Fix for date input issues */
        input[type="date"] {
          position: relative;
        }
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0.6;
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        input[type="date"]:focus {
          border-color: #4338ca;
          box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.1);
        }
        /* Prevent date picker from closing issues */
        input[type="date"]::-webkit-datetime-edit {
          position: relative;
          z-index: 1;
        }
      `}</style>

      {/* Header with Title and Buttons */}
      <div className="no-print" style={{
        marginTop: "70px",
        padding: "24px 20px 0px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>Work Order Report</h2>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>View overall work order reports</p>
        </div>

        <div style={{
          display: "flex",
          gap: 12,
          alignItems: "center"
        }}>
          <button
            onClick={handleExportExcel}
            disabled={!activeSite}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              cursor: activeSite ? "pointer" : "not-allowed",
              opacity: activeSite ? 1 : 0.5,
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.background = "#f9fafb";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.background = "#ffffff";
                e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
              }
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
            disabled={!activeSite}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
              background: "#4338ca",
              color: "#ffffff",
              cursor: activeSite ? "pointer" : "not-allowed",
              opacity: activeSite ? 1 : 0.5,
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(67, 56, 202, 0.3)"
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.background = "#3730a3";
                e.target.style.boxShadow = "0 2px 6px rgba(67, 56, 202, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.background = "#4338ca";
                e.target.style.boxShadow = "0 1px 3px rgba(67, 56, 202, 0.3)";
              }
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

      <div style={{ display: "flex", gap: 20, padding: 24, maxWidth: 1400, margin: "0 auto", alignItems: "flex-start" }}>
        {/* Left Panel — Site select */}
        <div
          className="no-print"
          style={{
            width: 300,
            flexShrink: 0,
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
            <input
              type="text"
              placeholder="Search site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
                outline: "none",
                marginBottom: 10,
              }}
            />

            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Filter by date</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  ref={dateFromRef}
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onFocus={handleDateFocus}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (e.target.showPicker) {
                      e.target.showPicker();
                    }
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "7px 8px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 12.5,
                    outline: "none",
                    color: "#374151",
                    background: "#ffffff",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              </div>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>to</span>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  ref={dateToRef}
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onFocus={handleDateFocus}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (e.target.showPicker) {
                      e.target.showPicker();
                    }
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "7px 8px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 12.5,
                    outline: "none",
                    color: "#374151",
                    background: "#ffffff",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              </div>
            </div>

            {(dateFrom || dateTo) && (
              <button
                onClick={clearDateFilter}
                style={{
                  marginTop: 8, fontSize: 12, color: "#4338ca", background: "none", border: "none",
                  cursor: "pointer", padding: 0, fontWeight: 600,
                }}
              >
                Clear date filter
              </button>
            )}

            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 10 }}>
              {filteredSites.length} site{filteredSites.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Pinned "All Sites" — every site's work orders mixed together within the date range */}
          <div
            className="site-row"
            onClick={() => setSelectedSite(ALL_SITES_KEY)}
            style={{
              padding: "14px 16px",
              borderBottom: "2px solid #e5e7eb",
              background: isAllSites ? "#eef2ff" : "#fafafa",
              borderLeft: isAllSites ? "3px solid #4338ca" : "3px solid transparent",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>All Sites</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>mixed</span>
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {dateFilteredItems.length} item{dateFilteredItems.length !== 1 ? "s" : ""} across {sites.length} site{sites.length !== 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#4338ca", marginTop: 6 }}>
              &#8377; {inr(dateFilteredItems.reduce((s, it) => s + it.amount, 0))}
            </div>
          </div>

          <div className="wo-scroll" style={{ maxHeight: 460, overflowY: "auto" }}>
            {filteredSites.length === 0 && (
              <div style={{ padding: 20, fontSize: 13, color: "#9ca3af", textAlign: "center" }}>No matching sites</div>
            )}
            {filteredSites.map((site) => {
              const active = !isAllSites && site.name === activeSite;
              return (
                <div
                  key={site.name}
                  className="site-row"
                  onClick={() => setSelectedSite(site.name)}
                  title={isDateFiltered ? "Clear the date filter to view this site on its own" : undefined}
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    background: active ? "#eef2ff" : "transparent",
                    borderLeft: active ? "3px solid #4338ca" : "3px solid transparent",
                    opacity: isDateFiltered ? 0.55 : 1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{site.name}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{site.lastDate.split("-").reverse().join("-")}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {site.count} item{site.count !== 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#4338ca", marginTop: 6 }}>
                    &#8377; {inr(site.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel — Selected site (or All Sites) detail / print area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="print-area"
            style={{
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              padding: "28px 32px",
              minHeight: 300,
            }}
          >
            {!activeSite ? (
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: "60px 0" }}>
                No work order data for the selected filters.
              </div>
            ) : (
              <>
                {/* Bill header */}
                <div style={{ textAlign: "center", marginBottom: 18, borderBottom: "2px solid #111827", paddingBottom: 14 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5, color: "#111827" }}>{COMPANY_NAME}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Work Order Report</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginTop: 8 }}>
                    {isAllSites ? "All Sites" : `Site: ${activeSite}`}
                    {(dateFrom || dateTo) && (
                      <span style={{ fontWeight: 500, color: "#6b7280" }}>
                        {"  ("}
                        {dateFrom || "start"} to {dateTo || "today"}
                        {")"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {tableHeaders.map((h, i) => (
                        <th
                          key={h}
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "8px 10px",
                            textAlign: i >= tableHeaders.length - 4 ? "right" : "left",
                            fontWeight: 700,
                            color: "#111827",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {siteItems.map((it, idx) => (
                      <tr key={`${it.billNo}-${it.siteName}-${it.sno}`}>
                        <td style={cellStyle}>{idx + 1}</td>
                        <td style={cellStyle}>{it.itemDate.split("-").reverse().join("-")}</td>
                        {isAllSites && <td style={cellStyle}>{it.siteName}</td>}
                        {/* <td style={cellStyle}>{it.billNo}</td> */}
                        <td style={cellStyle}>{it.workOrderNo}</td>
                        <td style={cellStyle}>{it.invoiceNo}</td>
                        <td style={cellStyle}>{it.description}</td>
                        <td style={{ ...cellStyle, textAlign: "right" }}>{it.kgs != null ? it.kgs.toFixed(2) : ""}</td>
                        <td style={{ ...cellStyle, textAlign: "right" }}>{it.sft != null ? it.sft.toFixed(2) : ""}</td>
                        <td style={{ ...cellStyle, textAlign: "right" }}>{it.rate}</td>
                        <td style={{ ...cellStyle, textAlign: "right", fontWeight: 600 }}>{inr(it.amount)}</td>
                      </tr>
                    ))}
                    {siteItems.length === 0 && (
                      <tr>
                        <td colSpan={tableHeaders.length} style={{ ...cellStyle, textAlign: "center", color: "#9ca3af", padding: "24px 10px" }}>
                          No work orders in this date range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: -1 }}>
                  <tbody>
                    <tr>
                      <td style={{ ...totalLabelStyle, fontWeight: 700, background: "#f3f4f6" }}>Total amount, Rs.</td>
                      <td style={{ ...totalValueStyle, fontWeight: 700, background: "#f3f4f6", fontSize: 15 }}>{inr(totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 10, fontStyle: "italic" }}>
                  Amount chargeable in words: Rupees {numberToWords(totalAmount)} only.
                </div>

                {/* Signatures */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 60 }}>
                  <div style={{ textAlign: "center" }}>
                    {/* <div style={{ borderTop: "1px solid #9ca3af", width: 160, paddingTop: 6, fontSize: 12, color: "#374151" }}>
                      Fabricator
                    </div> */}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ borderTop: "1px solid #9ca3af", width: 160, paddingTop: 6, fontSize: 12, color: "#374151" }}>
                      Authorised Signatory
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const cellStyle = { border: "1px solid #e5e7eb", padding: "7px 10px", color: "#1f2937" };
const totalLabelStyle = { border: "1px solid #d1d5db", padding: "8px 10px", textAlign: "right", color: "#374151", width: "80%" };
const totalValueStyle = { border: "1px solid #d1d5db", padding: "8px 10px", textAlign: "right", color: "#111827", width: "20%" };

export default WorkOrderReportPage;