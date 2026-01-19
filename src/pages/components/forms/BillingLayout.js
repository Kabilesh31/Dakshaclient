import React, { useContext, useEffect, useRef, useState } from "react";
import { Row, Col, Modal, ModalBody, FormGroup, Label, Input } from "reactstrap";
import {
  Block,
  PreviewCard,
  Button,
  Icon,
  RSelect,
  BlockTitle
} from "../../../components/Component";
import axios from "axios";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { addProduct, deleteProduct, clearAllProducts, updateQuantity, updateProductValue, updateGst } from '../../../store/billingSlice';
import { useDispatch, useSelector } from "react-redux";
import DataContext from "../../../utils/DataContext"
import { errorToast, successToast, warningToast } from "../../../utils/toaster";

import { DropdownToggle, DropdownMenu, Card, UncontrolledDropdown, DropdownItem } from "reactstrap";
import DatePicker from "react-datepicker";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const BillingLayout = () => {``
  const {userData} = useContext(DataContext)
  const { selectedProducts } = useSelector((state) => state.billing); // Access Redux state
  const dispatch = useDispatch(); // Access dispatch function
  const [modal, setModal] = useState(false)
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [filterProductSuggestions, setFiltereProductSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);
  const [modalTab, setModalTab] = useState("1");
  const [startIconDate, setStartIconDate] = useState(new Date());
  const [formData, setFormData] = useState({
    productName:"",
    quantity: 0 
  }); 
  const [staffName, setStaffName] = useState("");
  const [selectedType, setSelectedType] = useState("")
  const [productData, setProductData] = useState([])
  const [isSelected, setIsSelected] = useState(false)
  const [selectedItem, setSelectedItem] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState([])
  const [session, setSession] = useState("")
  const [billData, setBillData] = useState([])
  const [clickCount, setClickCount] = useState(0);
  const [showTextBox, setShowTextBox] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempQuantity, setTempQuantity] = useState("");
  const [staffData, setStaffData] = useState([])
  const [selectedStaff, setSelectedStaff] = useState("")
  const [selectedStaffId, setSelectedStaffId] = useState("")
  const [invoiceNo, setInvoiceNo] = useState("")
  const [totalProduct, setTotalProduct] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState([])
  const [deleteModal, setDeleteModal] = useState(false)
  const [duplitcateModal, setDuplicateModal] = useState(false)
  const [duplicateId, setDuplicateId] = useState("")
  const [deleteId, setDeleteId] = useState("")
  const [editedValue, setEditedValue] = useState("");
  const [unPaidBills, setUnPaidBills] = useState([])
  const [unpaidBillEdit, setUnPaidBillEdit] = useState(false)
  const [selectedBill, setSelectedBill] = useState([])
  const [gst, setGst] = useState("gst")

  localStorage.setItem("isGridView", false);
  const wrapperRef = useRef(null);
  const productWrapperRef = useRef(null);

  useEffect(() => {
    if (data.length === 0) {
      fetchCustomerData();
    }
  }, [data]);
  useEffect(() => {
    if (productData.length === 0) {
      fetchProductData();
    }
  }, [productData]);

  useEffect(()=> {
      if(staffData?.length === 0){
        fetchStaffData()
      }
    },[staffData])


  useEffect(() => {
      if (selectedCustomer?.staff && staffData?.length > 0) {
        const staff = staffData.find((s) => s._id === selectedCustomer.staff);
        setStaffName(staff ? staff.name : "Unknown Staff");
      }
  }, [selectedCustomer, staffData]);

  const fetchStaffData = async() => {
      try{
        const response = await axios.get(process.env.REACT_APP_BACKENDURL+"/api/staff")
        setStaffData(response.data)
        } catch (err){
          console.log(err)
        }}


  useEffect(() => {
      function handleClickOutside(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setShowSuggestions(false); // 👈 just closes the dropdown
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);


  

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        productWrapperRef.current &&
        !productWrapperRef.current.contains(event.target)
      ) {
        setShowSuggestions2(false); // 👈 close only the product dropdown
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const fetchBillData = async (phone, type) => {
    try {

      const url = `${process.env.REACT_APP_BACKENDURL}/api/bill/${phone}?type=${type}`;
      const response = await axios.get(url);
      setBillData(response.data)
      localStorage.setItem('selectedProducts', JSON.stringify(response.data))
      localStorage.setItem('selectedCustomer', JSON.stringify(selectedCustomer))
      return response.data;
    } catch (error) {
      console.error("Error fetching bill data:", error.message);
      return null;
    }
  };

  const fetchCustomerData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + '/api/customer');
      setData(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(()=> {
    if(selectedCustomer.paymentPending && unPaidBills.length === 0){
      fetchUnpaidBills()
    }
  },[selectedCustomer])

   const fetchUnpaidBills = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + `/api/bill/unpaidbills/${selectedCustomer.phone}`);
      setUnPaidBills(response.data.data)
    } catch (err) {
      console.log(err);
    }
  };

  const handleBillSelect = (invoiceNo) => {
    if(invoiceNo.value === "current"){
      setUnPaidBillEdit(false);
      setSelectedBill(null);
    }else{
      setUnPaidBillEdit(true);
      const filterBill = unPaidBills.filter((item) => item.invoiceNo === invoiceNo.value)
      setSelectedBill(filterBill);
    }

  }

    const filteredUnpaidBillData = unPaidBills?.length > 0 ? unPaidBills.reduce((acc, order) => {
      const invoiceNo = order.invoiceNo || 'no-invoice';
      if (!acc.some(item => (item.invoiceNo || 'no-invoice') === invoiceNo)) {
        acc.push(order);
      }
      return acc;
    }, []) : [];

  const fetchProductData= async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + '/api/product');
      setProductData(response.data);
     
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setQuery(input);
  
    // Filter the data based on the input value
    const filteredData = data.filter((customer) =>
      customer.name.toLowerCase().includes(input.toLowerCase())
    );
  
    setFilterCustomerType(filteredData); // Update filtered data
    setShowSuggestions(true); // Ensure suggestions are displayed
  };

  const handleChangeProduct = (e) => {
    const value = e.target.value;
    setSelectedItem(value)
    if (value.length > 0) {
      const filter = productData.filter(
        (item) =>
          item.productName.toLowerCase().includes(value.toLowerCase())
      );
    
      setFiltereProductSuggestions(filter);
      setShowSuggestions2(true);
    } else {
      setShowSuggestions2(false);
    }
    
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    fetchBillData(suggestion.phone, suggestion.type)
    setSelectedCustomer(suggestion)
    setIsSelected (true)
    setShowSuggestions(false);
    // dispatch(addProduct(suggestion));
  };

  const handleSuggestionProductClick = (suggestion) => {
    setSelectedItem(suggestion.productName)
    setIsSelected (true)
    dispatch(addProduct(suggestion));
  };

  const handleDoubleClick = (index, currentQuantity) => {
    setEditingIndex(index);
    setTempQuantity(currentQuantity);
  };

  const handleBlur = (index) => {
    if (tempQuantity !== "") {
      const newQuantity = parseInt(tempQuantity, 10);
      if (!isNaN(newQuantity) && newQuantity > 0) {
        dispatch(updateQuantity({ index, quantity: newQuantity }));
      }
    }
    setEditingIndex(null);
  };

  const handleInputChange = (e) => {
    setTempQuantity(e.target.value);
  };


  const removeProduct = (index) => {
    dispatch(deleteProduct(index)); // Dispatch delete action
  };

  const handleClearAll = () => {
    dispatch(clearAllProducts()); 
  };

  const toggleAssignModal = (e) => {
    e.preventDefault()
    setSelectedCustomer([])
    setIsSelected(false)
    // setModal(!modal)
  }
  const toggleDeleteModal = (e) => {
    setDeleteModal(!deleteModal)
  }

  const toggleDuplicateModal = (e) => {
    setDuplicateModal(!duplitcateModal)
  }

  const resetForm = () => {
    setFormData({
      productName:"",
      quantity: 0
    })
  }



  const styles = {
    container: {
      padding: '0px',
      maxWidth: '700px',
      margin: '0 auto',
      marginTop:"5px"
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textDecoration:"underline"
    },
    table: {
      width: '100%',
      textAlign: 'left',
      borderCollapse: 'collapse',
    },
    th: {
      borderBottom: '1px solid #ddd',
      padding: '8px',
    },
    td: {
      padding: '8px',
      borderBottom: '1px solid #ddd',
    },
    tdRight: {
      textAlign: 'right',
    },
    action: {
      textAlign: 'center',
      color: 'red',
      cursor: 'pointer',
    },
    subtotalRow: {
      fontWeight: '600',
    },
    grandTotalRow: {
      fontWeight: 'bold',
    },
  };


  const calculateTotal = () => {
  return selectedProducts.reduce((total, product) => {
    const baseAmount = product.value * product.quantity;
    const gstPercent = gst === "gst" ? (product.gst || 5) : 0;
    const gstAmount = (baseAmount * gstPercent) / 100;
    return total + baseAmount + gstAmount;
  }, 0);
};

