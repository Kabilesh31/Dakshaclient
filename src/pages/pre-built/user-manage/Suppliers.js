import React, { useState, useMemo, useEffect } from "react";
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
  ModalHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
  Col,
} from "reactstrap";

// ----------------------------------------------------------------------
// Dummy data (with all required fields)
// ----------------------------------------------------------------------
const initialSuppliers = [
  {
    id: "1222",
    name: "ABC Electricals",
    status: "Enabled",
    group: "Electrical",
    gstNumber: "22AAAAA0000A1Z",
    supplierType: "Wholesaler",
    gstCategory: "Registered",
    contact: {
      firstName: "Rajesh",
      lastName: "Kumar",
      email: "rajesh@abcelectricals.com",
      mobile: "9876543210",
    },
    address: {
      billing: "123, Main Street, Andheri East",
      shipping: "123, Main Street, Andheri East",
      postalCode: "400069",
      city: "Mumbai",
    },
  },
  {
    id: "2222",
    name: "Hardware Hub",
    status: "Enabled",
    group: "Hardware",
    gstNumber: "33BBBBB0000B1Z",
    supplierType: "Retailer",
    gstCategory: "Composition",
    contact: {
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya@hardwarehub.com",
      mobile: "9876543211",
    },
    address: {
      billing: "45, Civil Lines",
      shipping: "45, Civil Lines",
      postalCode: "302001",
      city: "Jaipur",
    },
  },
  {
    id: "3222",
    name: "Distributor Depot",
    status: "Disabled",
    group: "Distributor",
    gstNumber: "44CCCCC0000C1Z",
    supplierType: "Distributor",
    gstCategory: "Unregistered",
    contact: {
      firstName: "Amit",
      lastName: "Verma",
      email: "amit@distributordepot.com",
      mobile: "9876543212",
    },
    address: {
      billing: "789, Industrial Area",
      shipping: "789, Industrial Area",
      postalCode: "110001",
      city: "Delhi",
    },
  },
  {
    id: "4222",
    name: "Lighting World",
    status: "Enabled",
    group: "Electrical",
    gstNumber: "55DDDDD0000D1Z",
    supplierType: "Manufacturer",
    gstCategory: "Registered",
    contact: {
      firstName: "Sunil",
      lastName: "Gupta",
      email: "sunil@lightingworld.com",
      mobile: "9876543213",
    },
    address: {
      billing: "12, Electronics City",
      shipping: "12, Electronics City",
      postalCode: "560100",
      city: "Bengaluru",
    },
  },
  {
    id: "5222",
    name: "Steel Suppliers Co.",
    status: "Enabled",
    group: "Hardware",
    gstNumber: "66EEEEE0000E1Z",
    supplierType: "Wholesaler",
    gstCategory: "Registered",
    contact: {
      firstName: "Vikram",
      lastName: "Singh",
      email: "vikram@steelsuppliers.com",
      mobile: "9876543214",
    },
    address: {
      billing: "22, Lohia Nagar",
      shipping: "22, Lohia Nagar",
      postalCode: "208001",
      city: "Kanpur",
    },
  },
  {
    id: "6222",
    name: "Prime Distributors",
    status: "Disabled",
    group: "Distributor",
    gstNumber: "77FFFFF0000F1Z",
    supplierType: "Distributor",
    gstCategory: "Casual",
    contact: {
      firstName: "Neha",
      lastName: "Jain",
      email: "neha@primedist.com",
      mobile: "9876543215",
    },
    address: {
      billing: "5, Rajpath",
      shipping: "5, Rajpath",
      postalCode: "380001",
      city: "Ahmedabad",
    },
  },
  {
    id: "7222",
    name: "Solar Electric",
    status: "Enabled",
    group: "Electrical",
    gstNumber: "88GGGGG0000G1Z",
    supplierType: "Service Provider",
    gstCategory: "Registered",
    contact: {
      firstName: "Ankit",
      lastName: "Mehta",
      email: "ankit@solarelectric.com",
      mobile: "9876543216",
    },
    address: {
      billing: "101, Green Park",
      shipping: "101, Green Park",
      postalCode: "452001",
      city: "Indore",
    },
  },
  {
    id: "8222",
    name: "Pipe House",
    status: "Enabled",
    group: "Plumbing",
    gstNumber: "99HHHHH0000H1Z",
    supplierType: "Retailer",
    gstCategory: "Composition",
    contact: {
      firstName: "Ramesh",
      lastName: "Yadav",
      email: "ramesh@pipehouse.com",
      mobile: "9876543217",
    },
    address: {
      billing: "34, Pipe Nagar",
      shipping: "34, Pipe Nagar",
      postalCode: "400012",
      city: "Mumbai",
    },
  },
  {
    id: "9222",
    name: "Paint World",
    status: "Disabled",
    group: "Hardware",
    gstNumber: "10IIIII0000I1Z",
    supplierType: "Wholesaler",
    gstCategory: "Non-Resident",
    contact: {
      firstName: "Suresh",
      lastName: "Patel",
      email: "suresh@paintworld.com",
      mobile: "9876543218",
    },
    address: {
      billing: "78, Color Street",
      shipping: "78, Color Street",
      postalCode: "395003",
      city: "Surat",
    },
  },
];

