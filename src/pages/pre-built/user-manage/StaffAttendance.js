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

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  // ================= FETCH STAFF =================
  const fetchStaff = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/staff`
      );
      setStaffs(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
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

  const [inHour, inMin] = checkIn.split(":").map(Number);
  const [outHour, outMin] = checkOut.split(":").map(Number);

  const start = new Date(0, 0, 0, inHour, inMin);
  const end = new Date(0, 0, 0, outHour, outMin);

  const diffMs = end - start;

  if (diffMs <= 0) return "-";

  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);

  return `${diffHrs}h ${diffMins}m`;
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
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/attendance`
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
        if (!structured[y][m][staffId])
          structured[y][m][staffId] = {};

        structured[y][m][staffId][d] = {
          status:
            record.currentStatus === "checked-in"
              ? "working"
              : "present",

          checkIn: record.startTime
            ? new Date(record.startTime).toLocaleTimeString()
            : null,

          checkOut: record.endTime
            ? new Date(record.endTime).toLocaleTimeString()
            : null,

          hours: record.totalHours
            ? record.totalHours.toFixed(2)
            : 0,
        };
      });

      setAttendance(structured);

    } catch (err) {
      console.log(err);
    }
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
                }}
              >
                {emp.name}
              </span>
            </DataTableRow>
            <DataTableRow>{emp.mobile}</DataTableRow>

            <DataTableRow>{emp.type || "-"}</DataTableRow>

            
             <DataTableRow>
  <span style={{ color: getStaffStatusColor(emp.staffStatus), fontWeight: 500 }}>
    {emp.staffStatus || "-"}
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
        <div style={{ display: "flex", gap: "20px" }}>

          {/* LEFT SIDE */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "48px",
            }}
          >
            <button
              onClick={() => {
                setSelectedStaff(null);
                setSelectedDateDetails(null);
              }}
              style={{
                marginBottom: "15px",
                background: "#eee",
                border: "none",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>

            <h3 style={{ marginBottom: "15px" ,marginTop: "8px"}}>
              {selectedStaff.name}
            </h3>

            {/* Month / Year Select */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
  <select
    value={month}
    onChange={(e) => setMonth(Number(e.target.value))}
    style={{
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      backgroundColor: "#fff",
      cursor: "pointer",
      fontSize: "14px",
    }}
  >
    {months.map((m, i) => (
      <option key={m} value={i}>
        {m}
      </option>
    ))}
  </select>

  <select
    value={year}
    onChange={(e) => setYear(Number(e.target.value))}
    style={{
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      backgroundColor: "#fff",
      cursor: "pointer",
      fontSize: "14px",
    }}
  >
    {[2023, 2024, 2025, 2026].map((y) => (
      <option key={y} value={y}>
        {y}
      </option>
    ))}
  </select>
</div>

{/* ===== Attendance Legend ===== */}
<div
  style={{
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginTop: "30px",
    marginBottom: "15px",
    fontSize: "14px",
    fontWeight: 500,
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div
      style={{
        width: "16px",
        height: "16px",
        backgroundColor: "#5DB996",
        borderRadius: "4px",
      }}
    ></div>
    <span>Present</span>
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div
      style={{
        width: "16px",
        height: "16px",
        backgroundColor: "#4F46E5",
        borderRadius: "4px",
      }}
    ></div>
    <span>Checked In</span>
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div
      style={{
        width: "16px",
        height: "16px",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "4px",
      }}
    ></div>
    <span>Not Present</span>
  </div>
</div>

            {/* Calendar */}
            <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)", // 7 days per row
    gap: "7px",
    marginTop: "70px",
  }}
>
              {daysInMonth.map((day) => {
                const record =
                  attendance[year]?.[months[month]]?.[
                    selectedStaff._id
                  ]?.[day];

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (record) setSelectedDateDetails(record);
                    }}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      backgroundColor: getStatusColor(
                        record?.status
                      ),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: record ? "pointer" : "default",
                      color: record ? "#fff" : "#000",
                      fontWeight: 600,
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "48px",
            }}
          >
            <h4 style={{
              
             
              marginTop: "48px",
            }} >Attendance Details</h4>

            {selectedDateDetails ? (
  <div
    style={{
      marginTop: "50px",
      fontSize: "16px",   // 🔥 Increase font size
      lineHeight: "1.8",  // Better spacing between lines
    }}
  >
    <p>
      <strong>Status:</strong>{" "}
      {selectedDateDetails.status === "working"
        ? "Currently Working"
        : "Present"}
    </p>

    <p>
      <strong>Check In:</strong>{" "}
      {selectedDateDetails.checkIn || "-"}
    </p>

    <p>
      <strong>Check Out:</strong>{" "}
      {selectedDateDetails.checkOut || "-"}
    </p>

    <p>
     <strong>Total Hours:</strong>{" "}
{calculateHours(
  selectedDateDetails.checkIn,
  selectedDateDetails.checkOut
)}

    </p>
  </div>
) : (
  <p
    style={{
      marginTop: "20px",
      fontSize: "16px",
    }}
  >
    Select any highlighted date
  </p>
)}

          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
};

const tdStyle = {
  padding: "10px",
};

export default StaffAttendance;
