import React, { useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { Input, Badge, Button, Table, Card, CardBody, Row, Col } from "reactstrap";
import { errorToast } from "../../utils/toaster";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./report.css";

const Reports = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/customer`);
      setCustomers(res.data.filter(c => !c.isDeleted));
    } catch {
      errorToast("Failed to fetch customers");
    }
  };

  const fetchReport = (customer) => {
    setSelectedCustomer(customer);
    // Dummy orders for now
    const dummyOrders = [
      { orderNo: "ORD001", date: "2026-01-01", amount: 1200 },
      { orderNo: "ORD002", date: "2026-01-05", amount: 850 },
      { orderNo: "ORD003", date: "2026-01-10", amount: 560 },
      
    ];
    setReportData(dummyOrders);
  };
const PopperContainer = ({ children }) => {
  return <div style={{ position: "relative", zIndex: 1050 }}>{children}</div>;
};

  const exportPDF = () => {
    if (!selectedCustomer) return;
    const doc = new jsPDF();
    doc.text(`Report for ${selectedCustomer.name}`, 14, 15);
    const tableColumn = ["Order No", "Date", "Amount"];
    const tableRows = reportData.map(o => [o.orderNo, o.date, o.amount]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`${selectedCustomer.name}_Report.pdf`);
  };

  const exportExcel = () => {
    if (!selectedCustomer) return;
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${selectedCustomer.name}_Report.xlsx`);
  };

  const totalAmount = reportData.reduce((acc, o) => acc + o.amount, 0);

  // Custom button for DatePicker
  const CustomDateButton = forwardRef(({ value, onClick }, ref) => (
    <button
      className="btn btn-outline-primary shadow-sm"
      onClick={onClick}
      ref={ref}
      style={{ minWidth: "220px" }}
    >
      {value || "Select Date Range"}
    </button>
  ));

  return (
    <div className="container py-4 mt-5">
      <div className="d-flex gap-4" style={{ height: "90vh" }}>
        {/* Left Panel: Customers */}
        <div style={{ flex: 1, overflowY: "auto", borderRight: "1px solid #eee", paddingRight: "1rem" }}>
          <h5 className="mb-3">Customers</h5>
          <Input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
          {customers
            .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
            .map(c => (
              <div
                key={c._id}
                className={`d-flex align-items-center justify-content-between p-3 mb-2 rounded shadow-sm ${selectedCustomer?._id === c._id ? "bg-primary text-white" : "bg-white"}`}
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onClick={() => fetchReport(c)}
              >
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar bg-info text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <div className="fw-bold">{c.name}</div>
                    <small>{c.phone}</small>
                  </div>
                </div>
                <Badge color={selectedCustomer?._id === c._id ? "light" : "info"}>Line #{c.lineNo}</Badge>
              </div>
            ))}
        </div>

        {/* Right Panel: Reports */}
        <div
  style={{
    flex: 2,
    display: "flex",
    flexDirection: "column",
    overflowY: "visible",
    padding: "1.5rem",
    height: "100%"
  }}
>
  {selectedCustomer ? (
    <>
      {/* Header: Top */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3">
        
        <div className="d-flex flex-column flex-md-row gap-5 align-items-end">
          <div className="mr-5">
            
          <DatePicker
  selectsRange
  startDate={startDate}
  endDate={endDate}
  onChange={(update) => setDateRange(update)}
  customInput={<CustomDateButton />}
  popperPlacement="bottom-start"
  popperContainer={PopperContainer}
  shouldCloseOnSelect={false}
/>




          </div>
          <li>
  <a
    href="#export"
    onClick={(ev) => {
      ev.preventDefault();
      exportExcel(); // call Excel export here
    }}
    className="btn btn-white btn-outline-light d-flex align-items-center gap-2"
   style={{ minWidth: "140px",padding:"18px",marginRight:"9px" }}
  >
    
    <span>Export Excel</span>
  </a>
</li>

<li>
  <a
    href="#export"
    onClick={(ev) => {
      ev.preventDefault();
      exportPDF(); // call PDF export here
    }}
    className="btn btn-white btn-outline-light d-flex align-items-center gap-2"
    style={{ minWidth: "140px",padding:"18px" }}
  >
   
    <span>Export PDF</span>
  </a>
</li>

        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end",paddingBottom: "2rem", }}>
        <h4 className="fw-bold mb-2">Report: {selectedCustomer.name}</h4>
      </div>
      

      {/* Body: Summary + Table pushed to bottom */}
     <div
  style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingBottom: "3rem", // ✅ moves content up slightly
  }}
>

        {/* Summary Cards */}
        <Row className="mb-4 pb-5 g-4">
          <Col md="6">
            <Card className="shadow-sm border-0 rounded bg-light">
              <CardBody className="text-center py-4">
                <h6 className="text-muted mb-2">Total Orders</h6>
                <h2 className="fw-bold display-5">{reportData.length}</h2>
              </CardBody>
            </Card>
          </Col>
          <Col md="6">
            <Card className="shadow-sm border-0 rounded bg-light">
              <CardBody className="text-center py-4">
                <h6 className="text-muted mb-2">Total Amount</h6>
                <h2 className="fw-bold display-5">{totalAmount}</h2>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Report Table */}
        {reportData.length > 0 ? (
          <Table hover responsive className="shadow-sm rounded bg-white">
            <thead className="table-light">
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Order No</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((o, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{o.orderNo}</td>
                  <td>{o.date}</td>
                  <td>{o.amount}</td>
                </tr>
              ))}
              <tr className="fw-bold bg-light">
                <td colSpan={3} className="text-end">Total</td>
                <td>{totalAmount}</td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <div className="text-center mt-5 text-muted fs-5">
            No orders found for the selected date range
          </div>
        )}
      </div>
    </>
  ) : (
    <div className="text-center mt-5 text-muted fs-5">
      Select a customer to view the report
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default Reports;
