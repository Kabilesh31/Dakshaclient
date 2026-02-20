import React, { useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { Input, Badge, Button, Table, Card, CardBody, Row, Col, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { errorToast } from "../../utils/toaster";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./report.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

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
      <span>Export</span>
    </button>
    <button
    onClick={exportPDF}
    className="export-btn pdf ultra-compact"
    disabled={filteredReportData.length === 0}
    title="Export to PDF"
  >
    <FaFilePdf size={13} color="sandal" />
    PDF
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
        </tr>
      ))}
    </tbody>
    <tfoot>
      <tr>
        <td colSpan="3" className="text-end fw-bold ">Total</td>
        <td className="amount fw-bold">₹ {totalAmount.toLocaleString('en-IN')}</td>
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
    </div>
  );
};

export default Reports;