import React, { useState, useEffect, useContext } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { findUpper } from "../../../utils/Utils";
import { userData, filterRole, filterStatus } from "./UserData";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";
import 'react-datepicker/dist/react-datepicker.css';
import SimpleBar from "simplebar-react";
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

const StaffListCompact = () => {
  
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
    designation: '',
    email: '',
    staffStatus: "",
    createdBy:"",
    address : "",
    dob: null,
    doj : null,
    blood: "",
    aadhar : "",
    emergencyContact:"",
    emergencyContact2:"",
    bankName : "",
    accountNo : "",
    branch : "",
    ifsc : "",
    employeeId:"",
    department:"",
    createDepartment:"",
    createDesignation:"",
    code:"",
    description:"",
    createTeam: "",
    fatherName: "",
    motherName:"",
    siblingName:"",
    familyMembers:"",
    familyNumber: null,
    degree: "",
    universityName : "",
    degreeName1 :"",
    degreeName2 :"",
    pan : "",
    team : "",
    uan :""
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


  const headerStyle = {
    marginLeft: isScreenSmall ?  "-20px" : "70px",
    marginTop: isScreenSmall ?  "" : "-80px"
  };

  useEffect(()=> {
    if(data?.length === 0){
      fetchStaffData()
    }
  },[data])

  useEffect(()=> {
    if(designationList?.length === 0){
      getDesignationData ()
    }
  },[designationList])

  useEffect(()=> {
    if(departmentList?.length === 0){
      getDepartmentData()
    }
  },[departmentList])

  useEffect(()=> {
    if(teamList?.length === 0){
      getTeamData()
    }
  },[teamList])
 
  // fetch users list
  const fetchStaffData = async() => {
    try{
      const response = await axios.get(process.env.REACT_APP_BACKENDURL+"/api/staff")
      const reveresedData = response.data.reverse()
      setData(reveresedData)
      } catch (err){
        console.log(err)
      }}
      

       // fetch Designation list
       const getDesignationData = async() => {
        try{
          const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/designation") 
          const resData = await response.json()
          if(response.ok){
            setDesignationList(resData.data)
          }
        }catch(err){
          console.log(err)
        }
      }


      const getDepartmentData = async() => {
        try{
          const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/department") 
          const resData = await response.json()
          if(response.ok){
            setDepartmentList(resData.data)
          }
        }catch(err){
          console.log(err)
        }
      }

      const getTeamData = async() => {
        try{
          const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/team") 
          const resData = await response.json()
          if(response.ok){
            setteamList(resData.data)
          }
        }catch(err){
          console.log(err)
        }
      }

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

  const filteredDeletedData = data?.filter((item) => item.isDeleted !== true) 
 
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredDeletedData?.slice(indexOfFirstItem, indexOfLastItem);

  const handleEmployeeIdChange = (value) => {
    const enteredValue = parseInt(value, 10);
    setFormData({ ...formData, employeeId: enteredValue });
  
    const sortedIds = data.map((item) => item.employeeId).sort((a, b) => a - b);
  
   
    let nextAvailableId = 1000; // Start from 1000
    for (let id of sortedIds) {
      if (id === nextAvailableId) {
        nextAvailableId++; 
      } else if (id > nextAvailableId) {
        break;
      }
    }
    if (sortedIds.includes(enteredValue)) {

      setFormErrors({
        ...formErrors,
        employeeId: `This Employee ID is already in use. The next available ID is ${nextAvailableId}.`,
      });
    } else if (enteredValue > nextAvailableId) {
    
      setFormErrors({
        ...formErrors,
        employeeId: `You can use the next available Employee ID: ${nextAvailableId}.`,
      });
    } else {
    
      setFormErrors({ ...formErrors, employeeId: "" });
    }
  };
  
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

  // function to change the selected property of an item
  const onSelectChange = (e, id) => {
    let newData = data;
    let index = newData.findIndex((item) => item._id === id);
    newData[index].checked = e.currentTarget.checked;
    setData([...newData]);
  };

  // function to set the action to be taken in table header
  const onActionText = (e) => {
    setActionText(e.value);
  };

  // function to reset the form
  const resetForm = () => {
    setFormData({
      name: "",
      phone: null,
      designation: '',
      email: '',
      staffStatus: "",
      createdBy:"",
      address : "",
      dob: null,
      doj: null,
      blood: "",
      aadhar : "",
      emergencyContact:"",
      emergencyContact2:"",
      bankName : "",
      accountNo : "",
      branch : "",
      ifsc : "",
      employeeId:"",
      department:"",
      createDepartment:"",
      createDesignation:"",
      code:"",
      description:"",
      createTeam: "",
      fatherName: "",
      motherName:"",
      siblingName:"",
      familyMembers:"",
      familyNumber: null,
      degree: "",
      universityName : "",
      degreeName1 :"",
      degreeName2 :"",
      pan : "",
      team : "",
      uan :""
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
  // submit function to add a new item
  const onFormSubmit = async (e) => {
    // Initialize FormData for submission
    const formDataToSend = new FormData();
  
    // Flat fields in formData
    const flatFields = [
      "name", "phone", "designation", "email", "staffStatus", "createdBy", "address",
      "dob", "doj", "blood", "aadhar", "emergencyContact", "emergencyContact2",
      "bankName", "accountNo", "branch", "ifsc", "employeeId", "code", "description",
      "pan", "uan"
    ];
  
    // Append flat fields to FormData
    flatFields.forEach((field) => {
      if (formData[field]) {
        formDataToSend.append(field, formData[field]);
      }
    });
  
    // Append nested fields: family details
    const familyFields = ["fatherName", "motherName", "siblingName", "familyMembers", "familyNumber"];
    familyFields.forEach((field) => {
      if (formData[field]) {
        formDataToSend.append(`family[${field}]`, formData[field]);
      }
    });
  
    // Append nested fields: education details
    const educationFields = ["degree", "universityName", "degreeName1", "degreeName2"];
    educationFields.forEach((field) => {
      if (formData[field]) {
        formDataToSend.append(`education[${field}]`, formData[field]);
      }
    });
  
    // Append uploaded file, if present
    if (uploadedFile?.file) {
      formDataToSend.append("file", uploadedFile.file);
    }
  
    // Submit the form data to the backend
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKENDURL}/api/staff`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      // Handle response based on status
      switch (response.status) {
        case 201:
          successToast("Staff Created Successfully");
          onFormCancel(); // Reset the form
          fetchStaffData(); // Refresh staff list
          break;
        case 400:
          errorToast("Invalid form data. Please check your input.");
          break;
        case 409:
          errorToast(response.data.message || "Conflict: Duplicate data found.");
          break;
        default:
          warningToast(`Unexpected response: ${response.status}`);
      }
    } catch (error) {
      // Handle errors
      if (error.response) {
        errorToast(error.response.data.message || "An error occurred. Please try again.");
      } else {
        errorToast("Network error. Please check your connection.");
      }
    }
  };
  

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

  const onEditSubmit = async () => {
    const submittedData = {
      name: formData.name || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      staffStatus: formData.staffStatus || undefined,
      designation: formData.designation || undefined,
      blood: formData.blood || undefined,
      aadhar: formData.aadhar || undefined,
      staffId: formData.staffId || undefined,
      emergencyContact: formData.emergencyContact || undefined,
      emergencyContact2: formData.emergencyContact2 || undefined,
      dob: formData.dob || undefined,
      doj: formData.doj || undefined,
      bankName: formData.bankName || undefined,
      branch: formData.branch || undefined,
      accountNo: formData.accountNo || undefined,
      ifsc: formData.ifsc || undefined,
      employeeId: formData.employeeId || undefined,
      department: formData.department || undefined,
      pan: formData.pan || undefined, 
      family: {
        fatherName: formData.fatherName || undefined,  // Add family fields
        motherName: formData.motherName || undefined,
        siblingName: formData.siblingName || undefined,
        familyNumber: formData.familyNumber || undefined,
        familyMembers: formData.familyMembers || undefined,
      },
      education: {
        degree: formData.degree || undefined,  // Add education fields
        universityName: formData.universityName || undefined,
        degreeName1: formData.degreeName1 || undefined,
        degreeName2: formData.degreeName2 || undefined,
      },
    };
  
    const formDataToSend = new FormData();
  
    Object.keys(submittedData).forEach((key) => {
      if (submittedData[key] !== undefined) {
        if (typeof submittedData[key] === 'object') {
          // For nested objects (family, education), append them individually
          Object.keys(submittedData[key]).forEach((nestedKey) => {
            if (submittedData[key][nestedKey] !== undefined) {
              formDataToSend.append(`${key}[${nestedKey}]`, submittedData[key][nestedKey]);
            }
          });
        } else {
          formDataToSend.append(key, submittedData[key]);
        }
      }
    });
  
    if (uploadedFile) {
      formDataToSend.append('file', uploadedFile.file); // Add the image file
    }
  
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKENDURL}/api/staff/${editId}`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      if (response.status === 200) {
        successToast("Staff Updated Successfully");
        fetchStaffData();
        onFormCancel();
      }
    } catch (err) {
      errorToast("Something Went Wrong");
    }
  };

  
  // const onEditSubmit = async() => {
  //   let submittedData;
  //   let newitems = data;
  //   newitems.forEach((item) => {
  //     if (item._id === editId) {
  //       submittedData = {
  //         productName: formData.name,
  //         productCode:formData.productCode,
  //         stock: formData.stock,
  //         value: formData.value,
  //         description:formData.description,
  //         row:formData.row,
  //         coloumn:formData.coloumn
  //       };
  //     }
  //   });  
  //   try{
  //     const response = await axios.put(process.env.REACT_APP_BACKENDURL+"/api/product/"+editId, submittedData)
  //     if(response.status === 200){
  //       successToast("Product Updated Successfully")
  //       setModal({ edit: false });
  //       fetchStaffData()
  //     }
  //   }catch(err){
  //     errorToast("Something Went Wrong")
  //   }
  // };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item._id === id) {
        setFormData({
          name: item.name,
          phone: item.phone,
          designation: item.designation,
          address : item.address,
          email : item.email,
          staffStatus: item.staffStatus,
          dob: item.dob?.length > 5 ? item.dob : null,
          doj : item.doj?.length > 5 ? item.doj : null,
          blood : item.blood,
          aadhar : item.aadhar,
          emergencyContact : item.emergencyContact,
          emergencyContact2 : item.emergencyContact2,
          bankName : item.bankName,
          accountNo : item.accountNo,
          branch: item.branch,
          ifsc : item.ifsc,
          department : item.department,
          universityName: item.education.universityName,
          degree: item.education.degree,
          degreeName1: item.education.degreeName1,
          degreeName2 : item.education.degreeName2,
          fatherName : item.family.fatherName,
          motherName: item.family.motherName,
          siblingName : item.family.siblingName,
          familyNumber: item.family.familyNumber,
          familyMembers: item.family.familyMembers
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
  

  const onDeleteSubmit = async(id) => {
    let submittedData = {
          isDeleted: true,
        };
      
    try{
      const response = await axios.put(process.env.REACT_APP_BACKENDURL+"/api/staff/isDelete/"+id, submittedData)
      if(response.status === 200){
        successToast("Deleted Successfully")
        setAssignModal(!assignModal);
        fetchStaffData()
      }
    }catch(err){
      errorToast("Something Went Wrong")
    }

    // try{
    //   const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/staff/isDeleted"+selectedData._id,{
    //     method:"PUT"
    //   })
    //   const resData = await response.json()
    //   if(!response.ok){
    //     errorToast(resData.message)
    //   }
    //   else{
    //     successToast(resData.message)
    //     setAssignModal(!assignModal);
    //     fetchStaffData()
    //   }
    // }catch(error){
    //   console.error('Error:', error);
    // }
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

  const designationData =  designationList.map((item)=> ({
    value: item.designation,
    label: item.designation.charAt(0).toUpperCase() + item.designation.slice(1)
  }))
  
  const departmentData = departmentList.map((item) => ({
    value: item.department,
    label: item.department.charAt(0).toUpperCase() + item.department.slice(1),
  }));


  const teamData = teamList.map((item) => ({
    value: item.team,
    label: item.team.charAt(0).toUpperCase() + item.team.slice(1),
  }));

  const options = [
    ...departmentData,
    { value: "create", label: "Add Department", isCreateOption: true },
  ];

  const teamOptions = [
    ...teamData,
    { value: "create", label: "Add Team", isCreateOption: true },
  ];

  const familyCount = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: i + 1
  }));
  
  const degreeOptions = [
    { value: "UG", label: "Undergraduate (UG)" },
    { value: "PG", label: "Postgraduate (PG)" }
  ];
  
  const customStyles = {
    option: (provided, state) => {
      if (state.data.isCreateOption) {
        return {
          ...provided,
          backgroundColor: state.isSelected ? 'blue' : 'lightblue',  // Adjust for selected option
          color: state.isSelected ? 'white' : 'blue',
          '&:hover': {
            backgroundColor: '#0f766c !important',
            color: 'white !important',
          },
          // Add !important for overriding default styles
          backgroundColor: state.isSelected ? 'blue !important' : '#14998B !important',
          color: state.isSelected ? 'white !important' : 'white !important',
        };
      }
      return provided;
    },
    singleValue: (provided, state) => {
      if (state.data && state.data.isCreateOption) {
        return {
          ...provided,
          color: 'blue !important',
        };
      }
      return provided;
    },
    control: (provided) => ({
      ...provided,
      borderColor: 'lightgray',
    }),
  };




  // Change Page
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

  const bloodGroup = [
    { value: "A+", label: "A+ ve" },
    { value: "A-", label: "A- ve" },
    { value: "B+", label: "B+ ve" },
    { value: "B-", label: "B- ve" },
    { value: "AB+", label: "AB+ ve" },
    { value: "AB-", label: "AB- ve" },
    { value: "O+", label: "O+ ve" },
    { value: "O-", label: "O- ve" },
  ];

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
      fetchStaffData()
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


  const designation = [
    {value:"delivery", label:"Delivery Person"},
     { value :"kitchen", label : "Kitchen Work"}
  ]
  return (
    <React.Fragment>
      <Head title="Products List"></Head>
      <Content>
      
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Staff List
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>You have total {data?.length} staff.</p>
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
                        fetchStaffData()
                      }}
                    >
                      <Icon name="arrow-left"></Icon>
                    </Button>
                    <input
  type="text"
  className="border-transparent form-focus-none form-control"
  placeholder="Search by Staff Name or email"
  value={onSearchText}
  onChange={(e) => {
    const value = e.target.value;
    onFilterChange(e); // keep your existing filter logic
    if (value === "") {
      fetchStaffData(); // fetch all staff if input is empty
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
                      <span style={{color:"black"}} className="product-designation">staff ID : {item.staffId}</span>
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
                  <span style={{fontWeight:"bold"}} className="sub-text">Staff Name</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Staff ID</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Email</span>
                </DataTableRow>
                <DataTableRow size="sm">
                  <span style={{fontWeight:"bold"}} className="sub-text">Phone</span>
                </DataTableRow>
                <DataTableRow size="lg">
                  <span style={{fontWeight:"bold"}} className="sub-text">Designation</span>
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
                         <Link to={`${process.env.PUBLIC_URL}/staff-details/${item._id}`}>
                            <div className="user-card">
                              <div className="user-info">
                                <span className="tb-lead">{item.name} </span>
                              </div>
                            </div>
                           </Link> 
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span>{item.employeeId}</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span>{item.email}</span>
                        </DataTableRow>
                         <DataTableRow size="md" key={item._id}>
                            <span>
                             {item.phone}
                            </span>
                        </DataTableRow>
                        <DataTableRow size="lg">
                          <span>{item.designation}</span>
                        </DataTableRow>
                        <DataTableRow size="md" key={item._id}>
                        <span
                            className={`tb-status text-${
                              item.staffStatus === "active" ? "success" : item.staffStatus === "suspend" ? "warning" : "danger"
                            }`}
                          >
                            {item.staffStatus === "active" ? "Active" : "Deactive"}
                          </span>
                        </DataTableRow>
                       
                        {/* <DataTableRow size="lg">
                          <ul className="list-status">
                            <li>
                              <Icon
                                className={`text-${
                                  item.emailStatus === "success"
                                    ? "success"
                                    : item.emailStatus === "pending"
                                    ? "info"
                                    : "secondary"
                                }`}
                                name={`${
                                  item.emailStatus === "success"
                                    ? "check-circle"
                                    : item.emailStatus === "alert"
                                    ? "alert-circle"
                                    : "alarm-alt"
                                }`}
                              ></Icon>{" "}
                              <span>Email</span>
                            </li>
                          </ul>
                        </DataTableRow> */}
                        {/* <DataTableRow size="lg">
                          <span>{item.lastLogin}</span>
                        </DataTableRow> */}
                        {/* <DataTableRow>
                          <span
                            className={`tb-status text-${
                              item.status === "Active" ? "success" : item.status === "Pending" ? "warning" : "danger"
                            }`}
                          >
                            {item.status}
                          </span>
                        </DataTableRow> */}
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
              <h5 className="title">Add staff</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onFormSubmit)}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">* Staff Namse</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        defaultValue={formData.name}
                        onChange={(e)=> setFormData({...formData, name:e.target.value})}
                        placeholder="Enter staff name"
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
                      <label className="form-label">* staff Id</label>
                      <input
                        className="form-control"
                        type="number"
                        name="employeeId"
                        defaultValue={formData.employeeId} 
                        onChange={(e) => handleEmployeeIdChange(e.target.value)}
                        placeholder="Enter Employee Id"
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.employeeId && <span className="invalid mt-05">{errors.employeeId.message}</span>}
                      {formErrors.employeeId && (
                          <span className="invalid">
                            {formErrors.employeeId}
                          </span>
                        )}
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

                  {/* <Col md="6">
                    <FormGroup>
                      <label className="form-label">Staff Id</label>
                      <input
                        className="form-control"
                        type="text"
                        name="staffId"
                        defaultValue={formData.staffId}
                        onChange={(e)=> setFormData({...formData, staffId:e.target.value})}
                        placeholder="Enter Staff Id"
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col> */}

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
                      <label className="form-label">Designation</label>
                      <div className="form-control-wrap">
                      <RSelect
                       options={designation}
                       onChange = {(e)=> {setFormData({...formData, designation: e.value})}}
                      //  onChange={handleChangeDesignation}
                      //  styles={customStyles}
                      />
                      
                    </div>
                      {errors.phone && <span style={{fontSize:"11px", color:"red", fontStyle:"italic"}} className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>


                  

                  {/* <Col md="6">
                    <FormGroup>
                      <label className="form-label"></label>
                      <div className="form-control-wrap">
                      <RSelect
                       
                        onChange={(e) => {
                          setFormData({ ...formData, designation: e.value });
                        }}
                      />
                    </div>
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col> */}

                  <Col md="6">
                  <FormGroup>
                    <label className="form-label" htmlFor="birth-day">
                      Date Of Birth
                    </label>
                    <DatePicker
                      selected={formData.dob}
                      className="form-control"
                      onChange={(date) => setFormData({ ...formData, dob: date })}
                      maxDate={maxDate}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={100} 
                      scrollableYearDropdown 
                    />
                  </FormGroup>
                </Col>


                  <Col md="6">
                  <FormGroup>
                    <label className="form-label">Blood Group</label>
                    <div className="form-control-wrap">
                      <RSelect
                        options={bloodGroup}
                        onChange={(e) => {
                          setFormData({ ...formData, blood: e.value });
                        }}
                      />
                    </div>
                  </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                    <label className="form-label" htmlFor="birth-day">
                      Date Of Joining
                    </label>
                    <DatePicker
                      selected={formData.doj}
                      className="form-control"
                      onChange={(date) => setFormData({ ...formData, doj: date })}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select" 
                      yearDropdownItemNumber={100} 
                      scrollableYearDropdown 
                      maxDate={new Date()}
                    />
                  </FormGroup>
                </Col>

                  <Col md="6">
                  <FormGroup>
  <label className="form-label">Aadhar No</label>
  <input
    className="form-control"
    type="tel"
    placeholder="Enter staff Aadhar No"
    name="aadhar"
    value={formData.aadhar}
    maxLength={12}
    onInput={(e) => {
      // remove non-digits and limit to 12
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 12);
      setFormData({ ...formData, aadhar: e.target.value });
    }}
    required
  />
</FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">PAN No</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter staff PAN No"
                        name="phone"
                        maxLength={10}
                        defaultValue={formData.pan}
                        onChange={(e)=> setFormData({...formData, pan:e.target.value})}
                        // ref={register({
                        //   required: "This field is required",
                        // })}
                      />
                     
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
  <label className="form-label">Emergency Contact No</label>
  <input
    className="form-control"
    type="tel"
    placeholder="Enter Emergency Contact No"
    name="emergency"
    value={formData.emergencyContact}
    maxLength={10}
    onInput={(e) => {
      // allow only numbers and limit to 10 digits
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, emergencyContact: e.target.value });
    }}
    required
  />
