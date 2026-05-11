import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { useHistory } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./staff.css";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
  DataTable,
} from "../../../components/Component";
import {
  Modal,
  ModalBody,
  ModalHeader,
  FormGroup,
  Label,
  Input,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

// ----------------------------------------------------------------------
// API Base URL (adjust to your backend)
// ----------------------------------------------------------------------
const API_BASE = "http://localhost:8000/api/material-requests";

// Dummy item database for autocomplete
const dummyItemDatabase = [
  { itemCode: 'CUT-4INCH', itemName: '4" CUTTING WHEEL', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: 'CUT-4INCH-HW', itemName: '4" CUTTING WHEEL, HARDWARES', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: 'CUT-14INCH', itemName: '14" CUTTING WHEEL', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "PRIMER-20L", itemName: "PRIMER 20 LTR", uom: "LTR", warehouse: "Stores - SD" },
  { itemCode: "THINNER-5L", itemName: "THINNER 5 LTR", uom: "LTR", warehouse: "Stores - SD" },
  { itemCode: "GS-8.6-045-GRAY", itemName: '8\'6" GALVANIZED SHEET [0.45MM] GRAY COLOUR', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "GS-17.6-045", itemName: '17\'6" GALVANIZED SHEET [0.45MM]', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "TS-6x3.6-1.5-CLEAR", itemName: 'TRANSPARENT SHEET 6\'x3\'6" [1.5MM]: 1.5MM COMPACT CLEAR NATLITE', uom: "SQM", warehouse: "Stores - SD" },
  { itemCode: "CEMENT-50KG", itemName: "CEMENT 50KG BAG", uom: "BAG", warehouse: "Stores - SD" },
  { itemCode: "STEEL-12MM", itemName: "STEEL ROD TMT 12MM", uom: "KG", warehouse: "Stores - SD" },
  { itemCode: "SAND-RIVER", itemName: "RIVER SAND", uom: "TON", warehouse: "Stores - SD" },
  { itemCode: "BRICKS-1000", itemName: "BRICKS (1000 PCS)", uom: "PKT", warehouse: "Stores - SD" },
  { itemCode: "PAINT-PRIMER", itemName: "PAINT PRIMER 20 LTR", uom: "LTR", warehouse: "Stores - SD" },
  { itemCode: "PAINT-WHITE", itemName: "WHITE PAINT 10 LTR", uom: "LTR", warehouse: "Stores - SD" },
];

// ----------------------------------------------------------------------
// Date Helpers: YYYY-MM-DD <-> DD/MM/YYYY
// ----------------------------------------------------------------------
const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const formatDateToYYYYMMDD = (dateStr) => {
  if (!dateStr) return "";
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
};

// Convert YYYY-MM-DD to Date object for react-datepicker
const toDateObject = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  return new Date(`${year}-${month}-${day}T00:00:00`);
};

// Convert Date object to YYYY-MM-DD string
const toYYYYMMDD = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ----------------------------------------------------------------------
// Reusable DatePicker Component (calendar with dd/MM/yyyy)
// ----------------------------------------------------------------------
const CalendarDateInput = ({ value, onChange, placeholder = "dd/mm/yyyy", required = false, id, className }) => {
  const selectedDate = value ? toDateObject(value) : null;

  const handleDateChange = (date) => {
    if (date) {
      const yyyymmdd = toYYYYMMDD(date);
      onChange(yyyymmdd);
    } else {
      onChange("");
    }
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleDateChange}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      className={`form-control ${className || ""}`}
      id={id}
      required={required}
      autoComplete="off"
    />
  );
};

