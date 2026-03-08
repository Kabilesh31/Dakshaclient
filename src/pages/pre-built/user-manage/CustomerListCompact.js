import React, { useEffect, useState, useContext } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  PaginationComponent,
} from "../../../components/Component";
import {
  Modal,
  ModalBody,
  Form,
  FormGroup,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import Dropzone from "react-dropzone";
import axios from "axios";
import DataContext from "../../../utils/DataContext";
import { successToast, errorToast } from "../../../utils/toaster";

const CustomerListCompact = () => {
  const { userData } = useContext(DataContext);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [sort, setSort] = useState("dsc");
  
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Filter states
  const [routeFilter, setRouteFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [uniqueRoutes, setUniqueRoutes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);

  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    phone2: "",
    address: "",
    routeName: "",
    routeId: "",
    lineNo: "",
    creditDays: "",
    pincode: "",
    geoLocation: { lat: "", long: "" },
    category: "",
    status: true,
    img: null,
  });

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/customer`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "session-token": localStorage.getItem("sessionToken"),
          },
        }
      );

      const filtered = res.data.filter((c) => !c.isDeleted);
      const sorted = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setData(sorted);
      
      // Extract unique routes and categories for filters
      const routes = [...new Set(sorted.map(c => c.routeName).filter(Boolean))];
      const categories = [...new Set(sorted.map(c => c.category).filter(Boolean))];
      
      setUniqueRoutes(routes);
  
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");
      }
      errorToast("Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Apply filters whenever data, routeFilter, or categoryFilter changes
  useEffect(() => {
    let filtered = [...data];
    
    // Apply route filter
    if (routeFilter !== "All") {
      filtered = filtered.filter(c => c.routeName === routeFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    
    // Apply search filter if search text exists
    if (searchText) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [data, routeFilter, categoryFilter, searchText]);

  useEffect(() => {
    if (!filteredData.length) return;
    const sorted = [...filteredData].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sort === "asc" ? dateA - dateB : dateB - dateA;
    });
    setFilteredData(sorted);
  }, [sort]);

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/route`, 
         {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
      );
      const options = res.data.data.map((r) => ({
        value: r._id,
        label: r.routeName,
      }));
      setRoutes(options);
    } catch (err) {
      errorToast("Failed to load routes");
    } finally {
      setLoadingRoutes(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const createRoute = async (routeName) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/route`, { routeName },
         {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
      );
      const newRoute = {
        value: res.data.data._id,
        label: res.data.data.routeName,
      };
      setRoutes((prev) => [...prev, newRoute]);
      setFormData((prev) => ({
        ...prev,
        routeId: newRoute.value,
        routeName: newRoute.label,
      }));
      successToast("Route created");
    } catch (err) {
      errorToast("Route creation failed");
    }
  };


  useEffect(() => {
    const indexOfLast = currentPage * itemPerPage;
    const indexOfFirst = indexOfLast - itemPerPage;
    setCurrentItems(filteredData.slice(indexOfFirst, indexOfLast));
  }, [filteredData, currentPage, itemPerPage]);

  const onFilterChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
  };

  const resetFilters = () => {
    setRouteFilter("All");
    setCategoryFilter("All");
    setSearchText("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      phone2: "",
      address: "",
      routeName: "",
      routeId: "",
      lineNo: "",
      creditDays: "",
      pincode: "",
      geoLocation: { lat: "", long: "" },
      category: "",
      status: true,
      img: null,
    });
    setUploadedFile(null);
    setImagePreview(null);
    setSelectedId(null);
  };

  const handleFileSelect = (files) => {
    const file = files[0];
    setUploadedFile(file);
    
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const onAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.routeId) {
      errorToast("Route is required");
      return;
    }

    setAddLoading(true);
    const fd = new FormData();

    Object.keys(formData).forEach((k) => {
      if (k === "createdBy") return;
      if (k === "geoLocation") {
        fd.append("lat", formData.geoLocation.lat);
        fd.append("long", formData.geoLocation.long);
      } else if (formData[k] !== undefined && formData[k] !== null && formData[k] !== "") {
        fd.append(k, formData[k]);
      }
    });

    if (uploadedFile) fd.append("img", uploadedFile);
    fd.append("createdBy", userData._id);

    try {
      await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/customer`, fd, 
       {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      successToast("Customer added successfully");
      setModalAdd(false);
      resetForm();
      fetchCustomers();
    } catch {
      errorToast("Add failed");
    } finally {
      setAddLoading(false);
    }
  };

  const categories = ["Electrical", "FMCG", "Hardware"];

  const onEditClick = (item) => {
    setSelectedId(item._id);

    setFormData({
      name: item.name || "",
      phone: item.phone || "",
      phone2: item.phone2 || "",
      address: item.address || "",
      routeId: item.routeId?._id || item.routeId || "",
      routeName: item.routeName || "",
      lineNo: item.lineNo || "",
      creditDays: item.creditDays || "",
      pincode: item.pincode || "",
      category: item.category || "",
      status: item.status ?? true,
      geoLocation: {
        lat: item.geoLocation?.lat || item.geoLocation?.latitude || "",
        long: item.geoLocation?.long || item.geoLocation?.longitude || "",
      },
    });

    if (item.img) {
      setImagePreview(item.img);
    } else {
      setImagePreview(null);
    }
    
    setUploadedFile(null);
    setModalEdit(true);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    const fd = new FormData();

    Object.keys(formData).forEach((k) => {
      if (k === "createdBy") return;
      if (k === "geoLocation") {
        fd.append("geoLocation[lat]", formData.geoLocation.lat);
        fd.append("geoLocation[long]", formData.geoLocation.long);
      } else if (formData[k] !== undefined && formData[k] !== null && formData[k] !== "") {
        fd.append(k, formData[k]);
      }
    });

    if (uploadedFile) fd.append("img", uploadedFile);

    try {
      await axios.put(`${process.env.REACT_APP_BACKENDURL}/api/customer/${selectedId}`, fd,
       {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      successToast("Customer updated");
      setModalEdit(false);
      resetForm();
      fetchCustomers();
    } catch {
      errorToast("Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKENDURL}/api/customer/${selectedId}`,
       {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      successToast("Customer deleted");
      setModalDelete(false);
      fetchCustomers();
    } catch {
      errorToast("Delete failed");
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;

    let creditDays = "";
    if (category === "FMCG") creditDays = "30";
    if (category === "Hardware") creditDays = "45";
    if (category === "Electrical") creditDays = "60";

    setFormData({
      ...formData,
      category: category,
      creditDays: creditDays
    });
  };
  return (
    <>
      <Head title="Customer List" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Customer List</BlockTitle>
              <div className="mt-1">
                <span className="text-soft">
                  You Have Total {" "} 
                  <span className="fw-bold mr-1">
                    {filteredData.length}
                  </span>
                  Customers
                  {(routeFilter !== "All" || categoryFilter !== "All" || searchText) && (
                    <span className="text-primary ms-2">
                      (Filtered)
                    </span>
                  )}
                </span>
              </div>
            </BlockHeadContent>

            {/* Filter Dropdowns and Add Button */}
            <div className="d-flex align-items-center gap-2">
              {/* Route Filter Dropdown */}
              <UncontrolledDropdown>
                <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                  <Icon name="map" className="d-none d-sm-inline" />
                  <span>
                    <span className="d-none d-md-inline">
                      {routeFilter === "All" ? "All Routes" : routeFilter}
                    </span>
                  </span>
                  <Icon className="dd-indc" name="chevron-right" />
                </DropdownToggle>
                <DropdownMenu>
                  <ul className="link-list-opt no-bdr">
                    <li className={routeFilter === "All" ? "active" : ""}>
                      <DropdownItem
                        tag="a"
                        href="#!"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setRouteFilter("All");
                        }}
                      >
                        <span>All Routes</span>
                      </DropdownItem>
                    </li>
                    {uniqueRoutes.map((route) => (
                      <li key={route} className={routeFilter === route ? "active" : ""}>
                        <DropdownItem
                          tag="a"
                          href="#!"
                          onClick={(ev) => {
                            ev.preventDefault();
                            setRouteFilter(route);
                          }}
                        >
                          <span>{route}</span>
                        </DropdownItem>
                      </li>
                    ))}
                  </ul>
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* Category Filter Dropdown */}
              <UncontrolledDropdown>
                <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                  <Icon name="category" className="d-none d-sm-inline" />
                  <span>
                    <span className="d-none d-md-inline">
                      {categoryFilter === "All" ? "All Categories" : categoryFilter}
                    </span>
                  </span>
                  <Icon className="dd-indc" name="chevron-right" />
                </DropdownToggle>
                <DropdownMenu>
                  <ul className="link-list-opt no-bdr">
                    <li className={categoryFilter === "All" ? "active" : ""}>
                      <DropdownItem
                        tag="a"
                        href="#!"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setCategoryFilter("All");
                        }}
                      >
                        <span>All Categories</span>
                      </DropdownItem>
                    </li>
                    {categories.map((category) => (
                      <li key={category} className={categoryFilter === category ? "active" : ""}>
                        <DropdownItem
                          tag="a"
                          href="#!"
                          onClick={(ev) => {
                            ev.preventDefault();
                            setCategoryFilter(category);
                          }}
                        >
                          <span>{category}</span>
                        </DropdownItem>
                      </li>
                    ))}
                  </ul>
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* Add Customer Button */}
              <Button color="primary" className="btn-icon"
                onClick={() => {
                  resetForm();
                  setModalAdd(true);
                }}
              >
                <Icon name="plus" />
              </Button>
            </div>
          </BlockBetween>
        </BlockHead>

        <Block>
          <DataTable className="card-stretch">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <div className="card-tools">
                  <div className="form-inline flex-nowrap gx-3">
                    <div className="form-wrap"></div>
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
                    <li className="btn-toolbar-sep"></li>
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="btn btn-trigger btn-icon">
                          <Icon name="setting" />
                        </DropdownToggle>
                        <DropdownMenu right className="dropdown-menu-xs">
                          <ul className="link-check">
                            <li>
                              <span>Show</span>
                            </li>
                            {[10, 15, 20, 25].map((n) => (
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
                            <li>
                              <span>Order</span>
                            </li>
                            <li className={sort === "dsc" ? "active" : ""}>
                              <DropdownItem
                                tag="a"
                                href="#"
                                onClick={() => setSort("dsc")}
                              >
                                DESC
                              </DropdownItem>
                            </li>
                            <li className={sort === "asc" ? "active" : ""}>
                              <DropdownItem
                                tag="a"
                                href="#"
                                onClick={() => setSort("asc")}
                              >
                                ASC
                              </DropdownItem>
                            </li>
                          </ul>
                          {(routeFilter !== "All" || categoryFilter !== "All" || searchText) && (
                            <ul className="link-check">
                              <li>
                                <DropdownItem
                                  tag="a"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    resetFilters();
                                  }}
                                  className="text-primary"
                                >
                                  Clear Filters
                                </DropdownItem>
                              </li>
                            </ul>
                          )}
                        </DropdownMenu>
                      </UncontrolledDropdown>
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
                        setSearchText("");
                        setOnSearch(false);
                      }}
                    >
                      <Icon name="arrow-left" />
                    </Button>
                    <input
                      type="text"
                      className="form-control border-transparent"
                      placeholder="Search Customer name"
                      value={searchText}
                      onChange={onFilterChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DataTableBody compact>
              <DataTableHead>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Name
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Phone
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Route
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Category
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Status
                  </span>
                </DataTableRow>
                <DataTableRow />
              </DataTableHead>

              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <DataTableItem key={item._id}>
                    <DataTableRow>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={item.img || "/default-avatar.png"}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <span className="tb-lead">
                          {item.name?.charAt(0).toUpperCase() + item.name?.slice(1)}
                        </span>
                      </div>
                    </DataTableRow>
                    <DataTableRow>{item.phone}</DataTableRow>
                    <DataTableRow>{item.routeName || "--"}</DataTableRow>
                    <DataTableRow>{item.category || "--"}</DataTableRow>
                    <DataTableRow>
                      <span className={`tb-status text-${item.status ? "success" : "danger"}`}>
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    </DataTableRow>
                    <DataTableRow className="nk-tb-col-tools">
                      <ul className="nk-tb-actions gx-1">
                        <li>
                          <Button size="sm" className="btn-icon" onClick={() => onEditClick(item)}>
                            <Icon name="edit-alt-fill" />
                          </Button>
                        </li>
                        <li>
                          <UncontrolledDropdown>
                            <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
                              <Icon name="more-h" />
                            </DropdownToggle>
                            <DropdownMenu right>
                              <ul className="link-list-opt no-bdr">
                                <li>
                                  <DropdownItem onClick={() => onEditClick(item)}>
                                    <Icon name="edit" /> <span>Edit</span>
                                  </DropdownItem>
                                </li>
                                <li>
                                  <DropdownItem
                                    onClick={() => {
                                      setSelectedId(item._id);
                                      setModalDelete(true);
                                    }}
                                  >
                                    <Icon name="trash" /> <span>Delete</span>
                                  </DropdownItem>
                                </li>
                              </ul>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </li>
                      </ul>
                    </DataTableRow>
                  </DataTableItem>
                ))
              ) : (
               <tr>
    <td colSpan="9" style={{ 
      textAlign: 'center', 
      padding: '20px',
      backgroundColor: '#fff'
    }}>
      No customers found
    </td>
  </tr>
              )}
            </DataTableBody>

            {filteredData.length > 0 && (
              <div className="card-inner">
                <div className="d-flex justify-content-center align-items-center">
                  {/* Previous */}
                  <button
                    className="btn btn-icon btn-sm btn-outline-light mx-1"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    style={{ borderRadius: "6px" }}
                  >
                    <em className="icon ni ni-chevron-left"></em>
                  </button>

                  {/* Page Numbers */}
                  {[...Array(Math.ceil(filteredData.length / itemPerPage))].map((_, index) => {
                    const pageNumber = index + 1;

                    if (
                      pageNumber === currentPage ||
                      pageNumber === currentPage - 1 ||
                      pageNumber === currentPage + 1
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`btn btn-sm mx-1 ${
                            currentPage === pageNumber
                              ? "btn-primary"
                              : "btn-outline-light"
                          }`}
                          style={{
                            minWidth: "36px",
                            borderRadius: "6px",
                            fontWeight: 500
                          }}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}

                  {/* Next */}
                  <button
                    className="btn btn-icon btn-sm btn-outline-light mx-1"
                    disabled={
                      currentPage === Math.ceil(filteredData.length / itemPerPage)
                    }
                    onClick={() => setCurrentPage(currentPage + 1)}
                    style={{ borderRadius: "6px" }}
                  >
                    <em className="icon ni ni-chevron-right"></em>
                  </button>
                </div>
              </div>
            )}
          </DataTable>
        </Block>
      </Content>

      {/* Add Modal with Image Preview */}
      <Modal
        isOpen={modalAdd}
        toggle={() => {
          setModalAdd(false);
          resetForm();
        }}
        centered
        size="lg"
      >
        <ModalBody>
          <a
            href="#cancel"
            className="close"
            onClick={(e) => {
              e.preventDefault();
              setModalAdd(false);
              resetForm();
            }}
          >
            <Icon name="cross-sm" />
          </a>

          <h5 className="title mb-3">Add Customer</h5>

          <Form className="row gy-3" onSubmit={onAddSubmit}>
            <Col md="6">
              <FormGroup>
                <label className="form-label">Customer Name *</label>
                <input
                  className="form-control"
                  required
                  value={formData.name}
                  placeholder="Enter customer name"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormGroup>
            </Col>

            <Col md="3">
              <FormGroup>
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-control"
                  required
                  maxLength="10"
                  pattern="[0-9]{10}"
                  placeholder="Enter mobile number"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                />
              </FormGroup>
            </Col>

            <Col md="3">
              <FormGroup>
                <label className="form-label">Alternate Phone </label>
                <input
                  type="tel"
                  className="form-control"
                  maxLength="10"
                  placeholder="Enter alternate number (optional)"
                  value={formData.phone2}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData({ ...formData, phone2: value });
                    }
                  }}
                />
              </FormGroup>
            </Col>

            <Col md="12">
              <FormGroup>
                <label className="form-label">Address *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  required
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Route *</label>
                <CreatableSelect
                  isClearable
                  isLoading={loadingRoutes}
                  options={routes}
                  placeholder="Select or create route"
                  formatCreateLabel={(inputValue) => `Create route "${inputValue}"`}
                  value={formData.routeId ? routes.find((r) => r.value === formData.routeId) : null}
                  onChange={(selected) => {
                    if (selected) {
                      setFormData({
                        ...formData,
                        routeId: selected.value,
                        routeName: selected.label,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        routeId: "",
                        routeName: "",
                      });
                    }
                  }}
                  onCreateOption={(inputValue) => {
                    createRoute(inputValue);
                  }}
                />
              </FormGroup>
            </Col>

           <Col md="4">
              <FormGroup>
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={formData.category}
                  required
                  onChange={handleCategoryChange}
                >
                  <option value="">Select Category</option>
                  <option value="Electrical">Electrical</option>
                  <option value="FMCG">FMCG</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </FormGroup>
            </Col>

             <Col md="4">
              <FormGroup>
                <label className="form-label">Credit Days</label>
                <input
                  className="form-control"
                  value={formData.creditDays}
                  disabled
                >

                </input>
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Latitude *</label>
                <input
                  className="form-control"
                  value={formData.geoLocation?.lat}
                  required
                  placeholder="Enter Latitude"
                  onChange={(e) =>
                    setFormData({ ...formData, geoLocation: { ...formData.geoLocation, lat: e.target.value } })
                  }
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Longitude *</label>
                <input
                  className="form-control"
                  placeholder="Enter Longitude"
                  value={formData.geoLocation?.long}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, geoLocation: { ...formData.geoLocation, long: e.target.value } })
                  }
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Pincode *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.pincode}
                  placeholder="Enter Pincode"
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </FormGroup>
            </Col>

            <Col md="12">
              <FormGroup>
                <label className="form-label">Customer Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <Dropzone multiple={false} onDrop={handleFileSelect}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone upload-zone small bg-lighter" style={{ flex: 1 }}>
                        <input {...getInputProps()} />
                        {uploadedFile ? uploadedFile.name : "Upload Customer Image"}
                        <div className="text-soft medium mt-1">PNG or JPG only (max 5MB)</div>
                      </div>
                      
                      
                    )}
                  </Dropzone>
                  
                  {imagePreview && (
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #e5e9f2',
                      flexShrink: 0
                    }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    </div>
                  )}
                </div>
              </FormGroup>
            </Col>

            <Col md="12" className="text-end">
              <Button color="primary" type="submit" disabled={addLoading}>
                {addLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  "Save Customer"
                )}
              </Button>
            </Col>
          </Form>
        </ModalBody>
      </Modal>

      {/* Edit Modal with Image Preview */}
      <Modal isOpen={modalEdit} toggle={() => setModalEdit(false)} centered size="lg">
        <ModalBody>
          <a
            href="#cancel"
            className="close"
            onClick={(e) => {
              e.preventDefault();
              setModalEdit(false);
            }}
          >
            <Icon name="cross-sm" />
          </a>

          <h5 className="title mb-3">Edit Customer</h5>

          <Form className="row gy-3" onSubmit={onEditSubmit}>
            <Col md="6">
              <FormGroup>
                <label className="form-label">Customer Name *</label>
                <input
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormGroup>
            </Col>

            <Col md="3">
              <FormGroup>
                <label className="form-label">Phone *</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </FormGroup>
            </Col>

            <Col md="3">
              <FormGroup>
                <label className="form-label">Alternate Phone</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.phone2}
                  onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                />
              </FormGroup>
            </Col>

            <Col md="12">
              <FormGroup>
                <label className="form-label">Address *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Route *</label>
                <CreatableSelect
                  isClearable
                  isLoading={loadingRoutes}
                  options={routes}
                  placeholder="Select or create route"
                  formatCreateLabel={(inputValue) => `Create route "${inputValue}"`}
                  value={formData.routeId ? routes.find((r) => r.value === formData.routeId) : null}
                  onChange={(selected) => {
                    if (selected) {
                      setFormData({
                        ...formData,
                        routeId: selected.value,
                        routeName: selected.label,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        routeId: "",
                        routeName: "",
                      });
                    }
                  }}
                  onCreateOption={(inputValue) => {
                    createRoute(inputValue);
                  }}
                />
              </FormGroup>
            </Col>

        

           <Col md="4">
              <FormGroup>
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select Category</option>
                  <option value="Electrical">Electrical</option>
                  <option value="FMCG">FMCG</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <label className="form-label">Credit Days *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.creditDays}
                  disabled
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Latitude *</label>
                <input
                  className="form-control"
                  value={formData.geoLocation?.lat}
                  required
                  disabled
                  onChange={(e) =>
                    setFormData({ ...formData, geoLocation: { ...formData.geoLocation, lat: e.target.value } })
                  }
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Longitude *</label>
                <input
                  className="form-control"
                  value={formData.geoLocation?.long}
                  required
                  disabled
                  onChange={(e) =>
                    setFormData({ ...formData, geoLocation: { ...formData.geoLocation, long: e.target.value } })
                  }
                />
              </FormGroup>
            </Col>

            
            <Col md="4">
              <FormGroup>
                <label className="form-label">Pincode *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </FormGroup>
            </Col>

            <Col md="12">
              <FormGroup>
                <label className="form-label">Customer Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <Dropzone multiple={false} onDrop={handleFileSelect}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone upload-zone small bg-lighter" style={{ flex: 1 }}>
                        <input {...getInputProps()} />
                        {uploadedFile ? uploadedFile.name : "Upload Customer Image"}
                         <div className="text-soft medium mt-1">PNG or JPG only (max 5MB)</div>
                      </div>
                    )}
                  </Dropzone>
                  
                  {imagePreview && (
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #e5e9f2',
                      flexShrink: 0
                    }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    </div>
                  )}
                </div>
              </FormGroup>
            </Col>

            <Col md="12" className="text-end">
              <Button color="primary" type="submit" disabled={editLoading}>
                {editLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                  </>
                ) : (
                  "Save Customer"
                )}
              </Button>
            </Col>
          </Form>
        </ModalBody>
      </Modal>

      <Modal isOpen={modalDelete} toggle={() => setModalDelete(false)} centered>
        <ModalBody className="text-center">
          <Icon name="alert-circle" className="text-danger mb-2" />
          <h5>Are you sure to delete?</h5>
          <ul className="d-flex justify-content-center mt-3">
            <li>
              <Button color="danger" className="mr-2" onClick={onDeleteConfirm}>
                Delete
              </Button>
            </li>
            <li>
              <Button color="light" onClick={() => setModalDelete(false)}>
                Cancel
              </Button>
            </li>
          </ul>
        </ModalBody>
      </Modal>
    </>
  );
};

export default CustomerListCompact;