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
          } else if (typeof record.employeeId === 'string') {
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

  // ─── FILE UPLOAD FUNCTION WITH TITLE SUPPORT ──────────────────
  const handleFileUpload = async (e, type, title = "") => {
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
    for (const file of files) {
      const fd = new FormData();
      fd.append(type === "document" ? "document" : "image", file);
      
      // Add title for gallery and site-plan
      if ((type === "gallery" || type === "site-plan") && title) {
        fd.append("title", title);
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
      showSuccess(`${successCount} file(s) uploaded successfully!`);
    }
    setUploading(false);
    e.target.value = "";
  };

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
                <GalleryTab 
                  images={galleryImages}
                  uploading={uploading}
                  deletingItem={deletingItem}
                  onUpload={(e, title) => handleFileUpload(e, "gallery", title)}
                  onView={(index) => setImgSidebar({ open: true, images: galleryImages, index, title: "Project Gallery" })}
                  onDelete={(imageId) => handleDeleteImage(imageId, "gallery")}
                />
              )}

              {/* ── TAB 3: SITE PLANS ── */}
              {activeTab === "plans" && (
                <PlansTab 
                  images={sitePlanImages}
                  uploading={uploading}
                  deletingItem={deletingItem}
                  onUpload={(e, title) => handleFileUpload(e, "site-plan", title)}
                  onView={(index) => setImgSidebar({ open: true, images: sitePlanImages, index, title: "Site Plans" })}
                  onDelete={(imageId) => handleDeleteImage(imageId, "site-plan")}
                />
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
             {/* ── TAB 6: DAILY WAGES ── */}
{activeTab === "daily-wages" && (
  <DailyWagesTab 
    projectId={id}
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
  <BusinessTab 
    projectId={id}
  />
)}
              {activeTab === "quotations" && (
                <QuotationsTab />
              )}
              {activeTab === "expenses" && (
                <ExpensesTab />
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

export default SiteDetail;