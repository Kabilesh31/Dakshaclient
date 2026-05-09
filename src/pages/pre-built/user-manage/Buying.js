// Buying.jsx
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
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
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
  Col,
  Input,
  Label,
  Spinner,
} from "reactstrap";

// API Base URL - Change this to your backend URL
const API_BASE_URL = `${process.env.REACT_APP_BACKENDURL}/api`

// ----------------------------------------------------------------------
// Dummy data - EXPORTED for backward compatibility with BuyingDetails
// ----------------------------------------------------------------------
export const initialItems = [
  {
    id: "STL001",
    itemCode: "STL-ROD-12",
    name: "Steel Rod 12mm",
    status: "Enabled",
    group: "Steel",
    hsnSac: "72072090",
    unitMeasure: "KG",
    maintainStock: true,
    isFixedAsset: false,
  },
  {
    id: "HRD002",
    itemCode: "HRD-HAMMER",
    name: "Ball Peen Hammer",
    status: "Enabled",
    group: "Hardware",
    hsnSac: "82052000",
    unitMeasure: "PCS",
    maintainStock: true,
    isFixedAsset: false,
  },
  {
    id: "WDN003",
    itemCode: "WDN-PLY-18",
    name: "Plywood 18mm",
    status: "Disabled",
    group: "Wooden",
    hsnSac: "44121000",
    unitMeasure: "SHEET",
    maintainStock: false,
    isFixedAsset: false,
  },
  {
    id: "MTL004",
    itemCode: "MTL-AL-2",
    name: "Aluminium Sheet 2mm",
    status: "Enabled",
    group: "Metal",
    hsnSac: "76061190",
    unitMeasure: "KG",
    maintainStock: true,
    isFixedAsset: false,
  },
  {
    id: "STL005",
    itemCode: "STL-ANGLE-50",
    name: "Angle Iron 50x50",
    status: "Enabled",
    group: "Steel",
    hsnSac: "72162100",
    unitMeasure: "MTR",
    maintainStock: true,
    isFixedAsset: false,
  },
  {
    id: "HRD006",
    itemCode: "HRD-WRENCH",
    name: "Adjustable Wrench",
    status: "Disabled",
    group: "Hardware",
    hsnSac: "82041110",
    unitMeasure: "PCS",
    maintainStock: false,
    isFixedAsset: true,
  },
  {
    id: "WDN007",
    itemCode: "WDN-LAM",
    name: "Laminate Sheet",
    status: "Enabled",
    group: "Wooden",
    hsnSac: "39203090",
    unitMeasure: "SHEET",
    maintainStock: true,
    isFixedAsset: false,
  },
  {
    id: "MTL008",
    itemCode: "MTL-CU-5",
    name: "Copper Sheet 5mm",
    status: "Enabled",
    group: "Metal",
    hsnSac: "74091900",
    unitMeasure: "KG",
    maintainStock: false,
    isFixedAsset: true,
  },
];

// ----------------------------------------------------------------------
// Options for selects
// ----------------------------------------------------------------------
const groupOptions = [
  { value: "Hardware", label: "Hardware" },
  { value: "Steel", label: "Steel" },
  { value: "Wooden", label: "Wooden" },
  { value: "Metal", label: "Metal" },
];

const unitOptions = [
  { value: "Bundle", label: "Bundle" },
  { value: "BOX", label: "Box" },
  { value: "Case", label: "Case" },
  { value: "GRM", label: "Gram" },
  { value: "Kg", label: "Kg" },
  { value: "LTR", label: "Liter (LTR)" },
  { value: "MTR", label: "Meter (MTR)" },
  { value: "Nos", label: "Nos" },
];

const statusOptions = [
  { value: "Enabled", label: "Enabled" },
  { value: "Disabled", label: "Disabled" },
];

