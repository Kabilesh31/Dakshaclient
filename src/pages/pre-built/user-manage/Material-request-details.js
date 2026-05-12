// MaterialRequestDetails.js
import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import { Block, Icon } from "../../../components/Component";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

// API base URL – adjust to your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

/* ─────────────────────────────────────────────
   BUILD PRINT HTML
───────────────────────────────────────────── */
function buildPrintHTML(requestData, id) {
  const fmtDate = (d) => {
    if (!d) return "-";
    try {
      if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = d.split("-");
        return `${day}-${month}-${year}`;
      }
      const date = new Date(d);
      if (!isNaN(date.getTime())) {
        return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
      }
      return d;
    } catch {
      return d;
    }
  };

  const items = requestData?.items || [];
  const itemRows =
    items.length > 0
      ? items
          .map(
            (item, idx) => `
        <tr>
          <td style="border:1px solid #ccc;padding:5px 8px;text-align:center;">${item.no || idx + 1}</td>
          <td style="border:1px solid #ccc;padding:5px 8px;">${item.itemName || item.itemCode || "-"}</td>
          <td style="border:1px solid #ccc;padding:5px 8px;text-align:center;">${item.uom || "Kg"}</td>
          <td style="border:1px solid #ccc;padding:5px 8px;text-align:center;">${item.quantity || 0}</td>
          <td style="border:1px solid #ccc;padding:5px 8px;text-align:center;">${item.warehouse || "CALIES C - SD"}</td>
          <td style="border:1px solid #ccc;padding:5px 8px;text-align:center;">${item.uom || "Kg"}</td>
        </tr>`,
          )
          .join("")
      : `<tr><td colspan="6" style="border:1px solid #ccc;padding:12px;text-align:center;color:#999;">No items<\/td><\/tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Material Request - ${id || requestData?._id || ""}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Times New Roman',Times,serif;font-size:11px;color:#000;background:#fff;padding:14mm 14mm 10mm 14mm;}
    @page{size:A4;margin:0;}
    @media print{body{padding:10mm 12mm;}.no-print{display:none!important;}.po-wrap{padding-top:0!important;}}
    .preview-toolbar{position:fixed;top:0;left:0;right:0;background:#1e293b;color:#fff;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;z-index:9999;font-family:sans-serif;font-size:13px;}
    .toolbar-left{display:flex;align-items:center;gap:10px;}
    .toolbar-title{font-weight:600;}
    .toolbar-sub{font-size:11px;color:#94a3b8;}
    .btn-print{background:#3b82f6;color:#fff;border:none;padding:8px 20px;border-radius:5px;cursor:pointer;font-size:13px;font-weight:600;}
    .btn-print:hover{background:#2563eb;}
    .btn-close{background:#475569;color:#fff;border:none;padding:8px 16px;border-radius:5px;cursor:pointer;font-size:13px;font-weight:600;}
    .btn-close:hover{background:#334155;}
    .po-wrap{max-width:794px;margin:0 auto;padding-top:56px;}
    .top-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
    .co-name{font-weight:800;font-size:13px;margin-bottom:2px;}
    .co-info{font-size:9.5px;line-height:1.6;color:#333;}
    .mr-box{text-align:right;}
    .mr-title{font-weight:700;font-size:15px;letter-spacing:.3px;margin-bottom:3px;}
    .mr-id{font-size:11px;font-weight:600;color:#333;}
    .divider-h{border-top:1.5px solid #000;margin:8px 0;}
    .divider-l{border-top:1px solid #000;margin:6px 0 0 0;}
    .meta-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px;}
    .meta-tbl td{padding:3px 6px;vertical-align:top;}
    .lbl{color:#000;font-weight:600;white-space:nowrap;}
    .val{color:#000;}
    .lbl-r{color:#000;font-weight:600;white-space:nowrap;padding-left:30px;}
    .val-r{color:#000;}
    .it-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:0;}
    .it-tbl th{background:#f0f0f0;border:1px solid #999;padding:5px 8px;font-weight:700;}
    .it-tbl td{border:1px solid #ccc;padding:5px 8px;}
    .page-footer{text-align:center;font-size:10px;color:#555;margin-top:6px;}
    .sig-for{text-align:right;font-size:11px;margin-bottom:40px;padding-right:20px;margin-top:24px;}
    .sig-row{display:flex;justify-content:space-between;font-size:11px;border-top:1px solid #ccc;padding-top:8px;}
    .sig-col{text-align:center;flex:1;}
    .sig-sp{height:36px;}
  </style>
</head>
<body>
<div class="preview-toolbar no-print">
  <div class="toolbar-left">
    <svg width="18" height="18" fill="none" stroke="#60a5fa" stroke-width="2.5" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M7 8h10M7 12h10M7 16h6"/>
    </svg>
    <div>
      <div class="toolbar-title">Material Request Preview</div>
      <div class="toolbar-sub">${id || requestData?._id || ""}</div>
    </div>
  </div>
  <div style="display:flex;gap:10px;">
    <button class="btn-close" onclick="window.close()">&#8592; Close</button>
    <button class="btn-print" onclick="window.print()">&#128438;&nbsp; Print / Save as PDF</button>
  </div>
</div>
<div class="po-wrap">
  <div class="top-row">
    <div>
      <div class="co-name">SREE DAKSHA INDUSTRIES</div>
      <div class="co-info">
        Fabrication Factory,<br>
        Thondamuthur Road, Vadavalli,<br>
        Coimbatore, Tamilnadu - 641046. India.<br>
        Email : dakshafabrication@gmail.com<br>
        Tel: +91422 2975815<br>
        GST : 33AEJPA2097N1ZD
      </div>
    </div>
    <div class="mr-box">
      <div class="mr-title">MATERIAL REQUEST</div>
      <div class="mr-id">${id || requestData?._id || "MREQ-00644"}</div>
    </div>
  </div>
  <div class="divider-h"></div>
  <table class="meta-tbl">
    <tbody>
      <tr>
        <td class="lbl" style="width:90px;">Purpose:<\/td>
        <td class="val" style="width:160px;">${requestData?.purpose || "Purchase"}<\/td>
        <td class="lbl-r" style="width:140px;">Transaction Date:<\/td>
        <td class="val-r">${fmtDate(requestData?.transactionDate)}<\/td>
      <\/tr>
      <tr>
        <td class="lbl"><\/td><td class="val"><\/td>
        <td class="lbl-r">Required By:<\/td>
        <td class="val-r">${fmtDate(requestData?.requiredBy)}<\/td>
      <\/tr>
      <tr>
        <td class="lbl"><\/td><td class="val"><\/td>
        <td class="lbl-r" style="vertical-align:top;">Set Target Warehouse:<\/td>
        <td class="val-r">${requestData?.warehouse || "CALIES C - SD"}<\/td>
      <\/tr>
    <\/tbody>
  <\/table>
  <div class="divider-l"><\/div>
  <table class="it-tbl">
    <thead>
      <tr>
        <th style="text-align:center;width:35px;">Sr<\/th>
        <th style="text-align:left;">Description<\/th>
        <th style="text-align:center;width:45px;"><\/th>
        <th style="text-align:center;width:75px;">Quantity<\/th>
        <th style="text-align:center;width:110px;">Target Warehouse<\/th>
        <th style="text-align:center;width:50px;">UOM<\/th>
      <\/tr>
    <\/thead>
    <tbody>${itemRows}<\/tbody>
  <\/table>
  <div class="page-footer" style="margin-top:8px;">Page 1 of 1<\/div>
  <div class="sig-for">For Sree Daksha Industries<\/div>
  <div class="sig-row">
    <div class="sig-col"><div class="sig-sp"><\/div><div>Prepared By<\/div><\/div>
    <div class="sig-col"><div class="sig-sp"><\/div><div>Purchase Manager<\/div><\/div>
    <div class="sig-col"><div class="sig-sp"><\/div><div>Managing Director/Director Authority<\/div><\/div>
  <\/div>
<\/div>
<\/body>
<\/html>`;
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const S = {
  page: { padding: "8px 0 32px" },
  topbar: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  breadcrumb: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280", marginBottom: 5 },
  breadcrumbSep: { color: "#9ca3af", fontSize: 11 },
  titleRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  pageTitle: { fontSize: 22, fontWeight: 500, color: "#111827" },
  pageId: { fontSize: 12, color: "#9ca3af", marginTop: 3, fontFamily: "monospace" },
  actions: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  btnBase: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    padding: "7px 14px",
    borderRadius: 8,
    cursor: "pointer",
    border: "0.5px solid #d1d5db",
    background: "#fff",
    color: "#6b7280",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    padding: "7px 14px",
    borderRadius: 8,
    cursor: "pointer",
    border: "0.5px solid #534AB7",
    background: "#534AB7",
    color: "#EEEDFE",
  },
  btnInfo: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    padding: "7px 14px",
    borderRadius: 8,
    cursor: "pointer",
    border: "0.5px solid #B5D4F4",
    background: "#E6F1FB",
    color: "#185FA5",
  },
  btnOutline: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    padding: "7px 14px",
    borderRadius: 8,
    cursor: "pointer",
    border: "0.5px solid #ccc",
    background: "#fff",
    color: "#4b5563",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 10,
    marginBottom: 20,
  },
  metric: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px" },
  metricLbl: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 5 },
  metricVal: { fontSize: 15, fontWeight: 500, color: "#111827" },
  card: { background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 14 },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "0.5px solid #e5e7eb",
  },
  cardTitle: { fontSize: 14, fontWeight: 500, color: "#111827" },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px 24px",
    padding: 20,
  },
  metaLbl: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 4 },
  metaVal: { fontSize: 13, fontWeight: 500, color: "#111827" },
  th: {
    padding: "11px 14px",
    textAlign: "left",
    fontWeight: 500,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6b7280",
  },
  thC: {
    padding: "11px 14px",
    textAlign: "center",
    fontWeight: 500,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6b7280",
  },
  td: { padding: "13px 14px", color: "#111827", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle" },
  tdC: {
    padding: "13px 14px",
    color: "#111827",
    borderBottom: "0.5px solid #f3f4f6",
    verticalAlign: "middle",
    textAlign: "center",
  },
  tdMuted: { padding: "13px 14px", color: "#6b7280", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle" },
  tableFoot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 24,
    padding: "12px 20px",
    background: "#f9fafb",
    borderTop: "0.5px solid #e5e7eb",
    fontSize: 13,
    color: "#6b7280",
  },
  attachmentItem: {
  background: "#fff",
  border: "0.5px solid #e5e7eb",
  borderRadius: 10,
  padding: "10px 12px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  transition: "all 0.15s ease",
},

attachmentItemHover: {
  borderColor: "#c7d2fe",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
},
  attachmentArea: { marginTop: 20 },
  attachmentHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  attachmentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 },
  attachmentItem: {
    background: "#fff",
    border: "0.5px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    transition: "all 0.1s",
  },
  attachmentPreview: {
    width: 40,
    height: 40,
    borderRadius: 6,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  attachmentInfo: { flex: 1, minWidth: 0 },
  attachmentName: {
    fontSize: 12,
    fontWeight: 500,
    color: "#1f2937",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  attachmentMeta: { fontSize: 10, color: "#9ca3af", marginTop: 2 },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    borderRadius: 4,
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.1s",
  },
  emptyAttachments: {
    textAlign: "center",
    padding: "32px 20px",
    background: "#fafafa",
    borderRadius: 12,
    border: "0.5px dashed #d1d5db",
    color: "#9ca3af",
  },
  loadingOverlay: { textAlign: "center", padding: 20, color: "#6b7280" },
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const formatDate = (d) => {
  if (!d) return "-";
  if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, day] = d.split("-");
    return `${day}-${m}-${y}`;
  }
  try {
    const dt = new Date(d);
    if (!isNaN(dt.getTime()))
      return `${String(dt.getDate()).padStart(2, "0")}-${String(dt.getMonth() + 1).padStart(2, "0")}-${dt.getFullYear()}`;
    return d;
  } catch {
    return d;
  }
};

