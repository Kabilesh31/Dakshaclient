import React, { useEffect, useState, useContext } from "react";
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
import DatePicker from "react-datepicker";
import axios from "axios";
import DataContext from "../../../utils/DataContext";
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);

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
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/vehicle`);
      setData(res.data);
    } catch {
      errorToast("Failed to fetch vehicles");
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
      setData(data.filter(v => v.vehicleNumber.toLowerCase().includes(value)));
    }
  };

  /* ================= SORT ================= */
  const sortFunc = (type) => {
    let sorted = [...data];
    sorted.sort((a, b) => type === "asc"
      ? a.vehicleNumber.localeCompare(b.vehicleNumber)
      : b.vehicleNumber.localeCompare(a.vehicleNumber)
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

  const fd = new FormData();

  // Append form data
  Object.keys(formData).forEach((k) => {
    let value = formData[k];

    // Force vehicle number to uppercase
    if (k === "vehicleNumber" && value) value = value.toUpperCase();

    if (value) {
      // Convert dates to ISO string
      fd.append(k, value instanceof Date ? value.toISOString() : value);
    }
  });

  // Append uploaded image if exists
  if (uploadedFile) fd.append("img", uploadedFile);

  // Append createdBy
  fd.append("createdBy", userData._id);

  try {
    await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/vehicle`, fd, {
      // Do NOT set Content-Type manually
      headers: {
        // Authorization if needed
        // Authorization: `Bearer ${userData.token}`,
      },
    });

    successToast("Vehicle added successfully");

    // Close Add Modal and reset form
    setModalAdd(false);
    resetForm();

    // Refresh vehicle list
    fetchVehicles();
  } catch (err) {
    console.error(err);
    errorToast("Add vehicle failed");
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
    });
    setUploadedFile(null);
    setModalEdit(true);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(formData).forEach(k => {
      if (formData[k]) fd.append(k, formData[k] instanceof Date ? formData[k].toISOString() : formData[k]);
    });
    if (uploadedFile) fd.append("img", uploadedFile);

    try {
      await axios.put(`${process.env.REACT_APP_BACKENDURL}/api/vehicle/${selectedId}`, fd);
      successToast("Vehicle updated");
      setModalEdit(false);
      resetForm();
      fetchVehicles();
    } catch {
      errorToast("Update failed");
    }
  };

  // ================= DELETE VEHICLE =================
 const onDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKENDURL}/api/vehicle/${selectedId}`);
      successToast("Vehicle deleted successfully");
      setModalDelete(false);
      fetchVehicles();
    } catch {
      errorToast("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <React.Fragment>
      <Head title="Vehicle List" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Vehicle List</BlockTitle>
            </BlockHeadContent>
            <Button color="primary" onClick={openAddModal}>
              <Icon name="plus" /> Add Vehicle
            </Button>
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
                        onClick={(ev) => { ev.preventDefault(); setOnSearch(true); }}
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
                            <li><span>Show</span></li>
                            {[10,15].map(n => (
                              <li key={n} className={itemPerPage === n ? "active" : ""}>
                                <DropdownItem tag="a" href="#" onClick={(e)=>{e.preventDefault();setItemPerPage(n);}}>{n}</DropdownItem>
                              </li>
                            ))}
                          </ul>
                          <ul className="link-check">
                            <li><span>Order</span></li>
                            <li className={sort === "dsc" ? "active" : ""}>
                              <DropdownItem tag="a" href="#" onClick={(e)=>{e.preventDefault();setSortState("dsc");sortFunc("dsc");}}>DESC</DropdownItem>
                            </li>
                            <li className={sort === "asc" ? "active" : ""}>
                              <DropdownItem tag="a" href="#" onClick={(e)=>{e.preventDefault();setSortState("asc");sortFunc("asc");}}>ASC</DropdownItem>
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
                    <Button className="search-back btn-icon" onClick={() => { setSearchText(""); setOnSearch(false); fetchVehicles(); }}>
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
            <DataTableBody compact>
              <DataTableHead>
                
                <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Vehicle Number</span></DataTableRow>
                <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Type</span></DataTableRow>
                <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Year</span></DataTableRow>
                <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Insurance Expiry</span></DataTableRow>
                <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">FC Upto</span></DataTableRow>
                <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Status</span></DataTableRow>
                <DataTableRow className="nk-tb-col-tools"></DataTableRow>
              </DataTableHead>

              {currentItems.map(item => (
                <DataTableItem key={item._id}>
                    <DataTableRow>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src={item.img}
                      alt="vehicle"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                    <Link
                      className="tb-lead"
                      to={`${process.env.PUBLIC_URL}/vehicle/${item._id}`}
                    >
                      {item.vehicleNumber}
                    </Link>
                  </div>
                </DataTableRow>

                  
                  <DataTableRow>{item.vehicleType}</DataTableRow>
                  <DataTableRow>{item.makeYear}</DataTableRow>
                  <DataTableRow>{item.insuranceExpiry ? new Date(item.insuranceExpiry).toLocaleDateString() : "--"}</DataTableRow>
                  <DataTableRow>{item.fcUpto ? new Date(item.fcUpto).toLocaleDateString() : "--"}</DataTableRow>
                  <DataTableRow>
                    <span className={`tb-status text-${item.status ? "success" : "danger"}`}>{item.status ? "Active" : "Inactive"}</span>
                  </DataTableRow>

                  {/* ACTIONS: EDIT + MORE MENU */}
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
                                <DropdownItem onClick={() => { setSelectedId(item._id); setModalDelete(true); }}>
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
              ))}
            </DataTableBody>

            {/* PAGINATION */}
            <div className="card-inner">
              {currentItems.length > 0 ? (
                <PaginationComponent
                  itemPerPage={itemPerPage}
                  totalItems={data.length}
                  paginate={setCurrentPage}
                  currentPage={currentPage}
                />
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
          <a href="#cancel" onClick={(ev)=>{ ev.preventDefault(); setModalAdd(false); }} className="close">
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
                    onChange={e =>
                      setFormData({
                        ...formData,
                        vehicleNumber: e.target.value.toUpperCase(), // convert to uppercase
                      })
                    }
                    required
                  />

                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Vehicle Type</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter Vehicle Type"
                    value={formData.vehicleType}
                    onChange={e=>setFormData({...formData, vehicleType:e.target.value})}
                    required
                  />
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
                    onChange={e=>setFormData({...formData, makeYear:e.target.value})}
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
                    onChange={d=>setFormData({...formData, insuranceExpiry:d})}
                    placeholderText="Insurance Expiry"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">FC Upto</label>
                  <DatePicker
                    selected={formData.fcUpto}
                    className="form-control"
                    onChange={d=>setFormData({...formData, fcUpto:d})}
                    placeholderText="FC Upto"
                  />
                </FormGroup>
              </Col>
              <Col md="12">
               <Dropzone multiple={false} onDrop={(acceptedFiles) => setUploadedFile(acceptedFiles[0])}>
  {({ getRootProps, getInputProps }) => (
    <div {...getRootProps()} className="dropzone mt-2">
      <input {...getInputProps()} />
      {uploadedFile ? <p>{uploadedFile.name}</p> : <p>Drag & drop an image or click to select</p>}
    </div>
  )}
</Dropzone>

              </Col>
              <Col md="12">
                <Button color="primary" type="submit">Save</Button>
              </Col>
            </Form>
          </div>
        </ModalBody>
      </Modal>

      {/* ================= EDIT MODAL ================= */}
      <Modal isOpen={modalEdit} toggle={() => setModalEdit(false)} className="modal-dialog-centered" size="lg">
        <ModalBody>
          <a href="#cancel" onClick={(ev)=>{ ev.preventDefault(); setModalEdit(false); }} className="close">
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
                    onChange={e=>setFormData({...formData, vehicleNumber:e.target.value})}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Vehicle Type</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter Vehicle Type"
                    value={formData.vehicleType}
                    onChange={e=>setFormData({...formData, vehicleType:e.target.value})}
                    required
                  />
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
                    onChange={e=>setFormData({...formData, makeYear:e.target.value})}
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
                    onChange={d=>setFormData({...formData, insuranceExpiry:d})}
                    placeholderText="Insurance Expiry"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">FC Upto</label>
                  <DatePicker
                    selected={formData.fcUpto}
                    className="form-control"
                    onChange={d=>setFormData({...formData, fcUpto:d})}
                    placeholderText="FC Upto"
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
                <Button color="primary" type="submit">Update</Button>
              </Col>
            </Form>
          </div>
        </ModalBody>
      </Modal>

      {/* DELETE MODAL */}
       <Modal isOpen={modalDelete} toggle={()=>setModalDelete(false)} centered>
        <ModalBody className="text-center">
          <Icon name="alert-circle" className="text-danger mb-2" />
          <h5>Are you sure to delete?</h5>
          <ul className="d-flex justify-content-center mt-3">
            <li><Button color="danger" onClick={onDeleteConfirm}>Delete</Button></li>
            <li><Button color="light" onClick={()=>setModalDelete(false)}>Cancel</Button></li>
          </ul>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default VehicleListCompact;