// ----------------------------------------------------------------------
// Confirmation Modal Component
// ----------------------------------------------------------------------
const ConfirmationModal = ({ isOpen, toggle, onConfirm, title, message, loading }) => {
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
          <p className="text-muted mb-4">{message || "Are you sure you want to delete this item? This action cannot be undone."}</p>
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

// ----------------------------------------------------------------------
// Item Form Modal
// ----------------------------------------------------------------------
const ItemFormModal = ({ isOpen, mode, initialData, onClose, onSave, loading }) => {
  const [itemCode, setItemCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null);
  const [group, setGroup] = useState(null);
  const [hsnSac, setHsnSac] = useState("");
  const [unitMeasure, setUnitMeasure] = useState(null);
  const [maintainStock, setMaintainStock] = useState(false);
  const [isFixedAsset, setIsFixedAsset] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setItemCode(initialData.itemCode || "");
      setName(initialData.name || "");
      setStatus({ value: initialData.status, label: initialData.status });
      setGroup({ value: initialData.group, label: initialData.group });
      setHsnSac(initialData.hsnSac || "");
      setUnitMeasure(
        unitOptions.find((opt) => opt.value === initialData.unitMeasure) || null
      );
      setMaintainStock(initialData.maintainStock || false);
      setIsFixedAsset(initialData.isFixedAsset || false);
    } else {
      setItemCode("");
      setName("");
      setStatus(null);
      setGroup(null);
      setHsnSac("");
      setUnitMeasure(null);
      setMaintainStock(false);
      setIsFixedAsset(false);
    }
  }, [mode, initialData, isOpen]);

  const handleClose = () => onClose();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemCode.trim()) {
      alert("Please enter item code");
      return;
    }
    if (!name.trim()) {
      alert("Please enter item name");
      return;
    }
    if (!status) {
      alert("Please select status");
      return;
    }
    if (!group) {
      alert("Please select item group");
      return;
    }
    if (!unitMeasure) {
      alert("Please select default unit of measure");
      return;
    }

    const itemData = {
      itemCode: itemCode.trim(),
      name: name.trim(),
      status: status.value,
      group: group.value,
      hsnSac: hsnSac.trim(),
      unitMeasure: unitMeasure.value,
      maintainStock,
      isFixedAsset,
    };

    await onSave(itemData);
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} className="modal-dialog-centered" size="lg">
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
            handleClose();
          }}
          className="close"
        >
          <Icon name="cross-sm" />
        </a>
        <div className="p-2">
          <h5 className="title">{mode === "add" ? "Add Item" : "Edit Item"}</h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit}>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Item Code *</Label>
                  <Input
                    type="text"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    placeholder="Enter item code"
                    required
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Item Name *</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter item name"
                    required
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Status *</Label>
                  <RSelect
                    options={statusOptions}
                    value={status}
                    onChange={(opt) => setStatus(opt)}
                    placeholder="Select Status"
                    isDisabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Item Group *</Label>
                  <RSelect
                    options={groupOptions}
                    value={group}
                    onChange={(opt) => setGroup(opt)}
                    placeholder="Select Group"
                    isDisabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">HSN/SAC Code</Label>
                  <Input
                    type="text"
                    value={hsnSac}
                    onChange={(e) => setHsnSac(e.target.value)}
                    placeholder="Enter HSN/SAC code"
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Default Unit of Measure *</Label>
                  <RSelect
                    options={unitOptions}
                    value={unitMeasure}
                    onChange={(opt) => setUnitMeasure(opt)}
                    placeholder="Select Unit"
                    isDisabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={maintainStock}
                      onChange={(e) => setMaintainStock(e.target.checked)}
                      disabled={loading}
                    />{" "}
                    Maintain Stock
                  </Label>
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={isFixedAsset}
                      onChange={(e) => setIsFixedAsset(e.target.checked)}
                      disabled={loading}
                    />{" "}
                    Is Fixed Asset
                  </Label>
                </FormGroup>
              </Col>
              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button
                      className="btn-icon"
                      style={{
                        backgroundColor: "#644634",
                        borderColor: "#800000",
                        color: "#fff",
                        padding: "6px 20px",
                      }}
                      size="md"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" /> : (mode === "add" ? "Add Item" : "Update Item")}
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        handleClose();
                      }}
                      className="link link-light"
                    >
                      Cancel
                    </a>
                  </li>
                </ul>
              </Col>
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