</FormGroup>

                  </Col>

                  <Col md="6">
                  <FormGroup>
  <label className="form-label">Alternate Emergency Contact No</label>
  <input
    className="form-control"
    type="tel"
    placeholder="Enter Emergency Contact No"
    name="emergency2"
    value={formData.emergencyContact2}
    maxLength={10}
    onInput={(e) => {
      // Allow only digits and limit to 10
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, emergencyContact2: e.target.value });
    }}
    required
  />
</FormGroup>

                  </Col>
                  <Col md="12">
                  <FormGroup>
                      <label className="form-label">Address</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter staff Address"
                        name="phone"
                        defaultValue={formData.address}
                        onChange={(e)=> setFormData({...formData, address:e.target.value})}
                        // ref={register({
                        //   required: "This field is required",
                        // })}
                      />
                      {/* {errors.phone && <span className="invalid">{errors.phone.message}</span>} */}
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


                    <Col md="12">
                    <div className="data-head mg-top">
                      <h6 className="overline-title">Bank Details</h6>
                    </div>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Bank Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Bank Name"
                        name="phone"
                        defaultValue={formData.bankName}
                        onChange={(e)=> setFormData({...formData, bankName:e.target.value})}
                      />
                     
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Account No</label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder="Enter Account No"
                        name="phone"
                        defaultValue={formData.accountNo}
                        onChange={(e)=> setFormData({...formData, accountNo:e.target.value})}
                      />
                      
                    </FormGroup>
                  </Col>
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Branch</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Branch Name"
                        name="phone"
                        defaultValue={formData.branch}
                        onChange={(e)=> setFormData({...formData, branch:e.target.value})}
                      />
                   
                    </FormGroup>
                  </Col>
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">IFSC Code</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter IFSC Code"
                        name="phone"
                        defaultValue={formData.ifsc}
                        onChange={(e)=> setFormData({...formData, ifsc:e.target.value})}
                      />
                      
                    </FormGroup>
                  </Col>


                  <Col md="12">
                    <div className="data-head mg-top">
                      <h6 className="overline-title">Education Details</h6>
                    </div>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">University Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter University Name"
                        name="phone"
                        defaultValue={formData.universityName}
                        onChange={(e)=> setFormData({...formData, universityName:e.target.value})}
                      />
                     
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Degree</label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={degreeOptions}
                          
                          onChange={(e) => setFormData({ ...formData, degree: e.value })}
                        />
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Degree Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Degree Name"
                        name="phone"
                        defaultValue={formData.degreeName1}
                        onChange={(e)=> setFormData({...formData, degreeName1:e.target.value})}
                      />
                      
                    </FormGroup>
                  </Col>
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Degree Name 2</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Degree"
                        name="phone"
                        defaultValue={formData.degreeName2}
                        onChange={(e)=> setFormData({...formData, degreeName2:e.target.value})}
                      />
                      
                    </FormGroup>
                  </Col>
{/* Family Details */}

                  <Col md="12">
                    <div className="data-head mg-top">
                      <h6 className="overline-title">Family Details</h6>
                    </div>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Father Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Father Name"
                        name="phone"
                        defaultValue={formData.fatherName}
                        onChange={(e)=> setFormData({...formData, fatherName:e.target.value})}
                      />
                     
                    </FormGroup>
                  </Col>
                      
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Mother Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Mother Name"
                        name="phone"
                        defaultValue={formData.motherName}
                        onChange={(e)=> setFormData({...formData, motherName:e.target.value})}
                      />
                     
                    </FormGroup>
                  </Col>
                 
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Sibling Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Sibiling Name"
                        name="phone"
                        defaultValue={formData.siblingName}
                        onChange={(e)=> setFormData({...formData, siblingName:e.target.value})}
                      />
                    </FormGroup>
                  </Col>


                  <Col md="6">
                  <FormGroup>
  <label className="form-label">Family Mobile Number</label>
  <input
    className="form-control"
    type="tel"
    placeholder="Enter Phone Number"
    name="familyNumber"
    value={formData.familyNumber}
    maxLength={10}
    onInput={(e) => {
      // allow only digits and limit to 10
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, familyNumber: e.target.value });
    }}
  
  />
