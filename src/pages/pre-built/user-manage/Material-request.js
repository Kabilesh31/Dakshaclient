import React, { useEffect, useState, useRef, useMemo } from "react";
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
  RSelect,
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
  Spinner,
} from "reactstrap";


const API_BASE = `${process.env.REACT_APP_BACKENDURL}/api/material-requests`;
const PROJECT_API_BASE = `${process.env.REACT_APP_BACKENDURL}/api/projects`;

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

// Date Helpers
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

const toDateObject = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  return new Date(`${year}-${month}-${day}T00:00:00`);
};

const toYYYYMMDD = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Reusable DatePicker
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

// Autocomplete Item Row
const ItemRow = ({ item, index, handleItemChange, handleItemCodeChange, handleKeyDown, selectSuggestion, suggestions, activeSuggestionIndex, setActiveSuggestionIndex, isActive, inputRef }) => {
  return (
    <tr>
      <td style={{ padding: "8px 12px", textAlign: "center", verticalAlign: "middle" }}>{item.no || index + 1}</td>
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
                <div style={{ color: "#6b7280", fontSize: "0.78rem" }}>{suggestion.itemName}</div>
              </div>
            ))}
          </div>
        )}
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <CalendarDateInput value={item.requiredBy} onChange={(date) => handleItemChange(index, "requiredBy", date)} />
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
        <Input type="text" value={item.warehouse} onChange={(e) => handleItemChange(index, "warehouse", e.target.value)} bsSize="sm" />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input type="text" value={item.uom} onChange={(e) => handleItemChange(index, "uom", e.target.value)} placeholder="UOM" bsSize="sm" />
      </td>
    </tr>
  );
};

