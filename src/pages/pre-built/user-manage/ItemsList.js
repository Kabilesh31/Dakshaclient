import React, { useState, useEffect, useRef } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { findUpper } from "../../../utils/Utils";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";
import axios from "axios";

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
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  Button,
  RSelect,
} from "../../../components/Component";

const ProductsListCompact = () => {
  // ---------- State ----------
  const [stockItems, setStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [sites, setSites] = useState([]); // Real projects from API
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
  const [loading, setLoading] = useState(false);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    unitPrice: "",
    supplier: "",
    minStockLevel: "",
    location: "",
    description: "",
  });

  // ---------- API Calls ----------
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/inventory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      const items = res.data.data || [];
      setStockItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      errorToast("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      const projects = res.data.data || [];
      // Only active projects
      const activeProjects = projects.filter(p => p.status === "active");
      setSites(activeProjects.map(p => ({ id: p._id, name: p.name })));
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      errorToast("Failed to load sites list");
      setSites([]);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchSites();
  }, []);

  // Filter and sort
  useEffect(() => {
    let filtered = [...stockItems];
    if (searchText.trim()) {
      const term = searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term) ||
          (item.supplier && item.supplier.toLowerCase().includes(term))
      );
    }
    if (sort === "asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchText, stockItems, sort]);

  // Stats
  const totalItems = stockItems.length;
  const totalQuantity = stockItems.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockItems = stockItems.filter(
    (i) => i.status === "low-stock" || i.status === "critical"
  ).length;

  // Pagination
  const indexOfLast = currentPage * itemPerPage;
  const indexOfFirst = indexOfLast - itemPerPage;
  const currentItems = filteredItems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredItems.length / itemPerPage);
  const paginate = (page) => setCurrentPage(page);

  // ---------- Add / Edit / Delete ----------
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      unitPrice: "",
      supplier: "",
      minStockLevel: "",
      location: "",
      description: "",
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.quantity || !formData.unit) {
      warningToast("Please fill required fields (Name, Category, Quantity, Unit)");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        supplier: formData.supplier || "Unknown",
        minStockLevel: parseInt(formData.minStockLevel) || 0,
        location: formData.location || "Unassigned",
        description: formData.description || "",
      };
      const res = await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/inventory`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      const newItem = res.data.data;
      setStockItems([newItem, ...stockItems]);
      successToast("Stock item added");
      setModalAdd(false);
      resetForm();
    } catch (error) {
      console.error(error);
      errorToast("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        unitPrice: parseFloat(formData.unitPrice),
        supplier: formData.supplier,
        minStockLevel: parseInt(formData.minStockLevel),
        location: formData.location,
        description: formData.description,
      };
      const res = await axios.put(`${process.env.REACT_APP_BACKENDURL}/api/inventory/${selectedItem._id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      const updatedItem = res.data.data;
      setStockItems(stockItems.map(item => (item._id === updatedItem._id ? updatedItem : item)));
      successToast("Item updated");
      setModalEdit(false);
      resetForm();
    } catch (error) {
      console.error(error);
      errorToast("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      supplier: item.supplier,
      minStockLevel: item.minStockLevel,
      location: item.location,
      description: item.description,
    });
    setModalEdit(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_BACKENDURL}/api/inventory/${deleteItem._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      setStockItems(stockItems.filter(i => i._id !== deleteItem._id));
      successToast("Item deleted");
      setDeleteModal(false);
      setDeleteItem(null);
    } catch (error) {
      console.error(error);
      errorToast("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Assign to Site ----------
  const openAssignModal = (item) => {
    setSelectedItem(item);
    setAssignSiteId("");
    setAssignQuantity(1);
    setModalAssign(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignSiteId || assignQuantity <= 0) {
      warningToast("Select a site and valid quantity");
      return;
    }
    const site = sites.find(s => s.id === assignSiteId);
    if (!site) {
      warningToast("Selected site not found");
      return;
    }
    if (assignQuantity > selectedItem.quantity) {
      warningToast(`Not enough stock. Available: ${selectedItem.quantity} ${selectedItem.unit}`);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        quantity: assignQuantity,
        site: site.name,
        reason: `Assigned to ${site.name}`,
        user: localStorage.getItem("userName") || "Admin",
      };
      const res = await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/inventory/${selectedItem._id}/use`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      const updatedItem = res.data.data;
      setStockItems(stockItems.map(item => (item._id === updatedItem._id ? updatedItem : item)));
      successToast(`${assignQuantity} ${selectedItem.unit} assigned to ${site.name}`);
      setModalAssign(false);
    } catch (error) {
      console.error(error);
      errorToast(error.response?.data?.message || "Failed to assign material");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Helper ----------
  const getStatusBadge = (item) => {
    if (item.quantity === 0) return <span className="badge bg-danger">Critical</span>;
    if (item.quantity <= item.minStockLevel) return <span className="badge bg-warning text-dark">Low Stock</span>;
    return <span className="badge bg-success">In Stock</span>;
  };

  // Search outside click
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
                  <Button className="btn-icon btn-trigger toggle-expand mr-n1" onClick={() => {}}>
                    <Icon name="menu-alt-r" />
                  </Button>
                  <div className="toggle-expand-content" style={{ display: "block" }}>
                    <ul className="nk-block-tools g-3">
                      <li className="nk-block-tools-opt">
                        <Button
                          style={{
                            backgroundColor: "#644634",
                            borderColor: "#800000",
                            color: "#fff",
                            padding: "6px 6px",
                          }}
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
                          placeholder="Search by name, category or supplier"
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
      <span className="sub-text">S.No</span>
    </DataTableRow>
    <DataTableRow>
      <span className="sub-text">Item Name</span>
    </DataTableRow>
    <DataTableRow size="sm">
      <span className="sub-text">Category</span>
    </DataTableRow>
    <DataTableRow size="sm">
      <span className="sub-text">Quantity</span>
    </DataTableRow>
    <DataTableRow size="md">
      <span className="sub-text">Price (₹)</span>
    </DataTableRow>
    <DataTableRow size="sm">
      <span className="sub-text">Unit / Supplier</span>
    </DataTableRow>
    <DataTableRow>
      <span className="sub-text">Status</span>
    </DataTableRow>
    <DataTableRow className="nk-tb-col-tools text-right">
      <span className="sub-text">Actions</span>
    </DataTableRow>
  </DataTableHead>

  {loading && currentItems.length === 0 ? (
    <DataTableItem>
      <DataTableRow colSpan="8" className="text-center py-5">
        <span className="text-silent">Loading...</span>
      </DataTableRow>
    </DataTableItem>
  ) : currentItems.length > 0 ? (
    currentItems.map((item, index) => {
      const serialNumber = (currentPage - 1) * itemPerPage + index + 1;
      return (
        <DataTableItem key={item._id}>
          <DataTableRow>
            <span>{serialNumber}</span>
          </DataTableRow>
          <DataTableRow>
            <div className="user-card">
              <UserAvatar
                className="xs"
                text={findUpper(item.name)}
                style={{
                  backgroundColor: "#644634",
                  color: "#fff",
                }}
              />
              <div className="user-info ml-2">
                <span className="tb-lead">{item.name}</span>
              </div>
            </div>
          </DataTableRow>
          <DataTableRow size="sm">
            <span>{item.category}</span>
          </DataTableRow>
          <DataTableRow size="sm">
            <span className="fw-bold">{item.quantity}</span>
          </DataTableRow>
          <DataTableRow size="md">
            <span className="text-primary fw-bold">₹ {item.unitPrice.toLocaleString()}</span>
          </DataTableRow>
          <DataTableRow size="sm">
            <span>{item.unit} / {item.supplier}</span>
          </DataTableRow>
          <DataTableRow>{getStatusBadge(item)}</DataTableRow>
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
      );
    })
  ) : (
    <DataTableItem>
      <DataTableRow colSpan="8" className="text-center py-5">
        <span className="text-silent">No stock items found</span>
      </DataTableRow>
    </DataTableItem>
  )}
</DataTableBody>

                {/* Pagination */}
                <div className="card-inner">
                  {currentItems.length > 0 && (
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
                  )}
                </div>
              </DataTable>
            </Col>
          </Row>
        </Block>

        {/* ADD MODAL */}
        <Modal isOpen={modalAdd} toggle={() => setModalAdd(false)} centered size="lg">
          <ModalBody style={{ maxHeight: "90vh", overflowY: "auto" }}>
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Category <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  <label className="form-label">Unit <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label className="form-label">Unit Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Supplier</label>
                  <input
                    className="form-control"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Min Stock Level</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Storage Location</label>
                  <input
                    className="form-control"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <Button style={{ backgroundColor: "#644634", borderColor: "#800000", color: "#fff", padding: "6px 20px" }} type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Item"}
                </Button>
              </Col>
            </Form>
          </ModalBody>
        </Modal>

        {/* EDIT MODAL */}
        <Modal isOpen={modalEdit} toggle={() => setModalEdit(false)} centered size="lg">
          <ModalBody style={{ maxHeight: "90vh", overflowY: "auto" }}>
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Category</label>
                  <input
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  <label className="form-label">Unit</label>
                  <input
                    className="form-control"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <label className="form-label">Unit Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Supplier</label>
                  <input
                    className="form-control"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Min Stock Level</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Storage Location</label>
                  <input
                    className="form-control"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <Button style={{ backgroundColor: "#644634", borderColor: "#800000", color: "#fff", padding: "6px 20px" }} type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Item"}
                </Button>
              </Col>
            </Form>
          </ModalBody>
        </Modal>

        {/* ASSIGN TO SITE MODAL (uses real projects) */}
        <Modal isOpen={modalAssign} toggle={() => setModalAssign(false)} centered>
          <ModalBody>
            <a href="#close" className="close" onClick={() => setModalAssign(false)}>
              <Icon name="cross-sm" />
            </a>
            <h5 className="title mb-3">Assign to Site</h5>
            <Form>
              <FormGroup>
                <label>Select Project / Site</label>
                <RSelect
                  options={sites.map((s) => ({ label: s.name, value: s.id }))}
                  onChange={(opt) => setAssignSiteId(opt?.value || "")}
                  placeholder="Choose a site..."
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
                <small className="text-muted">Available: {selectedItem?.quantity || 0} {selectedItem?.unit}</small>
              </FormGroup>
              <div className="mt-3">
                <Button
                  style={{ backgroundColor: "#644634", borderColor: "#800000", color: "#fff", padding: "6px 20px" }}
                  onClick={handleAssignSubmit}
                  disabled={loading}
                >
                  {loading ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </Form>
          </ModalBody>
        </Modal>

        {/* DELETE CONFIRMATION MODAL */}
        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)} className="modal-dialog-centered">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Delete</h5>
            <button type="button" className="close" onClick={() => setDeleteModal(false)}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            Are you sure you want to delete <strong>{deleteItem?.name}</strong>?
          </div>
          <div className="modal-footer">
            <Button color="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#644634", borderColor: "#800000", color: "#fff", padding: "8px 20px" }}
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      </Content>

      <style jsx>{`
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