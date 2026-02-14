import React, { useState, useEffect, useContext, useRef } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { findUpper } from "../../../utils/Utils";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";

import { FormGroup, UncontrolledDropdown, Modal, ModalBody, DropdownItem, Form } from "reactstrap";
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
import "./Confirmation.css";
import Dropzone from "react-dropzone";
import * as XLSX from "xlsx";
import imageCompression from "browser-image-compression";
import DataContext from "../../../utils/DataContext";
import CreatableSelect from "react-select/creatable";

const ProductsListCompact = () => {
  const [data, setData] = useState([]);
  const [brands, setBrands] = useState([]);
  const { userData } = useContext(DataContext);
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(false);
  const [onSearchText, setSearchText] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [addLoading, setAddLoading] = useState(false);
const [editLoading, setEditLoading] = useState(false);

  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });

  const [editId, setEditedId] = useState();
  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    brand: "",
    productName: "",
    productCode: "",
    value: "",
    boxPacking: false,
    ptr1: "",
    ptr2: "",
    ptr3: "",
    notes: "",
    img: null,
  });

  const [actionText, setActionText] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

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
  const searchRef = useRef(null);

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const brandSet = new Set();
      const brandCounts = {};

      data.forEach((product) => {
        const brand = product.brand || "Unbranded";
        brandSet.add(brand);
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      });

      const brandList = Array.from(brandSet).map((brand) => ({
        name: brand,
        productCount: brandCounts[brand],
      }));

      setBrands(brandList);
    }
  }, [data]);

  const filteredProducts = data.filter((product) => {
    const matchesBrand = selectedBrand === "All Brands" || product.brand === selectedBrand;

    const searchText = onSearchText.toLowerCase();

    const matchesSearch =
      product.productName?.toLowerCase().includes(searchText) ||
      product.productCode?.toLowerCase().includes(searchText) ||
      product.brand?.toLowerCase().includes(searchText);

    return matchesBrand && matchesSearch;
  });

  const fetchProductData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/product`);

      const activeProducts = (response.data || []).filter((product) => product.isDeleted !== true);

      setData(activeProducts);

      const brandSet = new Set();
      const brandCounts = {};

      activeProducts.forEach((product) => {
        const brand = product.brand || "Unbranded";
        brandSet.add(brand);
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      });

      setBrands(
        Array.from(brandSet).map((b) => ({
          name: b,
          productCount: brandCounts[b],
        })),
      );
    } catch (err) {
      console.log("Failed to fetch products:", err);
      setData([]);
      setBrands([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setonSearch(false);
      }
    };

    if (onSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onSearch]);

  const brandOptions = brands.map((brand) => ({
    label: brand.name,
    value: brand.name,
  }));

  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  const onSelectChange = (e, id) => {
    let newData = data;
    let index = newData.findIndex((item) => item._id === id);
    newData[index].checked = e.currentTarget.checked;
    setData([...newData]);
  };

  const onActionText = (e) => {
    setActionText(e.value);
  };

  const resetForm = () => {
    setFormData({
      brand: "",
      productName: "",
      productCode: "",
      value: "",
      boxPacking: false,
      ptr1: "",
      ptr2: "",
      ptr3: "",
      notes: "",
      img: null,
    });
    setSelectedId(null);
  };

  const onFormCancel = () => {
    setModal({ edit: false, add: false });
    resetForm();
    setUploadedFile(null);
    setFiles2([]);
    setFiles([]);
  };

  const onAddSubmit = async (e) => {
    e.preventDefault();
     setAddLoading(true);
    const fd = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== "" && formData[key] !== null) {
        fd.append(key, formData[key]);
      }
    });
    fd.append("createdBy", userData._id);

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/product`, fd);

      successToast("Product added successfully");

      setModalAdd(false);
      resetForm();

      setData((prev) => {
        const updated = [...prev, res.data];

        const brandSet = new Set(updated.map((p) => p.brand || "Unbranded"));
        const brandCounts = {};
        updated.forEach((p) => {
          const b = p.brand || "Unbranded";
          brandCounts[b] = (brandCounts[b] || 0) + 1;
        });
        setBrands(Array.from(brandSet).map((b) => ({ name: b, productCount: brandCounts[b] })));

        return updated;
      });

      setCurrentPage(1);

      setSelectedBrand("All Brands");
    } catch (err) {
      console.error(err);
      errorToast("Add product failed");
    } finally {
    setAddLoading(false);
  }
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    const fd = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== "" && formData[key] !== null) {
        fd.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.put(`${process.env.REACT_APP_BACKENDURL}/api/product/${selectedId}`, fd);

      successToast("Product updated successfully");

      setModalEdit(false);
      resetForm();

      setData((prev) => {
        const updated = prev.map((p) => (p._id === selectedId ? res.data : p));

        const brandSet = new Set(updated.map((p) => p.brand || "Unbranded"));
        const brandCounts = {};
        updated.forEach((p) => {
          const b = p.brand || "Unbranded";
          brandCounts[b] = (brandCounts[b] || 0) + 1;
        });
        setBrands(Array.from(brandSet).map((b) => ({ name: b, productCount: brandCounts[b] })));

        return updated;
      });

      setCurrentPage(1);
      setSelectedBrand("All Brands");
    } catch (err) {
      console.error(err);
      errorToast("Update failed");
    }finally {
    setEditLoading(false);
  }
  };

  const onEditClick = (item) => {
    setSelectedId(item._id);
    setFormData({
      brand: item.brand,
      productName: item.productName,
      productCode: item.productCode,
      value: item.value,
      boxPacking: item.boxPacking,
      ptr1: item.ptr1,
      ptr2: item.ptr2,
      ptr3: item.ptr3,
      notes: item.notes,
      img: item.img,
    });
    setModalEdit(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      await axios.delete(`${process.env.REACT_APP_BACKENDURL}/api/product/${deleteItem._id}`);
      setData((prev) => prev.filter((p) => p._id !== deleteItem._id)); // remove from UI
      successToast("Product deleted successfully");
    } catch (err) {
      errorToast("Failed to delete product");
    } finally {
      setDeleteModal(false);
      setDeleteItem(null);
    }
  };

  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredProducts?.slice(indexOfFirstItem, indexOfLastItem);

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

  const { errors, register, handleSubmit } = useForm();

  return (
    <React.Fragment>
      <Head title="Products List"></Head>
      <Content>
        <div style={{ margin: "-15px" }}></div>

        <BlockHead size="sm">
          <BlockBetween>
            <div style={{ margin: "-385px" }}></div>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Products Management
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>
                  Total Products: {data?.length} | Showing: {filteredProducts.length}
                </p>
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
                    <li></li>
                    {/* <li className="nk-block-tools-opt">
                      <Button color="primary" className="btn-icon" onClick={toggleUploadModal}>
                        <Icon name="upload"></Icon> 
                      </Button>
                    </li> */}
                    <li className="nk-block-tools-opt">
                      <Button
                        color="primary"
                        className="btn-icon"
                        onClick={() => {
                          resetForm();
                          setModalAdd(true);
                        }}
                      >
                        <Icon name="plus" />
                      </Button>
                    </li>

                    <li className="nk-block-tools-opt">
                      <Button
                        color={isGridView ? "" : "dark"}
                        className="btn-icon mr-1"
                        onClick={() => {
                          setIsGridView(false);
                          setItemPerPage(10);
                        }}
                      >
                        <Icon name="list"></Icon>
                      </Button>
                      <Button
                        color={isGridView ? "dark" : ""}
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
          <Row>
            {/* Left Sidebar - Brand List */}
            <Col md="3" lg="2">
              <div className="card card-stretch" style={{ margin: "-6px", padding: "5px" }}>
                <div className="card-inner p-1">
                  {/* Brand Search Box */}
                  <input
                    type="text"
                    placeholder="Search Brand..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="form-control"
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.50rem 0.40rem",
                      height: "35px",
                    }}
                  />

                  <div className="brand-list" style={{ maxHeight: "100%", overflowY: "auto" }}>
                    {/* All Brands */}
                    <div
                      className={`brand-item ${selectedBrand === "All Brands" ? "active" : ""}`}
                      onClick={() => setSelectedBrand("All Brands")}
                      style={{
                        marginTop: "5px",
                        padding: "10px 5px",
                        fontSize: "1rem",
                      }}
                    >
                      <div className="brand-name">All Brands</div>
                      <div className="brand-count">{data.length}</div>
                    </div>

                    {/* Filtered Brands */}
                    {brands
                      .filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))
                      .map((brand, index) => (
                        <div
                          key={index}
                          className={`brand-item ${selectedBrand === brand.name ? "active" : ""}`}
                          onClick={() => setSelectedBrand(brand.name)}
                          style={{
                            padding: "10px 5px",
                            fontSize: "0.5rem",
                          }}
                        >
                          <div className="brand-name">{brand.name}</div>
                          <div className="brand-count">{brand.productCount}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Col>

            {/* Main Content - Product List */}
            <Col md="9" lg="10">
              <div style={{ margin: "10px", marginTop: "-16px", marginRight: "15px" }}></div>
              <DataTable className="card-stretch">
                <div className="card-inner position-relative card-tools-toggle">
                  <div className="card-title-group">
                    <div className="card-tools">
                      <div className="form-inline flex-nowrap gx-3">
                        {/* Selected Brand Display */}
                        <div className="form-wrap">
                          <div
                            className="form-control d-flex align-items-center"
                            style={{
                              minWidth: "200px",
                              background: "#f5f6fa",
                              fontWeight: 600,
                            }}
                          >
                            {selectedBrand || "All Brands"}
                          </div>
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
                              setonSearch(true);
                            }}
                            className="btn btn-icon search-toggle toggle-search"
                          >
                            <Icon name="search"></Icon>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div ref={searchRef} className={`card-search search-wrap ${onSearch ? "active" : ""}`}>
                    <div className="card-body">
                      <div className="search-content">
                        <Button
                          className="search-back btn-icon toggle-search active"
                          onClick={() => {
                            setSearchText("");
                            setonSearch(false);
                          }}
                        >
                          <Icon name="arrow-left"></Icon>
                        </Button>
                        <input
                          autoFocus={onSearch}
                          type="text"
                          className="border-transparent form-focus-none form-control"
                          placeholder="Search by Product Name, Code or Brand"
                          value={onSearchText}
                          onChange={onFilterChange}
                          onClick={(e) => e.stopPropagation()}
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
                    <Row className="g-1">
                      {currentItems.map((item, idx) => (
                        <Col lg="3" md="4" sm="6">
                          <div className="product-card">
                            <div className="product-image-wrapper">
                              {item.img ? (
                                <img className="product-image" src={item.img} alt={item.productName} />
                              ) : (
                                <span className="no-preview">No preview available</span>
                              )}
                              <div className="hover-icon" onClick={() => onEditClick(item)}>
                                <TooltipComponent
                                  tag="a"
                                  containerClassName="btn btn-trigger btn-icon"
                                  id={"edit" + item._id}
                                  icon="edit-alt-fill"
                                  text="Edit"
                                />
                              </div>
                            </div>
                            <div className="product-info">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="product-brand">{item.brand}</span>
                                <span className="badge badge-primary">Rs. {item.value}</span>
                              </div>
                              <h6 className="product-name">{item.productName}</h6>
                              <div className="product-details">
                                <small>Code: {item.productCode}</small>
                                <small>Box: {item.boxPacking ? "Yes" : "No"}</small>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </BlockContent>
                ) : (
                  <DataTableBody compact>
                    <DataTableHead>
                      <DataTableRow>
                        <span className="sub-text">Brand</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="sub-text">Product Name</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="sub-text">Code</span>
                      </DataTableRow>
                      {/* <DataTableRow size="sm">
                        <span className="sub-text">Box Packing</span>
                      </DataTableRow> */}
                      {/* <DataTableRow size="sm">
                        <span className="sub-text">PTR 1</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="sub-text">PTR 2</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="sub-text">PTR 3</span>
                      </DataTableRow> */}
                      <DataTableRow size="md">
                        <span className="sub-text">Value</span>
                      </DataTableRow>
                      {/* <DataTableRow size="sm">
                        <span className="sub-text">Stock</span>
                      </DataTableRow> */}
                      <DataTableRow size="md">
                        <span className="sub-text">Notes</span>
                      </DataTableRow>
                      <DataTableRow className="nk-tb-col-tools text-right">
                        <span className="sub-text">Actions</span>
                      </DataTableRow>
                    </DataTableHead>

                    {currentItems.length > 0 ? (
                      currentItems.map((item) => (
                        <DataTableItem key={item._id}>
                          <DataTableRow>
                            <span className="badge badge-dim badge-outline-primary">{item.brand}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <div className="user-card">
                              <UserAvatar
                                theme="primary"
                                className="xs"
                                text={findUpper(item.productName)}
                                image={item.img}
                              />
                              <div className="user-info ml-2">
                                <span className="tb-lead">{item.productName}</span>
                              </div>
                            </div>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>{item.productCode}</span>
                          </DataTableRow>
                          {/* <DataTableRow size="sm">
                            <span>{item.boxPacking}</span>
                          </DataTableRow> */}
                          {/* <DataTableRow size="sm">
                            <span>Rs. {item.ptr1}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>Rs. {item.ptr2}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>Rs. {item.ptr3}</span>
                          </DataTableRow> */}
                          <DataTableRow size="md">
                            <span className="text-primary font-weight-bold">Rs. {item.value}</span>
                          </DataTableRow>
                          {/* <DataTableRow size="sm">
                            <span className={`badge badge-${item.stock > 50 ? 'success' : item.stock > 10 ? 'warning' : 'danger'}`}>
                              {item.stock}
                            </span>
                          </DataTableRow> */}
                          <DataTableRow size="md">
                            <span className="text-soft small">{item.notes || "No notes"}</span>
                          </DataTableRow>
                          <DataTableRow className="nk-tb-col-tools">
                            <ul className="nk-tb-actions gx-1">
                              <li onClick={() => onEditClick(item)}>
                                <TooltipComponent
                                  tag="a"
                                  containerClassName="btn btn-trigger btn-icon"
                                  id={"edit" + item._id}
                                  icon="edit-alt-fill"
                                  direction="top"
                                  text="Edit"
                                />
                              </li>
                              <li
                                onClick={() => {
                                  setDeleteItem(item);
                                  setDeleteModal(true);
                                }}
                              >
                                <TooltipComponent
                                  tag="a"
                                  containerClassName="btn btn-trigger btn-icon text-danger"
                                  id={"delete" + item._id}
                                  icon="trash-fill"
                                  direction="top"
                                  text="Delete"
                                />
                              </li>
                            </ul>
                          </DataTableRow>
                        </DataTableItem>
                      ))
                    ) : (
                      <DataTableItem>
                        <DataTableRow colSpan="11" className="text-center py-5">
                          <span className="text-silent">No products found for selected brand</span>
                        </DataTableRow>
                      </DataTableItem>
                    )}
                  </DataTableBody>
                )}

                <div className="card-inner">
                  {currentItems.length > 0 ? (
                    <PaginationComponent
                      itemPerPage={itemPerPage}
                      totalItems={filteredProducts.length}
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
            </Col>
          </Row>
        </Block>

        {/* Add Product Modal */}
        <Modal isOpen={modalAdd} toggle={() => setModalAdd(false)} centered size="lg">
          <ModalBody>
            <a
              href="#close"
              className="close"
              onClick={(e) => {
                e.preventDefault();
                setModalAdd(false);
              }}
            >
              <Icon name="cross-sm" />
            </a>

            <h5 className="title mb-3">Add Product</h5>

            <Form className="row gy-3" onSubmit={onAddSubmit}>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Brand</label>
                  <CreatableSelect
                    options={brandOptions}
                    value={formData.brand ? { label: formData.brand, value: formData.brand } : null}
                    onChange={(e) => setFormData({ ...formData, brand: e?.value || "" })}
                    required
                    isClearable
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Product Name</label>
                  <input
                    className="form-control"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Product Code</label>
                  <input
                    className="form-control"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Value</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="12">
                <FormGroup check>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.boxPacking}
                    onChange={(e) => setFormData({ ...formData, boxPacking: e.target.checked })}
                    required
                  />
                  <label className="form-label ms-2">Box Packing Available</label>
                </FormGroup>
              </Col>

              {[1, 2, 3].map((n) => (
                <Col md="4" key={n}>
                  <FormGroup>
                    <label className="form-label">PTR {n}</label>
                    <input
                      className="form-control"
                      value={formData[`ptr${n}`]}
                      onChange={(e) => setFormData({ ...formData, [`ptr${n}`]: e.target.value })}
                      required
                    />
                  </FormGroup>
                </Col>
              ))}

              <Col md="12">
                <FormGroup>
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="12">
                <Dropzone multiple={false} onDrop={(files) => setFormData({ ...formData, img: files[0] })}>
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="dropzone">
                      <input {...getInputProps()} required />
                      {formData.img ? <p>{formData.img.name}</p> : <p>Upload Product Image</p>}
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
    "Save Product"
  )}
