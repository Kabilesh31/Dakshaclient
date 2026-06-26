// PurchaseOrderPage.js - Status badge aligned with MaterialRequestDetails theme

import React, { useEffect, useState, useRef, useMemo } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { useHistory } from "react-router-dom";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
  DataTable,
  RSelect,
} from "../../../components/Component";
import {
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// API base URL
const API_BASE_URL = `${process.env.REACT_APP_BACKENDURL}/api`

// Status Badge 
const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case "Ordered":
        return {
          background: "#EAF3DE",
          color: "#27500A",
          border: "0.5px solid #C0DD97",
          dotColor: "#639922",
        };
      case "Partially Ordered":
        return {
          background: "#E6F1FB",
          color: "#0C447C",
          border: "0.5px solid #85B7EB",
          dotColor: "#378ADD",
        };
      case "Completed":
        return {
          background: "#D1FAE5",
          color: "#065F46",
          border: "0.5px solid #A7F3D0",
          dotColor: "#10B981",
        };
      case "Cancelled":
        return {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "0.5px solid #FECACA",
          dotColor: "#EF4444",
        };
      case "To Receive and Bill":
        return {
          background: "green",
          color: "White",
          border: "0.5px solid #C0DD97",
          dotColor: "#639922",
        };
      case "Pending":
      default:
        return {
          background: "#FAEEDA",
          color: "#633806",
          border: "0.5px solid #FAC775",
          dotColor: "#BA7517",
        };
    }
  };
  const { background, color, border, dotColor } = getStyles();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        padding: "4px 12px",
        borderRadius: 99,
        background,
        color,
        border,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: dotColor,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
};

const CodePill = ({ children }) => (
  <code style={{ 
    background: "#f9fafb", 
    border: "1px solid #e5e7eb", 
    borderRadius: 4, 
    padding: "4px 10px", 
    fontFamily: "monospace", 
    fontSize: 12, 
    color: "#374151",
    fontWeight: 500
  }}>{children}</code>
);


const fmtDisplay = (d) => {
  if (!d) return "";
  if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, day] = d.split("-");
    return `${day}-${m}-${y}`;
  }
  return d;
};

// Date validation function
const isValidDateFormat = (dateStr) => {
  if (!dateStr) return false;
  return /^\d{2}-\d{2}-\d{4}$/.test(dateStr);
};

const toYMD = (d) => {
  if (!d) return "";
  if (d.match(/^\d{4}-\d{2}-\d{2}$/)) return d;
  const parts = d.split("-");
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return d;
};

// Date Input Component
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
    
    if (inputValue.length === 10 && isValidDateFormat(inputValue)) {
      const ymd = toYMD(inputValue);
      setIsValid(true);
      onChange(ymd);
    } else if (inputValue === "") {
      setIsValid(true);
      onChange("");
    } else {
      setIsValid(false);
    }
  };

  const handleBlur = () => {
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
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: "7px 10px",
          fontSize: 13,
          background: "#fff",
          color: "#111827",
          width: "100%",
          outline: "none",
          borderColor: isValid ? "#e5e7eb" : "#E24B4A",
          backgroundColor: isValid ? "#fff" : "#FFF5F5"
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

// Item Row Component
const ItemRow = ({ item, index, handleItemChange, handleItemCodeChange, handleKeyDown, selectSuggestion, suggestions, activeSuggestionIndex, setActiveSuggestionIndex, isActive }) => {
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
      <td style={{ padding: "8px 12px", textAlign: "center", color: "#9ca3af", width: 36 }}>{item.no || index + 1}</td>
      <td style={{ padding: "8px 12px", position: "relative" }}>
        <input
          style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "5px 7px", fontSize: 12, width: "100%" }}
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
      <td style={{ padding: "8px 12px", width: 110 }}>
        <DateInput 
          value={item.requiredBy} 
          onChange={handleDateChange}
          placeholder="DD-MM-YYYY"
        />
      </td>
      <td style={{ padding: "8px 12px", width: 70 }}>
        <input 
          style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "5px 7px", fontSize: 12, width: 60 }} 
          type="number" 
          value={item.quantity || 0} 
          placeholder="0"
          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)} 
        />
      </td>
      <td style={{ padding: "8px 12px", width: 60 }}>
        <input 
          style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "5px 7px", fontSize: 12, width: 50 }} 
          type="text" 
          value={item.uom || ""} 
          placeholder="UOM"
          onChange={(e) => handleItemChange(index, "uom", e.target.value)} 
        />
      </td>
      <td style={{ padding: "8px 12px", width: 90 }}>
        <input 
          style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "5px 7px", fontSize: 12, width: 80 }} 
          type="number" 
          value={item.rate || ""} 
          placeholder="0.00"
          onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)} 
        />
      </td>
      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 500, color: "#111827", width: 90 }}>
        ₹{amount}
      </td>
    </tr>
  );
};

