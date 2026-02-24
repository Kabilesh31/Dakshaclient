import React, { useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { 
  Input, 
  Button, 
  Pagination, 
  PaginationItem, 
  PaginationLink, 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Row,
  Col,
  Label,
  FormGroup
} from "reactstrap";
import { errorToast } from "../../utils/toaster";
import * as XLSX from "xlsx";
import "./report.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf, FaEye, FaDownload } from "react-icons/fa";

const StaffReport = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [allBills, setAllBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [search, setSearch] = useState("");
  const [staffTypeFilter, setStaffTypeFilter] = useState("all"); // 'all', 'sales', 'delivery', 'manager'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Invoice modal state
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Calculate statistics based on staff type
  const calculateStats = () => {
    if (!filteredBills.length) return {
      totalOrders: 0,
      totalAmount: 0,
      collectedAmount: 0,
      pendingAmount: 0,
      deliveredOrders: 0,
      pendingDelivery: 0,
      assignedCustomers: 0
    };

    const totalOrders = filteredBills.length;
    const totalAmount = filteredBills.reduce((acc, bill) => acc + (bill.totalAmt || 0), 0);
    
    // For sales staff: payments collected vs pending
    const collectedAmount = filteredBills
      .filter(b => b.paymentMethod && b.paymentMethod !== null && b.paymentMethod !== "null")
      .reduce((acc, bill) => acc + (bill.totalAmt || 0), 0);
    
    const pendingAmount = totalAmount - collectedAmount;

    // For delivery staff: delivery status
    const deliveredOrders = filteredBills.filter(b => 
      b.orderStatus?.toLowerCase() === 'delivered'
    ).length;
    
    const pendingDelivery = filteredBills.filter(b => 
      !b.orderStatus || b.orderStatus?.toLowerCase() !== 'delivered'
    ).length;

    // For delivery staff: assigned customers (unique customers)
    const assignedCustomers = [...new Set(filteredBills.map(bill => 
      bill.customerId?._id || bill.customerId
    ))].filter(id => id).length;

    return {
      totalOrders,
      totalAmount,
      collectedAmount,
      pendingAmount,
      deliveredOrders,
      pendingDelivery,
      assignedCustomers
    };
  };

  const stats = calculateStats();

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/staff`
      );
      setStaffList(res.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      errorToast("Failed to fetch staff list");
    }
  };

  // Fetch all bills
  const fetchAllBills = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/bills`
      );
      setAllBills(res.data.bills || []);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      errorToast("Failed to fetch bills data");
    }
  };

  // Filter bills based on selected staff and type
  useEffect(() => {
    if (!selectedStaff || !allBills.length) {
      setFilteredBills([]);
      return;
    }

    let staffBills = [];
    
    // Filter based on staff type
    switch(selectedStaff.type?.toLowerCase()) {
      case 'manager':
        // Managers can see bills they created
        staffBills = allBills.filter(bill => 
          bill.createdBy === selectedStaff._id || 
          bill.createdBy === selectedStaff.name
        );
        break;
      
      case 'delivery':
        // Delivery personnel see bills assigned to them for delivery
        staffBills = allBills.filter(bill => 
          bill.deliveredBy === selectedStaff._id ||
          bill.deliveryPersonId === selectedStaff._id ||
          bill.staffId === selectedStaff._id
        );
        break;
      
      case 'sales':
      default:
        // Sales personnel see bills they created or collected payment for
        staffBills = allBills.filter(bill => 
          bill.createdBy === selectedStaff._id ||
          bill.paymentCollectedBy === selectedStaff._id ||
          bill.staffId === selectedStaff._id ||
          (bill.staff && bill.staff._id === selectedStaff._id)
        );
        break;
    }

    setFilteredBills(staffBills);
    setCurrentPage(1);
  }, [selectedStaff, allBills]);

  // Apply date filter
  useEffect(() => {
    if (!selectedStaff || !allBills.length) {
      setFilteredBills([]);
      return;
    }

    let staffBills = allBills.filter(bill => {
      // Staff filter logic
      const isStaffBill = 
        bill.createdBy === selectedStaff._id ||
        bill.paymentCollectedBy === selectedStaff._id ||
        bill.deliveredBy === selectedStaff._id ||
        bill.staffId === selectedStaff._id ||
        (bill.staff && bill.staff._id === selectedStaff._id);

      return isStaffBill;
    });
    
    // Apply date filter
    if (startDate && endDate) {
      const from = new Date(startDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      
      staffBills = staffBills.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= from && createdAt <= to;
      });
    }
    
    setFilteredBills(staffBills);
    setCurrentPage(1);
  }, [selectedStaff, allBills, startDate, endDate]);

  useEffect(() => {
    fetchStaff();
    fetchAllBills();
  }, []);

  // Get customer name from bill
  const getCustomerName = (bill) => {
    if (bill.customerName) return bill.customerName;
    if (bill.customerId?.name) return bill.customerId.name;
    return 'N/A';
  };

  // Function to open invoice modal
  const openInvoiceModal = (bill) => {
    setSelectedBill(bill);
    setInvoiceModal(true);
  };

  // Download invoice PDF
  const downloadInvoicePDF = () => {
    if (!selectedBill) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 37, 41);
    doc.text("Retail Pulse", 105, 20, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Order Invoice", 105, 30, { align: "center" });

    // Order ID and Date
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 37, 41);
    doc.text(`Order ID: #${selectedBill._id.toString().slice(-6)}`, 14, 45);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(selectedBill.createdAt).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })}`, 14, 52);

    // Order Status
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(46, 204, 113);
    doc.text(selectedBill.orderStatus || 'delivered', 160, 45);

    // Customer Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 37, 41);
    doc.text("Customer Details", 14, 67);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${getCustomerName(selectedBill)}`, 14, 75);
    doc.text(`Mobile: ${selectedBill.customerId?.mobile || selectedBill.customerId?.phone || 'N/A'}`, 14, 82);
    doc.text(`Address: ${selectedBill.customerId?.address || selectedBill.deliveryAddress || 'N/A'}`, 14, 89);

    // Staff Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 37, 41);
    doc.text("Staff Details", 120, 67);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    doc.text(`Name: ${selectedStaff?.name || selectedBill.staffName || 'N/A'}`, 120, 75);
    doc.text(`Type: ${selectedStaff?.type || 'staff'}`, 120, 82);
    doc.text(`Contact: ${selectedStaff?.mobile || selectedStaff?.phone || 'N/A'}`, 120, 89);

    // Products Table
    const tableColumn = ["S.No", "Product", "Qty", "Rate", "Amount"];
    const tableRows = selectedBill.orderedProducts?.map((product, idx) => [
      idx + 1,
      product.productName,
      product.qty.toString(),
      product.value?.toString() || '0',
      (product.value * product.qty).toString()
    ]) || [];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 105,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        font: 'helvetica'
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 70, halign: 'left' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 15;

    const subtotal = selectedBill.orderedProducts?.reduce(
      (sum, product) => sum + (product.value * product.qty), 
      0
    ) || selectedBill.totalAmt || 0;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Subtotal", 140, finalY);
    doc.text(`₹ ${subtotal.toLocaleString('en-IN')}`, 180, finalY, { align: 'right' });

    doc.text("Discount", 140, finalY + 8);
    doc.text(`₹ 0`, 180, finalY + 8, { align: 'right' });

    doc.text("Tax", 140, finalY + 16);
    doc.text(`₹ 0`, 180, finalY + 16, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 37, 41);
    doc.text("Total", 135, finalY + 28);
    doc.text(`₹ ${(selectedBill.totalAmt || 0).toLocaleString('en-IN')}`, 180, finalY + 28, { align: 'right' });

    doc.save(`Order_${selectedBill._id.toString().slice(-6)}.pdf`);
  };

  const exportPDF = () => {
    if (!selectedStaff) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text(`Staff Performance Report`, 14, 18);

    doc.setFontSize(12);
    doc.text(`Staff: ${selectedStaff.name} (${selectedStaff.type})`, 14, 26);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 14, 32);

    if (startDate && endDate) {
      doc.text(
        `Period: ${startDate.toLocaleDateString("en-IN")} - ${endDate.toLocaleDateString("en-IN")}`,
        14,
        38
      );
    }

    // Summary Section - Different for Sales vs Delivery
    doc.setFontSize(11);
    doc.setTextColor(33);
    
    if (selectedStaff.type?.toLowerCase() === 'delivery') {
      doc.text(`Total Orders: ${stats.totalOrders}`, 14, 48);
      doc.text(`Total Amount: Rs. ${stats.totalAmount.toLocaleString("en-IN")}`, 14, 54);
      doc.text(`Delivered Orders: ${stats.deliveredOrders}`, 14, 60);
      doc.text(`Pending Delivery: ${stats.pendingDelivery}`, 14, 66);
      doc.text(`Assigned Customers: ${stats.assignedCustomers}`, 14, 72);
      
      // Table for delivery
      const tableColumn = [
        "S.No",
        "Order No",
        "Customer",
        "Date",
        "Amount (Rs)",
        "Status",
      ];

      const tableRows = filteredBills.map((bill, idx) => [
        idx + 1,
        `#${bill._id.toString().slice(-6)}`,
        getCustomerName(bill),
        new Date(bill.createdAt).toLocaleDateString("en-IN"),
        (bill.totalAmt || 0).toLocaleString("en-IN"),
        bill.orderStatus || 'Pending',
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: "striped",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
        },
        columnStyles: {
          4: { halign: "right" },
        },
      });
    } else {
      doc.text(`Total Orders: ${stats.totalOrders}`, 14, 48);
      doc.text(`Total Amount: Rs. ${stats.totalAmount.toLocaleString("en-IN")}`, 14, 54);
      doc.text(`Collected Amount: Rs. ${stats.collectedAmount.toLocaleString("en-IN")}`, 14, 60);
      doc.text(`Pending Amount: Rs. ${stats.pendingAmount.toLocaleString("en-IN")}`, 14, 66);
      
      // Table for sales/manager
      const tableColumn = [
        "S.No",
        "Order No",
        "Customer",
        "Date",
        "Amount (Rs)",
        "Payment Status",
        "Order Status",
      ];

      const tableRows = filteredBills.map((bill, idx) => [
        idx + 1,
        `#${bill._id.toString().slice(-6)}`,
        getCustomerName(bill),
        new Date(bill.createdAt).toLocaleDateString("en-IN"),
        (bill.totalAmt || 0).toLocaleString("en-IN"),
        bill.paymentMethod ? "Paid" : "Pending",
        bill.orderStatus || 'Pending',
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        theme: "striped",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
        },
        columnStyles: {
          4: { halign: "right" },
        },
      });
    }

    doc.save(`${selectedStaff.name}_Report.pdf`);
  };
  
  const exportExcel = () => {
    if (!selectedStaff) return;
    
    let exportData;
    
    if (selectedStaff.type?.toLowerCase() === 'delivery') {
      exportData = filteredBills.map((bill, idx) => ({
        'S.No': idx + 1,
        'Order No': `#${bill._id.toString().slice(-6)}`,
        'Customer': getCustomerName(bill),
        'Date': new Date(bill.createdAt).toLocaleDateString('en-IN'),
        'Amount (₹)': bill.totalAmt || 0,
        'Delivery Status': bill.orderStatus || 'Pending',
      }));
    } else {
      exportData = filteredBills.map((bill, idx) => ({
        'S.No': idx + 1,
        'Order No': `#${bill._id.toString().slice(-6)}`,
        'Customer': getCustomerName(bill),
        'Date': new Date(bill.createdAt).toLocaleDateString('en-IN'),
        'Amount (₹)': bill.totalAmt || 0,
        'Payment Status': bill.paymentMethod ? 'Paid' : 'Pending',
        'Order Status': bill.orderStatus || 'Pending',
      }));
    }
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    
    let summaryData;
    if (selectedStaff.type?.toLowerCase() === 'delivery') {
      summaryData = [
        { 'Summary': 'Total Orders', 'Value': stats.totalOrders },
        { 'Summary': 'Total Amount', 'Value': `₹${stats.totalAmount.toLocaleString('en-IN')}` },
        { 'Summary': 'Delivered Orders', 'Value': stats.deliveredOrders },
        { 'Summary': 'Pending Delivery', 'Value': stats.pendingDelivery },
        { 'Summary': 'Assigned Customers', 'Value': stats.assignedCustomers }
      ];
    } else {
      summaryData = [
        { 'Summary': 'Total Orders', 'Value': stats.totalOrders },
        { 'Summary': 'Total Amount', 'Value': `₹${stats.totalAmount.toLocaleString('en-IN')}` },
        { 'Summary': 'Collected Amount', 'Value': `₹${stats.collectedAmount.toLocaleString('en-IN')}` },
        { 'Summary': 'Pending Amount', 'Value': `₹${stats.pendingAmount.toLocaleString('en-IN')}` }
      ];
    }
    
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");
    XLSX.writeFile(wb, `${selectedStaff.name}_Report.xlsx`);
  };

  const CustomDateButton = forwardRef(({ value, onClick }, ref) => (
    <button className="date-picker-button" onClick={onClick} ref={ref}>
      <i className="ni ni-calendar-date"></i>
      <span>{value || "Select Date Range"}</span>
      <i className="ni ni-chevron-down"></i>
    </button>
  ));

  const PopperContainer = ({ children }) => {
    return <div style={{ position: "relative", zIndex: 1050 }}>{children}</div>;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Filter staff based on search and staff type
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.mobile && s.mobile.toLowerCase().includes(search.toLowerCase())) ||
      (s.type && s.type.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = staffTypeFilter === 'all' || 
      (s.type && s.type.toLowerCase() === staffTypeFilter.toLowerCase());
    
    return matchesSearch && matchesType;
  });

  // Get type badge color
  const getTypeBadgeClass = (type) => {
    switch(type?.toLowerCase()) {
      case 'manager': return 'role-badge manager';
      case 'delivery': return 'role-badge delivery';
      case 'sales': return 'role-badge sales';
      default: return 'role-badge';
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2 className="reports-title">👥 Staff Performance Reports</h2>
        <p className="reports-subtitle">View and analyze staff performance and sales data</p>
      </div>

      <div className="reports-content">
        {/* Left Panel - Staff List */}
        <div className="customers-panel">
          <div className="customers-panel-header">
            <h5 className="panel-title">👥 Staff Members</h5>
            <span className="customer-count">{filteredStaff.length} of {staffList.length}</span>
          </div>
          
          {/* Staff Type Filter */}
          <div className="staff-type-filter">
            <FormGroup>
              
              <Input
                type="select"
                name="staffType"
                id="staffTypeSelect"
                value={staffTypeFilter}
                onChange={(e) => setStaffTypeFilter(e.target.value)}
                className="staff-type-select"
              >
                <option value="all">All Staff</option>
                <option value="sales">Sales Staff</option>
                <option value="delivery">Delivery Staff</option>
                <option value="manager">Managers</option>
              </Input>
            </FormGroup>
          </div>

          <div className="search-box">
            <i className="ni ni-search search-icon"></i>
            <Input
              type="text"
              placeholder="Search staff by name, mobile or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button 
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="customers-list">
            {filteredStaff.length > 0 ? (
              filteredStaff.map((s) => (
                <div
                  key={s._id}
                  className={`customer-item ${selectedStaff?._id === s._id ? 'selected' : ''}`}
                  onClick={() => setSelectedStaff(s)}
                >
                  <div className="customer-avatar">
                    {s.name.charAt(0)}
                  </div>
                  <div className="customer-info">
                    <div className="customer-name">{s.name}</div>
                    <div className="customer-details">
                      <span className={getTypeBadgeClass(s.type)}>
                        {s.type || 'staff'}
                      </span>
                      {s.mobile && <span className="staff-phone">{s.mobile}</span>}
                    </div>
                  </div>
                  {selectedStaff?._id === s._id && (
                    <div className="selected-indicator">
                      <i className="ni ni-check"></i>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-customers">
                <i className="ni ni-users"></i>
                <p>No staff members found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Reports */}
        <div className="reports-panel">
          {selectedStaff ? (
            <>
              {/* Action Bar */}
              <div className="action-bar ultra-compact">
                <div className="date-picker-wrapper ultra-compact">
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      setDateRange(update);
                      setCurrentPage(1);
                    }}
                    customInput={<CustomDateButton />}
                    popperPlacement="bottom-start"
                    popperContainer={PopperContainer}
                    shouldCloseOnSelect={false}
                    placeholderText="Select Range"
                    isClearable={true}
                  />
                </div>

                <div className="export-buttons ultra-compact">
                  <button
                    onClick={exportExcel}
                    className="export-btn excel ultra-compact"
                    disabled={filteredBills.length === 0}
                  >
                    <FaFileExcel />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={exportPDF}
                    className="export-btn pdf ultra-compact"
                    disabled={filteredBills.length === 0}
                    title="Export to PDF"
                  >
                    <FaFilePdf size={13} />
                    PDF
                  </button>
                </div>
              </div>

              {/* Staff Header */}
              <div className="customer-header">
                <div className="customer-header-info">
                  <div className="customer-header-avatar">
                    {selectedStaff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="customer-header-name">{selectedStaff.name}</h3>
                    <p className="customer-header-meta">
                      <span className={getTypeBadgeClass(selectedStaff.type)}>
                        {selectedStaff.type || 'staff'}
                      </span>
                      {' • '}{selectedStaff.mobile || selectedStaff.phone || 'No mobile'}
                      {selectedStaff.email && ` • ${selectedStaff.email}`}
                    </p>
                  </div>
                </div>
                {(startDate || endDate) && (
                  <div className="date-range-badge">
                    <i className="ni ni-calendar-date"></i>
                    <span>
                      {startDate?.toLocaleDateString('en-IN')} - {endDate?.toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats Cards - Different for Sales vs Delivery */}
              {selectedStaff.type?.toLowerCase() === 'delivery' ? (
                /* Delivery Staff Stats */
                <Row className="stats-row g-2">
                  <Col md="3">
                    <div className="stat-card compact">
                      <div className="stat-icon blue compact">
                        <i className="ni ni-box"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{stats.totalOrders}</span>
                      </div>
                    </div>
                  </Col>
                  {/* <Col md="3">
                    <div className="stat-card compact">
                      <div className="stat-icon green compact">
                        <i className="ni ni-money"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Total Amount</span>
                        <span className="stat-value">₹{stats.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </Col> */}
                  <Col md="3">
                    <div className="stat-card compact">
                      <div className="stat-icon success compact">
                        <i className="ni ni-check"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Delivered</span>
                        <span className="stat-value">{stats.deliveredOrders}</span>
                      </div>
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="stat-card compact">
                      <div className="stat-icon warning compact">
                        <i className="ni ni-clock"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Pending</span>
                        <span className="stat-value">{stats.pendingDelivery}</span>
                      </div>
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="stat-card compact">
                      <div className="stat-icon info compact">
                        <i className="ni ni-single-02"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Assigned Customers</span>
                        <span className="stat-value">{stats.assignedCustomers}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              ) : (
                /* Sales Staff Stats */
                <Row className="stats-row g-2">
                  <Col md="3">
                    <div className="stat-card compact">
                      <div className="stat-icon blue compact">
                        <i className="ni ni-box"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{stats.totalOrders}</span>
                      </div>
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="stat-card compact">
                      <div className="stat-icon green compact">
                        <i className="ni ni-money"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Total Amount</span>
                        <span className="stat-value">₹{stats.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="stat-card compact">
                      <div className="stat-icon success compact">
                        <i className="ni ni-check"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Collected</span>
                        <span className="stat-value">₹{stats.collectedAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="stat-card compact">
                      <div className="stat-icon warning compact">
                        <i className="ni ni-clock"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Pending</span>
                        <span className="stat-value">₹{stats.pendingAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Transactions Table */}
              <div className="transactions-section">
                <div className="transactions-header">
                  <h6 className="transactions-title">
                    {selectedStaff.type?.toLowerCase() === 'delivery' ? '📦 Delivery Orders' : '📋 Order History'}
                  </h6>
                  {filteredBills.length > 0 && (
                    <span className="transactions-count">{filteredBills.length} entries</span>
                  )}
                </div>

                {currentItems.length > 0 ? (
                  <>
                    <div className="table-responsive">
                      <table className="transactions-table">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>Order No</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            {selectedStaff.type?.toLowerCase() !== 'delivery' && (
                              <th>Payment</th>
                            )}
                            <th>Order Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((bill, idx) => (
                            <tr key={bill._id}>
                              <td>{indexOfFirstItem + idx + 1}</td>
                              <td>
                                <span className="order-id">#{bill._id.toString().slice(-6)}</span>
                              </td>
                              <td>{getCustomerName(bill)}</td>
                              <td>{new Date(bill.createdAt).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}</td>
                              <td className="amount">₹ {bill.totalAmt?.toLocaleString('en-IN')}</td>
                              {selectedStaff.type?.toLowerCase() !== 'delivery' && (
                                <td>
                                  <span className={`status-badge ${bill.paymentMethod ? 'paid' : 'pending'}`}>
                                    {bill.paymentMethod ? 'Paid' : 'Pending'}
                                  </span>
                                </td>
                              )}
                              <td>
                                <span className={`order-status-badge ${bill.orderStatus?.toLowerCase() || 'pending'}`}>
                                  {bill.orderStatus || 'Pending'}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="action-btn view-btn"
                                  onClick={() => openInvoiceModal(bill)}
                                  title="View Invoice"
                                >
                                  <i className="ni ni-eye"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={selectedStaff.type?.toLowerCase() === 'delivery' ? "4" : "4"} className="text-end fw-bold"></td>
                            <td className="amount fw-bold">₹ {stats.totalAmount.toLocaleString('en-IN')}</td>
                            <td colSpan="2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="pagination-wrapper">
                        <Pagination>
                          <PaginationItem disabled={currentPage === 1}>
                            <PaginationLink
                              previous
                              onClick={() => paginate(currentPage - 1)}
                            />
                          </PaginationItem>
                          
                          {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i + 1} active={currentPage === i + 1}>
                              <PaginationLink onClick={() => paginate(i + 1)}>
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem disabled={currentPage === totalPages}>
                            <PaginationLink
                              next
                              onClick={() => paginate(currentPage + 1)}
                            />
                          </PaginationItem>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-data">
                    <i className="ni ni-box-open"></i>
                    <p>No orders found for this staff member in the selected period</p>
                    {(startDate || endDate) && (
                      <button 
                        className="clear-filter-btn"
                        onClick={() => setDateRange([null, null])}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="select-customer-prompt">
              <i className="ni ni-users"></i>
              <h4>Select a Staff Member</h4>
              <p>Choose a staff member from the left panel to view their performance report</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal isOpen={invoiceModal} toggle={() => setInvoiceModal(false)} size="lg" className="invoice-modal">
        <ModalHeader toggle={() => setInvoiceModal(false)}>
          <div className="modal-header-content">
            <h4 className="modal-title">Retail Pulse</h4>
            <span className="invoice-number">Order Invoice</span>
          </div>
          <button className="close" onClick={() => setInvoiceModal(false)}>
            <span>×</span>
          </button>
        </ModalHeader>
        <ModalBody>
          {selectedBill && (
            <div className="invoice-container">
              {/* Order ID and Date */}
              <div className="invoice-header">
                <div className="order-info">
                  <h2 className="order-id">Order ID: #{selectedBill._id.toString().slice(-6)}</h2>
                  <p className="order-date">Date: {new Date(selectedBill.createdAt).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  })}</p>
                </div>
                <div className={`order-status-badge ${selectedBill.orderStatus?.toLowerCase() || 'delivered'}`}>
                  {selectedBill.orderStatus || 'delivered'}
                </div>
              </div>

              {/* Customer and Staff Details Grid */}
              <div className="details-grid">
                {/* Customer Details */}
                <div className="details-section">
                  <h6 className="section-title">Customer Details</h6>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{getCustomerName(selectedBill)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mobile:</span>
                    <span className="detail-value">{selectedBill.customerId?.mobile || selectedBill.customerId?.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{selectedBill.customerId?.address || selectedBill.deliveryAddress || 'N/A'}</span>
                  </div>
                </div>

                {/* Staff Details */}
                <div className="details-section">
                  <h6 className="section-title">Staff Details</h6>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedStaff?.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedStaff?.type || 'staff'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{selectedStaff?.mobile || selectedStaff?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.orderedProducts?.map((product, idx) => (
                      <tr key={product._id || idx}>
                        <td>{idx + 1}</td>
                        <td>{product.productName}</td>
                        <td>{product.qty}</td>
                        <td>₹ {product.value?.toLocaleString('en-IN') || 0}</td>
                        <td>₹ {(product.value * product.qty).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="totals-section">
                <div className="total-row">
                  <span className="total-label">Subtotal</span>
                  <span className="total-value">
                    ₹ {selectedBill.orderedProducts?.reduce(
                      (sum, product) => sum + (product.value * product.qty), 
                      0
                    ).toLocaleString('en-IN') || selectedBill.totalAmt?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>
                <div className="total-row">
                  <span className="total-label">Discount</span>
                  <span className="total-value">₹ 0</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Tax</span>
                  <span className="total-value">₹ 0</span>
                </div>
                <div className="total-row grand-total">
                  <span className="total-label">Total</span>
                  <span className="total-value">₹ {(selectedBill.totalAmt || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Information */}
              {selectedBill.paymentMethod && (
                <div className="payment-info-section">
                  <p className="payment-method">
                    <strong>Payment Method:</strong> {selectedBill.paymentMethod}
                  </p>
                  {selectedBill.paymentCollectedAt && (
                    <p className="payment-time">
                      <strong>Payment Collected:</strong> {new Date(selectedBill.paymentCollectedAt).toLocaleString('en-US')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={downloadInvoicePDF} className="download-btn">
            <FaDownload /> Download PDF
          </Button>
          <Button color="secondary" onClick={() => setInvoiceModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StaffReport;