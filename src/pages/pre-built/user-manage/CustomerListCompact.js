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

const CustomerListCompact = () => {
  const { userData } = useContext(DataContext);

  /* ================= STATE ================= */
  const [data, setData] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [sort, setSort] = useState("dsc");
  const [sm, updateSm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);

  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

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

  /* ================= FETCH ================= */
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/customer`);
      setData(res.data.filter(c => !c.isDeleted));
    } catch {
      errorToast("Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
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

    if (!value) {
      fetchCustomers();
    } else {
      setData(data.filter(c => c.name.toLowerCase().includes(value)));
    }
  };

  /* ================= SORT ================= */
  const sortFunc = (type) => {
    const sorted = [...data].sort((a, b) =>
      type === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    setData(sorted);
  };

  /* ================= RESET ================= */
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
    setSelectedId(null);
  };

  /* ================= ADD ================= */
  const onAddSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    Object.keys(formData).forEach(k => {
  if (k === "createdBy") return; // 🔥 IMPORTANT
  if (k === "geoLocation") {
    fd.append("geoLocation[lat]", formData.geoLocation.lat);
    fd.append("geoLocation[long]", formData.geoLocation.long);
  } else if (formData[k] !== undefined && formData[k] !== null && formData[k] !== "") {
    fd.append(k, formData[k]);
  }
});


    if (uploadedFile) fd.append("img", uploadedFile);
    fd.append("createdBy", userData._id);

    try {
      await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/customer`, fd);
      successToast("Customer added successfully");
      setModalAdd(false);
      resetForm();
      fetchCustomers();
    } catch {
      errorToast("Add failed");
    }
  };

  /* ================= EDIT ================= */
  const onEditClick = (item) => {
    setSelectedId(item._id);
    setFormData({
      ...item,
      geoLocation: item.geoLocation || { lat: "", long: "" },
    });
    setUploadedFile(null);
    setModalEdit(true);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    Object.keys(formData).forEach(k => {
  if (k === "createdBy") return; // 🔥 IMPORTANT
  if (k === "geoLocation") {
    fd.append("geoLocation[lat]", formData.geoLocation.lat);
    fd.append("geoLocation[long]", formData.geoLocation.long);
  } else if (formData[k] !== undefined && formData[k] !== null && formData[k] !== "") {
    fd.append(k, formData[k]);
  }
});


    if (uploadedFile) fd.append("img", uploadedFile);

    try {
      await axios.put(`${process.env.REACT_APP_BACKENDURL}/api/customer/${selectedId}`, fd);
      successToast("Customer updated");
      setModalEdit(false);
      resetForm();
      fetchCustomers();
    } catch {
      errorToast("Update failed");
    }
  };

  /* ================= DELETE ================= */
  const onDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKENDURL}/api/customer/${selectedId}`);
      successToast("Customer deleted");
      setModalDelete(false);
      fetchCustomers();
    } catch {
      errorToast("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <Head title="Customer List" />
      <Content>
        <BlockHead size="sm">
               <BlockBetween>
                 <BlockHeadContent>
                   <BlockTitle tag="h3" page>
                     Customer List
                   </BlockTitle>
                   <BlockDes className="text-soft">
                     <p>You have total {data?.length} Customers.</p>
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
                           <Button color="primary" className="btn-icon" onClick={()=> {setModalAdd(true)}}>
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
                            <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Name</span></DataTableRow>
                            <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Phone</span></DataTableRow>
                            <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Route</span></DataTableRow>
                            <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Category</span></DataTableRow>
                            <DataTableRow><span style={{fontWeight:"bold"}} className="sub-text">Status</span></DataTableRow>
                            <DataTableRow />
                          </DataTableHead>

                          {currentItems.map(item => (
                            <DataTableItem key={item._id}>
                              {/* Name with image and link */}
                            <DataTableRow>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  {item.img && (
                                    <img
                                      src={item.img}
                                      alt={item.name}
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "50%",
                                        objectFit: "cover"
                                      }}
                                    />
                                  )}
                                    <Link
                                  className="tb-lead"
                                  to={`${process.env.PUBLIC_URL}/customer/${item._id}`}
                                >
                                  {item.name}
                            </Link>
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

                  {/* Actions */}
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

            <div className="card-inner">
              <PaginationComponent
                itemPerPage={itemPerPage}
                totalItems={data.length}
                paginate={setCurrentPage}
                currentPage={currentPage}
              />
            </div>
          </DataTable>
        </Block>
      </Content>
      <Modal isOpen={modalAdd} toggle={() => setModalAdd(false)} centered size="lg">
        <ModalBody>
          <a href="#cancel" className="close" onClick={(e)=>{e.preventDefault(); setModalAdd(false);}}>
            <Icon name="cross-sm" />
          </a>

          <h5 className="title mb-3">Add Customer</h5>

          <Form className="row gy-3" onSubmit={onAddSubmit}>
            
            <Col md="6">
              <FormGroup>
                <label className="form-label">Customer Name *</label>
                <input className="form-control" required
                  value={formData.name}
                  onChange={e=>setFormData({...formData, name:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="3">
              <FormGroup>
                <label className="form-label">Phone *</label>
                <input type="number" className="form-control" required
                  value={formData.phone}
                  onChange={e=>setFormData({...formData, phone:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="3">
              <FormGroup>
                <label className="form-label">Alternate Phone</label>
                <input type="number" className="form-control"
                  value={formData.phone2}
                  onChange={e=>setFormData({...formData, phone2:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="12">
              <FormGroup>
                <label className="form-label">Address *</label>
                <textarea className="form-control" rows="2" required
                  value={formData.address}
                  onChange={e=>setFormData({...formData, address:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Route Name</label>
                <input className="form-control"
                  value={formData.routeName}
                  onChange={e=>setFormData({...formData, routeName:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Route ID</label>
                <input className="form-control"
                  value={formData.routeId}
                  onChange={e=>setFormData({...formData, routeId:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Line No</label>
                <input type="number" className="form-control"
                  value={formData.lineNo}
                  onChange={e=>setFormData({...formData, lineNo:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Credit Days</label>
                <input type="number" className="form-control"
                  value={formData.creditDays}
                  onChange={e=>setFormData({...formData, creditDays:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Pincode</label>
                <input type="number" className="form-control"
                  value={formData.pincode}
                  onChange={e=>setFormData({...formData, pincode:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup>
                <label className="form-label">Category</label>
                <input className="form-control"
                  value={formData.category}
                  onChange={e=>setFormData({...formData, category:e.target.value})}
                />
              </FormGroup>
            </Col>

            <Col md="6">
              <FormGroup>
                <label className="form-label">Latitude</label>
                <input className="form-control"
                  value={formData.geoLocation?.lat}
                  onChange={e=>setFormData({...formData, geoLocation:{...formData.geoLocation, lat:e.target.value}})}
                />
              </FormGroup>
            </Col>

            <Col md="6">
              <FormGroup>
                <label className="form-label">Longitude</label>
                <input className="form-control"
                  value={formData.geoLocation?.long}
                  onChange={e=>setFormData({...formData, geoLocation:{...formData.geoLocation, long:e.target.value}})}
                />
              </FormGroup>
            </Col>

            <Col md="12">
              <Dropzone multiple={false} onDrop={files => setUploadedFile(files[0])}>
                {({getRootProps, getInputProps}) => (
                  <div {...getRootProps()} className="dropzone upload-zone small bg-lighter">
                    <input {...getInputProps()} />
                    {uploadedFile ? uploadedFile.name : "Upload Shop Image"}
                  </div>
                )}
              </Dropzone>
            </Col>

            <Col md="12" className="text-end">
              <Button color="primary" type="submit">Save Customer</Button>
            </Col>

          </Form>
        </ModalBody>
      </Modal>
      <Modal isOpen={modalEdit} toggle={() => setModalEdit(false)} centered size="lg">
        <ModalBody>
    <a href="#cancel" className="close" onClick={(e)=>{e.preventDefault(); setModalEdit(false);}}>
      <Icon name="cross-sm" />
    </a>

    <h5 className="title mb-3">Edit Customer</h5>

    <Form className="row gy-3" onSubmit={onEditSubmit}>
      
      <Col md="6">
        <FormGroup>
          <label className="form-label">Customer Name *</label>
          <input className="form-control" required
            value={formData.name}
            onChange={e=>setFormData({...formData, name:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="3">
        <FormGroup>
          <label className="form-label">Phone *</label>
          <input type="number" className="form-control" required
            value={formData.phone}
            onChange={e=>setFormData({...formData, phone:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="3">
        <FormGroup>
          <label className="form-label">Alternate Phone</label>
          <input type="number" className="form-control"
            value={formData.phone2}
            onChange={e=>setFormData({...formData, phone2:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="12">
        <FormGroup>
          <label className="form-label">Address *</label>
          <textarea className="form-control" rows="2" required
            value={formData.address}
            onChange={e=>setFormData({...formData, address:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="4">
        <FormGroup>
          <label className="form-label">Route Name</label>
          <input className="form-control"
            value={formData.routeName}
            onChange={e=>setFormData({...formData, routeName:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="4">
        <FormGroup>
          <label className="form-label">Route ID</label>
          <input className="form-control"
            value={formData.routeId}
            onChange={e=>setFormData({...formData, routeId:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="4">
        <FormGroup>
          <label className="form-label">Line No</label>
          <input type="number" className="form-control"
            value={formData.lineNo}
            onChange={e=>setFormData({...formData, lineNo:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="4">
        <FormGroup>
          <label className="form-label">Credit Days</label>
          <input type="number" className="form-control"
            value={formData.creditDays}
            onChange={e=>setFormData({...formData, creditDays:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="4">
        <FormGroup>
          <label className="form-label">Pincode</label>
          <input type="number" className="form-control"
            value={formData.pincode}
            onChange={e=>setFormData({...formData, pincode:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="4">
        <FormGroup>
          <label className="form-label">Category</label>
          <input className="form-control"
            value={formData.category}
            onChange={e=>setFormData({...formData, category:e.target.value})}
          />
        </FormGroup>
      </Col>

      <Col md="6">
        <FormGroup>
          <label className="form-label">Latitude</label>
          <input className="form-control"
            value={formData.geoLocation?.lat}
            onChange={e=>setFormData({...formData, geoLocation:{...formData.geoLocation, lat:e.target.value}})}
          />
        </FormGroup>
      </Col>

      <Col md="6">
        <FormGroup>
          <label className="form-label">Longitude</label>
          <input className="form-control"
            value={formData.geoLocation?.long}
            onChange={e=>setFormData({...formData, geoLocation:{...formData.geoLocation, long:e.target.value}})}
          />
        </FormGroup>
      </Col>

      <Col md="12">
        <Dropzone multiple={false} onDrop={files => setUploadedFile(files[0])}>
          {({getRootProps, getInputProps}) => (
            <div {...getRootProps()} className="dropzone upload-zone small bg-lighter">
              <input {...getInputProps()} />
              {uploadedFile ? uploadedFile.name : "Upload Customer Image"}
            </div>
          )}
        </Dropzone>
      </Col>

      <Col md="12" className="text-end">
        <Button color="primary" type="submit">Save Customer</Button>
      </Col>

    </Form>
  </ModalBody>
      </Modal>
      <Modal isOpen={modalDelete} toggle={()=>setModalDelete(false)} centered>
  <ModalBody className="text-center">
    <Icon name="alert-circle" className="text-danger mb-2" />
    <h5>Are you sure to delete?</h5>
    <ul className="d-flex justify-content-center mt-3">
      <li>
        <Button color="danger" onClick={onDeleteConfirm}>Delete</Button>
      </li>
      <li>
        <Button color="light" onClick={()=>setModalDelete(false)}>Cancel</Button>
      </li>
    </ul>
  </ModalBody>
</Modal>

    </>
  );
};

export default CustomerListCompact;