// Delete Confirmation Modal
const ConfirmationModal = ({ isOpen, toggle, onConfirm, title, message, loading }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered" size="lg">
      <ModalBody
        style={{
          overflowY: "auto",
          maxHeight: "calc(100vh)",
          padding: "1.5rem",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="hide-scrollbar"
      >
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            toggle();
          }}
          className="close"
        >
          <Icon name="cross-sm" />
        </a>
        <div className="p-2 text-center">
          <div className="mb-4">
            <Icon name="alert-circle" style={{ fontSize: "3rem", color: "#644634" }} />
          </div>
          <h5 className="title mb-2">{title || "Confirm Delete"}</h5>
          <p className="text-muted mb-4">
            {message || "Are you sure you want to delete this purchase order? This action cannot be undone."}
          </p>
          <div className="d-flex gap-8 justify-content-center">
            <Button
              style={{
                backgroundColor: "#644634",
                borderColor: "#800000",
                color: "#fff",
                padding: "15px 24px",
                marginRight: "10px",
              }}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Yes, Delete"}
            </Button>
            <Button color="secondary" outline onClick={toggle} style={{ padding: "15px 24px" }} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT - PurchaseOrderPage
───────────────────────────────────────────── */
const PurchaseOrderPage = () => {
  const history = useHistory();
  
  // Main Page State
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [onSearch, setOnSearch] = useState(false);
  
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
    projectId : "",
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
  
  // Options for RSelect dropdowns
  const supplierOptions = useMemo(() => 
    suppliers.map(s => ({ value: s.id, label: s.name, ...s })), 
    [suppliers]
  );
  
  // FIXED: Use _id consistently for project options
  const projectOptions = useMemo(() => 
    projects.map(p => ({ 
      value: p._id || p.id,  // Use _id as the value
      label: p.name,
      ...p 
    })), 
    [projects]
  );
  
  const modeOfPaymentOptions = [
    { value: "Check", label: "Check" },
    { value: "Cash", label: "Cash" },
    { value: "DD", label: "DD" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Credit Card", label: "Credit Card" },
  ];
  
  // Selected objects for RSelect
  const selectedSupplier = supplierOptions.find(opt => opt.value === newOrder.supplierId) || null;
  const selectedProject = projectOptions.find(opt => opt.value === newOrder.projectId) || null;
  const selectedModeOfPayment = modeOfPaymentOptions.find(opt => opt.value === newOrder.modeOfPayment) || modeOfPaymentOptions[0];
  
  // Autocomplete State
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  // Get unique statuses for filter
  const [uniqueStatuses, setUniqueStatuses] = useState([]);

  // Build filter options for RSelect
  const statusFilterOptions = useMemo(() => {
    return [
      { value: "All", label: "All Status" },
      ...uniqueStatuses.map(s => ({ value: s, label: s })),
    ];
  }, [uniqueStatuses]);

  // Selected object for RSelect
  const selectedStatusFilter = statusFilterOptions.find(opt => opt.value === statusFilter);

  // Toast helpers
  const showSuccess = (message) => toast.success(message);
  const showError = (message) => toast.error(message);
  const showWarning = (message) => toast.warning(message);

  // API Calls
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-orders`);
      if (response.data.success) {
        setPurchaseOrders(response.data.data);
        
        // Extract unique statuses
        const statuses = new Set();
        response.data.data.forEach(order => {
          if (order.status) statuses.add(order.status);
        });
        setUniqueStatuses(Array.from(statuses).sort());
      } else {
        showError(response.data.message || "Failed to fetch purchase orders");
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      showError("Failed to load purchase orders");
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
    }
  };

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      if (response.data.success && response.data.data.length > 0) {
        setProjects(response.data.data);
      } else {
        console.log("fetching err")
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
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

  const fetchMaterialRequestDetails = async (mrId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-orders/material-requests/${mrId}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching material request details:", error);
      showError("Failed to load material request details");
    }
    return null;
  };

  const createPurchaseOrder = async (orderData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/purchase-orders`, orderData);
      if (response.data.success) {
        await fetchPurchaseOrders();
        showSuccess("Purchase order created successfully!");
        return true;
      } else {
        showError(response.data.message || "Creation failed");
        return false;
      }
    } catch (error) {
      console.error("Create error:", error);
      showError(error.response?.data?.message || "Network error while creating");
      return false;
    }
  };

  const deletePurchaseOrder = async (id) => {
    setDeleteLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/purchase-orders/${id}`);
      if (response.data.success) {
        await fetchPurchaseOrders();
        showSuccess("Purchase order deleted successfully");
        return true;
      } else {
        showError(response.data.message || "Delete failed");
        return false;
      }
    } catch (error) {
      console.error("Delete error:", error);
      showError("Network error while deleting");
      return false;
    } finally {
      setDeleteLoading(false);
    }
  };

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

  // Apply filters
  useEffect(() => {
    let result = [...purchaseOrders];
    
    // Apply search filter
    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      result = result.filter(
        (order) =>
          order.supplierName?.toLowerCase().includes(keyword) ||
          order._id?.toLowerCase().includes(keyword) ||
          order.status?.toLowerCase().includes(keyword)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter((order) => order.status === statusFilter);
    }
    
    setFiltered(result);
  }, [search, statusFilter, purchaseOrders]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setOnSearch(false);
  };

  // Form handlers
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
      showSuccess(`Added ${mrItems.length} items from ${mr.title}`);
    } else {
      showWarning("No items found in this material request");
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
      projectId: "",
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

  // FIXED: Handle project selection correctly
  const handleProjectChange = (selectedOption) => {
    if (selectedOption) {
      // The selected option already contains the project data
      setNewOrder({
        ...newOrder,
        projectId: selectedOption.value, // This is the _id
        project: selectedOption.label,    // This is the name
      });
    } else {
      // Handle clearing the selection
      setNewOrder({
        ...newOrder,
        projectId: "",
        project: "",
      });
    }
  };

  const handleAddOrder = async () => {
    if (!newOrder.supplierId) {
      showError("Please select a supplier");
      return;
    }
    if (!newOrder.date) {
      showError("Please enter order date");
      return;
    }
    if (!newOrder.requiredBy) {
      showError("Please enter required by date");
      return;
    }
    const validItems = newOrder.items.filter(i => i.itemCode && i.itemCode.trim());
    if (validItems.length === 0) {
      showError("Please add at least one item");
      return;
    }

    const orderData = {
      ...newOrder,
      items: newOrder.items.filter(i => i.itemCode && i.itemCode.trim()).map((item, idx) => ({
        ...item,
        no: idx + 1,
        amount: (item.quantity || 0) * (item.rate || 0),
      })),
    };

    const success = await createPurchaseOrder(orderData);
    if (success) {
      setAddModal(false);
      resetForm();
    }
  };

  const handleSupplierChange = (selectedOption) => {
    const supplierId = selectedOption?.value || "";
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    setNewOrder({
      ...newOrder,
      supplierId: supplierId,
      supplierName: selectedSupplier?.name || "",
      supplierAddress: selectedSupplier?.address || "",
      supplierContact: selectedSupplier?.contact || "",
    });
  };

  const handleModeOfPaymentChange = (selectedOption) => {
    setNewOrder({ ...newOrder, modeOfPayment: selectedOption?.value || "Check" });
  };

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

  const handleDeleteClick = (id) => {
    setDeleteOrderId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteOrderId) {
      await deletePurchaseOrder(deleteOrderId);
      setShowDeleteConfirm(false);
      setDeleteOrderId(null);
    }
  };

  const goToDetails = (order) => {
    history.push(`/purchase-order-details/${order._id}`, { orderData: order });
  };

  const calculateGrandTotal = () => 
    newOrder.items.reduce((s, i) => s + ((i.quantity || 0) * (i.rate || 0)), 0);
  
  const fmtCurrency = (n) => 
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  const totalQty = newOrder.items.reduce((s, i) => s + (i.quantity || 0), 0);
  const fc = { border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 13, background: "#fff", color: "#111827", width: "100%", outline: "none" };
  const fl = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 };

  const tabs = [
    { key: "details", label: "Details", icon: "file-description" },
    { key: "address", label: "Address & contact", icon: "map-pin" },
    { key: "terms", label: "Terms", icon: "file-text" },
  ];

  // Custom styles for RSelect to match theme
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#e5e7eb",
      borderRadius: 6,
      padding: "2px 0",
      fontSize: 13,
      boxShadow: "none",
      "&:hover": { borderColor: "#d1d5db" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#644634" : state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "white" : "#111827",
      fontSize: 13,
    }),
    singleValue: (base) => ({
      ...base,
      color: "#111827",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <>
      <Head title="Purchase Order" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Purchase Orders</BlockTitle>
              <p className="text-muted">Total Orders: {filtered.length}</p>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className="btn-icon"
                  style={{
                    backgroundColor: "#644634",
                    borderColor: "#800000",
                    color: "#fff",
                  }}
                  onClick={() => { resetForm(); setAddModal(true); }}
                >
                  <Icon name="plus" />
                </Button>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <DataTable className="card-stretch w-100">
            {/* Search & Filter Bar */}
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <div className="card-tools">
                  <div className="form-inline flex-nowrap gx-3">
                    {/* Status Filter - RSelect */}
                    <div className="form-wrap" style={{ minWidth: "160px" }}>
                      <RSelect
                        options={statusFilterOptions}
                        value={selectedStatusFilter}
                        onChange={(opt) => setStatusFilter(opt?.value || "All")}
                        placeholder="Select Status"
                        isClearable={false}
                        classNamePrefix="react-select"
                      />
                    </div>
                    
                    {(search || statusFilter !== "All") && (
                      <Button color="link" onClick={resetFilters} className="ms-2">
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
                <div className="card-tools mr-n1">
                  <ul className="btn-toolbar gx-1">
                    <li>
                      <a
                        href="#search"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setOnSearch(!onSearch);
                        }}
                        className="btn btn-icon search-toggle"
                      >
                        <Icon name="search" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={`card-search search-wrap ${onSearch ? "active" : ""}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button
                      className="search-back btn-icon"
                      onClick={() => {
                        setSearch("");
                        setOnSearch(false);
                      }}
                    >
                      <Icon name="arrow-left" />
                    </Button>
                    <input
                      type="text"
                      className="form-control border-transparent"
                      placeholder="Search by supplier, ID or status"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {loading && (
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2">Loading purchase orders...</p>
              </div>
            )}

            {/* Purchase Orders Table */}
            {!loading && (
              <div style={{ overflowX: "auto", padding: "0 20px 20px" }}>
                <div
                  style={{
                    borderRadius: "12px",
                    marginTop: "20px",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.88rem",
                      tableLayout: "fixed",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f9fafb",
                          borderBottom: "2px solid #e5e7eb",
                        }}
                      >
                        {[
                          { label: "S.No", width: "6%" },
                          { label: "Supplier Name", width: "26%" },
                          { label: "Status", width: "16%" },
                          { label: "Date", width: "14%" },
                          { label: "Grand Total", width: "16%" },
                          { label: "Order ID", width: "16%" },
                          { label: "Actions", width: "10%" },
                        ].map((head, i) => (
                          <th
                            key={i}
                            style={{
                              padding: "14px 20px",
                              textAlign: "center",
                              fontWeight: 600,
                              color: "#374151",
                              width: head.width,
                              whiteSpace: "nowrap",
                              verticalAlign: "middle",
                            }}
                          >
                            {head.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.length > 0 ? (
                        filtered.map((order, idx) => (
                          <tr
                            key={order._id}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#fafafa")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#fff")
                            }
                            style={{
                              borderBottom:
                                idx < filtered.length - 1
                                  ? "1px solid #f3f4f6"
                                  : "none",
                              transition: "background 0.15s ease",
                            }}
                          >
                            {/* S.No */}
                            <td
                              style={{
                                padding: "14px 20px",
                                textAlign: "center",
                                verticalAlign: "middle",
                                color: "#6b7280",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {idx + 1}
                            </td>

                            {/* Supplier Name */}
                            <td
                              style={{
                                padding: "14px 20px",
                                textAlign: "center",
                                verticalAlign: "middle",
                                overflow: "hidden",
                              }}
                            >
                              <button
                                onClick={() => goToDetails(order)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#2563eb",
                                  cursor: "pointer",
                                  fontWeight: 500,
                                  fontSize: "0.88rem",
                                  width: "100%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  display: "block",
                                  textAlign: "center",
                                }}
                              >
                                {order.supplierName || "—"}
                              </button>
                            </td>

                            {/* Status */}
                            <td
                              style={{
                                padding: "14px 20px",
                                textAlign: "center",
                                verticalAlign: "middle",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <StatusBadge status={order.status} />
                              </div>
                            </td>

                            {/* Date */}
                            <td
                              style={{
                                padding: "14px 20px",
                                textAlign: "center",
                                verticalAlign: "middle",
                                color: "#6b7280",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fmtDisplay(order.date) || "—"}
                            </td>

                            {/* Grand Total */}
                            <td
                              style={{
                                padding: "14px 20px",
                                textAlign: "center",
                                verticalAlign: "middle",
                                color: "#27500A",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fmtCurrency(order.grandTotal || 0)}
                            </td>

                            {/* Order ID */}
                            <td
                              style={{
                                padding: "14px 20px",
                                textAlign: "center",
                                verticalAlign: "middle",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <CodePill>{order._id}</CodePill>
                            </td>

                            {/* Actions */}
                            <td
                              style={{
                                padding: "14px 20px",
                                textAlign: "center",
                                verticalAlign: "middle",
                              }}
                            >
                              <UncontrolledDropdown>
                                <DropdownToggle
                                  tag="a"
                                  className="btn btn-icon btn-trigger"
                                >
                                  <Icon name="more-h" />
                                </DropdownToggle>

                                <DropdownMenu right>
                                  <DropdownItem
                                    onClick={() => goToDetails(order)}
                                  >
                                    <Icon name="eye" /> View
                                  </DropdownItem>

                                  <DropdownItem
                                    onClick={() =>
                                      handleDeleteClick(order._id)
                                    }
                                  >
                                    <Icon name="trash" /> Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            style={{
                              textAlign: "center",
                              padding: "48px 20px",
                              color: "#9ca3af",
                              fontSize: "14px",
                            }}
                          >
                            No purchase orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DataTable>
        </Block>
      </Content>

      {/* Add Purchase Order Modal - Themed UI with RSelect dropdowns */}
      <Modal isOpen={addModal} toggle={() => { setAddModal(false); setActiveAutocompleteIndex(null); }} centered size="xl" backdrop="static" scrollable>
        <ModalHeader 
          toggle={() => { setAddModal(false); setActiveAutocompleteIndex(null); }} 
          style={{ borderBottom: "0.5px solid #e5e7eb", padding: "16px 20px" }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#111827" }}>Add purchase order</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Fill in the details to create a new order</div>
          </div>
        </ModalHeader>
        <ModalBody style={{ padding: 0 }}>

          <div style={{ display: "flex", borderBottom: "0.5px solid #e5e7eb", padding: "0 20px", background: "#f9fafb", flexWrap: "wrap" }}>
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "11px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: activeTab === key ? "#111827" : "#6b7280",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === key ? "2px solid #644634" : "2px solid transparent",
                  marginBottom: -1,
                  transition: "all 0.15s ease"
                }}
                onClick={() => setActiveTab(key)}
              >
                <Icon name={icon} style={{ fontSize: 14 }} /> {label}
              </button>
            ))}
          </div>

          {/* Tab: Details */}
          {activeTab === "details" && (
            <div style={{ padding: 20, maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={fl}>Series</label>
                  <input style={fc} type="text" value={newOrder.series} onChange={(e) => setNewOrder({ ...newOrder, series: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={fl}>Date <span style={{ color: "#E24B4A" }}>*</span></label>
                  <DateInput 
                    value={newOrder.date} 
                    onChange={(value) => handleDateChange("date", value)}
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={fl}>Supplier <span style={{ color: "#E24B4A" }}>*</span></label>
                  <RSelect
                    options={supplierOptions}
                    value={selectedSupplier}
                    onChange={handleSupplierChange}
                    placeholder="Select supplier"
                    isClearable={false}
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={fl}>Mode of payment <span style={{ color: "#E24B4A" }}>*</span></label>
                  <RSelect
                    options={modeOfPaymentOptions}
                    value={selectedModeOfPayment}
                    onChange={handleModeOfPaymentChange}
                    placeholder="Select payment mode"
                    isClearable={false}
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={fl}>Terms of payment</label>
                  <input style={fc} type="text" value={newOrder.termsOfPayment} onChange={(e) => setNewOrder({ ...newOrder, termsOfPayment: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={fl}>Required by <span style={{ color: "#E24B4A" }}>*</span></label>
                  <DateInput 
                    value={newOrder.requiredBy} 
                    onChange={handleRequiredByDateChange}
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={fl}>Cost center</label>
                  <input style={fc} type="text" placeholder="Cost center" value={newOrder.costCenter} onChange={(e) => setNewOrder({ ...newOrder, costCenter: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={fl}>Project</label>
                  <RSelect
                    options={projectOptions}
                    value={selectedProject}
                    onChange={handleProjectChange}
                    placeholder="Select project"
                    isClearable
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    isLoading={projectsLoading}
                  />
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
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 10, marginTop: 4 }}>Items</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {selectedMR && (
                    <span style={{ fontSize: 11, color: "#185FA5" }}>{selectedMR._id}</span>
                  )}
                  <button 
                    style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: 5, 
                      fontSize: 12, 
                      fontWeight: 500, 
                      padding: "5px 10px", 
                      borderRadius: 6, 
                      cursor: "pointer", 
                      border: "0.5px solid #644634", 
                      background: "#644634", 
                      color: "#fff" 
                    }} 
                    onClick={() => setShowMRModal(true)}
                  >
                    <Icon name="file-text" style={{ fontSize: 13 }} /> Select material request
                  </button>
                </div>
              </div>

              <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 8, overflow: "auto", marginBottom: 10 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <colgroup>
                    <col style={{ width: 36 }} />
                    <col style={{ minWidth: 200 }} />
                    <col style={{ width: 110 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 60 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 90 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ background: "#f9fafb", padding: "8px 10px", textAlign: "center", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb" }}>No</th>
                      <th style={{ background: "#f9fafb", padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb" }}>Item code</th>
                      <th style={{ background: "#f9fafb", padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb" }}>Required by</th>
                      <th style={{ background: "#f9fafb", padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb" }}>Qty</th>
                      <th style={{ background: "#f9fafb", padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb" }}>UOM</th>
                      <th style={{ background: "#f9fafb", padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb" }}>Rate (₹)</th>
                      <th style={{ background: "#f9fafb", padding: "8px 10px", textAlign: "right", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb" }}>Amount</th>
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

              <button style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, padding: "5px 10px", borderRadius: 6, cursor: "pointer", border: "0.5px solid #644634", background: "#644634", color: "#fff" }} onClick={addItemRow}>
                <Icon name="plus" style={{ fontSize: 13 }} /> Add row
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "10px 14px", background: "#f9fafb", borderRadius: 8, marginTop: 12, border: "0.5px solid #e5e7eb", flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Total qty: <strong style={{ color: "#111827", fontWeight: 500 }}>{totalQty}</strong></div>
                <div style={{ height: 14, width: 1, background: "#e5e7eb" }} />
                <div style={{ fontSize: 12, color: "#6b7280" }}>Grand total: <strong style={{ color: "#27500A", fontSize: 14, fontWeight: 500 }}>{fmtCurrency(calculateGrandTotal())}</strong></div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 10, marginTop: 16 }}>Taxes &amp; charges</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginTop: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={fl}>Tax category</label><input style={fc} type="text" placeholder="Tax category" value={newOrder.taxCategory || ""} onChange={(e) => setNewOrder({ ...newOrder, taxCategory: e.target.value })} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={fl}>Shipping rule</label><input style={fc} type="text" placeholder="Shipping rule" value={newOrder.shippingRule || ""} onChange={(e) => setNewOrder({ ...newOrder, shippingRule: e.target.value })} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={fl}>Incoterm</label><input style={fc} type="text" placeholder="Incoterm" value={newOrder.incoterm || ""} onChange={(e) => setNewOrder({ ...newOrder, incoterm: e.target.value })} /></div>
              </div>
            </div>
          )}

          {/* Tab: Address & Contact */}
          {activeTab === "address" && (
            <div style={{ padding: 20, maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 10, marginTop: 4 }}>Supplier address</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={fl}>Supplier address</label><textarea style={{ ...fc, resize: "vertical" }} rows={3} value={newOrder.supplierAddress || ""} onChange={(e) => setNewOrder({ ...newOrder, supplierAddress: e.target.value })} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={fl}>Supplier contact</label><input style={fc} type="text" value={newOrder.supplierContact || ""} onChange={(e) => setNewOrder({ ...newOrder, supplierContact: e.target.value })} /></div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 10, marginTop: 16 }}>Shipping address</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={fl}>Shipping address</label><textarea style={{ ...fc, resize: "vertical" }} rows={3} value={newOrder.shippingAddress || ""} onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={fl}>Shipping contact</label><input style={fc} type="text" value={newOrder.shippingContact || ""} onChange={(e) => setNewOrder({ ...newOrder, shippingContact: e.target.value })} /></div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 10, marginTop: 16 }}>Company billing</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={fl}>Company billing address</label><textarea style={{ ...fc, resize: "vertical" }} rows={3} value={newOrder.companyBillingAddress || ""} onChange={(e) => setNewOrder({ ...newOrder, companyBillingAddress: e.target.value })} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={fl}>Place of supply</label><input style={fc} type="text" value={newOrder.placeOfSupply || ""} onChange={(e) => setNewOrder({ ...newOrder, placeOfSupply: e.target.value })} /></div>
              </div>
            </div>
          )}

          {/* Tab: Terms */}
          {activeTab === "terms" && (
            <div style={{ padding: 20, maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={fl}>Terms and conditions</label>
                <textarea style={{ ...fc, resize: "vertical" }} rows={10} placeholder="Enter terms and conditions…" value={newOrder.termsAndConditions || ""} onChange={(e) => setNewOrder({ ...newOrder, termsAndConditions: e.target.value })} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "0.5px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Fields marked <span style={{ color: "#E24B4A" }}>*</span> are required</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                style={{ 
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
                  color: "#6b7280" 
                }} 
                onClick={() => { setAddModal(false); setActiveAutocompleteIndex(null); }}
              >
                Cancel
              </button>
              <Button 
                style={{ 
                  backgroundColor: "#644634", 
                  borderColor: "#644634", 
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px"
                }}
                onClick={handleAddOrder}
              >
                <Icon name="check" /> Submit order
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Material Request Selection Modal - Themed */}
      <Modal isOpen={showMRModal} toggle={() => setShowMRModal(false)} centered size="lg" scrollable>
        <ModalHeader toggle={() => setShowMRModal(false)}>Select material request</ModalHeader>
        <ModalBody>
          <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb" }}>
                  <th style={{ padding: "11px 14px", textAlign: "left", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>ID</th>
                  <th style={{ padding: "11px 14px", textAlign: "left", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Title</th>
                  <th style={{ padding: "11px 14px", textAlign: "left", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Status</th>
                  <th style={{ padding: "11px 14px", textAlign: "left", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", width: 90 }}></th>
                </tr>
              </thead>
              <tbody>
                {materialRequests.map((mr, idx) => (
                  <tr key={mr._id} style={{ borderBottom: idx < materialRequests.length - 1 ? "0.5px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "13px 14px", color: "#111827", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle" }}><code style={{ background: "#f9fafb", border: "0.5px solid #e5e7eb", borderRadius: 4, padding: "2px 7px", fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{mr._id}</code></td>
                    <td style={{ padding: "13px 14px", color: "#111827", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle", wordBreak: "break-word", whiteSpace: "normal" }}>{mr.title}</td>
                    <td style={{ padding: "13px 14px", color: "#111827", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle" }}><StatusBadge status={mr.status} /></td>
                    <td style={{ padding: "13px 14px", color: "#111827", borderBottom: "0.5px solid #f3f4f6", verticalAlign: "middle" }}>
                      <button 
                        style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: 6, 
                          fontSize: 13, 
                          fontWeight: 500, 
                          padding: "7px 14px", 
                          borderRadius: 8, 
                          cursor: "pointer", 
                          border: "0.5px solid #644634", 
                          background: "#644634", 
                          color: "#fff" 
                        }} 
                        onClick={() => selectMR(mr)}
                      >
                        Select
                      </button>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        toggle={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order? This action cannot be undone."
        loading={deleteLoading}
      />

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default PurchaseOrderPage;