</Button>

              </Col>
            </Form>
          </ModalBody>
        </Modal>

        {/* Edit Product Modal */}
        <Modal isOpen={modalEdit} toggle={() => setModalEdit(false)} centered size="lg">
          <ModalBody>
            <a
              href="#close"
              className="close"
              onClick={(e) => {
                e.preventDefault();
                setModalEdit(false);
              }}
            >
              <Icon name="cross-sm" />
            </a>

            <h5 className="title mb-3">Edit Product</h5>

            <Form className="row gy-3" onSubmit={onEditSubmit}>
              <Col md="6">
                <FormGroup>
                  <label className="form-label">Brand</label>
                  <CreatableSelect
                    options={brandOptions}
                    value={formData.brand ? { label: formData.brand, value: formData.brand } : null}
                    onChange={(e) => setFormData({ ...formData, brand: e?.value || "" })}
                    isClearable
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Product Name</label>
                  <input
                    className="form-control"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Product Code</label>
                  <input
                    className="form-control"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <label className="form-label">Value</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="12">
                <FormGroup check>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.boxPacking}
                    onChange={(e) => setFormData({ ...formData, boxPacking: e.target.checked })}
                  />
                  <label className="form-label ms-2">Box Packing Available</label>
                </FormGroup>
              </Col>

              {[1, 2, 3].map((n) => (
                <Col md="4" key={n}>
                  <FormGroup>
                    <label className="form-label">PTR {n}</label>
                    <input
                      className="form-control"
                      value={formData[`ptr${n}`]}
                      onChange={(e) => setFormData({ ...formData, [`ptr${n}`]: e.target.value })}
                    />
                  </FormGroup>
                </Col>
              ))}

              <Col md="12">
                <FormGroup>
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md="12">
                <Dropzone multiple={false} onDrop={(files) => setFormData({ ...formData, img: files[0] })}>
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="dropzone">
                      <input {...getInputProps()} />
                      {formData.img ? (
                        <img
                          src={typeof formData.img === "string" ? formData.img : URL.createObjectURL(formData.img)}
                          style={{ width: 80 }}
                        />
                      ) : (
                        <p>Upload Image</p>
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
    "Update Product"
  )}