// ----------------------------------------------------------------------
// Autocomplete Item Row Component (with calendar date picker)
// ----------------------------------------------------------------------
const ItemRow = ({ item, index, handleItemChange, handleItemCodeChange, handleKeyDown, selectSuggestion, suggestions, activeSuggestionIndex, setActiveSuggestionIndex, isActive, inputRef }) => {
  return (
    <tr>
      <td style={{ padding: "8px 12px", textAlign: "center", verticalAlign: "middle" }}>
        {item.no || index + 1}
      </td>
      <td style={{ padding: "8px 12px", position: "relative", verticalAlign: "middle" }}>
        <input
          ref={inputRef}
          type="text"
          className="form-control form-control-sm"
          value={item.itemCode}
          onChange={(e) => handleItemCodeChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          placeholder="Search item code or name..."
          autoComplete="off"
          style={{ fontSize: "0.85rem" }}
        />
        {isActive && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "12px",
              right: "12px",
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "0 0 8px 8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              zIndex: 99999,
              maxHeight: "220px",
              overflowY: "auto",
              marginTop: "-1px",
            }}
          >
            {suggestions.map((suggestion, sIdx) => (
              <div
                key={sIdx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(index, suggestion);
                }}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  backgroundColor: sIdx === activeSuggestionIndex ? "#eff6ff" : "#fff",
                  borderBottom: sIdx < suggestions.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
                onMouseEnter={() => setActiveSuggestionIndex(sIdx)}
              >
                <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.85rem", marginBottom: "2px" }}>
                  {suggestion.itemCode}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.78rem" }}>
                  {suggestion.itemName}
                </div>
              </div>
            ))}
          </div>
        )}
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <CalendarDateInput
          value={item.requiredBy}
          onChange={(date) => handleItemChange(index, "requiredBy", date)}
        />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
          placeholder="0.000"
          step="0.001"
          bsSize="sm"
        />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input
          type="text"
          value={item.warehouse}
          onChange={(e) => handleItemChange(index, "warehouse", e.target.value)}
          bsSize="sm"
        />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input
          type="text"
          value={item.uom}
          onChange={(e) => handleItemChange(index, "uom", e.target.value)}
          placeholder="UOM"
          bsSize="sm"
        />
      </td>
    </tr>
  );
};

