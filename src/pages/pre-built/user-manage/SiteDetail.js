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

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api` || "http://localhost:5000/api";
const BASE_URL = `${process.env.REACT_APP_BACKENDURL}` || "http://localhost:5000";

const BRAND = "#644634";

/* ─── Shared: Brand Button ───────────────────────────── */
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

/* ─── Sidebar Viewer ─────────────────────────────────── */
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

/* ─── Image Gallery Sidebar ──────────────────────────── */
const ImageSidebar = ({ isOpen, onClose, images, startIndex = 0, title }) => {
  const [current, setCurrent] = useState(startIndex);
  useEffect(() => { if (isOpen) setCurrent(startIndex); }, [isOpen, startIndex]);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);
  const img = images[current];
  return (
    <SidebarViewer isOpen={isOpen} onClose={onClose} title={title || `Image ${current + 1} of ${images.length}`}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#111" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
          {img && <img src={img.url} alt={`View ${current + 1}`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
          {images.length > 1 && (
            <>
              <button onClick={prev} style={navBtnStyle("left")}>‹</button>
              <button onClick={next} style={navBtnStyle("right")}>›</button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div style={{ display: "flex", gap: "8px", padding: "12px 16px", overflowX: "auto", background: "#1a1a1a", flexShrink: 0 }}>
            {images.map((im, idx) => (
              <img key={im._id || idx} src={im.url} alt={`Thumb ${idx + 1}`} onClick={() => setCurrent(idx)}
                style={{ width: "60px", height: "45px", objectFit: "cover", borderRadius: "5px", cursor: "pointer", flexShrink: 0, transition: "opacity 0.2s", border: idx === current ? "2px solid #fff" : "2px solid transparent", opacity: idx === current ? 1 : 0.55 }}
              />
            ))}
          </div>
        )}
        <div style={{ textAlign: "center", padding: "8px", color: "#aaa", fontSize: "13px", background: "#111", flexShrink: 0 }}>
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

/* ─── Modal helpers ──────────────────────────────────── */
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

const staffPillStyle = {
  display: "inline-flex", alignItems: "center",
  background: BRAND + "15", color: BRAND,
  border: `1px solid ${BRAND}33`,
  padding: "4px 12px", borderRadius: "20px",
  fontSize: "12px", fontWeight: 600,
};

/* ─── Document Card ──────────────────────────────────── */
const DocumentCard = ({ doc, isActive, deletingItem, onView, onDelete }) => {
  const sizeKB = doc.size ? (doc.size / 1024).toFixed(1) : "—";
  const dateStr = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${isActive ? BRAND + "55" : "#eee"}`,
      borderRadius: "12px",
      padding: "16px 14px 12px",
      display: "flex", flexDirection: "column", gap: "10px",
      transition: "border-color 0.18s, box-shadow 0.18s",
      boxShadow: isActive ? `0 0 0 3px ${BRAND}18` : "none",
    }}>
      {/* Icon */}
      <div style={{ width: "44px", height: "44px", background: "#fdecea", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="file-pdf" style={{ color: "#dc3545", fontSize: "22px" }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {doc.originalName || doc.filename}
        </div>
        <div style={{ fontSize: "11px", color: "#999", marginTop: "3px" }}>
          {sizeKB} KB {dateStr && <>· {dateStr}</>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
        <button
          onClick={onView}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
            padding: "7px 10px", borderRadius: "8px",
            border: `1px solid ${BRAND}`, background: BRAND + "12", color: BRAND,
            fontSize: "12px", fontWeight: 600, cursor: "pointer",
          }}
        >
          <Icon name="eye" /> View
        </button>
        <button
          onClick={onDelete}
          disabled={deletingItem === doc._id}
          style={{
            width: "36px", display: "flex", alignItems: "center", justifyContent: "center",
            padding: "7px", borderRadius: "8px",
            border: "1px solid #dc3545", background: "#fef2f2", color: "#dc3545",
            fontSize: "14px", cursor: deletingItem === doc._id ? "not-allowed" : "pointer",
            opacity: deletingItem === doc._id ? 0.6 : 1,
          }}
        >
          {deletingItem === doc._id ? <Spinner size="sm" /> : <Icon name="trash" />}
        </button>
      </div>
    </div>
  );
};

