import React, { useState, useEffect } from "react";
import axios from "axios";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  PaginationComponent,
} from "../../../components/Component";

const StaffAttendance = () => {
  const [staffs, setStaffs] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onSearch, setOnSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [itemPerPage, setItemPerPage] = useState(10);
  const [sort, setSortState] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const daysInMonth = Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1);

  const capitalizeFirst = (text) => {
    if (!text) return "-";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  // Reset selected date when month/year changes
  useEffect(() => {
    setSelectedDateDetails(null);
    setSelectedDay(null);
  }, [month, year]);

  // ================= FETCH STAFF =================
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (res.status === 200) {
        setStaffs(res.data);
      }

      setLoading(false);
    } catch (err) {
      console.log("Fetch staff error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");
          window.location.href = "/login";
        }
      } else {
        console.log("Network error");
      }

      setLoading(false);
    }
  };

  const sortFunc = (order) => {
    const sorted = [...staffs].sort((a, b) => {
      if (order === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setStaffs(sorted);
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end - start;

    if (diffMs <= 0) return "-";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

    return `${hours}h ${minutes}m`;
  };

  const filteredStaff = staffs.filter(
    (emp) => emp.name.toLowerCase().includes(searchText.toLowerCase()) || emp.mobile?.includes(searchText),
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  // ================= FETCH ATTENDANCE =================
  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      const structured = {};

      res.data.forEach((record) => {
        const dateObj = new Date(record.date);
        const y = dateObj.getFullYear();
        const m = months[dateObj.getMonth()];
        const d = dateObj.getDate();

        const staffId = typeof record.staffId === "object" ? record.staffId._id : record.staffId;

        if (!structured[y]) structured[y] = {};
        if (!structured[y][m]) structured[y][m] = {};
        if (!structured[y][m][staffId]) structured[y][m][staffId] = {};

        structured[y][m][staffId][d] = {
          status: record.currentStatus === "checked-in" ? "working" : "present",
          checkIn: record.startTime || null,
          checkOut: record.endTime || null,
          hours: record.totalHours ? record.totalHours.toFixed(2) : 0,
        };
      });

      setAttendance(structured);
    } catch (err) {
      console.log("Fetch attendance error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");
          window.location.href = "/login";
        }
      } else {
        console.log("Network error");
      }
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatTimeOnly = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // For calendar attendance colors
  const getStatusColor = (status) => {
    if (status === "present") return "#5DB996"; // green
    if (status === "working") return "#4F46E5"; // blue
    return "#e5e7eb"; // gray for not present
  };

  // For staff status text color
  const getStaffStatusColor = (status) => {
    if (status?.toLowerCase() === "active") return "#32CD32"; // light green
    if (status?.toLowerCase() === "inactive") return "red";
    return "gray";
  };

  // Calculate attendance summary
  const calculateAttendanceSummary = () => {
    if (!selectedStaff) return { present: 0, working: 0, total: 0 };

    let present = 0;
    let working = 0;

    daysInMonth.forEach((day) => {
      const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
      if (record?.status === "present") present++;
      if (record?.status === "working") working++;
    });

    return {
      present,
      working,
      total: daysInMonth.length,
    };
  };

  // Get selected date record
  const getSelectedDateRecord = () => {
    if (!selectedStaff || !selectedDay) return null;
    return attendance[year]?.[months[month]]?.[selectedStaff._id]?.[selectedDay];
  };

  // ================= EXPORT TO EXCEL FUNCTION =================
  const exportToExcel = () => {
    if (!selectedStaff) return;

    // Prepare data for export
    const exportData = daysInMonth.map((day) => {
      const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
      const date = new Date(year, month, day);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const isSunday = date.getDay() === 0;

      // Determine status
      let status = "-";
      if (isSunday) {
        status = "Sunday (Off)";
      } else if (record?.status === "present") {
        status = "Present";
      } else if (record?.status === "working") {
        status = "Working";
      } else if (!record) {
        status = "Absent";
      }

      return {
        Date: `${day} ${months[month]} ${year}`,
        Day: dayName,
        Status: status,
        "Check In": record?.checkIn ? formatTimeOnly(record.checkIn) : "-",
        "Check Out": record?.checkOut ? formatTimeOnly(record.checkOut) : "-",
        "Work Hours": record?.checkIn ? calculateHours(record.checkIn, record.checkOut) : "-",
        Remarks: isSunday ? "Weekly Off" : record ? "" : "No attendance record",
      };
    });

    // Add summary section
    const summary = calculateAttendanceSummary();
    const sundaysCount = daysInMonth.filter((day) => new Date(year, month, day).getDay() === 0).length;

    const absentCount = daysInMonth.filter((day) => {
      const date = new Date(year, month, day);
      const isSunday = date.getDay() === 0;
      const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
      return !isSunday && !record;
    }).length;

    // Create worksheet
    const wb = XLSX.utils.book_new();

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add summary at the bottom
    const summaryData = [
      [],
      ["SUMMARY"],
      ["Total Days", daysInMonth.length],
      ["Present Days", summary.present],
      ["Working Days", summary.working],
      ["Absent Days", absentCount],
      ["Sundays", sundaysCount],
      [],
      ["Generated on:", new Date().toLocaleString()],
      ["Staff Name:", selectedStaff.name],
      ["Month:", `${months[month]} ${year}`],
    ];

    // Add summary to worksheet
    XLSX.utils.sheet_add_aoa(ws, summaryData, { origin: -1 });

    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // Date
      { wch: 10 }, // Day
      { wch: 15 }, // Status
      { wch: 15 }, // Check In
      { wch: 15 }, // Check Out
      { wch: 12 }, // Work Hours
      { wch: 20 }, // Remarks
    ];

    // Add styling information
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell_ref]) continue;

        // Make header bold
        if (R === 0) {
          ws[cell_ref].s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: "4F46E5" } },
            font: { color: { rgb: "FFFFFF" }, bold: true },
          };
        }

        // Color code status cells
        if (C === 2 && R > 0) {
          // Status column
          const status = ws[cell_ref].v;
          if (status === "Present") {
            ws[cell_ref].s = { font: { color: { rgb: "2e7d32" } } };
          } else if (status === "Working") {
            ws[cell_ref].s = { font: { color: { rgb: "1565c0" } } };
          } else if (status === "Absent") {
            ws[cell_ref].s = { font: { color: { rgb: "d32f2f" } } };
          } else if (status === "Sunday (Off)") {
            ws[cell_ref].s = { font: { color: { rgb: "9e9e9e" } } };
          }
        }
      }
    }

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

    // Generate Excel file
    const fileName = `${selectedStaff.name}_${months[month]}_${year}_Attendance.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* ================= STAFF LIST VIEW ================= */}
      {!selectedStaff && (
        <Block>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle tag="h3" page>
                  <h3 style={{ marginTop: "55px" }}>Staff Attendance</h3>
                </BlockTitle>
                <p className="text-soft">You have total {staffs.length} Staffs.</p>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>

          <DataTable className="card-stretch">
            {/* TOOLBAR */}
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <div className="card-tools"></div>

                <div className="card-tools mr-n1">
                  <ul className="btn-toolbar gx-1">
                    {/* SEARCH */}
                    <li>
                      <a
                        href="#search"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setOnSearch(!onSearch);
                        }}
                        className="btn btn-icon search-toggle"
                      >
                        <Icon name="search" />
                      </a>
                    </li>

                    <li className="btn-toolbar-sep"></li>

                    {/* SETTINGS */}
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="btn btn-trigger btn-icon">
                          <Icon name="setting" />
                        </DropdownToggle>

                        <DropdownMenu right className="dropdown-menu-xs">
                          <ul className="link-check">
                            <li>
                              <span>Show</span>
                            </li>
                            {[10, 15].map((n) => (
                              <li key={n} className={itemPerPage === n ? "active" : ""}>
                                <DropdownItem
                                  tag="a"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setItemPerPage(n);
                                  }}
                                >
                                  {n}
                                </DropdownItem>
                              </li>
                            ))}
                          </ul>

                          <ul className="link-check">
                            <li>
                              <span>Order</span>
                            </li>

                            <li className={sort === "dsc" ? "active" : ""}>
                              <DropdownItem
                                tag="a"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSortState("dsc");
                                  sortFunc("dsc");
                                }}
                              >
                                DESC
                              </DropdownItem>
                            </li>

                            <li className={sort === "asc" ? "active" : ""}>
                              <DropdownItem
                                tag="a"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSortState("asc");
                                  sortFunc("asc");
                                }}
                              >
                                ASC
                              </DropdownItem>
                            </li>
                          </ul>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                  </ul>
                </div>
              </div>

              {/* SEARCH BAR */}
              <div className={`card-search search-wrap ${onSearch ? "active" : ""}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button
                      className="search-back btn-icon"
                      onClick={() => {
                        setSearchText("");
                        setOnSearch(false);
                      }}
                    >
                      <Icon name="arrow-left" />
                    </Button>

                    <input
                      type="text"
                      className="form-control border-transparent"
                      placeholder="Search staff name or mobile"
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <DataTableBody compact>
              <DataTableHead>
                <DataTableRow>
                  <span className="sub-text fw-bold">S.No</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text fw-bold">Name</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text fw-bold">Mobile</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text fw-bold">Type</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text fw-bold">Status</span>
                </DataTableRow>
              </DataTableHead>

              {currentItems.map((emp, index) => (
                <DataTableItem key={emp._id}>
                  <DataTableRow>{index + 1 + (currentPage - 1) * itemPerPage}</DataTableRow>

                  <DataTableRow>
                    <span
                      className="tb-lead"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedStaff(emp);
                        setSelectedDateDetails(null);
                        setSelectedDay(null);
                      }}
                    >
                      {emp.name}
                    </span>
                  </DataTableRow>
                  <DataTableRow>{emp.mobile}</DataTableRow>

                  <DataTableRow>{capitalizeFirst(emp.type)}</DataTableRow>

                  <DataTableRow>
                    <span
                      style={{
                        color: getStaffStatusColor(emp.staffStatus),
                        fontWeight: 500,
                      }}
                    >
                      {capitalizeFirst(emp.staffStatus)}
                    </span>
                  </DataTableRow>
                </DataTableItem>
              ))}
            </DataTableBody>

            {/* PAGINATION */}
            <div className="card-inner">
              {filteredStaff.length > 0 ? (
                <PaginationComponent
                  itemPerPage={itemPerPage}
                  totalItems={filteredStaff.length}
                  paginate={(pageNumber) => setCurrentPage(pageNumber)}
                  currentPage={currentPage}
                />
              ) : (
                <div className="text-center text-silent">No staff found</div>
              )}
            </div>
          </DataTable>
        </Block>
      )}

      {/* ================= STAFF INNER VIEW ================= */}
      {/* ================= STAFF INNER VIEW ================= */}
      {selectedStaff && (
        <div>
          {/* Top Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              marginTop: "20px",
            }}
          >
            {/* Left side - Back button and Staff Name */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <button
                onClick={() => {
                  setSelectedStaff(null);
                  setSelectedDateDetails(null);
                  setSelectedDay(null);
                }}
                style={{
                  background: "#d9d9d9",
                  border: "none",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                ← Back
              </button>
              <h2
                style={{
                  marginTop: "90px",
                  marginLeft: "-92px",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                {selectedStaff.name}
              </h2>
            </div>

            {/* Right side - Month/Year Select */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              {/* Month Dropdown */}
              <UncontrolledDropdown>
                <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                  <Icon className="d-none d-sm-inline" name="calender-date" />
                  <span>
                    <span className="d-none d-md-inline">{months[month]}</span>
                  </span>
                  <Icon className="dd-indc" name="chevron-right" />
                </DropdownToggle>
                <DropdownMenu>
                  <ul className="link-list-opt no-bdr" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {months.map((m, i) => (
                      <li key={m}>
                        <DropdownItem
                          tag="a"
                          href="#!"
                          onClick={(ev) => {
                            ev.preventDefault();
                            setMonth(i);
                          }}
                        >
                          <span>{m}</span>
                        </DropdownItem>
                      </li>
                    ))}
                  </ul>
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* Year Dropdown */}
              <UncontrolledDropdown>
                <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                  <Icon className="d-none d-sm-inline" name="calender-date" />
                  <span>
                    <span className="d-none d-md-inline">{year}</span>
                  </span>
                  <Icon className="dd-indc" name="chevron-right" />
                </DropdownToggle>
                <DropdownMenu>
                  <ul className="link-list-opt no-bdr">
                    {[2023, 2024, 2025, 2026].map((y) => (
                      <li key={y}>
                        <DropdownItem
                          tag="a"
                          href="#!"
                          onClick={(ev) => {
                            ev.preventDefault();
                            setYear(y);
                          }}
                        >
                          <span>{y}</span>
                        </DropdownItem>
                      </li>
                    ))}
                  </ul>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </div>

          {/* Main Container with Calendar on Left and Summary on Right - EQUAL WIDTH */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "30px",
              alignItems: "stretch",
            }}
          >
            {/* LEFT SIDE - Attendance Summary & Calendar */}
            {/* LEFT SIDE - Attendance Summary & Calendar */}
            <div
              style={{
                flex: "1 1 0", // Equal flex basis
                minWidth: 0, // Prevents overflow
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Attendance Summary Cards */}
              {(() => {
                const summary = calculateAttendanceSummary();
                const sundaysCount = daysInMonth.filter((day) => new Date(year, month, day).getDay() === 0).length;

                return (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "#e8f5e9",
                        padding: "10px", // Increased padding
                        borderRadius: "8px", // Slightly larger radius
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "14px", color: "#2e7d32", marginBottom: "5px" }}>Present</div>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>{summary.present}</div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: "#e3f2fd",
                        padding: "12px",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "14px", color: "#1565c0", marginBottom: "5px" }}>Working</div>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1565c0" }}>{summary.working}</div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: "#fff3e0",
                        padding: "12px",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "14px", color: "#ef6c00", marginBottom: "5px" }}>Absent</div>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ef6c00" }}>
                        {
                          daysInMonth.filter((day) => {
                            const date = new Date(year, month, day);
                            const isSunday = date.getDay() === 0;
                            const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
                            return !isSunday && !record;
                          }).length
                        }
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Legend */}
              <div
                style={{
                  display: "flex",
                  gap: "22px", // Increased gap
                  alignItems: "center",
                  justifyContent: "center", // Center the legend
                  marginBottom: "20px", // Increased margin
                  fontSize: "14px", // Larger font
                  fontWeight: 500,
                  background: "#f8f9fa",
                  padding: "5px 5px", // Increased padding
                  borderRadius: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", backgroundColor: "#5DB996", borderRadius: "4px" }}></div>
                  <span>Present</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", backgroundColor: "#4F46E5", borderRadius: "4px" }}></div>
                  <span>Working</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", backgroundColor: "#FFB74D", borderRadius: "4px" }}></div>
                  <span>Absent</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", backgroundColor: "#f1f1f1", borderRadius: "4px" }}></div>
                  <span>Sunday</span>
                </div>
              </div>

              {/* Calendar - Full width with larger cells */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  flex: 1, // Take remaining space
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "8px", // Increased gap
                    width: "100%", // Full width
                    maxWidth: "100%", // Remove max-width constraint
                  }}
                >
                  {/* Day labels */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      style={{
                        textAlign: "center",
                        fontSize: "12px", // Larger font
                        fontWeight: "600",
                        color: "#666",
                        padding: "8px 2px",
                        background: "#f8f9fa",
                        borderRadius: "6px",
                      }}
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar cells */}
                  {daysInMonth.map((day) => {
                    const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
                    const isSelected = selectedDay === day;
                    const date = new Date(year, month, day);
                    const isSunday = date.getDay() === 0;

                    // Determine background color
                    let bgColor = "#ffffff";
                    if (isSunday) {
                      bgColor = "#f1f1f1";
                    } else if (record?.status === "present") {
                      bgColor = "#5DB996";
                    } else if (record?.status === "working") {
                      bgColor = "#4F46E5";
                    } else {
                      bgColor = "#fff3e0";
                    }

                    return (
                      <div
                        key={day}
                        onClick={() => {
                          if (record || isSunday) {
                            if (isSunday && !record) {
                              setSelectedDateDetails({ status: "sunday", isSunday: true });
                            } else {
                              setSelectedDateDetails(record);
                            }
                            setSelectedDay(day);
                          } else {
                            setSelectedDateDetails({ status: "absent" });
                            setSelectedDay(day);
                          }
                        }}
                        style={{
                          aspectRatio: "3/2", // Make cells square
                          width: "85%",
                          borderRadius: "8px",
                          backgroundColor: bgColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: record || isSunday ? "#fff" : "#000",
                          fontSize: "16px", // Larger font
                          fontWeight: 600,
                          boxShadow: isSelected ? "0 0 0 3px #007bff" : "0 2px 4px rgba(0,0,0,0.1)",
                          transition: "all 0.2s",
                          border: isSelected ? "2px solid #007bff" : "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = isSelected
                            ? "0 0 0 3px #007bff"
                            : "0 2px 4px rgba(0,0,0,0.1)";
                        }}
                        title={
                          isSunday
                            ? "Sunday"
                            : record?.status === "present"
                              ? "Present"
                              : record?.status === "working"
                                ? "Working"
                                : "Absent"
                        }
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Day Wise Report */}
            {/* RIGHT SIDE - Day Wise Report */}
            <div
              style={{
                flex: "1 1 0",
                minWidth: 0,
                background: "#fff",
                padding: "30px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h4
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  borderBottom: "2px solid #f0f0f0",
                  paddingBottom: "12px",
                }}
              >
                Day Details {selectedDay && `- ${selectedDay} ${months[month]} ${year}`}
              </h4>

              <div style={{ flex: 1, display: "flex", alignItems: "flex-start" }}>
                {selectedDay ? (
                  (() => {
                    const record = getSelectedDateRecord();
                    const date = new Date(year, month, selectedDay);
                    const isSunday = date.getDay() === 0;
                    const isAbsent = !record && !isSunday;

                    return (
                      <div
                        style={{
                          fontSize: "16px", // Larger font
                          lineHeight: "2.2", // Increased line height
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            background: "#f8f9fa",
                            padding: "25px", // Increased padding
                            height: "100%",
                            borderRadius: "8px",
                          }}
                        >
                          <p style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center" }}>
                            <strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>
                              Status:
                            </strong>
                            <span
                              style={{
                                padding: "6px 16px", // Larger padding
                                borderRadius: "25px",
                                backgroundColor: isSunday
                                  ? "#f1f1f1"
                                  : isAbsent
                                    ? "#ffebee"
                                    : record?.status === "working"
                                      ? "#e3f2fd"
                                      : "#e8f5e9",
                                color: isSunday
                                  ? "#666"
                                  : isAbsent
                                    ? "#d32f2f"
                                    : record?.status === "working"
                                      ? "#1565c0"
                                      : "#2e7d32",
                                fontWeight: "500",
                                marginLeft: "10px",
                                fontSize: "15px",
                              }}
                            >
                              {isSunday
                                ? "Sunday (Weekly Off)"
                                : isAbsent
                                  ? "Absent"
                                  : record?.status === "working"
                                    ? "Currently Working"
                                    : "Present"}
                            </span>
                          </p>

                          {!isSunday && !isAbsent && record && (
                            <>
                              <p style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center" }}>
                                <strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>
                                  Check In:
                                </strong>
                                <span style={{ marginLeft: "10px", color: "#444", fontSize: "16px" }}>
                                  {formatTimeOnly(record.checkIn)}
                                </span>
                              </p>
                              <p style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center" }}>
                                <strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>
                                  Check Out:
                                </strong>
                                <span style={{ marginLeft: "10px", color: "#444", fontSize: "16px" }}>
                                  {formatTimeOnly(record.checkOut)}
                                </span>
                              </p>
                              <p style={{ margin: "0", display: "flex", alignItems: "center" }}>
                                <strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>
                                  Work Hours:
                                </strong>
                                <span
                                  style={{ marginLeft: "10px", fontWeight: "600", color: "#1565c0", fontSize: "18px" }}
                                >
                                  {calculateHours(record.checkIn, record.checkOut)}
                                </span>
                              </p>
                            </>
                          )}

                          {isAbsent && (
                            <p style={{ margin: "0", color: "#666", textAlign: "center", fontSize: "16px" }}>
                              No attendance record for this date
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: "50px 20px",
                      borderRadius: "8px",
                      textAlign: "center",
                      height: "100%",
                      color: "#666",
                      fontSize: "16px",
                      width: "100%",
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "10px", marginTop: "35px" }}>📆</div>
                    <p style={{ marginTop: "25px", fontWeight: "500", fontSize: "16px" }}>
                      Select any date from the calendar
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#999" }}>
                      Click on a date to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= ADVANCED LIST - Monthly Attendance Report ================= */}
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              padding: "20px",
              marginTop: "20px",
            }}
          >
            {/* Header with title and export options */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "2px solid #f0f0f0",
                paddingBottom: "15px",
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#333" }}>
                  Monthly Attendance Report
                </h4>
                <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#666" }}>
                  {months[month]} {year} • {selectedStaff.name}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={exportToExcel}
                  style={{
                    padding: "8px 16px",
                    background: "#4F46E5",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#fff",
                    fontWeight: "500",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#4338CA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#4F46E5")}
                >
                  <span>📊</span> Export to Excel
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8f9fa",
                      borderBottom: "2px solid #e0e0e0",
                    }}
                  >
                    <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Date</th>
                    <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Day</th>
                    <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>
                      Check In
                    </th>
                    <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>
                      Check Out
                    </th>
                    <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>
                      Work Hours
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {daysInMonth.map((day) => {
                    const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
                    const date = new Date(year, month, day);
                    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                    const isSunday = date.getDay() === 0;

                    // Determine status display
                    let statusDisplay = "-";
                    let statusColor = "#666";
                    let statusBg = "#f5f5f5";

                    if (isSunday) {
                      statusDisplay = "Sunday";
                      statusColor = "#9e9e9e";
                      statusBg = "#f5f5f5";
                    } else if (record?.status === "present") {
                      statusDisplay = "Present";
                      statusColor = "#2e7d32";
                      statusBg = "#e8f5e9";
                    } else if (record?.status === "working") {
                      statusDisplay = "Working";
                      statusColor = "#1565c0";
                      statusBg = "#e3f2fd";
                    } else if (!record) {
                      statusDisplay = "Absent";
                      statusColor = "#d32f2f";
                      statusBg = "#ffebee";
                    }

                    return (
                      <tr
                        key={day}
                        onClick={() => {
                          setSelectedDay(day);
                          if (record || isSunday) {
                            if (isSunday && !record) {
                              setSelectedDateDetails({ status: "sunday", isSunday: true });
                            } else {
                              setSelectedDateDetails(record);
                            }
                          } else {
                            setSelectedDateDetails({ status: "absent" });
                          }
                        }}
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          cursor: "pointer",
                          backgroundColor: selectedDay === day ? "#f0f7ff" : "transparent",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f5f5f5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = selectedDay === day ? "#f0f7ff" : "transparent";
                        }}
                      >
                        <td style={{ padding: "12px 15px", fontWeight: "500" }}>
                          {day} {months[month]} {year}
                        </td>
                        <td style={{ padding: "12px 15px", color: "#666" }}>{dayName}</td>
                        <td style={{ padding: "12px 15px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: statusBg,
                              color: statusColor,
                            }}
                          >
                            {statusDisplay}
                          </span>
                        </td>
                        <td style={{ padding: "12px 15px", color: "#444" }}>
                          {record?.checkIn ? formatTimeOnly(record.checkIn) : "-"}
                        </td>
                        <td style={{ padding: "12px 15px", color: "#444" }}>
                          {record?.checkOut ? formatTimeOnly(record.checkOut) : "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 15px",
                            fontWeight: "600",
                            color: record?.checkIn ? "#1565c0" : "#999",
                          }}
                        >
                          {record?.checkIn ? calculateHours(record.checkIn, record.checkOut) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                background: "#f8f9fa",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
                <div>
                  <span style={{ color: "#666" }}>Total Days: </span>
                  <span style={{ fontWeight: "600", marginLeft: "5px" }}>{daysInMonth.length}</span>
                </div>
                <div>
                  <span style={{ color: "#666" }}>Present: </span>
                  <span style={{ fontWeight: "600", color: "#2e7d32", marginLeft: "5px" }}>
                    {calculateAttendanceSummary().present}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#666" }}>Working: </span>
                  <span style={{ fontWeight: "600", color: "#1565c0", marginLeft: "5px" }}>
                    {calculateAttendanceSummary().working}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#666" }}>Absent: </span>
                  <span style={{ fontWeight: "600", color: "#d32f2f", marginLeft: "5px" }}>
                    {
                      daysInMonth.filter((day) => {
                        const date = new Date(year, month, day);
                        const isSunday = date.getDay() === 0;
                        const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
                        return !isSunday && !record;
                      }).length
                    }
                  </span>
                </div>
                <div>
                  <span style={{ color: "#666" }}>Sundays: </span>
                  <span style={{ fontWeight: "600", color: "#9e9e9e", marginLeft: "5px" }}>
                    {daysInMonth.filter((day) => new Date(year, month, day).getDay() === 0).length}
                  </span>
                </div>
              </div>
              <div style={{ color: "#666", fontSize: "12px" }}>* Sundays are not counted in absent</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;