</Button>

              </Col>
            </Form>
          </ModalBody>
        </Modal>

        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)} className="modal-dialog-centered">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Delete</h5>
            <button type="button" className="close" onClick={() => setDeleteModal(false)}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            Are you sure you want to delete <strong>{deleteItem?.productName}</strong>?
          </div>
          <div className="modal-footer">
            <Button color="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      </Content>

      <style jsx>{`
        html {
          overflow-y: scroll;
        }
        body {
          overflow-x: hidden;
        }

        .brand-list {
          max-height: 700px;
          overflow-y: auto;
        }

        .brand-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-radius: 6px;
          margin-bottom: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          color: #6c757d;
        }

        .brand-item:hover {
          background-color: #f8f9fa;
          color: #495057;
        }

        .brand-item.active {
          background-color: #6576ff;
          color: #ffffff;
        }

        .brand-name {
          font-weight: 400;
          font-size: 0.8rem;
          color: inherit;
        }

        .brand-count {
          font-size: 11px;
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 6px;
          border-radius: 10px;
          color: #495057;
        }

        .brand-item.active .brand-count {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .product-card {
          background: #ffffff;
          border: 1px solid #e5e9f2;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          height: 90%;
          margin: 8px;
          padding: 5px;
        }

        .product-card:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .product-image-wrapper {
          position: relative;
          height: 160px;
          background: #f8f9fa;
          overflow: hidden;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hover-icon {
          position: absolute;
          top: 10px;
          right: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .product-card:hover .hover-icon {
          opacity: 1;
        }
        .product-info {
          padding: 10px;
        }
        .no-page-padding {
          padding: 0 !important;
        }

        .no-page-padding > .container-fluid {
          padding: 0 !important;
        }

        .product-brand {
          font-size: 12px;
          color: #6576ff;
          font-weight: 600;
          text-transform: uppercase;
        }
        .product-name {
          font-size: 14px;
          font-weight: 900;
          margin: 0;
        }
        .product-details {
          display: flex;
          flex-direction: column;
          gap: 1px;
          font-size: 12px;
          color: #72849a;
        }
        .no-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #b1bbc4;
        }
        .confirm-body {
          padding: 30px 20px;
        }

        .confirm-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: rgba(220, 53, 69, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #dc3545;
          font-size: 26px;
        }

        .confirm-title {
          font-weight: 600;
          margin-bottom: 10px;
        }

        .confirm-text {
          font-size: 14px;
          color: #72849a;
          margin-bottom: 25px;
        }

        .confirm-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .btn-cancel {
          min-width: 100px;
        }

        .btn-confirm {
          min-width: 120px;
        }

        .w-200 {
          min-width: 200px;
        }
      `}</style>
    </React.Fragment>
  );
};

export default ProductsListCompact;