/* ─── Purchase Order Accordion ───────────────────────── */
const STATUS_BADGE = {
  approved: { bg: "#eaf3de", color: "#3b6d11", label: "Approved" },
  pending:  { bg: "#faeeda", color: "#854f0b", label: "Pending"  },
  rejected: { bg: "#fcebeb", color: "#a32d2d", label: "Rejected" },
};

const POAccordion = ({ orders }) => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const grandTotal = orders.reduce((sum, po) => {
    const poTotal = (po.items || []).reduce((s, item) => s + (item.quantity * item.unitPrice || item.amount || 0), 0);
    return sum + poTotal;
  }, 0);

  const formatINR = (val) =>
    "₹" + Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 });

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
              {/* Header */}
              <div
                onClick={() => toggle(po._id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", cursor: "pointer", userSelect: "none",
                  background: isOpen ? BRAND + "06" : "#fff",
                  transition: "background 0.18s",
                }}
              >
                {/* PO Icon */}
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: BRAND + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="file-text" style={{ color: BRAND, fontSize: "17px" }} />
                </div>

                {/* PO Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>{po.poNumber || po._id}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {po.vendor || po.supplierName || "Vendor"}
                  </div>
                </div>

                {/* Status Badge */}
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 10px",
                  borderRadius: "20px", background: badge.bg, color: badge.color,
                  flexShrink: 0,
                }}>
                  {badge.label}
                </span>

                {/* Total Pill */}
                <span style={{
                  fontSize: "13px", fontWeight: 600, color: BRAND,
                  background: BRAND + "12", padding: "4px 12px", borderRadius: "20px",
                  flexShrink: 0,
                }}>
                  {formatINR(poTotal)}
                </span>

                {/* Chevron */}
                <span style={{
                  color: "#aaa", fontSize: "18px", transition: "transform 0.25s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0,
                }}>
                  ▾
                </span>
              </div>

              {/* Body */}
              <div style={{
                maxHeight: isOpen ? "600px" : "0",
                overflow: "hidden",
                transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <div style={{ padding: "0 16px 16px" }}>
                  {/* Items Table */}
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
                            <th key={h} style={{
                              padding: "6px 8px 10px", fontSize: "11px", fontWeight: 600,
                              color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px",
                              textAlign: i > 0 ? "right" : "left",
                            }}>{h}</th>
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
                              <td style={{ padding: "10px 8px", textAlign: "right", color: "#555", verticalAlign: "top" }}>
                                {item.quantity} {item.unit || ""}
                              </td>
                              <td style={{ padding: "10px 8px", textAlign: "right", color: "#555", verticalAlign: "top" }}>
                                {formatINR(item.rate || 0)}
                              </td>
                              <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600, color: "#1a1a2e", verticalAlign: "top" }}>
                                {formatINR(amount)}
                              </td>
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

                  {/* Order Total Bar */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginTop: "12px", padding: "12px 14px",
                    background: BRAND + "10", borderRadius: "8px",
                    border: `1px solid ${BRAND}22`,
                  }}>
                    <div style={{ fontSize: "13px", color: BRAND, fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="calculator" style={{ fontSize: "14px" }} /> Order Total
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: BRAND }}>
                      {formatINR(poTotal)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Total */}
      {orders.length > 0 && (
        <div style={{
          marginTop: "16px", background: BRAND,
          borderRadius: "12px", padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.85)", fontSize: "14px", fontWeight: 600 }}>
            <Icon name="report-money" style={{ fontSize: "18px", color: "#fff" }} />
            Total Purchase Order Value
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
            {formatINR(grandTotal)}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────── */
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
  const [staffInput, setStaffInput] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [galleryImages, setGalleryImages] = useState([]);
  const [sitePlanImages, setSitePlanImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [deletingItem, setDeletingItem] = useState(null);

  const [pdfSidebar, setPdfSidebar] = useState({ open: false, doc: null });
  const [imgSidebar, setImgSidebar] = useState({ open: false, images: [], index: 0, title: "" });

  useEffect(() => { fetchSiteDetails(); }, [id]);
  useEffect(() => { fetchPurchaseOrders(); }, [id]);

  const fetchSiteDetails = async () => {
    try {
      setLoading(true); setError(null);
      const r = await axios.get(`${API_URL}/projects/${id}`);
      if (r.data.success) {
        const d = r.data.data;
        setSite(d); setEditedSite(d);
        setGalleryImages(d.galleryImages || []);
        setSitePlanImages(d.sitePlanImages || []);
        setDocuments(d.documents || []);
      }
    } catch (err) { setError(err.response?.data?.message || "Failed to load site details"); }
    finally { setLoading(false); }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/purchase-orders/byProjectId/${id}`);
      if (response.status === 200) {
        setPurchaseOrders(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch purchase orders", err);
    }
  };

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const endpointMap = {
      gallery: `${API_URL}/projects/${id}/upload-gallery`,
      "site-plan": `${API_URL}/projects/${id}/upload-site-plan`,
      document: `${API_URL}/projects/${id}/upload-document`,
    };
    for (const file of files) {
      const fd = new FormData();
      fd.append(type === "document" ? "document" : "image", file);
      try {
        const r = await axios.post(endpointMap[type], fd, { headers: { "Content-Type": "multipart/form-data" } });
        if (r.data.success) {
          if (type === "gallery") setGalleryImages(p => [...p, r.data.data]);
          else if (type === "site-plan") setSitePlanImages(p => [...p, r.data.data]);
          else setDocuments(p => [...p, r.data.data]);
          showSuccess(`${type.replace("-", " ")} uploaded successfully!`);
        }
      } catch { showError(`Failed to upload ${type}.`); }
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDeleteImage = async (imageId, type) => {
    if (!window.confirm("Delete this image?")) return;
    setDeletingItem(imageId);
    const endpoint = type === "gallery"
      ? `${API_URL}/projects/${id}/gallery/${imageId}`
      : `${API_URL}/projects/${id}/siteplan/${imageId}`;
    try {
      await axios.delete(endpoint);
      if (type === "gallery") setGalleryImages(p => p.filter(i => i._id !== imageId));
      else setSitePlanImages(p => p.filter(i => i._id !== imageId));
      showSuccess("Image deleted.");
    } catch { showError("Failed to delete image."); }
    finally { setDeletingItem(null); }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Delete this document?")) return;
    setDeletingItem(documentId);
    try {
      await axios.delete(`${API_URL}/projects/${id}/document/${documentId}`);
      setDocuments(p => p.filter(d => d._id !== documentId));
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
    try {
      const r = await axios.put(`${API_URL}/projects/${id}`, editedSite);
      if (r.data.success) {
        setSite(r.data.data);
        showSuccess("Site updated successfully!");
        setEditModal(false); setFormErrors({});
        await fetchSiteDetails();
      }
    } catch { showError("Failed to update site."); }
    finally { setSavingEdit(false); }
  };

  const handleAddStaff = () => {
    const name = staffInput.trim();
    if (name && !editedSite.staffAssigned?.includes(name)) {
      setEditedSite({ ...editedSite, staffAssigned: [...(editedSite.staffAssigned || []), name] });
      setStaffInput("");
    }
  };

  const handleRemoveStaff = (s) =>
    setEditedSite({ ...editedSite, staffAssigned: editedSite.staffAssigned?.filter(x => x !== s) || [] });

  const showSuccess = (msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(null), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(null), 5000); };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const [y, m, day] = d.split("-");
    return y && m && day ? `${day}-${m}-${y}` : d;
  };

  const getPdfUrl = (doc) => `${BASE_URL}${doc.url}`;

  const STATUS_CONFIG = {
    active:    { text: "Active",    bg: "#06c96a" },
    inactive:  { text: "Completed", bg: "#dc3545" },
    onhold:    { text: "On Hold",   bg: "#f59e0b" },
    cancelled: { text: "Cancelled", bg: "#6c757d" },
  };

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

  return (
    <React.Fragment>
      <Head title="Site Details | Projects" />
      <Content>

        {/* ── Page Header ── */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BrandBtn outline onClick={() => history.push("/SiteManagement")} size="sm" style={{ marginBottom: "8px" }}>
                <Icon name="arrow-left" /> Back
              </BrandBtn>
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

        {/* ── Main Card ── */}
        <Block>
          <div className="card card-bordered" style={{ borderRadius: "12px", overflow: "hidden" }}>
            <div className="card-inner" style={{ padding: "28px" }}>

              {/* ── Hero ── */}
              <Row className="g-4 mb-2">
                <Col lg="5">
                  <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
                    <img src={site.image} alt={site.name}
                      style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop"; }}
                    />
                    <span style={{
                      position: "absolute", top: "14px", right: "14px",
                      background: sc.bg + "22", color: sc.bg,
                      border: `1px solid ${sc.bg}55`,
                      padding: "4px 14px", borderRadius: "20px",
                      fontSize: "12px", fontWeight: 700, letterSpacing: "0.3px",
                    }}>{sc.text}</span>
                  </div>
                </Col>
                <Col lg="7">
                  <div style={{ paddingLeft: "8px" }}>
                    <h4 style={{ fontWeight: 700, marginBottom: "6px" }}>{site.name}</h4>
                    <p className="text-muted mb-1"><Icon name="map-pin" className="me-1" />{site.location}</p>
                    <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                      <Icon name="hash" className="me-1" />Project ID: {site.projectId}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: "16px" }}>
                      <InfoBox label="Start Date" value={formatDate(site.startDate)} />
                      <InfoBox label="Project Value" value={site.projectValue || "N/A"} />
                      {site.budget > 0 && <InfoBox label="Budget" value={`₹${site.budget.toLocaleString()}`} />}
                    </div>
                    {site.description && (
                      <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "12px 14px" }}>
                        <p style={{ margin: 0, fontSize: "14px", color: "#555", lineHeight: 1.6 }}>{site.description}</p>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              {/* ── Staff ── */}
              <SectionDivider title="Assigned Staff" />
              <div className="d-flex flex-wrap gap-2">
                {site.staffAssigned?.length
                  ? site.staffAssigned.map((s, i) => <span key={i} style={staffPillStyle}>{s}</span>)
                  : <p className="text-muted mb-0">No staff assigned yet.</p>}
              </div>

              {/* ── Progress ── */}
              {site.status === "active" && site.completion !== undefined && (
                <>
                  <SectionDivider title="Project Completion" />
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Progress</span>
                    <strong style={{ color: BRAND }}>{site.completion}%</strong>
                  </div>
                  <div style={{ height: "8px", background: "#f0ece9", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${site.completion}%`, background: `linear-gradient(90deg, ${BRAND}, #a0674a)`, borderRadius: "10px" }} />
                  </div>
                </>
              )}

              {/* ── Gallery ── */}
              <SectionDivider title="Project Gallery">
                <UploadBtn id="galleryUpload" label="Upload Images" accept="image/*" uploading={uploading} onChange={(e) => handleFileUpload(e, "gallery")} />
              </SectionDivider>
              {uploading && <div style={{ marginBottom: "10px" }}><Spinner size="sm" style={{ color: BRAND }} /></div>}
              {galleryImages.length > 0 ? (
                <Row className="g-3">
                  {galleryImages.map((img, idx) => (
                    <Col md="3" sm="6" key={img._id || idx}>
                      <ImageCard img={img} idx={idx} deletingItem={deletingItem}
                        onView={() => setImgSidebar({ open: true, images: galleryImages, index: idx, title: "Project Gallery" })}
                        onDelete={() => handleDeleteImage(img._id, "gallery")}
                      />
                    </Col>
                  ))}
                </Row>
              ) : <EmptyState text="No gallery images uploaded yet." />}

              {/* ── Site Plans ── */}
              <SectionDivider title="Site Plans">
                <UploadBtn id="planUpload" label="Upload Plans" accept="image/*" uploading={uploading} onChange={(e) => handleFileUpload(e, "site-plan")} />
              </SectionDivider>
              {sitePlanImages.length > 0 ? (
                <Row className="g-3">
                  {sitePlanImages.map((img, idx) => (
                    <Col md="3" sm="6" key={img._id || idx}>
                      <ImageCard img={img} idx={idx} deletingItem={deletingItem}
                        onView={() => setImgSidebar({ open: true, images: sitePlanImages, index: idx, title: "Site Plans" })}
                        onDelete={() => handleDeleteImage(img._id, "site-plan")}
                      />
                    </Col>
                  ))}
                </Row>
              ) : <EmptyState text="No site plans uploaded yet." />}

              {/* ── Documents — Card Grid ── */}
              <SectionDivider title="Project Documents">
                <UploadBtn id="docUpload" label="Upload PDFs" accept=".pdf" uploading={uploading} onChange={(e) => handleFileUpload(e, "document")} />
              </SectionDivider>

              {documents.length > 0 ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "14px",
                }}>
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      doc={doc}
                      isActive={pdfSidebar.doc?._id === doc._id}
                      deletingItem={deletingItem}
                      onView={() => setPdfSidebar({ open: true, doc })}
                      onDelete={() => handleDeleteDocument(doc._id)}
                    />
                  ))}
                </div>
              ) : <EmptyState text="No documents uploaded yet." />}

              {/* ── Purchase Orders — Accordion ── */}
              <SectionDivider title="Purchase Orders" />

              {purchaseOrders.length > 0 ? (
                <POAccordion orders={purchaseOrders} />
              ) : (
                <EmptyState text="No purchase orders found for this project." />
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

          <SectionLabel icon="users" label="Assign Staff" />
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <Input type="text" placeholder="Enter staff name, press Enter or Add"
              value={staffInput} onChange={(e) => setStaffInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddStaff()}
              style={inputStyle}
            />
            <BrandBtn outline onClick={handleAddStaff} style={{ flexShrink: 0 }}>+ Add</BrandBtn>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "32px", marginBottom: "4px" }}>
            {editedSite.staffAssigned?.map((s, i) => (
              <span key={i} style={{ ...staffPillStyle, cursor: "pointer" }} onClick={() => handleRemoveStaff(s)}>
                {s} <span style={{ marginLeft: "5px", opacity: 0.6, fontWeight: 400 }}>×</span>
              </span>
            ))}
            {!editedSite.staffAssigned?.length && (
              <span style={{ fontSize: "12px", color: "#bbb", alignSelf: "center" }}>No staff added yet</span>
            )}
          </div>

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

