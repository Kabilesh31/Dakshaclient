import React, { useState, useEffect } from "react";
import axios from "axios";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

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
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = Array.from(
    { length: getDaysInMonth(month, year) },
    (_, i) => i + 1
  );
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

    const res = await axios.get(
      `${process.env.REACT_APP_BACKENDURL}/api/staff`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      }
    );

    if (res.status === 200) {
      setStaffs(res.data);
    }

    setLoading(false);

  } catch (err) {

    console.log("Fetch staff error:", err);

    if (err.response) {

      if (err.response.status === 401) {

        console.log(
          err.response.data?.message || "Session expired. Please login again"
        );

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
  (emp) =>
    emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.mobile?.includes(searchText)
);

// Pagination Logic
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredStaff.slice(
    indexOfFirstItem,
    indexOfLastItem
  );


  // ================= FETCH ATTENDANCE =================
  const fetchAttendance = async () => {
    try {

      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/attendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "session-token": sessionToken,
          },
        }
      );

      const structured = {};

      res.data.forEach((record) => {

        const dateObj = new Date(record.date);
        const y = dateObj.getFullYear();
        const m = months[dateObj.getMonth()];
        const d = dateObj.getDate();

        const staffId =
          typeof record.staffId === "object"
            ? record.staffId._id
            : record.staffId;

        if (!structured[y]) structured[y] = {};
        if (!structured[y][m]) structured[y][m] = {};
        if (!structured[y][m][staffId]) structured[y][m][staffId] = {};

        structured[y][m][staffId][d] = {
          status:
            record.currentStatus === "checked-in"
              ? "working"
              : "present",
          checkIn: record.startTime || null,
          checkOut: record.endTime || null,
          hours: record.totalHours
            ? record.totalHours.toFixed(2)
            : 0,
        };

      });

      setAttendance(structured);

    } catch (err) {

      console.log("Fetch attendance error:", err);

      if (err.response) {

        if (err.response.status === 401) {

          console.log(
            err.response.data?.message || "Session expired. Please login again"
          );

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

  // For calendar attendance colors
const getStatusColor = (status) => {
  if (status === "present") return "#5DB996";  // green
  if (status === "working") return "#4F46E5";  // blue
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
    total: daysInMonth.length
  };
};

// Get selected date record
const getSelectedDateRecord = () => {
  if (!selectedStaff || !selectedDay) return null;
  return attendance[year]?.[months[month]]?.[selectedStaff._id]?.[selectedDay];
};

  return (
    <div style={{ padding: "30px" }}>

      {/* ================= STAFF LIST VIEW (DashLite UI) ================= */}
{!selectedStaff && (
  <Block>
    <BlockHead size="sm">
      <BlockBetween>
        <BlockHeadContent>
          <BlockTitle tag="h3" page>
            <h3 style={{ marginTop: "45px" }}>Staff Attendance</h3>
          </BlockTitle>
          <p className="text-soft">
            You have total {staffs.length} Staffs.
          </p>
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
                  <DropdownToggle
                    tag="a"
                    className="btn btn-trigger btn-icon"
                  >
                    <Icon name="setting" />
                  </DropdownToggle>

                  <DropdownMenu right className="dropdown-menu-xs">
                    <ul className="link-check">
                      <li>
                        <span>Show</span>
                      </li>
                      {[10, 15].map((n) => (
                        <li
                          key={n}
                          className={itemPerPage === n ? "active" : ""}
                        >
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
        <div
          className={`card-search search-wrap ${
            onSearch ? "active" : ""
          }`}
        >
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

            <DataTableRow>
  {capitalizeFirst(emp.type)}
</DataTableRow>

            
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
          <div className="text-center text-silent">
            No staff found
          </div>
        )}
      </div>
    </DataTable>
  </Block>
)}


      {/* ================= STAFF INNER VIEW ================= */}
      {selectedStaff && (
        <div>
          {/* Top Header - No Container */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            marginTop: "20px"
          }}>
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
                  gap: "5px"
                }}
              >
                ← Back
              </button>
              <h2 style={{ 
                marginTop: "90px",
                marginLeft:"-92px",
                fontSize: "24px",
                fontWeight: "600",
                color: "#333"
              }}>
                {selectedStaff.name}
              </h2>
            </div>

            {/* Right side - Month/Year Select */}
            {/* Right side - Month/Year Select with DashLite UI */}
<div style={{ 
  display: "flex", 
  gap: "10px",
  alignItems: "center"
}}>
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

          {/* Main Container with Left and Right Sections */}
          <div style={{ 
            display: "flex", 
            gap: "20px"
          }}>
            {/* LEFT SIDE - Attendance Summary & Calendar */}
            <div
              style={{
                flex: 1,
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              {/* Attendance Summary Cards */}
              {(() => {
                const summary = calculateAttendanceSummary();
                return (
                  <div style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "25px"
                  }}>
                    <div style={{
                      flex: 1,
                      background: "#e8f5e9",
                      padding: "15px",
                      borderRadius: "8px",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "14px", color: "#2e7d32", marginBottom: "5px" }}>Present Days</div>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>{summary.present}</div>
                    </div>
                    <div style={{
                      flex: 1,
                      background: "#fff3e0",
                      padding: "15px",
                      borderRadius: "8px",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "14px", color: "#ef6c00", marginBottom: "5px" }}>Leave Days</div>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ef6c00" }}>
                        {summary.total - (summary.present + summary.working)}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Legend */}
              <div style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                marginBottom: "20px",
                fontSize: "14px",
                fontWeight: 500,
                background: "#f8f9fa",
                padding: "12px 15px",
                borderRadius: "8px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", backgroundColor: "#5DB996", borderRadius: "4px" }}></div>
                  <span>Present</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", backgroundColor: "#4F46E5", borderRadius: "4px" }}></div>
                  <span>Checked In</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", backgroundColor: "#ffffff", border: "1px solid #ddd", borderRadius: "4px" }}></div>
                  <span>Not Present</span>
                </div>
              </div>

              {/* Calendar */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "7px",
              }}>
                {daysInMonth.map((day) => {
                  const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
                  const isSelected = selectedDay === day;
                  
                  return (
                    <div
                      key={day}
                      onClick={() => {
                        if (record) {
                          setSelectedDateDetails(record);
                          setSelectedDay(day);
                        } else {
                          setSelectedDateDetails(null);
                          setSelectedDay(day);
                        }
                      }}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "8px",
                        backgroundColor: getStatusColor(record?.status),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: record ? "#fff" : "#000",
                        fontWeight: 600,
                        boxShadow: isSelected ? "0 0 0 3px whiteSmoke" : (record ? "0 2px 4px rgba(0,0,0,0.1)" : "none"),
                        transition: "all 0.2s",
                        border: isSelected ? "1px solid gray" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (record) e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE - Day Wise Report */}
            <div
              style={{
                flex: 1,
                background: "#fff",
                padding: "25px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                height: "fit-content",
              }}
            >
              <h3 style={{
                margin: "0 0 20px 0",
                fontSize: "20px",
                fontWeight: "600",
                color: "#333",
                borderBottom: "2px solid #f0f0f0",
                paddingBottom: "15px"
              }}>
                Day Report {selectedDay && `- ${selectedDay} ${months[month]} ${year}`}
              </h3>

              {selectedDay ? (
                (() => {
                  const record = getSelectedDateRecord();
                  
                  if (!record) {
                    return (
                      <div style={{
                        background: "#d9d9d9",
                        padding: "30px 20px",
                        borderRadius: "8px",
                        textAlign: "center",
                        color: "#black",
                        fontSize: "16px",
                      }}>
                        <div style={{ fontSize: "24px", marginBottom: "10px" }}>📅</div>
                        <p style={{ margin: 0, fontWeight: "500" }}>
                          No attendance data available for {selectedDay} {months[month]} {year}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div style={{
                      fontSize: "16px",
                      lineHeight: "2.2",
                    }}>
                      <div style={{
                        background: "#f8f9fa",
                        padding: "20px",
                        borderRadius: "8px",
                      }}>
                        <p style={{ margin: "0 0 15px 0" }}>
                          <strong style={{ display: "inline-block", width: "100px" }}>Status:</strong> 
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            backgroundColor: record.status === "working" ? "#e3f2fd" : "#e8f5e9",
                            color: record.status === "working" ? "#1565c0" : "#2e7d32",
                            fontWeight: "500",
                            marginLeft: "10px"
                          }}>
                            {record.status === "working" ? "Currently Working" : "Present"}
                          </span>
                        </p>
                        <p style={{ margin: "0 0 15px 0" }}>
                          <strong style={{ display: "inline-block", width: "100px" }}>Check In:</strong> 
                          <span style={{ marginLeft: "10px" }}>{formatDateTime(record.checkIn)}</span>
                        </p>
                        <p style={{ margin: "0 0 15px 0" }}>
                          <strong style={{ display: "inline-block", width: "100px" }}>Check Out:</strong> 
                          <span style={{ marginLeft: "10px" }}>{formatDateTime(record.checkOut)}</span>
                        </p>
                        <p style={{ margin: "0" }}>
                          <strong style={{ display: "inline-block", width: "100px" }}>Total Hours:</strong> 
                          <span style={{ marginLeft: "10px", fontWeight: "600", color: "#1565c0" }}>
                            {calculateHours(record.checkIn, record.checkOut)}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{
                  background: "#f8f9fa",
                  padding: "40px 20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#666",
                  fontSize: "16px",
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>📆</div>
                  <p style={{ margin: 0 }}>
                    Select any date from calendar to view check-in/out details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;