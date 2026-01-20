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

// Dummy data for brands and products
const dummyBrands = [
  { id: 1, name: "Nike", productCount: 15 },
  { id: 2, name: "Adidas", productCount: 12 },
  { id: 3, name: "Apple", productCount: 8 },
  { id: 4, name: "Samsung", productCount: 20 },
  { id: 5, name: "Sony", productCount: 10 },
  { id: 6, name: "Microsoft", productCount: 7 },
  { id: 7, name: "Dell", productCount: 9 },
  { id: 8, name: "HP", productCount: 11 },
  { id: 9, name: "Lenovo", productCount: 6 },
  { id: 10, name: "Unbranded", productCount: 25 },
];

const dummyProducts = [
  {
    _id: "1",
    productName: "Air Max 270",
    brand: "Nike",
    productCode: "NIKE-AM270",
    value: 129.99,
    stock: 150,
    description: "Comfortable running shoes",
    boxPacking: "12 pairs/box",
    ptr1: 110.50,
    ptr2: 115.75,
    ptr3: 125.00,
    notes: "Latest model with improved cushioning",
    file: "https://example.com/nike-airmax.jpg",
    row: "A",
    coloumn: 3
  },
  {
    _id: "2",
    productName: "Ultraboost 22",
    brand: "Adidas",
    productCode: "ADI-UB22",
    value: 159.99,
    stock: 200,
    description: "Premium running shoes",
    boxPacking: "10 pairs/box",
    ptr1: 135.00,
    ptr2: 145.50,
    ptr3: 150.00,
    notes: "Boost technology for energy return",
    file: "https://example.com/adidas-ultraboost.jpg",
    row: "B",
    coloumn: 2
  },
  {
    _id: "3",
    productName: "iPhone 14 Pro",
    brand: "Apple",
    productCode: "APP-IP14P",
    value: 999.99,
    stock: 75,
    description: "Latest Apple smartphone",
    boxPacking: "6 units/box",
    ptr1: 850.00,
    ptr2: 900.00,
    ptr3: 950.00,
    notes: "Dynamic Island feature",
    file: "https://example.com/iphone14.jpg",
    row: "C",
    coloumn: 1
  },
  {
    _id: "4",
    productName: "Galaxy S23",
    brand: "Samsung",
    productCode: "SAM-GS23",
    value: 799.99,
    stock: 120,
    description: "Android flagship phone",
    boxPacking: "8 units/box",
    ptr1: 680.00,
    ptr2: 720.00,
    ptr3: 750.00,
    notes: "200MP camera system",
    file: "https://example.com/galaxy-s23.jpg",
    row: "A",
    coloumn: 4
  },
  {
    _id: "5",
    productName: "WH-1000XM5",
    brand: "Sony",
    productCode: "SONY-WHXM5",
    value: 349.99,
    stock: 85,
    description: "Noise cancelling headphones",
    boxPacking: "4 units/box",
    ptr1: 295.00,
    ptr2: 315.00,
    ptr3: 330.00,
    notes: "Industry leading noise cancellation",
    file: "https://example.com/sony-headphones.jpg",
    row: "D",
    coloumn: 3
  },
  {
    _id: "6",
    productName: "Surface Pro 9",
    brand: "Microsoft",
    productCode: "MS-SP9",
    value: 1199.99,
    stock: 45,
    description: "2-in-1 laptop tablet",
    boxPacking: "2 units/box",
    ptr1: 1020.00,
    ptr2: 1100.00,
    ptr3: 1150.00,
    notes: "Intel Evo platform",
    file: "https://example.com/surface-pro.jpg",
    row: "E",
    coloumn: 2
  },
  {
    _id: "7",
    productName: "XPS 13",
    brand: "Dell",
    productCode: "DELL-XPS13",
    value: 1299.99,
    stock: 60,
    description: "Premium ultrabook",
    boxPacking: "4 units/box",
    ptr1: 1105.00,
    ptr2: 1190.00,
    ptr3: 1250.00,
    notes: "OLED display option",
    file: "https://example.com/dell-xps.jpg",
    row: "F",
    coloumn: 1
  },
  {
    _id: "8",
    productName: "Spectre x360",
    brand: "HP",
    productCode: "HP-SPX360",
    value: 1099.99,
    stock: 70,
    description: "Convertible laptop",
    boxPacking: "3 units/box",
    ptr1: 935.00,
    ptr2: 990.00,
    ptr3: 1050.00,
    notes: "Bang & Olufsen speakers",
    file: "https://example.com/hp-spectre.jpg",
    row: "B",
    coloumn: 5
  },
  {
    _id: "9",
    productName: "ThinkPad X1 Carbon",
    brand: "Lenovo",
    productCode: "LEN-TPX1C",
    value: 1499.99,
    stock: 40,
    description: "Business laptop",
    boxPacking: "2 units/box",
    ptr1: 1275.00,
    ptr2: 1375.00,
    ptr3: 1425.00,
    notes: "Military grade durability",
    file: "https://example.com/thinkpad.jpg",
    row: "C",
    coloumn: 3
  },
  {
    _id: "10",
    productName: "Generic Mouse",
    brand: "Unbranded",
    productCode: "UNB-GM01",
    value: 9.99,
    stock: 500,
    description: "USB optical mouse",
    boxPacking: "50 units/box",
    ptr1: 6.50,
    ptr2: 7.75,
    ptr3: 8.50,
    notes: "Basic functionality",
    file: null,
    row: "D",
    coloumn: 6
  }
];

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
    name: "",
    brand: "",
    productCode: "",
    stock: null,
    value: null,
    description: "",
    boxPacking: "",
    ptr1: null,
    ptr2: null,
    ptr3: null,
    notes: "",
    row:"",
    coloumn: null
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

  // Initialize with dummy data
  useEffect(() => {
    if(data?.length === 0){
      setData(dummyProducts);
      setBrands(dummyBrands);
    }
  }, [data]);

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

  // fetch users list
  const fetchProductData = async() => {
    try{
      const response = await axios.get(process.env.REACT_APP_BACKENDURL+"/api/product")
      setData(response.data?.reverse())
      } catch (err){
        console.log(err)
        // Fallback to dummy data if API fails
        setData(dummyProducts);
        setBrands(dummyBrands);
      }}

  // Changing state value when searching name
  useEffect(() => {
    if (onSearchText !== "") {
      const filteredObject = filteredProducts.filter((item) => {
        return (
          item.productName.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.productCode.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.brand.toLowerCase().includes(onSearchText.toLowerCase())
        );
      });
      setData([...filteredObject]);
    } else {
      setData([...data]);
    }
  }, [onSearchText, setData, selectedBrand]);

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
      brand: "",
      productCode: "",
      stock: null,
      value: null,
      description: "",
      boxPacking: "",
      ptr1: null,
      ptr2: null,
      ptr3: null,
      notes: "",
      row:"",
      coloumn: null
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
  const onFormSubmit = async() => {
    const formData2 = new FormData();
    formData2.append('productName', formData.name);
    formData2.append('brand', formData.brand);
    formData2.append('productCode', formData.productCode);
    formData2.append('stock', formData.stock);
    formData2.append('value', formData.value);
    formData2.append('description', formData.description);
    formData2.append('boxPacking', formData.boxPacking);
    formData2.append('ptr1', formData.ptr1);
    formData2.append('ptr2', formData.ptr2);
    formData2.append('ptr3', formData.ptr3);
    formData2.append('notes', formData.notes);
    formData2.append('row', formData.row);
    formData2.append('coloumn', formData.coloumn);
    formData2.append('createdBy', userData._id);

    if (uploadedFile) {
      formData2.append('file', uploadedFile.file);
    }
    
    try{
      const response = await axios.post(process.env.REACT_APP_BACKENDURL+"/api/product", formData2, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 201) {
        successToast("Product Created Successfully");
        onFormCancel();
        fetchProductData();
      } else {
        warningToast();
      }
    } catch(error){
      errorToast(error);
      // Add to dummy data for demo
      const newProduct = {
        _id: Date.now().toString(),
        ...formData,
        productName: formData.name,
        brand: formData.brand || "Unbranded",
        productCode: formData.productCode,
        value: formData.value,
        stock: formData.stock,
        description: formData.description,
        boxPacking: formData.boxPacking || "N/A",
        ptr1: formData.ptr1 || 0,
        ptr2: formData.ptr2 || 0,
        ptr3: formData.ptr3 || 0,
        notes: formData.notes || "",
        file: uploadedFile ? uploadedFile.preview : null,
        row: formData.row || "",
        coloumn: formData.coloumn || null
      };
      setData(prev => [newProduct, ...prev]);
      onFormCancel();
    }
  };

  // submit function to update a new item
  const onEditSubmit = async () => {
    const submittedData = {
      productName: formData.name || undefined,
      brand: formData.brand || undefined,
      productCode: formData.productCode || undefined,
      stock: formData.stock || undefined,
      value: formData.value || undefined,
      description: formData.description || undefined,
      boxPacking: formData.boxPacking || undefined,
      ptr1: formData.ptr1 || undefined,
      ptr2: formData.ptr2 || undefined,
      ptr3: formData.ptr3 || undefined,
      notes: formData.notes || undefined,
      row: formData.row || undefined,
      coloumn: formData.coloumn || undefined,
    };

    const formDataToSend = new FormData();
    
    Object.keys(submittedData).forEach((key) => {
      if (submittedData[key] !== undefined) {
        formDataToSend.append(key, submittedData[key]);
      }
    });

    if (uploadedFile) {
      formDataToSend.append('file', uploadedFile.file);
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKENDURL}/api/product/${editId}`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.status === 200) {
        successToast("Product Updated Successfully");
        fetchProductData();
        onFormCancel();
      }
    } catch (err) {
      errorToast("Something Went Wrong");
      // Update dummy data for demo
      setData(prev => prev.map(item => 
        item._id === editId 
          ? { ...item, ...formData, productName: formData.name, brand: formData.brand }
          : item
      ));
      onFormCancel();
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id, file) => {
    data.forEach((item) => {
      if (item._id === id) {
        setFormData({
          name: item.productName,
          brand: item.brand,
          productCode: item.productCode,
          value: item.value,
          stock: item.stock,
          description: item.description,
          boxPacking: item.boxPacking,
          ptr1: item.ptr1,
          ptr2: item.ptr2,
          ptr3: item.ptr3,
          notes: item.notes,
       
        });
        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  // Brand options for dropdown
  const brandOptions = [
    { value: "", label: "Select Brand" },
    { value: "Nike", label: "Nike" },
    { value: "Adidas", label: "Adidas" },
    { value: "Apple", label: "Apple" },
    { value: "Samsung", label: "Samsung" },
    { value: "Sony", label: "Sony" },
    { value: "Microsoft", label: "Microsoft" },
    { value: "Dell", label: "Dell" },
    { value: "HP", label: "HP" },
    { value: "Lenovo", label: "Lenovo" },
    { value: "Unbranded", label: "Unbranded" },
    { value: "Other", label: "Other" },
  ];

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
                                image={item.file}
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
                      <label className="form-label">Brand</label>
                      <RSelect
                        options={brandOptions}
                        onChange={(e) => setFormData({...formData, brand: e.value})}
                        placeholder="Select Brand"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Product Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        onChange={(e)=> setFormData({...formData, name:e.target.value})}
                        placeholder="Enter Product name"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Product Code</label>
                      <input
                        className="form-control"
                        type="text"
                        name="productCode"
                        onChange={(e)=> setFormData({...formData, productCode:e.target.value})}
                        placeholder="Enter Product Code"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Value (Price)</label>
                      <input
                        className="form-control"
                        type="number"
                        name="value"
                        onChange={(e)=> setFormData({...formData, value:e.target.value})}
                        placeholder="Enter Value"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <label className="form-label">PTR 1</label>
                      <input
                        className="form-control"
                        type="number"
                        name="ptr1"
                        onChange={(e)=> setFormData({...formData, ptr1:e.target.value})}
                        placeholder="PTR 1"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <label className="form-label">PTR 2</label>
                      <input
                        className="form-control"
                        type="number"
                        name="ptr2"
                        onChange={(e)=> setFormData({...formData, ptr2:e.target.value})}
                        placeholder="PTR 2"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <label className="form-label">PTR 3</label>
                      <input
                        className="form-control"
                        type="number"
                        name="ptr3"
                        onChange={(e)=> setFormData({...formData, ptr3:e.target.value})}
                        placeholder="PTR 3"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Stock Quantity</label>
                      <input
                        className="form-control"
                        type="number"
                        name="stock"
                        onChange={(e)=> setFormData({...formData, stock:e.target.value})}
                        placeholder="Stock Quantity"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Box Packing</label>
                      <input
                        className="form-control"
                        type="text"
                        name="boxPacking"
                        onChange={(e)=> setFormData({...formData, boxPacking:e.target.value})}
                        placeholder="e.g., 12 units/box"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="12">
                    <FormGroup>
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        onChange={(e)=> setFormData({...formData, description:e.target.value})}
                        placeholder="Product description"
                        rows="2"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="12">
                    <FormGroup>
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        name="notes"
                        onChange={(e)=> setFormData({...formData, notes:e.target.value})}
                        placeholder="Additional notes"
                        rows="2"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Row</label>
                      <input
                        className="form-control"
                        type="text"
                        name="row"
                        onChange={(e)=> setFormData({...formData, row:e.target.value})}
                        placeholder="Row location"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Column/Rack</label>
                      <input
                        className="form-control"
                        type="number"
                        name="coloumn"
                        onChange={(e) => {
                          const value = Math.min(Number(e.target.value), 50);
                          setFormData({ ...formData, coloumn: value });
                        }}
                        max="50"
                        placeholder="Column number"
                      />
                    </FormGroup>
                  </Col>
                  <Col size="12">
                    <FormGroup>
                      <label className="form-label">Product Image</label>
                      <Dropzone accept=".png, .jpg, .jpeg" multiple={false} onDrop={handleDropChange2}>
                        {({ getRootProps, getInputProps }) => (
                          <section>
                            <div
                              {...getRootProps()}
                              className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
                            >
                              <input {...getInputProps()} />
                              {files2.length === 0 && <p>Drag 'n' drop image or click to select</p>}
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
                    </FormGroup>
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

        {/* Edit Product Modal */}
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
              <h5 className="title">Update Product</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onEditSubmit)}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Brand</label>
                      <RSelect
                        options={brandOptions}
                        value={{ value: formData.brand, label: formData.brand }}
                        onChange={(e) => setFormData({...formData, brand: e.value})}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Product Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e)=> setFormData({...formData, name:e.target.value})}
                        placeholder="Enter Product name"
                        required
                      />
                    </FormGroup>
                  </Col>
                  {/* Other form fields similar to Add Modal */}
                  {/* ... Include all the same fields as Add Modal but with values from formData ... */}
                  <Col size="12">
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

        {/* Delete Confirmation Modal */}
        <Modal isOpen={assignModal} toggle={toggleAssignModal} className="modal-dialog-centered" size="md">
          <ModalBody>
            <div className="nk-modal-head">
              <div className="card-inner-group">
                <div className="card-inner p-0">
                  <div className="confirmation-container">
                    <h5 className="confirmation-message">Are You Sure to Delete - {selectedData && selectedData.productName}?</h5>
                    <div className="confirmation-buttons">
                      <button className="confirm-button" onClick={() => {
                        setData(prev => prev.filter(item => item._id !== selectedData._id));
                        setAssignModal(false);
                        successToast("Product deleted successfully");
                      }}>
                        Confirm
                      </button>
                      <button className="cancel-button" onClick={toggleAssignModal}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        </Modal>

        {/* Import Modal */}
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
              <h5 className="title">Import Products</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={onImportSubmit}>
                  <Col size="12">
                    <Dropzone accept=".xlsx, .xls" multiple={false} onDrop={handleDropChange}>
                      {({ getRootProps, getInputProps }) => (
                        <section>
                          <div
                            {...getRootProps()}
                            className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
                          >
                            <input {...getInputProps()} />
                            {files.length === 0 && <p>Drag 'n' drop Excel file or click to select</p>}
                            {files.map((file) => (
                              <div
                                key={file.name}
                                className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                              >
                                <div className="dz-image">
                                  <Icon name="file-xls"></Icon>
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