// Options for RSelect
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

// ----------------------------------------------------------------------
// Confirmation Modal Component
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
          <p className="text-muted mb-4">{message || "Are you sure you want to delete this supplier? This action cannot be undone."}</p>
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
            <Button
              color="secondary"
              outline
              onClick={toggle}
              style={{ padding: "15px 24px" }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

// ----------------------------------------------------------------------
// Supplier Form Modal (styled like UserListCompact)
// ----------------------------------------------------------------------
const SupplierFormModal = ({ isOpen, mode, initialData, onClose, onSave, existingGroups }) => {
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

  const groupOptions = useMemo(
    () => existingGroups.map((g) => ({ value: g, label: g })),
    [existingGroups]
  );

  // Populate form on edit / reset on add
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name);
      setStatus({ value: initialData.status, label: initialData.status });
      setGroup({ value: initialData.group, label: initialData.group });
      setGstNumber(initialData.gstNumber || "");
      setSupplierType(
        supplierTypeOptions.find((opt) => opt.value === initialData.supplierType) || null
      );
      setGstCategory(
        gstCategoryOptions.find((opt) => opt.value === initialData.gstCategory) || null
      );
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
      id: mode === "edit" ? initialData?.id : undefined,
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
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} className="modal-dialog-centered" size="lg">
      <ModalBody
        style={{
          overflowY: "auto",
          maxHeight: "calc(100vh)",
          padding: "1.5rem",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
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
                  <label className="form-label">Supplier Name *</label>
                  <input
                    className="form-control"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter supplier name"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Status *</label>
                  <RSelect
                    options={statusOptions}
                    value={status}
                    onChange={(opt) => setStatus(opt)}
                    placeholder="Select Status"
                    className="supplier-select"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">GST Number</label>
                  <input
                    className="form-control"
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="Enter GST number"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Supplier Type *</label>
                  <RSelect
                    options={supplierTypeOptions}
                    value={supplierType}
                    onChange={(opt) => setSupplierType(opt)}
                    placeholder="Select Supplier Type"
                    className="supplier-select"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">GST Category *</label>
                  <RSelect
                    options={gstCategoryOptions}
                    value={gstCategory}
                    onChange={(opt) => setGstCategory(opt)}
                    placeholder="Select GST Category"
                    className="supplier-select"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Group *</label>
                  {!useNewGroup ? (
                    <div className="d-flex gap-2">
                      <div className="flex-grow-1">
                        <RSelect
                          options={groupOptions}
                          value={group}
                          onChange={(opt) => setGroup(opt)}
                          placeholder="Select Group"
                          className="supplier-select"
                        />
                      </div>
                      <Button
                        type="button"
                        style={{
                          backgroundColor: "#644634",
                          borderColor: "#800000",
                          color: "#fff",
                          padding: "15px 20px", // Bigger button
                          fontSize: "1rem",
                          fontWeight: "500",
                        }}
                        onClick={() => setUseNewGroup(true)}
                      >
                        + New
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control"
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                        placeholder="Enter new group"
                        autoFocus
                      />
                      <Button
                        type="button"
                        color="secondary"
                        onClick={() => {
                          setUseNewGroup(false);
                          setNewGroup("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* Contact Details */}
              <div className="col-12">
                <hr />
                <h6 className="title mb-2">Primary Contact Details</h6>
              </div>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">First Name</label>
                  <input
                    className="form-control"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-control"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Email ID</label>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-control"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </FormGroup>
              </Col>

              {/* Address Details */}
              <div className="col-12">
                <hr />
                <h6 className="title mb-2">Address Details</h6>
              </div>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Billing Address</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Enter billing address"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Shipping Address</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter shipping address"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Postal Code</label>
                  <input
                    className="form-control"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Enter postal code"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">City</label>
                  <input
                    className="form-control"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
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
                    >
                      {mode === "add" ? "Add Supplier" : "Update Supplier"}
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
// Main Suppliers Component
// ----------------------------------------------------------------------
const Suppliers = () => {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [filtered, setFiltered] = useState(initialSuppliers);
  const [search, setSearch] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSupplierId, setDeleteSupplierId] = useState(null);

  const availableGroups = useMemo(() => {
    const groups = suppliers.map((s) => s.group);
    return Array.from(new Set(groups)).sort();
  }, [suppliers]);

  useEffect(() => {
    let data = [...suppliers];
    if (search.trim()) {
      const kw = search.toLowerCase();
      data = data.filter((s) => s.name.toLowerCase().includes(kw) || s.id.includes(kw));
    }
    if (statusFilter !== "All") data = data.filter((s) => s.status === statusFilter);
    if (groupFilter !== "All") data = data.filter((s) => s.group === groupFilter);
    setFiltered(data);
    setCurrentPage(1);
  }, [search, statusFilter, groupFilter, suppliers]);

  const indexOfLast = currentPage * itemPerPage;
  const indexOfFirst = indexOfLast - itemPerPage;
  const currentSuppliers = filtered.slice(indexOfFirst, indexOfLast);

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

  const handleConfirmDelete = () => {
    if (deleteSupplierId) {
      setSuppliers((prev) => prev.filter((s) => s.id !== deleteSupplierId));
    }
    setShowDeleteConfirm(false);
    setDeleteSupplierId(null);
  };

  const handleSave = (supplierData) => {
    if (modalMode === "add") {
      const newId = (Math.max(...suppliers.map((s) => parseInt(s.id, 10)), 0) + 1).toString();
      setSuppliers((prev) => [...prev, { ...supplierData, id: newId }]);
    } else {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplierData.id ? { ...s, ...supplierData } : s))
      );
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setGroupFilter("All");
    setOnSearch(false);
  };

  const statusColor = (status) => (status === "Enabled" ? "success" : "danger");

  return (
    <>
      <Head title="Suppliers" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Suppliers</BlockTitle>
              <p className="text-muted">Manage your supplier information</p>
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
                    <div className="form-wrap">
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: "140px" }}
                      >
                        <option value="All">All Status</option>
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </div>
                    <div className="form-wrap ms-2">
                      <select
                        className="form-select"
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        style={{ width: "150px" }}
                      >
                        <option value="All">All Groups</option>
                        {availableGroups.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
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
                      placeholder="Search by name or ID"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Suppliers Table */}
<div style={{ overflowX: "auto" }}>
  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
    <thead>
      <tr style={{ borderBottom: "1px solid #e0e0e0", textAlign: "left" }}>
        <th className="px-3 py-2 text-center">S.No</th>
        <th className="px-4 py-2 text-start">Supplier ID</th>
        <th className="px-4 py-2 text-start">Supplier Name</th>
        <th className="px-4 py-2 text-start">Group</th>
        <th className="px-4 py-2 text-start">Supplier Type</th>
        <th className="px-4 py-2 text-center">Status</th>
        <th className="px-4 py-2 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentSuppliers.length > 0 ? (
        currentSuppliers.map((supplier, idx) => (
          <tr
            key={supplier.id}
            style={{
              borderTop: "1px solid #e0e0e0",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <td className="px-3 py-2 text-center">{indexOfFirst + idx + 1}</td>
            <td className="px-4 py-2 text-start">#{supplier.id}</td>
            <td className="px-4 py-2 text-start fw-semibold">{supplier.name}</td>
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
            <td className="px-4 py-2 text-start">{supplier.supplierType}</td>
            <td className="px-4 py-2 text-center">
              <span
                className={`badge bg-${statusColor(supplier.status)}`}
                style={{
                  padding: "6px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {supplier.status}
              </span>
            </td>
            <td className="px-4 py-2 text-center">
              <UncontrolledDropdown>
                <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
                  <Icon name="more-h" />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem onClick={() => handleEdit(supplier)}>
                    <Icon name="edit" /> Edit
                  </DropdownItem>
                  <DropdownItem onClick={() => handleDeleteClick(supplier.id)}>
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
            <div className="card-inner">
              {filtered.length > 0 ? (
                <div className="d-flex justify-content-center align-items-center">
                  <button
                    className="btn btn-icon btn-sm btn-outline-light mx-1"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <em className="icon ni ni-chevron-left"></em>
                  </button>
                  {[...Array(Math.ceil(filtered.length / itemPerPage))].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === currentPage ||
                      page === currentPage - 1 ||
                      page === currentPage + 1
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
                    return null;
                  })}
                  <button
                    className="btn btn-icon btn-sm btn-outline-light mx-1"
                    disabled={currentPage === Math.ceil(filtered.length / itemPerPage)}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <em className="icon ni ni-chevron-right"></em>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-silent">No data found</span>
                </div>
              )}
            </div>
          </DataTable>
        </Block>
      </Content>

      {/* Add/Edit Modal */}
      <SupplierFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingSupplier}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        existingGroups={availableGroups}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        toggle={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
      />
    </>
  );
};

export default Suppliers;