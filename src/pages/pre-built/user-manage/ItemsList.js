import React, { useState, useEffect, useContext } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { findUpper } from "../../../utils/Utils";
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
import axios from "axios";
import './Confirmation.css'; 
import Dropzone from "react-dropzone";
import * as XLSX from 'xlsx';
import imageCompression from 'browser-image-compression';
import DataContext from "../../../utils/DataContext";
import CreatableSelect from "react-select/creatable";

// Dummy data for brands and products



const ProductsListCompact = () => {
  
  const [data, setData] = useState([]);
  const [brands, setBrands] = useState([]);
  const {userData} = useContext(DataContext);
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  
  const [editId, setEditedId] = useState();
const [formData, setFormData] = useState({
  productName: "",   // Product name
  brand: "",         // Brand
  productCode: "",   // Product code
  value: null,       // Value / Price
  boxPacking: false, // Boolean
  ptr1: null,        // PTR 1
  ptr2: null,        // PTR 2
  ptr3: null,        // PTR 3
  notes: "",         // Notes
  img: ""            // Image URL or preview
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
  fetchProductData();
}, []);
  // Fetch brands from products data
  useEffect(() => {
    if (data.length > 0) {
      const brandSet = new Set();
      const brandCounts = {};
      
      data.forEach(product => {
        const brand = product.brand || 'Unbranded';
        brandSet.add(brand);
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      });
      
      const brandList = Array.from(brandSet).map(brand => ({
        name: brand,
        productCount: brandCounts[brand]
      }));
      
      setBrands(brandList);
    }
  }, [data]);

  // Filter products by selected brand
  const filteredProducts = selectedBrand === "All Brands" 
    ? data 
    : data.filter(product => product.brand === selectedBrand);

const fetchProductData = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/product`);
    setData(response.data || []); // only real products
    // Generate brands from fetched data
    const brandSet = new Set();
    const brandCounts = {};
    response.data.forEach(product => {
      const brand = product.brand || "Unbranded";
      brandSet.add(brand);
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });
    setBrands(Array.from(brandSet).map(b => ({ name: b, productCount: brandCounts[b] })));
  } catch (err) {
    console.log("Failed to fetch products:", err);
    setData([]); // show empty if API fails
    setBrands([]);
  }
};

  
const brandOptions = brands.map((brand) => ({
  label: brand.name,
  value: brand.name,
}));
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
    productName: "",
    brand: "",
    productCode: "",
    value: null,
    boxPacking: false,
    ptr1: null,
    ptr2: null,
    ptr3: null,
    notes: "",
    img: ""
  });
};


  // function to close the form modal
  const onFormCancel = () => {
    setModal({ edit: false, add: false });
    resetForm();
    setUploadedFile(null);
    setFiles2([]);
    setFiles([]);
  };

  // submit function to add a new item
  const onFormSubmit = async () => {
  try {
    const payload = {
      productName: formData.productName,
      brand: formData.brand,
      productCode: formData.productCode,
      value: formData.value ? Number(formData.value) : 0,
      boxPacking: formData.boxPacking || false,
      ptr1: formData.ptr1 ? Number(formData.ptr1) : 0,
      ptr2: formData.ptr2 ? Number(formData.ptr2) : 0,
      ptr3: formData.ptr3 ? Number(formData.ptr3) : 0,
      notes: formData.notes || "",
      img: uploadedFile ? uploadedFile.preview : formData.img || "",
      createdBy: userData._id
    };

    const response = await axios.post(
      `${process.env.REACT_APP_BACKENDURL}/api/product`,
      payload
    );

    if (response.status === 201) {
      successToast("Product Created Successfully");
      onFormCancel();
      fetchProductData();
    } else {
      warningToast("Failed to create product");
    }
  } catch (error) {
    errorToast(error.response?.data?.message || "Something went wrong");

    // Optional: Add dummy product to UI for demo
    const newProduct = {
      _id: Date.now().toString(),
      ...payload
    };
    setData(prev => [newProduct, ...prev]);
    onFormCancel();
  }
};

  // submit function to update a new item
  const onEditSubmit = async () => {
  try {
    const payload = {
      productName: formData.productName,
      brand: formData.brand,
      productCode: formData.productCode,
      value: formData.value ? Number(formData.value) : 0,
      boxPacking: formData.boxPacking || false,
      ptr1: formData.ptr1 ? Number(formData.ptr1) : 0,
      ptr2: formData.ptr2 ? Number(formData.ptr2) : 0,
      ptr3: formData.ptr3 ? Number(formData.ptr3) : 0,
      notes: formData.notes || "",
      img: uploadedFile ? uploadedFile.preview : formData.img || ""
    };

    const response = await axios.put(
      `${process.env.REACT_APP_BACKENDURL}/api/product/${editId}`,
      payload
    );

    if (response.status === 200) {
      successToast("Product Updated Successfully");
      fetchProductData();
      onFormCancel();
    }
  } catch (err) {
    errorToast(err.response?.data?.message || "Something Went Wrong");

    // Optional: Update dummy data locally for demo
    setData(prev =>
      prev.map(item =>
        item._id === editId ? { ...item, ...payload } : item
      )
    );
    onFormCancel();
  }
};


  // function that loads the want to editted data
  const onEditClick = (id) => {
  const item = data.find(item => item._id === id);
  if (item) {
    setFormData({
      productName: item.productName,
      brand: item.brand,
      productCode: item.productCode,
      value: item.value,
      boxPacking: item.boxPacking,
      ptr1: item.ptr1,
      ptr2: item.ptr2,
      ptr3: item.ptr3,
      notes: item.notes,
      img: item.img || ""
    });
    setModal({ edit: true, add: false });
    setEditedId(id);
  }
};


  
  // Get current list, pagination
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredProducts?.slice(indexOfFirstItem, indexOfLastItem);

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
    const file = acceptedFiles[0];
    if(!file) return;
    
    try{
      const compressedFile = await compressImage(file);
      const newFile = {
        name:compressedFile.name,
        type:compressedFile.type,
        file:compressedFile,
        preview: URL.createObjectURL(compressedFile)
      };
      setFiles2([newFile]),
      setUploadedFile(newFile);
    } catch(error){
      console.error("Error compressing file:", error);
    }
  };

  const handleDropChange = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
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
    e.preventDefault();
    if (!sheetData) {
      warningToast("No file data to upload.");
      return;
    }

    // Send data to the backend
    fetch(process.env.REACT_APP_BACKENDURL+'/api/product/importProducts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: sheetData })
    })
    .then(response => response.json())
    .then(responseData => {
      successToast('Data imported successfully:', responseData);
      toggleUploadModal();
      fetchProductData();
    })
    .catch(error => {
      console.error('Error sending data:', error);
      warningToast('Using demo data instead');
      toggleUploadModal();
    });
  };

  const { errors, register, handleSubmit } = useForm();

  const toggleUploadModal = () => {
    setUploadModal(!uploadModal);
  };

    const toggleAssignModal = (item) => {
    setAssignModal(!assignModal);
    setSelectedData(item)
  };


  return (
    <React.Fragment>
      <Head title="Products List"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Products Management
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>Total Products: {data?.length} | Showing: {filteredProducts.length}</p>
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
                      <Button
                        color={selectedBrand === "All Brands" ? "primary" : "white"}
                        onClick={() => setSelectedBrand("All Brands")}
                      >
                        All Brands
                      </Button>
                    </li>
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
                    
                    <li className="nk-block-tools-opt">
                      <Button color={isGridView ? "dark": ""} className="btn-icon mr-1" onClick={() => {setIsGridView(false); setItemPerPage(10)}}>
                        <Icon name="list"></Icon>
                      </Button>
                      <Button color={isGridView ? "": "dark"} className="btn-icon" onClick={() => {setIsGridView(true); setItemPerPage(12)}}>
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
            <Col md="3" lg="3">
              <div className="card card-stretch">
                <div className="card-inner p-2">
                  <h6 className="overline-title">Brands</h6>
                  <div className="brand-list">
                    <div 
                      className={`brand-item ${selectedBrand === "All Brands" ? "active" : ""}`}
                      onClick={() => setSelectedBrand("All Brands")}
                    >
                      <div className="brand-name">All Brands</div>
                      <div className="brand-count">{data.length}</div>
                    </div>
                    {brands.map((brand, index) => (
                      <div 
                        key={index}
                        className={`brand-item ${selectedBrand === brand.name ? "active" : ""}`}
                        onClick={() => setSelectedBrand(brand.name)}
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
            <Col md="9" lg="9">
              <DataTable className="card-stretch">
                <div className="card-inner position-relative card-tools-toggle">
                  <div className="card-title-group">
                    <div className="card-tools">
                      <div className="form-inline flex-nowrap gx-3">
                        <div className="form-wrap">
                          <RSelect
                            options={[{ value: "All Brands", label: "All Brands" }, ...brands.map(b => ({ value: b.name, label: b.name }))]}
                            value={{ value: selectedBrand, label: selectedBrand }}
                            onChange={(e) => setSelectedBrand(e.value)}
                            className="w-200"
                          />
                        </div>
                        <div className="form-wrap ml-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search products..."
                            value={onSearchText}
                            onChange={(e) => onFilterChange(e)}
                          />
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
                          placeholder="Search by Product Name, Code or Brand"
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
                    <Row className="g-gs">
                      {currentItems.map((item, idx) => (
                        <Col lg="4" sm="6" md="4" key={idx}>
                          <div className="product-card">
                            <div className="product-image-wrapper">
                              {item.file ? (
                                <img className="product-image" src={item.file} alt={item.productName} />
                              ) : (
                                <span className="no-preview">No preview available</span>
                              )}
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
                            <div className="product-info">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="product-brand">{item.brand}</span>
                                <span className="badge badge-primary">Rs. {item.value}</span>
                              </div>
                              <h6 className="product-name">{item.productName}</h6>
                              <div className="product-details">
                                <small>Code: {item.productCode}</small>
                                <small>Stock: {item.stock}</small>
                                <small>Box: {item.boxPacking}</small>
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
                            <span className="text-soft small">{item.notes || 'No notes'}</span>
                          </DataTableRow>
                          <DataTableRow className="nk-tb-col-tools">
                            <ul className="nk-tb-actions gx-1">
                              <li onClick={() => onEditClick(item._id, item.file)}>
                                <TooltipComponent
                                  tag="a"
                                  containerClassName="btn btn-trigger btn-icon"
                                  id={"edit" + item._id}
                                  icon="edit-alt-fill"
                                  direction="top"
                                  text="Edit"
                                />
                              </li>
                              <li onClick={() => {
                                setSelectedData(item);
                                setAssignModal(true);
                              }}>
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
       <Modal
  isOpen={modal.add}
  toggle={() => setModal({ add: false })}
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
      <Icon name="cross-sm" />
    </a>

    <div className="p-2">
      <h5 className="title">Add Product</h5>
      <div className="mt-4">
        <Form className="row gy-4" onSubmit={handleSubmit(onFormSubmit)}>

          {/* Brand */}
        <Col md="6">
  <FormGroup>
    <label className="form-label">Brand</label>

    <CreatableSelect
      options={brandOptions}
      value={
        formData.brand
          ? { label: formData.brand, value: formData.brand }
          : null
      }
      onChange={(selected) => {
        setFormData({ ...formData, brand: selected.value });
      }}
      placeholder="Select or create brand"
      isClearable
    />
  </FormGroup>
</Col>


          {/* Product Name */}
          <Col md="6">
            <FormGroup>
              <label className="form-label">Product Name</label>
              <input
                className="form-control"
                type="text"
                value={formData.productName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                placeholder="Enter Product Name"
                required
              />
            </FormGroup>
          </Col>

          {/* Product Code */}
          <Col md="6">
            <FormGroup>
              <label className="form-label">Product Code</label>
              <input
                className="form-control"
                type="text"
                value={formData.productCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, productCode: e.target.value })
                }
                placeholder="Enter Product Code"
                required
              />
            </FormGroup>
          </Col>

          {/* Value */}
          <Col md="6">
            <FormGroup>
              <label className="form-label">Value</label>
              <input
                className="form-control"
                type="number"
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="Enter Value"
                required
              />
            </FormGroup>
          </Col>

          {/* Box Packing */}
          <Col md="6">
            <FormGroup check>
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={formData.boxPacking || false}
                  onChange={(e) =>
                    setFormData({ ...formData, boxPacking: e.target.checked })
                  }
                  className="form-check-input"
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
                value={formData.ptr1 || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ptr1: e.target.value })
                }
                placeholder="PTR 1"
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
                value={formData.ptr2 || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ptr2: e.target.value })
                }
                placeholder="PTR 2"
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
                value={formData.ptr3 || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ptr3: e.target.value })
                }
                placeholder="PTR 3"
              />
            </FormGroup>
          </Col>

          {/* Notes */}
          <Col md="12">
            <FormGroup>
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes"
              />
            </FormGroup>
          </Col>

          {/* Product Image */}
          <Col md="12">
            <FormGroup>
              <label className="form-label">Product Image</label>
              <Dropzone
                accept=".png, .jpg, .jpeg"
                multiple={false}
                onDrop={(acceptedFiles) =>
                  handleImageUpload(acceptedFiles, setFormData)
                }
              >
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
                  >
                    <input {...getInputProps()} />
                    {!formData.img && (
                      <p>Drag & drop image or click to select</p>
                    )}
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
            </FormGroup>
          </Col>

          {/* Submit + Cancel */}
          <Col md="12">
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


        {/* Edit Product Modal */}
        <Modal
  isOpen={modal.edit}
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
      <Icon name="cross-sm" />
    </a>

    <div className="p-2">
      <h5 className="title">Update Product</h5>
      <div className="mt-4">
        <Form className="row gy-4" onSubmit={handleSubmit(onEditSubmit)}>

          {/* Brand */}
          <Col md="6">
            <FormGroup>
              <label className="form-label">Brand</label>
              <RSelect
                options={brandOptions}
                value={{ value: formData.brand, label: formData.brand }}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.value })
                }
              />
            </FormGroup>
          </Col>

          {/* Product Name */}
          <Col md="6">
            <FormGroup>
              <label className="form-label">Product Name</label>
              <input
                className="form-control"
                type="text"
                value={formData.productName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                placeholder="Enter Product Name"
                required
              />
            </FormGroup>
          </Col>

          {/* Product Code */}
          <Col md="6">
            <FormGroup>
              <label className="form-label">Product Code</label>
              <input
                className="form-control"
                type="text"
                value={formData.productCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, productCode: e.target.value })
                }
                placeholder="Enter Product Code"
                required
              />
            </FormGroup>
          </Col>

          {/* Value */}
          <Col md="6">
            <FormGroup>
              <label className="form-label">Value</label>
              <input
                className="form-control"
                type="number"
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="Enter Value"
                required
              />
            </FormGroup>
          </Col>

          {/* Box Packing */}
          <Col md="6">
            <FormGroup check>
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={formData.boxPacking || false}
                  onChange={(e) =>
                    setFormData({ ...formData, boxPacking: e.target.checked })
                  }
                  className="form-check-input"
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
                value={formData.ptr1 || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ptr1: e.target.value })
                }
                placeholder="PTR 1"
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
                value={formData.ptr2 || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ptr2: e.target.value })
                }
                placeholder="PTR 2"
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
                value={formData.ptr3 || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ptr3: e.target.value })
                }
                placeholder="PTR 3"
              />
            </FormGroup>
          </Col>

          {/* Notes */}
          <Col md="12">
            <FormGroup>
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes"
              />
            </FormGroup>
          </Col>

          {/* Product Image */}
          <Col md="12">
            <FormGroup>
              <label className="form-label">Product Image</label>
              <Dropzone
                accept=".png, .jpg, .jpeg"
                multiple={false}
                onDrop={(acceptedFiles) =>
                  handleImageUpload(acceptedFiles, setFormData)
                }
              >
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
                  >
                    <input {...getInputProps()} />
                    {!formData.img && <p>Drag & drop image or click to select</p>}
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
            </FormGroup>
          </Col>

          {/* Submit + Cancel */}
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

      </Content>

      <style jsx>{`
        .brand-list {
          max-height: 500px;
          overflow-y: auto;
        }
        .brand-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          border-radius: 6px;
          margin-bottom: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .brand-item:hover {
          background-color: #f8f9fa;
        }
        .brand-item.active {
          background-color: #6576ff;
          color: white;
        }
        .brand-name {
          font-weight: 500;
        }
        .brand-count {
          font-size: 12px;
          background: rgba(0,0,0,0.1);
          padding: 2px 8px;
          border-radius: 10px;
        }
        .brand-item.active .brand-count {
          background: rgba(255,255,255,0.2);
        }
        .product-card {
          background: #ffffff;
          border: 1px solid #e5e9f2;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          height: 100%;
        }
        .product-card:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .product-image-wrapper {
          position: relative;
          height: 200px;
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
          padding: 15px;
        }
        .product-brand {
          font-size: 12px;
          color: #6576ff;
          font-weight: 600;
          text-transform: uppercase;
        }
        .product-name {
          font-size: 16px;
          font-weight: 600;
          margin: 5px 0;
        }
        .product-details {
          display: flex;
          flex-direction: column;
          gap: 3px;
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
        .w-200 {
          min-width: 200px;
        }
      `}</style>
    </React.Fragment>
  );
};

export default ProductsListCompact;