</FormGroup>

                  </Col>
                    
                   <Col md="6">
                    <FormGroup>
                      <label className="form-label">Total Family Members</label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={familyCount}
                         
                          onChange={(e) => setFormData({ ...formData, familyMembers: e.value })}
                        />
                      </div>
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
              <h5 className="title">Update staff Details</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onEditSubmit)}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Staff Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"

                        defaultValue={formData.name}
                        onChange={(e)=> setFormData({...formData, name:e.target.value})}
                        placeholder="Enter name"
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
                        type="text"
                        name="email"
                        defaultValue={formData.email}
                        placeholder="Enter email"
                        disabled
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
  <label className="form-label">Phone</label>
  <input
    className="form-control"
    type="text"
    name="phone"
    placeholder="Enter phone"
    defaultValue={formData.phone}
    maxLength={10} // limits typing to 10 characters
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
    {...register("phone", {
      
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Phone number must be 10 digits",
      },
    })}
  />
  {errors.phone && <span className="invalid">{errors.phone.message}</span>}
</FormGroup>

                    </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Status</label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={filterStatus}
                          defaultValue={{ 
                            value: formData.staffStatus,
                            label: formData.staffStatus === 'active' ? 'Active' : 'Suspend',
                          }}
                          onChange={(e) => setFormData({ ...formData, staffStatus: e.value })}
                        />
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Designation</label>
                      <input
                        className="form-control"
                        type="text"
                        name="balance"
                        defaultValue={formData.designation}
                        onChange={(e)=> setFormData({...formData, designation:e.target.value})}
                        placeholder=""
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.balance && <span className="invalid">{errors.balance.message}</span>}
                    </FormGroup>
                    </Col>

                    <Col md="6">
                  <FormGroup>
                    <label className="form-label" htmlFor="birth-day">
                      Date Of Birth
                    </label>
                    <DatePicker
                      selected={new Date(formData.dob)}
                      className="form-control"
                      onChange={(date) => setFormData({ ...formData, dob: date })}
                      maxDate={maxDate}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={100} 
                      scrollableYearDropdown 
                    />
                  </FormGroup>
                </Col>
                  <Col md="6">
                  <FormGroup>
                    <label className="form-label">Blood Group</label>
                    <div className="form-control-wrap">
                      <RSelect
                        options={bloodGroup}
                        defaultValue={{
                        value: formData.blood,
                        label: 
                          formData.blood === "A+" ? "A+ ve" :
                          formData.blood === "A-" ? "A- ve" :
                          formData.blood === "B+" ? "B+ ve" :
                          formData.blood === "B-" ? "B- ve" :
                          formData.blood === "AB+" ? "AB+ ve" :
                          formData.blood === "AB-" ? "AB- ve" :
                          formData.blood === "O+" ? "O+ ve" :
                          formData.blood === "O-" ? "O- ve" :
                          "Select",
                      }}
                        onChange={(e) => {
                          setFormData({ ...formData, blood: e.value });
                        }}
                      />
                    </div>
                  </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                    <label className="form-label" htmlFor="birth-day">
                      Date Of Joining
                    </label>
                    <DatePicker
                      selected={new Date (formData.doj)}
                      className="form-control"
                      onChange={(date) => setFormData({ ...formData, doj: date })}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select" 
                      yearDropdownItemNumber={100} 
                      scrollableYearDropdown 
                    />
                  </FormGroup>
                </Col>

                  <Col md="6">
                  <FormGroup>
  <label className="form-label">Aadhar No</label>
  <input
    className="form-control"
    type="text"
    placeholder="Enter staff Aadhar No"
    name="aadhar"
    defaultValue={formData.aadhar}
    maxLength={12} // limit typing to 12 digits
    onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
    {...register("aadhar", {
      
      pattern: {
        value: /^[0-9]{12}$/,
        message: "Aadhar number must be 12 digits",
      },
    })}
  />
  {errors.aadhar && <span className="invalid">{errors.aadhar.message}</span>}
