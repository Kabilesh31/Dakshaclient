// PurchaseOrderPage.js - Fixed Version with proper date input

import React, { useEffect, useState } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { useHistory } from "react-router-dom";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  Icon,
} from "../../../components/Component";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

// API base URL
const API_BASE_URL = `${process.env.REACT_APP_BACKENDURL}/api`

// Dummy projects for when API is not available
const DUMMY_PROJECTS = [
  { id: "PROJ-001", name: "Sunrise Villa Project" },
  { id: "PROJ-002", name: "Green Field Apartment" },
  { id: "PROJ-003", name: "Lake View Residency" },
  { id: "PROJ-004", name: "Industrial Park Phase 1" },
  { id: "PROJ-005", name: "Commercial Complex" },
];

/* ─────────────────────────────────────────────
   ============================================
   SECTION 1: STYLES
   ============================================
───────────────────────────────────────────── */
const S = {
  page: { padding: "8px 0 32px" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 },
  pageTitle: { fontSize: 22, fontWeight: 500, color: "#111827" },
  pageSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  btnBase: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, padding: "7px 14px", borderRadius: 8, cursor: "pointer", border: "0.5px solid #d1d5db", background: "#fff", color: "#6b7280" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, padding: "7px 14px", borderRadius: 8, cursor: "pointer", border: "0.5px solid #534AB7", background: "#534AB7", color: "#EEEDFE" },
  btnSm: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, padding: "5px 10px", borderRadius: 6, cursor: "pointer", border: "0.5px solid #d1d5db", background: "#fff", color: "#6b7280" },
  btnInfo: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, padding: "5px 10px", borderRadius: 6, cursor: "pointer", border: "0.5px solid #B5D4F4", background: "#E6F1FB", color: "#0C447C" },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
  searchInput: { border: "0.5px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontSize: 13, background: "#fff", color: "#111827", width: 280, outline: "none" },
  card: { background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, overflow: "auto" },
  th: { padding: "11px 14px", textAlign: "left", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" },
  thR: { padding: "11px 14px", textAlign: "right", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" },
  td: { padding: "13px 14px", color: "#111827", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle" },
  tdMuted: { padding: "13px 14px", color: "#6b7280", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle" },
  tdR: { padding: "13px 14px", textAlign: "right", color: "#111827", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle" },

  modalTabNav: { display: "flex", borderBottom: "0.5px solid #e5e7eb", padding: "0 20px", background: "#f9fafb", flexWrap: "wrap" },
  modalTab: (active) => ({
    display: "inline-flex", alignItems: "center", gap: 5, padding: "11px 14px",
    fontSize: 12, fontWeight: 500,
    color: active ? "#111827" : "#6b7280",
    cursor: "pointer", background: "none", border: "none",
    borderBottom: active ? "2px solid #534AB7" : "2px solid transparent",
    marginBottom: -1,
  }),
  tabBody: { padding: 20, maxHeight: "60vh", overflowY: "auto" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: 4 },
  formLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af" },
  formControl: { border: "0.5px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 13, background: "#fff", color: "#111827", width: "100%", outline: "none" },
  sectionLabel: { fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 10, marginTop: 4 },
  itemsTbl: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  itemsTh: { background: "#f9fafb", padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb" },
  itemsTd: { padding: "8px 10px", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle" },
  itemsInput: { border: "0.5px solid #e5e7eb", borderRadius: 4, padding: "5px 7px", fontSize: 12, background: "#fff", color: "#111827", width: "100%", outline: "none" },
  totalBar: { display: "flex", alignItems: "center", gap: 20, padding: "10px 14px", background: "#f9fafb", borderRadius: 8, marginTop: 12, border: "0.5px solid #e5e7eb", flexWrap: "wrap" },
  modalFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "0.5px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap", gap: 10 },
};

const STATUS_MAP = {
  "To Receive and Bill": { bg: "#EAF3DE", color: "#27500A", dot: "#639922" },
  "Pending": { bg: "#FAEEDA", color: "#633806", dot: "#BA7517" },
  "Ordered": { bg: "#E6F1FB", color: "#0C447C", dot: "#185FA5" },
  "Partially Ordered": { bg: "#EEEDFE", color: "#3C3489", dot: "#534AB7" },
  "Completed": { bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  "Cancelled": { bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 99, background: s.bg, color: s.color }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
};

const CodePill = ({ children }) => (
  <code style={{ background: "#f9fafb", border: "0.5px solid #e5e7eb", borderRadius: 4, padding: "2px 7px", fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{children}</code>
);

// Helper functions
const fmtDisplay = (d) => {
  if (!d) return "";
  if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, day] = d.split("-");
    return `${day}-${m}-${y}`;
  }
  return d;
};

const toYMD = (d) => {
  if (!d) return "";
  if (d.match(/^\d{4}-\d{2}-\d{2}$/)) return d;
  // Check if it's in DD-MM-YYYY format
  const parts = d.split("-");
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return d;
};

// Date validation function
const isValidDateFormat = (dateStr) => {
  if (!dateStr) return false;
  return /^\d{2}-\d{2}-\d{4}$/.test(dateStr);
};

/* ─────────────────────────────────────────────
   ============================================
   DATE INPUT COMPONENT (Fixed)
   ============================================
───────────────────────────────────────────── */
const DateInput = ({ value, onChange, placeholder = "DD-MM-YYYY", required = false }) => {
  const [displayValue, setDisplayValue] = useState(value ? fmtDisplay(value) : "");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (value) {
      setDisplayValue(fmtDisplay(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // Only validate and convert when we have a complete date
    if (inputValue.length === 10 && isValidDateFormat(inputValue)) {
      const ymd = toYMD(inputValue);
      setIsValid(true);
      onChange(ymd);
    } else if (inputValue === "") {
      setIsValid(true);
      onChange("");
    } else {
      setIsValid(false);
      // Don't update parent until date is complete
    }
  };

  const handleBlur = () => {
    // On blur, if we have a partial date, validate what we have
    if (displayValue && displayValue.length > 0 && displayValue.length < 10) {
      setIsValid(false);
    } else if (displayValue && displayValue.length === 10 && !isValidDateFormat(displayValue)) {
      setIsValid(false);
    } else if (displayValue && displayValue.length === 10 && isValidDateFormat(displayValue)) {
      setIsValid(true);
    }
  };

  return (
    <div>
      <input
        style={{
          ...S.formControl,
          borderColor: isValid ? undefined : "#E24B4A",
          backgroundColor: isValid ? undefined : "#FFF5F5"
        }}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {!isValid && displayValue && (
        <div style={{ fontSize: 10, color: "#E24B4A", marginTop: 2 }}>
          Please use DD-MM-YYYY format
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   ============================================
   ITEM ROW COMPONENT
   ============================================
───────────────────────────────────────────── */
const ItemRow = ({
  item, index,
  handleItemChange, handleItemCodeChange, handleKeyDown,
  selectSuggestion, suggestions, activeSuggestionIndex,
  setActiveSuggestionIndex, isActive,
}) => {
  const [displayDate, setDisplayDate] = useState(fmtDisplay(item.requiredBy));

  useEffect(() => { 
    setDisplayDate(fmtDisplay(item.requiredBy)); 
  }, [item.requiredBy]);

  const handleDateChange = (value) => {
    if (value === "" || (value && value.match(/^\d{4}-\d{2}-\d{2}$/))) {
      handleItemChange(index, "requiredBy", value);
    }
  };

  const amount = ((item.quantity || 0) * (item.rate || 0))
    .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <tr key={index}>
      <td style={{ ...S.itemsTd, textAlign: "center", color: "#9ca3af", width: 36 }}>{item.no || index + 1}</td>
      <td style={{ ...S.itemsTd, position: "relative" }}>
        <input
          style={S.itemsInput}
          type="text"
          value={item.itemCode || ""}
          onChange={(e) => handleItemCodeChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => { if (item.itemCode?.trim()) handleItemCodeChange(index, item.itemCode); }}
          placeholder="Search item code…"
          autoComplete="off"
          data-autocomplete-input="true"
        />
        {isActive && suggestions && suggestions.length > 0 && (
          <div
            data-autocomplete-dropdown="true"
            style={{
              position: "absolute", top: "100%", left: 10, right: 10,
              background: "#fff", border: "0.5px solid #e5e7eb",
              borderRadius: "0 0 8px 8px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              zIndex: 99999, maxHeight: 180, overflowY: "auto",
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={s._id || s.itemCode || i}
                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(index, s); }}
                onMouseEnter={() => setActiveSuggestionIndex(i)}
                style={{
                  padding: "9px 12px", cursor: "pointer",
                  background: i === activeSuggestionIndex ? "#E6F1FB" : "#fff",
                  borderBottom: i < suggestions.length - 1 ? "0.5px solid #f3f4f6" : "none",
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 12, color: "#111827" }}>{s.itemCode}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{s.itemName}</div>
              </div>
            ))}
          </div>
        )}
      </td>
      <td style={{ ...S.itemsTd, width: 110 }}>
        <DateInput 
          value={item.requiredBy} 
          onChange={handleDateChange}
          placeholder="DD-MM-YYYY"
        />
      </td>
      <td style={{ ...S.itemsTd, width: 70 }}>
        <input 
          style={{ ...S.itemsInput, width: 60 }} 
          type="number" 
          value={item.quantity || 0} 
          placeholder="0"
          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)} 
        />
      </td>
      <td style={{ ...S.itemsTd, width: 60 }}>
        <input 
          style={{ ...S.itemsInput, width: 50 }} 
          type="text" 
          value={item.uom || ""} 
          placeholder="UOM"
          onChange={(e) => handleItemChange(index, "uom", e.target.value)} 
        />
      </td>
      <td style={{ ...S.itemsTd, width: 90 }}>
        <input 
          style={{ ...S.itemsInput, width: 80 }} 
          type="number" 
          value={item.rate || ""} 
          placeholder="0.00"
          onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)} 
        />
      </td>
      <td style={{ ...S.itemsTd, textAlign: "right", fontWeight: 500, color: "#111827", width: 90 }}>
        ₹{amount}
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────────
   ============================================
   MAIN COMPONENT - PurchaseOrderPage
   ============================================
───────────────────────────────────────────── */
const PurchaseOrderPage = () => {
  // Main Page State
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [addModal, setAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showMRModal, setShowMRModal] = useState(false);
  const [selectedMR, setSelectedMR] = useState(null);
  const [materialRequests, setMaterialRequests] = useState([]);
  
  // Form State
  const [newOrder, setNewOrder] = useState({
    series: "PO-SER-2026", 
    date: "", 
    supplierId: "", 
    supplierName: "", 
    costCenter: "", 
    project: "",
    modeOfPayment: "Check", 
    termsOfPayment: "Net 30 Days", 
    requiredBy: "",
    supplierAddress: "", 
    supplierContact: "", 
    shippingAddress: "", 
    shippingContact: "",
    companyBillingAddress: "", 
    placeOfSupply: "",
    applyTaxWithholding: false, 
    isReverseCharge: false, 
    isSubcontracted: false,
    termsAndConditions: "",
    taxCategory: "",
    shippingRule: "",
    incoterm: "",
    items: [{ no: 1, itemCode: "", itemName: "", requiredBy: "", quantity: 0, uom: "", rate: 0, warehouse: "Stores - SD" }],
  });
  
  // Dropdown Data State
  const [suppliers, setSuppliers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  
  // Autocomplete State
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const history = useHistory();

  // API Calls
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-orders`);
      if (response.data.success) {
        setPurchaseOrders(response.data.data);
        setFiltered(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-orders/suppliers`);
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    }
  };

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-orders/projects`);
      if (response.data.success && response.data.data.length > 0) {
        setProjects(response.data.data);
      } else {
        // Use dummy data if no projects from API
        setProjects(DUMMY_PROJECTS);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Use dummy data on error
      setProjects(DUMMY_PROJECTS);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchMaterialRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-orders/material-requests`);
      if (response.data.success) {
        setMaterialRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching material requests:", error);
      toast.error("Failed to load material requests");
    }
  };

  const fetchItemSuggestions = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 1) return [];
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-orders/items`, {
        params: { search: searchTerm }
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
    return [];
  };

  // ─────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────
  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (addModal) {
      fetchMaterialRequests();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { 
      document.body.style.overflow = ""; 
    };
  }, [addModal]);

  useEffect(() => {
    const handler = (e) => {
      if (activeAutocompleteIndex !== null && !e.target.closest("[data-autocomplete-dropdown]") && !e.target.closest("[data-autocomplete-input]")) {
        setActiveAutocompleteIndex(null);
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeAutocompleteIndex]);

  useEffect(() => {
    if (search.trim() === "") { 
      setFiltered(purchaseOrders); 
      return; 
    }
    const kw = search.toLowerCase();
    setFiltered(purchaseOrders.filter(po =>
      po.supplierName?.toLowerCase().includes(kw) ||
      po._id?.toLowerCase().includes(kw) ||
      po.status?.toLowerCase().includes(kw)
    ));
  }, [search, purchaseOrders]);

  // ─────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────
  const handleItemChange = (index, field, value) => {
    const items = [...newOrder.items];
    items[index][field] = value;
    setNewOrder((p) => ({ ...p, items }));
  };

  const handleItemCodeChange = async (index, value) => {
    handleItemChange(index, "itemCode", value);
    if (value?.trim().length > 0) {
      const matches = await fetchItemSuggestions(value);
      setSuggestions(matches);
      setActiveAutocompleteIndex(index);
      setActiveSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setActiveAutocompleteIndex(null);
    }
  };

  const selectSuggestion = (index, item) => {
    const items = [...newOrder.items];
    items[index] = { 
      ...items[index], 
      itemCode: item.itemCode, 
      itemName: item.itemName, 
      uom: item.uom, 
      warehouse: item.warehouse || items[index].warehouse 
    };
    setNewOrder((p) => ({ ...p, items }));
    setSuggestions([]);
    setActiveAutocompleteIndex(null);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e, index) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") { 
      e.preventDefault(); 
      setActiveSuggestionIndex((p) => (p < suggestions.length - 1 ? p + 1 : 0)); 
    } else if (e.key === "ArrowUp") { 
      e.preventDefault(); 
      setActiveSuggestionIndex((p) => (p > 0 ? p - 1 : suggestions.length - 1)); 
    } else if (e.key === "Enter") { 
      e.preventDefault(); 
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        selectSuggestion(index, suggestions[activeSuggestionIndex]); 
      }
    } else if (e.key === "Escape") { 
      setSuggestions([]); 
      setActiveAutocompleteIndex(null); 
      setActiveSuggestionIndex(-1);
    }
  };

  const addItemRow = () => {
    setNewOrder((p) => ({
      ...p,
      items: [...p.items, { 
        no: p.items.length + 1, 
        itemCode: "", 
        itemName: "", 
        requiredBy: p.requiredBy || "", 
        quantity: 0, 
        uom: "", 
        rate: 0, 
        warehouse: "Stores - SD" 
      }],
    }));
  };

  const removeItemRow = (index) => {
    if (newOrder.items.length <= 1) {
      toast.warning("At least one item is required");
      return;
    }
    const items = newOrder.items.filter((_, i) => i !== index);
    const renumberedItems = items.map((item, idx) => ({ ...item, no: idx + 1 }));
    setNewOrder((p) => ({ ...p, items: renumberedItems }));
  };

  const fetchMaterialRequestDetails = async (mrId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-orders/material-requests/${mrId}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching material request details:", error);
      toast.error("Failed to load material request details");
    }
    return null;
  };

  const selectMR = async (mr) => {
    setSelectedMR(mr);
    const mrDetails = await fetchMaterialRequestDetails(mr._id);
    if (mrDetails && mrDetails.items && mrDetails.items.length > 0) {
      const existingItemsCount = newOrder.items.filter((i) => i.itemCode).length;
      const mrItems = mrDetails.items.map((item, idx) => ({
        no: existingItemsCount + idx + 1,
        itemCode: item.itemCode || "", 
        itemName: item.itemName || "",
        requiredBy: item.requiredBy || newOrder.requiredBy || "",
        quantity: item.quantity || 0, 
        uom: item.uom || "", 
        rate: 0, 
        warehouse: item.warehouse || "Stores - SD",
      }));
      setNewOrder((p) => ({ 
        ...p, 
        items: [...p.items.filter((i) => i.itemCode.trim()), ...mrItems] 
      }));
      toast.success(`Added ${mrItems.length} items from ${mr.title}`);
    } else {
      toast.warning("No items found in this material request");
    }
    setShowMRModal(false);
  };

  const resetForm = () => {
    setNewOrder({
      series: "PO-SER-2026", 
      date: "", 
      supplierId: "", 
      supplierName: "", 
      costCenter: "", 
      project: "",
      modeOfPayment: "Check", 
      termsOfPayment: "Net 30 Days", 
      requiredBy: "",
      supplierAddress: "", 
      supplierContact: "", 
      shippingAddress: "", 
      shippingContact: "",
      companyBillingAddress: "", 
      placeOfSupply: "",
      applyTaxWithholding: false, 
      isReverseCharge: false, 
      isSubcontracted: false,
      termsAndConditions: "",
      taxCategory: "",
      shippingRule: "",
      incoterm: "",
      items: [{ no: 1, itemCode: "", itemName: "", requiredBy: "", quantity: 0, uom: "", rate: 0, warehouse: "Stores - SD" }],
    });
    setActiveTab("details");
    setSelectedMR(null);
    setSuggestions([]);
    setActiveAutocompleteIndex(null);
    setActiveSuggestionIndex(-1);
  };

  const handleAddOrder = async () => {
    // Validation
    if (!newOrder.supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (!newOrder.date) {
      toast.error("Please enter order date");
      return;
    }
    if (!newOrder.requiredBy) {
      toast.error("Please enter required by date");
      return;
    }
    const validItems = newOrder.items.filter(i => i.itemCode && i.itemCode.trim());
    if (validItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    // Prepare data for API
    const orderData = {
      ...newOrder,
      items: newOrder.items.filter(i => i.itemCode && i.itemCode.trim()).map((item, idx) => ({
        ...item,
        no: idx + 1,
        amount: (item.quantity || 0) * (item.rate || 0),
      })),
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/purchase-orders`, orderData);
      if (response.data.success) {
        toast.success("Purchase order created successfully!");
        setAddModal(false);
        resetForm();
        fetchPurchaseOrders();
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast.error(error.response?.data?.message || "Failed to create purchase order");
    }
  };

  const goToDetails = (order) => history.push(`/purchase-order-details/${order._id}`, { orderData: order });

  // ─────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────
  const totalQty = newOrder.items.reduce((s, i) => s + (i.quantity || 0), 0);
  const calculateGrandTotal = () => newOrder.items.reduce((s, i) => s + ((i.quantity || 0) * (i.rate || 0)), 0);
  const fmtCurrency = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
  
  const fc = { ...S.formControl };
  const fl = S.formLabel;

  const tabs = [
    { key: "details", label: "Details", icon: "file-description" },
    { key: "address", label: "Address & contact", icon: "map-pin" },
    { key: "terms", label: "Terms", icon: "file-text" },
  ];

  // Handle supplier selection
  const handleSupplierChange = (supplierId) => {
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    setNewOrder({
      ...newOrder,
      supplierId: supplierId,
      supplierName: selectedSupplier?.name || "",
      supplierAddress: selectedSupplier?.address || "",
      supplierContact: selectedSupplier?.contact || "",
    });
  };

  // Handle date changes with proper conversion
  const handleDateChange = (field, value) => {
    if (value === "" || (value && value.match(/^\d{4}-\d{2}-\d{2}$/))) {
      setNewOrder({ ...newOrder, [field]: value });
    }
  };

  const handleRequiredByDateChange = (value) => {
    if (value === "" || (value && value.match(/^\d{4}-\d{2}-\d{2}$/))) {
      setNewOrder({ 
        ...newOrder, 
        requiredBy: value,
        items: newOrder.items.map((i) => ({ ...i, requiredBy: value }))
      });
    }
  };

  return (
    <>
      <Head title="Purchase Order" />
      <Content>
        <div style={S.page}>

          <div style={S.topbar}>
            <div>
              <div style={S.pageTitle}>Purchase orders</div>
              <div style={S.pageSub}>{filtered.length} order{filtered.length !== 1 ? "s" : ""}</div>
            </div>
            <Button color="primary" onClick={() => { resetForm(); setAddModal(true); }}>
              <Icon name="plus" /> Add purchase order
            </Button>
          </div>

          <div style={S.searchWrap}>
            <Icon name="search" style={{ fontSize: 15, color: "#9ca3af" }} />
            <input
              style={S.searchInput}
              type="text"
              placeholder="Search by supplier, ID or status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ width: 36, height: 36, border: "2px solid #e5e7eb", borderTopColor: "#534AB7", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
              <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading orders…</p>
            </div>
          ) : (
            <div style={S.card}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "11%" }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb" }}>
                    <th style={S.th}>Supplier</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Date</th>
                    <th style={S.thR}>Grand total</th>
                    <th style={S.th}>Order ID</th>
                    <th style={S.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? filtered.map((order, idx) => {
                    const isLast = idx === filtered.length - 1;
                    const border = isLast ? "none" : "0.5px solid #f3f4f6";
                    return (
                      <tr key={order._id}>
                        <td style={{ ...S.td, borderBottom: border, fontWeight: 500 }}>
                          <button onClick={() => goToDetails(order)} style={{ background: "none", border: "none", color: "#185FA5", cursor: "pointer", fontWeight: 500, fontSize: 13, padding: 0 }}>
                            {order.supplierName}
                          </button>
                        </td>
                        <td style={{ ...S.td, borderBottom: border }}><StatusBadge status={order.status} /></td>
                        <td style={{ ...S.tdMuted, borderBottom: border }}>{fmtDisplay(order.date) || "—"}</td>
                        <td style={{ ...S.tdR, borderBottom: border, color: "#27500A", fontWeight: 500 }}>{fmtCurrency(order.grandTotal)}</td>
                        <td style={{ ...S.td, borderBottom: border }}><CodePill>{order._id}</CodePill></td>
                        <td style={{ ...S.td, borderBottom: border }}>
                          <button style={{ ...S.btnSm, fontSize: 11 }} onClick={() => goToDetails(order)}>View</button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>No purchase orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Content>

      {/* Add Purchase Order Modal */}
      <Modal isOpen={addModal} toggle={() => { setAddModal(false); setActiveAutocompleteIndex(null); }} centered size="xl" backdrop="static" scrollable>
        <ModalHeader toggle={() => { setAddModal(false); setActiveAutocompleteIndex(null); }} style={{ borderBottom: "0.5px solid #e5e7eb", paddingBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#111827" }}>Add purchase order</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Fill in the details to create a new order</div>
        </ModalHeader>
        <ModalBody style={{ padding: 0 }}>

          <div style={S.modalTabNav}>
            {tabs.map(({ key, label, icon }) => (
              <button key={key} style={S.modalTab(activeTab === key)} onClick={() => setActiveTab(key)}>
                <Icon name={icon} style={{ fontSize: 14 }} /> {label}
              </button>
            ))}
          </div>

          {/* Tab: Details */}
          {activeTab === "details" && (
            <div style={S.tabBody}>
              <div style={S.formGrid}>
                <div style={S.formGroup}>
                  <label style={fl}>Series</label>
                  <input style={fc} type="text" value={newOrder.series} onChange={(e) => setNewOrder({ ...newOrder, series: e.target.value })} />
                </div>
                <div style={S.formGroup}>
                  <label style={fl}>Date <span style={{ color: "#E24B4A" }}>*</span></label>
                  <DateInput 
                    value={newOrder.date} 
                    onChange={(value) => handleDateChange("date", value)}
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div style={S.formGroup}>
                  <label style={fl}>Supplier <span style={{ color: "#E24B4A" }}>*</span></label>
                  <select style={fc} value={newOrder.supplierId} onChange={(e) => handleSupplierChange(e.target.value)}>
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={S.formGroup}>
                  <label style={fl}>Mode of payment <span style={{ color: "#E24B4A" }}>*</span></label>
                  <select style={fc} value={newOrder.modeOfPayment} onChange={(e) => setNewOrder({ ...newOrder, modeOfPayment: e.target.value })}>
                    <option>Check</option>
                    <option>Cash</option>
                    <option>DD</option>
                    <option>Bank Transfer</option>
                    <option>Credit Card</option>
                  </select>
                </div>
                <div style={S.formGroup}>
                  <label style={fl}>Terms of payment</label>
                  <input style={fc} type="text" value={newOrder.termsOfPayment} onChange={(e) => setNewOrder({ ...newOrder, termsOfPayment: e.target.value })} />
                </div>
                <div style={S.formGroup}>
                  <label style={fl}>Required by <span style={{ color: "#E24B4A" }}>*</span></label>
                  <DateInput 
                    value={newOrder.requiredBy} 
                    onChange={handleRequiredByDateChange}
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div style={S.formGroup}>
                  <label style={fl}>Cost center</label>
                  <input style={fc} type="text" placeholder="Cost center" value={newOrder.costCenter} onChange={(e) => setNewOrder({ ...newOrder, costCenter: e.target.value })} />
                </div>
                <div style={S.formGroup}>
                  <label style={fl}>Project</label>
                  <select style={fc} value={newOrder.project} onChange={(e) => setNewOrder({ ...newOrder, project: e.target.value })}>
                    <option value="">Select project</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {projectsLoading && <span style={{ fontSize: 10, color: "#9ca3af" }}>Loading projects...</span>}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "14px 0", flexWrap: "wrap" }}>
                {[
                  { key: "applyTaxWithholding", label: "Apply tax withholding" },
                  { key: "isReverseCharge", label: "Is reverse charge" },
                  { key: "isSubcontracted", label: "Is subcontracted" },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
                    <input type="checkbox" checked={newOrder[key]} onChange={(e) => setNewOrder({ ...newOrder, [key]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
                <div style={S.sectionLabel}>Items</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {selectedMR && (
                    <span style={{ fontSize: 11, color: "#185FA5" }}>{selectedMR._id}</span>
                  )}
                  <button style={S.btnInfo} onClick={() => setShowMRModal(true)}>
                    <Icon name="file-text" style={{ fontSize: 13 }} /> Select material request
                  </button>
                </div>
              </div>

              <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 8, overflow: "auto", marginBottom: 10 }}>
                <table style={S.itemsTbl}>
                  <colgroup>
                    <col style={{ width: 36 }} />
                    <col style={{ minWidth: 200 }} />
                    <col style={{ width: 110 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 60 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 40 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ ...S.itemsTh, textAlign: "center" }}>No</th>
                      <th style={S.itemsTh}>Item code</th>
                      <th style={S.itemsTh}>Required by</th>
                      <th style={S.itemsTh}>Qty</th>
                      <th style={S.itemsTh}>UOM</th>
                      <th style={S.itemsTh}>Rate (₹)</th>
                      <th style={{ ...S.itemsTh, textAlign: "right" }}>Amount</th>
                      <th style={{ ...S.itemsTh, textAlign: "center" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newOrder.items.map((item, idx) => (
                      <ItemRow
                        key={idx}
                        item={item}
                        index={idx}
                        handleItemChange={handleItemChange}
                        handleItemCodeChange={handleItemCodeChange}
                        handleKeyDown={handleKeyDown}
                        selectSuggestion={selectSuggestion}
                        suggestions={suggestions}
                        activeSuggestionIndex={activeSuggestionIndex}
                        setActiveSuggestionIndex={setActiveSuggestionIndex}
                        isActive={activeAutocompleteIndex === idx}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <button style={S.btnSm} onClick={addItemRow}>
                <Icon name="plus" style={{ fontSize: 13 }} /> Add row
              </button>

              <div style={S.totalBar}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Total qty: <strong style={{ color: "#111827", fontWeight: 500 }}>{totalQty}</strong></div>
                <div style={{ height: 14, width: 1, background: "#e5e7eb" }} />
                <div style={{ fontSize: 12, color: "#6b7280" }}>Grand total: <strong style={{ color: "#27500A", fontSize: 14, fontWeight: 500 }}>{fmtCurrency(calculateGrandTotal())}</strong></div>
              </div>

              <div style={{ ...S.sectionLabel, marginTop: 16 }}>Taxes &amp; charges</div>
              <div style={{ ...S.formGrid, marginTop: 10 }}>
                <div style={S.formGroup}><label style={fl}>Tax category</label><input style={fc} type="text" placeholder="Tax category" value={newOrder.taxCategory || ""} onChange={(e) => setNewOrder({ ...newOrder, taxCategory: e.target.value })} /></div>
                <div style={S.formGroup}><label style={fl}>Shipping rule</label><input style={fc} type="text" placeholder="Shipping rule" value={newOrder.shippingRule || ""} onChange={(e) => setNewOrder({ ...newOrder, shippingRule: e.target.value })} /></div>
                <div style={S.formGroup}><label style={fl}>Incoterm</label><input style={fc} type="text" placeholder="Incoterm" value={newOrder.incoterm || ""} onChange={(e) => setNewOrder({ ...newOrder, incoterm: e.target.value })} /></div>
              </div>
            </div>
          )}

          {/* Tab: Address & Contact */}
          {activeTab === "address" && (
            <div style={S.tabBody}>
              <div style={S.sectionLabel}>Supplier address</div>
              <div style={S.formGrid}>
                <div style={S.formGroup}><label style={fl}>Supplier address</label><textarea style={{ ...fc, resize: "vertical" }} rows={3} value={newOrder.supplierAddress || ""} onChange={(e) => setNewOrder({ ...newOrder, supplierAddress: e.target.value })} /></div>
                <div style={S.formGroup}><label style={fl}>Supplier contact</label><input style={fc} type="text" value={newOrder.supplierContact || ""} onChange={(e) => setNewOrder({ ...newOrder, supplierContact: e.target.value })} /></div>
              </div>

              <div style={{ ...S.sectionLabel, marginTop: 16 }}>Shipping address</div>
              <div style={S.formGrid}>
                <div style={S.formGroup}><label style={fl}>Shipping address</label><textarea style={{ ...fc, resize: "vertical" }} rows={3} value={newOrder.shippingAddress || ""} onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })} /></div>
                <div style={S.formGroup}><label style={fl}>Shipping contact</label><input style={fc} type="text" value={newOrder.shippingContact || ""} onChange={(e) => setNewOrder({ ...newOrder, shippingContact: e.target.value })} /></div>
              </div>

              <div style={{ ...S.sectionLabel, marginTop: 16 }}>Company billing</div>
              <div style={S.formGrid}>
                <div style={S.formGroup}><label style={fl}>Company billing address</label><textarea style={{ ...fc, resize: "vertical" }} rows={3} value={newOrder.companyBillingAddress || ""} onChange={(e) => setNewOrder({ ...newOrder, companyBillingAddress: e.target.value })} /></div>
                <div style={S.formGroup}><label style={fl}>Place of supply</label><input style={fc} type="text" value={newOrder.placeOfSupply || ""} onChange={(e) => setNewOrder({ ...newOrder, placeOfSupply: e.target.value })} /></div>
              </div>
            </div>
          )}

          {/* Tab: Terms */}
          {activeTab === "terms" && (
            <div style={S.tabBody}>
              <div style={S.formGroup}>
                <label style={fl}>Terms and conditions</label>
                <textarea style={{ ...fc, resize: "vertical" }} rows={10} placeholder="Enter terms and conditions…" value={newOrder.termsAndConditions || ""} onChange={(e) => setNewOrder({ ...newOrder, termsAndConditions: e.target.value })} />
              </div>
            </div>
          )}

          <div style={S.modalFooter}>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Fields marked <span style={{ color: "#E24B4A" }}>*</span> are required</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnBase} onClick={() => { setAddModal(false); setActiveAutocompleteIndex(null); }}>Cancel</button>
              <Button color="primary" onClick={handleAddOrder}>
                <Icon name="check" /> Submit order
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Material Request Selection Modal */}
      <Modal isOpen={showMRModal} toggle={() => setShowMRModal(false)} centered size="lg" scrollable>
        <ModalHeader toggle={() => setShowMRModal(false)}>Select material request</ModalHeader>
        <ModalBody>
          <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb" }}>
                  <th style={S.th}>ID</th>
                  <th style={S.th}>Title</th>
                  <th style={S.th}>Status</th>
                  <th style={{ ...S.th, width: 90 }}></th>
                </tr>
              </thead>
              <tbody>
                {materialRequests.map((mr, idx) => (
                  <tr key={mr._id} style={{ borderBottom: idx < materialRequests.length - 1 ? "0.5px solid #f3f4f6" : "none" }}>
                    <td style={S.td}><CodePill>{mr._id}</CodePill></td>
                    <td style={{ ...S.td, wordBreak: "break-word", whiteSpace: "normal" }}>{mr.title}</td>
                    <td style={S.td}><StatusBadge status={mr.status} /></td>
                    <td style={S.td}>
                      <button style={S.btnPrimary} onClick={() => selectMR(mr)}>Select</button>
                    </td>
                  </tr>
                ))}
                {materialRequests.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>No material requests available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ModalBody>
      </Modal>

      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        @media (max-width: 768px) {
          .table-responsive {
            overflow-x: auto;
          }
        }
      `}</style>
    </>
  );
};

export default PurchaseOrderPage;