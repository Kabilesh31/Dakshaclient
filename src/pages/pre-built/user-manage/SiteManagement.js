// SiteManagement.js (Fixed version)
import React, { useState, useEffect } from "react";
import Head from "../../../layout/head/Head";
import Content from "../../../layout/content/Content";
import { useHistory } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  Input,
  FormGroup,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
  Alert,
} from "reactstrap";

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api`;

const BRAND = "#4B5694";
const BRAND_DARK = "#4e3427";

/* ── helpers ── */
const formatDateToDDMMYYYY = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return y && m && day ? `${day}-${m}-${y}` : d;
};

const convertToYYYYMMDD = (d) => {
  if (!d) return "";
  if (d.match(/^\d{4}-\d{2}-\d{2}$/)) return d;
  const [day, m, y] = d.split("-");
  return day && m && y ? `${y}-${m}-${day}` : "";
};

const formatDate = (d) => {
  if (!d) return "N/A";
  const [y, m, day] = d.split("-");
  return y && m && day ? `${day}-${m}-${y}` : d;
};

const STATUS_CONFIG = {
  active:    { text: "Active",    bg: "#06c96a", dot: "#04a355" },
  inactive:  { text: "Completed", bg: "#dc3545", dot: "#b02a37" },
  onhold:    { text: "On Hold",   bg: "#f59e0b", dot: "#d97706" },
  cancelled: { text: "Cancelled", bg: "#6c757d", dot: "#565e64" },
};

/* ── Brand button ── */
const BrandBtn = ({ children, onClick, disabled, size = "md", outline = false, style = {} }) => {
  const pad = size === "sm" ? "5px 14px" : size === "lg" ? "10px 28px" : "7px 20px";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: outline ? "transparent" : BRAND,
        color: outline ? BRAND : "#fff",
        border: `1.5px solid ${BRAND}`,
        padding: pad,
        borderRadius: "8px",
        fontWeight: 600,
        fontSize: "13px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "background 0.18s, color 0.18s",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const sc = STATUS_CONFIG[status] || { text: status || "Active", bg: "#6c757d" };
  return (
    <span style={{
      background: sc.bg + "22",
      color: sc.bg,
      border: `1px solid ${sc.bg}55`,
      padding: "3px 11px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.3px",
      whiteSpace: "nowrap",
    }}>
      {sc.text}
    </span>
  );
};

/* ── Site Card ── */
const SiteCard = ({ site, onView, onDelete, deleting }) => (
  <div style={{
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #e8e8e8",
    background: "#fff",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    transition: "box-shadow 0.2s, transform 0.2s",
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(100,70,52,0.13)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
  >
    {/* Image */}
    <div style={{ position: "relative", height: "148px", flexShrink: 0 }}>
      <img
        src={site.image}
        alt={site.name}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={e => { e.target.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop"; }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)",
      }} />
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <StatusBadge status={site.status} />
      </div>
    </div>

    {/* Body */}
    <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
      <h6 style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#1a1a2e", lineHeight: 1.3 }}>{site.name}</h6>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "2px" }}>
        <MetaRow icon="map-pin" text={site.location} />
        <MetaRow icon="calendar" text={formatDate(site.startDate)} />
        <MetaRow icon="users" text={`${site.staffAssigned?.length || 0} staff assigned`} />
        {site.projectValue && <MetaRow icon="trend-up" text={site.projectValue} />}
      </div>

      {site.completion > 0 && site.status === "active" && (
        <div style={{ marginTop: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888", marginBottom: "4px" }}>
            <span>Completion</span><span style={{ fontWeight: 700, color: BRAND }}>{site.completion}%</span>
          </div>
          <div style={{ height: "5px", background: "#f0ece9", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${site.completion}%`, background: `linear-gradient(90deg, ${BRAND}, #a0674a)`, borderRadius: "10px" }} />
          </div>
        </div>
      )}
    </div>

    {/* Footer */}
    <div style={{ padding: "0 16px 16px", display: "flex", gap: "8px" }}>
      <BrandBtn onClick={() => onView(site)} style={{ flex: 1, justifyContent: "center" }}>
        View Details
      </BrandBtn>
      <button
        onClick={() => onDelete(site._id, site.name)}
        disabled={deleting === site._id}
        style={{
          background: "#fff0f0", color: "#dc3545", border: "1.5px solid #f5c6cb",
          padding: "7px 13px", borderRadius: "8px", cursor: "pointer",
          display: "inline-flex", alignItems: "center", fontSize: "14px",
          transition: "background 0.18s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#fde8e8"}
        onMouseLeave={e => e.currentTarget.style.background = "#fff0f0"}
      >
        {deleting === site._id ? <Spinner size="sm" /> : <Icon name="trash" />}
      </button>
    </div>
  </div>
);

