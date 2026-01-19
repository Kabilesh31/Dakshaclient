import React, { useState, useEffect, useContext } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { findUpper } from "../../../utils/Utils";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";
import 'react-datepicker/dist/react-datepicker.css';
import {
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  DropdownItem,
  Form,
  Card,
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
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import './Confirmation.css'; 
import DataContext from "../../../utils/DataContext"


const CustomerListCompact = () => {
  
  const [data, setData] = useState([]);
  const {userData} = useContext(DataContext)
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  
  const [editId, setEditedId] = useState();
  const [formData, setFormData] = useState({
    name: "",
    phone: null,
    phone2: null,
    email: '',
    location: '', 
    address: '',
    district: '',
    staff : "",
    state: '',
    pincode: '',
    type: '',
    gst : 'withoutgst'
  });
  
  const [actionText, setActionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [sort, setSortState] = useState("");
  const [assignModal, setAssignModal] = useState(false)
  const [deActiveModal, setDeactiveModal] = useState(false)
  const [selectedData, setSelectedData] = useState([])
  const [files2, setFiles2] = useState([])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isGridView, setIsGridView] = useState(false)
  const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth < 1200);
  const [formErrors, setFormErrors] = useState({});
  const [phoneError, setPhoneError] = useState(false)
  const [staffData, setStaffData] = useState([])
  const [updateStatus, setUpdateStatus] = useState(null)

  localStorage.setItem("isGridView", false);

  useEffect(() => {
    const handleResize = () => {
      setIsScreenSmall(window.innerWidth < 1200);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(()=> {
    if(data?.length === 0){
      fetchCustomerData()
    }
  },[data])

  useEffect(()=> {
    if(staffData?.length === 0){
      fetchStaffData()
    }
  },[staffData])



  const fetchStaffData = async() => {
    try{
      const response = await axios.get(process.env.REACT_APP_BACKENDURL+"/api/staff")
      setStaffData(response.data)
      } catch (err){
        console.log(err)
      }}
      
 
  // fetch users list
  const fetchCustomerData = async() => {
    try{
      const response = await axios.get(process.env.REACT_APP_BACKENDURL+"/api/customer")
      setData(response.data.data.reverse())
      } catch (err){
        console.log(err)
      }}
      

  // Sorting data
  const sortFunc = (params) => {
    let defaultData = data;
    if (params === "asc") {
      let sortedData = defaultData.sort((a, b) => a.name.localeCompare(b.name));
      setData([...sortedData]);
    } else if (params === "dsc") {
      let sortedData = defaultData.sort((a, b) => b.name.localeCompare(a.name));
      setData([...sortedData]);
    }
  };

  const filteredDeletedData = data?.filter((item) => item.isDelete !== true) 
 
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredDeletedData?.slice(indexOfFirstItem, indexOfLastItem);

 
  
  const handlePhoneError = (value) => {
    if (/^\d*$/.test(value) && value.length <= 10) {
      const existingPhone = data.find((item)=> parseInt(value) === item.phone)
      if(existingPhone){
        setPhoneError(true)
        setFormData({ ...formData, phone: value });
        return;
      }
      setPhoneError(false)
      setFormData({ ...formData, phone: value });
    }
  }


  // Changing state value when searching name
  useEffect(() => {
    if (onSearchText !== "") {
      const filteredObject = data.filter((item) => {
        return (
          item.name.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.email.toLowerCase().includes(onSearchText.toLowerCase())
        );
      });
      setData([...filteredObject]);
    } else {
      setData([...data]);
    }
  }, [onSearchText, setData]);

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };


  // function to reset the form
  const resetForm = () => {
    setFormData({
     name: "",
    phone: null,
    phone2: null,
    email: '',
    location: '', 
    address: '',
    district: '',
    state: '',
    pincode: '',
    type: '',
    });
  };

  // function to close the form modal
  const   onFormCancel = () => {
    setModal({ edit: false, add: false });
    resetForm();
    setUploadedFile(null)
    setFiles2([])
  };



  const onFormSubmit = async(e, submitData) => {

    let submittedData = {
      name    : formData.name,
      type    : formData.type,
      email   : formData.email,
      phone   : formData.phone,
      phone2  : formData.phone2,
      location: formData.location,
      staff   : formData.staff,
      address : formData.address,
      district: formData.district,
      state     : formData.state,
      createdBy : userData?._id,
      pincode : formData.pincode,
      gst : formData.gst
    };
    
    try{
      const response = await axios.post(process.env.REACT_APP_BACKENDURL+"/api/customer", submittedData);
      
      if (response.status === 201) {
        successToast("User Created Successfully")
        // Reset form and close modal on success
        resetForm();
        setModal({ edit: false, add: false });
        fetchCustomerData()
        
      } else {
        warningToast()
      }

    }catch(err){
      errorToast("Please Provide All Details")
    }
  };


  
  const onEditSubmit = async() => {
    let submittedData;
    let newitems = data;
    newitems.forEach((item) => {
      if (item._id === editId) {
        submittedData = {
          name    : formData.name,
          type    : formData.type,
          phone   : formData.phone,
          phone2  : formData.phone2,
          location: formData.location,
          address : formData.address,
          district: formData.district,
          state    : formData.state,
          pincode : formData.pincode 
        };
      }
    });  
    try{
      const response = await axios.put(process.env.REACT_APP_BACKENDURL+"/api/customer/"+editId, submittedData)
      if(response.status === 200){
        successToast("Product Updated Successfully")
        setModal({ edit: false });
        fetchCustomerData()
      }
    }catch(err){
      errorToast("Something Went Wrong")
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item._id === id) {
        setFormData({
          name    : item.name,
          type    : item.type,
          email   : item.email,
          phone   : item.phone,
          phone2  : item.phone2,
          location: item.location,
          address : item.address,
          district: item.district,
          state     : item.state,
          pincode : item.pincode,
          gst : item.gst
        });
        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  const toggleAssignModal = (item) => {
    setAssignModal(!assignModal);
    setSelectedData(item)
  };
  const toggleDeactivateModal = (item) => {
    setDeactiveModal(!deActiveModal);
    setSelectedData(item)
  };

  const onDeleteSubmit = async(id) => {
    let submittedData = {
          isDelete: true,
        };
      
    try{
      const response = await axios.put(process.env.REACT_APP_BACKENDURL+"/api/customer/isDelete/"+id, submittedData)
      if(response.status === 200){
        successToast("Deleted Successfully")
        setAssignModal(!assignModal);
        fetchCustomerData()
      }
    }catch(err){
      errorToast("Something Went Wrong")
    }
    };




    const onDeactivateSubmit = async (id) => {
      let submittedData = {
        status: updateStatus,
      };
    
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_BACKENDURL}/api/customer/status/${id}`,
          submittedData
        );
        if (response.status === 200) {
    
          // Additional POST request after successful PUT
          const postData = {
            customerId: id,
            activityStatus: updateStatus,
          };
          const postResponse = await axios.post(
            `${process.env.REACT_APP_BACKENDURL}/api/activity`,
            postData
          );
          if (postResponse.status === 201) {
            successToast("Status Updated Successfully");
          } else {
            errorToast("Failed to Create Log Entry");
          }
          toggleDeactivateModal();
          fetchCustomerData();
        }
      } catch (err) {
        errorToast("Something Went Wrong");
      }
    };


  // function which fires on applying selected action
  const onActionClick = (e) => {
    if (actionText === "suspend") {
      let newData = data.map((item) => {
        if (item.checked === true) item.status = "Suspend";
        return item;
      });
      setData([...newData]);
    } else if (actionText === "delete") {
      let newData;
      newData = data.filter((item) => item.checked !== true);
      setData([...newData]);
    }
  };

  // function to toggle the search option
  const toggle = () => setonSearch(!onSearch);

  const { errors, register, handleSubmit } = useForm();

  const options = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" }
  ];

  const gstType = [
    { value: "gst", label: "With GST" },
    { value: "withoutgst", label: "Without GST" }
  ];
  
  
  const staffList = staffData.map((item)=> ({
    value:item._id, label: item.name
  }))
 
  const paginate = (pageNumber) => setCurrentPage(pageNumber);



  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18)



  
 
  return (
    <React.Fragment>
      <Head title="Products List"></Head>
      <Content>
      
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Customers List
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
                    <li className="nk-block-tools-opt">
                      <Button color="primary" className="btn-icon" onClick={() => setModal({ add: true })}>
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
                    <div className="form-wrap">
                     
                    </div>
                    <div className="btn-wrap">
                   
                      <span className="d-md-none">
                        <Button
                          color="light"
                          outline
                          disabled={actionText !== "" ? false : true}
                          className="btn-dim  btn-icon"
                          onClick={(e) => onActionClick(e)}
                        >
                          <Icon name="arrow-right"></Icon>
                        </Button>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-tools mr-n1">
                  <ul className="btn-toolbar gx-1">
                    <li>
                      <a
                        href="#search"
                        onClick={(ev) => {
                          ev.preventDefault();
                          toggle();
                        }}
                        className="btn btn-icon search-toggle toggle-search"
                      >
                        <Icon name="search"></Icon>
                      </a>
                    </li>
                    <li className="btn-toolbar-sep"></li>
                    <li>
                      <div className="toggle-wrap">
                        <Button
                          className={`btn-icon btn-trigger toggle ${tablesm ? "active" : ""}`}
                          onClick={() => updateTableSm(true)}
                        >
                          <Icon name="menu-right"></Icon>
                        </Button>
                        <div className={`toggle-content ${tablesm ? "content-active" : ""}`}>
                          <ul className="btn-toolbar gx-1">
                            <li className="toggle-close">
                              <Button className="btn-icon btn-trigger toggle" onClick={() => updateTableSm(false)}>
                                <Icon name="arrow-left"></Icon>
                              </Button>
                            </li>
                           
                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                                  <Icon name="setting"></Icon>
                                </DropdownToggle>
                                <DropdownMenu right className="dropdown-menu-xs">
                                  <ul className="link-check">
                                    <li>
                                      <span>Show</span>
                                    </li>
                                    <li className={itemPerPage === 10 ? "active" : ""}>
                                      <DropdownItem
                                        tag="a"
                                        href="#dropdownitem"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setItemPerPage(10);
                                        }}
                                      >
                                        10
                                      </DropdownItem>
                                    </li>
                                    <li className={itemPerPage === 15 ? "active" : ""}>
                                      <DropdownItem
                                        tag="a"
                                        href="#dropdownitem"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setItemPerPage(15);
                                        }}
                                      >
                                        15
                                      </DropdownItem>
                                    </li>
                                  </ul>
                                  <ul className="link-check">
                                    <li>
                                      <span>Order</span>
                                    </li>
                                    <li className={sort === "dsc" ? "active" : ""}>
                                      <DropdownItem
                                        tag="a"
                                        href="#dropdownitem"
                                        onClick={(ev) => {
                                          ev.preventDefault();
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
                                        href="#dropdownitem"
                                        onClick={(ev) => {
                                          ev.preventDefault();
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
                    </li>
                  </ul>
                </div>
              </div>
              <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button
                      className="search-back btn-icon toggle-search active"
                      onClick={() => {
                        setSearchText("");
                        toggle();
                        fetchCustomerData()
                      }}
                    >
                      <Icon name="arrow-left"></Icon>
                    </Button>
                    <input
                      type="text"
                      className="border-transparent form-focus-none form-control"
                      placeholder="Search by Customer Name or email"
                      value={onSearchText}
                      onChange={(e) => {
                        const value = e.target.value;
                        onFilterChange(e); // your existing filter logic
                        if (value === "") {
                          fetchCustomerData(); // reset the list if input is empty
                        }
                      }}
                    />

                    <Button className="search-submit btn-icon">
                      <Icon name="search"></Icon>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {isGridView? 
              <BlockContent>
              <Content>
              <div >
              <Row className="row g-gs">
                {currentItems.map((item, idx) => (
                  <Col lg="3" sm="4" md="6" key={idx}>
                  
                    <div className="product-card">

                    <div className="hover-icon" onClick={() => onEditClick(item._id)}>
                          <TooltipComponent
                            tag="a"
                            containerClassName="btn btn-trigger btn-icon"
                            id={"edit" + item._id}
                            icon="edit-alt-fill"
                            text="Edit"
                          />
                        </div>
                        
                      <div className="product-image-wrapper">
                        {item.file ? (
                          <img className="product-image" src={item.file} alt={item.name} />
                        ) : (
                          <span className="no-preview">No preview available</span>
                        )}
                        {/* Hover Icon */}
                        
                      </div>
                      <span className="product-name">{item.name}</span>
                      <span className="product-designation">{item.designation}</span>
                      <span style={{color:"black"}} className="product-designation">Employee ID : {item.staffId}</span>
                      {/* <span style={{color:"black"}} className="product-designation">{item.email}</span>
                      <span style={{backgroundColor:"#D4EBF8" ,color:"#758694", border:"none", fontSize:"16px", padding:"14px", borderRadius:"25px", marginTop:"10px"}} class="badge"><Icon style={{marginRight:"10px"}} name="mobile"></Icon>{item.phone}</span> */}
                      <Link to={`${process.env.PUBLIC_URL}/staff-details/${item._id}`}>
                      <Button style={{marginTop:"20px"}} color="primary">
                        View Profile
                      </Button>
                      </Link>  
                    </div>
                    
                  </Col>
                ))}
              </Row>

              {/* CSS styles */}
              <style jsx>{`
                .product-card {
                  background: #ffffff;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  padding: 16px;
                  text-align: center;
                  transition: transform 0.3s ease, box-shadow 0.3s ease;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  position: relative;
                  overflow: hidden;
                }

                .product-card:hover {
                  transform: scale(1.05);
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }

                .product-image-wrapper {
                  width: 120px; /* Fixed width for circular image */
                  height: 120px; /* Fixed height for circular image */
                  margin: 0 auto; /* Center the image */
                  display: flex;
                  position: relative;
                  overflow: hidden;
                  border-radius: 50%; /* Makes the image circular */
                  background: #f9f9f9; /* Optional background color for empty space */
                }

                .product-image {
                  width: 100%;
                  height: 100%;
                  object-fit: cover; /* Ensures the image fills the box while maintaining aspect ratio */
                }

                .hover-icon {
                  position: absolute;
                  top: 0;
                  right: 0;
                  width: 40px; /* Fixed width for the right side */
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  opacity: 0;
                  transition: opacity 0.3s ease;
                }

                .product-card:hover .hover-icon {
                  opacity: 1; /* Show icon on hover */
                }

                .hover-icon .btn {
                  background-color: #fff;
                  color: #333;
                  border-radius: 50%;
                  padding: 8px;
                  display: inline-block;
                  font-size: 1rem;
                }

                .no-preview {
                  margin-top :30px;
                  font-size: 0.9rem;
                  font-weight: 500;
                  color: #999;
                  text-align: center;
                }

                .product-name {
                  font-size: 1rem;
                  font-weight: 600;
                  color: #333;
                  margin-top: 12px;
                  display: block;
                }

                .product-designation {
                  font-size: 0.9rem;
                  font-weight: 500;
                  color: #798BFF;
                  margin-top: 4px;
                  display: block;
                }

                @media (max-width: 768px) {
                  .product-card {
                    margin-bottom: 16px;
                  }
                }
              `}</style>

              </div>
              </Content>
            </BlockContent>

                : 
            <DataTableBody compact>
              <DataTableHead>
                <DataTableRow className="nk-tb-col-check">
             
                </DataTableRow>
                <DataTableRow>
                  <span style={{fontWeight:"bold"}} className="sub-text">Customer Name</span>
                </DataTableRow>
               
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Email</span>
                </DataTableRow>
                <DataTableRow size="sm">
                  <span style={{fontWeight:"bold"}} className="sub-text">Phone</span>
                </DataTableRow>
                <DataTableRow size="lg">
                  <span style={{fontWeight:"bold"}} className="sub-text">Type</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Location</span>
                </DataTableRow>
                
                <DataTableRow size="">
                  <span style={{fontWeight:"bold"}} className="sub-text">Status</span>
                </DataTableRow>
                
                {/* <DataTableRow size="lg">
                  <span className="sub-text">Verified</span>
                </DataTableRow> */}
                {/* <DataTableRow size="lg">
                  <span className="sub-text">Last Login</span>
                </DataTableRow> */}
                {/* <DataTableRow>
                  <span className="sub-text">Status</span>
                </DataTableRow> */}
                <DataTableRow className="nk-tb-col-tools text-right">
                  <UncontrolledDropdown>
                    
                    <DropdownMenu right className="dropdown-menu-xs">
                      <ul className="link-tidy sm no-bdr">
                        <li>
                          <div className="custom-control custom-control-sm custom-checkbox">
                            <input type="checkbox" className="custom-control-input form-control" id="bl" />
                            <label className="custom-control-label" htmlFor="bl">
                              Balance
                            </label>
                          </div>
                        </li>
                        <li>
                          <div className="custom-control custom-control-sm custom-checkbox">
                            <input type="checkbox" className="custom-control-input form-control" id="ph" />
                            <label className="custom-control-label" htmlFor="ph">
                              Phone
                            </label>
                          </div>
                        </li>
                        <li>
                          <div className="custom-control custom-control-sm custom-checkbox">
                            <input type="checkbox" className="custom-control-input form-control" id="vri" />
                            <label className="custom-control-label" htmlFor="vri">
                              Verified
                            </label>
                          </div>
                        </li>
                        <li>
                          <div className="custom-control custom-control-sm custom-checkbox">
                            <input type="checkbox" className="custom-control-input form-control" id="st" />
                            <label className="custom-control-label" htmlFor="st">
                              Status
                            </label>
                          </div>
                        </li>
                      </ul>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </DataTableRow>
              </DataTableHead>
              {/*Head*/}
              {currentItems.length > 0
                ? currentItems.map((item) => {
                    return (     
                      <DataTableItem key={item._id}>
                        <DataTableRow className="nk-tb-col-check">
                        <UserAvatar
                          theme={item.avatarBg}
                          className="xs"
                          text={findUpper(item.name)}
                          image={item.file}
                        ></UserAvatar>
                        </DataTableRow>
                        <DataTableRow>
                         <Link to={`${process.env.PUBLIC_URL}/customer/${item._id}`}>
                            <div className="user-card">
                              <div className="user-info">
                                <span className="tb-lead">{item.name}</span>
                              </div>
                            </div>
                           </Link> 
                        </DataTableRow>
                       
                        <DataTableRow size="md">
                          <span>{item.email}</span>
                        </DataTableRow>
                         <DataTableRow size="md" key={item._id}>
                            <span>
                             {item.phone}
                            </span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span>{item.type}</span>
                        </DataTableRow>
                        <DataTableRow size="lg">
                          <span>{item.location}</span>
                        </DataTableRow>
                        <DataTableRow size="lg">
                        <span
                            className={`tb-status text-${
                              item.status === true ? "success"  : "danger"
                            }`}
                          >
                            {item.status === true ? "Active" : "Deactive"}
                          </span>
                        </DataTableRow>
                        <DataTableRow className="nk-tb-col-tools">
                          <ul className="nk-tb-actions gx-1">
                            <li className="nk-tb-action-hidden" onClick={() => onEditClick(item._id)}>
                              <TooltipComponent
                                tag="a"
                                containerClassName="btn btn-trigger btn-icon"
                                id={"edit" + item._id}
                                icon="edit-alt-fill"
                                direction="top"
                                text="Edit"
                              />
                            </li>
                          
                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                  <Icon name="more-h"></Icon>
                                </DropdownToggle>
                                <DropdownMenu right>
                                  <ul className="link-list-opt no-bdr">
                                 
                                  <li onClick={() => {toggleDeactivateModal(item); setUpdateStatus(item.status === true ? false : true)} }>
                                      <DropdownItem
                                        tag="a"
                                        href="#edit"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                        }}
                                      >
                                        <Icon name="user-remove"></Icon>
                                        <span>{item.status === true ? "Deactivate" : "Activate" }</span>
                                      </DropdownItem>
                                    </li>

                                    <li onClick={() => onEditClick(item._id)}>
                                      <DropdownItem
                                        tag="a"
                                        href="#edit"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                        }}
                                      >
                                        <Icon name="edit"></Icon>
                                        <span>Edit</span>
                                      </DropdownItem>
                                    </li>
                                   
                                      <React.Fragment>
                                       
                                        <li onClick={() => toggleAssignModal(item)}>
                                          <DropdownItem
                                            tag="a"
                                            href="#suspend"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                            }}
                                          >
                                            <Icon name="na"></Icon>
                                            <span>Delete</span>
                                          </DropdownItem>
                                        </li>
                                      </React.Fragment>
                                 
                                  </ul>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </li>
                          </ul>
                        </DataTableRow>
                      </DataTableItem>
                    );
                  })
                : null}
            </DataTableBody> }
            <div className="card-inner">
              {currentItems.length > 0 ? (
                <PaginationComponent
                  itemPerPage={itemPerPage}
                  totalItems={data?.length}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              ) : (
                <div className="text-center">
                  <span className="text-silent">No data found</span>
                </div>
              )}
            </div>
          </DataTable>
        </Block>
        <Modal isOpen={modal.add} toggle={() => setModal({ add: false })} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                onFormCancel();
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Add Customer</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onFormSubmit)}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">* Customer Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        defaultValue={formData.name}
                        onChange={(e)=> setFormData({...formData, name:e.target.value})}
                        placeholder="Enter Employee name"
                        onInput={(e) => {
                          let value = e.target.value;
                          if (value.length > 0) {
                            e.target.value = value.charAt(0).toUpperCase() + value.slice(1);
                          }
                        }}
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>
                

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        type="email" // type email automatically adds basic validation
                        name="email"
                        defaultValue={formData.email}
                        placeholder="Enter Email ID"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        ref={register({
                          
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                      />
                      {errors.email && <span className="invalid">{errors.email.message}</span>}
                    </FormGroup>

                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">* Phone</label>
                      <input
                        className="form-control"
                        type="text"
                        name="phone"
                        maxLength={10}
                        onChange={(e) => {                          
                          handlePhoneError(e.target.value);
                        }}
                        value={formData.phone}
                        placeholder="Enter Phone"
                        ref={register({ required: "This field is required" })}
                      />
                     {phoneError && <span className="invalid">Phone Number already existed</span>}
                      {errors.phone && (
                        <span className="invalid">{errors.phone.message}</span>
                      )}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Phone 2</label>
                      <input
                        className="form-control"
                        type="text"
                        name="phone2"
                        maxLength={10}
                        onChange={(e) => {                          
                          setFormData({...formData, phone2:e.target.value})
                        }}
                        value={formData.phone2}
                        placeholder="Enter Alternative Phone"
                       
                      />
                     {phoneError && <span className="invalid">Phone Number already existed</span>}
                     {errors.phone2 && (
                        <span className="invalid">{errors.phone2.message}</span>
                      )}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">* Select Staff</label>
                      <div className="form-control-wrap">
                      <RSelect
                       options={staffList}
                       onChange={(e)=> setFormData({...formData, staff:e.value})}
                       name= "staff"
                          
                      />
                      
                    </div>
                    {errors.phone && <span style={{fontSize:"10px", color:"red", fontStyle:"italic"}} className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">* Type</label>
                      <div className="form-control-wrap">
                      <RSelect
                       options={options}
                       name="type"
                       onChange={(e)=> setFormData({...formData, type:e.value})}        
                      />
                       
                    </div>
                    {errors.phone && <span style={{fontSize:"10px", color:"red", fontStyle:"italic"}} className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">GST</label>
                      <div className="form-control-wrap">
                      <RSelect
                       options={gstType}
                       defaultValue={gstType.find(option => option.value === "withoutgst")}
                       name="gst"
                       onChange={(e)=> setFormData({...formData, gst:e.value})}        
                      />
                       
                    </div>
                    {errors.phone && <span style={{fontSize:"10px", color:"red", fontStyle:"italic"}} className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">* Area</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Area"
                        name="area"
                        defaultValue={formData.location}
                        onChange={(e)=> setFormData({...formData, location:e.target.value})}
                        ref={register({
                          required: "This field is required",
                        })}
                      />
                     {errors.area && <span style={{fontSize:"10px", color:"red", fontStyle:"italic"}} className="invalid">{errors.area.message}</span>}
                    </FormGroup>
                  </Col>
              
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">District</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter District"
                        name="district"
                        defaultValue={formData.district}
                        onChange={(e)=> setFormData({...formData, district:e.target.value})}
                        
                        
                      />
                      
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">State</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter State"
                        name="state"
                        defaultValue={formData.state}
                        onChange={(e)=> setFormData({...formData, state:e.target.value})}
                        
                        
                      />
                     
                    </FormGroup>
                  </Col>

              
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">* Address</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Customer Address"
                        name="address"
                        defaultValue={formData.address}
                        onChange={(e)=> setFormData({...formData, address:e.target.value})}
                        ref={register({
                          required: "This field is required",
                        })}
                      />
                     {errors.address && (
                        <span className="invalid">{errors.address.message}</span>
                      )}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Pincode</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Pincode"
                        name="pincode"
                        defaultValue={formData.pincode}
                        onChange={(e)=> setFormData({...formData, pincode:e.target.value})}
                       
                      />
                      
                    </FormGroup>
                  </Col>

                
                  <Col size="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button disabled={phoneError || errors.name || formErrors.employeeId} color="primary" size="md" type="submit">
                          Save
                        </Button>
                      </li>
                      <li>
                        <a
                          href="#cancel"
                          onClick={(ev) => {
                            ev.preventDefault();
                            onFormCancel();
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
        <Modal isOpen={modal.edit} toggle={() => setModal({ edit: false })} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                onFormCancel();
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Update Customer Details</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onEditSubmit)}>
                <Col md="6">
                    <FormGroup>
                      <label className="form-label">* Customer Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        defaultValue={formData.name}
                        onChange={(e)=> setFormData({...formData, name:e.target.value})}
                        placeholder="Enter Employee name"
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>
                

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">* Email</label>
                      <input
                        className="form-control"
                        type="text"
                        name="email"
                        defaultValue={formData.email}
                        placeholder="Enter Email ID"
                        disabled
                        onChange={(e)=> setFormData({...formData, email:e.target.value})}
                        ref={register({
                          required: "This field is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "invalid email address",
                          },
                        })}
                      />
                      {errors.email && <span className="invalid">{errors.email.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">* Phone</label>
                      <input
                        className="form-control"
                        type="text"
                        name="phone"
                        maxLength={10}
                        onChange={(e) => {                          
                          handlePhoneError(e.target.value);
                        }}
                        value={formData.phone}
                        placeholder="Enter Phone"
                        ref={register({ required: "This field is required" })}
                      />
                     {phoneError && <span className="invalid">Phone Number already existed</span>}
                      {errors.phone && (
                        <span className="invalid">{errors.phone.message}</span>
                      )}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Phone 2</label>
                      <input
                        className="form-control"
                        type="text"
                        name="phone"
                        maxLength={10}
                        onChange={(e) => {                          
                          setFormData({...formData, phone2:e.target.value})
                        }}
                        value={formData.phone2}
                        placeholder="Enter Alternative Phone"
                        ref={register({ required: "This field is required" })}
                      />
                     {phoneError && <span className="invalid">Phone Number already existed</span>}
                      {errors.phone && (
                        <span className="invalid">{errors.phone.message}</span>
                      )}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">* Type</label>
                      <div className="form-control-wrap">
                      <RSelect
                       options={options}
                       defaultValue={{
                            value: formData.type,
                            label:  formData.type === "Day" ? "Daily" : 
                                    formData.type === "Weekly" ? "Weekly": "Monthly",
                          }}
                       onChange={(e)=> setFormData({...formData, type:e.value})}        
                      />
                      
                    </div>
                      
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">GST</label>
                      <div className="form-control-wrap">
                      <RSelect
                       options={gstType}
                       defaultValue={{
                            value: formData.gst,
                            label:  formData.gst === "gst" ? "With GST" : "Without GST",
                          }}
                       onChange={(e)=> setFormData({...formData, gst:e.value})}        
                      />
                      
                    </div>
                      
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Area</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Area"
                        name="phone"
                        defaultValue={formData.location}
                        onChange={(e)=> setFormData({...formData, location:e.target.value})}
                        ref={register({
                          required: "This field is required",
                        })}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>
              
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">District</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter District"
                        name="phone"
                        defaultValue={formData.district}
                        onChange={(e)=> setFormData({...formData, district:e.target.value})}
                        ref={register({
                          required: "This field is required",
                        })}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">State</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter State"
                        name="phone"
                        defaultValue={formData.state}
                        onChange={(e)=> setFormData({...formData, state:e.target.value})}
                        ref={register({
                          required: "This field is required",
                        })}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>

              
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Address</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Customer Address"
                        name="phone"
                        defaultValue={formData.address}
                        onChange={(e)=> setFormData({...formData, address:e.target.value})}
                        ref={register({
                          required: "This field is required",
                        })}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Pincode</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Pincode"
                        name="phone"
                        defaultValue={formData.pincode}
                        onChange={(e)=> setFormData({...formData, pincode:e.target.value})}
                        ref={register({
                          required: "This field is required",
                        })}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>
                 
                  <Col size="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button color="primary" size="md" type="submit">
                        Save
                        </Button>
                      </li>
                      <li>
                        <a
                          href="#cancel"
                          onClick={(ev) => {
                            ev.preventDefault();
                            onFormCancel();
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

        <Modal isOpen={assignModal} toggle={toggleAssignModal} className="modal-dialog-centered" size="md">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              toggleAssignModal();
            }}
            className="close"
          >
            <Icon onClick={toggleAssignModal} name="cross-sm"></Icon>
          </a>
          <div className="nk-modal-head ">   
            <div className="card-inner-group">
              <div className="card-inner p-0">
              <div  className="confirmation-container">
                <h5 className="confirmation-message">Are You Sure to Delete - {selectedData && selectedData.name}</h5>
                <div className="confirmation-buttons">
                  <button className="confirm-button" onClick={()=> {onDeleteSubmit(selectedData._id)}}>Confirm</button>
                  <button className="cancel-button" onClick={toggleAssignModal}>Cancel</button>
                </div>
              </div>
              </div>
            </div>    
          </div>
        </ModalBody>
      </Modal>


      <Modal isOpen={deActiveModal} toggle={toggleDeactivateModal} className="modal-dialog-centered" size="md">
        <ModalBody>
        
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              toggleDeactivateModal()
            }}
            className="close"
          >
            <Icon onClick={toggleDeactivateModal} name="cross-sm"></Icon>
          </a>
          
          <div className="nk-modal-head ">   
            <div className="card-inner-group">
              <div className="card-inner p-0">
              <div  className="confirmation-container">
                <h5 className="confirmation-message">Are You Sure to {selectedData?.status === true ? "Deactivate" : "Activate"} </h5>
                <div className="confirmation-buttons">
                  <button className="confirm-button" onClick={()=> {onDeactivateSubmit(selectedData._id)}}>Confirm</button>
                  <button className="cancel-button" onClick={toggleDeactivateModal}>Cancel</button>
                </div>
              </div>
              </div>
            </div>    
          </div>
        </ModalBody>
      </Modal>
      </Content>

    </React.Fragment>
  );
};
export default CustomerListCompact;
