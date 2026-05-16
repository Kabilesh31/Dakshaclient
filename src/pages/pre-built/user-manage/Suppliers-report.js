import React, { useState, useEffect, forwardRef, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { Input, Button, Row, Col, UncontrolledTooltip, Spinner, Modal, ModalHeader, ModalBody } from "reactstrap";
// import { errorToast } from "../../utils/toaster";
import * as XLSX from "xlsx";
import "./report.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const SuppliersReportPage = () => {
  const [suppliersList, setSuppliersList] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalAmount: 0,
    totalItems: 0,
    avgOrderValue: 0,
    statusBreakdown: {},
  });

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/suppliers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      setSuppliersList(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      errorToast("Failed to fetch suppliers list");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Fetch Purchase Orders for selected supplier with date filters
  const fetchPurchaseOrders = useCallback(async () => {
    if (!selectedSupplier) return;

    setLoadingPOs(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate.toISOString().split("T")[0];
      if (endDate) params.endDate = endDate.toISOString().split("T")[0];

      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/purchase-orders/supplier/${selectedSupplier.supplierId}`,
        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "session-token": localStorage.getItem("sessionToken"),
          },
        }
      );
      const orders = res.data.data || [];
      setPurchaseOrders(orders);

      // Calculate metrics
      const totalOrders = orders.length;
      const totalAmount = orders.reduce((sum, po) => sum + (po.grandTotal || 0), 0);
      const totalItems = orders.reduce((sum, po) => sum + (po.items?.length || 0), 0);
      const avgOrderValue = totalOrders ? totalAmount / totalOrders : 0;

      const statusBreakdown = {};
      orders.forEach(po => {
        const status = po.status || "Unknown";
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      });

      setMetrics({ totalOrders, totalAmount, totalItems, avgOrderValue, statusBreakdown });
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error);
      errorToast("Failed to fetch purchase orders");
      setPurchaseOrders([]);
    } finally {
      setLoadingPOs(false);
    }
  }, [selectedSupplier, startDate, endDate]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    if (month) {
      const year = month.getFullYear();
      const monthIndex = month.getMonth();
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0);
      setDateRange([start, end]);
    } else {
      setDateRange([null, null]);
    }
  };

  const clearMonth = () => {
    setSelectedMonth(null);
    setDateRange([null, null]);
  };

  // Open invoice modal
  const openInvoice = (po) => {
    setSelectedPO(po);
    setModalOpen(true);
  };

  // Export PDF (full report)
  const exportPDF = () => {
    if (!selectedSupplier || purchaseOrders.length === 0) return;

    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Supplier Purchase Order Report", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, margin, y);
    y += 6;

    if (startDate && endDate) {
      doc.text(
        `Period: ${startDate.toLocaleDateString("en-IN")} - ${endDate.toLocaleDateString("en-IN")}`,
        margin,
        y
      );
      y += 8;
    } else {
      y += 4;
    }

    // Supplier Details
    const leftX = margin;
    const rightX = doc.internal.pageSize.getWidth() / 2 + 5;
    const lineHeight = 7;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Supplier Details", leftX, y);
    y += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${selectedSupplier.name}`, leftX, y);
    y += lineHeight;
    doc.text(`Supplier ID: ${selectedSupplier.supplierId}`, leftX, y);
    y += lineHeight;
    doc.text(`Group: ${selectedSupplier.group}`, leftX, y);
    y += lineHeight;
    doc.text(`GST: ${selectedSupplier.gstNumber || "N/A"}`, leftX, y);
    y += lineHeight;
    doc.text(`Mobile: ${selectedSupplier.contact?.mobile || "N/A"}`, leftX, y);
    y += 8;

    // Metrics Summary
    doc.setFont("helvetica", "bold");
    doc.text("Summary Metrics", leftX, y);
    y += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(`Total Purchase Orders: ${metrics.totalOrders}`, leftX, y);
    y += lineHeight;
    doc.text(`Total Amount: ₹${metrics.totalAmount.toLocaleString("en-IN")}`, leftX, y);
    y += lineHeight;
    doc.text(`Total Items Ordered: ${metrics.totalItems}`, leftX, y);
    y += lineHeight;
    doc.text(`Average Order Value: ₹${Math.round(metrics.avgOrderValue).toLocaleString("en-IN")}`, leftX, y);
    y += 8;

    // Status breakdown
    doc.setFont("helvetica", "bold");
    doc.text("Order Status Breakdown", leftX, y);
    y += lineHeight;
    doc.setFont("helvetica", "normal");
    Object.entries(metrics.statusBreakdown).forEach(([status, count]) => {
      doc.text(`${status}: ${count}`, leftX, y);
      y += lineHeight;
    });
    y += 4;

    // Purchase Orders Table
    const tableColumn = ["PO ID", "Date", "Required By", "Grand Total (₹)", "Status", "Items Count"];
    const tableRows = purchaseOrders.map(po => [
      po._id,
      new Date(po.date).toLocaleDateString("en-IN"),
      po.requiredBy ? new Date(po.requiredBy).toLocaleDateString("en-IN") : "-",
      po.grandTotal.toLocaleString("en-IN"),
      po.status,
      po.items?.length || 0,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y + 4,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9 },
    });

    doc.save(`${selectedSupplier.name}_PurchaseOrders.pdf`);
  };

  // Export Excel
  const exportExcel = () => {
    if (!selectedSupplier) return;

    const summaryData = [
      { Metric: "Supplier Name", Value: selectedSupplier.name },
      { Metric: "Supplier ID", Value: selectedSupplier.supplierId },
      { Metric: "Total Purchase Orders", Value: metrics.totalOrders },
      { Metric: "Total Amount (₹)", Value: metrics.totalAmount.toLocaleString("en-IN") },
      { Metric: "Total Items Ordered", Value: metrics.totalItems },
      { Metric: "Average Order Value (₹)", Value: Math.round(metrics.avgOrderValue).toLocaleString("en-IN") },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    const statusData = Object.entries(metrics.statusBreakdown).map(([status, count]) => ({ Status: status, Count: count }));
    const statusSheet = XLSX.utils.json_to_sheet(statusData);

    const poSheetData = purchaseOrders.map((po, idx) => ({
      "S.No": idx + 1,
      "PO ID": po._id,
      Date: new Date(po.date).toLocaleDateString("en-IN"),
      "Required By": po.requiredBy ? new Date(po.requiredBy).toLocaleDateString("en-IN") : "-",
      "Grand Total (₹)": po.grandTotal,
      Status: po.status,
      "Items Count": po.items?.length || 0,
      "Mode of Payment": po.modeOfPayment,
      "Terms of Payment": po.termsOfPayment,
    }));
    const poSheet = XLSX.utils.json_to_sheet(poSheetData);

    const itemsData = [];
    purchaseOrders.forEach(po => {
      po.items?.forEach(item => {
        itemsData.push({
          "PO ID": po._id,
          "Item Code": item.itemCode,
          "Item Name": item.itemName,
          Quantity: item.quantity,
          UOM: item.uom,
          Rate: item.rate,
          Amount: item.amount,
        });
      });
    });
    const itemsSheet = XLSX.utils.json_to_sheet(itemsData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(wb, statusSheet, "Status Breakdown");
    XLSX.utils.book_append_sheet(wb, poSheet, "Purchase Orders");
    if (itemsData.length) XLSX.utils.book_append_sheet(wb, itemsSheet, "Line Items");
    XLSX.writeFile(wb, `${selectedSupplier.name}_PurchaseOrders.xlsx`);
  };

  const CustomDateButton = forwardRef(({ value, onClick }, ref) => (
    <button className="date-picker-button" onClick={onClick} ref={ref}>
      <i className="ni ni-calendar-date"></i>
      <span>{value || "Select Date Range"}</span>
      <i className="ni ni-chevron-down"></i>
    </button>
  ));

  const MonthPickerButton = forwardRef(({ value, onClick }, ref) => (
    <button className="date-picker-button month-picker" onClick={onClick} ref={ref}>
      <span>{value || "Select Month"}</span>
      <i className="ni ni-chevron-down"></i>
    </button>
  ));

  const PopperContainer = ({ children }) => (
    <div style={{ position: "relative", zIndex: 1050 }}>{children}</div>
  );

  const filteredSuppliers = suppliersList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact?.mobile && s.contact.mobile.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2 className="mt-5 reports-title">Suppliers Report</h2>
        <p className="reports-subtitle">
          View purchase order history, total spending, and item details per supplier
        </p>
      </div>

      <div className="reports-content">
        {/* Left Panel */}
        <div className="customers-panel">
          <div className="customers-panel-header">
            <h5 className="panel-title">Suppliers</h5>
            <span className="customer-count">{filteredSuppliers.length} of {suppliersList.length}</span>
          </div>
          <div className="search-box">
            <i className="ni ni-search search-icon ml-4"></i>
            <Input
              type="text"
              placeholder="Search supplier by name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && <button className="clear-search" onClick={() => setSearch("")}>×</button>}
          </div>
          <div className="customers-list">
            {loadingSuppliers ? (
              <div className="text-center p-4"><Spinner size="sm" color="primary" /> Loading suppliers...</div>
            ) : filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((s) => (
                <div
                  key={s._id}
                  className={`customer-item ${selectedSupplier?._id === s._id ? "selected" : ""}`}
                  onClick={() => setSelectedSupplier(s)}
                >
                  <div className="customer-avatar">{s.name.charAt(0)}</div>
                  <div className="customer-info">
                    <div className="customer-name">{s.name}</div>
                    <div className="customer-details" style={{ fontSize: "11px", color: "#6c757d" }}>
                      {s.supplierId} • {s.group}
                    </div>
                  </div>
                  {selectedSupplier?._id === s._id && <div className="selected-indicator"><i className="ni ni-check"></i></div>}
                </div>
              ))
            ) : (
              <div className="no-customers"><i className="ni ni-users"></i><p>No suppliers found</p></div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="reports-panel">
          {selectedSupplier ? (
            <>
              <div className="action-bar ultra-compact d-flex align-items-center justify-content-end gap-2 flex-wrap">
                <div className="picker-wrapper">
                  <DatePicker
                    selected={selectedMonth}
                    onChange={handleMonthChange}
                    showMonthYearPicker
                    dateFormat="MMMM yyyy"
                    customInput={<MonthPickerButton />}
                    popperPlacement="bottom-start"
                    popperContainer={PopperContainer}
                    isClearable={true}
                  />
                </div>
                <div className="picker-wrapper">
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => { setDateRange(update); setSelectedMonth(null); }}
                    customInput={<CustomDateButton />}
                    popperPlacement="bottom-start"
                    popperContainer={PopperContainer}
                    shouldCloseOnSelect={false}
                    placeholderText="Select Range"
                    isClearable={true}
                  />
                </div>
                {selectedMonth && <Button size="sm" color="link" onClick={clearMonth} className="clear-month-btn p-0">✕</Button>}
                <div className="export-buttons ultra-compact d-flex align-items-center gap-1">
                  <button onClick={exportExcel} className="export-btn excel ultra-compact"><FaFileExcel /></button>
                  <button onClick={exportPDF} className="export-btn pdf ultra-compact"><FaFilePdf size={13} /></button>
                </div>
              </div>

              <div className="customer-header">
                <div className="customer-header-info">
                  <div className="customer-header-avatar">{selectedSupplier.name.charAt(0)}</div>
                  <div>
                    <h3 className="customer-header-name">{selectedSupplier.name}</h3>
                    {/* <p className="customer-header-meta">
                      {selectedSupplier.supplierId} • {selectedSupplier.group} • GST: {selectedSupplier.gstNumber || "N/A"}
                    </p> */}
                    <p className="customer-header-meta">
                      <i className="ni ni-mobile"></i> {selectedSupplier.contact?.mobile || "No mobile"} &nbsp;|&nbsp;
                      <i className="ni ni-email"></i> {selectedSupplier.contact?.email || "No email"}
                    </p>
                  </div>
                </div>
                {(startDate || endDate) && (
                  <div className="date-range-badge">
                    <i className="ni ni-calendar-date"></i>
                    <span>{startDate?.toLocaleDateString("en-IN")} - {endDate?.toLocaleDateString("en-IN")}</span>
                  </div>
                )}
              </div>

              {/* Enhanced Stat Cards with better icons */}
        <Row className="stats-row g-2">
  <Col md="3">
    <div className="stat-card compact">
      <div className="stat-icon blue compact">
        <i className="ni ni-bag-fill"></i>
      </div>
      <div className="stat-content">
        <span className="stat-label">Total POs</span>
        <span className="stat-value">{metrics.totalOrders}</span>
      </div>
    </div>
  </Col>

  <Col md="3">
    <div className="stat-card compact">
      <div className="stat-icon success compact">
        <i className="ni ni-wallet-fill"></i>
      </div>
      <div className="stat-content">
        <span className="stat-label">Total Spent</span>
        <span className="stat-value">
          ₹{metrics.totalAmount.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  </Col>

  <Col md="3">
    <div className="stat-card compact">
      <div className="stat-icon info compact">
        <i className="ni ni-package-fill"></i>
      </div>
      <div className="stat-content">
        <span className="stat-label">Total Items</span>
        <span className="stat-value">{metrics.totalItems}</span>
      </div>
    </div>
  </Col>

  <Col md="3">
    <div className="stat-card compact">
      <div className="stat-icon purple compact">
        <i className="ni ni-trend-up"></i>
      </div>
      <div className="stat-content">
        <span className="stat-label">Avg Order Value</span>
        <span className="stat-value">
          ₹{Math.round(metrics.avgOrderValue).toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  </Col>
</Row>

              {/* Status Breakdown Row */}
              <div className="status-breakdown" style={{ marginTop: "10px", marginBottom: "20px" }}>
                <div className="transactions-header">
                  <h6 className="transactions-title">Order Status</h6>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {Object.entries(metrics.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="badge" style={{ background: "#e9ecef", color: "#495057", padding: "4px 12px", borderRadius: "20px" }}>
                      {status}: {count}
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Orders Table (clickable rows) */}
              {loadingPOs ? (
                <div className="text-center p-5"><Spinner color="primary" /> Loading purchase orders...</div>
              ) : purchaseOrders.length > 0 ? (
                <div className="transactions-section">
                  <div className="transactions-header">
                    <h6 className="transactions-title">Purchase Orders</h6>
                    <span className="transactions-count">{purchaseOrders.length} orders</span>
                  </div>
                  <div className="table-responsive">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>PO ID</th>
                          <th>Date</th>
                          <th>Required By</th>
                          <th>Grand Total (₹)</th>
                          <th>Status</th>
                          <th>Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseOrders.map((po, idx) => (
                          <tr key={po._id} style={{ cursor: "pointer" }} onClick={() => openInvoice(po)}>
                            <td>{idx + 1}</td>
                            <td>
                              <span id={`poTooltip-${idx}`} style={{ textDecoration: "underline dotted" }}>
                                {po._id}
                              </span>
                              <UncontrolledTooltip placement="top" target={`poTooltip-${idx}`}>
                                Mode: {po.modeOfPayment}<br />
                                Terms: {po.termsOfPayment || "N/A"}
                              </UncontrolledTooltip>
                            </td>
                            <td>{new Date(po.date).toLocaleDateString("en-IN")}</td>
                            <td>{po.requiredBy ? new Date(po.requiredBy).toLocaleDateString("en-IN") : "-"}</td>
                            <td>₹{po.grandTotal.toLocaleString("en-IN")}</td>
                            <td>
                              <span className="badge" style={{
                                background: po.status === "Completed" ? "#28a745" : po.status === "Cancelled" ? "#dc3545" : "#ffc107",
                                color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "11px"
                              }}>
                                {po.status}
                              </span>
                            </td>
                            <td>
                              <span id={`itemsTooltip-${idx}`} style={{ textDecoration: "underline dotted" }}>
                                {po.items?.length || 0} items
                              </span>
                              <UncontrolledTooltip placement="top" target={`itemsTooltip-${idx}`}>
                                {po.items?.map(item => `${item.itemName} (${item.quantity} ${item.uom})`).join(", ")}
                              </UncontrolledTooltip>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="text-end fw-bold">Total:</td>
                          <td className="fw-bold">₹{metrics.totalAmount.toLocaleString("en-IN")}</td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-5 text-muted">
                  <i className="ni ni-chart-bar-32" style={{ fontSize: "48px" }}></i>
                  <p className="mt-3">No purchase orders found for the selected period.</p>
                </div>
              )}
            </>
          ) : (
            <div className="select-customer-prompt">
              <i className="ni ni-users"></i>
              <h4>Select a Supplier</h4>
              <p>Choose a supplier from the left panel to view their purchase order report</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
  {/* Invoice Modal - No outer border, scrollable with hidden scrollbar */}
<Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="xl"  style={{ maxWidth: "1000px" }}>
  
  <ModalBody 
    style={{ 
      maxHeight: "90vh", 
      overflowY: "auto",
      scrollbarWidth: "none",  /* Firefox */
      msOverflowStyle: "none", /* IE and Edge */
      padding: "20px"
    }}
    className="hide-scrollbar"
  >
    {selectedPO && (
      <div className="invoice-container" style={{ border: "none", boxShadow: "none", background: "transparent" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid #eee" }}>
          <div>
            <h3>Purchase Order</h3>
            <p><strong>PO ID:</strong> {selectedPO._id}</p>
            <p><strong>Date:</strong> {new Date(selectedPO.date).toLocaleDateString("en-IN")}</p>
            <p><strong>Required By:</strong> {selectedPO.requiredBy ? new Date(selectedPO.requiredBy).toLocaleDateString("en-IN") : "-"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p><strong>Series:</strong> {selectedPO.series || "-"}</p>
            <p><strong>Status:</strong> <span className="badge" style={{ background: selectedPO.status === "Completed" ? "#28a745" : "#ffc107", color: "#fff", padding: "4px 8px", borderRadius: "12px" }}>{selectedPO.status}</span></p>
          </div>
        </div>

        {/* Supplier Info */}
        <div style={{ marginBottom: "20px", padding: "12px", background: "#f8f9fa", borderRadius: "8px" }}>
          <h5 style={{ marginBottom: "10px" }}>Supplier Details</h5>
          <p style={{ margin: "4px 0" }}><strong>Name:</strong> {selectedPO.supplierName}</p>
          <p style={{ margin: "4px 0" }}><strong>ID:</strong> {selectedPO.supplierId}</p>
          <p style={{ margin: "4px 0" }}><strong>Address:</strong> {selectedPO.supplierAddress || "-"}</p>
          <p style={{ margin: "4px 0" }}><strong>Contact:</strong> {selectedPO.supplierContact || "-"}</p>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: "20px" }}>
          <h5>Items Ordered</h5>
          <div className="table-responsive">
            <table className="transactions-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>UOM</th>
                  <th>Rate (₹)</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedPO.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.itemName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.uom}</td>
                    <td>₹{item.rate}</td>
                    <td>₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" className="text-end fw-bold">Grand Total:</td>
                  <td className="fw-bold">₹{selectedPO.grandTotal.toLocaleString("en-IN")}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment & Terms */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", fontSize: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div><strong>Mode of Payment:</strong> {selectedPO.modeOfPayment}</div>
          <div><strong>Terms of Payment:</strong> {selectedPO.termsOfPayment || "-"}</div>
          <div><strong>Tax Category:</strong> {selectedPO.taxCategory || "-"}</div>
        </div>

        {/* Additional Info */}
        <div style={{ marginTop: "20px", fontSize: "12px", color: "#666", borderTop: "1px solid #eee", paddingTop: "10px" }}>
          <p><strong>Project:</strong> {selectedPO.project || "-"} (ID: {selectedPO.projectId || "-"})</p>
          <p><strong>Cost Center:</strong> {selectedPO.costCenter || "-"}</p>
          <p><strong>Place of Supply:</strong> {selectedPO.placeOfSupply || "-"}</p>
          <p><strong>Reverse Charge:</strong> {selectedPO.isReverseCharge ? "Yes" : "No"} | <strong>Tax Withholding:</strong> {selectedPO.applyTaxWithholding ? "Yes" : "No"}</p>
          {selectedPO.termsAndConditions && <p><strong>Terms & Conditions:</strong> {selectedPO.termsAndConditions}</p>}
        </div>
      </div>
    )}
  </ModalBody>
</Modal>
    </div>
  );
};

export default SuppliersReportPage;