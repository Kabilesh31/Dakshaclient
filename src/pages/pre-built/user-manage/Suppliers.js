import React, { useState, useMemo, useEffect } from "react";
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

// API Base URL (adjust to your proxy)
const API_BASE = `${process.env.REACT_APP_BACKENDURL}/api/suppliers`;

const supplierTypeOptions = [
  { value: "Manufacturer", label: "Manufacturer" },
  { value: "Wholesaler", label: "Wholesaler" },
  { value: "Retailer", label: "Retailer" },
  { value: "Distributor", label: "Distributor" },
  { value: "Service Provider", label: "Service Provider" },
];

const gstCategoryOptions = [
  { value: "Registered", label: "Registered" },
  { value: "Unregistered", label: "Unregistered" },
  { value: "Composition", label: "Composition" },
  { value: "Casual", label: "Casual" },
  { value: "Non-Resident", label: "Non-Resident" },
];

const statusOptions = [
  { value: "Enabled", label: "Enabled" },
  { value: "Disabled", label: "Disabled" },
];

// Confirmation Modal
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
          <p className="text-muted mb-4">
            {message || "Are you sure you want to delete this supplier? This action cannot be undone."}
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

// Supplier Form Modal
const SupplierFormModal = ({ isOpen, mode, initialData, onClose, onSave, existingGroups, loading }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null);
  const [group, setGroup] = useState(null);
  const [newGroup, setNewGroup] = useState("");
  const [useNewGroup, setUseNewGroup] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [supplierType, setSupplierType] = useState(null);
  const [gstCategory, setGstCategory] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  const groupOptions = useMemo(() => existingGroups.map((g) => ({ value: g, label: g })), [existingGroups]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setStatus(statusOptions.find(opt => opt.value === initialData.status) || null);
      setGroup(groupOptions.find(opt => opt.value === initialData.group) || null);
      setGstNumber(initialData.gstNumber || "");
      setSupplierType(supplierTypeOptions.find((opt) => opt.value === initialData.supplierType) || null);
      setGstCategory(gstCategoryOptions.find((opt) => opt.value === initialData.gstCategory) || null);
      setFirstName(initialData.contact?.firstName || "");
      setLastName(initialData.contact?.lastName || "");
      setEmail(initialData.contact?.email || "");
      setMobile(initialData.contact?.mobile || "");
      setBillingAddress(initialData.address?.billing || "");
      setShippingAddress(initialData.address?.shipping || "");
      setPostalCode(initialData.address?.postalCode || "");
      setCity(initialData.address?.city || "");
      const isNew = !existingGroups.includes(initialData.group);
      setUseNewGroup(isNew);
      if (isNew) setNewGroup(initialData.group);
      else setNewGroup("");
    } else {
      setName("");
      setStatus(null);
      setGroup(null);
      setGstNumber("");
      setSupplierType(null);
      setGstCategory(null);
      setFirstName("");
      setLastName("");
      setEmail("");
      setMobile("");
      setBillingAddress("");
      setShippingAddress("");
      setPostalCode("");
      setCity("");
      setUseNewGroup(false);
      setNewGroup("");
    }
  }, [mode, initialData, existingGroups, isOpen]);

  const handleClose = () => onClose();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter supplier name");
    if (!status) return alert("Please select status");
    if (!supplierType) return alert("Please select supplier type");
    if (!gstCategory) return alert("Please select GST category");
    let finalGroup = useNewGroup ? newGroup.trim() : group?.value;
    if (!finalGroup) return alert("Please select or enter a group");
    if (mobile && !/^\d{10}$/.test(mobile)) return alert("Mobile number must be 10 digits");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return alert("Please enter a valid email");

    onSave({
      id: mode === "edit" ? initialData?._id || initialData?.id : undefined,
      name: name.trim(),
      status: status.value,
      group: finalGroup,
      gstNumber: gstNumber.trim(),
      supplierType: supplierType.value,
      gstCategory: gstCategory.value,
      contact: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
      },
      address: {
        billing: billingAddress.trim(),
        shipping: shippingAddress.trim(),
        postalCode: postalCode.trim(),
        city: city.trim(),
      },
    });
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
          <h5 className="title">{mode === "add" ? "Add Supplier" : "Edit Supplier"}</h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit}>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Supplier Name *</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter supplier name"
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
                  <Label className="form-label">GST Number</Label>
                  <Input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="Enter GST number"
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Supplier Type *</Label>
                  <RSelect
                    options={supplierTypeOptions}
                    value={supplierType}
                    onChange={(opt) => setSupplierType(opt)}
                    placeholder="Select Supplier Type"
                    isDisabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">GST Category *</Label>
                  <RSelect
                    options={gstCategoryOptions}
                    value={gstCategory}
                    onChange={(opt) => setGstCategory(opt)}
                    placeholder="Select GST Category"
                    isDisabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Group *</Label>
                  {!useNewGroup ? (
                    <div className="d-flex gap-2">
                      <div className="flex-grow-1">
                        <RSelect
                          options={groupOptions}
                          value={group}
                          onChange={(opt) => setGroup(opt)}
                          placeholder="Select Group"
                          isDisabled={loading}
                        />
                      </div>
                      <Button
                        type="button"
                        style={{
                          backgroundColor: "#644634",
                          borderColor: "#800000",
                          color: "#fff",
                          padding: "6px 20px",
                        }}
                        onClick={() => setUseNewGroup(true)}
                        disabled={loading}
                      >
                        + New
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <Input
                        type="text"
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                        placeholder="Enter new group"
                        disabled={loading}
                        autoFocus
                      />
                      <Button
                        type="button"
                        color="secondary"
                        onClick={() => {
                          setUseNewGroup(false);
                          setNewGroup("");
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </FormGroup>
              </Col>

              <div className="col-12">
                <hr />
                <h6 className="title mb-2">Primary Contact Details</h6>
              </div>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">First Name</Label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Last Name</Label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Email ID</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Mobile Number</Label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter mobile number"
                    maxLength={10}
                    disabled={loading}
                  />
                </FormGroup>
              </Col>

              <div className="col-12">
                <hr />
                <h6 className="title mb-2">Address Details</h6>
              </div>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Billing Address</Label>
                  <Input
                    type="textarea"
                    rows="2"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Enter billing address"
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Shipping Address</Label>
                  <Input
                    type="textarea"
                    rows="2"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter shipping address"
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">Postal Code</Label>
                  <Input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Enter postal code"
                    disabled={loading}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">City</Label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                    disabled={loading}
                  />
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
                      {loading ? <Spinner size="sm" /> : (mode === "add" ? "Add Supplier" : "Update Supplier")}
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

// Main Suppliers Component (API integrated)
const Suppliers = () => {
  const history = useHistory();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSupplierId, setDeleteSupplierId] = useState(null);

  const availableGroups = useMemo(() => {
    const groups = suppliers.map((s) => s.group);
    return [...new Set(groups)].sort();
  }, [suppliers]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (groupFilter !== "All") params.append("group", groupFilter);

      const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setSuppliers(result.data);
      } else {
        console.error("Failed to fetch suppliers:", result.message);
        alert("Error fetching suppliers");
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Network error while fetching suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search, statusFilter, groupFilter]);

  const createSupplier = async (supplierData) => {
    setFormLoading(true);
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
      });
      const result = await response.json();
      if (result.success) {
        await fetchSuppliers();
        alert("Supplier added successfully");
        setIsModalOpen(false);
      } else {
        alert(result.message || "Failed to create supplier");
      }
    } catch (error) {
      console.error("Create error:", error);
      alert("Network error while creating supplier");
    } finally {
      setFormLoading(false);
    }
  };

  const updateSupplier = async (id, supplierData) => {
    setFormLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
      });
      const result = await response.json();
      if (result.success) {
        await fetchSuppliers();
        alert("Supplier updated successfully");
        setIsModalOpen(false);
      } else {
        alert(result.message || "Failed to update supplier");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Network error while updating supplier");
    } finally {
      setFormLoading(false);
    }
  };

  const deleteSupplier = async (id) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        await fetchSuppliers();
        alert("Supplier deleted successfully");
      } else {
        alert(result.message || "Failed to delete supplier");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Network error while deleting supplier");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode("add");
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier) => {
    setModalMode("edit");
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteSupplierId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteSupplierId) {
      await deleteSupplier(deleteSupplierId);
    }
    setShowDeleteConfirm(false);
    setDeleteSupplierId(null);
  };

  const handleSave = (supplierData) => {
    if (modalMode === "add") {
      const { id, ...dataToSend } = supplierData;
      createSupplier(dataToSend);
    } else {
      const { id, ...dataToSend } = supplierData;
      updateSupplier(id, dataToSend);
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

  const handleNameClick = (supplier) => {
    history.push(`/Suppliers/${supplier._id}`, { supplier });
  };

  const indexOfLast = currentPage * itemPerPage;
  const indexOfFirst = indexOfLast - itemPerPage;
  const currentSuppliers = suppliers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(suppliers.length / itemPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, groupFilter]);

  return (
    <>
      <Head title="Suppliers" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Suppliers</BlockTitle>
              <p className="text-muted">Total Suppliers: {suppliers.length}</p>
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
                        style={{ minWidth: "120px",  height : "40px" }}
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
                        style={{ minWidth: "150px", height : "40px"}}
                      >
                        <option value="All">All Groups</option>
                        {availableGroups.length > 0 ? (
                          availableGroups.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))
                        ) : (
                          <option disabled>No groups available</option>
                        )}
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
                      placeholder="Search by name or supplier ID"
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
                <p className="mt-2">Loading suppliers...</p>
              </div>
            )}

            {/* Suppliers Table */}
            {!loading && (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e0e0e0", textAlign: "left" }}>
                        <th className="px-3 py-2 text-center">S.No</th>
                        <th className="px-4 py-2 text-start">Supplier Name</th>
                        <th className="px-4 py-2 text-center">Status</th>
                        <th className="px-4 py-2 text-start">Group</th>
                        <th className="px-4 py-2 text-start">Supplier ID</th>
                        <th className="px-4 py-2 text-start">Supplier Type</th>
                        <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      {currentSuppliers.length > 0 ? (
                        currentSuppliers.map((supplier, idx) => (
                          <tr
                            key={supplier._id}
                            style={{
                              borderTop: "1px solid #e0e0e0",
                              borderBottom: "1px solid #e0e0e0",
                            }}
                          >
                            <td className="px-3 py-2 text-center">{indexOfFirst + idx + 1}</td>
                            <td className="px-4 py-2 text-start fw-semibold">
                              <button
                                onClick={() => handleNameClick(supplier)}
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
                                {supplier.name}
                              </button>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span
                                className={`badge bg-${statusColor(supplier.status)}`}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  color: "white",
                                }}
                              >
                                {supplier.status}
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
                                {supplier.group}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-start">
                              <code>{supplier.supplierId}</code>
                            </td>
                            <td className="px-4 py-2 text-start">{supplier.supplierType}</td>
                            <td className="px-4 py-2 text-center">
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
                                  <Icon name="more-h" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                  <DropdownItem onClick={() => handleEdit(supplier)}>
                                    <Icon name="edit" /> Edit
                                  </DropdownItem>
                                  <DropdownItem onClick={() => handleDeleteClick(supplier._id)}>
                                    <Icon name="trash" /> Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No suppliers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {suppliers.length > 0 && totalPages > 1 && (
                  <div className="card-inner">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted">
                          Showing {indexOfFirst + 1} to {Math.min(indexOfLast, suppliers.length)} of {suppliers.length} suppliers
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

      <SupplierFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingSupplier}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        existingGroups={availableGroups}
        loading={formLoading}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        toggle={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        loading={deleteLoading}
      />
    </>
  );
};

export default Suppliers;