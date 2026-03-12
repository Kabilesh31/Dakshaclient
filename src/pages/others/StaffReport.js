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
  FormGroup,
} from "reactstrap";
import { errorToast } from "../../utils/toaster";
import * as XLSX from "xlsx";
import "./report.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf, FaDownload } from "react-icons/fa";
import { Weight } from "lucide-react";

const StaffReport = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [allBills, setAllBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [search, setSearch] = useState("");
  const [staffTypeFilter, setStaffTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Invoice modal state
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Calculate statistics based on staff type - Using totalAmt ONLY
  const calculateStats = () => {
    if (!filteredBills.length)
      return {
        totalOrders: 0,
        totalAmount: 0,
        collectedAmount: 0,
        pendingAmount: 0,
        rejectedAmount: 0,
        deliveredOrders: 0,
        pendingDelivery: 0,
        assignedCustomers: 0,
      };

    const totalOrders = filteredBills.filter((b) => b.orderStatus !== "rejected").length;

    // Total amount excludes rejected bills
    const totalAmount = filteredBills
      .filter((b) => b.orderStatus !== "rejected")
      .reduce((acc, bill) => acc + (Number(bill.totalAmt) || 0), 0);

    // Collected amount (paid, non-rejected)
    const collectedAmount = filteredBills
      .filter(
        (b) =>
          b.orderStatus !== "rejected" && b.paymentMethod && b.paymentMethod !== null && b.paymentMethod !== "null",
      )
      .reduce((acc, bill) => acc + (Number(bill.totalAmt) || 0), 0);

    // Rejected amount
    const rejectedAmount = filteredBills
      .filter((b) => b.orderStatus === "rejected")
      .reduce((acc, bill) => acc + (Number(bill.totalAmt) || 0), 0);

    // Pending amount (non-rejected, unpaid)
    const pendingAmount = filteredBills
      .filter(
        (b) =>
          b.orderStatus !== "rejected" && (!b.paymentMethod || b.paymentMethod === null || b.paymentMethod === "null"),
      )
      .reduce((acc, bill) => acc + (Number(bill.totalAmt) || 0), 0);

    // Delivery stats
    const deliveredOrders = filteredBills.filter(
      (b) =>
        b.orderStatus !== "rejected" && (b.orderStatus?.toLowerCase() === "delivered" || b.orderStatus === "approved"),
    ).length;

    const rejectedOrders = filteredBills.filter((b) => b.orderStatus === "rejected").length;

    const pendingDelivery = filteredBills.filter(
      (b) =>
        b.orderStatus !== "rejected" &&
        (!b.orderStatus || (b.orderStatus?.toLowerCase() !== "delivered" && b.orderStatus !== "approved")),
    ).length;

    // Assigned customers
    const assignedCustomers = [...new Set(filteredBills.map((bill) => bill.customerId?._id || bill.customerId))].filter(
      (id) => id,
    ).length;

    return {
      totalOrders,
      totalAmount,
      collectedAmount,
      pendingAmount,
      rejectedAmount,
      deliveredOrders,
      rejectedOrders,
      pendingDelivery,
      assignedCustomers,
    };
  };

  const stats = calculateStats();

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/staff`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      setStaffList(res.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      errorToast("Failed to fetch staff list");
    }
  };

  // Fetch all bills
  const fetchAllBills = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/bills`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      if (Array.isArray(res.data)) {
        setAllBills(res.data);
      } else if (res.data.bills && Array.isArray(res.data.bills)) {
        setAllBills(res.data.bills);
      } else {
        setAllBills([]);
      }
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

    switch (selectedStaff.type?.toLowerCase()) {
      case "manager":
        staffBills = allBills.filter(
          (bill) => bill.createdBy === selectedStaff._id || bill.createdBy === selectedStaff.name,
        );
        break;

      case "delivery":
        staffBills = allBills.filter(
          (bill) =>
            bill.deliveryPersonId === selectedStaff._id ||
            bill.deliveredBy === selectedStaff._id ||
            bill.staffId === selectedStaff._id,
        );
        break;

      case "sales":
      default:
        staffBills = allBills.filter(
          (bill) =>
            bill.createdBy === selectedStaff._id ||
            bill.paymentCollectedBy === selectedStaff._id ||
            bill.staffId === selectedStaff._id ||
            (bill.staff && bill.staff._id === selectedStaff._id),
        );
    }

    setFilteredBills(staffBills);
    setCurrentPage(1);
  }, [selectedStaff, allBills]);

  const filterDeliveryBills = allBills.filter((item) => item.deliveryPersonId === selectedStaff?._id);
  console.log(filterDeliveryBills);
  useEffect(() => {
    if (!selectedStaff || !allBills.length) {
      setFilteredBills([]);
      return;
    }

    let staffBills = allBills.filter((bill) => {
      // For delivery staff, only check deliveryPersonId
      if (selectedStaff.type?.toLowerCase() === "delivery") {
        return bill.deliveryPersonId === selectedStaff._id;
      } else {
        // For other staff types
        return (
          bill.createdBy === selectedStaff._id ||
          bill.paymentCollectedBy === selectedStaff._id ||
          bill.deliveredBy === selectedStaff._id ||
          bill.staffId === selectedStaff._id ||
          (bill.staff && bill.staff._id === selectedStaff._id)
        );
      }
    });

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
    return "N/A";
  };

  // Function to open invoice modal
  const openInvoiceModal = (bill) => {
    setSelectedBill(bill);
    setInvoiceModal(true);
  };

  // Download invoice PDF - Using totalAmt
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
    const orderDate = new Date(selectedBill.createdAt);
    const formattedDate = `${orderDate.getMonth() + 1}/${orderDate.getDate()}/${orderDate.getFullYear()}`;
    doc.text(`Date: ${formattedDate}`, 14, 52);

    // Order Status
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const statusColor = selectedBill.orderStatus === "rejected" ? [220, 38, 38] : [46, 204, 113];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text("selectedBill.orderStatus" || "Delivered", 160, 45);

    // Customer Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 37, 41);
    doc.text("Customer Details", 14, 67);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${getCustomerName(selectedBill)}`, 14, 75);
    doc.text(`Mobile: ${selectedBill.customerId?.mobile || selectedBill.customerId?.phone || "N/A"}`, 14, 82);
    doc.text(`Address: ${selectedBill.customerId?.address || selectedBill.deliveryAddress || "N/A"}`, 14, 89);

    // Staff Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 37, 41);
    doc.text("Staff Details", 120, 67);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    doc.text(`Name: ${selectedStaff?.name || selectedBill.staffName || "N/A"}`, 120, 75);
    doc.text(`Type: ${selectedStaff?.type || "staff"}`, 120, 82);
    doc.text(`Contact: ${selectedStaff?.mobile || selectedStaff?.phone || "N/A"}`, 120, 89);

    // Calculate subtotal
    const subtotal =
      selectedBill.orderedProducts?.reduce((sum, product) => sum + Number(product.value) * Number(product.qty), 0) ||
      Number(selectedBill.totalAmt) ||
      0;

    // Products Table
    const tableColumn = ["S.No", "Product", "Qty", "Rate", "Amount"];
    const tableRows =
      selectedBill.orderedProducts?.map((product, idx) => {
        const qty = Number(product.qty) || 0;
        const rate = Number(product.value) || 0;
        const amount = rate * qty;

        return [
          idx + 1,
          product.productName || "",
          qty.toString(),
          `Rs.${rate.toLocaleString("en-IN")}`,
          `Rs.${amount.toLocaleString("en-IN")}`,
        ];
      }) || [];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 105,
      theme: "grid",
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        font: "helvetica",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 70, halign: "left" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
    });

    // Totals section - Using totalAmt
    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    const startX = 128;
    const valueX = 178;

    doc.text("Subtotal:", startX, finalY);
    doc.text(`Rs.${subtotal.toLocaleString("en-IN")}`, valueX, finalY, { align: "right" });

    doc.text("Discount:", startX, finalY + 8);
    doc.text("Rs.0", valueX, finalY + 8, { align: "right" });

    doc.text("Tax:", startX, finalY + 16);
    doc.text("Rs.0", valueX, finalY + 16, { align: "right" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 37, 41);
    doc.text("Total:", startX - 5, finalY + 28);
    doc.text(`Rs.${(Number(selectedBill.totalAmt) || 0).toLocaleString("en-IN")}`, valueX, finalY + 28, {
      align: "right",
    });

    // Payment info
    if (selectedBill.paymentMethod && selectedBill.orderStatus !== "rejected") {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`Payment Method: ${selectedBill.paymentMethod}`, 14, finalY + 35);

      if (selectedBill.paymentCollectedAt) {
        const paymentDate = new Date(selectedBill.paymentCollectedAt);
        const formattedPaymentDate = `${paymentDate.getMonth() + 1}/${paymentDate.getDate()}/${paymentDate.getFullYear()}, ${paymentDate.getHours()}:${paymentDate.getMinutes()}:${paymentDate.getSeconds()} ${paymentDate.getHours() >= 12 ? "PM" : "AM"}`;
        doc.text(`Payment Collected: ${formattedPaymentDate}`, 14, finalY + 42);
      }
    }

    doc.save(`Order_${selectedBill._id.toString().slice(-6)}.pdf`);
  };

  // Export PDF - Using totalAmt
  const exportPDF = () => {
    if (!selectedStaff) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text(`Staff Performance Report`, 14, 18);

    doc.setFontSize(12);
    const typeCap = selectedStaff.type.charAt(0).toUpperCase() + selectedStaff.type.slice(1);
    doc.text(`Staff: ${selectedStaff.name} (${typeCap})`, 14, 26);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 14, 32);

    if (startDate && endDate) {
      doc.text(`Period: ${startDate.toLocaleDateString("en-IN")} - ${endDate.toLocaleDateString("en-IN")}`, 14, 38);
    }

    // Summary Section
    doc.setFontSize(11);
    doc.setTextColor(33);

    if (selectedStaff.type?.toLowerCase() === "delivery") {
      doc.text(`Total Orders: ${stats.totalOrders}`, 14, 48);
      doc.text(`Total Amount: Rs. ${stats.totalAmount.toLocaleString("en-IN")}`, 14, 54);
      doc.text(`Delivered Orders: ${stats.deliveredOrders}`, 14, 60);
      doc.text(`Pending Delivery: ${stats.pendingDelivery}`, 14, 66);
      doc.text(`Assigned Customers: ${stats.assignedCustomers}`, 14, 72);

      if (stats.rejectedOrders > 0) {
        doc.text(
          `Rejected Orders: ${stats.rejectedOrders} (Rs.${stats.rejectedAmount.toLocaleString("en-IN")})`,
          14,
          78,
        );
      }

      // Table for delivery
      const tableColumn = ["S.No", "Order No", "Customer", "Date", "Amount (Rs.)", "Status"];

      const tableRows = filteredBills.map((bill, idx) => {
        return [
          idx + 1,
          `#${bill._id.toString().slice(-6)}`,
          getCustomerName(bill),
          new Date(bill.createdAt).toLocaleDateString("en-IN"),
          `Rs.${(Number(bill.totalAmt) || 0).toLocaleString("en-IN")}`,
          bill.orderStatus || "Pending",
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: stats.rejectedOrders > 0 ? 85 : 79,
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
      doc.text(`Total Amount: Rs.${stats.totalAmount.toLocaleString("en-IN")}`, 14, 54);
      doc.text(`Collected Amount: Rs.${stats.collectedAmount.toLocaleString("en-IN")}`, 14, 60);
      doc.text(`Pending Amount: Rs.${stats.pendingAmount.toLocaleString("en-IN")}`, 14, 66);

      if (stats.rejectedAmount > 0) {
        doc.text(`Rejected Amount: Rs.${stats.rejectedAmount.toLocaleString("en-IN")}`, 14, 72);
      }

      // Table for sales/manager
      const tableColumn = ["S.No", "Order No", "Customer", "Date", "Amount (Rs.)", "Payment Status", "Order Status"];

      const tableRows = filteredBills.map((bill, idx) => {
        let paymentStatus = "Pending";
        if (bill.orderStatus === "rejected") {
          paymentStatus = "Rejected";
        } else if (bill.paymentMethod) {
          paymentStatus = "Paid";
        }

        const status = bill.orderStatus || "Pending";
        const statusCap = status.charAt(0).toUpperCase() + status.slice(1);
        return [
          idx + 1,
          `#${bill._id.toString().slice(-6)}`,
          getCustomerName(bill),
          new Date(bill.createdAt).toLocaleDateString("en-IN"),
          `Rs.${(Number(bill.totalAmt) || 0).toLocaleString("en-IN")}`,
          paymentStatus,
          statusCap,
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: stats.rejectedAmount > 0 ? 80 : 74,
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

  // Export Excel - Using totalAmt
  const exportExcel = () => {
    if (!selectedStaff) return;

    let exportData;

    if (selectedStaff.type?.toLowerCase() === "delivery") {
      exportData = filteredBills.map((bill, idx) => ({
        "S.No": idx + 1,
        "Order No": `#${bill._id.toString().slice(-6)}`,
        Customer: getCustomerName(bill),
        Date: new Date(bill.createdAt).toLocaleDateString("en-IN"),
        "Amount (Rs.)": Number(bill.totalAmt) || 0,
        "Delivery Status": bill.orderStatus || "Pending",
      }));
    } else {
      exportData = filteredBills.map((bill, idx) => {
        let paymentStatus = "Pending";
        if (bill.orderStatus === "rejected") {
          paymentStatus = "Rejected";
        } else if (bill.paymentMethod) {
          paymentStatus = "Paid";
        }

        return {
          "S.No": idx + 1,
          "Order No": `#${bill._id.toString().slice(-6)}`,
          Customer: getCustomerName(bill),
          Date: new Date(bill.createdAt).toLocaleDateString("en-IN"),
          "Amount (Rs.)": Number(bill.totalAmt) || 0,
          "Payment Status": paymentStatus,
          "Order Status": bill.orderStatus || "Pending",
        };
      });
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    let summaryData;
    if (selectedStaff.type?.toLowerCase() === "delivery") {
      summaryData = [
        { Summary: "Total Orders", Value: stats.totalOrders },
        { Summary: "Total Amount", Value: `Rs.${stats.totalAmount.toLocaleString("en-IN")}` },
        { Summary: "Delivered Orders", Value: stats.deliveredOrders },
        { Summary: "Pending Delivery", Value: stats.pendingDelivery },
        { Summary: "Assigned Customers", Value: stats.assignedCustomers },
      ];
      if (stats.rejectedOrders > 0) {
        summaryData.push({ Summary: "Rejected Orders", Value: stats.rejectedOrders });
        summaryData.push({ Summary: "Rejected Amount", Value: `Rs.${stats.rejectedAmount.toLocaleString("en-IN")}` });
      }
    } else {
      summaryData = [
        { Summary: "Total Orders", Value: stats.totalOrders },
        { Summary: "Total Amount", Value: `Rs.${stats.totalAmount.toLocaleString("en-IN")}` },
        { Summary: "Collected Amount", Value: `Rs.${stats.collectedAmount.toLocaleString("en-IN")}` },
        { Summary: "Pending Amount", Value: `Rs.${stats.pendingAmount.toLocaleString("en-IN")}` },
      ];
      if (stats.rejectedAmount > 0) {
        summaryData.push({ Summary: "Rejected Amount", Value: `Rs.${stats.rejectedAmount.toLocaleString("en-IN")}` });
      }
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
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.mobile && s.mobile.toLowerCase().includes(search.toLowerCase())) ||
      (s.type && s.type.toLowerCase().includes(search.toLowerCase()));

    const matchesType = staffTypeFilter === "all" || (s.type && s.type.toLowerCase() === staffTypeFilter.toLowerCase());

    return matchesSearch && matchesType;
  });

  // Get type badge color
  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case "manager":
        return "role-badge manager";
      case "delivery":
        return "role-badge delivery";
      case "sales":
        return "role-badge sales";
      default:
        return "role-badge";
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
            <span className="customer-count">
              {filteredStaff.length} of {staffList.length}
            </span>
          </div>

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
              <button className="clear-search" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <div className="customers-list">
            {filteredStaff.length > 0 ? (
              filteredStaff.map((s) => (
                <div
                  key={s._id}
                  className={`customer-item ${selectedStaff?._id === s._id ? "selected" : ""}`}
                  onClick={() => setSelectedStaff(s)}
                >
                  <div className="customer-avatar">{s.name.charAt(0)}</div>
                  <div className="customer-info">
                    <div className="customer-name">{s.name}</div>
                    <div className="customer-details">
                      <span className={getTypeBadgeClass(s.type)}>{s.type || "staff"}</span>
                      {s.mobile && (
                        <span
                          className="customer-name "
                          style={{ fontSize: "11px", marginLeft: "12px", fontWeight: "150" }}
                        >
                          {s.mobile}
                        </span>
                      )}
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
                  </button>
                  <button
                    onClick={exportPDF}
                    className="export-btn pdf ultra-compact"
                    disabled={filteredBills.length === 0}
                    title="Export to PDF"
                  >
                    <FaFilePdf size={13} />
                  </button>
                </div>
              </div>

              <div className="customer-header">
                <div className="customer-header-info">
                  <div className="customer-header-avatar">{selectedStaff.name.charAt(0)}</div>
                  <div>
                    <h3 className="customer-header-name">{selectedStaff.name}</h3>
                    <p className="customer-header-meta">
                      <span className={getTypeBadgeClass(selectedStaff.type)}>{selectedStaff.type || "staff"}</span>
                      {" • "}
                      {selectedStaff.mobile || selectedStaff.phone || "No mobile"}
                      {selectedStaff.email && ` • ${selectedStaff.email}`}
                    </p>
                  </div>
                </div>
                {(startDate || endDate) && (
                  <div className="date-range-badge">
                    <i className="ni ni-calendar-date"></i>
                    <span>
                      {startDate?.toLocaleDateString("en-IN")} - {endDate?.toLocaleDateString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats Cards - Using totalAmt */}
              {selectedStaff.type?.toLowerCase() === "delivery" ? (
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
                  {stats.rejectedOrders > 0 && (
                    <Col md="3">
                      <div className="stat-card compact">
                        <div className="stat-icon danger compact">
                          <i className="ni ni-fat-remove"></i>
                        </div>
                        <div className="stat-content">
                          <span className="stat-label">Rejected</span>
                          <span className="stat-value">
                            {stats.rejectedOrders} (Rs.{stats.rejectedAmount.toLocaleString("en-IN")})
                          </span>
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              ) : (
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
                        <span className="stat-value">Rs.{stats.totalAmount.toLocaleString("en-IN")}</span>
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
                        <span className="stat-value">Rs.{stats.collectedAmount.toLocaleString("en-IN")}</span>
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
                        <span className="stat-value">Rs.{stats.pendingAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </Col>
                  {/* {stats.rejectedAmount > 0 && (
                    <Col md="3">
                      <div className="stat-card compact">
                        <div className="stat-icon danger compact">
                          <i className="ni ni-fat-remove"></i>
                        </div>
                        <div className="stat-content">
                          <span className="stat-label">Rejected</span>
                          <span className="stat-value">Rs.{stats.rejectedAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </Col>
                  )} */}
                </Row>
              )}

              {/* Transactions Table */}
              <div className="transactions-section">
                <div className="transactions-header">
                  <h6 className="transactions-title">
                    {selectedStaff.type?.toLowerCase() === "delivery" ? "📦 Delivery Orders" : "📋 Order History"}
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
                            <th>D.Date</th>
                            <th>Customer</th>
                            <th>Order No</th>

                            <th>Amount</th>
                            {selectedStaff.type?.toLowerCase() !== "delivery" && <th>P.Status</th>}
                            <th>O.Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((bill, idx) => {
                            let paymentStatusText = "Pending";
                            let paymentStatusClass = "pending";

                            if (bill.orderStatus === "rejected") {
                              paymentStatusText = "Rejected";
                              paymentStatusClass = "rejected";
                            } else if (
                              bill.paymentMethod &&
                              bill.paymentMethod !== null &&
                              bill.paymentMethod !== "null"
                            ) {
                              paymentStatusText = "Paid";
                              paymentStatusClass = "paid";
                            }

                            return (
                              <tr key={bill._id} className={bill.orderStatus === "rejected" ? "rejected-row" : ""}>
                                <td>{indexOfFirstItem + idx + 1}</td>
                                <td>
                                  {bill.deliveredAt
                                    ? new Date(bill.deliveredAt).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "numeric",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </td>
                                <td>{getCustomerName(bill)}</td>
                                <td>
                                  <span className="order-id">#{bill._id.toString().slice(-6)}</span>
                                </td>
                                <td className="amount">Rs.{(Number(bill.totalAmt) || 0).toLocaleString("en-IN")}</td>
                                {selectedStaff.type?.toLowerCase() !== "delivery" && (
                                  <td>
                                    <span className={`order-status-badge ${paymentStatusClass}`}>
                                      {paymentStatusText}
                                    </span>
                                  </td>
                                )}
                                <td>
                                  <span
                                    className={`order-status-badge ${bill.orderStatus?.toLowerCase() || "pending"}`}
                                  >
                                    {bill.orderStatus || "Pending"}
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
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td
                              colSpan={selectedStaff.type?.toLowerCase() === "delivery" ? "4" : "4"}
                              className="text-end fw-bold"
                            >
                              Total :
                            </td>
                            <td className="amount fw-bold">Rs.{stats.totalAmount.toLocaleString("en-IN")}</td>
                            <td colSpan="2"></td>
                          </tr>
                          {/* {stats.rejectedAmount > 0 && (
                            <tr className="rejected-footer-row">
                              <td colSpan={selectedStaff.type?.toLowerCase() === 'delivery' ? "4" : "4"} className="text-end text-danger">Rejected Amount:</td>
                              <td className="amount text-danger">Rs.{stats.rejectedAmount.toLocaleString('en-IN')}</td>
                              <td colSpan="2"></td>
                            </tr>
                          )} */}
                        </tfoot>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="pagination-wrapper">
                        <Pagination>
                          <PaginationItem disabled={currentPage === 1}>
                            <PaginationLink previous onClick={() => paginate(currentPage - 1)} />
                          </PaginationItem>

                          {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i + 1} active={currentPage === i + 1}>
                              <PaginationLink onClick={() => paginate(i + 1)}>{i + 1}</PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem disabled={currentPage === totalPages}>
                            <PaginationLink next onClick={() => paginate(currentPage + 1)} />
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
                      <button className="clear-filter-btn" onClick={() => setDateRange([null, null])}>
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

      {/* Simple Invoice Modal - No frames */}
      <Modal
        isOpen={invoiceModal}
        toggle={() => setInvoiceModal(false)}
        size="lg"
        scrollable
        className="simple-invoice-modal"
      >
        <ModalHeader toggle={() => setInvoiceModal(false)}>
          Order Invoice #{selectedBill?._id.toString().slice(-6)}
        </ModalHeader>
        <ModalBody>
          {selectedBill && (
            <div className="simple-invoice">
              {/* Order Header */}
              <div style={{ borderBottom: "2px solid #eee", paddingBottom: "20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", fontSize: "18px" }}>Retail Pulse</h3>
                    <p style={{ margin: 0, color: "#666" }}>Order Invoice</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        backgroundColor: selectedBill.orderStatus === "rejected" ? "#fef2f2" : "#e6f7e6",
                        color: selectedBill.orderStatus === "rejected" ? "#dc2626" : "#10b981",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {(selectedBill.orderStatus || "Delivered").charAt(0).toUpperCase() +
                        (selectedBill.orderStatus || "Delivered").slice(1)}
                    </div>
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
                      Date: {new Date(selectedBill.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Staff Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                <div>
                  <h4 style={{ fontSize: "14px", margin: "0 0 10px 0", color: "#333" }}>Customer Details</h4>
                  <p style={{ margin: "5px 0", fontSize: "13px" }}>
                    <strong>Name:</strong> {getCustomerName(selectedBill)}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "13px" }}>
                    <strong>Mobile:</strong>{" "}
                    {selectedBill.customerId?.mobile || selectedBill.customerId?.phone || "N/A"}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "13px" }}>
                    <strong>Address:</strong>{" "}
                    {selectedBill.customerId?.address || selectedBill.deliveryAddress || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", margin: "0 0 10px 0", color: "#333" }}>Staff Details</h4>
                  <p style={{ margin: "5px 0", fontSize: "13px" }}>
                    <strong>Name:</strong> {selectedStaff?.name || selectedBill.staffName || "N/A"}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "13px" }}>
                    <strong>Type:</strong> {selectedStaff?.type || "staff"}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "13px" }}>
                    <strong>Contact:</strong> {selectedStaff?.mobile || selectedStaff?.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Products Table */}
              <div style={{ marginBottom: "30px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                      <th style={{ padding: "10px", textAlign: "left" }}>S.No</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Product</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Qty</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Rate (Rs.)</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.orderedProducts?.map((product, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "10px" }}>{idx + 1}</td>
                        <td style={{ padding: "10px" }}>{product.productName}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>{product.qty}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {(Number(product.value) || 0).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {((Number(product.value) || 0) * (Number(product.qty) || 0)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ borderTop: "2px solid #eee", paddingTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ width: "300px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontWeight: "500" }}>Subtotal:</span>
                      <span>
                        Rs.
                        {selectedBill.orderedProducts
                          ?.reduce((sum, product) => sum + (Number(product.value) || 0) * (Number(product.qty) || 0), 0)
                          .toLocaleString("en-IN") || (Number(selectedBill.totalAmt) || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontWeight: "500" }}>Discount:</span>
                      <span>Rs.0</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                      <span style={{ fontWeight: "500" }}>Tax:</span>
                      <span>Rs.0</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "2px solid #333",
                        paddingTop: "10px",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      <span>Total:</span>
                      <span>Rs.{(Number(selectedBill.totalAmt) || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {selectedBill.paymentMethod && selectedBill.orderStatus !== "rejected" && (
                <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
                    <strong>Payment Method:</strong> {selectedBill.paymentMethod}
                  </p>
                  {selectedBill.paymentCollectedAt && (
                    <p style={{ margin: "0", fontSize: "13px" }}>
                      <strong>Payment Collected:</strong>{" "}
                      {new Date(selectedBill.paymentCollectedAt).toLocaleString("en-IN")}
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
