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
import axios from "axios";
import DataContext from "../../../utils/DataContext";
import { successToast, errorToast } from "../../../utils/toaster";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

const StaffListCompact = () => {
  const { userData } = useContext(DataContext);

  const [data, setData] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [sort, setSortState] = useState("dsc");
  const [sm, updateSm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);

  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    email: "",
    mobile: " ",
    staffStatus: "active",
    staffCode: "",
    img: null,
    bloodGroup: "",
    dutyStatus: "active",
    documents: [],
  });

  /* ================= FETCH ================= */
  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/staff`);
      setData(res.data);
    } catch {
      errorToast("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchStaff();
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
      fetchStaff();
    } else {
      setData(data.filter((v) => v.name.toLowerCase().includes(value) || v.email.toLowerCase().includes(value)));
    }
  };

  /* ================= SORT ================= */
  const sortFunc = (type) => {
    let sorted = [...data];
    sorted.sort((a, b) => (type === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    setData(sorted);
  };

  /* ================= CRUD ================= */
  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      email: "",
      mobile: " ",
      staffStatus: "active",
      staffCode: "",
      img: null,
      bloodGroup: "",
      dutyStatus: "active",
      documents: [],
    });
    setSelectedId(null);
  };

  // ================= ADD STAFF =================
  const openAddModal = () => {
    resetForm();
    setModalAdd(true);
  };

  const onAddSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    Object.keys(formData).forEach((k) => {
      if (k === "documents" && formData.documents.length > 0) {
        formData.documents.forEach((file) => fd.append("documents", file));
      } else if (formData[k] !== undefined && formData[k] !== null) {
        fd.append(k, formData[k] instanceof File ? formData[k] : formData[k]);
      }
    });

    fd.append("createdBy", userData._id);

    try {
      await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/staff`, fd);
      successToast("Staff added successfully");
      setModalAdd(false);
      resetForm();
      fetchStaff();
    } catch (err) {
      console.error(err);
      errorToast("Add staff failed");
    }
  };

  // ================= EDIT STAFF =================
  const onEditClick = (item) => {
    setSelectedId(item._id);
    setFormData({
      name: item.name,
      type: item.type,
      email: item.email,
      mobile: item.mobile,
      staffStatus: item.staffStatus,
      dutyStatus: item.dutyStatus,
      staffCode: item.staffCode,
      bloodGroup: item.bloodGroup || "",
      img: item.img || null,
      documents: [],
    });
    setModalEdit(true);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    Object.keys(formData).forEach((k) => {
      if (k === "documents" && formData.documents.length > 0) {
        formData.documents.forEach((file) => fd.append("documents", file));
      } else if (formData[k]) {
        fd.append(k, formData[k] instanceof File ? formData[k] : formData[k]);
      }
    });

    try {
      await axios.put(`${process.env.REACT_APP_BACKENDURL}/api/staff/${selectedId}`, fd);
      successToast("Staff updated successfully");
      setModalEdit(false);
      resetForm();
      fetchStaff();
    } catch (err) {
      console.error(err);
      errorToast("Update failed");
    }
  };

  // ================= DELETE STAFF =================
  const onDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKENDURL}/api/staff/${selectedId}`);
      successToast("Staff deleted successfully");
      setModalDelete(false);
      fetchStaff();
    } catch {
      errorToast("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <React.Fragment>
      <Head title="Staff List" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Staff Listssss
              </BlockTitle>

              <BlockDes className="text-soft">
                <p>You have total {data?.length} Staffs.</p>
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
                        fetchStaff();
                      }}
                    >
                      <Icon name="arrow-left" />
                    </Button>
                    <input
                      type="text"
                      className="form-control border-transparent"
                      placeholder="Search staff name or email"
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
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Profile
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Name
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Email
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Duty
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Type
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Code
                  </span>
                </DataTableRow>
                <DataTableRow>
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Status
                  </span>
                </DataTableRow>
                <DataTableRow className="nk-tb-col-tools"></DataTableRow>
              </DataTableHead>

              {currentItems.map((item) => (
                <DataTableItem key={item._id}>
                  <DataTableRow>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={item.img}
                        alt="profile"
                        style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                      />
                    </div>
                  </DataTableRow>

                  <DataTableRow>
                    <Link className="tb-lead" to={`${process.env.PUBLIC_URL}/staff/${item._id}`}>
                      {item.name}
                    </Link>
                  </DataTableRow>

                  <DataTableRow>{item.email}</DataTableRow>
                  <DataTableRow>
                    <span className={`tb-status text-${item.dutyStatus === "active" ? "success" : "danger"}`}>
                      {item.dutyStatus === "active" ? "On Duty" : "Off Duty"}
                    </span>
                  </DataTableRow>

                  <DataTableRow>{item.type}</DataTableRow>
                  <DataTableRow>{item.staffCode || "--"}</DataTableRow>
                  <DataTableRow>
                    <span className={`tb-status text-${item.staffStatus === "active" ? "success" : "danger"}`}>
                      {item.staffStatus.charAt(0).toUpperCase() + item.staffStatus.slice(1)}
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
            <h5 className="title">Add Staff</h5>
            <Form className="row gy-4" onSubmit={onAddSubmit}>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                      setFormData({ ...formData, name: capitalized });
                    }}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Type</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Staff Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Staff Code"
                    required
                    value={formData.staffCode}
                    onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.staffStatus}
                    onChange={(e) => setFormData({ ...formData, staffStatus: e.target.value })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Duty Status</label>
                  <select
                    className="form-control"
                    value={formData.dutyStatus}
                    onChange={(e) => setFormData({ ...formData, dutyStatus: e.target.value })}
                    required
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Blood Group</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Blood Group (eg: O+, A-)"
                    value={formData.bloodGroup}
                    required
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bloodGroup: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </FormGroup>
              </Col>

              {/* Profile Image Upload */}
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Profile Image</label>
                  <Dropzone multiple={false} onDrop={(files) => setFormData({ ...formData, img: files[0] })}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone mt-2">
                        <input {...getInputProps()} required />
                        {formData.img ? <p>{formData.img.name}</p> : <p>Drag & drop an image or click to select</p>}
                      </div>
                    )}
                  </Dropzone>
                </FormGroup>
              </Col>

              {/* Documents Upload */}
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Documents</label>
                  <Dropzone multiple onDrop={(files) => setFormData({ ...formData, documents: files })}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone mt-2">
                        <input {...getInputProps()} />
                        {formData.documents.length > 0 ? (
                          <ul>
                            {formData.documents.map((f, idx) => (
                              <li key={idx}>{f.name}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>Drag & drop files or click to select</p>
                        )}
                      </div>
                    )}
                  </Dropzone>
                </FormGroup>
              </Col>

              <Col md="12">
                <Button color="primary" type="submit">
                  Save
                </Button>
              </Col>
            </Form>
          </div>
        </ModalBody>
      </Modal>

      {/* ================= EDIT STAFF MODAL ================= */}
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
            <h5 className="title">Edit Staff</h5>
            <Form className="row gy-4" onSubmit={onEditSubmit}>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">* Type</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Staff Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Staff Code"
                    value={formData.staffCode}
                    onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.staffStatus}
                    onChange={(e) => setFormData({ ...formData, staffStatus: e.target.value })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Duty Status</label>
                  <select
                    className="form-control"
                    value={formData.dutyStatus}
                    onChange={(e) => setFormData({ ...formData, dutyStatus: e.target.value })}
                    required
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Blood Group</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Blood Group (eg: O+, A-)"
                    value={formData.bloodGroup}
                    required
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bloodGroup: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </FormGroup>
              </Col>

              {/* Profile Image Upload */}
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Profile Image</label>
                  <Dropzone multiple={false} onDrop={(files) => setFormData({ ...formData, img: files[0] })}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone mt-2">
                        <input {...getInputProps()} />
                        {formData.img ? (
                          <div className="dz-preview dz-image-preview">
                            <img
                              src={typeof formData.img === "string" ? formData.img : URL.createObjectURL(formData.img)}
                              alt="profile"
                              style={{ width: "100px", height: "100px", objectFit: "cover" }}
                            />
                            <p>{typeof formData.img === "string" ? "Current Image" : formData.img.name}</p>
                          </div>
                        ) : (
                          <p>Drag & drop an image or click to select</p>
                        )}
                      </div>
                    )}
                  </Dropzone>
                </FormGroup>
              </Col>

              {/* Documents Upload */}
              <Col md="12">
                <FormGroup>
                  <label className="form-label">Documents</label>
                  <Dropzone multiple onDrop={(files) => setFormData({ ...formData, documents: files })}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone mt-2">
                        <input {...getInputProps()} />
                        {formData.documents.length > 0 ? (
                          <ul>
                            {formData.documents.map((f, idx) => (
                              <li key={idx}>{f.name}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>Drag & drop files or click to select</p>
                        )}
                      </div>
                    )}
                  </Dropzone>
                </FormGroup>
              </Col>

              <Col md="12">
                <Button color="primary" type="submit">
                  Update
                </Button>
              </Col>
            </Form>
          </div>
        </ModalBody>
      </Modal>

      {/* ================= DELETE MODAL ================= */}
      <Modal isOpen={modalDelete} toggle={() => setModalDelete(false)} centered>
        <ModalBody className="text-center">
          <Icon name="alert-circle" className="text-danger mb-2" />
          <h5>Are you sure to delete?</h5>
          <ul className="d-flex justify-content-center mt-3">
            <li>
              <Button color="danger" onClick={onDeleteConfirm}>
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
    </React.Fragment>
  );
};

export default StaffListCompact;
