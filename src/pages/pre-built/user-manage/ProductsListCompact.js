import React, { useState, useEffect, useContext } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { findUpper } from "../../../utils/Utils";
import { userData, filterRole, filterStatus } from "./UserData";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";
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
  BlockContent,
} from "../../../components/Component";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { UserContext } from "./UserContext";
import { bulkActionOptions } from "../../../utils/Utils";
import axios from "axios";
import "./Confirmation.css";
import Dropzone from "react-dropzone";
import * as XLSX from "xlsx";
import imageCompression from "browser-image-compression";
import DataContext from "../../../utils/DataContext";
import ProductCard from "../products/ProductCard";
const ProductsListCompact = () => {
  const [data, setData] = useState([]);
  const { userData } = useContext(DataContext);
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
    productName: "",
    productCode: "",
    brand: "",
    value: "",
    boxPacking: false,
    ptr1: "",
    ptr2: "",
    ptr3: "",
    notes: "",
    img: "",
  });

  const [actionText, setActionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [sort, setSortState] = useState("");
  const [assignModal, setAssignModal] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [uploadModal, setUploadModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [files2, setFiles2] = useState([]);
  const [sheetData, setSheetData] = useState(null);
  const [editedValue, setEditedValue] = useState(null);
  const [editedStock, setEditedStock] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const [showTextBox, setShowTextBox] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGridView, setIsGridView] = useState(false);

  useEffect(() => {
    if (data?.length === 0) {
      fetchProductData();
    }
  }, [data]);

  // fetch users list
const fetchProductData = async () => {
  try {

    const token = localStorage.getItem("accessToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (!token || !sessionToken) {
      console.log("User not authenticated");
      setData([]);
      return;
    }

    const response = await axios.get(
      `${process.env.REACT_APP_BACKENDURL}/api/product`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      }
    );

    if (Array.isArray(response.data)) {
      setData([...response.data].reverse());
    } else {
      console.warn("Product data format unexpected:", response.data);
      setData([]);
    }

  } catch (err) {

    console.log("PRODUCT FETCH ERROR:", err);

    if (err.response) {

      if (err.response.status === 401) {

        console.log(
          err.response.data?.message ||
          "Session expired. Please login again"
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");

        window.location.href = "/login";

      }

    }

    setData([]);

  }
};

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

  useEffect(() => {
    if (onSearchText !== "") {
      const filteredObject = data.filter((item) => {
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

  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };



  const resetForm = () => {
    setFormData({
      productName: "",
      productCode: "",
      brand: "",
      value: "",
      boxPacking: false,
      ptr1: "",
      ptr2: "",
      ptr3: "",
      notes: "",
      img: "",
    });

    setFiles2([]);
  };

  const onFormCancel = () => {
    setModal({ edit: false, add: false });
    resetForm();
    setUploadedFile(null);
    setFiles2([]);
    setFiles([]);
  };

  const onFormSubmit = async () => {
    const payload = {
      productName: formData.productName,
      productCode: formData.productCode,
      brand: formData.brand,
      value: Number(formData.value),
      boxPacking: formData.boxPacking,
      ptr1: formData.ptr1 ? Number(formData.ptr1) : undefined,
      ptr2: formData.ptr2 ? Number(formData.ptr2) : undefined,
      ptr3: formData.ptr3 ? Number(formData.ptr3) : undefined,
      notes: formData.notes,
      img: formData.img,
      createdBy: userData._id,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/product`, payload);

      if (response.status === 201) {
        successToast("Product Created Successfully");
        onFormCancel();
        fetchProductData();
      }
    } catch (error) {
      errorToast(error.response?.data?.message || "Product creation failed");
    }
  };

  const onEditSubmit = async () => {
    const payload = {
      productName: formData.productName || undefined,
      productCode: formData.productCode || undefined,
      brand: formData.brand || undefined,
      value: formData.value ? Number(formData.value) : undefined,
      boxPacking: formData.boxPacking,
      ptr1: formData.ptr1 ? Number(formData.ptr1) : undefined,
      ptr2: formData.ptr2 ? Number(formData.ptr2) : undefined,
      ptr3: formData.ptr3 ? Number(formData.ptr3) : undefined,
      notes: formData.notes || undefined,
      img: formData.img || undefined,
    };

    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKENDURL}/api/product/${editId}`, payload);

      if (response.status === 200) {
        successToast("Product Updated Successfully");
        fetchProductData();
        onFormCancel();
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Something Went Wrong");
    }
  };

  const onEditClick = (id) => {
    const product = data.find((item) => item._id === id);
    if (!product) return;

    setFormData({
      productName: product.productName,
      productCode: product.productCode,
      brand: product.brand,
      value: product.value,
      boxPacking: product.boxPacking || false,
      ptr1: product.ptr1 || "",
      ptr2: product.ptr2 || "",
      ptr3: product.ptr3 || "",
      notes: product.notes || "",
      img: product.img || "",
    });

    setEditedId(id);
    setModal({ edit: true, add: false });
  };

  const suspendUser = (id) => {
    let newData = data;
    let index = newData.findIndex((item) => item._id === id);
    newData[index].status = "Suspend";
    setData([...newData]);
  };

  const toggleAssignModal = (item) => {
    setAssignModal(!assignModal);
    setSelectedData(item);
  };

  const toggleUploadModal = () => {
    setUploadModal(!uploadModal);
  };

  const onDeleteSubmit = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/product/" + selectedData._id, {
        method: "DELETE",
      });
      const resData = await response.json();
      if (!response.ok) {
        errorToast(resData.message);
      } else {
        successToast(resData.message);
        setAssignModal(!assignModal);
        fetchProductData();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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

  const selectorCheck = (e) => {
    let newData;
    newData = data.map((item) => {
      item.checked = e.currentTarget.checked;
      return item;
    });
    setData([...newData]);
  };

  const toggle = () => setonSearch(!onSearch);

  const { errors, register, handleSubmit } = useForm();

  const productRow = [
    { value: "A", label: "A - Row" },
    { value: "B", label: "B - Row" },
    { value: "C", label: "C - Row" },
    { value: "D", label: "D - Row" },
    { value: "E", label: "E - Row" },
    { value: "F", label: "F - Row" },
  ];

  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.05,
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

  const handleDropChange2 = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const compressedFile = await compressImage(file);
      const newFile = {
        name: compressedFile.name,
        type: compressedFile.type,
        file: compressedFile,
        preview: URL.createObjectURL(compressedFile),
      };
      (setFiles2([newFile]), setUploadedFile(newFile));
    } catch (error) {
      console.error("Error compressing file:", error);
    }
  };

  const handleDropChange = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (worksheet) {
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const filePreview = {
            name: file.name,
            newName: file.name.replace(/\.[^/.]+$/, "") + "_preview.xlsx",
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
    e.preventDefault();
    if (!sheetData) {
      warningToast("No file data to upload.");
      return;
    }

    fetch(process.env.REACT_APP_BACKENDURL + "/api/product/importProducts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: sheetData }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        successToast("Data sent successfully:", responseData);
        toggleUploadModal();
        fetchProductData();
      })
      .catch((error) => {
        console.error("Error sending data:", error);
      });
  };

  const handleClick = (id, value) => {
    setEditingId(id);
    setClickCount((prevCount) => prevCount + 1);
    if (clickCount + 1 === 2) {
      setShowTextBox(true);
    }
  };

  const handleClickStock = (id, stock) => {
    setEditingStockId(id);
    setClickCount((prevCount) => prevCount + 1);
    if (clickCount + 1 === 2) {
      setShowTextBox(true);
    }
  };

  const handleBlurOrEnter = () => {
    setShowTextBox(false);
    setClickCount(0);
    valueUpdate();
  };
  const handleBlurOrEnterStock = () => {
    setShowTextBox(false);
    setClickCount(0);
    stockUpdate();
  };

  const valueUpdate = async () => {
    let submittedData = {
      value: editedValue,
    };

    try {
      const response = await axios.put(process.env.REACT_APP_BACKENDURL + "/api/product/" + editingId, submittedData);
      if (response.status === 200) {
        successToast("Product Updated Successfully");
        fetchProductData();
        setEditingId(null);
      }
    } catch (err) {
      errorToast("Something Went Wrong");
    }
  };

  const stockUpdate = async () => {
    let submittedData = {
      stock: editedStock,
    };

    try {
      const response = await axios.put(
        process.env.REACT_APP_BACKENDURL + "/api/product/" + editingStockId,
        submittedData,
      );
      if (response.status === 200) {
        successToast("Product Updated Successfully");
        fetchProductData();
        setEditingStockId(null);
      }
    } catch (err) {
      errorToast("Something Went Wrong");
    }
  };
  const handleChange = (e) => {
    setEditedValue(e.target.value);
  };

  const handleChangeStock = (e) => {
    setEditedStock(e.target.value);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlurOrEnter();
    }
  };

  const handleKeyDownStock = (e) => {
    if (e.key === "Enter") {
      handleBlurOrEnterStock();
    }
  };

  return (
    <React.Fragment>
      <Head title="Products List"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Products Lists
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>You have total {data?.length} Products.</p>
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
                      <Button color="primary" className="btn-icon" onClick={toggleUploadModal}>
                        <Icon name="upload"></Icon>
                      </Button>
                    </li>
                    <li className="nk-block-tools-opt">
                      <Button color="primary" className="btn-icon" onClick={() => setModal({ add: true })}>
                        <Icon name="plus"></Icon>
                      </Button>
                    </li>

                    <li className="nk-block-tools-opt">
                      <Button
                        color={isGridView ? "dark" : ""}
                        className="btn-icon mr-1"
                        onClick={() => {
                          setIsGridView(false);
                          setItemPerPage(10);
                        }}
                      >
                        <Icon name="list"></Icon>
                      </Button>
                      <Button
                        color={isGridView ? "" : "dark"}
                        className="btn-icon"
                        onClick={() => {
                          setIsGridView(true);
                          setItemPerPage(12);
                        }}
                      >
                        <Icon name="grid"></Icon>
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
                            {/* <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                                  <div className="dot dot-primary"></div>
                                  <Icon name="filter-alt"></Icon>
                                </DropdownToggle>
                                <DropdownMenu
                                  right
                                  className="filter-wg dropdown-menu-xl"
                                  style={{ overflow: "visible" }}
                                >
                                  <div className="dropdown-head">
                                    <span className="sub-title dropdown-title">Filter Users</span>
                                    <div className="dropdown">
                                      <DropdownItem
                                        href="#more"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                        }}
                                        className="btn btn-sm btn-icon"
                                      >
                                        <Icon name="more-h"></Icon>
                                      </DropdownItem>
                                    </div>
                                  </div>
                                  <div className="dropdown-body dropdown-body-rg">
                                    <Row className="gx-6 gy-3">
                                      <Col size="6">
                                        <div className="custom-control custom-control-sm custom-checkbox">
                                          <input
                                            type="checkbox"
                                            className="custom-control-input form-control"
                                            id="hasBalance"
                                          />
                                          <label className="custom-control-label" htmlFor="hasBalance">
                                            {" "}
                                            Have Balance
                                          </label>
                                        </div>
                                      </Col>
                                      <Col size="6">
                                        <div className="custom-control custom-control-sm custom-checkbox">
                                          <input
                                            type="checkbox"
                                            className="custom-control-input form-control"
                                            id="hasKYC"
                                          />
                                          <label className="custom-control-label" htmlFor="hasKYC">
                                            {" "}
                                            KYC Verified
                                          </label>
                                        </div>
                                      </Col>
                                      <Col size="6">
                                        <FormGroup>
                                          <label className="overline-title overline-title-alt">Role</label>
                                          <RSelect options={filterRole} placeholder="Any Role" />
                                        </FormGroup>
                                      </Col>
                                      <Col size="6">
                                        <FormGroup>
                                          <label className="overline-title overline-title-alt">Status</label>
                                          <RSelect options={filterStatus} placeholder="Any Status" />
                                        </FormGroup>
                                      </Col>
                                      <Col size="12">
                                        <FormGroup className="form-group">
                                          <Button color="secondary">Filter</Button>
                                        </FormGroup>
                                      </Col>
                                    </Row>
                                  </div>
                                  <div className="dropdown-foot between">
                                    <a
                                      href="#reset"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                      }}
                                      className="clickable"
                                    >
                                      Reset Filter
                                    </a>
                                    <a
                                      href="#save"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                      }}
                                    >
                                      Save Filter
                                    </a>
                                  </div>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </li> */}
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

            {isGridView ? (
              <BlockContent>
                <Content>
                  <Row className="row g-gs">
                    {currentItems.map((item, idx) => (
                      <Col lg="3" sm="4" md="6" key={idx}>
                        <div className="product-card">
                          <div className="product-image-wrapper">
                            {item.file ? (
                              <img className="product-image" src={item.file} alt={item.productName} />
                            ) : (
                              <span className="no-preview">No preview available</span>
                            )}
                            {/* Hover Icon */}
                            <div className="hover-icon" onClick={() => onEditClick(item._id, item.file)}>
                              <TooltipComponent
                                tag="a"
                                containerClassName="btn btn-trigger btn-icon"
                                id={"edit" + item._id}
                                icon="edit-alt-fill"
                                text="Edit"
                              />
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span className="product-name">{item.productName}</span>
                            <span
                              style={{ backgroundColor: "#605678", color: "white", borderRadius: "8px" }}
                              class="badge badge-md mt-1"
                            >
                              Rs. {item.value}
                            </span>
                          </div>
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
                      transition:
                        transform 0.3s ease,
                        box-shadow 0.3s ease;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                      position: relative;
                      overflow: hidden;
                    }

                    .product-card:hover {
                      transform: scale(1.05);
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    }

                    .product-image-wrapper {
                      width: 100%;
                      height: 200px; /* Fixed height for consistent size */
                      display: flex;
                      position: relative;
                      overflow: hidden;
                      border-radius: 8px;
                      background: #f9f9f9; /* Optional background color for empty space */
                    }

                    .product-image {
                      width: 100%;
                      height: 100%;
                      object-fit: cover; /* Ensures the image fills the box while maintaining aspect ratio */
                      transition: filter 0.3s ease;
                    }

                    .product-card:hover .product-image {
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
                      font-size: 0.9rem;
                      font-weight: 500;
                      color: #999;
                      text-align: center;
                    }

                    .product-name {
                      font-size: 1rem;
                      font-weight: 600;
                      color: #333;
                      display: block;
                      margin-top: 12px;
                    }

                    @media (max-width: 768px) {
                      .product-card {
                        margin-bottom: 16px;
                      }
                    }
                  `}</style>
                </Content>
              </BlockContent>
            ) : (
              <DataTableBody compact>
                <DataTableHead>
                  <DataTableRow className="nk-tb-col-check">
                    {/* <div className="custom-control custom-control-sm custom-checkbox notext">
                    <input
                      type="checkbox"
                      className="custom-control-input form-control"
                      onChange={(e) => selectorCheck(e)}
                      id="uid"
                    />
                    <label className="custom-control-label" htmlFor="uid"></label>
                  </div> */}
                  </DataTableRow>
                  <DataTableRow>
                    <span className="sub-text">Product Name</span>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span className="sub-text">Product Code</span>
                  </DataTableRow>
                  <DataTableRow size="sm">
                    <span className="sub-text">Value</span>
                  </DataTableRow>
                  <DataTableRow size="lg">
                    <span className="sub-text">Description</span>
                  </DataTableRow>
                  <DataTableRow size="">
                    <span className="sub-text">Stock</span>
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
                              text={findUpper(item.productName)}
                              image={item.file}
                            ></UserAvatar>
                          </DataTableRow>
                          <DataTableRow>
                            {/* <Link to={`${process.env.PUBLIC_URL}/user-details-regular/${item._id}`}> */}
                            <div className="user-card">
                              <div className="user-info">
                                <span className="tb-lead">{item.productName} </span>
                              </div>
                            </div>
                            {/* </Link> */}
                          </DataTableRow>
                          <DataTableRow size="md">
                            <span>{item.productCode}</span>
                          </DataTableRow>
                          <DataTableRow size="md" key={item._id}>
                            {editingId === item._id ? (
                              <input
                                style={{ width: "100px" }}
                                className="form-control"
                                type="number"
                                defaultValue={item.value}
                                onChange={handleChange}
                                onBlur={handleBlurOrEnter}
                                onKeyDown={handleKeyDown}
                                autoFocus
                              />
                            ) : (
                              <span onDoubleClick={() => handleClick(item._id, item.value)}>Rs. {item.value}</span>
                            )}
                          </DataTableRow>
                          <DataTableRow size="lg">
                            <span>{item.description}</span>
                          </DataTableRow>
                          <DataTableRow size="md" key={item._id}>
                            {editingStockId === item._id ? (
                              <input
                                style={{ width: "100px" }}
                                className="form-control"
                                type="number"
                                defaultValue={item.stock}
                                onChange={handleChangeStock}
                                onBlur={handleBlurOrEnterStock}
                                onKeyDown={handleKeyDownStock}
                                autoFocus
                              />
                            ) : (
                              <span onDoubleClick={() => handleClickStock(item._id, item.stock)}>{item.stock}</span>
                            )}
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
                              <li className="nk-tb-action-hidden" onClick={() => onEditClick(item._id, item.file)}>
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
                                      <li onClick={() => onEditClick(item._id, item.file)}>
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
              </DataTableBody>
            )}
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
              <h5 className="title">Add Product</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onFormSubmit)}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Product Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="productName"
                        placeholder="Enter product name"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        ref={register({ required: "Product name is required" })}
                      />
                      {errors.productName && <span className="invalid">{errors.productName.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Product Code</label>
                      <input
                        className="form-control"
                        type="text"
                        name="productCode"
                        placeholder="Enter product code"
                        value={formData.productCode}
                        onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                        ref={register({ required: "Product code is required" })}
                      />
                      {errors.productCode && <span className="invalid">{errors.productCode.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Brand</label>
                      <input
                        className="form-control"
                        type="text"
                        name="brand"
                        placeholder="Enter brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        ref={register({ required: "Brand is required" })}
                      />
                      {errors.brand && <span className="invalid">{errors.brand.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Value</label>
                      <input
                        className="form-control"
                        type="number"
                        name="value"
                        placeholder="Enter value"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        ref={register({ required: "Value is required" })}
                      />
                      {errors.value && <span className="invalid">{errors.value.message}</span>}
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup check>
                      <label className="form-label">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={formData.boxPacking}
                          onChange={(e) => setFormData({ ...formData, boxPacking: e.target.checked })}
                        />
                        Box Packing Available
                      </label>
                    </FormGroup>
                  </Col>

                  <Col md="4">
                    <FormGroup>
                      <label className="form-label">PTR 1</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formData.ptr1}
                        onChange={(e) => setFormData({ ...formData, ptr1: e.target.value })}
                      />
                    </FormGroup>
                  </Col>

                  <Col md="4">
                    <FormGroup>
                      <label className="form-label">PTR 2</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formData.ptr2}
                        onChange={(e) => setFormData({ ...formData, ptr2: e.target.value })}
                      />
                    </FormGroup>
                  </Col>

                  <Col md="4">
                    <FormGroup>
                      <label className="form-label">PTR 3</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formData.ptr3}
                        onChange={(e) => setFormData({ ...formData, ptr3: e.target.value })}
                      />
                    </FormGroup>
                  </Col>

                  <Col md="12">
                    <FormGroup>
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Additional notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </FormGroup>
                  </Col>

                  <Col size="12">
                    <Dropzone
                      accept={{ "image/png": [], "image/jpeg": [] }}
                      multiple={false}
                      onDrop={(acceptedFiles) => handleImageUpload(acceptedFiles)}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()} className="dropzone upload-zone small bg-lighter my-2 dz-clickable">
                          <input {...getInputProps()} />

                          {files2.length === 0 && <p>Drag & drop PNG/JPG file or click to select</p>}

                          {files2.map((file) => (
                            <div key={file.name} className="dz-preview dz-image-preview">
                              <div className="dz-image">
                                <img src={file.preview} alt="preview" />
                              </div>
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Dropzone>
                  </Col>

                  <Col size="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button color="primary" size="md" type="submit">
                          Add Product
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
              <Icon name="cross-sm" />
            </a>

            <div className="p-2">
              <h5 className="title">Update Product</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onEditSubmit)}>
                  {/* Product Name */}
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Product Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="productName"
                        placeholder="Enter product name"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        ref={register({ required: "Product Name is required" })}
                      />
                      {errors.productName && <span className="invalid">{errors.productName.message}</span>}
                    </FormGroup>
                  </Col>

                  {/* Product Code */}
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Product Code</label>
                      <input
                        className="form-control"
                        type="text"
                        name="productCode"
                        placeholder="Enter product code"
                        value={formData.productCode}
                        onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                        ref={register({ required: "Product Code is required" })}
                      />
                      {errors.productCode && <span className="invalid">{errors.productCode.message}</span>}
                    </FormGroup>
                  </Col>

                  {/* Brand */}
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Brand</label>
                      <input
                        className="form-control"
                        type="text"
                        name="brand"
                        placeholder="Enter brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        ref={register({ required: "Brand is required" })}
                      />
                      {errors.brand && <span className="invalid">{errors.brand.message}</span>}
                    </FormGroup>
                  </Col>

                  {/* Value */}
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Value</label>
                      <input
                        className="form-control"
                        type="number"
                        name="value"
                        placeholder="Enter value"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        ref={register({ required: "Value is required" })}
                      />
                      {errors.value && <span className="invalid">{errors.value.message}</span>}
                    </FormGroup>
                  </Col>

                  {/* Box Packing */}
                  <Col md="6">
                    <FormGroup check>
                      <label className="form-label">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={formData.boxPacking}
                          onChange={(e) => setFormData({ ...formData, boxPacking: e.target.checked })}
                        />
                        Box Packing Available
                      </label>
                    </FormGroup>
                  </Col>

                  {/* PTR 1 */}
                  <Col md="4">
                    <FormGroup>
                      <label className="form-label">PTR 1</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formData.ptr1}
                        onChange={(e) => setFormData({ ...formData, ptr1: e.target.value })}
                      />
                    </FormGroup>
                  </Col>

                  {/* PTR 2 */}
                  <Col md="4">
                    <FormGroup>
                      <label className="form-label">PTR 2</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formData.ptr2}
                        onChange={(e) => setFormData({ ...formData, ptr2: e.target.value })}
                      />
                    </FormGroup>
                  </Col>

                  {/* PTR 3 */}
                  <Col md="4">
                    <FormGroup>
                      <label className="form-label">PTR 3</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formData.ptr3}
                        onChange={(e) => setFormData({ ...formData, ptr3: e.target.value })}
                      />
                    </FormGroup>
                  </Col>

                  {/* Notes */}
                  <Col md="12">
                    <FormGroup>
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Additional notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </FormGroup>
                  </Col>

                  {/* Image Upload */}
                  <Col md="12">
                    <Dropzone
                      accept=".png, .jpg"
                      multiple={false}
                      onDrop={(acceptedFiles) => handleImageUpload(acceptedFiles, setFormData)}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()} className="dropzone upload-zone small bg-lighter my-2 dz-clickable">
                          <input {...getInputProps()} />
                          {!formData.img && <p>Drag & drop PNG/JPG file or click to select</p>}
                          {formData.img && (
                            <div className="dz-preview dz-image-preview">
                              <div className="dz-image">
                                <img src={formData.img} alt="preview" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Dropzone>
                  </Col>

                  {/* Submit + Cancel Buttons */}
                  <Col md="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button color="primary" size="md" type="submit">
                          Update Product
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
                  <div className="confirmation-container">
                    <h5 className="confirmation-message">
                      Are You Sure to Delete - {selectedData && selectedData.productName}
                    </h5>
                    <div className="confirmation-buttons">
                      <button className="confirm-button" onClick={onDeleteSubmit}>
                        Confirm
                      </button>
                      <button className="cancel-button" onClick={toggleAssignModal}>
                        Cancel
                      </button>
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
                setFiles([]);
                toggleUploadModal();
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Add Products</h5>

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
                          <div {...getRootProps()} className="dropzone upload-zone small bg-lighter my-2 dz-clickable">
                            <input {...getInputProps()} />
                            {files.length === 0 && <p>Drag 'n' drop XLSX, XLS File here, or click to select files</p>}
                            {files.map((file) => (
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
                          Import
                        </Button>
                      </li>
                      <li>
                        <a
                          href="#cancel"
                          onClick={(ev) => {
                            ev.preventDefault();
                            toggleUploadModal();
                            setFiles([]);
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
      </Content>
    </React.Fragment>
  );
};
export default ProductsListCompact;
