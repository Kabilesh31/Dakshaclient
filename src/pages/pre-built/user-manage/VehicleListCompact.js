import React, { useEffect, useState, useContext } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
  BlockDes,
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
import DatePicker from "react-datepicker";
import axios from "axios";
import DataContext from "../../../utils/DataContext";
import "./vehicle-details.css";
import { successToast, errorToast } from "../../../utils/toaster";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

const VehicleListCompact = () => {
  const { userData } = useContext(DataContext);

  /* ================= STATE ================= */
  const [data, setData] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [sort, setSortState] = useState("dsc");
  const [sm, updateSm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleType: "",
    makeYear: "",
    insuranceExpiry: null,
    fcUpto: null,
  });

  /* ================= FETCH ================= */
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/vehicle`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (response.status === 200) {
        const vehicles = response.data || [];

        setData(vehicles);
      }
    } catch (err) {
      console.log("Fetch vehicles error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        }
      } else {
        console.log("Network error");
      }
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  /* ================= PAGINATION ================= */
  useEffect(() => {
    const indexOfLast = currentPage * itemPerPage;
    const indexOfFirst = indexOfLast - itemPerPage;
    setCurrentItems(data.slice(indexOfFirst, indexOfLast));
  }, [data, currentPage, itemPerPage]);

  /* ================= SEARCH ================= */
  const onFilterChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    if (value === "") {
      fetchVehicles();
    } else {
      setData(data.filter((v) => v.vehicleNumber.toLowerCase().includes(value)));
    }
  };

  /* ================= SORT ================= */
  const sortFunc = (type) => {
    let sorted = [...data];
    sorted.sort((a, b) =>
      type === "asc" ? a.vehicleNumber.localeCompare(b.vehicleNumber) : b.vehicleNumber.localeCompare(a.vehicleNumber),
    );
    setData(sorted);
  };

  /* ================= CRUD ================= */
  const resetForm = () => {
    setFormData({
      vehicleNumber: "",
      vehicleType: "",
      makeYear: "",
      insuranceExpiry: null,
      fcUpto: null,
      img: "",
    });

    setUploadedFile(null);
    setSelectedId(null);
  };

  // ================= ADD VEHICLE =================
  const openAddModal = () => {
    resetForm();
    setModalAdd(true);
  };

  const onAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);

    const fd = new FormData();

    Object.keys(formData).forEach((k) => {
      let value = formData[k];

      if (k === "vehicleNumber" && value) value = value.toUpperCase();

      if (value) {
        fd.append(k, value instanceof Date ? value.toISOString() : value);
      }
    });

    if (uploadedFile) fd.append("img", uploadedFile);

    fd.append("createdBy", userData._id);

    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/vehicle`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (response.status === 201 || response.status === 200) {
        successToast("Vehicle added successfully");

        setModalAdd(false);
        resetForm();

        fetchVehicles();
      }
    } catch (err) {
      console.log("Add vehicle error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        } else {
          errorToast(err.response.data?.message || "Add vehicle failed");
        }
      } else {
        console.log("Network error");
        errorToast("Network error. Please check your connection");
      }
    } finally {
      setAddLoading(false);
    }
  };
  // ================= EDIT VEHICLE =================
  const onEditClick = (item) => {
    setSelectedId(item._id);

    setFormData({
      vehicleNumber: item.vehicleNumber,
      vehicleType: item.vehicleType,
      makeYear: item.makeYear,
      insuranceExpiry: item.insuranceExpiry ? new Date(item.insuranceExpiry) : null,
      fcUpto: item.fcUpto ? new Date(item.fcUpto) : null,
      img: item.img || "",
    });

    setUploadedFile(null);
    setModalEdit(true);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const fd = new FormData();

    Object.keys(formData).forEach((k) => {
      if (formData[k]) {
        fd.append(k, formData[k] instanceof Date ? formData[k].toISOString() : formData[k]);
      }
    });

    if (uploadedFile) fd.append("img", uploadedFile);

    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const response = await axios.put(`${process.env.REACT_APP_BACKENDURL}/api/vehicle/${selectedId}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (response.status === 200) {
        successToast("Vehicle updated");
        setModalEdit(false);
        resetForm();
        fetchVehicles();
      }
    } catch (err) {
      console.log("Update vehicle error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        } else {
          errorToast(err.response.data?.message || "Update failed");
        }
      } else {
        console.log("Network error");
        errorToast("Network error. Please check your connection");
      }
    } finally {
      setEditLoading(false);
    }
  };
  // ================= DELETE VEHICLE =================
  const onDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const response = await axios.delete(`${process.env.REACT_APP_BACKENDURL}/api/vehicle/${selectedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (response.status === 200) {
        successToast("Vehicle deleted successfully");
        setModalDelete(false);
        fetchVehicles();
      }
    } catch (err) {
      console.log("Delete vehicle error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        } else {
          errorToast(err.response.data?.message || "Delete failed");
        }
      } else {
        console.log("Network error");
        errorToast("Network error. Please check your connection");
      }
    }
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      errorToast("No data to export");
      return;
    }

    const formattedData = data.map((item) => ({
      "Vehicle Number": item.vehicleNumber,
      "Vehicle Type": item.vehicleType,
      "Make Year": item.makeYear,
      "Insurance Expiry": item.insuranceExpiry ? new Date(item.insuranceExpiry).toLocaleDateString() : "--",
      "FC Upto": item.fcUpto ? new Date(item.fcUpto).toLocaleDateString() : "--",
      Status: item.status ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicles");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, "Vehicle_List.xlsx");
  };
  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isExpiringSoon = (date, days = 7) => {
    if (!date) return false;

    const today = new Date();
    const expiry = new Date(date);
    const diffTime = expiry - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays > 0 && diffDays <= days;
  };

  /* ================= UI ================= */
  return (
    <React.Fragment>
      <Head title="Vehicle List" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Vehicle List
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>You have total {data?.length} Vehicles.</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className={`btn-icon btn-trigger toggle-expand mr-n1 ${sm ? "active" : ""}`}
                  onClick={() => updateSm(!sm)}
                >
                  <Icon name="menu-alt-r"></Icon>
                </Button>
                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                  <ul className="nk-block-tools g-3">
                    <li>
                      <a
                        href="#export"
                        onClick={(ev) => {
                          ev.preventDefault();
                          exportToExcel();
                        }}
                        className="btn btn-white btn-outline-light"
                      >
                        <Icon name="download-cloud"></Icon>
                        <span>Export</span>
                      </a>
                    </li>
                    <li className="nk-block-tools-opt">
                      <Button color="primary" className="btn-icon" onClick={openAddModal}>
                        <Icon name="plus"></Icon>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
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
                    {/* SEARCH ICON */}
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
                            {[10, 15].map((n) => (
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
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSortState("dsc");
                                  sortFunc("dsc");
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
                                  sortFunc("asc");
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

              {/* SEARCH BAR */}
              <div className={`card-search search-wrap ${onSearch ? "active" : ""}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button
                      className="search-back btn-icon"
                      onClick={() => {
                        setSearchText("");
                        setOnSearch(false);
                        fetchVehicles();
                      }}
                    >
                      <Icon name="arrow-left" />
                    </Button>
                    <input
                      type="text"
                      className="form-control border-transparent"
                      placeholder="Search vehicle number"
                      value={searchText}
                      onChange={onFilterChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE */}
            {/* TABLE */}
            <DataTableBody compact>
              <DataTableHead>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Vehicle Number
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Type
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Year
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Insurance Expiry
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    FC Upto
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Status
                  </span>
                </DataTableRow>
                <DataTableRow className="nk-tb-col-tools">
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Actions
                  </span>
                </DataTableRow>
              </DataTableHead>

              {currentItems.map((item) => (
                <DataTableItem key={item._id}>
                  <DataTableRow>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={item.img ? item.img : "/default-vehicle.jpg"}
                        alt="vehicle"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-vehicle.jpg";
                        }}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <Link className="tb-lead" to={`${process.env.PUBLIC_URL}/vehicle/${item._id}`}>
                        {item.vehicleNumber}
                      </Link>
                    </div>
                  </DataTableRow>

                  <DataTableRow>{item.vehicleType?.charAt(0).toUpperCase() + item.vehicleType?.slice(1)}</DataTableRow>

                  <DataTableRow>{item.makeYear}</DataTableRow>

                  <DataTableRow>
                    {item.insuranceExpiry ? (
                      <span
                        style={{
                          color: isExpired(item.insuranceExpiry) ? "red" : "inherit",
                          fontWeight: isExpired(item.insuranceExpiry) ? "500" : "normal",
                        }}
                      >
                        {new Date(item.insuranceExpiry).toLocaleDateString()}
                      </span>
                    ) : (
                      "--"
                    )}
                  </DataTableRow>

                  <DataTableRow>
                    {item.fcUpto ? (
                      <span
                        style={{
                          color: isExpired(item.fcUpto) ? "red" : "inherit",
                          fontWeight: isExpired(item.fcUpto) ? "500" : "normal",
                        }}
                      >
                        {new Date(item.fcUpto).toLocaleDateString()}
                      </span>
                    ) : (
                      "--"
                    )}
                  </DataTableRow>

                  <DataTableRow>
                    <span className={`tb-status text-${item.status ? "success" : "danger"}`}>
                      {item.status ? "Active" : "Inactive"}
                    </span>
                  </DataTableRow>

                  {/* ACTIONS: Three dots dropdown with Edit and Delete */}
                  <DataTableRow className="nk-tb-col-tools">
                    <UncontrolledDropdown>
                      <DropdownToggle tag="a" className="btn btn-trigger btn-icon">
                        <Icon name="more-h" />
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem
                          tag="a"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onEditClick(item);
                          }}
                        >
                          <Icon name="edit" />
                          <span>Edit</span>
                        </DropdownItem>
                        <DropdownItem
                          tag="a"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedId(item._id);
                            setModalDelete(true);
                          }}
                        >
                          <Icon name="trash" />
                          <span>Delete</span>
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </DataTableRow>
                </DataTableItem>
              ))}
            </DataTableBody>

            {/* PAGINATION */}
            <div className="card-inner">
              {currentItems.length > 0 ? (
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
                  {[...Array(Math.ceil(data.length / itemPerPage))].map((_, index) => {
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
                            currentPage === pageNumber ? "btn-primary" : "btn-outline-light"
                          }`}
                          style={{
                            minWidth: "36px",
                            borderRadius: "6px",
                            fontWeight: 500,
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
                    disabled={currentPage === Math.ceil(data.length / itemPerPage)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    style={{ borderRadius: "6px" }}
                  >
                    <em className="icon ni ni-chevron-right"></em>
                  </button>
                </div>
              ) : (
                <div className="text-center text-silent">No data found</div>
              )}
            </div>
          </DataTable>
        </Block>
      </Content>

      {/* ADD VEHICLE MODAL */}
      <Modal isOpen={modalAdd} toggle={() => setModalAdd(false)} className="modal-dialog-centered" size="lg">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              setModalAdd(false);
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">Add Vehicle</h5>
            <Form className="row gy-4" onSubmit={onAddSubmit}>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Vehicle Number</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter Vehicle Number"
                    value={formData.vehicleNumber}
                    maxLength={10}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, "");

                      if (value.length > 10) return; // extra safety

                      setFormData({
                        ...formData,
                        vehicleNumber: value,
                      });
                    }}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Vehicle Type</label>
                  <select
                    className="form-control"
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicleType: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Bike">Bike</option>
                    <option value="Auto">Auto</option>
                  </select>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Make Year</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Enter Make Year"
                    value={formData.makeYear}
                    min="1900"
                    max={new Date().getFullYear()}
                    onChange={(e) => {
                      let value = e.target.value;

                      // Allow only 4 digits
                      if (value.length > 4) return;

                      setFormData({
                        ...formData,
                        makeYear: value,
                      });
                    }}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Insurance Expiry</label>
                  <DatePicker
                    selected={formData.insuranceExpiry}
                    className="form-control"
                    onChange={(d) => setFormData({ ...formData, insuranceExpiry: d })}
                    placeholderText="Insurance Expiry"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">FC Upto</label>
                  <DatePicker
                    selected={formData.fcUpto}
                    className="form-control"
                    onChange={(d) => setFormData({ ...formData, fcUpto: d })}
                    placeholderText="FC Upto"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                <Dropzone multiple={false} onDrop={(acceptedFiles) => setUploadedFile(acceptedFiles[0])}>
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="dropzone upload-zone small bg-lighter my-2 dz-clickable">
                      <input {...getInputProps()} />

                      {uploadedFile ? (
                        <div className="dz-preview dz-image-preview text-center">
                          <div className="dz-image mb-2">
                            <img
                              src={URL.createObjectURL(uploadedFile)}
                              alt="preview"
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          </div>
                          <p className="small">{uploadedFile.name}</p>

                          {/* Remove Image Option */}
                          <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFile(null);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <p className="text-muted">Drag & drop or click to upload image</p>
                      )}
                    </div>
                  )}
                </Dropzone>
              </Col>
              <Col md="12">
                <Button color="primary" type="submit" disabled={addLoading}>
                  {addLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </Col>
            </Form>
          </div>
        </ModalBody>
      </Modal>

      {/* ================= EDIT MODAL ================= */}
      <Modal isOpen={modalEdit} toggle={() => setModalEdit(false)} className="modal-dialog-centered" size="lg">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              setModalEdit(false);
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">Edit Vehicle</h5>
            <Form className="row gy-4" onSubmit={onEditSubmit}>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Vehicle Number</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter Vehicle Number"
                    value={formData.vehicleNumber}
                    maxLength={10}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, "");

                      if (value.length > 10) return;

                      setFormData({
                        ...formData,
                        vehicleNumber: value,
                      });
                    }}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Vehicle Type</label>
                  <select
                    className="form-control"
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicleType: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Bike">Bike</option>
                    <option value="Auto">Auto</option>
                  </select>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Make Year</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter Make Year"
                    value={formData.makeYear}
                    onChange={(e) => {
                      let value = e.target.value;

                      // Allow empty (important for erase)
                      if (value === "") {
                        setFormData({ ...formData, makeYear: "" });
                        return;
                      }

                      // Allow only 4 digits
                      if (!/^\d{0,4}$/.test(value)) return;

                      setFormData({
                        ...formData,
                        makeYear: value,
                      });
                    }}
                    onBlur={() => {
                      if (!formData.makeYear) return; // Don't validate empty

                      const year = Number(formData.makeYear);
                      const currentYear = new Date().getFullYear();

                      if (year < 1900 || year > currentYear) {
                        errorToast(`Year must be between 1900 and ${currentYear}`);
                        setFormData({
                          ...formData,
                          makeYear: "",
                        });
                      }
                    }}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Insurance Expiry</label>
                  <DatePicker
                    selected={formData.insuranceExpiry}
                    className="form-control"
                    onChange={(d) => setFormData({ ...formData, insuranceExpiry: d })}
                    placeholderText="Insurance Expiry"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">FC Upto</label>
                  <DatePicker
                    selected={formData.fcUpto}
                    onChange={(d) => setFormData({ ...formData, fcUpto: d })}
                    className="form-control"
                    placeholderText="FC Upto"
                    popperPlacement="bottom-end"
                  />
                </FormGroup>
              </Col>
              <Col md="12">
                {/* EDIT MODAL IMAGE UPLOAD */}
                <Dropzone multiple={false} onDrop={(files) => setUploadedFile(files[0])}>
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="dropzone upload-zone small bg-lighter my-2 dz-clickable">
                      <input {...getInputProps()} />

                      {/* Show preview if file selected */}
                      {uploadedFile ? (
                        <div className="dz-preview dz-image-preview">
                          <div className="dz-image">
                            <img
                              src={URL.createObjectURL(uploadedFile)}
                              alt="preview"
                              style={{ width: "100px", height: "100px", objectFit: "cover" }}
                            />
                          </div>
                          <p>{uploadedFile.name}</p>
                        </div>
                      ) : formData.img ? (
                        // Show previously uploaded image from backend
                        <div className="dz-preview dz-image-preview">
                          <div className="dz-image">
                            <img
                              src={formData.img}
                              alt="current"
                              style={{ width: "100px", height: "100px", objectFit: "cover" }}
                            />
                          </div>
                          <p>Current Image</p>
                        </div>
                      ) : (
                        <p>Drag & drop or click to upload image</p>
                      )}
                    </div>
                  )}
                </Dropzone>
              </Col>
              <Col md="12">
                <Button color="primary" type="submit" disabled={editLoading}>
                  {editLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </Col>
            </Form>
          </div>
        </ModalBody>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={modalDelete} toggle={() => setModalDelete(false)} centered>
        <ModalBody className="text-center p-4">
          <Icon name="alert-circle" className="text-danger mb-3" style={{ fontSize: "40px" }} />

          <h5 className="mb-4 fw-bold">Are you sure you want to delete?</h5>

          <div className="d-flex justify-content-center mt-3">
            <Button color="danger" className="px-4 me-4 mr-2" onClick={onDeleteConfirm}>
              Delete
            </Button>

            <Button color="secondary" className="px-4" onClick={() => setModalDelete(false)}>
              Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default VehicleListCompact;