// ----------------------------------------------------------------------
// Main Buying Component
// ----------------------------------------------------------------------
const Buying = () => {
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [availableGroups, setAvailableGroups] = useState([]);
  const itemPerPage = 10;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  // API Functions
  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/items?page=${currentPage}&limit=${itemPerPage}`;
      if (search) url += `&search=${search}`;
      if (statusFilter !== "All") url += `&status=${statusFilter}`;
      if (groupFilter !== "All") url += `&group=${groupFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setItems(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
        if (data.filters?.groups) {
          setAvailableGroups(data.filters.groups);
        }
      } else {
        alert(data.message || "Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      alert("Error fetching items");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/groups`);
      const data = await response.json();
      if (data.success) {
        setAvailableGroups(data.data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const createItem = async (itemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating item:", error);
      throw error;
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentPage, search, statusFilter, groupFilter]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAdd = () => {
    setModalMode("add");
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setModalMode("edit");
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteItemId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId) return;
    
    setDeleteLoading(true);
    try {
      const response = await deleteItem(deleteItemId);
      if (response.success) {
        alert("Item deleted successfully");
        fetchItems();
      } else {
        alert(response.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item");
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setDeleteItemId(null);
    }
  };

  const handleSave = async (itemData) => {
    setFormLoading(true);
    try {
      let response;
      if (modalMode === "add") {
        response = await createItem(itemData);
        if (response.success) {
          alert("Item created successfully");
        }
      } else {
        response = await updateItem(editingItem._id || editingItem.id, itemData);
        if (response.success) {
          alert("Item updated successfully");
        }
      }
      
      if (response.success) {
        setIsModalOpen(false);
        fetchItems();
      } else {
        alert(response.message || "Failed to save item");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving item");
    } finally {
      setFormLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setGroupFilter("All");
    setOnSearch(false);
    setCurrentPage(1);
  };

  const statusColor = (status) => (status === "Enabled" ? "success" : "danger");

  const handleNameClick = (item) => {
    sessionStorage.setItem("selectedItem", JSON.stringify(item));
    history.push(`/Buying/${item._id || item.id}`, { item });
  };

  // Get current items for pagination
  const indexOfFirst = (currentPage - 1) * itemPerPage;

  return (
    <>
      <Head title="Items" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Items</BlockTitle>
              <p className="text-muted">Total Items: {totalItems}</p>
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
                  onClick={handleAdd}
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
                    {/* Status Filter */}
                    <div className="form-wrap">
                      <select
                        className="form-control"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{ minWidth: "120px" }}
                      >
                        <option value="All">All Status</option>
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </div>
                    
                    {/* Group Filter */}
                    <div className="form-wrap">
                      <select
                        className="form-control"
                        value={groupFilter}
                        onChange={(e) => {
                          setGroupFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{ minWidth: "120px" }}
                      >
                        <option value="All">All Groups</option>
                        {availableGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                    
                    {(search || statusFilter !== "All" || groupFilter !== "All") && (
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
                      placeholder="Search by name, code or ID"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {loading && (
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2">Loading items...</p>
              </div>
            )}

            {/* Items Table */}
            {!loading && (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e0e0e0", textAlign: "left" }}>
                        <th className="px-3 py-2 text-center">S.No</th>
                        <th className="px-4 py-2 text-start">Item Name</th>
                        <th className="px-4 py-2 text-center">Status</th>
                        <th className="px-4 py-2 text-start">Item Group</th>
                        <th className="px-4 py-2 text-start">Item Code</th>
                        <th className="px-4 py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? (
                        items.map((item, idx) => (
                          <tr
                            key={item._id || item.id}
                            style={{
                              borderTop: "1px solid #e0e0e0",
                              borderBottom: "1px solid #e0e0e0",
                            }}
                          >
                            <td className="px-3 py-2 text-center">{indexOfFirst + idx + 1}</td>
                            <td className="px-4 py-2 text-start fw-semibold">
                              <button
                                onClick={() => handleNameClick(item)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#2563eb",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  padding: 0,
                                  fontSize: "inherit",
                                }}
                              >
                                {item.name}
                              </button>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span
                                className={`badge bg-${statusColor(item.status)}`}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  color: "white",
                                }}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-start">
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  backgroundColor: "#e0f2fe",
                                  color: "#0369a1",
                                  borderRadius: "20px",
                                }}
                              >
                                {item.group}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-start">
                              <code>{item.itemCode}</code>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
                                  <Icon name="more-h" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                  <DropdownItem onClick={() => handleEdit(item)}>
                                    <Icon name="edit" /> Edit
                                  </DropdownItem>
                                  <DropdownItem onClick={() => handleDeleteClick(item._id || item.id)}>
                                    <Icon name="trash" /> Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalItems > 0 && totalPages > 1 && (
                  <div className="card-inner">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted">
                          Showing {indexOfFirst + 1} to {Math.min(indexOfFirst + itemPerPage, totalItems)} of {totalItems} items
                        </span>
                      </div>
                      <div className="d-flex justify-content-center align-items-center">
                        <button
                          className="btn btn-icon btn-sm btn-outline-light mx-1"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                        >
                          <em className="icon ni ni-chevron-left"></em>
                        </button>
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          if (
                            page === currentPage ||
                            page === currentPage - 1 ||
                            page === currentPage + 1 ||
                            page === 1 ||
                            page === totalPages
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`btn btn-sm mx-1 ${
                                  currentPage === page ? "btn-primary" : "btn-outline-light"
                                }`}
                                style={{ minWidth: "36px", borderRadius: "6px", fontWeight: 500 }}
                              >
                                {page}
                              </button>
                            );
                          }
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="mx-1">...</span>;
                          }
                          return null;
                        })}
                        <button
                          className="btn btn-icon btn-sm btn-outline-light mx-1"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          <em className="icon ni ni-chevron-right"></em>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </DataTable>
        </Block>
      </Content>

      {/* Add/Edit Modal */}
      <ItemFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        loading={formLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        toggle={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        loading={deleteLoading}
      />
    </>
  );
};

export default Buying;