const StatusBadge = ({ status }) => {
  const map = {
    Ordered: { bg: "#EAF3DE", color: "#27500A", border: "0.5px solid #C0DD97", dot: "#639922" },
    "Partially Ordered": { bg: "#E6F1FB", color: "#0C447C", border: "0.5px solid #85B7EB", dot: "#378ADD" },
  };
  const s = map[status] || { bg: "#FAEEDA", color: "#633806", border: "0.5px solid #FAC775", dot: "#BA7517" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 500,
        padding: "4px 12px",
        borderRadius: 99,
        background: s.bg,
        color: s.color,
        border: s.border,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
};

const PillPurple = ({ children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      fontSize: 12,
      fontWeight: 500,
      padding: "2px 10px",
      borderRadius: 99,
      background: "#EEEDFE",
      color: "#3C3489",
    }}
  >
    {children}
  </span>
);

const PillBlue = ({ children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      fontSize: 12,
      fontWeight: 500,
      padding: "2px 10px",
      borderRadius: 99,
      background: "#E6F1FB",
      color: "#0C447C",
    }}
  >
    {children}
  </span>
);

const CodePill = ({ children }) => (
  <code
    style={{
      background: "#f9fafb",
      border: "0.5px solid #e5e7eb",
      borderRadius: 4,
      padding: "2px 7px",
      fontFamily: "monospace",
      fontSize: 11,
      color: "#6b7280",
    }}
  >
    {children}
  </code>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const MaterialRequestDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();
  const initialData = location.state?.requestData;

  const [requestData, setRequestData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Fetch full request (including attachments) on mount
  useEffect(() => {
    if (!id) return;
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/material-requests/${id}`);
        const result = await response.json();
        if (result.success) {
          setRequestData(result.data);
        } else {
          setError(result.message || "Failed to load material request");
        }
      } catch (err) {
        console.error(err);
        setError("Network error while loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <>
        <Head title="Material Request Details" />
        <Content>
          <Block>
            <div style={S.loadingOverlay}>
              <Icon name="spinner" style={{ fontSize: 28, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 12 }}>Loading request data...</p>
            </div>
          </Block>
        </Content>
      </>
    );
  }

  if (error || !requestData) {
    return (
      <>
        <Head title="Material Request Details" />
        <Content>
          <Block>
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#FAEEDA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Icon name="alert-circle" style={{ fontSize: 32, color: "#BA7517" }} />
              </div>
              <h4 style={{ marginBottom: 8, fontWeight: 500, color: "#111827" }}>No request data found</h4>
              <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>
                {error || "The material request could not be loaded."}
              </p>
              <button style={S.btnBase} onClick={() => history.push("/material-request")}>
                ← Back to material requests
              </button>
            </div>
          </Block>
        </Content>
      </>
    );
  }

  /* ── File upload handler (backend) ── */
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    if (type === "pdf" && file.type !== "application/pdf") {
      alert("Please select a valid PDF file.");
      return;
    }
    if (type === "image" && !file.type.startsWith("image/")) {
      alert("Please select a valid image file (jpg, png, gif, etc.).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/material-requests/${id}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setRequestData((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), result.data],
        }));
      } else {
        alert(result.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while uploading file");
    } finally {
      setUploading(false);
    }
  };

  /* ── Delete attachment (with URL encoding fix) ── */
  const handleDeleteAttachment = async (publicId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;
    setDeletingId(publicId);
    try {
      const encodedPublicId = encodeURIComponent(publicId);
      const response = await fetch(`${API_BASE_URL}/material-requests/${id}/attachment/${encodedPublicId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setRequestData((prev) => ({
          ...prev,
          attachments: (prev.attachments || []).filter((att) => att.publicId !== publicId),
        }));
      } else {
        alert(result.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting attachment");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = () => {
    const html = buildPrintHTML(requestData, id);
    const win = window.open("", "_blank", "width=920,height=720,scrollbars=yes,resizable=yes");
    if (!win) {
      alert("Popup blocked! Please allow popups for this site.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
  };

  const downloadCSV = () => {
    if (!requestData?.items?.length) return;
    let csv = ["S.No,Item Code,Item Name,Required By,Quantity,Warehouse,UOM"].join(",") + "\n";
    csv += `\n"Material Request:","${requestData._id || id}"\n`;
    csv += `"Purpose:","${requestData.purpose || ""}"\n`;
    csv += `"Required By:","${formatDate(requestData.requiredBy)}"\n`;
    csv += `"Warehouse:","${requestData.warehouse || ""}"\n\n`;
    csv += "S.No,Item Code,Item Name,Required By,Quantity,Warehouse,UOM\n";
    requestData.items.forEach((item, i) => {
      csv +=
        [
          item.no || i + 1,
          `"${(item.itemCode || "").replace(/"/g, '""')}"`,
          `"${(item.itemName || "").replace(/"/g, '""')}"`,
          formatDate(item.requiredBy),
          item.quantity || 0,
          `"${(item.warehouse || "").replace(/"/g, '""')}"`,
          `"${(item.uom || "").replace(/"/g, '""')}"`,
        ].join(",") + "\n";
    });
    const total = requestData.items.reduce((s, i) => s + (i.quantity || 0), 0);
    csv += `\n"Total Items:","${requestData.items.length}"\n"Total Quantity:","${total}"\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Material_Request_${requestData._id || id}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalItems = requestData.items?.length || 0;
  const totalQuantity = requestData.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
  const attachments = requestData.attachments || [];

  const formatFileSize = (bytes) => {
    if (!bytes) return "?";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <Head title={`Material Request ${id}`} />
      <Content>
        <div style={S.page}>
          {/* Top bar */}
          <div style={S.topbar}>
            <div>
              <div style={S.breadcrumb}>
                <span>Buying</span>
                <span style={S.breadcrumbSep}>›</span>
                <span>Material requests</span>
                <span style={S.breadcrumbSep}>›</span>
                <span style={{ color: "#111827" }}>{id}</span>
              </div>
              <div style={S.titleRow}>
                <div style={S.pageTitle}>Material request</div>
                <StatusBadge status={requestData.status} />
              </div>
              <div style={S.pageId}>{id}</div>
            </div>

            <div style={S.actions}>
              <button style={S.btnBase} onClick={() => history.push("/material-request")}>
                ← Back
              </button>
              <button style={S.btnInfo} onClick={handlePrint}>
                <Icon name="printer" />
              </button>
              <UncontrolledDropdown>
                <DropdownToggle tag="button" style={{ ...S.btnPrimary, border: "0.5px solid #534AB7" }}>
                  <Icon name="download" /><Icon name="chevron-down" style={{ fontSize: 11 }} />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem onClick={downloadCSV}>
                    <Icon name="file-text" className="me-2" /> Download as CSV
                  </DropdownItem>
                  <DropdownItem onClick={handlePrint}>
                    <Icon name="printer" className="me-2" /> Print / Save as PDF
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </div>

          {/* Summary metrics */}
          <div style={S.metricsGrid}>
            <div style={S.metric}>
              <div style={S.metricLbl}>Purpose</div>
              <div style={S.metricVal}>
                <PillPurple>{requestData.purpose || "—"}</PillPurple>
              </div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLbl}>Transaction date</div>
              <div style={S.metricVal}>{formatDate(requestData.transactionDate)}</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLbl}>Required by</div>
              <div style={S.metricVal}>{formatDate(requestData.requiredBy)}</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLbl}>Warehouse</div>
              <div style={{ ...S.metricVal, fontSize: 13 }}>{requestData.warehouse || "—"}</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLbl}>Total items</div>
              <div style={S.metricVal}>{totalItems}</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLbl}>Total quantity</div>
              <div style={S.metricVal}>{totalQuantity}</div>
            </div>
          </div>

          {/* Details card */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div>
                <div style={S.cardTitle}>Request details</div>
                {requestData.title && (
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{requestData.title}</div>
                )}
              </div>
            </div>
            <div style={S.metaGrid}>
              <div>
                <div style={S.metaLbl}>Price list</div>
                <div style={S.metaVal}>{requestData.priceList || "—"}</div>
              </div>
              <div>
                <div style={S.metaLbl}>Set target warehouse</div>
                <div style={S.metaVal}>{requestData.warehouse || "—"}</div>
              </div>
              <div>
                <div style={S.metaLbl}>Status</div>
                <div style={{ marginTop: 2 }}>
                  <StatusBadge status={requestData.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Items card */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={S.cardTitle}>Items</div>
              <span
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  background: "#f9fafb",
                  border: "0.5px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "3px 10px",
                }}
              >
                {totalItems} item{totalItems !== 1 ? "s" : ""} · Qty {totalQuantity}
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 48 }} />
                  <col style={{ width: 120 }} />
                  <col />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 70 }} />
                  <col style={{ width: 150 }} />
                  <col style={{ width: 70 }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb" }}>
                    <th style={S.thC}>No</th>
                    <th style={S.th}>Item code</th>
                    <th style={S.th}>Item name</th>
                    <th style={S.th}>Required by</th>
                    <th style={S.thC}>Qty</th>
                    <th style={S.th}>Warehouse</th>
                    <th style={S.thC}>UOM</th>
                  </tr>
                </thead>
                <tbody>
                  {requestData.items?.length > 0 ? (
                    requestData.items.map((item, idx) => {
                      const isLast = idx === requestData.items.length - 1;
                      const tdStyle = isLast ? { ...S.td, borderBottom: "none" } : S.td;
                      const tdCStyle = isLast ? { ...S.tdC, borderBottom: "none" } : S.tdC;
                      const tdMutedStyle = isLast ? { ...S.tdMuted, borderBottom: "none" } : S.tdMuted;

                      return (
                        <tr key={idx}>
                          <td style={{ ...tdCStyle, color: "#9ca3af" }}>{item.no || idx + 1}</td>
                          <td style={tdStyle}>
                            <CodePill>{item.itemCode || "—"}</CodePill>
                          </td>
                          <td style={tdStyle}>{item.itemName || "—"}</td>
                          <td style={tdMutedStyle}>{formatDate(item.requiredBy)}</td>
                          <td style={{ ...tdCStyle, fontWeight: 500 }}>{item.quantity}</td>
                          <td style={tdMutedStyle}>{item.warehouse || "—"}</td>
                          <td style={tdCStyle}>
                            <PillBlue>{item.uom || "—"}</PillBlue>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>
                        <Icon
                          name="inbox"
                          style={{ fontSize: 28, color: "#d1d5db", display: "block", margin: "0 auto 8px" }}
                        />
                        No items found in this request
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {requestData.items?.length > 0 && (
              <div style={S.tableFoot}>
                <span>
                  Total items: <strong style={{ color: "#111827", fontWeight: 500 }}>{totalItems}</strong>
                </span>
                <span>
                  Total quantity: <strong style={{ color: "#111827", fontWeight: 500 }}>{totalQuantity}</strong>
                </span>
              </div>
            )}
          </div>

          {/* ATTACHMENTS SECTION */}
          <div style={S.attachmentArea}>
            <div style={S.attachmentHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="paperclip" style={{ fontSize: 16, color: "#534AB7" }} />
                <span style={{ fontWeight: 500, fontSize: 14, color: "#1f2937" }}>Attachments</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    background: "#f3f4f6",
                    padding: "2px 8px",
                    borderRadius: 12,
                  }}
                >
                  {attachments.length}
                </span>
              </div>

              <UncontrolledDropdown>
                <DropdownToggle tag="button" style={S.btnOutline} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Icon name="spinner" style={{ animation: "spin 1s linear infinite" }} /> Uploading...
                    </>
                  ) : (
                    <>
                      <Icon name="plus" /> Add file <Icon name="chevron-down" style={{ fontSize: 11 }} />
                    </>
                  )}
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem onClick={() => pdfInputRef.current?.click()} disabled={uploading}>
                    <Icon name="file-pdf" className="me-2" style={{ color: "#dc2626" }} /> Upload PDF
                  </DropdownItem>
                  <DropdownItem onClick={() => imageInputRef.current?.click()} disabled={uploading}>
                    <Icon name="image" className="me-2" style={{ color: "#10b981" }} /> Upload Image
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>

              <input
                type="file"
                ref={pdfInputRef}
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files[0]) handleFileUpload(e.target.files[0], "pdf");
                  e.target.value = "";
                }}
              />
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files[0]) handleFileUpload(e.target.files[0], "image");
                  e.target.value = "";
                }}
              />
            </div>

            {attachments.length === 0 ? (
              <div style={S.emptyAttachments}>
                <Icon name="upload-cloud" style={{ fontSize: 32, color: "#cbd5e1", marginBottom: 8 }} />
                <div style={{ fontSize: 13 }}>No files attached</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Click "Add file" to upload PDFs or images</div>
              </div>
            ) : (
              <div style={S.attachmentGrid}>
  {attachments.map((att) => (
    <div
      key={att.publicId}
      style={{
        ...S.attachmentItem,
        cursor: "pointer",
      }}
    >
      {/* Preview Click Area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
          minWidth: 0,
        }}
        onClick={() => {
          if (att.fileType?.startsWith("image/")) {
            // Open image preview
            window.open(att.fileUrl, "_blank");
          } else {
            // Download PDF
            const link = document.createElement("a");
            link.href = att.fileUrl;
            link.download = att.fileName || "document.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
      >
        <div style={S.attachmentPreview}>
          {att.fileType?.startsWith("image/") ? (
            <img src={att.fileUrl} alt={att.fileName} style={S.previewImg} />
          ) : (
            <Icon name="file-pdf" style={{ fontSize: 28, color: "#ef4444" }} />
          )}
        </div>

        <div style={S.attachmentInfo}>
          <div style={S.attachmentName} title={att.fileName}>
            {att.fileName}
          </div>

          <div style={S.attachmentMeta}>
            {att.fileType?.startsWith("image/") ? "Image" : "PDF"} •{" "}
            {att.fileSize ? formatFileSize(att.fileSize) : "—"}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* View */}
        <button
          type="button"
          style={S.removeBtn}
          title="View file"
          onClick={(e) => {
            e.stopPropagation();
            window.open(att.fileUrl, "_blank");
          }}
        >
          <Icon name="eye" style={{ fontSize: 14, color: "#2563eb" }} />
        </button>

        {/* Download */}
        <button
          type="button"
          style={S.removeBtn}
          title="Download file"
          onClick={async (e) => {
            e.stopPropagation();

            try {
              const response = await fetch(att.fileUrl);
              const blob = await response.blob();

              const url = window.URL.createObjectURL(blob);

              const link = document.createElement("a");
              link.href = url;
              link.download = att.fileName || "download";
              document.body.appendChild(link);
              link.click();

              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error("Download failed:", err);
              alert("Unable to download file");
            }
          }}
        >
          <Icon name="downloadload" style={{ fontSize: 14, color: "#16a34a" }} />
        </button>

        {/* Delete */}
        <button
          type="button"
          style={S.removeBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAttachment(att.publicId);
          }}
          disabled={deletingId === att.publicId}
          title="Remove file"
        >
          {deletingId === att.publicId ? (
            <Icon
              name="spinner"
              style={{
                animation: "spin 1s linear infinite",
                fontSize: 12,
              }}
            />
          ) : (
            <Icon name="trash" style={{ fontSize: 14, color: "#ef4444" }} />
          )}
        </button>
      </div>
    </div>
  ))}
</div>
            )}
          </div>
        </div>
      </Content>
    </>
  );
};

export default MaterialRequestDetails;
