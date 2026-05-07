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
} from "reactstrap";

// ----------------------------------------------------------------------
// Dummy data - EXPORTED for use in BuyingDetails
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

const groupOptions = [
  { value: "Hardware", label: "Hardware" },
  { value: "Steel", label: "Steel" },
  { value: "Wooden", label: "Wooden" },
  { value: "Metal", label: "Metal" },
];

const unitOptions = [
  { value: "KG", label: "Kilogram (KG)" },
  { value: "PCS", label: "Pieces (PCS)" },
  { value: "MTR", label: "Meter (MTR)" },
  { value: "SHEET", label: "Sheet" },
  { value: "LTR", label: "Liter (LTR)" },
  { value: "BOX", label: "Box" },
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
// Item Form Modal
// ----------------------------------------------------------------------
const ItemFormModal = ({ isOpen, mode, initialData, onClose, onSave }) => {
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

  const generateItemId = (name) => {
    const prefix = name.trim().slice(0, 5).toUpperCase();
    const randomNum = Math.floor(Math.random() * 900 + 100);
    return `${prefix}${randomNum}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemCode.trim()) return alert("Please enter item code");
    if (!name.trim()) return alert("Please enter item name");
    if (!status) return alert("Please select status");
    if (!group) return alert("Please select item group");
    if (!unitMeasure) return alert("Please select default unit of measure");

    const newId = generateItemId(name);
    onSave({
      id: mode === "edit" ? initialData?.id : newId,
      itemCode: itemCode.trim(),
      name: name.trim(),
      status: status.value,
      group: group.value,
      hsnSac: hsnSac.trim(),
      unitMeasure: unitMeasure.value,
      maintainStock,
      isFixedAsset,
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
                    >
                      {mode === "add" ? "Add Item" : "Update Item"}
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
  const [items, setItems] = useState(initialItems);
  const [filtered, setFiltered] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const availableGroups = useMemo(() => {
    const groups = items.map((i) => i.group);
    return Array.from(new Set(groups)).sort();
  }, [items]);

  useEffect(() => {
    let data = [...items];
    if (search.trim()) {
      const kw = search.toLowerCase();
      data = data.filter(
        (i) => i.name.toLowerCase().includes(kw) || i.id.toLowerCase().includes(kw)
      );
    }
    if (statusFilter !== "All") data = data.filter((i) => i.status === statusFilter);
    if (groupFilter !== "All") data = data.filter((i) => i.group === groupFilter);
    setFiltered(data);
    setCurrentPage(1);
  }, [search, statusFilter, groupFilter, items]);

  const indexOfLast = currentPage * itemPerPage;
  const indexOfFirst = indexOfLast - itemPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

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

  const handleConfirmDelete = () => {
    if (deleteItemId) {
      setItems((prev) => prev.filter((i) => i.id !== deleteItemId));
    }
    setShowDeleteConfirm(false);
    setDeleteItemId(null);
  };

  const handleSave = (itemData) => {
    if (modalMode === "add") {
      setItems((prev) => [itemData, ...prev]);
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === itemData.id ? { ...i, ...itemData } : i))
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

  const handleNameClick = (item) => {
    sessionStorage.setItem("selectedItem", JSON.stringify(item));
    history.push(`/Buying/${item.id}`, { item });
  };

  return (
    <>
      <Head title="Buying Items" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Buying Items</BlockTitle>
              <p className="text-muted">Manage your inventory items</p>
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

            {/* Items Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e0e0e0", textAlign: "left" }}>
                    <th className="px-3 py-2 text-center">S.No</th>
                    <th className="px-4 py-2 text-start">Item Name</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-start">Item Group</th>
                    <th className="px-4 py-2 text-start">Item ID</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item, idx) => (
                      <tr
                        key={item.id}
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
                        <td className="px-4 py-2 text-start">#{item.id}</td>
                        <td className="px-4 py-2 text-center">
                          <UncontrolledDropdown>
                            <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
                              <Icon name="more-h" />
                            </DropdownToggle>
                            <DropdownMenu right>
                              <DropdownItem onClick={() => handleEdit(item)}>
                                <Icon name="edit" /> Edit
                              </DropdownItem>
                              <DropdownItem onClick={() => handleDeleteClick(item.id)}>
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
      <ItemFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        toggle={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </>
  );
};

export default Buying;