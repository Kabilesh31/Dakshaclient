import React, { useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { Input, Badge, Button, Table, Card, CardBody, Row, Col, Pagination, PaginationItem, PaginationLink, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { errorToast } from "../../utils/toaster";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./report.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf, FaEye, FaDownload, FaPrint } from "react-icons/fa";

const Reports = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [staffList, setStaffList] = useState([]); // Store all staff data
  
  // Invoice modal state
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  
  // Calculate paid and pending amounts from filtered data
  const paidAmount = filteredReportData
    .filter(b => b.paymentMethod && b.paymentMethod !== null && b.paymentMethod !== "null")
    .reduce((acc, bill) => acc + (bill.totalAmt || 0), 0);
  
  const pendingAmount = filteredReportData
    .filter(b => !b.paymentMethod || b.paymentMethod === null || b.paymentMethod === "null")
    .reduce((acc, bill) => acc + (bill.totalAmt || 0), 0);

  const totalAmount = filteredReportData.reduce((acc, o) => acc + (o.totalAmt || 0), 0);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/customer`
      );
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
      errorToast("Failed to fetch customers");
    }
  };

  // Fetch all staff data
  const fetchStaff = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/staff`
      );
      setStaffList(res.data);
      console.log("Staff data fetched:", res.data); // Debug log
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  const fetchReport = async () => {
    if (!selectedCustomer) return;

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/bills`
      );

      const customerBills = res.data.bills.filter(
        (b) => b.customerId === selectedCustomer._id
      );

      console.log("Bills data:", customerBills); // Debug log to see bill structure
      setReportData(customerBills);
      setCurrentPage(1);
    } catch (err) {
      console.error("REPORT ERROR:", err.response?.data || err.message);
      errorToast("Failed to fetch report");
    }
  };

  // Filter data based on date range
  useEffect(() => {
    if (reportData.length > 0) {
      let filtered = [...reportData];
      
      if (startDate && endDate) {
        const from = new Date(startDate);
        from.setHours(0, 0, 0, 0);
        const to = new Date(endDate);
        to.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter((item) => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= from && createdAt <= to;
        });
      }
      
      setFilteredReportData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredReportData([]);
    }
  }, [reportData, startDate, endDate]);

  useEffect(() => {
    fetchCustomers();
    fetchStaff(); // Fetch staff data when component mounts
  }, []);

  useEffect(() => {
    if (selectedCustomer) fetchReport();
  }, [selectedCustomer]);

  // Function to get staff name by matching ID
  const getStaffNameById = (staffId) => {
    if (!staffId) return 'N/A';
    
    // Handle different possible ID field names
    const staffIdValue = staffId._id || staffId.id || staffId;
    
    // Find staff in staffList by matching ID
    const staff = staffList.find(s => s._id === staffIdValue || s.id === staffIdValue);
    
    if (staff) {
      return staff.name || staff.staffName || 'Unknown';
    }
    
    console.log("Staff not found for ID:", staffIdValue); // Debug log
    return 'N/A';
  };

  // Main function to get staff name from bill
  const getStaffName = (bill) => {
    // Debug log to see bill structure
    console.log("Bill staff data:", {
      staffId: bill.staffId,
      createdBy: bill.createdBy,
      staffName: bill.staffName,
      staff: bill.staff
    });

    // Case 1: If staff name is directly available
    if (bill.staffName) {
      return bill.staffName;
    }

    // Case 2: If staff object is populated with name
    if (bill.staff && bill.staff.name) {
      return bill.staff.name;
    }

    // Case 3: If staffId is available, try to find staff name
    if (bill.staffId) {
      const staffName = getStaffNameById(bill.staffId);
      if (staffName !== 'N/A') {
        return staffName;
      }
    }

    // Case 4: If createdBy contains staff ID or name
    if (bill.createdBy) {
      // If createdBy is an object with name
      if (typeof bill.createdBy === 'object' && bill.createdBy.name) {
        return bill.createdBy.name;
      }
      // If createdBy is a string (might be ID or name)
      if (typeof bill.createdBy === 'string') {
        // Check if it's an ID (24 character hex string)
        if (bill.createdBy.length === 24 && /^[0-9a-fA-F]{24}$/.test(bill.createdBy)) {
          const staffName = getStaffNameById(bill.createdBy);
          if (staffName !== 'N/A') {
            return staffName;
          }
        } else {
          // Assume it's already a name
          return bill.createdBy;
        }
      }
    }

    // Case 5: If staff field contains ID
    if (bill.staff) {
      const staffId = typeof bill.staff === 'object' ? bill.staff._id || bill.staff.id : bill.staff;
      const staffName = getStaffNameById(staffId);
      if (staffName !== 'N/A') {
        return staffName;
      }
    }

    return 'N/A';
  };

  // Function to open invoice modal
  const openInvoiceModal = (bill) => {
    setSelectedBill(bill);
    setInvoiceModal(true);
  };

// Function to download invoice as PDF
const downloadInvoicePDF = () => {
  if (!selectedBill) return;

  const doc = new jsPDF();

  // ===== Header =====
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 37, 41);
  doc.text("Retail Pulse", 105, 20, { align: "center" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Order Invoice", 105, 30, { align: "center" });

  // ===== Order ID and Date =====
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

  // ===== Order Status =====
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(46, 204, 113); // Green color for delivered
  doc.text(selectedBill.orderStatus || 'delivered', 160, 45);

  // ===== Customer Details =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 37, 41);
  doc.text("Customer Details", 14, 67);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Name: ${selectedBill.customerName || selectedCustomer?.name || 'N/A'}`, 14, 75);
  doc.text(`Mobile: ${selectedCustomer?.phone || 'N/A'}`, 14, 82);
  doc.text(`Address: ${selectedCustomer?.address || 'N/A'}`, 14, 89);

  // ===== Staff Details =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 37, 41);
  doc.text("Staff Details", 120, 67);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  const staffName = getStaffName(selectedBill);
  const staffInfo = staffList.find(s => 
    s._id === selectedBill.deliveredBy || 
    s._id === selectedBill.paymentCollectedBy ||
    s._id === selectedBill.createdBy
  );

  doc.text(`Name: ${staffName}`, 120, 75);
  doc.text(`Role: ${staffInfo?.role || 'sales'}`, 120, 82);
  doc.text(`Contact: ${staffInfo?.phone || 'N/A'}`, 120, 89);

  // ===== Products Table =====
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
      font: 'helvetica',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 70, halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    },
    didDrawPage: function(data) {
      // Add Rupee symbol to headers after table is drawn
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      
      // Get the position of the table headers
      const headersY = data.cursor.y - 8;
      
      // Override the header text for Rate and Amount columns with Rupee symbol
      doc.text("Rate (₹)", 135, headersY, { align: 'right' });
      doc.text("Amount (₹)", 170, headersY, { align: 'right' });
    }
  });

  // ===== Totals =====
  const finalY = doc.lastAutoTable.finalY + 15;

  // Calculate subtotal from orderedProducts
  const subtotal = selectedBill.orderedProducts?.reduce(
    (sum, product) => sum + (product.value * product.qty), 
    0
  ) || selectedBill.totalAmt || 0;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Subtotal", 140, finalY);
  doc.text(`₹ ${subtotal.toLocaleString('en-IN')}`, 180, finalY, { align: 'right' });

  // Discount
  doc.text("Discount", 140, finalY + 8);
  doc.text(`₹ 0`, 180, finalY + 8, { align: 'right' });

  // Tax
  doc.text("Tax", 140, finalY + 16);
  doc.text(`₹ 0`, 180, finalY + 16, { align: 'right' });

  // Total (with bold font)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 37, 41);
  doc.text("Total", 135, finalY + 28);
  doc.text(`₹ ${(selectedBill.totalAmt || 0).toLocaleString('en-IN')}`, 180, finalY + 28, { align: 'right' });

  // ===== Payment Information =====
  if (selectedBill.paymentMethod) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Payment Method: ${selectedBill.paymentMethod}`, 14, finalY + 40);
    
    if (selectedBill.paymentCollectedAt) {
      doc.text(
        `Payment Collected: ${new Date(selectedBill.paymentCollectedAt).toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`, 
        14, 
        finalY + 47
      );
    }
  }

  // ===== Save PDF =====
  doc.save(`Order_${selectedBill._id.toString().slice(-6)}.pdf`);
};

  const PopperContainer = ({ children }) => {
    return <div style={{ position: "relative", zIndex: 1050 }}>{children}</div>;
  };

  const exportPDF = () => {
    if (!selectedCustomer) return;

    const doc = new jsPDF();

    // ===== Title =====
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text(`Customer Report`, 14, 18);

    doc.setFontSize(12);
    doc.text(`Customer: ${selectedCustomer.name}`, 14, 26);

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

    // ===== Summary Section =====
    doc.setFontSize(11);
    doc.setTextColor(33);
    doc.text(`Total Orders: ${filteredReportData.length}`, 14, 48);
    doc.text(
      `Total Amount: Rs. ${totalAmount.toLocaleString("en-IN")}`,
      14,
      54
    );
    doc.text(
      `Paid Amount: Rs. ${paidAmount.toLocaleString("en-IN")}`,
      14,
      60
    );
    doc.text(
      `Pending Amount: Rs. ${pendingAmount.toLocaleString("en-IN")}`,
      14,
      66
    );

    // ===== Table =====
    const tableColumn = [
      "S.No",
      "Order No",
      "Date",
      "Amount (Rs)",
      "Payment Status",
      "Staff Name",
    ];

    const tableRows = filteredReportData.map((o, idx) => [
      idx + 1,
      `#${o._id.toString().slice(-6)}`,
      new Date(o.createdAt).toLocaleDateString("en-IN"),
      (o.totalAmt || 0).toLocaleString("en-IN"),
      o.paymentMethod ? "Paid" : "Pending",
      getStaffName(o),
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
        3: { halign: "right" }, // Align Amount right
      },
    });

    // ===== Save PDF =====
    doc.save(`${selectedCustomer.name}_Report.pdf`);
  };
  
  const exportExcel = () => {
    if (!selectedCustomer) return;
    
    const exportData = filteredReportData.map((bill, idx) => ({
      'S.No': idx + 1,
      'Order No': `#${bill._id.toString().slice(-6)}`,
      'Date': new Date(bill.createdAt).toLocaleDateString('en-IN'),
      'Amount (₹)': bill.totalAmt || 0,
      'Payment Status': bill.paymentMethod ? 'Paid' : 'Pending',
      'Order Status': bill.orderStatus || 'N/A',
      'Staff Name': getStaffName(bill)
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    
    const summaryData = [
      { 'Summary': 'Total Orders', 'Value': filteredReportData.length },
      { 'Summary': 'Total Amount', 'Value': `₹${totalAmount.toLocaleString('en-IN')}` },
      { 'Summary': 'Paid Amount', 'Value': `₹${paidAmount.toLocaleString('en-IN')}` },
      { 'Summary': 'Pending Amount', 'Value': `₹${pendingAmount.toLocaleString('en-IN')}` }
    ];
    
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");
    XLSX.writeFile(wb, `${selectedCustomer.name}_Report.xlsx`);
  };

  const CustomDateButton = forwardRef(({ value, onClick }, ref) => (
    <button className="date-picker-button" onClick={onClick} ref={ref}>
      <i className="ni ni-calendar-date"></i>
      <span>{value || "Select Date Range"}</span>
      <i className="ni ni-chevron-down"></i>
    </button>
  ));

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReportData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReportData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Filter customers based on search
  const filteredCustomers = customers.filter((c) => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2 className="reports-title">📊 Customer Reports</h2>
        <p className="reports-subtitle">View and export detailed transaction reports for each customer</p>
      </div>

      <div className="reports-content">
        {/* Left Panel - Customers */}
        <div className="customers-panel">
          <div className="customers-panel-header">
            <h5 className="panel-title">👥 Customers</h5>
            <span className="customer-count">{customers.length} total</span>
          </div>
          
          <div className="search-box">
            <i className="ni ni-search search-icon"></i>
            <Input
              type="text"
              placeholder="Search customers by name or phone..."
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
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <div
                  key={c._id}
                  className={`customer-item ${selectedCustomer?._id === c._id ? 'selected' : ''}`}
                  onClick={() => setSelectedCustomer(c)}
                >
                  <div className="customer-avatar">
                    {c.name.charAt(0)}
                  </div>
                  <div className="customer-info">
                    <div className="customer-name">{c.name}</div>
                    {/* <div className="customer-details">
                      <span className="customer-phone">{c.phone || 'No phone'}</span>
                      <span className="customer-badge">Line #{c.lineNo}</span>
                    </div> */}
                  </div>
                  {selectedCustomer?._id === c._id && (
                    <div className="selected-indicator">
                      <i className="ni ni-check"></i>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-customers">
                <i className="ni ni-users"></i>
                <p>No customers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Reports */}
        <div className="reports-panel">
          {selectedCustomer ? (
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
                    disabled={filteredReportData.length === 0}
                  >
                    <FaFileExcel />
                    
                  </button>
                  <button
                    onClick={exportPDF}
                    className="export-btn pdf ultra-compact"
                    disabled={filteredReportData.length === 0}
                    title="Export to PDF"
                  >
                    <FaFilePdf size={13} color="sandal" />
                    
                  </button>
                </div>
              </div>

              {/* Customer Header */}
              <div className="customer-header">
                <div className="customer-header-info">
                  <div className="customer-header-avatar">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="customer-header-name">{selectedCustomer.name}</h3>
                    
                    <p className="customer-header-meta">
                      {selectedCustomer.phone || 'No phone'} | {selectedCustomer.routeName}  • Line #{selectedCustomer.lineNo}
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

              {/* Stats Cards */}
              <Row className="stats-row g-2">
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon blue compact">
                      <i className="ni ni-box"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Total Orders</span>
                      <span className="stat-value">{filteredReportData.length}</span>
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
                      <span className="stat-value">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon success compact">
                      <i className="ni ni-check"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Paid Amount</span>
                      <span className="stat-value">₹{paidAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon warning compact">
                      <i className="ni ni-clock"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Pending Amount</span>
                      <span className="stat-value">₹{pendingAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Transactions Table */}
              <div className="transactions-section">
                <div className="transactions-header">
                  <h6 className="transactions-title">📋 Transaction History</h6>
                  {filteredReportData.length > 0 && (
                    <span className="transactions-count">{filteredReportData.length} entries</span>
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
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Staff Name</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((o, idx) => (
                            <tr key={o._id}>
                              <td>{indexOfFirstItem + idx + 1}</td>
                              <td>
                                <span className="order-id">#{o._id.toString().slice(-6)}</span>
                              </td>
                              <td>{new Date(o.createdAt).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}</td>
                              <td className="amount">₹ {o.totalAmt?.toLocaleString('en-IN')}</td>
                              <td>
                                <span className={`status-badge ${o.paymentMethod ? 'paid' : 'pending'}`}>
                                  {o.paymentMethod ? 'Paid' : 'Pending'}
                                </span>
                              </td>
                              <td>
                                <span className="staff-name">
                                  {getStaffName(o)}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="action-btn view-btn"
                                  onClick={() => openInvoiceModal(o)}
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
                            <td colSpan="3" className="text-end fw-bold "></td>
                            <td className="amount fw-bold ml-1">₹ {totalAmount.toLocaleString('en-IN')}</td>
                            <td colSpan="3"></td>
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
                    <p>No transactions found for the selected period</p>
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
              <h4>Select a Customer</h4>
              <p>Choose a customer from the left panel to view their transaction report</p>
            </div>
          )}
        </div>
      </div>


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
              <span className="detail-value">{selectedBill.customerName || selectedCustomer?.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mobile:</span>
              <span className="detail-value">{selectedCustomer?.phone || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{selectedCustomer?.address || 'N/A'}</span>
            </div>
          </div>

          {/* Staff Details */}
          <div className="details-section">
            <h6 className="section-title">Staff Details</h6>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{getStaffName(selectedBill)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-value">
                {staffList.find(s => 
                  s._id === selectedBill.deliveredBy || 
                  s._id === selectedBill.paymentCollectedBy ||
                  s._id === selectedBill.createdBy
                )?.role || 'sales'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contact:</span>
              <span className="detail-value">
                {staffList.find(s => 
                  s._id === selectedBill.deliveredBy || 
                  s._id === selectedBill.paymentCollectedBy ||
                  s._id === selectedBill.createdBy
                )?.phone || 'N/A'}
              </span>
            </div>
          </div>
        </div>

       {/* Products Table - Updated to use orderedProducts */}
<div className="products-table-container">
  <table className="products-table">
    <thead>
      <tr>
        <th>S.No</th>
        <th>Product</th>
        <th>Qty</th>
        <th>Rate </th>
        <th>Amount </th>
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
{/* Paid Stamp with Real Cement/Uneven Ink Effect */}
{selectedBill.paymentMethod && (
  <div className="paid-stamp-round-container">
    <div className="paid-stamp-round distressed">
      {/* Paper texture background */}
      <div className="paper-texture"></div>
      
      {/* Ink bleed effects */}
      <div className="ink-bleed"></div>
      <div className="ink-bleed"></div>
      <div className="ink-bleed"></div>
      
      {/* Stamp inner content */}
      <div className="stamp-inner">
        <div className="stamp-text">PAID</div>
      </div>
      
      {/* Decorative dots with uneven distribution */}
      <div className="stamp-dots">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="stamp-dot"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
    </div>
  </div>
)}
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

export default Reports;