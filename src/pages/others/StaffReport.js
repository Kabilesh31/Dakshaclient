import React, { useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { Input, Button, Row, Col, FormGroup, UncontrolledTooltip } from "reactstrap";
import { errorToast } from "../../utils/toaster";
import * as XLSX from "xlsx";
import "./report.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const StaffReport = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [metrics, setMetrics] = useState({
    totalSites: 0,
    daysWorked: 0,
    totalHours: 0,
    overtimeHours: 0,
    salaryReceived: 0,
    overtimeAmount: 0,
    siteWiseData: [],
  });

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

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle month selection
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

  // Clear month selection
  const clearMonth = () => {
    setSelectedMonth(null);
    setDateRange([null, null]);
  };

  // Generate dummy data when staff or date range changes
  useEffect(() => {
    if (!selectedStaff) {
      setMetrics({
        totalSites: 0,
        daysWorked: 0,
        totalHours: 0,
        overtimeHours: 0,
        salaryReceived: 0,
        overtimeAmount: 0,
        siteWiseData: [],
      });
      return;
    }

    const dummySiteNames = [
      "Downtown Office Complex",
      "Riverside Residential Tower",
      "Greenfield Industrial Park",
      "Harbor View Mall",
      "Sunset Hills Villa Project",
      "Tech Hub Innovation Center",
      "Metro Transit Station",
      "Central Hospital Extension",
      "City School Campus",
      "Sports Arena",
    ];

    let start = startDate ? new Date(startDate) : new Date("2024-01-01");
    let end = endDate ? new Date(endDate) : new Date();
    if (!startDate) start = new Date("2024-01-01");
    if (!endDate) end = new Date();

    const numSites = Math.floor(Math.random() * 5) + 2;
    const shuffledSites = [...dummySiteNames].sort(() => 0.5 - Math.random());
    const selectedSites = shuffledSites.slice(0, numSites);

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const workingDays = Math.min(diffDays, Math.floor(Math.random() * 20) + 5);

    const allDates = [];
    for (let i = 0; i < workingDays; i++) {
      const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      allDates.push(randomDate.toISOString().split("T")[0]);
    }
    const uniqueDates = [...new Set(allDates)].sort();

    const randomHours = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    const siteWiseData = selectedSites.map((siteName) => {
      const daysWorked = Math.floor(Math.random() * Math.min(uniqueDates.length, 15)) + 1;
      const selectedDates = uniqueDates.slice(0, daysWorked).sort();
      let totalHours = 0;
      let overtimeHours = 0;
      selectedDates.forEach(() => {
        const reg = randomHours(7, 9);
        const over = randomHours(0, 2);
        totalHours += reg;
        overtimeHours += over;
      });
      return {
        siteName,
        daysWorked,
        totalHours,
        overtimeHours,
        datesWorked: selectedDates,
      };
    });

    const totalSites = siteWiseData.length;
    const daysWorked = siteWiseData.reduce((sum, s) => sum + s.daysWorked, 0);
    const totalHours = siteWiseData.reduce((sum, s) => sum + s.totalHours, 0);
    const overtimeHours = siteWiseData.reduce((sum, s) => sum + s.overtimeHours, 0);

    const hourlyRate = 200;
    const overtimeRate = 300;
    const salaryReceived = totalHours * hourlyRate;
    const overtimeAmount = overtimeHours * overtimeRate;

    setMetrics({
      totalSites,
      daysWorked,
      totalHours,
      overtimeHours,
      salaryReceived,
      overtimeAmount,
      siteWiseData,
    });
  }, [selectedStaff, startDate, endDate]);

  const exportPDF = () => {
  if (!selectedStaff) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text("Staff Performance Report", margin, y);
  y += 8;

  // Subtitle / generated date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, margin, y);
  y += 6;

  // Period if selected
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

  // ----- TWO COLUMN LAYOUT -----
  const leftX = margin;
  const rightX = pageWidth / 2 + 5;
  const lineHeight = 7;
  let leftY = y;
  let rightY = y;

  // Left column: Staff details
  doc.setFontSize(12);
  doc.setTextColor(33);
  doc.setFont("helvetica", "bold");
  doc.text("Staff Details", leftX, leftY);
  leftY += lineHeight;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${selectedStaff.name}`, leftX, leftY);
  leftY += lineHeight;
  doc.text(`Mobile: ${selectedStaff.mobile || selectedStaff.phone || "N/A"}`, leftX, leftY);
  leftY += lineHeight;
  // Optional: add any other staff field (e.g., designation) if available
  if (selectedStaff.designation) {
    doc.text(`Designation: ${selectedStaff.designation}`, leftX, leftY);
    leftY += lineHeight;
  }

  // Right column: Summary metrics
  doc.setFont("helvetica", "bold");
  doc.text("Performance Summary", rightX, rightY);
  rightY += lineHeight;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total Sites: ${metrics.totalSites}`, rightX, rightY);
  rightY += lineHeight;
  doc.text(`Days Worked: ${metrics.daysWorked}`, rightX, rightY);
  rightY += lineHeight;
  doc.text(`Total Hours: ${metrics.totalHours} hrs`, rightX, rightY);
  rightY += lineHeight;
  doc.text(`Overtime Hours: ${metrics.overtimeHours} hrs`, rightX, rightY);
  rightY += lineHeight;
  doc.text(`Salary Received: Rs.${metrics.salaryReceived.toLocaleString("en-IN")}`, rightX, rightY);
  rightY += lineHeight;
  doc.text(`Overtime Amount: Rs.${metrics.overtimeAmount.toLocaleString("en-IN")}`, rightX, rightY);

  // Determine the max Y used by both columns
  const maxY = Math.max(leftY, rightY);
  y = maxY + 8; // space before table

  // ----- Site‑wise Table -----
  const siteTableColumn = ["Site Name", "Days Worked", "Total Hours", "Overtime Hrs", "Dates Worked (sample)"];
  const siteTableRows = metrics.siteWiseData.map((site) => [
    site.siteName,
    site.daysWorked.toString(),
    site.totalHours.toString(),
    site.overtimeHours.toString(),
    site.datesWorked.slice(0, 3).join(", ") + (site.datesWorked.length > 3 ? "…" : ""),
  ]);

  autoTable(doc, {
    head: [siteTableColumn],
    body: siteTableRows,
    startY: y,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9 },
    columnStyles: {
      4: { cellWidth: 40 }, // restrict dates column width
    },
  });

  doc.save(`${selectedStaff.name}_Report.pdf`);
};

  const exportExcel = () => {
    if (!selectedStaff) return;
    const summaryData = [
      { Metric: "Total Sites", Value: metrics.totalSites },
      { Metric: "Days Worked", Value: metrics.daysWorked },
      { Metric: "Total Hours", Value: metrics.totalHours },
      { Metric: "Overtime Hours", Value: metrics.overtimeHours },
      { Metric: "Salary Received", Value: `Rs.${metrics.salaryReceived.toLocaleString("en-IN")}` },
      { Metric: "Overtime Amount", Value: `Rs.${metrics.overtimeAmount.toLocaleString("en-IN")}` },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    const siteSheetData = metrics.siteWiseData.map((site, idx) => ({
      "S.No": idx + 1,
      "Site Name": site.siteName,
      "Days Worked": site.daysWorked,
      "Total Hours": site.totalHours,
      "Overtime Hours": site.overtimeHours,
      "Dates Worked": site.datesWorked.join(", "),
    }));
    const siteSheet = XLSX.utils.json_to_sheet(siteSheetData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(wb, siteSheet, "Sites Worked");
    XLSX.writeFile(wb, `${selectedStaff.name}_Report.xlsx`);
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

  const PopperContainer = ({ children }) => {
    return <div style={{ position: "relative", zIndex: 1050 }}>{children}</div>;
  };

  const filteredStaff = staffList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.mobile && s.mobile.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2 className="mt-5 reports-title">Staff Reports</h2>
        <p className="reports-subtitle">View staff working hours, sites, and earnings</p>
      </div>

      <div className="reports-content">
        {/* Left Panel - Staff List */}
        <div className="customers-panel">
          <div className="customers-panel-header">
            <h5 className="panel-title"> Staff Members</h5>
            <span className="customer-count">{filteredStaff.length} of {staffList.length}</span>
          </div>
          <div className="search-box">
            <i className="ni ni-search search-icon ml-4"></i>
            <Input
              type="text"
              placeholder="Search staff by name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>×</button>
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
                    {/* {s.mobile && (
                      <div className="customer-details" style={{ fontSize: "12px", color: "#666" }}>
                        {s.mobile}
                      </div>
                    )} */}
                  </div>
                  {selectedStaff?._id === s._id && (
                    <div className="selected-indicator"><i className="ni ni-check"></i></div>
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
              <div className="action-bar ultra-compact d-flex align-items-center justify-content-end gap-2 flex-wrap">

  {/* Month Picker */}
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

  {/* Date Range Picker */}
  <div className="picker-wrapper">
    <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={(update) => {
        setDateRange(update);
        setSelectedMonth(null);
      }}
      customInput={<CustomDateButton />}
      popperPlacement="bottom-start"
      popperContainer={PopperContainer}
      shouldCloseOnSelect={false}
      placeholderText="Select Range"
      isClearable={true}
    />
  </div>

  {/* Clear Button */}
  {selectedMonth && (
    <Button size="sm" color="link" onClick={clearMonth} className="clear-month-btn p-0">
      ✕
    </Button>
  )}

  {/* Export Buttons */}
  <div className="export-buttons ultra-compact d-flex align-items-center gap-1">
    <button onClick={exportExcel} className="export-btn excel ultra-compact">
      <FaFileExcel />
    </button>
    <button onClick={exportPDF} className="export-btn pdf ultra-compact">
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
                      {selectedStaff.mobile || selectedStaff.phone || "No mobile"}
                     
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

              {/* Stats Cards */}
              <Row className="stats-row g-2">
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon blue compact"><i className="ni ni-building"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Total Sites</span>
                      <span className="stat-value">{metrics.totalSites}</span>
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon success compact"><i className="ni ni-check"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Days Worked</span>
                      <span className="stat-value">{metrics.daysWorked}</span>
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon info compact"><i className="ni ni-timer"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Total Hours</span>
                      <span className="stat-value">{metrics.totalHours}</span>
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon warning compact"><i className="ni ni-alarm-clock"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Overtime Hrs</span>
                      <span className="stat-value">{metrics.overtimeHours}</span>
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon purple compact"><i className="ni ni-coin"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Salary Received</span>
                      <span className="stat-value">Rs.{metrics.salaryReceived.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Sites Worked Table */}
              {metrics.siteWiseData.length > 0 && (
                <div className="transactions-section" style={{ marginTop: "20px" }}>
                  <div className="transactions-header">
                    <h6 className="transactions-title"> Sites Worked</h6>
                    <span className="transactions-count">{metrics.siteWiseData.length} sites</span>
                  </div>
                  <div className="table-responsive">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Site Name</th>
                          <th>Days Worked</th>
                          <th>Total Hours</th>
                          <th>Overtime Hrs</th>
                          <th>Dates Worked</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.siteWiseData.map((site, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{site.siteName}</td>
                            <td>{site.daysWorked}</td>
                            <td>{site.totalHours} hrs</td>
                            <td>{site.overtimeHours} hrs</td>
                            <td style={{ fontSize: "12px" }}>
                              <span id={`datesTooltip-${idx}`} style={{ cursor: "pointer", textDecoration: "underline dotted" }}>
                                {site.datesWorked.length} days
                              </span>
                              <UncontrolledTooltip placement="top" target={`datesTooltip-${idx}`}>
                                {site.datesWorked.join(", ")}
                              </UncontrolledTooltip>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="2" className="text-end fw-bold">Total:</td>
                          <td className="fw-bold">{metrics.daysWorked}</td>
                          <td className="fw-bold">{metrics.totalHours} hrs</td>
                          <td className="fw-bold">{metrics.overtimeHours} hrs</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
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
    </div>
  );
};

export default StaffReport;