import React, { useState, useEffect, useContext, useRef } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import DatePicker from "react-datepicker";
import Resizer from "react-image-file-resizer";
import {
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  UncontrolledDropdown,
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
} from "../../../components/Component";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { ToastContainer, toast } from "react-toastify";
import { useForm } from "react-hook-form";
import DataContext from "../../../utils/DataContext";
import Dropzone from "react-dropzone";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const HeaderSettings = () => {
  const [collegeLogoSrc, setCollegeLogoSrc] = useState("");
  const [universityLogoSrc, setUniversityLogoSrc] = useState("");
  const [collegeAddress, setCollegeAddress] = useState([]);

  const [dates, setDates] = useState({
    startTime: new Date(),
    endTime: new Date(),
  });
  const [assignModal, setAssignModal] = useState(false);
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
    show: false,
  });
  const [editId, setEditedId] = useState();
  const [formData, setFormData] = useState({
    id: "",
    collegeCode: "",
    collegeAddress: "",
    collegeName: "",
    universityName: "",
    conductionMonth: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [sort, setSortState] = useState("");

  const [inputCollegeCode, setInputCollegeCode] = useState("");
  const [inputCollegeName, setInputCollegeName] = useState("");
  const [inputCollegeAddress, setInputCollegeAddress] = useState("");
  const [inputUniversityName, setUniversityName] = useState("");
  const [conductionMonth, setConductionMonth] = useState("");

  const [data, setData] = useState([]);
  const { userData } = useContext(DataContext);
  const [files, setFiles] = useState([]);
  const [files2, setFiles2] = useState([]);
  const [files3, setFiles3] = useState([]);
  const [files4, setFiles4] = useState([]);
  const [sheetData, setSheetData] = useState(null);
  const [sheetData2, setSheetData2] = useState(null);
  const [sheetData3, setSheetData3] = useState(null);
  const [sheetData4, setSheetData4] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();

  const CloseButton = () => {
    return (
      <span className="btn-trigger toast-close-button" role="button">
        <Icon name="cross"></Icon>
      </span>
    );
  };
  const successToast = (msg) => {
    toast.success(msg);
  };
  const warningToast = (msg) => {
    toast.warning(msg);
  };

  const toggleAssignModal = () => {
    setAssignModal(!assignModal);
  };

  const errorToast = (msg) => {
    toast.error(msg);
  };

  const onFormCancel = () => {
    setModal({ edit: false, add: false, show: false });
    resetForm();
  };

  const getCollegeLogo = async (fileName) => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + `/api/collegeLogo/${fileName}`);
      if (response.ok) {
        setCollegeLogoSrc(response.url);
        console.log(response);
      } else {
        throw new Error("File not found");
      }
    } catch (err) {
      setCollegeLogoSrc("");
    }
  };

  const getUniversityLogo = async (fileName) => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + `/api/universityLogo/${fileName}`);
      if (response.ok) {
        setUniversityLogoSrc(response.url);
      } else {
        throw new Error("File not found");
      }
    } catch (err) {
      setUniversityLogoSrc("");
    }
  };
  const resetForm = () => {
    setDates({
      startTime: new Date(),
      endTime: new Date(),
    });
    setFormData({
      id: "",
      collegeCode: "",
      collegeAddress: "",
      collegeName: "",
      universityName: "",
      conductionMonth: "",
    });
  };

  useEffect(() => {
    if (userData.role === "superadmin" && data.length === 0) {
      getHeaderData();
    }
    if (userData.role === "admin" && data.length === 0) {
      getHeaderDataByAdmin();
    }
  }, [data, userData]);

  // Set Default
  const onDefaultHandler = async (id) => {
    try {
      const response1 = await fetch(process.env.REACT_APP_BACKENDURL + `/api/header/updateDefault`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultHeader: 0 }),
      });

      if (!response1.ok) {
        const resData1 = await response1.json();
        throw new Error(resData1.message || "Failed to update all entries to defined: 0");
      }

      const response2 = await fetch(process.env.REACT_APP_BACKENDURL + `/api/header/updateDefault/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultHeader: 1 }),
      });

      const resData2 = await response2.json();

      if (response2.ok) {
        successToast("Marked As Default");
      } else {
        errorToast(resData2.message);
      }
    } catch (err) {
      console.log(err);
      errorToast(err.message || "An error occurred while updating defined");
    }
  };

  const getHeaderData = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/header");
      const resData = await response.json();
      if (response.ok) {
        setData(resData.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const id = userData.id;
  const getHeaderDataByAdmin = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/header/byAdmin/" + id);
      const resData = await response.json();
      if (response.ok) {
        setData(resData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (onSearchText !== "") {
      const filteredObject = data?.filter((item) => {
        return (
          item.exam_year.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.exam_month.toLowerCase().includes(onSearchText.toLowerCase())
        );
      });
      setData([...filteredObject]);
    } else {
      setData([...data]);
    }
  }, [onSearchText, setData]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggle = () => setonSearch(!onSearch);

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
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleDropChange = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      ...file,
      preview: URL.createObjectURL(file),
      newName: file.name, // Customize as needed
    }));
    setFiles(newFiles);
    setSheetData(acceptedFiles[0]);
  };

  const handleDropChange2 = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      ...file,
      preview: URL.createObjectURL(file),
      newName: file.name, // Customize as needed
    }));
    setFiles2(newFiles);
    setSheetData2(acceptedFiles[0]);
  };
  const handleDropChange3 = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      ...file,
      preview: URL.createObjectURL(file),
      newName: file.name, // Customize as needed
    }));
    setFiles3(newFiles);
    setSheetData3(acceptedFiles[0]);
  };
  const handleDropChange4 = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      ...file,
      preview: URL.createObjectURL(file),
      newName: file.name, // Customize as needed
    }));
    setFiles4(newFiles);
    setSheetData4(acceptedFiles[0]);
  };

  const onEditSubmit = async () => {
    const newData = new FormData();
    newData.append("collegeLogo", sheetData3);
    newData.append("universityLogo", sheetData4);
    newData.append("collegeCode", formData.collegeCode);
    newData.append("collegeName", formData.collegeName);
    newData.append("collegeAddress", formData.collegeAddress);
    newData.append("universityName", formData.universityName);
    newData.append("conductionMonth", formData.conductionMonth);

    console.log(newData);
    await fetch(process.env.REACT_APP_BACKENDURL + "/api/header/" + formData.id, {
      method: "PATCH",
      body: newData,
    })
      .then((response) => {
        console.log(response.status);
        response.json();
        if (response.status === 200) {
          successToast("Updated Successfully");
          setModal({ edit: false });
          getHeaderData();
        } else {
          errorToast(data);
        }
      })

      .catch((error) => {
        errorToast(error);
      });
  };

  const Created_by = userData.id;
  function generateRandomId(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";

    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const randomNumber = Math.floor(Math.random() * 100);

    return randomString + randomNumber;
  }

  const AddSubmitHandler = async () => {
    const id = generateRandomId(5);
    const formData = new FormData();
    formData.append("collegeLogo", sheetData);
    formData.append("universityLogo", sheetData2);
    formData.append("ov_headers_id", id);
    formData.append("collegeCode", inputCollegeCode);
    formData.append("collegeName", inputCollegeName);
    formData.append("collegeAddress", inputCollegeAddress);
    formData.append("universityName", inputUniversityName);
    formData.append("conductionMonth", conductionMonth);
    formData.append("created_by", Created_by);

    await fetch(process.env.REACT_APP_BACKENDURL + "/api/header", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        console.log(response.status);
        response.json();
        if (response.status === 200) {
          successToast("File Successfully Uploaded");
          setModal({ edit: false });
          getHeaderData();
        } else {
          errorToast(data);
        }
      })

      .catch((error) => {
        errorToast(error);
      });
  };

  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item.ov_headers_id === id) {
        setFormData({
          id: item.ov_headers_id,
          collegeCode: item.collegeCode,
          collegeName: item.collegeName,
          collegeAddress: item.collegeAddress,
          universityName: item.universityName,
          conductionMonth: item.conductionMonth,
        });

        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  const { errors, register, handleSubmit } = useForm();
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);

  const currentTimeFrom = new Date();

  // Check if formData.valuation_duration_from is a non-empty string
  if (typeof formData?.valuation_duration_from === "string" && formData.valuation_duration_from.trim() !== "") {
    // Split the time string into hours, minutes, and seconds
    const [hours, minutes, seconds] = formData.valuation_duration_from.split(":");

    // Ensure hours, minutes, and seconds are valid numbers
    if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
      // Set the time on the current date
      currentTimeFrom.setHours(Number(hours));
      currentTimeFrom.setMinutes(Number(minutes));
      currentTimeFrom.setSeconds(Number(seconds));
    } else {
      console.error("Invalid time format:", formData.valuation_duration_from);
    }
  } else {
  }

  const [categoryData, setCatogoryData] = useState([]);
  useEffect(() => {
    if (categoryData.length === 0) {
      getCategoryData();
    }
  }, []);

  const getCategoryData = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/category");
      const resData = await response.json();
      if (response.ok) {
        setCatogoryData(resData.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const categorySelect = categoryData.map((item) => ({
    key: item.ov_category_type_id,
    value: item.category_type,
    label: item.category_type,
  }));
  const contentRef = useRef();

  const handleExport = () => {
    const input = contentRef.current;
    html2canvas(input, {
      scale: 2,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      const marginTop = 20;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentHeight = pdfHeight + marginTop;

      let position = 0;
      let remainingHeight = contentHeight;

      while (remainingHeight > 0) {
        if (position !== 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, "PNG", 0, marginTop - position * pageHeight, pdfWidth, pdfHeight);
        position++;
        remainingHeight -= pageHeight;
      }

      pdf.save("SKIT Header Settings.pdf");
      setItemPerPage(10);
    });
  };

  const deleteToggleModal = () => {
    setDeleteModal(!deleteModal);
  };

  const onDeleteClick = (id) => {
    data.forEach((item) => {
      if (item.ov_headers_id === id) {
        deleteToggleModal();
        setDeleteId(id);
      }
    });
  };

  const deleteHandler = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/header/" + deleteId, {
        method: "DELETE",
      });
      if (response.ok) {
        if (userData.role === "superadmin") {
          getHeaderData();
        }
        if (userData.role === "admin") {
          getHeaderDataByAdmin();
        }
        deleteToggleModal();
        successToast("Deleted Successfully");
      } else {
        warningToast(resData.message);
      }
    } catch (err) {
      errorToast(err);
    }
  };

  return (
    <React.Fragment>
      <Head title="Headers Settings"></Head>

      <BlockHead size="sm">
        <BlockBetween>
          <BlockHeadContent></BlockHeadContent>
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
                        setItemPerPage(data?.length);
                        setTimeout(() => {
                          handleExport();
                        }, 200);
                      }}
                      className="btn btn-white btn-outline-light"
                    >
                      <Icon name="download-cloud"></Icon>
                      <span>Export</span>
                    </a>
                  </li>
                  <Link to={process.env.PUBLIC_URL + "/headers-print"} target="_blank">
                    <Button size="lg" color="primary" outline className=" mr-3 btn-icon btn-white btn-dim">
                      <Icon name="printer-fill"></Icon>
                    </Button>
                  </Link>
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
                <div className="form-inline flex-nowrap gx-3"></div>
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
                    }}
                  >
                    <Icon name="arrow-left"></Icon>
                  </Button>
                  <input
                    type="text"
                    className="border-transparent form-focus-none form-control"
                    placeholder="Search by Board Name or Board Fullname"
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
          <div ref={contentRef}>
            <DataTableBody compact>
              <DataTableHead>
                <DataTableRow>
                  <span className="sub-text"></span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Data 1
                  </span>
                </DataTableRow>
                <DataTableRow size="sm">
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Data 2
                  </span>
                </DataTableRow>
                <DataTableRow size="sm">
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    Data 3
                  </span>
                </DataTableRow>
                <DataTableRow size="sm">
                  <span style={{ fontWeight: "bold" }} className="sub-text">
                    View
                  </span>
                </DataTableRow>
                {/* <DataTableRow size="sm">
                  <span style={{fontWeight:"bold"}} className="sub-text">Script</span>
                </DataTableRow> */}
                {/* <DataTableRow size="md">
                  <span className="sub-text">Created By</span>
                </DataTableRow>

                <DataTableRow size="lg">
                  <span className="sub-text">Created At</span>
                </DataTableRow> */}
                {/* <DataTableRow>
                  <span className="sub-text">Status</span>
                </DataTableRow> */}
              </DataTableHead>

              {/*Head*/}

              {currentItems.length > 0
                ? currentItems.map((item) => {
                    return (
                      <DataTableItem key={item.ov_headers_id}>
                        <DataTableRow>
                          <Link to={`${process.env.PUBLIC_URL}/user-details-regular/${item.ov_vals_id}`}>
                            <div className="user-card">
                              <div className="user-info">
                                <span className="tb-lead"></span>
                              </div>
                            </div>
                          </Link>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span>{item.collegeCode}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{item.collegeName.slice(0, 20)}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{item.conductionMonth}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>
                            <Button
                              onClick={() => {
                                setModal({ show: true });
                                getCollegeLogo(item.collegeLogo);
                                setCollegeAddress(item);
                                getUniversityLogo(item.universityLogo);
                              }}
                              className="submit"
                              style={{
                                backgroundColor: "#206296",
                                color: "white",
                                height: "25px",
                                marginLeft: "-20px",
                              }}
                            >
                              View
                            </Button>
                          </span>
                        </DataTableRow>
                        <Modal
                          isOpen={modal.show}
                          toggle={() => setModal({ edit: false })}
                          className="modal-dialog-centered"
                          size="lg"
                        >
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
                              <div
                                style={{
                                  backgroundColor: "white",
                                  padding: "20px",
                                  width: "100%",
                                  height: "130px",
                                  display: "flex",
                                }}
                              >
                                <div style={{ padding: "10px", height: "95%", border: "1px solid black" }}>
                                  <img src={universityLogoSrc} style={{ width: "90px" }}></img>
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    margin: "0px 2px",
                                    width: "100%",
                                    height: "95%",
                                    border: "1px solid black",
                                    textAlign: "center",
                                    padding: "10px",
                                  }}
                                >
                                  <span>{collegeAddress.collegeName}</span>
                                  <br></br>
                                  <span>{collegeAddress.collegeAddress}</span>
                                  <br />
                                  <span>{collegeAddress.universityName}</span>
                                </div>
                                <div style={{ padding: "10px", height: "95%", border: "1px solid black" }}>
                                  <img src={collegeLogoSrc} style={{ width: "90px" }}></img>
                                </div>
                              </div>
                            </div>
                          </ModalBody>
                        </Modal>
                        {/* <DataTableRow size="sm">
                        <span>{item.valuation_max_script}</span>
                      </DataTableRow> */}
                        {/* <DataTableRow size="md">
                        <span>{item.created_by}</span>
                      </DataTableRow>
                      <DataTableRow size="lg">
                        <span>{item.created_at?.slice(0,10)}</span>
                      </DataTableRow> */}
                        {/* <DataTableRow>
                        <span
                          className={`tb-status text-${item.status === "Active" ? "success" : item.status === "Pending" ? "warning" : "danger"
                            }`}
                        >
                          {item.status}
                        </span>
                      </DataTableRow> */}
                        <DataTableRow className="nk-tb-col-tools">
                          <ul className="nk-tb-actions gx-1">
                            <li className="nk-tb-action-hidden" onClick={() => onEditClick(item.ov_headers_id)}>
                              <TooltipComponent
                                tag="a"
                                containerClassName="btn btn-trigger btn-icon"
                                id={"edit" + item.ov_headers_id}
                                icon="edit-alt-fill"
                                direction="top"
                                text="Edit"
                              />
                            </li>
                            {item.status !== "Deactivate" && (
                              <React.Fragment>
                                <li className="nk-tb-action-hidden"></li>
                              </React.Fragment>
                            )}
                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                  <Icon name="more-h"></Icon>
                                </DropdownToggle>
                                <DropdownMenu right>
                                  <ul className="link-list-opt no-bdr">
                                    <li onClick={() => onEditClick(item.ov_headers_id)}>
                                      <DropdownItem tag="a" href="#edit">
                                        <Icon name="edit"></Icon>
                                        <span>Edit</span>
                                      </DropdownItem>
                                    </li>
                                    <li onClick={() => onDefaultHandler(item.ov_headers_id)}>
                                      <DropdownItem tag="a" href="#edit">
                                        <Icon name="done"></Icon>
                                        <span>Set Default</span>
                                      </DropdownItem>
                                    </li>
                                    {userData.role === "superadmin" && (
                                      <li onClick={() => onDeleteClick(item.ov_headers_id)}>
                                        <DropdownItem tag="a" href="#edit">
                                          <Icon name="trash"></Icon>
                                          <span>Delete</span>
                                        </DropdownItem>
                                      </li>
                                    )}
                                  </ul>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </li>
                          </ul>
                          <Modal
                            isOpen={deleteModal}
                            toggle={deleteToggleModal}
                            className="modal-dialog-centered"
                            size="xs"
                          >
                            <ModalBody>
                              <a
                                href="#cancel"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  deleteToggleModal();
                                }}
                                className="close"
                              ></a>
                              <div className="confirmation-container">
                                <h5 className="confirmation-message">Are You Sure to Delete</h5>
                                <div className="confirmation-buttons">
                                  <button className="confirm-button" onClick={deleteHandler}>
                                    Confirm
                                  </button>
                                  <button className="cancel-button" onClick={deleteToggleModal}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </ModalBody>
                          </Modal>
                        </DataTableRow>
                      </DataTableItem>
                    );
                  })
                : null}
            </DataTableBody>
          </div>
          <div className="card-inner">
            {currentItems.length > 0 ? (
              <PaginationComponent
                itemPerPage={itemPerPage}
                totalItems={data.length}
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
            <h5 className="title">Add Header</h5>
            <div className="mt-4">
              <Form className="row gy-4" onSubmit={handleSubmit(AddSubmitHandler)}>
                <Col md="6">
                  <FormGroup>
                    <label className="form-label">College Code</label>
                    <input
                      className="form-control"
                      type="number"
                      name="name"
                      placeholder="Enter College Code"
                      ref={register({ required: "This field is required" })}
                      onChange={(e) => setInputCollegeCode(e.target.value)}
                    />
                    {errors.name && <span className="invalid">{errors.name.message}</span>}
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label className="form-label">University Name</label>
                    <input
                      className="form-control"
                      type="text"
                      name="name"
                      placeholder="Enter University Name"
                      ref={register({ required: "This field is required" })}
                      onChange={(e) => setUniversityName(e.target.value)}
                    />
                    {errors.name && <span className="invalid">{errors.name.message}</span>}
                  </FormGroup>
                </Col>

                <Col md="6">
                  <FormGroup>
                    <label className="form-label">College Name</label>
                    <input
                      className="form-control"
                      type="text"
                      name="name"
                      placeholder="Enter College Name"
                      ref={register({ required: "This field is required" })}
                      onChange={(e) => setInputCollegeName(e.target.value)}
                    />
                    {errors.name && <span className="invalid">{errors.name.message}</span>}
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label className="form-label">Conduction Month</label>
                    <RSelect options={categorySelect} onChange={(e) => setConductionMonth(e.value)}></RSelect>
                    {errors.name && <span className="invalid">{errors.name.message}</span>}
                  </FormGroup>
                </Col>

                <Col md="12">
                  <FormGroup>
                    <label className="form-label">College Address</label>
                    <input
                      className="form-control"
                      type="text"
                      name="name"
                      placeholder="Enter College Address"
                      ref={register({ required: "This field is required" })}
                      onChange={(e) => setInputCollegeAddress(e.target.value)}
                    />
                    {errors.name && <span className="invalid">{errors.name.message}</span>}
                  </FormGroup>
                </Col>
                <Col Col md="6">
                  <FormGroup>
                    <label className="form-label">College Logo</label>
                    <Dropzone
                      accept={[".jpg", ".png"]}
                      multiple={false}
                      onDrop={(acceptedFiles) => handleDropChange(acceptedFiles, setFiles)}
                      maxSize={4194304}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section>
                          <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                            <input {...getInputProps()} />
                            {files.length === 0 && (
                              <div className="dz-message">
                                <span className="dz-message-text">Drag and drop file</span>
                                <span className="dz-message-or">or</span>
                                <Button color="primary">SELECT</Button>
                              </div>
                            )}
                            {files.map((file) => (
                              <div
                                key={file.name}
                                className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                              >
                                <div className="dz-image">
                                  {/* <img src={file.preview} alt="preview" /> */}
                                  <iframe
                                    src={file.preview}
                                    name="iframe_a"
                                    height="600px"
                                    width="100%"
                                    title="Iframe Example"
                                  ></iframe>
                                </div>
                                <div style={{ marginTop: "20px" }}>
                                  <span>{file.newName}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </Dropzone>
                  </FormGroup>
                </Col>

                <Col Col md="6">
                  <FormGroup>
                    <label className="form-label">University Logo</label>
                    <Dropzone
                      accept={[".jpg", ".png"]}
                      multiple={false}
                      onDrop={(acceptedFiles) => handleDropChange2(acceptedFiles, setFiles2)}
                      maxSize={4194304}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section>
                          <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                            <input {...getInputProps()} />
                            {files2.length === 0 && (
                              <div className="dz-message">
                                <span className="dz-message-text">Drag and drop file</span>
                                <span className="dz-message-or">or</span>
                                <Button color="primary">SELECT</Button>
                              </div>
                            )}
                            {files2.map((file) => (
                              <div
                                key={file.name}
                                className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                              >
                                <div className="dz-image">
                                  {/* <img src={file.preview} alt="preview" /> */}
                                  <iframe
                                    src={file.preview}
                                    name="iframe_a"
                                    height="600px"
                                    width="100%"
                                    title="Iframe Example"
                                  ></iframe>
                                </div>
                                <div style={{ marginTop: "20px" }}>
                                  <span>{file.newName}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </Dropzone>
                  </FormGroup>
                </Col>

                <Col size="12">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button color="primary" size="md" type="submit">
                        Create
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
            <h5 className="title">Update Valuation Settings</h5>
            <div className="mt-4">
              <Form className="row gy-4" onSubmit={handleSubmit(onEditSubmit)}>
                <Col md="6">
                  <FormGroup>
                    <label className="form-label">College Code</label>
                    <input
                      className="form-control"
                      type="text"
                      name="board"
                      defaultValue={formData.collegeCode}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          collegeCode: e.target.value,
                        });
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label className="form-label">University Name</label>
                    <input
                      className="form-control"
                      type="text"
                      name="board"
                      defaultValue={formData.universityName}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          universityName: e.target.value,
                        });
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label className="form-label">College Name</label>
                    <input
                      className="form-control"
                      type="text"
                      name="board"
                      defaultValue={formData.collegeName}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          collegeName: e.target.value,
                        });
                      }}
                    />
                  </FormGroup>
                </Col>

                <Col md="6">
                  <FormGroup>
                    <label className="form-label">Conduction Month</label>
                    <RSelect
                      options={categorySelect}
                      defaultValue={{
                        value: formData.conductionMonth,
                        label: formData.conductionMonth,
                      }}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          conductionMonth: e.value,
                        });
                      }}
                    ></RSelect>
                  </FormGroup>
                </Col>
                <Col md="12">
                  <FormGroup>
                    <label className="form-label">College Address</label>
                    <input
                      className="form-control"
                      type="text"
                      name="board"
                      defaultValue={formData.collegeAddress}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          collegeAddress: e.target.value,
                        });
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col Col md="6">
                  <FormGroup>
                    <label className="form-label">College Logo</label>
                    <Dropzone
                      accept={[".jpg", ".png"]}
                      multiple={false}
                      onDrop={(acceptedFiles) => handleDropChange3(acceptedFiles, setFiles2)}
                      maxSize={4194304}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section>
                          <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                            <input {...getInputProps()} />
                            {files3.length === 0 && (
                              <div className="dz-message">
                                <span className="dz-message-text">Drag and drop file</span>
                                <span className="dz-message-or">or</span>
                                <Button color="primary">SELECT</Button>
                              </div>
                            )}
                            {files3.map((file) => (
                              <div
                                key={file.name}
                                className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                              >
                                <div className="dz-image">
                                  {/* <img src={file.preview} alt="preview" /> */}
                                  <iframe
                                    src={file.preview}
                                    name="iframe_a"
                                    height="600px"
                                    width="100%"
                                    title="Iframe Example"
                                  ></iframe>
                                </div>
                                <div style={{ marginTop: "20px" }}>
                                  <span>{file.newName}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </Dropzone>
                  </FormGroup>
                </Col>
                <Col Col md="6">
                  <FormGroup>
                    <label className="form-label">University Logo</label>
                    <Dropzone
                      accept={[".jpg", ".png"]}
                      multiple={false}
                      onDrop={(acceptedFiles) => handleDropChange4(acceptedFiles, setFiles2)}
                      maxSize={4194304}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section>
                          <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                            <input {...getInputProps()} />
                            {files4.length === 0 && (
                              <div className="dz-message">
                                <span className="dz-message-text">Drag and drop file</span>
                                <span className="dz-message-or">or</span>
                                <Button color="primary">SELECT</Button>
                              </div>
                            )}
                            {files4.map((file) => (
                              <div
                                key={file.name}
                                className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                              >
                                <div className="dz-image">
                                  {/* <img src={file.preview} alt="preview" /> */}
                                  <iframe
                                    src={file.preview}
                                    name="iframe_a"
                                    height="600px"
                                    width="100%"
                                    title="Iframe Example"
                                  ></iframe>
                                </div>
                                <div style={{ marginTop: "20px" }}>
                                  <span>{file.newName}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </Dropzone>
                  </FormGroup>
                </Col>
                <Col size="12">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button color="primary" size="md" type="submit">
                        Update
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

      <ToastContainer
        position={"bottom-right"}
        closeOnClick={true}
        autoClose={2000}
        hideProgressBar={true}
        pauseOnHover={true}
        draggable={true}
        progress={false}
        closeButton=<CloseButton />
      />
    </React.Fragment>
  );
};
export default HeaderSettings;