// Confirmation Modal
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
            <Icon name="alert-circle" style={{ fontSize: "3rem", color: "#4B5694" }} />
          </div>
          <h5 className="title mb-2">{title || "Confirm Delete"}</h5>
          <p className="text-muted mb-4">
            {message || "Are you sure you want to delete this item? This action cannot be undone."}
          </p>
          <div className="d-flex gap-8 justify-content-center">
            <Button
              style={{
                backgroundColor: "#4B5694",
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

// Main Component
const MaterialRequestPage = () => {
  const history = useHistory();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [purposeFilter, setPurposeFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [onSearch, setOnSearch] = useState(false);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [newRequest, setNewRequest] = useState({
    transactionDate: "",
    purpose: "Purchase",
    requiredBy: "",
    priceList: "Standard Buying",
    warehouse: "Stores - SD",
    project: "",
    projectId: "",
    items: [{ no: 1, itemCode: "", itemName: "", requiredBy: "", quantity: 0, warehouse: "Stores - SD", uom: "" }],
  });

  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const itemInputRefs = useRef({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState(null);

  const [uniquePurposes, setUniquePurposes] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);

  // Filter options for RSelect
  const statusFilterOptions = useMemo(() => {
    return [
      { value: "All", label: "All Status" },
      ...uniqueStatuses.map(s => ({ value: s, label: s })),
    ];
  }, [uniqueStatuses]);

  const purposeFilterOptions = useMemo(() => {
    return [
      { value: "All", label: "All Purposes" },
      ...uniquePurposes.map(p => ({ value: p, label: p })),
    ];
  }, [uniquePurposes]);

  // Project options for RSelect
  const projectOptions = useMemo(() => {
    return projects.map(p => ({
      value: p._id,
      label: p.name || p.title || p._id,
      projectName: p.name || p.title || p._id,
    }));
  }, [projects]);

  const selectedStatusFilter = statusFilterOptions.find(opt => opt.value === statusFilter);
  const selectedPurposeFilter = purposeFilterOptions.find(opt => opt.value === purposeFilter);
  const selectedProject = projectOptions.find(opt => opt.value === newRequest.projectId);

  const showSuccess = (message) => toast.success(message);
  const showError = (message) => toast.error(message);

  // Fetch Projects
  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await axios.get(PROJECT_API_BASE);
      if (response.data.success) {
        setProjects(response.data.data || []);
      } else {
        console.error("Failed to fetch projects:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  // API Calls
  const fetchMaterialRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE);
      if (response.data.success) {
        setMaterialRequests(response.data.data);
        const purposes = new Set();
        const statuses = new Set();
        response.data.data.forEach(req => {
          if (req.purpose) purposes.add(req.purpose);
          if (req.status) statuses.add(req.status);
        });
        setUniquePurposes(Array.from(purposes).sort());
        setUniqueStatuses(Array.from(statuses).sort());
      } else {
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
    setDeleteLoading(true);
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
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialRequests();
    fetchProjects();
  }, []);

  useEffect(() => {
    let result = [...materialRequests];
    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      result = result.filter(
        (req) =>
          req.title?.toLowerCase().includes(keyword) ||
          req._id?.toLowerCase().includes(keyword) ||
          req.purpose?.toLowerCase().includes(keyword) ||
          req.status?.toLowerCase().includes(keyword) ||
          req.project?.toLowerCase().includes(keyword)
      );
    }
    if (statusFilter !== "All") result = result.filter((req) => req.status === statusFilter);
    if (purposeFilter !== "All") result = result.filter((req) => req.purpose === purposeFilter);
    setFiltered(result);
  }, [search, statusFilter, purposeFilter, materialRequests]);

  const sliceTitle = (title, maxLength = 55) => {
    if (!title) return "";
    return title.length <= maxLength ? title : title.slice(0, maxLength) + "...";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "#f59e0f";
      case "Ordered": return "#10b981";
      case "Partially Ordered": return "#3b82f6";
      default: return "#6b7280";
    }
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
      project: "",
      projectId: "",
      items: [{ no: 1, itemCode: "", itemName: "", requiredBy: "", quantity: 0, warehouse: "Stores - SD", uom: "" }],
    });
    setSuggestions([]);
    setActiveAutocompleteIndex(null);
    setActiveSuggestionIndex(-1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPurposeFilter("All");
    setOnSearch(false);
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
      project: request.project || "",
      projectId: request.projectId || "",
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
    if (!newRequest.projectId) return showError("Project is required");
    if (newRequest.items.length === 0) return showError("At least one item is required");
    for (let i = 0; i < newRequest.items.length; i++) {
      const item = newRequest.items[i];
      if (!item.itemCode) return showError(`Item ${i+1}: Item Code is required`);
      if (!item.requiredBy) return showError(`Item ${i+1}: Required By date is required`);
      if (!item.quantity || item.quantity <= 0) return showError(`Item ${i+1}: Quantity must be greater than 0`);
      if (!item.uom) return showError(`Item ${i+1}: UOM is required`);
    }
    
    // Get the project name from selected project
    const selectedProjectObj = projectOptions.find(p => p.value === newRequest.projectId);
    
    const dataToSend = {
      transactionDate: newRequest.transactionDate,
      purpose: newRequest.purpose,
      requiredBy: newRequest.requiredBy,
      priceList: newRequest.priceList,
      warehouse: newRequest.warehouse,
      project: selectedProjectObj?.projectName || newRequest.project || "",
      projectId: newRequest.projectId,
      items: newRequest.items.map(({ no, ...rest }) => rest),
    };
    
    let success = false;
    if (modalMode === "add") success = await createMaterialRequest(dataToSend);
    else success = await updateMaterialRequest(selectedRequest._id, dataToSend);
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

  // Handle project selection
  const handleProjectChange = (selectedOption) => {
    if (selectedOption) {
      setNewRequest({
        ...newRequest,
        projectId: selectedOption.value,
        project: selectedOption.projectName || selectedOption.label,
      });
    } else {
      setNewRequest({
        ...newRequest,
        projectId: "",
        project: "",
      });
    }
  };

  return (
    <>
      <Head title="Material Request" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Material Request</BlockTitle>
              <p className="text-muted">Total Requests: {filtered.length}</p>
            </BlockHeadContent>
        
             <Button
                className="btn-icon"
                style={{
                  backgroundColor: "#4B5694",
                  color: "#fff"
                }}
                onClick={openAddModal}
              >
                <Icon name="plus" />
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
                      {/* Purpose Filter - RSelect */}
                      <div className="form-wrap" style={{ minWidth: "180px" }}>
                        <RSelect
                          options={purposeFilterOptions}
                          value={selectedPurposeFilter}
                          onChange={(opt) => setPurposeFilter(opt?.value || "All")}
                          placeholder="Select Purpose"
                          isClearable={false}
                          classNamePrefix="react-select"
                        />
                      </div>
                      {(search || statusFilter !== "All" || purposeFilter !== "All") && (
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
                        placeholder="Search by title, ID, purpose, status or project"
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
                      <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#374151", width: "5%" }}>
                          S.No
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "20%" }}>
                          Title
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "12%" }}>
                          Project
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "10%" }}>
                          Status
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "10%" }}>
                          Purpose
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "10%" }}>
                          Required Date
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "12%" }}>
                          ID
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#374151", width: "8%" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length > 0 ? (
                        filtered.map((req, idx) => (
                          <tr key={req._id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                            <td style={{ padding: "14px 16px", textAlign: "center", color: "#6b7280", fontSize: "0.85rem" }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <button
                                onClick={() => goToDetails(req)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#4a568c",
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
                                {sliceTitle(req.title, 45)}
                              </button>
                            </td>
                            <td style={{ padding: "14px 16px", color: "#374151", fontSize: "0.85rem" }}>
                              {sliceTitle(req.project || "N/A", 20)}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  color: getStatusColor(req.status),
                                  fontWeight: "600",
                                  fontSize: "13px"
                                }}
                              >
                                {req.status}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", color: "#374151", fontWeight: 500 }}>{req.purpose}</td>
                            <td style={{ padding: "14px 16px", color: "#374151", fontSize: "0.85rem" }}>
                              {formatDateToDDMMYYYY(req.requiredBy)}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <code
                                style={{
                                  backgroundColor: "#f9fafb",
                                  padding: "4px 10px",
                                  borderRadius: "4px",
                                  fontSize: "0.82rem",
                                  color: "#374151",
                                  border: "1px solid #e5e7eb",
                                  fontWeight: 600,
                                }}
                              >
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
                          <td colSpan="8" style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>
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
        className="material-request-modal"
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
                <Label for="requiredBy">Required Date *</Label>
                <CalendarDateInput
                  id="requiredBy"
                  value={newRequest.requiredBy}
                  onChange={(date) => setNewRequest({ ...newRequest, requiredBy: date })}
                />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="project">Project *</Label>
                <RSelect
                  options={projectOptions}
                  value={selectedProject}
                  onChange={handleProjectChange}
                  placeholder={projectsLoading ? "Loading projects..." : "Select a project..."}
                  isClearable={true}
                  isLoading={projectsLoading}
                  classNamePrefix="react-select"
                  noOptionsMessage={() => projectsLoading ? "Loading..." : "No projects found"}
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
          </div>

          <h6 style={{ fontWeight: 600, marginBottom: "12px", marginTop: "30px" }}>Add Materials</h6>
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
            <div className="d-flex mb-5 gap-2">
              <Button color="primary" style={{ padding: "12px" }} onClick={addItemRow}>
                <Icon name="plus" /> Add Row
              </Button>
            </div>
            <div className="d-flex gap-2 mt-5 align-items-center">
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

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        toggle={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Material Request"
        message="Are you sure you want to delete this material request? This action cannot be undone."
        loading={deleteLoading}
      />

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
        .material-request-modal .modal-dialog {
          max-width: 95%;
          height: 75vh;
          margin: 1rem auto;
        }
        .material-request-modal .modal-content {
          height: 75vh;
          border-radius: 12px;
        }
        .material-request-modal .modal-body {
          overflow-y: auto;
          max-height: calc(75vh - 120px);
          padding: 20px;
        }
      `}</style>
    </>
  );
};

export default MaterialRequestPage;