import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Row,
  Col,
  Button,
  Icon,
  BlockBetween,
} from "../../../components/Component";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  FormGroup,
  Spinner,
  Alert,
} from "reactstrap";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";

// Import all tab components
import InfoTab from "./InfoTab";
import GalleryTab from "./GalleryTab";
import PlansTab from "./PlansTab";
import DocumentsTab from "./DocumentsTab";
import PurchaseOrdersTab from "./PurchaseOrdersTab";
import DailyWagesTab from "./DailyWagesTab";
import BusinessTab from "./BusinessTab";
import QuotationsTab from "./QuotationsTab";
import ExpensesTab from "./ExpensesTab";

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api` || "http://localhost:5000/api";
const BASE_URL = `${process.env.REACT_APP_BACKENDURL}` || "http://localhost:5000";

const BRAND = "#4B5694";

// ─── STATUS BADGE ──────────────────────────────────────────────
const STATUS_BADGE = {
  approved: { bg: "#eaf3de", color: "#3b6d11", label: "Approved" },
  pending:  { bg: "#faeeda", color: "#854f0b", label: "Pending"  },
  rejected: { bg: "#fcebeb", color: "#a32d2d", label: "Rejected" },
};

// ─── Shared: Brand Button ─────────────────────────────────────
const BrandBtn = ({ children, onClick, disabled, outline = false, danger = false, size = "md", style = {} }) => {
  const pad = size === "sm" ? "5px 13px" : size === "lg" ? "10px 28px" : "7px 18px";
  const bg = danger ? "#dc3545" : outline ? "transparent" : BRAND;
  const color = outline && !danger ? BRAND : "#fff";
  const border = danger ? "1.5px solid #dc3545" : `1.5px solid ${BRAND}`;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg, color, border, padding: pad,
        borderRadius: "8px", fontWeight: 600, fontSize: "13px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex", alignItems: "center", gap: "6px",
        transition: "background 0.18s, opacity 0.18s",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ─── Sidebar Viewer ────────────────────────────────────────────
const SidebarViewer = ({ isOpen, onClose, title, children }) => (
  <>
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1040,
      opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "all" : "none",
      transition: "opacity 0.3s ease",
    }} />
    <div style={{
      position: "fixed", top: 0, right: 0, height: "100vh",
      width: "clamp(320px, 55vw, 860px)", background: "#fff", zIndex: 1050,
      display: "flex", flexDirection: "column",
      boxShadow: "-6px 0 32px rgba(0,0,0,0.18)",
      transform: isOpen ? "translateX(0)" : "translateX(100%)",
      transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: "1px solid #eee",
        background: "#fafafa", flexShrink: 0,
      }}>
        <span style={{ fontWeight: 600, fontSize: "15px", color: "#1a1a2e", maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "20px", lineHeight: 1, color: "#555" }} aria-label="Close">×</button>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  </>
);

// ─── Image Gallery Sidebar ─────────────────────────────────────
const ImageSidebar = ({ isOpen, onClose, images, startIndex = 0, title }) => {
  const [current, setCurrent] = useState(startIndex);
  useEffect(() => { if (isOpen) setCurrent(startIndex); }, [isOpen, startIndex]);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);
  const img = images[current];
  
  const downloadImage = () => {
    if (img?.url) {
      // Fetch the image as blob and download
      fetch(img.url)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = img.title || `image-${current + 1}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(err => {
          // Fallback: direct download
          const link = document.createElement('a');
          link.href = img.url;
          link.download = img.title || `image-${current + 1}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    }
  };
  
  return (
    <SidebarViewer isOpen={isOpen} onClose={onClose} title={title || `Image ${current + 1} of ${images.length}`}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#111" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
          {img && <img src={img.url} alt={img.title || `View ${current + 1}`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
          {images.length > 1 && (
            <>
              <button onClick={prev} style={navBtnStyle("left")}>‹</button>
              <button onClick={next} style={navBtnStyle("right")}>›</button>
            </>
          )}
          <button 
            onClick={downloadImage}
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: 600,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.35)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
          >
            <Icon name="download" size={16} /> Download
          </button>
        </div>
        {images.length > 1 && (
          <div style={{ display: "flex", gap: "8px", padding: "12px 16px", overflowX: "auto", background: "#1a1a1a", flexShrink: 0 }}>
            {images.map((im, idx) => (
              <img key={im._id || idx} src={im.url} alt={im.title || `Thumb ${idx + 1}`} onClick={() => setCurrent(idx)}
                style={{ width: "60px", height: "45px", objectFit: "cover", borderRadius: "5px", cursor: "pointer", flexShrink: 0, transition: "opacity 0.2s", border: idx === current ? "2px solid #fff" : "2px solid transparent", opacity: idx === current ? 1 : 0.55 }}
              />
            ))}
          </div>
        )}
        <div style={{ textAlign: "center", padding: "8px", color: "#aaa", fontSize: "13px", background: "#111", flexShrink: 0 }}>
          {img?.title && <span style={{ marginRight: "16px" }}>📷 {img.title}</span>}
          {current + 1} / {images.length}
        </div>
      </div>
    </SidebarViewer>
  );
};

const navBtnStyle = (side) => ({
  position: "absolute", [side]: "12px", top: "50%", transform: "translateY(-50%)",
  background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
  fontSize: "28px", lineHeight: 1, padding: "6px 14px", borderRadius: "8px",
  cursor: "pointer", backdropFilter: "blur(4px)",
});

// ─── Modal helpers ─────────────────────────────────────────────
const SectionLabel = ({ icon, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "7px", margin: "18px 0 12px", paddingBottom: "8px", borderBottom: "1px solid #f2ede9" }}>
    <Icon name={icon} style={{ color: BRAND, fontSize: "14px" }} />
    <span style={{ fontWeight: 700, fontSize: "11px", color: BRAND, textTransform: "uppercase", letterSpacing: "0.7px" }}>{label}</span>
  </div>
);

const FieldGroup = ({ label, error, children }) => (
  <FormGroup style={{ marginBottom: "14px" }}>
    <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "5px", display: "block" }}>{label}</label>
    {children}
    {error && <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>{error}</div>}
  </FormGroup>
);

const inputStyle = {
  borderRadius: "8px", border: "1.5px solid #e8e4e0",
  fontSize: "13px", padding: "8px 12px",
  color: "#1a1a2e", background: "#fdfcfc",
};

// ─── DAILY WAGES ACCORDION ────────────────────────────────────
const DailyWagesAccordion = ({ wages }) => {
  const [openMonth, setOpenMonth] = useState(null);
  const toggle = (monthKey) => setOpenMonth((prev) => (prev === monthKey ? null : monthKey));

  const groupedByMonth = wages.reduce((acc, wage) => {
    const date = new Date(wage.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { 
        monthName, 
        monthKey, 
        records: [], 
        totalAmount: 0,
        totalDays: 0,
        totalOvertime: 0,
        uniqueEmployees: new Set()
      };
    }
    acc[monthKey].records.push(wage);
    acc[monthKey].totalAmount += wage.totalSalary || 0;
    acc[monthKey].totalDays += 1;
    acc[monthKey].totalOvertime += wage.overtimeHours || 0;
    
    let empId = wage.employeeId;
    if (empId && typeof empId === 'object') {
      empId = empId._id || empId;
    }
    if (empId) {
      acc[monthKey].uniqueEmployees.add(empId.toString());
    }
    return acc;
  }, {});

  const monthKeys = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

  const getEmployeeName = (record) => {
    if (record.employeeName) return record.employeeName;
    if (record.employeeId && typeof record.employeeId === 'object' && record.employeeId.name) {
      return record.employeeId.name;
    }
    return 'Unknown';
  };

  const getEmployeeId = (record) => {
    if (!record.employeeId) return 'N/A';
    if (typeof record.employeeId === 'string') return record.employeeId;
    if (typeof record.employeeId === 'object' && record.employeeId._id) {
      return record.employeeId._id;
    }
    return 'N/A';
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {monthKeys.map((monthKey) => {
          const monthData = groupedByMonth[monthKey];
          const isOpen = openMonth === monthKey;

          return (
            <div key={monthKey}
              style={{
                background: "#fff",
                border: `1px solid ${isOpen ? BRAND + "55" : "#eee"}`,
                borderRadius: "12px",
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <div
                onClick={() => toggle(monthKey)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  cursor: "pointer",
                  userSelect: "none",
                  background: isOpen ? BRAND + "06" : "#fff",
                  transition: "background 0.18s",
                }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: BRAND + "15",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Icon name="calendar" style={{ color: BRAND, fontSize: "17px" }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>
                    {monthData.monthName}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: "#888",
                    marginTop: "2px",
                  }}>
                    {monthData.uniqueEmployees.size} Employees • {monthData.records.length} Records • {monthData.totalOvertime}h Overtime
                  </div>
                </div>

                <span style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: BRAND,
                  background: BRAND + "12",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  flexShrink: 0
                }}>
                  {formatINR(monthData.totalAmount)}
                </span>

                <span style={{
                  color: "#aaa",
                  fontSize: "18px",
                  transition: "transform 0.25s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  flexShrink: 0
                }}>
                  ▾
                </span>
              </div>

              <div style={{
                maxHeight: isOpen ? "1200px" : "0",
                overflow: "hidden",
                transition: "maxHeight 0.3s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: "1px solid #f0f0f0",
                    marginBottom: "12px"
                  }}>
                    <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "#aaa" }}>Total Records</div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND }}>{monthData.records.length}</div>
                    </div>
                    <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "#aaa" }}>Employees</div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND }}>{monthData.uniqueEmployees.size}</div>
                    </div>
                    <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "#aaa" }}>Total Overtime</div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND }}>{monthData.totalOvertime}h</div>
                    </div>
                    <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "#aaa" }}>Total Amount</div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND }}>{formatINR(monthData.totalAmount)}</div>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                          <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</th>
                          <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Employee</th>
                          <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Site</th>
                          <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Daily Salary</th>
                          <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Overtime</th>
                          <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</th>
                          <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthData.records.map((record, idx) => {
                          const employeeName = getEmployeeName(record);
                          const employeeId = getEmployeeId(record);
                          const empIdStr = typeof employeeId === 'string' ? employeeId : employeeId?.toString() || 'N/A';
                          
                          return (
                            <tr key={record._id || idx} style={{ borderBottom: idx < monthData.records.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                              <td style={{ padding: "10px 10px", color: "#555" }}>
                                {record.date ? new Date(record.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "N/A"}
                              </td>
                              <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>
                                {employeeName}
                                <div style={{ fontSize: "11px", color: "#888" }}>
                                  ID: {empIdStr.substring(0, 8) || "N/A"}
                                </div>
                              </td>
                              <td style={{ padding: "10px 10px", color: "#555" }}>
                                {record.siteName || record.site?.name || "N/A"}
                              </td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                                {formatINR(record.dailySalary || 0)}
                              </td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#e65100" }}>
                                {record.overtimeHours || 0}h
                                {record.overtimeAmount > 0 && (
                                  <div style={{ fontSize: "11px", color: "#888" }}>
                                    {formatINR(record.overtimeAmount)}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: BRAND }}>
                                {formatINR(record.totalSalary || 0)}
                              </td>
                              <td style={{ padding: "10px 10px", textAlign: "center" }}>
                                <span style={{
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  padding: "2px 10px",
                                  borderRadius: "20px",
                                  background: record.status === "present" ? "#eaf3de" : record.status === "late" ? "#faeeda" : "#fcebeb",
                                  color: record.status === "present" ? "#3b6d11" : record.status === "late" ? "#854f0b" : "#a32d2d",
                                }}>
                                  {capitalizeFirst(record.status || "Pending")}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {monthKeys.length > 0 && (
        <div style={{
          marginTop: "16px",
          background: BRAND,
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "rgba(255,255,255,0.85)",
            fontSize: "14px",
            fontWeight: 600
          }}>
            <Icon name="wallet" style={{ fontSize: "18px", color: "#fff" }} />
            Total Daily Wages (All Months)
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
            {formatINR(Object.values(groupedByMonth).reduce((sum, m) => sum + m.totalAmount, 0))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MONTH FILTER ──────────────────────────────────────────────
const MonthFilter = ({ 
  selectedMonth, 
  onMonthChange,
  selectedYear,
  onYearChange,
  onFilter, 
  onClear 
}) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>Month:</span>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          style={{
            ...inputStyle,
            padding: "6px 10px",
            fontSize: "12px",
            minWidth: "120px",
            cursor: "pointer"
          }}
        >
          <option value="">All Months</option>
          {months.map((month, index) => (
            <option key={month} value={String(index + 1).padStart(2, '0')}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>Year:</span>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          style={{
            ...inputStyle,
            padding: "6px 10px",
            fontSize: "12px",
            minWidth: "100px",
            cursor: "pointer"
          }}
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <BrandBtn size="sm" onClick={onFilter}>
        <Icon name="filter" size={12} /> Apply Filter
      </BrandBtn>

      <button
        onClick={onClear}
        style={{
          background: "transparent",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "6px 14px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#666",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        <Icon name="refresh" size={12} /> Clear
      </button>
    </div>
  );
};

// ─── PURCHASE ORDER ACCORDION ──────────────────────────────────
const POAccordion = ({ orders }) => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const grandTotal = orders.reduce((sum, po) => {
    const poTotal = (po.items || []).reduce((s, item) => s + (item.quantity * item.unitPrice || item.amount || 0), 0);
    return sum + poTotal;
  }, 0);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {orders.map((po) => {
          const isOpen = openId === po._id;
          const items = po.items || [];
          const poTotal = items.reduce((s, i) => s + (i.quantity * i.unitPrice || i.amount || 0), 0);
          const badge = STATUS_BADGE[po.status?.toLowerCase()] || STATUS_BADGE.pending;

          return (
            <div key={po._id}
              style={{
                background: "#fff",
                border: `1px solid ${isOpen ? BRAND + "55" : "#eee"}`,
                borderRadius: "12px", overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <div
                onClick={() => toggle(po._id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", cursor: "pointer", userSelect: "none",
                  background: isOpen ? BRAND + "06" : "#fff",
                  transition: "background 0.18s",
                }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: BRAND + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="file-text" style={{ color: BRAND, fontSize: "17px" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>{po.poNumber || po._id}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {po.vendor || po.supplierName || "Vendor"}
                  </div>
                </div>
                <span style={{ 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  padding: "3px 10px", 
                  borderRadius: "20px", 
                  background: badge.bg, 
                  color: badge.color, 
                  flexShrink: 0 
                }}>
                  {badge.label}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: BRAND, background: BRAND + "12", padding: "4px 12px", borderRadius: "20px", flexShrink: 0 }}>
                  {formatINR(poTotal)}
                </span>
                <span style={{ color: "#aaa", fontSize: "18px", transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                  ▾
                </span>
              </div>

              <div style={{
                maxHeight: isOpen ? "600px" : "0",
                overflow: "hidden",
                transition: "maxHeight 0.3s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <div style={{ padding: "0 16px 16px" }}>
                  {items.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", tableLayout: "fixed" }}>
                      <colgroup>
                        <col style={{ width: "40%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "20%" }} />
                      </colgroup>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                          {["Item", "Qty", "Unit Price", "Amount"].map((h, i) => (
                            <th key={h} style={{ padding: "6px 8px 10px", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: i > 0 ? "right" : "left" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => {
                          const amount = item.quantity * item.unitPrice || item.amount || 0;
                          return (
                            <tr key={item._id || idx} style={{ borderBottom: idx < items.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                              <td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                                <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "13px" }}>{item.name || item.itemName}</div>
                                {item.category && (
                                  <span style={{ fontSize: "11px", color: "#888", background: "#f5f5f5", padding: "2px 8px", borderRadius: "20px", display: "inline-block", marginTop: "3px" }}>
                                    {item.category}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "10px 8px", textAlign: "right", color: "#555", verticalAlign: "top" }}>{item.quantity} {item.unit || ""}</td>
                              <td style={{ padding: "10px 8px", textAlign: "right", color: "#555", verticalAlign: "top" }}>{formatINR(item.rate || 0)}</td>
                              <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600, color: "#1a1a2e", verticalAlign: "top" }}>{formatINR(amount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: "16px", background: "#fafafa", borderRadius: "8px", textAlign: "center", color: "#bbb", fontSize: "13px" }}>
                      No items found for this order.
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", padding: "12px 14px", background: BRAND + "10", borderRadius: "8px", border: `1px solid ${BRAND}22` }}>
                    <div style={{ fontSize: "13px", color: BRAND, fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}><Icon name="calculator" /> Order Total</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: BRAND }}>{formatINR(poTotal)}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {orders.length > 0 && (
        <div style={{ marginTop: "16px", background: BRAND, borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.85)", fontSize: "14px", fontWeight: 600 }}>
            <Icon name="report-money" style={{ fontSize: "18px", color: "#fff" }} /> Total Purchase Order Value
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>{formatINR(grandTotal)}</div>
        </div>
      )}
    </div>
  );
};

// ─── PROFIT & LOSS ACCORDION ────────────────────────────────────
const PLAccordion = ({ 
  title, 
  icon, 
  total, 
  count, 
  isOpen, 
  onToggle, 
  children, 
  color 
}) => {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${isOpen ? color + "55" : "#eee"}`,
      borderRadius: "12px",
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          cursor: "pointer",
          userSelect: "none",
          background: isOpen ? color + "06" : "#fff",
          transition: "background 0.18s",
        }}
      >
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: color + "15",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          <Icon name={icon} style={{ color: color, fontSize: "17px" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>
            {title}
          </div>
          <div style={{
            fontSize: "12px",
            color: "#888",
            marginTop: "2px",
          }}>
            {count} {count === 1 ? 'record' : 'records'}
          </div>
        </div>

        <span style={{
          fontSize: "13px",
          fontWeight: 600,
          color: color,
          background: color + "12",
          padding: "4px 12px",
          borderRadius: "20px",
          flexShrink: 0
        }}>
          {formatINR(total)}
        </span>

        <span style={{
          color: "#aaa",
          fontSize: "18px",
          transition: "transform 0.25s",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          flexShrink: 0
        }}>
          ▾
        </span>
      </div>

      <div style={{
        maxHeight: isOpen ? "600px" : "0",
        overflow: "hidden",
        transition: "maxHeight 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "0 16px 16px" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── TAB COMPONENT ─────────────────────────────────────────────
const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div style={{
      display: "flex",
      borderBottom: "2px solid #f0f0f0",
      marginBottom: "24px",
      overflowX: "auto",
      paddingBottom: "0px",
      flexWrap: "nowrap",
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: "10px 10px",
            background: "transparent",
            border: "none",
            outline: "none",
            boxShadow: "none",
            borderRadius: 0,
            borderBottom:
              activeTab === tab.id
                ? `3px solid ${BRAND}`
                : "3px solid transparent",
            color: activeTab === tab.id ? BRAND : "#6c757d",
            fontWeight: activeTab === tab.id ? 700 : 500,
            fontSize: "13px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Icon name={tab.icon} style={{ fontSize: "16px" }} />
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span style={{
              background: activeTab === tab.id ? BRAND : "#e9ecef",
              color: activeTab === tab.id ? "#fff" : "#6c757d",
              padding: "1px 8px",
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: 600,
              marginLeft: "4px"
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────
const SiteDetail = () => {
  const { id } = useParams();
  const history = useHistory();

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editedSite, setEditedSite] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [galleryImages, setGalleryImages] = useState([]);
  const [sitePlanImages, setSitePlanImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [deletingItem, setDeletingItem] = useState(null);

  // Upload title states
  const [galleryTitle, setGalleryTitle] = useState("");
  const [sitePlanTitle, setSitePlanTitle] = useState("");

  // Daily Wages States
  const [dailyWages, setDailyWages] = useState([]);
  const [filteredDailyWages, setFilteredDailyWages] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [wagesLoading, setWagesLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("info");

  const [pdfSidebar, setPdfSidebar] = useState({ open: false, doc: null });
  const [imgSidebar, setImgSidebar] = useState({ open: false, images: [], index: 0, title: "" });

  useEffect(() => { fetchSiteDetails(); }, [id]);
  useEffect(() => { fetchPurchaseOrders(); }, [id]);
  useEffect(() => { fetchDailyWages(); }, [id]);

  const fetchSiteDetails = async () => {
    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem("token");
      const r = await axios.get(`${API_URL}/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (r.data.success) {
        const d = r.data.data;
        setSite(d); 
        setEditedSite(d);
        setGalleryImages(d.galleryImages || []);
        setSitePlanImages(d.sitePlanImages || []);
        setDocuments(d.documents || []);
      }
    } catch (err) { 
      setError(err.response?.data?.message || "Failed to load site details"); 
    }
    finally { setLoading(false); }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/purchase-orders/byProjectId/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.status === 200) {
        setPurchaseOrders(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch purchase orders", err);
    }
  };

  // ─── DAILY WAGES FUNCTIONS ──────────────────────────────────
  const fetchDailyWages = async () => {
    setWagesLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      const startMonth = currentMonth - 2;
      let startYear = currentYear;
      let startMonthNum = startMonth;
      if (startMonth <= 0) {
        startMonthNum = startMonth + 12;
        startYear = currentYear - 1;
      }
      
      const startDate = `${startYear}-${String(startMonthNum).padStart(2, '0')}-01`;
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`;
      
      const attendanceResponse = await axios.get(
        `${API_URL}/attendance/range`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          params: { 
            startDate: startDate, 
            endDate: endDate,
            site: id
          }
        }
      );
      
      if (!attendanceResponse.data.success) {
        throw new Error("Failed to fetch attendance records");
      }
      
      const attendanceRecords = attendanceResponse.data.data || [];
      
      if (attendanceRecords.length === 0) {
        setDailyWages([]);
        setFilteredDailyWages([]);
        setWagesLoading(false);
        showError("No attendance records found for this site in the last 3 months");
        return;
      }
      
      const processedRecords = attendanceRecords.map(record => {
        let employeeName = 'Unknown';
        let employeeId = '';
        let employeeSalary = 0;
        
        if (record.employeeId) {
          if (typeof record.employeeId === 'object') {
            employeeName = record.employeeId.name || 'Unknown';
            employeeId = record.employeeId._id || record.employeeId;
            employeeSalary = record.employeeId.salary || 0;
          } 
          else if (typeof record.employeeId === 'string') {
            employeeId = record.employeeId;
          }
        }
        
        return {
          ...record,
          employeeName: employeeName,
          employeeIdDisplay: employeeId,
          employeeSalary: employeeSalary,
          siteName: record.siteName || record.site?.name || 'Not Assigned'
        };
      });
      
      setDailyWages(processedRecords);
      setFilteredDailyWages(processedRecords);
      
    } catch (err) {
      console.error("Failed to fetch daily wages:", err);
      showError("Failed to fetch daily wages data: " + (err.response?.data?.message || err.message));
      setDailyWages([]);
      setFilteredDailyWages([]);
    } finally {
      setWagesLoading(false);
    }
  };

  const applyWagesFilter = () => {
    let filtered = [...dailyWages];
    
    if (selectedMonth) {
      filtered = filtered.filter(record => {
        const date = new Date(record.date);
        return String(date.getMonth() + 1).padStart(2, '0') === selectedMonth;
      });
    }
    
    if (selectedYear) {
      filtered = filtered.filter(record => {
        const date = new Date(record.date);
        return date.getFullYear() === parseInt(selectedYear);
      });
    }
    
    setFilteredDailyWages(filtered);
  };

  const clearWagesFilter = () => {
    setSelectedMonth("");
    setSelectedYear("");
    setFilteredDailyWages(dailyWages);
  };

  // ─── BUSINESS CALCULATION ──────────────────────────────────
  const calculateBusiness = () => {
    const totalBudget = site?.budget || 0;
    const totalWages = dailyWages.reduce((sum, record) => sum + (record.totalSalary || 0), 0);
    const totalPurchaseOrders = purchaseOrders.reduce((sum, po) => {
      const poTotal = (po.items || []).reduce((s, item) => s + (item.quantity * item.unitPrice || item.amount || 0), 0);
      return sum + poTotal;
    }, 0);
    
    const transportation = [];
    const totalTransportation = transportation.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const otherExpensesItems = [];
    const otherExpenses = otherExpensesItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const totalExpenses = totalWages + totalPurchaseOrders + totalTransportation + otherExpenses;
    const profitLoss = totalBudget - totalExpenses;
    const isProfit = profitLoss >= 0;
    const expensePercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
    const profitPercentage = totalBudget > 0 ? (profitLoss / totalBudget) * 100 : 0;
    
    return {
      totalBudget,
      totalWages,
      totalWageRecords: dailyWages.length,
      purchaseOrders,
      totalPurchaseOrders,
      totalPurchaseOrdersCount: purchaseOrders.length,
      transportation,
      totalTransportation,
      otherExpensesItems,
      otherExpenses,
      totalExpenses,
      profitLoss,
      isProfit,
      expensePercentage,
      profitPercentage,
    };
  };

  const toggleBizSection = (section) => {
    setOpenBizSection(openBizSection === section ? null : section);
  };

  // ─── FILE UPLOAD FUNCTION ──────────────────────────────────
  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    
    const token = localStorage.getItem("token");
    const endpointMap = {
      gallery: `${API_URL}/projects/${id}/upload-gallery`,
      "site-plan": `${API_URL}/projects/${id}/upload-site-plan`,
      document: `${API_URL}/projects/${id}/upload-document`,
    };

    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append(type === "document" ? "document" : "image", file);
      
      if (type === "gallery" && galleryTitle) {
        fd.append("title", galleryTitle);
      }
      if (type === "site-plan" && sitePlanTitle) {
        fd.append("title", sitePlanTitle);
      }
      
      try {
        const r = await axios.post(endpointMap[type], fd, { 
          headers: { 
            "Content-Type": "multipart/form-data",
            ...(token && { Authorization: `Bearer ${token}` })
          } 
        });
        if (r.data.success) {
          successCount++;
          const uploadedData = r.data.data;
          
          if (type === "gallery") {
            setGalleryImages(prev => [...prev, uploadedData]);
          } else if (type === "site-plan") {
            setSitePlanImages(prev => [...prev, uploadedData]);
          } else {
            setDocuments(prev => [...prev, uploadedData]);
          }
        }
      } catch (err) {
        console.error(`Failed to upload ${type}:`, err);
      }
    }
    
    if (successCount > 0) {
      if (type === "gallery") {
        setGalleryTitle("");
      } else if (type === "site-plan") {
        setSitePlanTitle("");
      }
      showSuccess(`${successCount} file(s) uploaded successfully!`);
    }
    
    setUploading(false);
    e.target.value = "";
  };

  // ─── DELETE FUNCTIONS ──────────────────────────────────────
  const handleDeleteImage = async (imageId, type) => {
    if (!window.confirm("Delete this image?")) return;
    setDeletingItem(imageId);
    const token = localStorage.getItem("token");
    const endpoint = type === "gallery"
      ? `${API_URL}/projects/${id}/gallery/${imageId}`
      : `${API_URL}/projects/${id}/siteplan/${imageId}`;
    try {
      await axios.delete(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (type === "gallery") setGalleryImages(prev => prev.filter(i => i._id !== imageId));
      else setSitePlanImages(prev => prev.filter(i => i._id !== imageId));
      showSuccess("Image deleted.");
    } catch { showError("Failed to delete image."); }
    finally { setDeletingItem(null); }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Delete this document?")) return;
    setDeletingItem(documentId);
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/projects/${id}/document/${documentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setDocuments(prev => prev.filter(d => d._id !== documentId));
      if (pdfSidebar.doc?._id === documentId) setPdfSidebar({ open: false, doc: null });
      showSuccess("Document deleted.");
    } catch { showError("Failed to delete document."); }
    finally { setDeletingItem(null); }
  };

  const handleEditSite = async () => {
    const errors = {};
    if (!editedSite.name?.trim()) errors.name = "Site name is required";
    if (!editedSite.location?.trim()) errors.location = "Location is required";
    if (!editedSite.startDate) errors.startDate = "Start date is required";
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setSavingEdit(true);
    const token = localStorage.getItem("token");
    try {
      const r = await axios.put(`${API_URL}/projects/${id}`, editedSite, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (r.data.success) {
        setSite(r.data.data);
        showSuccess("Site updated successfully!");
        setEditModal(false); setFormErrors({});
        await fetchSiteDetails();
      }
    } catch { showError("Failed to update site."); }
    finally { setSavingEdit(false); }
  };

  const showSuccess = (msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(null), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(null), 5000); };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const [y, m, day] = d.split("-");
    return y && m && day ? `${day}-${m}-${y}` : d;
  };

  const getPdfUrl = (doc) => {
    if (doc.url?.startsWith('http')) return doc.url;
    if (doc.url?.startsWith('/uploads')) return `${BASE_URL}${doc.url}`;
    return `${BASE_URL}${doc.url || ''}`;
  };

  const downloadImage = (url, title) => {
    // Fetch the image as blob and download
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const imageUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = title || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(imageUrl);
      })
      .catch(err => {
        // Fallback: direct download
        const link = document.createElement('a');
        link.href = url;
        link.download = title || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  const STATUS_CONFIG = {
    active:    { text: "Active",    bg: "#06c96a" },
    inactive:  { text: "Completed", bg: "#dc3545" },
    onhold:    { text: "On Hold",   bg: "#f59e0b" },
    cancelled: { text: "Cancelled", bg: "#6c757d" },
  };

  // Tab configuration
  const tabs = [
    { id: "info", label: "Info", icon: "info" },
    { id: "gallery", label: "Project Gallery", icon: "image", count: galleryImages.length },
    { id: "plans", label: "Site Plans", icon: "map", count: sitePlanImages.length },
    { id: "documents", label: "Documents", icon: "file", count: documents.length },
    { id: "purchase-orders", label: "Purchase Orders", icon: "shopping-cart", count: purchaseOrders.length },
    { id: "daily-wages", label: "Daily Wages", icon: "users", count: filteredDailyWages.length },
    { id: "business", label: "Business", icon: "trending-up" },
    { id: "quotations", label: "Quotations", icon: "trending-up" },
    { id: "expenses", label: "Expenses", icon: "trending-up" },
  ];

  if (loading) {
    return (
      <Content>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px" }}>
          <Spinner style={{ color: BRAND, width: "36px", height: "36px" }} />
          <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>Loading site details…</p>
        </div>
      </Content>
    );
  }

  if (!site) return null;
  const sc = STATUS_CONFIG[site.status] || STATUS_CONFIG.active;
  const bizData = calculateBusiness();

  return (
    <React.Fragment>
      <Head title="Site Details | Projects" />
      <Content>

        {/* ── Page Header ── */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page tag="h3" className="mt-2">{site.name}</BlockTitle>
              <BlockDes className="text-soft">
                <p>Complete project information and media gallery</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <BrandBtn onClick={() => setEditModal(true)}>
                <Icon name="edit" /> Edit Site
              </BrandBtn>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* ── Alerts ── */}
        {error && (
          <Alert color="danger" className="mb-3 d-flex align-items-center justify-content-between">
            <span>{error}</span><Button close onClick={() => setError(null)} />
          </Alert>
        )}
        {successMessage && (
          <Alert color="success" className="mb-3 d-flex align-items-center justify-content-between">
            <span>{successMessage}</span><Button close onClick={() => setSuccessMessage(null)} />
          </Alert>
        )}

        {/* ── Tabs ── */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Tab Content ── */}
        <Block>
          <div className="card card-bordered" style={{ borderRadius: "12px", overflow: "hidden" }}>
            <div className="card-inner" style={{ padding: "28px" }}>

              {/* ── TAB 1: INFORMATION ── */}
              {activeTab === "info" && (
                <InfoTab site={site} />
              )}

              {/* ── TAB 2: PROJECT GALLERY ── */}
              {activeTab === "gallery" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <h6 style={{ fontWeight: 700, margin: 0, color: "#1a1a2e", fontSize: "15px" }}>Project Gallery</h6>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <Input
                        type="text"
                        placeholder="Image title (optional)"
                        value={galleryTitle}
                        onChange={(e) => setGalleryTitle(e.target.value)}
                        style={{ ...inputStyle, padding: "6px 10px", fontSize: "12px", minWidth: "200px" }}
                      />
                      <UploadBtn id="galleryUpload" label="Upload Images" accept="image/*" uploading={uploading} onChange={(e) => handleFileUpload(e, "gallery")} />
                    </div>
                  </div>
                  {uploading && <div style={{ marginBottom: "10px" }}><Spinner size="sm" style={{ color: BRAND }} /></div>}
                  {galleryImages.length > 0 ? (
                    <Row className="g-3">
                      {galleryImages.map((img, idx) => (
                        <Col md="3" sm="6" key={img._id || idx}>
                          <ImageCard 
                            img={img} 
                            idx={idx} 
                            deletingItem={deletingItem}
                            onView={() => setImgSidebar({ open: true, images: galleryImages, index: idx, title: "Project Gallery" })}
                            onDelete={() => handleDeleteImage(img._id, "gallery")}
                            onDownload={() => downloadImage(img.url, img.title || `gallery-${idx + 1}`)}
                          />
                        </Col>
                      ))}
                    </Row>
                  ) : <EmptyState text="No gallery images uploaded yet." />}
                </>
              )}

              {/* ── TAB 3: SITE PLANS ── */}
              {activeTab === "plans" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <h6 style={{ fontWeight: 700, margin: 0, color: "#1a1a2e", fontSize: "15px" }}>Site Plans</h6>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <Input
                        type="text"
                        placeholder="Plan title (optional)"
                        value={sitePlanTitle}
                        onChange={(e) => setSitePlanTitle(e.target.value)}
                        style={{ ...inputStyle, padding: "6px 10px", fontSize: "12px", minWidth: "200px" }}
                      />
                      <UploadBtn id="planUpload" label="Upload Plans" accept="image/*" uploading={uploading} onChange={(e) => handleFileUpload(e, "site-plan")} />
                    </div>
                  </div>
                  {sitePlanImages.length > 0 ? (
                    <Row className="g-3">
                      {sitePlanImages.map((img, idx) => (
                        <Col md="3" sm="6" key={img._id || idx}>
                          <ImageCard 
                            img={img} 
                            idx={idx} 
                            deletingItem={deletingItem}
                            onView={() => setImgSidebar({ open: true, images: sitePlanImages, index: idx, title: "Site Plans" })}
                            onDelete={() => handleDeleteImage(img._id, "site-plan")}
                            onDownload={() => downloadImage(img.url, img.title || `plan-${idx + 1}`)}
                          />
                        </Col>
                      ))}
                    </Row>
                  ) : <EmptyState text="No site plans uploaded yet." />}
                </>
              )}

              {/* ── TAB 4: PROJECT DOCUMENTS ── */}
              {activeTab === "documents" && (
                <DocumentsTab 
                  documents={documents}
                  uploading={uploading}
                  deletingItem={deletingItem}
                  onUpload={(e) => handleFileUpload(e, "document")}
                  onView={(doc) => setPdfSidebar({ open: true, doc })}
                  onDelete={(docId) => handleDeleteDocument(docId)}
                  getPdfUrl={getPdfUrl}
                />
              )}

              {/* ── TAB 5: PURCHASE ORDERS ── */}
              {activeTab === "purchase-orders" && (
                <PurchaseOrdersTab orders={purchaseOrders} />
              )}

              {/* ── TAB 6: DAILY WAGES ── */}
              {activeTab === "daily-wages" && (
                <DailyWagesTab 
                  wages={filteredDailyWages}
                  loading={wagesLoading}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onMonthChange={setSelectedMonth}
                  onYearChange={setSelectedYear}
                  onFilter={applyWagesFilter}
                  onClear={clearWagesFilter}
                />
              )}

              {/* ── TAB 7: BUSINESS ── */}
              {activeTab === "business" && (
                <>
                  <h6 style={{ fontWeight: 700, margin: "0 0 20px 0", color: "#1a1a2e", fontSize: "15px" }}>
                    Business Overview
                  </h6>
                  
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: "16px", 
                    marginBottom: "24px" 
                  }}>
                    <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "12px", border: "1px solid #e9ecef" }}>
                      <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Total Budget
                      </div>
                      <div style={{ fontSize: "22px", fontWeight: 700, color: BRAND, marginTop: "6px" }}>
                        {formatINR(bizData.totalBudget)}
                      </div>
                    </div>
                    
                    <div style={{ background: "#fff3e0", padding: "20px", borderRadius: "12px", border: "1px solid #ffe0b2" }}>
                      <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Total Expenses
                      </div>
                      <div style={{ fontSize: "22px", fontWeight: 700, color: "#e65100", marginTop: "6px" }}>
                        {formatINR(bizData.totalExpenses)}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                        {bizData.expensePercentage.toFixed(1)}% of budget
                      </div>
                    </div>

                    <div style={{ 
                      background: bizData.isProfit ? "#e8f5e9" : "#ffebee", 
                      padding: "20px", 
                      borderRadius: "12px", 
                      border: `1px solid ${bizData.isProfit ? "#c8e6c9" : "#ffcdd2"}` 
                    }}>
                      <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {bizData.isProfit ? "Net Profit" : "Net Loss"}
                      </div>
                      <div style={{ 
                        fontSize: "24px", 
                        fontWeight: 700, 
                        color: bizData.isProfit ? "#2e7d32" : "#c62828", 
                        marginTop: "6px" 
                      }}>
                        {formatINR(Math.abs(bizData.profitLoss))}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                        {bizData.isProfit ? "✅ Profitable" : "⚠️ Review expenses"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Budget Section */}
                    <PLAccordion 
                      title="Budget"
                      icon="wallet"
                      total={bizData.totalBudget}
                      count={1}
                      isOpen={openBizSection === 'budget'}
                      onToggle={() => toggleBizSection('budget')}
                      color={BRAND}
                    >
                      <div style={{ padding: "12px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                          <span style={{ color: "#555" }}>Total Project Budget</span>
                          <span style={{ fontWeight: 700, color: BRAND, fontSize: "16px" }}>{formatINR(bizData.totalBudget)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", marginTop: "8px" }}>
                          <span style={{ color: "#555" }}>Budget Utilization</span>
                          <span style={{ fontWeight: 600, color: bizData.expensePercentage > 90 ? "#dc3545" : "#f59e0b" }}>
                            {bizData.expensePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ height: "8px", background: "#f0f0f0", borderRadius: "4px", marginTop: "8px", overflow: "hidden" }}>
                          <div style={{ 
                            height: "100%", 
                            width: `${Math.min(bizData.expensePercentage, 100)}%`, 
                            background: bizData.expensePercentage > 90 ? "#dc3545" : bizData.expensePercentage > 70 ? "#f59e0b" : BRAND,
                            borderRadius: "4px",
                            transition: "width 0.5s ease"
                          }} />
                        </div>
                      </div>
                    </PLAccordion>

                    {/* Daily Wages Section */}
                    <PLAccordion 
                      title="Daily Wages"
                      icon="users"
                      total={bizData.totalWages}
                      count={bizData.totalWageRecords}
                      isOpen={openBizSection === 'wages'}
                      onToggle={() => toggleBizSection('wages')}
                      color="#e65100"
                    >
                      {dailyWages.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                              <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                                <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Date</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Employee</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Daily Salary</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Overtime</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Total</th>
                                <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dailyWages.map((record, idx) => {
                                let employeeName = 'Unknown';
                                let employeeId = 'N/A';
                                
                                if (record.employeeId) {
                                  if (typeof record.employeeId === 'object' && record.employeeId.name) {
                                    employeeName = record.employeeId.name;
                                    employeeId = record.employeeId._id || record.employeeId;
                                  } else if (typeof record.employeeId === 'string') {
                                    employeeId = record.employeeId;
                                  }
                                }
                                
                                if (record.employeeName) {
                                  employeeName = record.employeeName;
                                }
                                
                                const empIdStr = typeof employeeId === 'string' ? employeeId : employeeId?.toString() || 'N/A';
                                
                                return (
                                  <tr key={record._id || idx} style={{ borderBottom: idx < dailyWages.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                    <td style={{ padding: "10px 10px", color: "#555" }}>
                                      {record.date ? new Date(record.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "N/A"}
                                    </td>
                                    <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>
                                      {employeeName}
                                      <div style={{ fontSize: "11px", color: "#888" }}>
                                        ID: {empIdStr.substring(0, 8) || "N/A"}
                                      </div>
                                    </td>
                                    <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                                      {formatINR(record.dailySalary || 0)}
                                    </td>
                                    <td style={{ padding: "10px 10px", textAlign: "right", color: "#e65100" }}>
                                      {record.overtimeHours || 0}h
                                      {record.overtimeAmount > 0 && (
                                        <div style={{ fontSize: "11px", color: "#888" }}>
                                          {formatINR(record.overtimeAmount)}
                                        </div>
                                      )}
                                    </td>
                                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#e65100" }}>
                                      {formatINR(record.totalSalary || 0)}
                                    </td>
                                    <td style={{ padding: "10px 10px", textAlign: "center" }}>
                                      <span style={{
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        padding: "2px 10px",
                                        borderRadius: "20px",
                                        background: record.status === "present" ? "#eaf3de" : record.status === "late" ? "#faeeda" : "#fcebeb",
                                        color: record.status === "present" ? "#3b6d11" : record.status === "late" ? "#854f0b" : "#a32d2d",
                                      }}>
                                        {capitalizeFirst(record.status || "Pending")}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState text="No wage records found." />
                      )}
                      <div style={{ 
                        marginTop: "12px", 
                        padding: "12px 14px", 
                        background: "#e6510010", 
                        borderRadius: "8px", 
                        border: "1px solid #e6510022",
                        display: "flex",
                        justifyContent: "space-between"
                      }}>
                        <span style={{ fontSize: "13px", color: "#e65100", fontWeight: 600 }}>Total Wages</span>
                        <span style={{ fontSize: "17px", fontWeight: 700, color: "#e65100" }}>{formatINR(bizData.totalWages)}</span>
                      </div>
                    </PLAccordion>

                    {/* Purchase Orders Section */}
                    <PLAccordion 
                      title="Purchase Orders"
                      icon="shopping-cart"
                      total={bizData.totalPurchaseOrders}
                      count={bizData.totalPurchaseOrdersCount}
                      isOpen={openBizSection === 'purchase-orders'}
                      onToggle={() => toggleBizSection('purchase-orders')}
                      color="#dc3545"
                    >
                      {purchaseOrders.length > 0 ? (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>PO #</th>
                              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Vendor</th>
                              <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Items</th>
                              <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Amount</th>
                              <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {purchaseOrders.map((po, idx) => {
                              const poTotal = (po.items || []).reduce((s, item) => s + (item.quantity * item.unitPrice || item.amount || 0), 0);
                              return (
                                <tr key={po._id || idx} style={{ borderBottom: idx < purchaseOrders.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                  <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>{po.poNumber || po._id}</td>
                                  <td style={{ padding: "10px 10px", color: "#555" }}>{po.vendor || po.supplierName || "N/A"}</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                                    {po.items?.length || 0}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#dc3545" }}>
                                    {formatINR(poTotal)}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "center" }}>
                                    <span style={{
                                      fontSize: "10px",
                                      fontWeight: 600,
                                      padding: "2px 10px",
                                      borderRadius: "20px",
                                      background: po.status === "approved" ? "#eaf3de" : po.status === "pending" ? "#faeeda" : "#fcebeb",
                                      color: po.status === "approved" ? "#3b6d11" : po.status === "pending" ? "#854f0b" : "#a32d2d",
                                    }}>
                                      {po.status || "Pending"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <EmptyState text="No purchase orders found." />
                      )}
                      <div style={{ 
                        marginTop: "12px", 
                        padding: "12px 14px", 
                        background: "#dc354510", 
                        borderRadius: "8px", 
                        border: "1px solid #dc354522",
                        display: "flex",
                        justifyContent: "space-between"
                      }}>
                        <span style={{ fontSize: "13px", color: "#dc3545", fontWeight: 600 }}>Total Purchase Orders</span>
                        <span style={{ fontSize: "17px", fontWeight: 700, color: "#dc3545" }}>{formatINR(bizData.totalPurchaseOrders)}</span>
                      </div>
                    </PLAccordion>

                    {/* Transportation Section */}
                    <PLAccordion 
                      title="Transportation"
                      icon="truck"
                      total={bizData.totalTransportation}
                      count={bizData.transportation.length}
                      isOpen={openBizSection === 'transportation'}
                      onToggle={() => toggleBizSection('transportation')}
                      color="#f59e0b"
                    >
                      {bizData.transportation.length > 0 ? (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Vendor</th>
                              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Vehicle</th>
                              <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Date</th>
                              <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Amount</th>
                              <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bizData.transportation.map((item, idx) => (
                              <tr key={item._id || idx} style={{ borderBottom: idx < bizData.transportation.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>{item.vendorName || "N/A"}</td>
                                <td style={{ padding: "10px 10px", color: "#555" }}>{item.vehicleNumber || item.vehicleType || "N/A"}</td>
                                <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                                  {item.date ? new Date(item.date).toLocaleDateString("en-IN") : "N/A"}
                                </td>
                                <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#f59e0b" }}>
                                  {formatINR(item.amount || 0)}
                                </td>
                                <td style={{ padding: "10px 10px", textAlign: "center" }}>
                                  <span style={{
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    padding: "2px 10px",
                                    borderRadius: "20px",
                                    background: item.status === "paid" ? "#eaf3de" : item.status === "pending" ? "#faeeda" : "#fcebeb",
                                    color: item.status === "paid" ? "#3b6d11" : item.status === "pending" ? "#854f0b" : "#a32d2d",
                                  }}>
                                    {item.status || "Pending"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <EmptyState text="No transportation records found." />
                      )}
                      <div style={{ 
                        marginTop: "12px", 
                        padding: "12px 14px", 
                        background: "#f59e0b10", 
                        borderRadius: "8px", 
                        border: "1px solid #f59e0b22",
                        display: "flex",
                        justifyContent: "space-between"
                      }}>
                        <span style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 600 }}>Total Transportation</span>
                        <span style={{ fontSize: "17px", fontWeight: 700, color: "#f59e0b" }}>{formatINR(bizData.totalTransportation)}</span>
                      </div>
                    </PLAccordion>

                    {/* Other Expenses Section */}
                    <PLAccordion 
                      title="Other Expenses"
                      icon="more-horizontal"
                      total={bizData.otherExpenses}
                      count={bizData.otherExpensesItems.length}
                      isOpen={openBizSection === 'other-expenses'}
                      onToggle={() => toggleBizSection('other-expenses')}
                      color="#6c757d"
                    >
                      {bizData.otherExpensesItems.length > 0 ? (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Category</th>
                              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Description</th>
                              <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bizData.otherExpensesItems.map((item, idx) => (
                              <tr key={item._id || idx} style={{ borderBottom: idx < bizData.otherExpensesItems.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>{item.category || "Misc"}</td>
                                <td style={{ padding: "10px 10px", color: "#555" }}>{item.description || "N/A"}</td>
                                <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#6c757d" }}>
                                  {formatINR(item.amount || 0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <EmptyState text="No other expenses recorded." />
                      )}
                      <div style={{ 
                        marginTop: "12px", 
                        padding: "12px 14px", 
                        background: "#6c757d10", 
                        borderRadius: "8px", 
                        border: "1px solid #6c757d22",
                        display: "flex",
                        justifyContent: "space-between"
                      }}>
                        <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: 600 }}>Total Other Expenses</span>
                        <span style={{ fontSize: "17px", fontWeight: 700, color: "#6c757d" }}>{formatINR(bizData.otherExpenses)}</span>
                      </div>
                    </PLAccordion>

                  </div>

                  {/* Overall Summary */}
                  <div style={{ 
                    marginTop: "24px",
                    background: bizData.isProfit ? BRAND : "#dc3545",
                    borderRadius: "12px",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#fff" }}>
                      <Icon name={bizData.isProfit ? "trending-up" : "trending-down"} style={{ fontSize: "24px" }} />
                      <div>
                        <div style={{ fontSize: "14px", opacity: 0.9, fontWeight: 600 }}>
                          Overall {bizData.isProfit ? "Profit" : "Loss"}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.7 }}>
                          {bizData.isProfit 
                            ? `${bizData.profitPercentage.toFixed(1)}% profit margin` 
                            : `${Math.abs(bizData.profitPercentage).toFixed(1)}% loss`}
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: "28px", 
                      fontWeight: 700, 
                      color: "#fff",
                      background: "rgba(255,255,255,0.15)",
                      padding: "4px 20px",
                      borderRadius: "8px"
                    }}>
                      {formatINR(Math.abs(bizData.profitLoss))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Block>
      </Content>

      {/* ── PDF Sidebar ── */}
      <SidebarViewer isOpen={pdfSidebar.open} onClose={() => setPdfSidebar({ open: false, doc: null })}
        title={pdfSidebar.doc?.originalName || pdfSidebar.doc?.filename || "Document"}>
        {pdfSidebar.doc && (
          <iframe src={getPdfUrl(pdfSidebar.doc)} title={pdfSidebar.doc.originalName}
            style={{ width: "100%", height: "100%", border: "none" }} />
        )}
      </SidebarViewer>

      {/* ── Image Sidebar ── */}
      <ImageSidebar isOpen={imgSidebar.open} onClose={() => setImgSidebar({ ...imgSidebar, open: false })}
        images={imgSidebar.images} startIndex={imgSidebar.index} title={imgSidebar.title} />

      {/* ── Edit Modal ── */}
      <Modal isOpen={editModal} toggle={() => { setEditModal(false); setFormErrors({}); }} size="lg" centered>
        <ModalHeader toggle={() => { setEditModal(false); setFormErrors({}); }} style={{ borderBottom: "none", padding: "24px 28px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", background: BRAND + "18", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="edit" style={{ color: BRAND, fontSize: "18px" }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "17px", color: "#1a1a2e" }}>Edit Project Details</div>
              <div style={{ fontSize: "12px", color: "#aaa", marginTop: "1px" }}>Update project information below</div>
            </div>
          </div>
        </ModalHeader>

        <ModalBody style={{ padding: "16px 28px 28px", maxHeight: "78vh", overflowY: "auto" }}>
          <SectionLabel icon="info" label="Basic Information" />
          <Row>
            <Col md="6">
              <FieldGroup label="Site Name *" error={formErrors.name}>
                <Input type="text" value={editedSite.name || ""} onChange={(e) => setEditedSite({ ...editedSite, name: e.target.value })} invalid={!!formErrors.name} style={inputStyle} />
              </FieldGroup>
            </Col>
            <Col md="6">
              <FieldGroup label="Location *" error={formErrors.location}>
                <Input type="text" value={editedSite.location || ""} onChange={(e) => setEditedSite({ ...editedSite, location: e.target.value })} invalid={!!formErrors.location} style={inputStyle} />
              </FieldGroup>
            </Col>
            <Col md="6">
              <FieldGroup label="Start Date *" error={formErrors.startDate}>
                <Input type="date" value={editedSite.startDate || ""} onChange={(e) => setEditedSite({ ...editedSite, startDate: e.target.value })} invalid={!!formErrors.startDate} style={inputStyle} />
              </FieldGroup>
            </Col>
            <Col md="6">
              <FieldGroup label="Project Value (₹)">
                <Input type="text" value={editedSite.projectValue || ""} onChange={(e) => setEditedSite({ ...editedSite, projectValue: e.target.value })} style={inputStyle} />
              </FieldGroup>
            </Col>
            <Col md="6">
              <FieldGroup label="Budget (₹)">
                <Input type="number" value={editedSite.budget || 0} onChange={(e) => setEditedSite({ ...editedSite, budget: Number(e.target.value) })} style={inputStyle} />
              </FieldGroup>
            </Col>
            <Col md="6">
              <FieldGroup label="Completion (%)">
                <Input type="number" min="0" max="100" value={editedSite.completion || 0} onChange={(e) => setEditedSite({ ...editedSite, completion: Number(e.target.value) })} style={inputStyle} />
              </FieldGroup>
            </Col>
            <Col md="12">
              <FieldGroup label="Description">
                <Input type="textarea" rows="3" value={editedSite.description || ""} onChange={(e) => setEditedSite({ ...editedSite, description: e.target.value })} style={{ ...inputStyle, resize: "none" }} />
              </FieldGroup>
            </Col>
          </Row>

          <SectionLabel icon="image" label="Cover Image" />
          <FieldGroup label="Image URL">
            <Input type="text" value={editedSite.image || ""} onChange={(e) => setEditedSite({ ...editedSite, image: e.target.value })} style={inputStyle} />
            <small style={{ color: "#aaa", fontSize: "11px" }}>Enter image URL or leave as is</small>
          </FieldGroup>
          {editedSite.image && (
            <div style={{ marginBottom: "16px" }}>
              <img src={editedSite.image} alt="preview"
                style={{ height: "80px", borderRadius: "8px", objectFit: "cover", border: "1px solid #eee" }}
                onError={e => e.target.style.display = "none"} />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
            <button
              onClick={() => { setEditModal(false); setFormErrors({}); }}
              style={{ background: "#f5f5f5", color: "#555", border: "1.5px solid #e0e0e0", padding: "9px 22px", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <BrandBtn onClick={handleEditSite} disabled={savingEdit}>
              {savingEdit ? <><Spinner size="sm" /> Saving…</> : <><Icon name="check" /> Save Changes</>}
            </BrandBtn>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

// ─── HELPER COMPONENTS ────────────────────────────────────────
const InfoBox = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "3px" }}>{label}</div>
    <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "15px" }}>{value}</div>
  </div>
);

const UploadBtn = ({ id, label, accept, uploading, onChange }) => (
  <>
    <button
      onClick={() => document.getElementById(id).click()}
      disabled={uploading}
      style={{
        background: BRAND, color: "#fff", border: "none",
        padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
        cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1,
        display: "flex", alignItems: "center", gap: "6px",
      }}
    >
      {uploading ? <Spinner size="sm" style={{ color: "#fff" }} /> : <Icon name="upload" />}
      {uploading ? "Uploading..." : label}
    </button>
    <input id={id} type="file" accept={accept} multiple style={{ display: "none" }} onChange={onChange} disabled={uploading} />
  </>
);

const ImageCard = ({ img, idx, deletingItem, onView, onDelete, onDownload }) => (
  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", cursor: "pointer", background: "#f5f5f5" }} onClick={onView}>
    <img src={img.url} alt={img.title || `img-${idx + 1}`} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
    
    {/* Display title if exists */}
    {img.title && (
      <div style={{ 
        position: "absolute", 
        bottom: "40px", 
        left: "0", 
        right: "0", 
        padding: "6px 10px", 
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
        color: "#fff", 
        fontSize: "11px",
        fontWeight: 500,
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap"
      }}>
        {img.title}
      </div>
    )}
    
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }} />
    
    {/* Action buttons */}
    <div style={{ position: "absolute", top: "7px", right: "7px", display: "flex", gap: "5px" }}>
      <button 
        onClick={(e) => { e.stopPropagation(); onDownload(); }}
        style={{ 
          background: "rgba(75,86,148,0.9)", 
          border: "none", 
          color: "#fff", 
          borderRadius: "6px", 
          padding: "3px 8px", 
          cursor: "pointer", 
          fontSize: "13px" 
        }}
      >
        <Icon name="download" size={12} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }} 
        disabled={deletingItem === img._id}
        style={{ 
          background: "rgba(220,53,69,0.9)", 
          border: "none", 
          color: "#fff", 
          borderRadius: "6px", 
          padding: "3px 8px", 
          cursor: "pointer", 
          fontSize: "13px" 
        }}
      >
        {deletingItem === img._id ? <Spinner size="sm" /> : "✕"}
      </button>
    </div>
    <span style={{ position: "absolute", bottom: "6px", left: "8px", color: "#fff", fontSize: "11px", fontWeight: 500 }}>View</span>
  </div>
);

const EmptyState = ({ text }) => (
  <div style={{ padding: "24px", background: "#fafafa", borderRadius: "10px", border: "1px dashed #ddd", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
    {text}
  </div>
);

export default SiteDetail;