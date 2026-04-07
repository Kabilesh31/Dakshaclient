import React, { useState, useEffect, useRef } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { findUpper } from "../../../utils/Utils";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";

import {
  FormGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  Modal,
  ModalBody,
  DropdownItem,
  Form,
} from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Row,
  Col,
  UserAvatar,
  PaginationComponent,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  Button,
  RSelect,
  TooltipComponent,
  BlockContent,
} from "../../../components/Component";
import { useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";

// ---------- DUMMY DATA (replace with real API later) ----------
const dummyStockItems = [
  {
    id: "1",
    itemName: "Cement Bag",
    itemCode: "CMT001",
    quantity: 500,
    price: 320,
    unit: "bag",
    weight: "50 kg",
    assignedTo: [],
  },
  {
    id: "2",
    itemName: "Steel Rod 12mm",
    itemCode: "STL012",
    quantity: 200,
    price: 5800,
    unit: "piece",
    weight: "12 kg",
    assignedTo: [],
  },
  {
    id: "3",
    itemName: "Brick",
    itemCode: "BRK001",
    quantity: 10000,
    price: 8,
    unit: "piece",
    weight: "2.5 kg",
    assignedTo: [],
  },
  {
    id: "4",
    itemName: "Paint (White) 5L",
    itemCode: "PNT001",
    quantity: 80,
    price: 1250,
    unit: "can",
    weight: "5 L",
    assignedTo: [],
  },
];

const dummySites = [
  { id: "s1", name: "Downtown Office Complex" },
  { id: "s2", name: "Riverside Residential Tower" },
  { id: "s3", name: "Greenfield Industrial Park" },
];

const ProductsListCompact = () => {
  // ---------- State ----------
  const [stockItems, setStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [sites, setSites] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const searchRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [sort, setSortState] = useState("asc");

  // Modals
  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalAssign, setModalAssign] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [assignSiteId, setAssignSiteId] = useState("");
  const [assignQuantity, setAssignQuantity] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    itemName: "",
    itemCode: "",
    quantity: "",
    price: "",
    unit: "",
    weight: "",
  });

  // ---------- Load dummy data ----------
  useEffect(() => {
    // Simulate API fetch
    setStockItems(dummyStockItems);
    setFilteredItems(dummyStockItems);
    setSites(dummySites);
  }, []);

  // Filtering and sorting
  useEffect(() => {
    let filtered = [...stockItems];
    if (searchText.trim()) {
      const term = searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(term) ||
          item.itemCode.toLowerCase().includes(term)
      );
    }
    // Sorting
    if (sort === "asc") {
      filtered.sort((a, b) => a.itemName.localeCompare(b.itemName));
    } else {
      filtered.sort((a, b) => b.itemName.localeCompare(a.itemName));
    }
    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchText, stockItems, sort]);

  // ---------- Stats ----------
  const totalItems = stockItems.length;
  const totalQuantity = stockItems.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockItems = stockItems.filter((i) => i.quantity < 10).length;

  // ---------- Pagination ----------
  const indexOfLast = currentPage * itemPerPage;
  const indexOfFirst = indexOfLast - itemPerPage;
  const currentItems = filteredItems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredItems.length / itemPerPage);
  const paginate = (page) => setCurrentPage(page);

  // ---------- Add / Edit / Delete ----------
  const resetForm = () => {
    setFormData({
      itemName: "",
      itemCode: "",
      quantity: "",
      price: "",
      unit: "",
      weight: "",
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.itemCode || !formData.quantity || !formData.price) {
      warningToast("Please fill required fields");
      return;
    }
    const newItem = {
      id: Date.now().toString(),
      ...formData,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      assignedTo: [],
    };
    setStockItems([newItem, ...stockItems]);
    successToast("Stock item added");
    setModalAdd(false);
    resetForm();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    const updated = stockItems.map((item) =>
      item.id === selectedItem.id ? { ...item, ...formData, quantity: parseInt(formData.quantity), price: parseFloat(formData.price) } : item
    );
    setStockItems(updated);
    successToast("Item updated");
    setModalEdit(false);
    resetForm();
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.itemName,
      itemCode: item.itemCode,
      quantity: item.quantity,
      price: item.price,
      unit: item.unit || "",
      weight: item.weight || "",
    });
    setModalEdit(true);
  };

  const handleDelete = () => {
    if (deleteItem) {
      setStockItems(stockItems.filter((i) => i.id !== deleteItem.id));
      successToast("Item deleted");
      setDeleteModal(false);
      setDeleteItem(null);
    }
  };

  // ---------- Site Assignment (decrease stock) ----------
  const openAssignModal = (item) => {
    setSelectedItem(item);
    setAssignSiteId("");
    setAssignQuantity(1);
    setModalAssign(true);
  };

  const handleAssignSubmit = () => {
    if (!assignSiteId || assignQuantity <= 0) {
      warningToast("Select site and valid quantity");
      return;
    }
    const site = sites.find((s) => s.id === assignSiteId);
    if (!site) return;
    if (assignQuantity > selectedItem.quantity) {
      warningToast("Not enough stock");
      return;
    }

    // Reduce stock quantity
    const updatedItems = stockItems.map((item) =>
      item.id === selectedItem.id
        ? {
            ...item,
            quantity: item.quantity - assignQuantity,
            assignedTo: [
              ...item.assignedTo,
              {
                siteId: site.id,
                siteName: site.name,
                quantity: assignQuantity,
                date: new Date().toISOString(),
              },
            ],
          }
        : item
    );
    setStockItems(updatedItems);
    successToast(`${assignQuantity} ${selectedItem.unit || "unit"} assigned to ${site.name}`);
    setModalAssign(false);
  };

  // ---------- Helper for display ----------
  const getStatusBadge = (qty) => {
    if (qty === 0) return <span className="badge bg-danger">Out of Stock</span>;
    if (qty < 10) return <span className="badge bg-warning text-dark">Low Stock</span>;
    return <span className="badge bg-success">In Stock</span>;
  };

  // ---------- Search outside click ----------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOnSearch(false);
      }
    };
    if (onSearch) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSearch]);

  return (
    <React.Fragment>
      <Head title="Inventory Management" />
      <Content>
        {/* Sticky header */}
        <div style={{ position: "sticky", top: 0, zIndex: 1000, marginBottom: "18px" }}>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle tag="h3" page>
                  Inventory Management
                </BlockTitle>
                <BlockDes className="text-soft">
                  <p>
                    Total Items: {totalItems} | Total Quantity: {totalQuantity} | Low Stock Items: {lowStockItems}
                  </p>
                </BlockDes>
              </BlockHeadContent>
              <BlockHeadContent>
                <div className="toggle-wrap nk-block-tools-toggle">
                  <Button
                    className="btn-icon btn-trigger toggle-expand mr-n1"
                    onClick={() => {}}
                  >
                    <Icon name="menu-alt-r" />
                  </Button>
                  <div className="toggle-expand-content" style={{ display: "block" }}>
                    <ul className="nk-block-tools g-3">
                      <li className="nk-block-tools-opt">
                        <Button
                          color="primary"
                          className="btn-icon"
                          onClick={() => {
                            resetForm();
                            setModalAdd(true);
                          }}
                        >
                          <Icon name="plus" />
                        </Button>
                      </li>
                    </ul>
                  </div>
                </div>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>
        </div>

        <Block>
          <Row>
            {/* Main Content - Stock List */}
            <Col md="12">
              <DataTable className="card-stretch">
                {/* Search Bar */}
                <div className="card-inner position-relative card-tools-toggle">
                  <div className="card-title-group">
                    <div className="card-tools"></div>
                    <div className="card-tools mr-n1">
                      <ul className="btn-toolbar gx-1">
                        <li>
                          <a
                            href="#search"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setOnSearch(true);
                            }}
                            className="btn btn-icon search-toggle toggle-search"
                          >
                            <Icon name="search" />
                          </a>
                        </li>
                        <li className="btn-toolbar-sep"></li>
                        <li>
                          <UncontrolledDropdown>
                            <DropdownToggle tag="a" className="btn btn-trigger btn-icon">
                              <Icon name="setting" />
                            </DropdownToggle>
                            <DropdownMenu right className="dropdown-menu-xs">
                              <ul className="link-check">
                                <li><span>Show</span></li>
                                {[10, 15, 20].map((n) => (
                                  <li key={n} className={itemPerPage === n ? "active" : ""}>
                                    <DropdownItem
                                      tag="a"
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setItemPerPage(n);
                                      }}
                                    >
                                      {n}
                                    </DropdownItem>
                                  </li>
                                ))}
                              </ul>
                              <ul className="link-check">
                                <li><span>Order</span></li>
                                <li className={sort === "dsc" ? "active" : ""}>
                                  <DropdownItem
                                    tag="a"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSortState("dsc");
                                    }}
                                  >
                                    DESC
                                  </DropdownItem>
                                </li>
                                <li className={sort === "asc" ? "active" : ""}>
                                  <DropdownItem
                                    tag="a"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSortState("asc");
                                    }}
                                  >
                                    ASC
                                  </DropdownItem>
                                </li>
                              </ul>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div ref={searchRef} className={`card-search search-wrap ${onSearch ? "active" : ""}`}>
                    <div className="card-body">
                      <div className="search-content">
                        <Button
                          className="search-back btn-icon toggle-search active"
                          onClick={() => {
                            setSearchText("");
                            setOnSearch(false);
                          }}
                        >
                          <Icon name="arrow-left" />
                        </Button>
                        <input
                          autoFocus={onSearch}
                          type="text"
                          className="border-transparent form-focus-none form-control"
                          placeholder="Search by item name or code"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Button className="search-submit btn-icon">
                          <Icon name="search" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <DataTableBody compact>
                  <DataTableHead>
                    <DataTableRow>
                      <span className="sub-text">Item Name</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="sub-text">Code</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="sub-text">Quantity</span>
                    </DataTableRow>
                    <DataTableRow size="md">
                      <span className="sub-text">Price (₹)</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="sub-text">Unit / Weight</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text">Status</span>
                    </DataTableRow>
                    <DataTableRow className="nk-tb-col-tools text-right">
                      <span className="sub-text">Actions</span>
                    </DataTableRow>
                  </DataTableHead>

                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <DataTableItem key={item.id}>
                        <DataTableRow>
                          <div className="user-card">
                            <UserAvatar
                              theme="primary"
                              className="xs"
                              text={findUpper(item.itemName)}
                            />
                            <div className="user-info ml-2">
                              <span className="tb-lead">{item.itemName}</span>
                            </div>
                          </div>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{item.itemCode}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="fw-bold">{item.quantity}</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="text-primary fw-bold">₹ {item.price.toLocaleString()}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{item.unit ? `${item.unit} / ${item.weight}` : item.weight || "-"}</span>
                        </DataTableRow>
                        <DataTableRow>{getStatusBadge(item.quantity)}</DataTableRow>
                        <DataTableRow className="nk-tb-col-tools">
                          <ul className="nk-tb-actions gx-1">
                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                  <Icon name="more-h" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                  <DropdownItem onClick={() => openEditModal(item)}>
                                    <Icon name="edit-alt-fill" className="mr-1" /> Edit
                                  </DropdownItem>
                                  <DropdownItem onClick={() => openAssignModal(item)}>
                                    <Icon name="building" className="mr-1" /> Assign to Site
                                  </DropdownItem>
                                  <DropdownItem
                                    className="text-danger"
                                    onClick={() => {
                                      setDeleteItem(item);
                                      setDeleteModal(true);
                                    }}
                                  >
                                    <Icon name="trash-fill" className="mr-1" /> Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </li>
                          </ul>
                        </DataTableRow>
                      </DataTableItem>
                    ))
                  ) : (
                    <DataTableItem>
                      <DataTableRow colSpan="7" className="text-center py-5">
                        <span className="text-silent">No stock items found</span>
                      </DataTableRow>
                    </DataTableItem>
                  )}
                </DataTableBody>

                {/* Pagination */}
                <div className="card-inner">
                  {currentItems.length > 0 ? (
                    <div className="d-flex justify-content-center align-items-center">
                      <button
                        className="btn btn-icon btn-sm btn-outline-light mx-1"
                        disabled={currentPage === 1}
                        onClick={() => paginate(currentPage - 1)}
                      >
                        <em className="icon ni ni-chevron-left" />
                      </button>
                      {[...Array(totalPages)].map((_, idx) => {
                        const page = idx + 1;
                        if (page === currentPage || page === currentPage - 1 || page === currentPage + 1) {
                          return (
                            <button
                              key={page}
                              onClick={() => paginate(page)}
                              className={`btn btn-sm mx-1 ${currentPage === page ? "btn-primary" : "btn-outline-light"}`}
                              style={{ minWidth: "36px", borderRadius: "6px" }}
                            >
                              {page}
                            </button>
                          );
                        }
                        return null;
                      })}
                      <button
                        className="btn btn-icon btn-sm btn-outline-light mx-1"
                        disabled={currentPage === totalPages}
                        onClick={() => paginate(currentPage + 1)}
                      >
                        <em className="icon ni ni-chevron-right" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-silent">No data found</div>
                  )}
                </div>
              </DataTable>
            </Col>
          </Row>
        </Block>

        {/* ---------- ADD MODAL ---------- */}
        <Modal isOpen={modalAdd} toggle={() => setModalAdd(false)} centered size="lg">
          <ModalBody style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <a href="#close" className="close" onClick={() => setModalAdd(false)}>
              <Icon name="cross-sm" />
            </a>
            <h5 className="title mb-3">Add Stock Item</h5>
            <Form className="row gy-3" onSubmit={handleAddSubmit}>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Item Name <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Item Code <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={formData.itemCode}
                    onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label className="form-label">Quantity <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label className="form-label">Price (₹) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label className="form-label">Unit (e.g., bag, piece)</label>
                  <input
                    className="form-control"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Weight / Size (e.g., 50 kg, 5 L)</label>
                  <input
                    className="form-control"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <Button color="primary" type="submit">
                  Add Item
                </Button>
              </Col>
            </Form>
          </ModalBody>
        </Modal>

        {/* ---------- EDIT MODAL ---------- */}
        <Modal isOpen={modalEdit} toggle={() => setModalEdit(false)} centered size="lg">
          <ModalBody style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <a href="#close" className="close" onClick={() => setModalEdit(false)}>
              <Icon name="cross-sm" />
            </a>
            <h5 className="title mb-3">Edit Stock Item</h5>
            <Form className="row gy-3" onSubmit={handleEditSubmit}>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Item Name</label>
                  <input
                    className="form-control"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Item Code</label>
                  <input
                    className="form-control"
                    value={formData.itemCode}
                    onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label className="form-label">Unit</label>
                  <input
                    className="form-control"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Weight / Size</label>
                  <input
                    className="form-control"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <Button color="primary" type="submit">
                  Update Item
                </Button>
              </Col>
            </Form>
          </ModalBody>
        </Modal>

        {/* ---------- ASSIGN TO SITE MODAL ---------- */}
        <Modal isOpen={modalAssign} toggle={() => setModalAssign(false)} centered>
          <ModalBody>
            <a href="#close" className="close" onClick={() => setModalAssign(false)}>
              <Icon name="cross-sm" />
            </a>
            <h5 className="title mb-3">Assign to Site</h5>
            <Form>
              <FormGroup>
                <label>Site</label>
                <RSelect
                  options={sites.map((s) => ({ label: s.name, value: s.id }))}
                  onChange={(opt) => setAssignSiteId(opt?.value)}
                />
              </FormGroup>
              <FormGroup>
                <label>Quantity to Assign</label>
                <input
                  type="number"
                  className="form-control"
                  value={assignQuantity}
                  onChange={(e) => setAssignQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                  max={selectedItem?.quantity}
                />
                <small className="text-muted">Available: {selectedItem?.quantity || 0}</small>
              </FormGroup>
              <div className="mt-3">
                <Button color="primary" onClick={handleAssignSubmit}>
                  Assign
                </Button>
              </div>
            </Form>
          </ModalBody>
        </Modal>

        {/* ---------- DELETE CONFIRMATION ---------- */}
        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)} className="modal-dialog-centered">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Delete</h5>
            <button type="button" className="close" onClick={() => setDeleteModal(false)}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            Are you sure you want to delete <strong>{deleteItem?.itemName}</strong>?
          </div>
          <div className="modal-footer">
            <Button color="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      </Content>

      <style jsx>{`
        .product-card {
          background: #ffffff;
          border: 1px solid #e5e9f2;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          height: 90%;
          margin: 8px;
          padding: 5px;
        }
        .product-card:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .badge {
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
        }
        .bg-danger {
          background-color: #dc3545;
          color: white;
        }
        .bg-warning {
          background-color: #ffc107;
          color: #212529;
        }
        .bg-success {
          background-color: #28a745;
          color: white;
        }
      `}</style>
    </React.Fragment>
  );
};

export default ProductsListCompact;