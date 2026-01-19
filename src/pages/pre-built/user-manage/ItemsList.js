import React, { useState, useEffect, useContext } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { findUpper } from "../../../utils/Utils";
import { userData, filterRole, filterStatus } from "./UserData";
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
  Sidebar,
} from "../../../components/Component";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import './Confirmation.css'; 
import Dropzone from "react-dropzone";
import imageCompression from 'browser-image-compression';
import DataContext from "../../../utils/DataContext"
import DatePicker from "react-datepicker";
import * as XLSX from 'xlsx';

const ItemsList = () => {
  
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
    value: null,
    productCode: '',
    category: '', 
    description: '',
  });
  const [actionText, setActionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [sort, setSortState] = useState("");
  const [assignModal, setAssignModal] = useState(false)
  const [selectedData, setSelectedData] = useState([])
  const [files2, setFiles2] = useState([])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isGridView, setIsGridView] = useState(() => {
    const savedValue = localStorage.getItem("isGridView");
    return savedValue === "true"; // true if localStorage value is "true", else false
  });
  const [designationList, setDesignationList] = useState([])
  const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth < 1200);
  const [files, setFiles] = useState([])
  const [sheetData, setSheetData] = useState([])
  const [uploadModal, setUploadModal] = useState(false)
  const [departmentList, setDepartmentList] = useState([])
  const [creatDepartmentModal, setCreateDepartmentModal] = useState(false)
  const [createDesignationModal, setCreateDesignationModal] = useState(false)
  const [createteamModal, setCreateTeamModal] = useState(false)
  const [showSideBar, setShowSideBar] = useState(false)
  const [teamList, setteamList] = useState([])
  const [formErrors, setFormErrors] = useState({});
  const [phoneError, setPhoneError] = useState(false)



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
      fetchItemsData()
    }
  },[data])

  

  
 
  // fetch users list
  const fetchItemsData = async() => {
    try{
      const response = await axios.get(process.env.REACT_APP_BACKENDURL+"/api/product")
      setData(response.data)
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


  // Changing state value when searching name
  useEffect(() => {
    if (onSearchText !== "") {
      const filteredObject = currentItems.filter((item) => {
        return (
          item.productName.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.productCode.toLowerCase().includes(onSearchText.toLowerCase())
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
    value: null,
    productCode: '',
    category: '', 
    description: '',
    });
  };

  // function to close the form modal
  const   onFormCancel = () => {
    setModal({ edit: false, add: false });
    resetForm();
    setUploadedFile(null)
    setFiles2([])
  };

  const onFormCancel2 = () => {
    setCreateDepartmentModal(false)
    setCreateDesignationModal(false)
    setCreateTeamModal(false)
    setFormData({
      createDepartment:"",
      code:"",
      description:"",
      department:null
    })
  };
  const onFormSubmit = async(e) => {
    e.preventDefault();
    const formData2 = new FormData();
    formData2.append('productName',formData.name);
    formData2.append('productCode', formData.productCode)
    formData2.append('value', formData.value);
    formData2.append('category', formData.category);
    formData2.append('description', formData.description);
    formData2.append('createdBy', userData._id);

    if (uploadedFile) {
      formData2.append('file', uploadedFile.file); // `uploadedFile` should be set when the file is selected
    }
    try {
      // Send data to the backend
      const response = await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/product`, formData2, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      if (response.status === 201) {
        successToast('User Created Successfully');
        resetForm(); 
        setFiles2([])
        setModal({ edit: false, add: false });
        fetchItemsData();
      } else {
        warningToast();
      }
    } catch (err) {
      errorToast('Please Provide All Details');
    }
  };

  // const onFormSubmit = async(e, submitData) => {
  //   e.preventDefault();
  //   let submittedData = {
  //     name    : formData.name,
  //     type    : formData.type,
  //     email   : formData.email,
  //     phone   : formData.phone,
  //     phone2  : formData.phone2,
  //     location: formData.location,
  //     address : formData.address,
  //     district: formData.district,
  //     state     : formData.state,
  //     createdBy : userData._id,
  //     pincode : formData.pincode
  //   };
  //   console.log(submittedData)
  //   try{
  //     const response = await axios.post(process.env.REACT_APP_BACKENDURL+"/api/customer", submittedData);
      
  //     if (response.status === 201) {
  //       successToast("User Created Successfully")
  //       // Reset form and close modal on success
  //       resetForm();
  //       setModal({ edit: false, add: false });
  //       fetchItemsData()
        
  //     } else {
  //       warningToast()
  //     }

  //   }catch(err){
  //     errorToast("Please Provide All Details")
  //   }
  // };

  const toggleSideBar = () => {
    setShowSideBar(!showSideBar);
  };


  // Download Excel File

  const handleExportStaffData = async() => {
    const fileUrl = `${process.env.PUBLIC_URL}/files/staff_sample.xlsx`;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "sample.xlsx"; // Name for the downloaded file
    link.click();
  }
  // const  handleExportStaffData = async() => {
  //   try {
  //     // Fetch the XLSX file from the backend
  //     const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/staff/exportStaffData`, {
  //       responseType: "blob", // Ensure the response is in binary format
  //     });

  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", `staffs_${Date.now()}.xlsx`);

  //     document.body.appendChild(link);
  //     link.click();

  //     document.body.removeChild(link);
  //   } catch (error) {
  //     console.error("Error downloading the file", error);
  //   }
  // }


  // submit function to update a new item

  // const onEditSubmit = async () => {
  //   const submittedData = {
  //     name: formData.name || undefined,
  //     phone: formData.phone || undefined,
  //     address: formData.address || undefined,
  //     staffStatus: formData.staffStatus || undefined,
  //     designation: formData.designation || undefined,
  //     blood: formData.blood || undefined,
  //     aadhar: formData.aadhar || undefined,
  //     staffId: formData.staffId || undefined,
  //     emergencyContact: formData.emergencyContact || undefined,
  //     emergencyContact2: formData.emergencyContact2 || undefined,
  //     dob: formData.dob || undefined,
  //     doj: formData.doj || undefined,
  //     bankName: formData.bankName || undefined,
  //     branch: formData.branch || undefined,
  //     accountNo: formData.accountNo || undefined,
  //     ifsc: formData.ifsc || undefined,
  //     employeeId: formData.employeeId || undefined,
  //     department: formData.department || undefined,
  //     pan: formData.pan || undefined, 
  //     family: {
  //       fatherName: formData.fatherName || undefined,  // Add family fields
  //       motherName: formData.motherName || undefined,
  //       siblingName: formData.siblingName || undefined,
  //       familyNumber: formData.familyNumber || undefined,
  //       familyMembers: formData.familyMembers || undefined,
  //     },
  //     education: {
  //       degree: formData.degree || undefined,  // Add education fields
  //       universityName: formData.universityName || undefined,
  //       degreeName1: formData.degreeName1 || undefined,
  //       degreeName2: formData.degreeName2 || undefined,
  //     },
  //   };
  
  //   const formDataToSend = new FormData();
  
  //   Object.keys(submittedData).forEach((key) => {
  //     if (submittedData[key] !== undefined) {
  //       if (typeof submittedData[key] === 'object') {
  //         // For nested objects (family, education), append them individually
  //         Object.keys(submittedData[key]).forEach((nestedKey) => {
  //           if (submittedData[key][nestedKey] !== undefined) {
  //             formDataToSend.append(`${key}[${nestedKey}]`, submittedData[key][nestedKey]);
  //           }
  //         });
  //       } else {
  //         formDataToSend.append(key, submittedData[key]);
  //       }
  //     }
  //   });
  
  //   if (uploadedFile) {
  //     formDataToSend.append('file', uploadedFile.file); // Add the image file
  //   }
  
  //   try {
  //     const response = await axios.put(
  //       `${process.env.REACT_APP_BACKENDURL}/api/staff/${editId}`,
  //       formDataToSend,
  //       { headers: { 'Content-Type': 'multipart/form-data' } }
  //     );
  
  //     if (response.status === 200) {
  //       successToast("Staff Updated Successfully");
  //       fetchItemsData();
  //       onFormCancel();
  //     }
  //   } catch (err) {
  //     errorToast("Something Went Wrong");
  //   }
  // };

  const onEditSubmit = async() => {

    const submittedData = {
      productName: formData.name || undefined,
      productCode: formData.productCode || undefined,
      value: formData.value || undefined,
      category: formData.category || undefined,
      description: formData.description || undefined,
    }
  
    const formDataToSend = new FormData()
  
    Object.keys(submittedData).forEach((key)=> {
      if(submittedData[key] !== undefined){
        formDataToSend.append(key, submittedData[key])
      }
    })
  
    if(uploadedFile){
      formDataToSend.append('file', uploadedFile.file)
    }
  
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKENDURL}/api/product/${editId}`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      if (response.status === 200) {
        successToast("Details Updated Successfully");
        fetchItemsData()
        onFormCancel()
      }
    } catch (error) {
      errorToast(error);
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item._id === id) {
        setFormData({
          name        : item.productName,
          value       : item.value,
          productCode : item.productCode,
          category    : item.category, 
          description : item.description,
        });
        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  // function to change to suspend property for an item
  const suspendUser = (id) => {
    let newData = data;
    let index = newData.findIndex((item) => item._id === id);
    newData[index].status = "Suspend";
    setData([...newData]);
  };


  const toggleAssignModal = (item) => {
    setAssignModal(!assignModal);
    setSelectedData(item)
  };
  

 const onDeleteSubmit = async (id) => {
  if (!id) return errorToast("No ID provided");

  const url = `${process.env.REACT_APP_BACKENDURL}/api/product/${id}`;
  console.log("🔗 DELETE URL:", url);

  try {
    const response = await axios.delete(url); // DELETE does not need a body
    if (response.status === 200) {
      successToast("Deleted Successfully");
      setAssignModal(false); // close modal
      fetchItemsData();      // refresh list
    }
  } catch (err) {
    console.error("❌ Delete error:", err.response?.data || err.message);
    errorToast(err.response?.data?.message || "Something Went Wrong");
  }
};


    const toggleUploadModal = () => {
      setUploadModal(!uploadModal);
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

  // function which selects all the items
  const selectorCheck = (e) => {
    let newData;
    newData = data.map((item) => {
      item.checked = e.currentTarget.checked;
      return item;
    });
    setData([...newData]);
  };

  // function to toggle the search option
  const toggle = () => setonSearch(!onSearch);

  const { errors, register, handleSubmit } = useForm();

  const options = [
    { value: "Beverages", label: "Beverages" },
    { value: "Chats", label: "Chats" },
    { value: "Hotdrinks", label: "Hot Drinks" }
  ];
  
 
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.05, // 50 KB
      maxWidthOrHeight: 1024,
      useWebWorker: true, 
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, { type: file.type });
    } catch (error) {
      console.error("Image compression failed:", error);
      throw error; 
    }
  };

  const handleDropChange2 = async(acceptedFiles) => {
    
    const file = acceptedFiles[0]
    console.log(file)
    if(!file) return;
    // compress image
    try{
      const compressedFile = await compressImage(file);
      const newFile = {
        name:compressedFile.name,
        type:compressedFile.type,
        file:compressedFile,
        preview: URL.createObjectURL(compressedFile)
      }
      setFiles2([newFile]),
      setUploadedFile(newFile)
    }catch(error){
      console.error("Error compressing file:", error);
    }
  }
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18)


  const handleDropChange = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
  
        // Dynamically get the first sheet name
        const sheetName = workbook.SheetNames[0]; // Get the first sheet name
        const worksheet = workbook.Sheets[sheetName];
  
        if (worksheet) {
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
          const filePreview = {
            name: file.name,
            newName: file.name.replace(/\.[^/.]+$/, "") + '_preview.xlsx',
            preview: URL.createObjectURL(file),
            data: sheetData,
          };
  
          setFiles([filePreview]);
          
          setSheetData(sheetData);
        } else {
          errorToast(`Failed to read the sheet from the file "${file.name}".`);
        }
      };
  
      reader.readAsArrayBuffer(file);
    });
  };

  const onImportSubmit = (e) => {
    e.preventDefault()
    if (!sheetData) {
      warningToast("No file data to upload.");
      return;
    }
    const requestBody = {
      data: sheetData,
      createdBy: userData._id,
  };
    // Send data to the backend using fetch
    fetch(process.env.REACT_APP_BACKENDURL+'/api/staff/importLeads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(responseData => {
      successToast('Data sent successfully:', responseData);
      toggleUploadModal()
      setFiles([])
      fetchItemsData()
      ()
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });
    
  };

  const AddSubmitHandler = async(e) => {
    e.preventDefault()
    // Created TIme
    const timeStampt = Date.now()
    const createDate = new Date(timeStampt)
    const options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
    const createdTime= createDate.toLocaleString('en-US', options);

    let submittedData = {
      department: formData.createDepartment,
      code : formData.code,
      description : formData.description,
      createdBy: userData._id,
      createdAt: createdTime
    }; 
    const postData = {
      method:"POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(submittedData)
    }
    try{
      const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/department", postData)
     if(response.ok){
      setFormData((prevData) => ({
        ...prevData,
        department: null, // Assuming null will clear RSelect
        }));
        getDepartmentData()
        successToast("Department Added Successfully")
        setCreateDepartmentModal(false)
      
     }
     else{
      warningToast(resData.message)
  }
    }catch(err){
      errorToast(err)
    }
  }

  const xlsxSVG =  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
                  <path fill="#36c684" d="M50 61H22a6 6 0 01-6-6V22l9-11h25a6 6 0 016 6v38a6 6 0 01-6 6z"></path>
                  <path fill="#95e5bd" d="M25 20.556A1.444 1.444 0 0123.556 22H16l9-11z"></path>
                  <path
                    fill="#fff"
                    d="M42 31H30a3.003 3.003 0 00-3 3v11a3.003 3.003 0 003 3h12a3.003 3.003 0 003-3V34a3.003 3.003 0 00-3-3zm-13 7h6v3h-6zm8 0h6v3h-6zm6-4v2h-6v-3h5a1.001 1.001 0 011 1zm-13-1h5v3h-6v-2a1.001 1.001 0 011-1zm-1 12v-2h6v3h-5a1.001 1.001 0 01-1-1zm13 1h-5v-3h6v2a1.001 1.001 0 01-1 1z"
                  ></path>
                </svg>

  const AddSubmitHandler2 = async(e) => {
    e.preventDefault()
    // Created TIme
    const timeStampt = Date.now()
    const createDate = new Date(timeStampt)
    const options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
    const createdTime= createDate.toLocaleString('en-US', options);

    let submittedData = {
      designation: formData.createDesignation,
      code : formData.code,
      description : formData.description,
      createdBy: userData._id,
      createdAt: createdTime
    }; 
    const postData = {
      method:"POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(submittedData)
    }
    try{
      const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/designation", postData)
     if(response.ok){
      setFormData((prevData) => ({
        ...prevData,
        department: null, // Assuming null will clear RSelect
        }));
        getDesignationData()
        successToast("Designation Added Successfully")
        setCreateDesignationModal(false)
      
     }
     else{
      warningToast(resData.message)
  }
    }catch(err){
      errorToast(err)
    }
  }

  const AddSubmitHandler3 = async(e) => {
    e.preventDefault()
    // Created TIme
    const timeStampt = Date.now()
    const createDate = new Date(timeStampt)
    const options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
    const createdTime= createDate.toLocaleString('en-US', options);

    let submittedData = {
      team: formData.createTeam,
      code : formData.code,
      description : formData.description,
      createdBy: userData._id,
      createdAt: createdTime
    }; 
    const postData = {
      method:"POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(submittedData)
    }
    try{
      const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/team", postData)
     if(response.ok){
      setFormData((prevData) => ({
        ...prevData,
        department: null, // Assuming null will clear RSelect
        }));
        getTeamData()
        successToast("Team Created Successfully")
        setCreateTeamModal(false)
      
     }
     else{
      warningToast(resData.message)
  }
    }catch(err){
      errorToast(err)
    }
  }
  return (
    <React.Fragment>
      <Head title="Products List"></Head>
      <Content>
      
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Items List
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>You have total {data?.length} items.</p>
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

                  <li  className="nk-block-tools-opt">
                    <Button
                      color={isGridView ? "" : "primary"}
                      className="btn-icon mr-1"
                      onClick={() => {
                        setIsGridView(false);
                        setItemPerPage(10);
                        localStorage.setItem("isGridView", "false"); // Save view mode to localStorage
                      }}
                      >
                      <Icon name="list"></Icon>
                    </Button>
                    <Button
                      color={isGridView ? "primary" : ""}
                      className="btn-icon"
                      onClick={() => {
                        setIsGridView(true);
                        setItemPerPage(12);
                        localStorage.setItem("isGridView", "true"); // Save view mode to localStorage
                      }}
                      >
                      <Icon name="grid"></Icon>
                    </Button>
                    </li>
                    
                      {/* <li>
                        <a
                          href="#export"
                          onClick={(ev) => {
                            ev.preventDefault();
                            handleExportStaffData()
                          }}
                          className="btn btn-white btn-outline-light"
                        >
                          <Icon name="download-cloud"></Icon>
                          
                        </a>
                      </li> */}
                                        
                    {/* <li>
                      <a
                        href="#export"
                        onClick={(ev) => {
                          ev.preventDefault();
                          toggleSideBar();
                        }}
                        className="btn btn-primary"
                      >
                        <span>Details</span>
                      </a>
                    </li> */}
                  
                    {/* <li className="nk-block-tools-opt">
                      <Button color="primary" className="btn-icon" onClick={toggleUploadModal}>
                        <Icon name="upload"></Icon> 
                      </Button>
                    </li> */}
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
                        fetchItemsData()
                      }}
                    >
                      <Icon name="arrow-left"></Icon>
                    </Button>
                    <input
                      type="text"
                      className="border-transparent form-focus-none form-control"
                      placeholder="Search by Product Name or Code"
                      value={onSearchText}
                      onChange={(e) => onFilterChange(e)}
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
                  
                    <div  className="product-card ">

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
                      <span className="product-name">{item.productName}</span>
                      <span className="product-designation">{item.designation}</span>
                      <span style={{color:"black"}} className="product-designation">Item Code: {item.productCode}</span>
                      {/* <span style={{color:"black"}} className="product-designation">{item.email}</span>
                      <span style={{backgroundColor:"#D4EBF8" ,color:"#758694", border:"none", fontSize:"16px", padding:"14px", borderRadius:"25px", marginTop:"10px"}} class="badge"><Icon style={{marginRight:"10px"}} name="mobile"></Icon>{item.phone}</span> */}
                      {/* <Link to={`${process.env.PUBLIC_URL}/staff-details/${item._id}`}>
                      <Button style={{marginTop:"20px"}} color="primary">
                        Add
                      </Button>
                      </Link>   */}
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
                  <span style={{fontWeight:"bold"}} className="sub-text">Item Name</span>
                </DataTableRow>
               
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Item Code</span>
                </DataTableRow>
                <DataTableRow size="sm">
                  <span style={{fontWeight:"bold"}} className="sub-text">Value</span>
                </DataTableRow>
                <DataTableRow size="lg">
                  <span style={{fontWeight:"bold"}} className="sub-text">Categpry</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Description</span>
                </DataTableRow>
                {/* <DataTableRow size="">
                  <span style={{fontWeight:"bold"}} className="sub-text">Status</span>
                </DataTableRow>
                 */}
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
                          text={findUpper(item.productName)}
                          image={item.file}
                        ></UserAvatar>
                        </DataTableRow>
                        <DataTableRow>
                         {/* <Link to={`${process.env.PUBLIC_URL}/staff-details/${item._id}`}> */}
                            <div className="user-card">
                              <div className="user-info">
                                <span className="tb-lead">{item.productName}</span>
                              </div>
                            </div>
                           {/* </Link>  */}
                        </DataTableRow>
                       
                        <DataTableRow size="md">
                          <span>{item.productCode}</span>
                        </DataTableRow>
                         <DataTableRow size="md" key={item._id}>
                            <span>
                             {item.value}
                            </span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span>{item.category}</span>
                        </DataTableRow>
                        <DataTableRow size="lg">
                          <span>{item.description}</span>
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
                                        <li className="divider"></li>
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
              <h5 className="title">Add Product</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={onFormSubmit}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Product Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        defaultValue={formData.name}
                        onChange={(e)=> setFormData({...formData, name:e.target.value})}
                        placeholder="Enter Product name"
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
                      <label className="form-label">Product Code</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        defaultValue={formData.productCode}
                        onChange={(e)=> setFormData({...formData, productCode:e.target.value})}
                        placeholder="Enter Product Code"
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>

                 
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Value</label>
                      <input
                        className="form-control"
                        type="text"
                        name="phone"
                        onChange={(e) => {                          
                          setFormData({...formData, value:e.target.value})
                        }}
                        value={formData.value}
                        placeholder="Enter Item value"
                        ref={register({ required: "This field is required" })}
                      />
                   
                      {errors.phone && (
                        <span className="invalid">{errors.phone.message}</span>
                      )}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Category</label>
                      <div className="form-control-wrap">
                      <RSelect
                       options={options}
                       onChange={(e)=> setFormData({...formData, category:e.value})}        
                      />
                      
                    </div>
                      
                    </FormGroup>
                  </Col>

                  <Col md="12">
                  <FormGroup>
                      <label className="form-label">Description</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Description"
                        name="phone"
                        defaultValue={formData.description}
                        onChange={(e)=> setFormData({...formData, description:e.target.value})}
                        ref={register({
                          required: "This field is required",
                        })}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>
                 

                  <Col size="12">
                      <Dropzone accept=".png, .jpg" multiple={false} onDrop={(acceptedFiles) => handleDropChange2(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                          <section>
                            <div
                              {...getRootProps()}
                              className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
                            >
                              <input {...getInputProps()} />
                              {files2.length === 0 && <p>Drag 'n' drop PNG, JPG files or click to select files</p>}
                              {files2.map((file) => (
                                <div
                                  key={file.name}
                                  className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                                >
                                  <div className="dz-image">
                                    <img src={file.preview} alt="preview" />
                                  </div>
                                  <span>{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </Dropzone>
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
              <h5 className="title">Update Products</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onEditSubmit)}>
                <Col md="6">
                    <FormGroup>
                      <label className="form-label">Item Name</label>
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
                      <label className="form-label">Product Code</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        defaultValue={formData.productCode}
                        onChange={(e)=> setFormData({...formData, productCode:e.target.value})}
                        placeholder="Enter Product Code"
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>

                 
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Value</label>
                      <input
                        className="form-control"
                        type="text"
                        name="phone"
                        onChange={(e) => {                          
                          setFormData({...formData, value:e.target.value})
                        }}
                        value={formData.value}
                        placeholder="Enter Item value"
                        ref={register({ required: "This field is required" })}
                      />
                   
                      {errors.phone && (
                        <span className="invalid">{errors.phone.message}</span>
                      )}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Category</label>
                      <div className="form-control-wrap">
                      <RSelect
                       options={options}
                       defaultValue={{
                            value: formData.category,
                            label:  formData.category === "Chat" ? "Chat" : 
                                    formData.category === "Beverages" ? "Beverages": "Hotdrinks",
                          }}
                       onChange={(e)=> setFormData({...formData, category:e.value})}        
                      />
                      
                    </div>
                      
                    </FormGroup>
                  </Col>

                  <Col md="12">
                  <FormGroup>
                      <label className="form-label">Description</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Description"
                        name="phone"
                        defaultValue={formData.description}
                        onChange={(e)=> setFormData({...formData, description:e.target.value})}
                        ref={register({
                          required: "This field is required",
                        })}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>
                 
                  <Col size="12">
                      <Dropzone accept=".png, .jpg" multiple={false} onDrop={(acceptedFiles) => handleDropChange2(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                          <section>
                            <div
                              {...getRootProps()}
                              className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
                            >
                              <input {...getInputProps()} />
                              {files2.length === 0 && <p>Drag 'n' drop PNG, JPG files or click to select files</p>}
                              {files2.map((file) => (
                                <div
                                  key={file.name}
                                  className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                                >
                                  <div className="dz-image">
                                    <img src={file.preview} alt="preview" />
                                  </div>
                                  <span>{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </Dropzone>
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

      <Modal isOpen={uploadModal} toggle={toggleUploadModal} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                setFiles([])
                toggleUploadModal()
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Import Employee</h5>
          
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={onImportSubmit}>
                    <Col size="12">
                    <Dropzone
                        accept=".xlsx, .xls"
                        multiple={false}
                        onDrop={(acceptedFiles) => handleDropChange(acceptedFiles, setFiles)}
                      >
                        {({ getRootProps, getInputProps }) => (
                          <section>
                            <div
                              {...getRootProps()}
                              className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
                            >
                              <input {...getInputProps()} />
                              {files.length === 0 && (
                                <p>Drag 'n' drop XLSX, XLS file here, or click to select files</p>
                              )}
                              {files.map((file) => (
                                <div
                                  key={file.name}
                                  className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                                >
                                  <div className="dz-image">{xlsxSVG}</div>
                                  <span className="ml-1">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </Dropzone>

                    </Col>
                
                <Col size="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button color="primary" size="md" type="submit">
                          Import
                        </Button>
                      </li>
                      <li>
                        <a
                          href="#cancel"
                          onClick={(ev) => {
                            ev.preventDefault();
                            toggleUploadModal()
                            setFiles([])
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


        <Modal isOpen={creatDepartmentModal} className="modal-dialog-centered" size="md">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                onFormCancel2();
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Add Department</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={(e)=> {AddSubmitHandler(e)}}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Department</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        placeholder="Enter Department"
                        ref={register({ required: "This field is required" })}
                        onChange={(e) => setFormData({ ...formData, createDepartment: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>


                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Code</label>
                      <input
                        className="form-control"
                        type="number"
                        name="name"
                        placeholder="Enter Department Code"
                        ref={register({ required: "This field is required" })}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>


                  <Col md="12">
                    <FormGroup>
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        type="text"
                        name="name"
                        style={{ minHeight: "10px" }}
                        placeholder="Enter Description"
                        ref={register({ required: "This field is required" })}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
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
                            onFormCancel2();
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


        <Modal isOpen={createDesignationModal} className="modal-dialog-centered" size="md">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                onFormCancel2();
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Add Designation</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={(e)=> {AddSubmitHandler2(e)}}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Designation</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        placeholder="Enter Designation"
                        ref={register({ required: "This field is required" })}
                        onChange={(e) => setFormData({ ...formData, createDesignation: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>


                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Code</label>
                      <input
                        className="form-control"
                        type="number"
                        name="name"
                        placeholder="Enter Designation Code"
                        ref={register({ required: "This field is required" })}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>


                  <Col md="12">
                    <FormGroup>
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        type="text"
                        name="name"
                        style={{ minHeight: "10px" }}
                        placeholder="Enter Description"
                        ref={register({ required: "This field is required" })}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
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
                            onFormCancel2();
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


        <Modal isOpen={createteamModal} className="modal-dialog-centered" size="md">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                onFormCancel2();
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Add Team</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={(e)=> {AddSubmitHandler3(e)}}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Team Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        placeholder="Enter Team Name"
                        ref={register({ required: "This field is required" })}
                        onChange={(e) => setFormData({ ...formData, createTeam: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>


                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Code</label>
                      <input
                        className="form-control"
                        type="number"
                        name="name"
                        placeholder="Enter Designation Code"
                        ref={register({ required: "This field is required" })}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>


                  <Col md="12">
                    <FormGroup>
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        type="text"
                        name="name"
                        style={{ minHeight: "10px" }}
                        placeholder="Enter Description"
                        ref={register({ required: "This field is required" })}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}/>
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
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
                            onFormCancel2();
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

      </Content>
      

    
    <Sidebar size="xl" toggleState={showSideBar}>
      <Card>
        <div className="card-inner-group">
          <div className="card-inner">
            <div className="user-card user-card-s2 mb-2">
              <div style={{ position: "absolute", zIndex: "10", left: "0px", top: "40px" }}>
                <Button>
                  <Icon
                    onClick={toggleSideBar}
                    style={{ fontSize: "25px" }}
                    name="arrow-right"
                  />
                </Button>
              </div>

              <div style={{ textAlign: "center", marginTop: "80px" }}>
                <div>
                  <h6>Total Employee</h6>
                  <h6>50</h6>
                </div>
                <div style={{ marginTop: "30px" }}>
                  <h6>Confirmed provision</h6>
                  <h6 style={{ color: "white" }}>
                    <span className="badge bg-primary">40</span>
                  </h6>
                </div>
                <div style={{ marginTop: "30px" }}>
                  <h6>Retiered Employee</h6>
                  <h6>01</h6>
                </div>
                <div style={{ marginTop: "30px" }}>
                  <h6>Resigned Employee</h6>
                  <h6>01</h6>
                </div>
                <div style={{ marginTop: "30px" }}>
                  <h6>Terminated Employee</h6>
                  <h6>0</h6>
                </div>
                <div style={{ marginTop: "30px" }}>
                  <h6>Relieved Employee</h6>
                  <h6>02</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Sidebar>

    </React.Fragment>
  );
};
export default ItemsList;