/* ─── Helper components ──────────────────────────────── */
const InfoBox = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "3px" }}>{label}</div>
    <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "15px" }}>{value}</div>
  </div>
);

const SectionDivider = ({ title, children }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "32px 0 16px" }}>
    <h6 style={{ fontWeight: 700, margin: 0, color: "#1a1a2e", fontSize: "15px", letterSpacing: "0.2px" }}>{title}</h6>
    {children}
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
      {label}
    </button>
    <input id={id} type="file" accept={accept} multiple style={{ display: "none" }} onChange={onChange} disabled={uploading} />
  </>
);

const ImageCard = ({ img, idx, deletingItem, onView, onDelete }) => (
  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", cursor: "pointer" }} onClick={onView}>
    <img src={img.url} alt={`img-${idx + 1}`} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }} />
    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} disabled={deletingItem === img._id}
      style={{ position: "absolute", top: "7px", right: "7px", background: "rgba(220,53,69,0.9)", border: "none", color: "#fff", borderRadius: "6px", padding: "3px 8px", cursor: "pointer", fontSize: "13px" }}>
      {deletingItem === img._id ? <Spinner size="sm" /> : "✕"}
    </button>
    <span style={{ position: "absolute", bottom: "6px", left: "8px", color: "#fff", fontSize: "11px", fontWeight: 500 }}>View</span>
  </div>
);

const EmptyState = ({ text }) => (
  <div style={{ padding: "24px", background: "#fafafa", borderRadius: "10px", border: "1px dashed #ddd", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
    {text}
  </div>
);

export default SiteDetail;