// ----------------------------------------------------------------------
// Delete Confirmation Modal (same as before)
// ----------------------------------------------------------------------
const ConfirmationModal = ({ isOpen, toggle, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered" size="sm">
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
            {message || "Are you sure you want to delete this item? This action cannot be undone."}
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
            >
              Yes, Delete
            </Button>
            <Button color="secondary" outline onClick={toggle} style={{ padding: "15px 24px" }}>
              Cancel
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const MaterialRequestPage = () => {
  const history = useHistory();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [onSearch, setOnSearch] = useState(false);

  // Modal states
  const [addModal, setAddModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form state
  const [newRequest, setNewRequest] = useState({
    transactionDate: "",
    purpose: "Purchase",
    requiredBy: "",
    priceList: "Standard Buying",
    warehouse: "Stores - SD",
    items: [
      {
        no: 1,
        itemCode: "",
        itemName: "",
        requiredBy: "",
        quantity: 0,
        warehouse: "Stores - SD",
        uom: "",
      },
    ],
  });

  // Autocomplete state
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const itemInputRefs = useRef({});

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState(null);

  // Toast helpers
  const showSuccess = (message) => toast.success(message);
  const showError = (message) => toast.error(message);

  // API Calls (unchanged)
  const fetchMaterialRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE);
      if (response.data.success) {
        setMaterialRequests(response.data.data);
        setFiltered(response.data.data);
      } else {
        console.error("Failed to fetch:", response.data.message);
        showError(response.data.message || "Failed to fetch material requests");
      }
    } catch (error) {
      console.error("API error:", error);
      showError("Error fetching material requests");
    } finally {
      setLoading(false);
    }
  };

  const createMaterialRequest = async (requestData) => {
    try {
      const response = await axios.post(API_BASE, requestData);
      if (response.data.success) {
        await fetchMaterialRequests();
        showSuccess("Material request created successfully");
        return true;
      } else {
        showError(response.data.message || "Creation failed");
        return false;
      }
    } catch (error) {
      console.error("Create error:", error);
      showError("Network error while creating");
      return false;
    }
  };

  const updateMaterialRequest = async (id, requestData) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}`, requestData);
      if (response.data.success) {
        await fetchMaterialRequests();
        showSuccess("Material request updated successfully");
        return true;
      } else {
        showError(response.data.message || "Update failed");
        return false;
      }
    } catch (error) {
      console.error("Update error:", error);
      showError("Network error while updating");
      return false;
    }
  };

  const deleteMaterialRequest = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      if (response.data.success) {
        await fetchMaterialRequests();
        showSuccess("Material request deleted successfully");
        return true;
      } else {
        showError(response.data.message || "Delete failed");
        return false;
      }
    } catch (error) {
      console.error("Delete error:", error);
      showError("Network error while deleting");
      return false;
    }
  };

  useEffect(() => {
    fetchMaterialRequests();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(materialRequests);
    } else {
      const keyword = search.toLowerCase();
      setFiltered(
        materialRequests.filter(
          (req) =>
            req.title?.toLowerCase().includes(keyword) ||
            req._id?.toLowerCase().includes(keyword) ||
            req.purpose?.toLowerCase().includes(keyword)
        )
      );
    }
  }, [search, materialRequests]);

  const sliceTitle = (title, maxLength = 55) => {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + "...";
  };

  const getStatusBadge = (status) => {
    let backgroundColor = "";
    let borderColor = "";
    switch (status) {
      case "Pending":
        backgroundColor = "#f59e0f";
        borderColor = "#d97706";
        break;
      case "Ordered":
        backgroundColor = "#10b981";
        borderColor = "#059669";
        break;
      case "Partially Ordered":
        backgroundColor = "#3b82f6";
        borderColor = "#2563eb";
        break;
      default:
        backgroundColor = "#6b7280";
        borderColor = "#4b5563";
    }
    return (
      <span
        style={{
          backgroundColor,
          border: `1px solid ${borderColor}`,
          color: "#ffffff",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 500,
          whiteSpace: "nowrap",
          display: "inline-block",
          lineHeight: "1.5",
        }}
      >
        {status}
      </span>
    );
  };

  const goToDetails = (request) => {
    history.push(`/material-request-details/${request._id}`, { requestData: request });
  };

  const resetForm = () => {
    setNewRequest({
      transactionDate: "",
      purpose: "Purchase",
      requiredBy: "",
      priceList: "Standard Buying",
      warehouse: "Stores - SD",
      items: [
        {
          no: 1,
          itemCode: "",
          itemName: "",
          requiredBy: "",
          quantity: 0,
          warehouse: "Stores - SD",
          uom: "",
        },
      ],
    });
    setSuggestions([]);
    setActiveAutocompleteIndex(null);
    setActiveSuggestionIndex(-1);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedRequest(null);
    resetForm();
    setAddModal(true);
  };

  const openEditModal = (request) => {
    setModalMode("edit");
    setSelectedRequest(request);
    setNewRequest({
      transactionDate: request.transactionDate || "",
      purpose: request.purpose || "Purchase",
      requiredBy: request.requiredBy || "",
      priceList: request.priceList || "Standard Buying",
      warehouse: request.warehouse || "Stores - SD",
      items: request.items.map((item, idx) => ({
        no: idx + 1,
        itemCode: item.itemCode || "",
        itemName: item.itemName || "",
        requiredBy: item.requiredBy || "",
        quantity: item.quantity || 0,
        warehouse: item.warehouse || "",
        uom: item.uom || "",
      })),
    });
    setAddModal(true);
  };

  const handleAddRequest = async () => {
    if (!newRequest.transactionDate) return showError("Transaction Date is required");
    if (!newRequest.requiredBy) return showError("Required By date is required");
    if (!newRequest.purpose) return showError("Purpose is required");
    if (newRequest.items.length === 0) return showError("At least one item is required");
    for (let i = 0; i < newRequest.items.length; i++) {
      const item = newRequest.items[i];
      if (!item.itemCode) return showError(`Item ${i+1}: Item Code is required`);
      if (!item.requiredBy) return showError(`Item ${i+1}: Required By date is required`);
      if (!item.quantity || item.quantity <= 0) return showError(`Item ${i+1}: Quantity must be greater than 0`);
      if (!item.uom) return showError(`Item ${i+1}: UOM is required`);
    }

    const dataToSend = {
      transactionDate: newRequest.transactionDate,
      purpose: newRequest.purpose,
      requiredBy: newRequest.requiredBy,
      priceList: newRequest.priceList,
      warehouse: newRequest.warehouse,
      items: newRequest.items.map(({ no, ...rest }) => rest),
    };

    let success = false;
    if (modalMode === "add") {
      success = await createMaterialRequest(dataToSend);
    } else {
      success = await updateMaterialRequest(selectedRequest._id, dataToSend);
    }
    if (success) {
      setAddModal(false);
      resetForm();
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteRequestId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteRequestId) {
      await deleteMaterialRequest(deleteRequestId);
      setShowDeleteConfirm(false);
      setDeleteRequestId(null);
    }
  };

  const handleItemCodeChange = (index, value) => {
    const updatedItems = [...newRequest.items];
    updatedItems[index].itemCode = value;
    setNewRequest((prev) => ({ ...prev, items: updatedItems }));

    if (value && value.trim().length > 0) {
      const filtered = dummyItemDatabase.filter(
        (item) =>
          item.itemCode?.toLowerCase().includes(value.toLowerCase()) ||
          item.itemName?.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setActiveAutocompleteIndex(index);
      setActiveSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setActiveAutocompleteIndex(null);
      setActiveSuggestionIndex(-1);
    }
  };

  const selectSuggestion = (index, item) => {
    const updatedItems = [...newRequest.items];
    updatedItems[index] = {
      ...updatedItems[index],
      itemCode: item.itemCode,
      itemName: item.itemName,
      uom: item.uom,
      warehouse: item.warehouse || updatedItems[index].warehouse,
    };
    setNewRequest((prev) => ({ ...prev, items: updatedItems }));
    setSuggestions([]);
    setActiveAutocompleteIndex(null);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e, index) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        selectSuggestion(index, suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveAutocompleteIndex(null);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newRequest.items];
    updatedItems[index][field] = value;
    setNewRequest((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItemRow = () => {
    setNewRequest((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          no: prev.items.length + 1,
          itemCode: "",
          itemName: "",
          requiredBy: prev.requiredBy || "",
          quantity: 0,
          warehouse: prev.warehouse || "Stores - SD",
          uom: "",
        },
      ],
    }));
  };

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <>
      <Head title="Material Request" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Material Request</BlockTitle>
            </BlockHeadContent>
            <Button color="primary" onClick={openAddModal}>
              <Icon name="plus" /> Add Material Request
            </Button>
          </BlockBetween>
        </BlockHead>

        <Block>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #e5e7eb",
                  borderTopColor: "#3b82f6",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p style={{ color: "#6b7280" }}>Loading material requests...</p>
            </div>
          ) : (
            <DataTable className="card-stretch w-100">
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools mr-n1">
                    <ul className="btn-toolbar gx-1">
                      <li>
                        <a
                          href="#search"
                          onClick={(ev) => {
                            ev.preventDefault();
                            setOnSearch(true);
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
                        placeholder="Search by title, ID or purpose"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: "0 20px 20px" }}>
                <div
                  style={{
                    borderRadius: "8px",
                    marginTop: "20px",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.88rem",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "30%" }}>
                          Title
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "12%" }}>
                          Status
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "12%" }}>
                          Purpose
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "12%" }}>
                          Required By
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "15%" }}>
                          ID
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#374151", width: "10%" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length > 0 ? (
                        filtered.map((req, idx) => (
                          <tr key={req._id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <button
                                onClick={() => goToDetails(req)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#2563eb",
                                  cursor: "pointer",
                                  fontWeight: 500,
                                  textAlign: "left",
                                  padding: 0,
                                  wordBreak: "break-word",
                                  lineHeight: "1.4",
                                  fontSize: "0.88rem",
                                }}
                                title={req.title}
                              >
                                {sliceTitle(req.title, 55)}
                              </button>
                            </td>
                            <td style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "500", color: "white" }}>
                              {getStatusBadge(req.status)}
                            </td>
                            <td style={{ padding: "14px 16px", color: "#374151", fontWeight: 500 }}>
                              {req.purpose}
                            </td>
                            <td style={{ padding: "14px 16px", color: "#374151", fontSize: "0.85rem" }}>
                              {formatDateToDDMMYYYY(req.requiredBy)}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <code style={{
                                backgroundColor: "#f9fafb",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                fontSize: "0.82rem",
                                color: "#374151",
                                border: "1px solid #e5e7eb",
                                fontWeight: 600,
                              }}>
                                {req._id}
                              </code>
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "center" }}>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
                                  <Icon name="more-h" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                  <DropdownItem onClick={() => openEditModal(req)}>
                                    <Icon name="edit" /> Edit
                                  </DropdownItem>
                                  <DropdownItem onClick={() => handleDeleteClick(req._id)}>
                                    <Icon name="trash" /> Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>
                            No material requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </DataTable>
          )}
        </Block>
      </Content>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={addModal}
        toggle={() => {
          setAddModal(false);
          resetForm();
        }}
        centered
        size="xl"
        backdrop="static"
      >
        <ModalHeader
          toggle={() => {
            setAddModal(false);
            resetForm();
          }}
        >
          {modalMode === "add" ? "New Material Request" : "Edit Material Request"}
        </ModalHeader>
        <ModalBody>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <FormGroup>
                <Label for="transactionDate">Transaction Date *</Label>
                <CalendarDateInput
                  id="transactionDate"
                  value={newRequest.transactionDate}
                  onChange={(date) => setNewRequest({ ...newRequest, transactionDate: date })}
                />
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup>
                <Label for="purpose">Purpose *</Label>
                <Input
                  type="select"
                  id="purpose"
                  value={newRequest.purpose}
                  onChange={(e) => setNewRequest({ ...newRequest, purpose: e.target.value })}
                >
                  <option>Purchase</option>
                  <option>Material Transfer</option>
                  <option>Material Issue</option>
                  <option>Manufacture</option>
                  <option>Customer Provided</option>
                </Input>
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup>
                <Label for="requiredBy">Required By *</Label>
                <CalendarDateInput
                  id="requiredBy"
                  value={newRequest.requiredBy}
                  onChange={(date) => setNewRequest({ ...newRequest, requiredBy: date })}
                />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="priceList">Price List</Label>
                <Input
                  type="text"
                  id="priceList"
                  value={newRequest.priceList}
                  onChange={(e) => setNewRequest({ ...newRequest, priceList: e.target.value })}
                />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="warehouse">Set Warehouse</Label>
                <Input
                  type="text"
                  id="warehouse"
                  value={newRequest.warehouse}
                  onChange={(e) => setNewRequest({ ...newRequest, warehouse: e.target.value })}
                />
              </FormGroup>
            </div>
          </div>

          <h6 style={{ fontWeight: 600, marginBottom: "12px", marginTop: "10px" }}>Add Materials</h6>
          <div
            style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "visible",
              marginBottom: "16px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th style={{ padding: "10px 12px", width: "50px" }}>No.</th>
                  <th style={{ padding: "10px 12px", minWidth: "200px" }}>Item Code *</th>
                  <th style={{ padding: "10px 12px", width: "150px" }}>Required By *</th>
                  <th style={{ padding: "10px 12px", width: "120px" }}>Quantity *</th>
                  <th style={{ padding: "10px 12px", minWidth: "150px" }}>Warehouse</th>
                  <th style={{ padding: "10px 12px", width: "100px" }}>UOM *</th>
                </tr>
              </thead>
              <tbody>
                {newRequest.items.map((item, index) => (
                  <ItemRow
                    key={index}
                    item={item}
                    index={index}
                    handleItemChange={handleItemChange}
                    handleItemCodeChange={handleItemCodeChange}
                    handleKeyDown={handleKeyDown}
                    selectSuggestion={selectSuggestion}
                    suggestions={suggestions}
                    activeSuggestionIndex={activeSuggestionIndex}
                    setActiveSuggestionIndex={setActiveSuggestionIndex}
                    isActive={activeAutocompleteIndex === index}
                    inputRef={(el) => (itemInputRefs.current[index] = el)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <Button color="light" style={{ padding: "12px" }} onClick={addItemRow}>
                <Icon name="plus" /> Add Row
              </Button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Button
                color="secondary"
                onClick={() => {
                  setAddModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button color="primary" onClick={handleAddRequest}>
                {modalMode === "add" ? "Submit Request" : "Update Request"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        toggle={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Material Request"
        message="Are you sure you want to delete this material request? This action cannot be undone."
      />

      {/* Toast Container - position top center */}
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
        .Toastify__toast-container {
          z-index: 999999;
        }
      `}</style>
    </>
  );
};

export default MaterialRequestPage;