console.log(calculateTotal())

  // GENERATE THE ID FOR A CREATING USER
  function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const randomNumber = Math.floor(Math.random() * 100);
    return randomString + randomNumber;
  }



  const onBillSubmit = async() => {
    
    const orderNo = generateRandomId(10)
    let submittedData = {
      orderId: orderNo,
      customerName:selectedCustomer.name,
      phone:selectedCustomer.phone,
      totalAmount: calculateTotal().toFixed(2),
      createdBy: userData._id,
      productName:selectedProducts.map(product => product.productName),
      productCode:selectedProducts.map(product => product.productCode),
      quantity: selectedProducts.map(product=> product.quantity),
      value: selectedProducts.map(product => product.value),
      session : session,
      createdAt: startIconDate.toISOString(),
      gstPercentage : 5,
      gst : selectedCustomer.gst === "gst" ? true : false
    };
    try{
      const response = await axios.post(process.env.REACT_APP_BACKENDURL+"/api/bill", submittedData);
      if (response.status === 200) {
        successToast("Updated Successfully")
        fetchBillData(selectedCustomer.phone, selectedCustomer.type)
        handleClearAll()
        setSession("")
      }
      else if (response.status === 201) {
        successToast("Added Successfully")
        fetchBillData(selectedCustomer.phone, selectedCustomer.type)
        // resetForm();
        // setModal(false)
        // localStorage.setItem('orderNo', orderNo);
        // localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts))
        // localStorage.setItem('submittedData', JSON.stringify(submittedData));
        // await updateProductStock(selectedProducts);
        handleClearAll()
        setSession("")
       
      }
    
      else {
        warningToast()
      }
    }catch(err){
      if (err.response && err.response.data && err.response.data.message) {
        errorToast(err.response.data.message); // Display backend error message
      } else {
        errorToast("Something went wrong. Please try again.");
      }
    }
  };

  
  const options = [
    { value: "am", label: "Am" },
    { value: "pm", label: "Pm" }
  ];

    const [filterCustomerType, setFilterCustomerType] = useState(filteredSuggestions || []); 


    const normalizedSelectedType = selectedType?.trim().toLowerCase();

    const filterCustomerType2 =
    !normalizedSelectedType && !selectedStaffId
      ? filterCustomerType // Show all if nothing is selected
      : normalizedSelectedType === "all"
      ? filterCustomerType.filter((item) => item.staff === selectedStaffId)
      : normalizedSelectedType?.length > 4
      ? filterCustomerType.filter(
          (item) =>
            item.type.toLowerCase() === normalizedSelectedType &&
            (!selectedStaffId || item.staff === selectedStaffId)
        )
      : filterCustomerType.filter((item) => !selectedStaffId || item.staff === selectedStaffId);

    const processBillData = (data) => {
    const sourceData = unpaidBillEdit ? selectedBill : data;
    
    const groupedData = {};
      
    sourceData.forEach((item) => {
      const date = new Date(item.createdAt).toLocaleDateString('en-GB'); // Format date as DD/MM/YYYY
      const session = item.session;
  
      if (!groupedData[date]) {
        groupedData[date] = { am: null, pm: null };
      }
  
      groupedData[date][session] = item;
    });
  
    return Object.entries(groupedData).map(([date, sessions], index) => ({
      sno: index + 1,
      date,
      am: sessions.am,
      pm: sessions.pm,
    }));
  };


  const groupedData = processBillData(billData);
  const handleClick = (id, value) => {
    setEditingId(id);
    setEditedValue(value);  // Set the initial value to be edited
    setShowTextBox(true);  // Show the input field
  };

  const handleChangevalue = (e) => {
    setEditedValue(e.target.value);  // Track the input field value
  };

  const handleBlurOrEnter = () => {
    // Make sure the edited value is a valid number
    const newValue = parseFloat(editedValue) || 0;
    
    // Dispatch the update to Redux
    dispatch(updateProductValue({ id: editingId, newValue }));
    
    // Hide the input field and reset state
    setShowTextBox(false);
    setClickCount(0);
    setEditingId(null);
    setEditedValue(""); // Reset edited value after update
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlurOrEnter(); // Trigger the blur function on Enter
    }
  };

  const formatQuantityWithPrice = (quantity, value) => {
    return quantity.map((qty, index) => `${qty} * ${value[index]}`).join(', ');
  };

  const handleFocus = () => {
    setFilterCustomerType(data); // Replace with your complete customer data list
    setShowSuggestions(true); // Ensure suggestions are displayed
  };
  

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // Month is zero-based
  const currentDay = currentDate.getDate();
  const currentDayOfWeek = currentDate.getDay();

  // For Monthly Bill
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // For Weekly Bill
  const startOfWeek = new Date(currentYear, currentMonth, currentDay - currentDayOfWeek + 1); // Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

  // Helper function to format date
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleGenerateInvoice = async () => {

    const isGenerated = true
    const invoiceNo = billData[0]?.invoiceNo || ""
   
    try {
      for (const bill of billData) {
        await axios.put(process.env.REACT_APP_BACKENDURL+`/api/bill/invoiceGenerate/${bill._id}`, { isGenerated, invoiceNo });
        console.log(`Invoice updated for ID: ${bill._id}`);
      }
      successToast("Invoice Generated Successfully!");
      fetchBillData(selectedCustomer.phone, selectedCustomer.type)
    } catch (error) {
      console.error("Error updating invoices:", error);
      errorToast("An error occurred while updating invoices.");
    }
  };


  const handleCreateInvoice = async () => {
    if (!invoiceNo) {
      errorToast("Please enter an invoice number.");
      return;
    }
    const fromDate = selectedCustomer.type === "monthly" 
      ? formatDate(startOfMonth) 
      : selectedCustomer.type === "weekly" 
        ? formatDate(startOfWeek) 
        : formatDate(currentDate);
    const toDate = selectedCustomer.type === "monthly" 
        ? formatDate(endOfMonth) 
        : selectedCustomer.type === "weekly" 
          ? formatDate(endOfWeek) 
          : formatDate(currentDate);
    try {
      for (const bill of billData) {
        await axios.put(process.env.REACT_APP_BACKENDURL+`/api/bill/invoiceUpdate/${bill._id}`, { invoiceNo, fromDate, toDate });
        console.log(`Invoice updated for ID: ${bill._id}`);
      }
      successToast("Invoice Number Created successfully");
      fetchBillData(selectedCustomer.phone, selectedCustomer.type)
    } catch (error) {
      console.error("Error updating invoices:", error);
      errorToast("An error occurred while updating invoices.");
    }
  };

  function convertNumberToWords(num) {
    if (num === 0) return 'Zero';
  
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];
  
    function convertLessThanThousand(n) {
      let str = '';
      if (n >= 100) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 11 && n <= 19) {
        str += teens[n - 11] + ' ';
      } else {
        if (n >= 20 || n === 10) {
          str += tens[Math.floor(n / 10)] + ' ';
          n %= 10;
        }
        if (n > 0 && n < 10) {
          str += units[n] + ' ';
        }
      }
      return str.trim();
    }
  
    let words = '';
    let chunkIndex = 0;
  
    while (num > 0) {
      let chunk = num % 1000;
      if (chunk > 0) {
        words = convertLessThanThousand(chunk) + (thousands[chunkIndex] ? ' ' + thousands[chunkIndex] : '') + ' ' + words;
      }
      num = Math.floor(num / 1000);
      chunkIndex++;
    }
  
    return words.trim();
  }

  const onEditClick = (id) => {
    const sourceData = unpaidBillEdit ? selectedBill : billData;
    sourceData.forEach((item) => {
      if (item._id === id) {
        setFormData({
          productName : [... item.productName],
          quantity    : [... item.quantity]
        });
        
        setModal(true)
        setSelectedProduct(item)
        setTotalProduct(item.productName.length)
        fetchUnpaidBills();
      }
    });
  };

  const onDuplicateClick = (id) => {  
    billData.forEach((item) => {
      if (item._id === id) {
        setFormData({
          productName : [... item.productName],
          quantity    : [... item.quantity]
        });
        setDuplicateId(id)
        setDuplicateModal(true)
        setSelectedProduct(item)
        setTotalProduct(item.productName.length)
       
      }
    });
  };

  const handleUpdate = async() => {
    try {
      const updatedData = {
        ...selectedProduct,
        quantity: formData.quantity || selectedProduct.quantity,  // Ensure updated quantities
      };
  
      const response = await fetch(process.env.REACT_APP_BACKENDURL+`/api/bill/updateQuantity/${selectedProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update order");
      }
  
      const result = await response.json();
      successToast("Bill updated successfully!");
      setModal(false)
      fetchBillData(selectedCustomer.phone, selectedCustomer.type)
    } catch (error) {
      errorToast("Something went wrong. Please try again.");
    }
  }

  const handleDuplicateSubmit = async(selectedProduct) => {

  const totalAmount = selectedProduct.value.reduce((sum, val, index) => {
    const qty = formData.quantity[index] ?? 0;
    return sum + val * qty;
  }, 0);


    const orderNo = generateRandomId(10)
      let submittedData = {
        orderId: orderNo,
        customerName: selectedCustomer.name,
        phone: selectedCustomer.phone,
        totalAmount: totalAmount,
        createdBy: userData._id,
        productName: selectedProduct.productName, 
        productCode: selectedProduct.productCode,  
        quantity: formData.quantity, 
        value: selectedProduct.value,             
        session: session,
        createdAt: startIconDate.toISOString(),
      };

   
    try{
      const response = await axios.post(process.env.REACT_APP_BACKENDURL+"/api/bill", submittedData);
      if (response.status === 200) {
        successToast("Updated Successfully")
        fetchBillData(selectedCustomer.phone, selectedCustomer.type)
        handleClearAll()
        setSession("")
        toggleDuplicateModal()
      }
      else if (response.status === 201) {
        successToast("Added Successfully")
        fetchBillData(selectedCustomer.phone, selectedCustomer.type)
        handleClearAll()
        setSession("")
        toggleDuplicateModal()
      }
    
      else {
        warningToast()
      }
    }catch(err){
      if (err.response && err.response.data && err.response.data.message) {
        errorToast(err.response.data.message); // Display backend error message
      } else {
        errorToast("Something went wrong. Please try again.");
      }
    }
  }

  const handleDeleteBill = async() => {
    try{
      const response = await axios.delete(process.env.REACT_APP_BACKENDURL+`/api/bill/deleteBill/${deleteId}`)
      if(response.status === 200){
        successToast("Bill Deleted Successfully")
        setDeleteModal(false)
        fetchBillData(selectedCustomer.phone, selectedCustomer.type)
      }
    }catch(err){
      errorToast("An error occurred while deleting the bill.")
    }
  }

  const total = groupedData.reduce((acc, row) => {
    const amTotal = row.am ? row.am.value.reduce((sum, num, index) => sum + num * row.am.quantity[index], 0) : 0;
    const pmTotal = row.pm ? row.pm.value.reduce((sum, num, index) => sum + num * row.pm.quantity[index], 0) : 0;
    return acc + amTotal + pmTotal;
  }, 0);

  const totalWithGST = selectedCustomer?.gst === "gst" ? total * 1.05 : total;
  
  return (
    <React.Fragment>
     <Head title="Billing"></Head>
    
          <Content>
        <Block size="lg">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom:"20px" }}>
            {/* Left-aligned Title */}
            <BlockTitle page tag="h3">
              Billing Page
            </BlockTitle>
        <div className="search-bar" ref={wrapperRef}>
            <input
              type="text"
              placeholder="Enter Customer Name..."
              value={query}
              onChange={handleChange}
              onFocus={handleFocus}
              className="search-input"
            />
            <span className="search-icon">
              <Icon name="search" />
            </span>
            {showSuggestions && (
              <ul className="suggestions2">
                {filterCustomerType2.map((suggestion, index) => (
                  <li key={index} className="suggestion-item">
                    {suggestion.name.slice(0, 20)} ({suggestion.phone})
                    <Button
                      className="add-button"
                      color="primary"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      Select
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
            {selectedCustomer.name?.length > 0 &&
            <Button color="primary" onClick={toggleAssignModal}>Clear</Button>
            }
            {!selectedCustomer.name?.length > 0 && 
            <div style={{ display: "flex", gap: "1rem" }}>
            <UncontrolledDropdown>
                <DropdownToggle
                  tag="a"
                  className="dropdown-toggle btn btn-white btn-dim btn-outline-light"
                >
                  <Icon className="d-none d-sm-inline" name="user" />
                  <span>
                    <span className="d-none d-md-inline">
                      {selectedStaff || "Select Staff"}
                    </span>
                  </span>
                  <Icon className="dd-indc" name="chevron-right" />
                </DropdownToggle>
                <DropdownMenu>
                  <ul className="link-list-opt no-bdr">
                    {/* Add the "All" option */}
                    <li>
                      <DropdownItem
                        tag="a"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setSelectedStaff("All"); // Set selected staff to "All"
                          setSelectedStaffId(null); // Clear the selected staff ID
                        }}
                        href="#dropdownitem"
                      >
                        <span>All</span>
                      </DropdownItem>
                    </li>

                    {/* Render staff data */}
                    {staffData.map((staff) => (
                      <li key={staff._id}>
                        <DropdownItem
                          tag="a"
                          onClick={(ev) => {
                            ev.preventDefault();
                            setSelectedStaff(staff.name); // Update selectedType with staff name
                            setSelectedStaffId(staff._id); // Store selected staff ID
                          }}
                          href="#dropdownitem"
                        >
                          <span>{staff.name}</span>
                        </DropdownItem>
                      </li>
                    ))}
                  </ul>
                </DropdownMenu>
              </UncontrolledDropdown>

                
            <UncontrolledDropdown>
            <DropdownToggle
              tag="a"
              className="dropdown-toggle btn btn-white btn-dim btn-outline-light"
            >
              <Icon className="d-none d-sm-inline" name="calender-date" />
              <span>
                <span className="d-none d-md-inline">
                  {selectedType.length > 1 ? selectedType : "Select Type"}
                </span>
              </span>
              <Icon className="dd-indc" name="chevron-right" />
            </DropdownToggle>
            <DropdownMenu>
              <ul className="link-list-opt no-bdr">
                <li>
                  <DropdownItem
                    tag="a"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setSelectedType("All");
                    }}
                    href="#!"
                  >
                    <span>All</span>
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem
                    tag="a"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setSelectedType("Daily");
                    }}
                    href="#dropdownitem"
                  >
                    <span>Daily</span>
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem
                    tag="a"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setSelectedType("Weekly");
                    }}
                    href="#dropdownitem"
                  >
                    <span>Weekly</span>
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem
                    tag="a"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setSelectedType("Monthly");
                    }}
                    href="#dropdownitem"
                  >
                    <span>Monthly</span>
                  </DropdownItem>
                </li>
              </ul>
            </DropdownMenu>
          </UncontrolledDropdown>
          
            </div>
          }
          </div>
          <Row className="g-gs">
            <Col lg="4">
              <PreviewCard>
              <div style={{display:"flex", justifyContent:"space-between"}}>
              {isSelected ?
                <h5 style={{ textDecoration: 'underline' }} className="card-title">{!billData[0]?.isGenerated === true ? "Select Item" : "Bill Generated"}</h5> : <p style={{ minHeight: '210px' }}>Select the Customer</p>  }
               
              <h5 style={{color:"red"}}>{isSelected && !billData[0]?.isGenerated === true  ?  selectedCustomer?.name : ""}</h5>
              </div>
          {!isSelected ?  
          <div  className="search-bar mt-5">
          {/* <p style={{ minHeight: '210px' }}>No products added to the bill.</p> */}
            {/* <input
              type="text"
              placeholder="Enter Customer Name..."
              value={query}
              onChange={handleChange}
              className="search-input"
            />
            <span className="search-icon">
              <Icon name="search" />
            </span>
            {showSuggestions && (
              <ul className="suggestions2">
                {filterCustomerType.map((suggestion, index) => (
                  <li key={index} className="suggestion-item">
                    {suggestion.name.slice(0,20)} ({suggestion.phone})
                    <Button className="add-button" color="primary" size="sm" onClick={() => handleSuggestionClick(suggestion)}>
                      Select
                    </Button>
                  </li>
                ))}
              </ul>
            )} */}
          </div>
          
          
            :
            
            <div className="search-bar mt-5" ref={productWrapperRef}>
      {billData[0]?.isGenerated !== true ? (
        <>
          <input
            type="text"
            placeholder="Enter Item Name..."
            value={selectedItem}
            onChange={handleChangeProduct}
            className="search-input"
          />
          <span className="search-icon">
            <Icon name="search" />
          </span>
          {showSuggestions2 && (
            <ul className="suggestions2">
              {filterProductSuggestions.map((suggestion, index) => (
                <li key={index} className="suggestion-item">
                  {suggestion.productName.slice(0, 20)} ({suggestion.productCode})
                  <Button
                    className="add-button"
                    color="primary"
                    size="sm"
                    onClick={() => handleSuggestionProductClick(suggestion)}
                  >
                    Select
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
          }
              </PreviewCard>
            </Col>
            
            <Col lg="8">
              <PreviewCard >
              {/* <h5 style={{ textDecoration: 'underline' }} className="card-title">Billing</h5> */}
              {isSelected && selectedProducts.length > 0 ? (
                <div style={{ minHeight: '300px' }}>
               

                  <div style={styles.container}>
                        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"20px"}}>
                        <h2 style={styles.title}>Bill Details </h2>
                        <Col sm="3">
                        <FormGroup>
                        
                          {/* <Label>Select the Date</Label> */}
                          <div style={{width:"115px", marginLeft:"50px"}} className="form-control-wrap">
                            
                        <DatePicker
                          selected={startIconDate}
                          className="form-control date-picker"
                          onChange={(date) => setStartIconDate(date)}
                          dateFormat="dd-MM-yyyy"
                          minDate={
                            selectedCustomer?.type === "monthly"
                              ? new Date(new Date().getFullYear(), new Date().getMonth(), 1) // first day of this month
                              : selectedCustomer?.type === "weekly"
                              ? (() => {
                                  const today = new Date();
                                  const day = today.getDay(); // 0 = Sunday, 1 = Monday, ...
                                  const diffToMonday = (day === 0 ? -6 : 1) - day;
                                  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday);
                                })()
                              : null
                          }
                          maxDate={
                            selectedCustomer?.type === "monthly"
                              ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // last day of this month
                              : selectedCustomer?.type === "weekly"
                              ? (() => {
                                  const today = new Date();
                                  const day = today.getDay();
                                  const diffToMonday = (day === 0 ? -6 : 1) - day;
                                  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday);
                                  return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6); // Sunday
                                })()
                              : new Date()
                          }
                        />
                          </div>
                          {/* <div className="form-note">
                            Date Format <code>mm/dd/yyyy</code>
                          </div> */}
                        </FormGroup>
                      </Col>
                     
                    <Col sm="2">
                      <FormGroup>
                        <RSelect
                        options = {options}
                        onChange = {(e)=> {setSession(e.value)}}
                        />
                      </FormGroup>
                    </Col>
                    
                   
                        </div>
                          <table style={styles.table}>
                            <thead>
                              <tr>
                                <th style={styles.th}>Product Name</th>
                                <th style={styles.th}>Price</th>
                                <th style={styles.th}>Quantity</th>
                                {selectedCustomer.gst === "gst" && <th style={styles.th}>GST</th>}
                                <th style={styles.th}>Total</th>
                                <th style={styles.th}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedProducts.map((product, index) => (
                                <tr key={index}>
                                  <td style={styles.td}>{product.productName}</td>
                                  
                                  <td style={styles.td}>
                                  {editingId === product._id ? (
                                <input
                                  style={{ width: "100px" }}
                                  className="form-control"
                                  type="number"
                                  value={editedValue} 
                                  onChange={handleChangevalue}
                                  onBlur={handleBlurOrEnter}
                                  onKeyDown={handleKeyDown}
                                  autoFocus
                                />
                                  ) : (
                                    <span onDoubleClick={() => handleClick(product._id, product.value)}>
                                      Rs. {product.value.toFixed(2)}
                                    </span>
                                  )}
                                   </td>
                                   <td style={styles.td}>
                                      {/* <button size="sm" onClick={() => dispatch(decreaseQuantity(index))}>
                                        -
                                      </button> */}
                                      {editingIndex === index ? (
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={tempQuantity}
                                          onChange={handleInputChange}
                                          onBlur={() => handleBlur(index)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") handleBlur(index);
                                          }}
                                          style={{ width: "50px", textAlign: "center" }}
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          onDoubleClick={() => handleDoubleClick(index, product.quantity)}
                                          style={{ cursor: "pointer", padding: "0 10px" }}
                                        >
                                          {product.quantity}
                                        </span>
                                      )}
                                      {/* <button size="sm" onClick={() => dispatch(increaseQuantity(index))}>
                                        +
                                      </button> */}
                                    </td>
                                  {/* <td style={styles.td}>${item.gst.toFixed(2)}</td>
                                  <td style={styles.td}>${item.total.toFixed(2)}</td> */}

                                 {selectedCustomer.gst === "gst" && (
                                    <td style={styles.td}>
                                      Rs. {((product.value * product.quantity * (product.gst || 5)) / 100).toFixed(2)}
                                    </td>
                                  )}
                                  <td style={styles.td}>
                                    Rs {(
                                      product.value * product.quantity +
                                      (gst === "gst" ? (product.value * product.quantity * (product.gst || 5)) / 100 : 0)
                                    ).toFixed(2)}
                                  </td>

                                  <td style={{ ...styles.td, ...styles.action }}>
                                  <Button  size="sm" onClick={() => removeProduct(index)}>
                                    <Icon name="trash"></Icon>
                                  </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  
                              {/* <tr>
                                <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.subtotalRow }}>
                                  Subtotal (excl. GST):
                                </td>
                                <td style={{ ...styles.td, ...styles.subtotalRow }}>${subtotal.toFixed(2)}</td>
                                <td style={{ ...styles.td, ...styles.subtotalRow }}>45</td>
                                <td style={styles.td}></td>
                              </tr> */}
                              
                              {/* <tr>
                                <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.subtotalRow }}>
                                  Total GST:
                                </td>
                                <td style={{ ...styles.td, ...styles.subtotalRow }}>200</td>
                                <td style={{ ...styles.td, ...styles.subtotalRow }}>${totalGST.toFixed(2)}</td>
                                <td style={styles.td}></td>
                              </tr> */}

                              <tr>
                                  <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.subtotalRow }}>
                                    Total GST:
                                  </td>
                                  <td style={{ ...styles.td, ...styles.subtotalRow }}>
                                    Rs. {selectedProducts.reduce((sum, product) => {
                                      const base = product.value * product.quantity;
                                      const gstAmount = gst === "gst" ? (base * (product.gst || 5)) / 100 : 0;
                                      return sum + gstAmount;
                                    }, 0).toFixed(2)}
                                  </td>
                                </tr>
                              <tr>
                                <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.grandTotalRow }}>
                                  Grand Total 
                                </td>
                                <td style={{ ...styles.td, ...styles.grandTotalRow }}>Rs. {calculateTotal().toFixed(2)}</td>
                                <td style={styles.td}></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                  <div style={{display:"flex", justifyContent:"flex-end", alignItems:"flex-end", marginTop:"20px"}}>
                  <Button color="danger" onClick={handleClearAll} style={{marginRight:"8px"}} >Clear All</Button>
                  <Button onClick={onBillSubmit} disabled={session.length < 1} color="primary">Add</Button>
                  </div>

                 
                </div>
              ) : (
                <p style={{ minHeight: '210px' }}>No products added to the bill.</p>
               
              )}
            
              </PreviewCard>
            </Col>
            
            <Col lg={12}>
            <PreviewCard>
           {(isSelected && unpaidBillEdit && selectedCustomer.paymentPending) || 
                  (billData.length > 0 && !unpaidBillEdit && !billData[0]?.isGenerated) ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <h4>
                            {selectedCustomer?.name}'s {selectedCustomer.type.charAt(0).toUpperCase() + selectedCustomer.type.slice(1)} Bill
                          </h4>
                          <p>
                            Staff Name : {staffName}
                          </p>
                          {selectedCustomer.type === "monthly" ? (
                            <p>
                              {formatDate(startOfMonth)} to {formatDate(endOfMonth)}
                            </p>
                          ) : selectedCustomer.type === "weekly" ? (
                            <p>
                              {formatDate(startOfWeek)} to {formatDate(endOfWeek)}
                            </p>
                          ) : selectedCustomer.type === "daily" ? (
                            <p>{formatDate(new Date())}</p>
                          ) : null}
                        </div>
                        <div>
                        {!unpaidBillEdit && 
                          <div style={{ display: "flex" }}>
                            {!billData[0]?.invoiceNo ? 
                              <>
                                <Input
                                  type="text"
                                  style={{
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                  }}
                                  value={invoiceNo}
                                  onChange={(e) => setInvoiceNo(e.target.value)}
                                  placeholder="Enter Invoice No"
                                />
                                <Button
                                  onClick={handleCreateInvoice}
                                  className="btn-icon ml-2 pr-2"
                                  color="primary">
                                  <Icon name="notes-alt" />
                                  Create
                                </Button>
                              </>
                              :
                              <>
                                <span style={{color:"white", fontSize:"13px", alignItems:"center", padding:"10px"}} class="badge bg-dark">Invoice No : {billData[0].invoiceNo}</span>
                                {!selectedBill[0]?.isGenerated &&
                                <Button
                                  onClick={handleGenerateInvoice}
                                  className="btn-icon ml-2 pr-2"
                                  color="primary"
                                >
                                  <Icon name="notes-alt" />
                                  Generate
                                </Button>
                                 }
                              </>
                            }
                          </div>
                        }
                        {selectedCustomer.paymentPending && (
                        <div style={{ width:"200px", marginTop:"30px", margin: "10px"}}>
                          {!unpaidBillEdit && <p>You have option to edit</p>}
                          <RSelect
                            onChange={handleBillSelect}
                            defaultValue={{ value: "current", label: "Current" }}
                            options={filteredUnpaidBillData.map(bill => ({
                              value: bill?.invoiceNo || "current",
                              label: bill?.fromDate && bill?.toDate 
                                ? `${bill.fromDate} - ${bill.toDate}` 
                                : "Current",
                            }))}
                          />
                          </div>
                      )}

                        </div>
                      </div>

                      {/* Bill Selection Dropdown for Pending Payments */}
                      
                      <TableContainer
                        component={Paper}
                        style={{
                          maxWidth: 1100,
                          margin: "20px auto",
                          borderRadius: "10px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <Table>
                          <TableHead style={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                              <TableCell align="center"><b>Sno</b></TableCell>
                              <TableCell align="center"><b>Date</b></TableCell>
                              <TableCell align="center" colSpan={3}><b>AM</b></TableCell>
                              <TableCell align="center" colSpan={2}><b>PM</b></TableCell>
                              <TableCell></TableCell>
                              <TableCell align="center"><b>Amount</b></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell />
                              <TableCell />
                              <TableCell align="center"><b>Items</b></TableCell>
                              <TableCell align="center"><b>Qty</b></TableCell>
                              <TableCell align="center"><b></b></TableCell>
                              <TableCell align="center"><b>Items</b></TableCell>
                              <TableCell align="center"><b>Qty</b></TableCell>
                              <TableCell align="center"><b></b></TableCell>
                              <TableCell align="center"><b></b></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {groupedData.map((row) => (
                              <TableRow key={row.sno}>
                                <TableCell align="center">{row.sno}</TableCell>
                                <TableCell align="center">{row.date}</TableCell>
                                <TableCell align="center">{row.am ? row.am.productName.join(", ") : "-"}</TableCell>
                                <TableCell align="center">{row.am ? formatQuantityWithPrice(row.am.quantity, row.am.value) : "-"}</TableCell>
                                <TableCell align="center">
                                  <ul className="nk-tb-actions gx-1">
                                    <li>
                                      <UncontrolledDropdown>
                                        <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                          <Icon name="more-h"></Icon>
                                        </DropdownToggle>
                                        <DropdownMenu right>
                                          <ul className="link-list-opt no-bdr">
                                            <li onClick={() => onEditClick(row.am._id)}>
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
                                            {!unpaidBillEdit &&
                                            <li onClick={() => setDeleteId(row.am._id)}>
                                              <DropdownItem
                                                tag="a"
                                                href="#delete"
                                                onClick={(ev) => {
                                                  ev.preventDefault();
                                                  setDeleteModal(true);
                                                }}
                                              >
                                                <Icon name="trash"></Icon>
                                                <span>Delete</span>
                                              </DropdownItem>
                                            </li>
                                            }
                                            {!unpaidBillEdit &&
                                            <li onClick={() => onDuplicateClick(row.am._id)}>
                                              <DropdownItem
                                                tag="a"
                                                href="#duplicate"
                                                onClick={(ev) => {
                                                  ev.preventDefault();
                                                }}
                                              >
                                                <Icon name="copy"></Icon>
                                                <span>Duplicate</span>
                                              </DropdownItem>
                                            </li>
                                            }
                                          </ul>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    </li>
                                  </ul>
                                </TableCell>
                                <TableCell align="center">{row.pm ? row.pm.productName.join(", ") : "-"}</TableCell>
                                <TableCell align="center">{row.pm ? formatQuantityWithPrice(row.pm.quantity, row.pm.value) : "-"}</TableCell>
                                <TableCell align="center">
                                  <ul className="nk-tb-actions gx-1">
                                    <li>
                                      <UncontrolledDropdown>
                                        <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                          <Icon name="more-h"></Icon>
                                        </DropdownToggle>
                                        <DropdownMenu right>
                                          <ul className="link-list-opt no-bdr">
                                            <li onClick={() => onEditClick(row.pm._id)}>
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
                                          {!unpaidBillEdit &&
                                            <li onClick={() => setDeleteId(row.pm._id)}>
                                              <DropdownItem
                                                tag="a"
                                                href="#delete"
                                                onClick={(ev) => {
                                                  ev.preventDefault();
                                                  setDeleteModal(true);
                                                }}
                                              >
                                                <Icon name="trash"></Icon>
                                                <span>Delete</span>
                                              </DropdownItem>
                                            </li>
                                          }
                                            {!unpaidBillEdit &&
                                            <li onClick={() => onDuplicateClick(row.pm._id)}>
                                              <DropdownItem
                                                tag="a"
                                                href="#duplicate"
                                                onClick={(ev) => {
                                                  ev.preventDefault();
                                                }}
                                              >
                                                <Icon name="copy"></Icon>
                                                <span>Duplicate</span>
                                              </DropdownItem>
                                            </li>
                                            }
                                          </ul>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    </li>
                                  </ul>
                                </TableCell>
                               <TableCell align="center">
                                  {(() => {
                                    const amTotal = row.am ? row.am.value.reduce((sum, num, index) => sum + num * row.am.quantity[index], 0) : 0;
                                    const pmTotal = row.pm ? row.pm.value.reduce((sum, num, index) => sum + num * row.pm.quantity[index], 0) : 0;
                                    const subtotal = amTotal + pmTotal;
                                    
                                    if (subtotal === 0) return "-";
                                    
                                    const finalAmount = selectedCustomer?.gst === "gst" ? subtotal * 1.05 : subtotal;
                                    return Math.floor(finalAmount.toFixed(2));
                                  })()}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={6} align="left">
                                Total Amount (in words) : {convertNumberToWords(Math.round(totalWithGST))} Rupees Only
                              </TableCell>
                              <TableCell/>
                              <TableCell/>
                              <TableCell colSpan={2} align="center">{Math.round(totalWithGST)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  ) : selectedCustomer.paymentPending ? (
                    <div style={{width:"200px"}}>
                      <p>You have option to edit</p>
                      <RSelect
                        onChange={handleBillSelect}
                        defaultValue={{ value: "current", label: "Current" }}
                          options={filteredUnpaidBillData.map(bill => ({
                            value: bill?.invoiceNo || "current",
                            label: bill?.fromDate && bill?.toDate 
                              ? `${bill.fromDate} - ${bill.toDate}` 
                              : "Current",
                          }))}
                      />
                    </div>
                  ) : (
                    <p style={{ minHeight: "210px" }}>
                      {selectedCustomer && billData.length === 0 ? "Select Customer to View." :  "Bill Generated"}
                    </p>
                  )}
                  </PreviewCard>
             </Col>
            
          </Row>
        </Block>
      </Content>


      <Modal isOpen={modal} className="modal-dialog-centered" size="lg" toggle={() => setModal(false)}>
        <ModalBody>
          <a
            href="#dropdownitem"
            onClick={(ev) => {
              ev.preventDefault();
              setModal(false);
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">Update Product Quantity</h5>
            <ul className="nk-nav nav nav-tabs">
              <li className="nav-item">
                <a
                  className={`nav-link ${modalTab === "1" && "active"}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    setModalTab("1");
                    resetForm()
                  }}
                  href="#personal"
                >
                  {/* Individual */}
                </a>
              </li>
            </ul>

            {selectedProduct?.productName?.map((name, index) => (
              <div key={index} className="tab-content">
                <Row className="gy-4">
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label" htmlFor={`product-name-${index}`}>
                        Product No {index + 1}
                      </label>
                      <input
                        type="text"
                        id={`product-name-${index}`}
                        className="form-control"
                        name={`product-name-${index}`}
                        value={name}
                        disabled
                        placeholder="Enter name"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label" htmlFor={`quantity-${index}`}>
                        Quantity
                      </label>
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        className="form-control"
                        name={`quantity-${index}`}
                        value={formData.quantity[index] ?? selectedProduct.quantity[index]} 
                        onChange={(e) => {
                          const updatedQuantities = [...formData.quantity];
                          updatedQuantities[index] = Number(e.target.value);
                          setFormData((prev) => ({ ...prev, quantity: updatedQuantities }));
                        }}
                        placeholder="Enter Quantity"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            ))}


            {/* Complete and Cancel buttons outside the loop */}
            <Col style={{marginTop:"20px"}}  size="12">
              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                <li>
                  <Button
                    color="primary"
                    size="lg"
                    onClick={async (ev) => {
                      ev.preventDefault();
                      await handleUpdate();
                    }}
                  >
                    Save
                  </Button>
                </li>
                <li>
                  <a
                    href="#dropdownitem"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setModal(false);
                     resetForm()
                    }}
                    className="link link-light"
                  >
                    Cancel
                  </a>
                </li>
              </ul>
            </Col>
             
            </div>
     
        </ModalBody>
      </Modal>

                    
        <Modal isOpen={deleteModal} toggle={toggleDeleteModal} className="modal-dialog-centered" size="md">
         <ModalBody>
           <a
             href="#cancel"
             onClick={(ev) => {
               ev.preventDefault();
               toggleDeleteModal();
             }}
             className="close"
           >
             <Icon onClick={toggleDeleteModal} name="cross-sm"></Icon>
           </a>
           <div className="nk-modal-head ">   
             <div className="card-inner-group">
               <div className="card-inner p-0">
               <div  className="confirmation-container">
                 <h5 className="confirmation-message"> Please Confirm to Delete </h5>
                 <div className="confirmation-buttons">
                   <button className="confirm-button" onClick={handleDeleteBill}>Confirm</button>
                   <button className="cancel-button" onClick={toggleDeleteModal}>Cancel</button>
                 </div>
               </div>
               </div>
             </div>    
           </div>
         </ModalBody>
       </Modal>

        <Modal isOpen={duplitcateModal} className="modal-dialog-centered" size="lg" toggle={toggleDuplicateModal}>
        <ModalBody>
          <a
            href="#dropdownitem"
            onClick={(ev) => {
              ev.preventDefault();
              toggleDuplicateModal();
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">Duplicate Items</h5>
              <div style={{display:"flex", justifyContent:"space-between", margin:"20px"}}>
                 <div style={{width:"115px"  }} className="form-control-wrap">
                      
                    <DatePicker
                      selected={startIconDate}
                      className="form-control date-picker"
                      onChange={(date) => setStartIconDate(date)}
                      dateFormat="dd-MM-yyyy"
                      minDate={
                        selectedCustomer?.type === "monthly"
                          ? new Date(new Date().getFullYear(), new Date().getMonth(), 1) // first day of this month
                          : selectedCustomer?.type === "weekly"
                          ? (() => {
                              const today = new Date();
                              const day = today.getDay(); // 0 = Sunday, 1 = Monday, ...
                              const diffToMonday = (day === 0 ? -6 : 1) - day;
                              return new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday);
                            })()
                          : null
                      }
                      maxDate={
                        selectedCustomer?.type === "monthly"
                          ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // last day of this month
                          : selectedCustomer?.type === "weekly"
                          ? (() => {
                              const today = new Date();
                              const day = today.getDay();
                              const diffToMonday = (day === 0 ? -6 : 1) - day;
                              const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday);
                              return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6); // Sunday
                            })()
                          : new Date()
                      }
                    />
                  </div>
                <div style={{width:"100px"}}>
                  <RSelect
                    options = {options}
                    onChange = {(e)=> {setSession(e.value)}}
                  />
                </div>
              </div>
            <ul className="nk-nav nav nav-tabs">

            
              <li className="nav-item">
                <a
                  className={`nav-link ${modalTab === "1" && "active"}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    setModalTab("1");
                    resetForm()
                  }}
                  href="#personal"
                >
                  {/* Individual */}
                </a>
              </li>
            </ul>
                  
              
            {selectedProduct?.productName?.map((name, index) => (
              <div key={index} className="tab-content">
                <Row className="gy-4">
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label" htmlFor={`product-name-${index}`}>
                        Product No {index + 1}
                      </label>
                      <input
                        type="text"
                        id={`product-name-${index}`}
                        className="form-control"
                        name={`product-name-${index}`}
                        value={name}
                        disabled
                        placeholder="Enter name"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label" htmlFor={`quantity-${index}`}>
                        Quantity
                      </label>
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        className="form-control"
                        name={`quantity-${index}`}
                        value={formData.quantity[index] ?? selectedProduct.quantity[index]} 
                        onChange={(e) => {
                          const updatedQuantities = [...formData.quantity];
                          updatedQuantities[index] = Number(e.target.value);
                          setFormData((prev) => ({ ...prev, quantity: updatedQuantities }));
                        }}
                        placeholder="Enter Quantity"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            ))}


            {/* Complete and Cancel buttons outside the loop */}
            <Col style={{marginTop:"20px"}}  size="12">
              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                <li>
                  <Button
                    color="primary"
                    size="lg"
                    disabled={session?.length === 0}
                    onClick={async (ev) => {
                      ev.preventDefault();
                      await handleDuplicateSubmit(selectedProduct);
                    }}
                  >
                    Create Duplicate
                  </Button>
                </li>
                <li>
                  <a
                    href="#dropdownitem"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setModal(false);
                     resetForm()
                    }}
                    className="link link-light"
                  >
                    Cancel
                  </a>
                </li>
              </ul>
            </Col>
             
            </div>
     
        </ModalBody>
      </Modal>


    </React.Fragment>
  );
};

export default BillingLayout;