</FormGroup>

                  </Col>

                  <Col md="6">
                  <FormGroup>
  <label className="form-label">Emergency Contact No</label>
  <input
    className="form-control"
    type="text"
    placeholder="Enter Emergency Contact No"
    name="emergencyContact"
    defaultValue={formData.emergencyContact}
    maxLength={10} // limit typing to 10 digits
    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
    {...register("emergencyContact", {
      
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Emergency contact must be 10 digits",
      },
    })}
  />
  {errors.emergencyContact && <span className="invalid">{errors.emergencyContact.message}</span>}
</FormGroup>

                  </Col>

                  <Col md="6">
                  <FormGroup>
  <label className="form-label">Alternate Emergency Contact No</label>
  <input
    className="form-control"
    type="text"
    placeholder="Enter Alternate Emergency Contact No"
    name="emergencyContact2"
    defaultValue={formData.emergencyContact2}
    maxLength={10} // limit typing to 10 digits
    onChange={(e) => setFormData({ ...formData, emergencyContact2: e.target.value })}
    {...register("emergencyContact2", {
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Alternate Emergency Contact must be 10 digits",
      },
    })}
  />
  {errors.emergencyContact2 && (
    <span className="invalid">{errors.emergencyContact2.message}</span>
  )}
</FormGroup>

                  </Col>

                  <Col md="12">
                  <FormGroup>
                      <label className="form-label">Address</label>
                      <input
                        className="form-control"
                        type="text"
                        name="balance"
                        defaultValue={formData.address}
                        onChange={(e)=> setFormData({...formData, address:e.target.value})}
                        placeholder=""
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.balance && <span className="invalid">{errors.balance.message}</span>}
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

                    <Col md="12">
                    <div className="data-head mg-top">
                      <h6 className="overline-title">Bank Details</h6>
                    </div>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Bank Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Bank Name"
                        name="phone"
                        defaultValue={formData.bankName}
                        onChange={(e)=> setFormData({...formData, bankName:e.target.value})}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Account No</label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder="Enter Account No"
                        name="phone"
                        defaultValue={formData.accountNo}
                        onChange={(e)=> setFormData({...formData, accountNo:e.target.value})}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Branch</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Branch Name"
                        name="phone"
                        defaultValue={formData.branch}
                        onChange={(e)=> setFormData({...formData, branch:e.target.value})}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>
                  
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">IFSC Code</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter IFSC Code"
                        name="phone"
                        defaultValue={formData.ifsc}
                        onChange={(e)=> setFormData({...formData, ifsc:e.target.value})}
                      />
                      
                    </FormGroup>
                  </Col>

              
                  <Col md="12">
                    <div className="data-head mg-top">
                      <h6 className="overline-title">Education Details</h6>
                    </div>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">University Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter University Name"
                        name="phone"
                        defaultValue={formData.universityName}
                        onChange={(e)=> setFormData({...formData, universityName:e.target.value})}
                      />
                     
                    </FormGroup>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Degree</label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={degreeOptions}
                          defaultValue={{
                            value: formData.familyMembers,
                          label: 
                            formData.degree === "UG" ? "Under Graduate" :
                            formData.degree === "PG" ? "Post Graduate" :
                            "Select",
                        }}
                          onChange={(e) => setFormData({ ...formData, degree: e.value })}
                        />
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Degree Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Degree Name"
                        name="phone"
                        defaultValue={formData.degreeName1}
                        onChange={(e)=> setFormData({...formData, degreeName1:e.target.value})}
                      />
                     
                    </FormGroup>
                  </Col>
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Degree Name 2</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Degree"
                        name="phone"
                        defaultValue={formData.degreeName2}
                        onChange={(e)=> setFormData({...formData, degreeName2:e.target.value})}
                      />
                      
                    </FormGroup>
                  </Col>


                  <Col md="12">
                    <div className="data-head mg-top">
                      <h6 className="overline-title">Family Details</h6>
                    </div>
                  </Col>

                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Father Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Father Name"
                        name="phone"
                        defaultValue={formData.fatherName}
                        onChange={(e)=> setFormData({...formData, fatherName:e.target.value})}
                      />
                      
                    </FormGroup>
                  </Col>
                      
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Mother Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Mother Name"
                        name="phone"
                        defaultValue={formData.motherName}
                        onChange={(e)=> setFormData({...formData, motherName:e.target.value})}
                      />
                     
                    </FormGroup>
                  </Col>
                 
                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Sibling Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Sibiling Name"
                        name="phone"
                        defaultValue={formData.siblingName}
                        onChange={(e)=> setFormData({...formData, siblingName:e.target.value})}
                      />
                    </FormGroup>
                  </Col>


                  <Col md="6">
                  <FormGroup>
                      <label className="form-label">Family Mobile Number</label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder="Enter Phone Number"
                        name="phone"
                        defaultValue={formData.familyNumber}
                        onChange={(e)=> setFormData({...formData, familyNumber:e.target.value})}
                      />
                      
                    </FormGroup>
                  </Col>
                    
                   <Col md="6">
                    <FormGroup>
                      <label className="form-label">Total Family Members</label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={familyCount}
                          defaultValue={{
                            value: formData.familyMembers,
                          label: 
                            formData.familyMembers === 1 ? 1 :
                            formData.familyMembers === 2 ? 2 :
                            formData.familyMembers === 3 ? 3 :
                            formData.familyMembers === 4 ? 4 :
                            formData.familyMembers === 5 ? 5 :
                            formData.familyMembers === 6 ? 6 :
                            formData.familyMembers === 7 ? 7 :
                            formData.familyMembers === 8 ? 8 :
                            formData.familyMembers === 9 ? 9 :
                            formData.familyMembers === 10 ? 10 :
                            "Select",
                        }}
                          onChange={(e) => setFormData({ ...formData, familyMembers: e.value })}
                        />
                      </div>
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
              <h5 className="title">Import staff</h5>
          
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
                  <h6>Total staff</h6>
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
export default StaffListCompact;