const MetaRow = ({ icon, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
    <Icon name={icon} style={{ fontSize: "12px", color: "#aaa", flexShrink: 0 }} />
    <span style={{ fontSize: "12px", color: "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
  </div>
);

/* ── Add Site Modal – with Date Picker, Image Upload ── */
const EMPTY_SITE = { 
  name: "", 
  location: "", 
  startDate: "", 
  staffAssigned: [], 
  description: "", 
  projectValue: "", 
  image: null, // Changed from "" to null to track if image is selected
  imagePreview: "", // Separate state for preview
  completion: 0, 
  budget: 0 
};

const AddSiteModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState(EMPTY_SITE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Store the actual file

  const reset = () => { 
    setForm(EMPTY_SITE); 
    setErrors({}); 
    setImagePreview("");
    setImageFile(null);
    setSelectedDate(null);
  };

  const close = () => { reset(); onClose(); };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const yyyymmdd = `${year}-${month}-${day}`;
      set("startDate", yyyymmdd);
    } else {
      set("startDate", "");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Store the file for later upload
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Set image in form to trigger validation if needed
    set("image", file.name);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Site name is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.startDate) e.startDate = "Start date is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    
    try {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('location', form.location.trim());
      formData.append('description', form.description || "");
      formData.append('startDate', form.startDate);
      formData.append('projectValue', form.projectValue || "");
      formData.append('completion', form.completion || 0);
      formData.append('budget', form.budget || 0);
      formData.append('staffAssigned', JSON.stringify([]));
      
      // Append image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/projects`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (response.data.success) {
        await onAdd(response.data.data);
        close();
        // Show success message in parent component
        window.dispatchEvent(new CustomEvent('projectAdded', { detail: { message: 'Project added successfully!' } }));
      } else {
        throw new Error(response.data.message || "Failed to add project");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert(error.response?.data?.message || "Failed to add project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const CustomDateInput = ({ value, onClick }) => (
    <div style={{ position: "relative", width: "100%" }}>
      <Input
        value={value}
        onClick={onClick}
        readOnly
        placeholder="Select Date"
        style={{ ...inputStyle, cursor: "pointer", backgroundColor: "#fff" }}
      />
      <Icon 
        name="calendar" 
        style={{ 
          position: "absolute", 
          right: "12px", 
          top: "50%", 
          transform: "translateY(-50%)",
          color: "#aaa",
          fontSize: "14px",
          pointerEvents: "none"
        }} 
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} toggle={close} size="lg" centered>
      <ModalHeader
        toggle={close}
        style={{ borderBottom: "none", padding: "24px 28px 0" }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: "17px", color: "#1a1a2e" }}>Add New Project Site</div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Fill in the project details below</div>
        </div>
      </ModalHeader>

      <ModalBody style={{ padding: "20px 28px 28px", maxHeight: "78vh", overflowY: "auto" }}>

        {/* ── Section: Basic Info ── */}
        <SectionLabel icon="info" label="Basic Information" />
        <Row>
          <Col md="6">
            <FieldGroup label="Site Name *" error={errors.name}>
              <Input 
                placeholder="e.g. Block B Tower" 
                value={form.name} 
                onChange={e => set("name", e.target.value)} 
                invalid={!!errors.name} 
                style={inputStyle} 
              />
            </FieldGroup>
          </Col>
          <Col md="6">
            <FieldGroup label="Location *" error={errors.location}>
              <Input 
                placeholder="City, State" 
                value={form.location} 
                onChange={e => set("location", e.target.value)} 
                invalid={!!errors.location} 
                style={inputStyle} 
              />
            </FieldGroup>
          </Col>
          <Col md="6">
            <FieldGroup label="Start Date *" error={errors.startDate}>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd-MM-yyyy"
                placeholderText="DD-MM-YYYY"
                customInput={<CustomDateInput />}
                wrapperClassName="w-100"
                popperPlacement="bottom-start"
              />
              <small style={{ color: "#aaa", fontSize: "11px", display: "block", marginTop: "4px" }}>
                Select date in DD-MM-YYYY format
              </small>
            </FieldGroup>
          </Col>
          <Col md="6">
            <FieldGroup label="Project Value (₹)">
              <Input 
                placeholder="e.g. ₹15 Crore" 
                value={form.projectValue} 
                onChange={e => set("projectValue", e.target.value)} 
                style={inputStyle} 
              />
            </FieldGroup>
          </Col>
          <Col md="6">
            <FieldGroup label="Budget (₹)">
              <Input 
                type="number" 
                placeholder="Numeric amount" 
                value={form.budget || ""} 
                onChange={e => set("budget", Number(e.target.value))} 
                style={inputStyle} 
              />
            </FieldGroup>
          </Col>
          <Col md="6">
            <FieldGroup label="Completion (%)">
              <Input 
                type="number" 
                min="0" 
                max="100" 
                placeholder="0–100" 
                value={form.completion || ""} 
                onChange={e => set("completion", Number(e.target.value))} 
                style={inputStyle} 
              />
            </FieldGroup>
          </Col>
          <Col md="12">
            <FieldGroup label="Description">
              <Input 
                type="textarea" 
                rows="3" 
                placeholder="Brief description of the project…" 
                value={form.description} 
                onChange={e => set("description", e.target.value)} 
                style={{ ...inputStyle, resize: "none" }} 
              />
            </FieldGroup>
          </Col>
        </Row>

        {/* ── Section: Cover Image Upload ── */}
        <SectionLabel icon="image" label="Cover Image" />
        <FieldGroup label="Upload Image (JPG, PNG, GIF up to 5MB)">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <label style={{
              background: BRAND + "10",
              border: `1.5px dashed ${BRAND}40`,
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: BRAND,
              fontWeight: 500,
            }}>
              <Icon name="upload" />
              {uploadingImage ? "Uploading..." : imageFile ? "Change Image" : "Choose Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploadingImage || submitting}
                style={{ display: "none" }}
              />
            </label>
            {uploadingImage && <Spinner size="sm" style={{ color: BRAND }} />}
            {imageFile && (
              <span style={{ fontSize: "12px", color: "#888" }}>
                {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
              </span>
            )}
          </div>
          <small style={{ color: "#aaa", fontSize: "11px", display: "block", marginTop: "6px" }}>
            Upload a project cover image (will be stored in Cloudinary)
          </small>
        </FieldGroup>
        
        {imagePreview && (
          <div style={{ marginBottom: "16px" }}>
            <img 
              src={imagePreview} 
              alt="preview" 
              style={{ 
                height: "90px", 
                borderRadius: "8px", 
                objectFit: "cover", 
                border: "1px solid #eee",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }} 
            />
          </div>
        )}
      </ModalBody>

      {/* ── Footer ── */}
      <div style={{
        display: "flex", justifyContent: "flex-end", gap: "10px",
        padding: "20px 28px 28px",
        borderTop: "1px solid #f0f0f0",
      }}>
        <button
          onClick={close}
          disabled={submitting}
          style={{
            background: "#f5f5f5", color: "#555", border: "1.5px solid #e0e0e0",
            padding: "9px 22px", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
        <BrandBtn onClick={submit} disabled={submitting || uploadingImage} size="md">
          {submitting ? <><Spinner size="sm" /> Adding…</> : <><Icon name="plus" /> Add Site</>}
        </BrandBtn>
      </div>
    </Modal>
  );
};

const SectionLabel = ({ icon, label }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "7px",
    margin: "18px 0 12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f2ede9",
  }}>
    <Icon name={icon} style={{ color: BRAND, fontSize: "14px" }} />
    <span style={{ fontWeight: 700, fontSize: "12px", color: BRAND, textTransform: "uppercase", letterSpacing: "0.7px" }}>{label}</span>
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
  borderRadius: "8px",
  border: "1.5px solid #e8e4e0",
  fontSize: "13px",
  padding: "8px 12px",
  color: "#1a1a2e",
  background: "#fdfcfc",
  outline: "none",
  width: "100%",
};

/* ── Main Page ── */
const SiteManagement = () => {
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const history = useHistory();

  // Listen for project added events
  useEffect(() => {
    const handleProjectAdded = (e) => {
      showSuccess(e.detail?.message || "Project added successfully!");
    };
    window.addEventListener('projectAdded', handleProjectAdded);
    return () => window.removeEventListener('projectAdded', handleProjectAdded);
  }, []);

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    setFilteredSites(
      !term ? sites : sites.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.location.toLowerCase().includes(term) ||
        s.staffAssigned?.some(st => st.toLowerCase().includes(term))
      )
    );
  }, [searchTerm, sites]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const r = await axios.get(`${API_URL}/projects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (r.data.success) { 
        setSites(r.data.data); 
        setFilteredSites(r.data.data); 
      } else {
        setError(r.data.message || "Failed to load projects.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (siteData) => {
    // The project is already created in the modal with the image
    // Just refresh the list
    await fetchProjects();
    return Promise.resolve();
  };

  const handleDelete = async (projectId, projectName) => {
    if (!window.confirm(`Delete "${projectName}"? This will permanently remove all associated media and documents.`)) return;
    try {
      setDeleting(projectId);
      const token = localStorage.getItem("token");
      const r = await axios.delete(`${API_URL}/projects/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (r.data.success) { 
        showSuccess("Project deleted."); 
        await fetchProjects(); 
      } else {
        throw new Error(r.data.message || "Failed to delete project");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showError(err.response?.data?.message || "Failed to delete project.");
    } finally {
      setDeleting(null);
    }
  };

  const showSuccess = (m) => { setSuccessMessage(m); setTimeout(() => setSuccessMessage(null), 3000); };
  const showError = (m) => { setError(m); setTimeout(() => setError(null), 5000); };

  if (loading) {
    return (
      <Content>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px" }}>
          <Spinner style={{ color: BRAND, width: "36px", height: "36px" }} />
          <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>Loading projects…</p>
        </div>
      </Content>
    );
  }

  return (
    <React.Fragment>
      <Head title="Project Management | Projects" />
      <Content>
        {/* ── Page Header ── */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page tag="h3">Project Management</BlockTitle>
              <BlockDes className="text-soft">
                <p>Manage all construction and project sites</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
            
               <Button
                                      className="btn-icon"
                                      style={{
                                        backgroundColor: "#4B5694",
                                        
                                        color: "#fff"
                                      }}
                                      onClick={() => setAddModal(true)} 
                                    >
                                      <Icon name="plus" />
                                    </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* ── Alerts ── */}
        {error && (
          <Alert color="danger" className="mb-3 d-flex align-items-center justify-content-between">
            <span>{error}</span>
            <Button close onClick={() => setError(null)} />
          </Alert>
        )}
        {successMessage && (
          <Alert color="success" className="mb-3 d-flex align-items-center justify-content-between">
            <span>{successMessage}</span>
            <Button close onClick={() => setSuccessMessage(null)} />
          </Alert>
        )}

        {/* ── Content Card ── */}
        <Block>
          <div className="card card-bordered" style={{ borderRadius: "12px", overflow: "hidden" }}>
            {/* Toolbar */}
            <div style={{
              padding: "14px 20px",
              borderBottom: "1px solid #f0ece9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              background: "#fdfcfc",
            }}>
              {/* Left: count */}
              <span style={{ fontSize: "13px", color: "#888", fontWeight: 500 }}>
                {filteredSites.length} <span style={{ color: "#bbb" }}>/</span> {sites.length} projects
              </span>

              {/* Right: search toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {searchOpen ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ position: "relative" }}>
                      <Icon name="search" style={{
                        position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
                        color: "#bbb", fontSize: "13px", pointerEvents: "none",
                      }} />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search by name, location, staff…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                          padding: "7px 12px 7px 30px",
                          borderRadius: "8px",
                          border: "1.5px solid #e8e4e0",
                          fontSize: "13px",
                          width: "260px",
                          outline: "none",
                          background: "#fff",
                        }}
                      />
                    </div>
                    <button
                      onClick={() => { setSearchOpen(false); setSearchTerm(""); }}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#aaa", fontSize: "18px", lineHeight: 1, padding: "2px 6px",
                      }}
                    >×</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    style={{
                      background: "#f5f5f5", border: "1.5px solid #e8e4e0",
                      borderRadius: "8px", padding: "7px 14px",
                      cursor: "pointer", display: "flex", alignItems: "center",
                      gap: "5px", fontSize: "13px", color: "#666",
                    }}
                  >
                    <Icon name="search" style={{ fontSize: "13px" }} /> Search
                  </button>
                )}
              </div>
            </div>

            {/* Grid */}
            <div style={{ padding: "20px" }}>
              <Row className="g-4">
                {filteredSites.length > 0 ? (
                  filteredSites.map(site => (
                    <Col xxl="3" lg="4" md="6" key={site._id}>
                      <SiteCard
                        site={site}
                        onView={s => history.push(`/SiteManagement/site/${s._id}`, { site: s })}
                        onDelete={handleDelete}
                        deleting={deleting}
                      />
                    </Col>
                  ))
                ) : (
                  <Col xs="12">
                    <div style={{
                      textAlign: "center", padding: "60px 20px",
                      border: "1px dashed #e0dbd7", borderRadius: "12px",
                      background: "#fdfcfc",
                    }}>
                      <div style={{
                        width: "60px", height: "60px",
                        background: BRAND + "12",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 16px",
                      }}>
                        <Icon name="building" style={{ fontSize: "26px", color: BRAND }} />
                      </div>
                      <h6 style={{ color: "#555", fontWeight: 700 }}>No projects found</h6>
                      <p style={{ color: "#aaa", fontSize: "13px", margin: "4px 0 18px" }}>
                        {searchTerm ? "Try a different search term" : "Add your first project to get started"}
                      </p>
                      {!searchTerm && (
                        <BrandBtn onClick={() => setAddModal(true)}>
                          <Icon name="plus" /> Add Project
                        </BrandBtn>
                      )}
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          </div>
        </Block>

        {/* ── Add Site Modal ── */}
        <AddSiteModal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          onAdd={handleAdd}
        />
      </Content>
    </React.Fragment>
  );
};

export default SiteManagement;