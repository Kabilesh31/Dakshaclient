import React, { useState, useEffect } from "react";
import axios from "axios";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import * as XLSX from "xlsx";

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

  const [monthlySites, setMonthlySites] = useState([]);
  const [monthlyOvertime, setMonthlyOvertime] = useState(0);
  const [dailySiteMap, setDailySiteMap] = useState({});
  const [dailyOvertimeMap, setDailyOvertimeMap] = useState({});
  
  // NEW: state for staff daily wage (dummy)
  const [staffDailyWage, setStaffDailyWage] = useState(0);
  const [monthlyTotalSalary, setMonthlyTotalSalary] = useState(0);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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

  // Helper to get daily wage based on staff type
  const getDailyWage = (staff) => {
    if (!staff) return 500;
    const type = staff.type?.toLowerCase();
    if (type === "supervisor") return 800;
    if (type === "worker") return 500;
    if (type === "manager") return 1000;
    if (type === "engineer") return 700;
    return 500; // default
  };

  // Calculate daily salary for a given day
  const getDailySalary = (day, staff) => {
    if (!staff) return 0;
    const date = new Date(year, month, day);
    const isSunday = date.getDay() === 0;
    if (isSunday) return 0;
    const record = attendance[year]?.[months[month]]?.[staff._id]?.[day];
    const isPresent = record && (record.status === "present" || record.status === "working");
    if (!isPresent) return 0;
    return getDailyWage(staff);
  };

  // Recalculate total salary when attendance, month, year, or staff changes
  useEffect(() => {
    if (selectedStaff) {
      const total = daysInMonth.reduce((sum, day) => sum + getDailySalary(day, selectedStaff), 0);
      setMonthlyTotalSalary(total);
      setStaffDailyWage(getDailyWage(selectedStaff));
    }
  }, [attendance, month, year, selectedStaff, daysInMonth]);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [month, year, selectedStaff]);

  useEffect(() => {
    if (selectedStaff) {
      generateDummySiteAndOvertimeData();
    }
  }, [selectedStaff, month, year, attendance]);

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
        setLoading(false);
        return;
      }
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/staff`, {
        headers: { Authorization: `Bearer ${token}`, "session-token": sessionToken },
      });
      if (res.status === 200) setStaffs(res.data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch staff error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");
        window.location.href = "/login";
      }
      setLoading(false);
    }
  };

  // ================= FETCH ATTENDANCE + DUMMY FALLBACK =================
  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");
      if (!token || !sessionToken) return;

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/attendance`, {
        headers: { Authorization: `Bearer ${token}`, "session-token": sessionToken },
      });

      let structured = {};
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

      if (selectedStaff) {
        const staffId = selectedStaff._id;
        const currentMonth = months[month];
        const currentYear = year;
        if (!structured[currentYear]?.[currentMonth]?.[staffId]) {
          const dummyAttendance = generateDummyAttendanceForStaff(selectedStaff, year, month);
          if (!structured[currentYear]) structured[currentYear] = {};
          if (!structured[currentYear][currentMonth]) structured[currentYear][currentMonth] = {};
          structured[currentYear][currentMonth][staffId] = dummyAttendance;
        }
      }
      setAttendance(structured);
    } catch (err) {
      console.log("Fetch attendance error:", err);
      if (selectedStaff) {
        const dummyAttendance = generateDummyAttendanceForStaff(selectedStaff, year, month);
        const structured = { [year]: { [months[month]]: { [selectedStaff._id]: dummyAttendance } } };
        setAttendance(structured);
      }
    }
  };

  const generateDummyAttendanceForStaff = (staff, year, month) => {
    const days = getDaysInMonth(month, year);
    const dummy = {};
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (dayOfWeek === 'Sunday') continue;
      const isPresent = Math.random() < 0.8;
      if (!isPresent) continue;
      const checkInHour = 9 + Math.floor(Math.random() * 3);
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkIn = new Date(year, month, day, checkInHour, checkInMinute);
      const checkOutHour = 17 + Math.floor(Math.random() * 4);
      const checkOutMinute = Math.floor(Math.random() * 60);
      let checkOut = new Date(year, month, day, checkOutHour, checkOutMinute);
      if (checkOut <= checkIn) checkOut = new Date(checkIn.getTime() + 8 * 60 * 60 * 1000);
      const diffMs = checkOut - checkIn;
      const totalHours = diffMs / (1000 * 60 * 60);
      const status = Math.random() > 0.7 ? "working" : "present";
      dummy[day] = {
        status,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        hours: totalHours.toFixed(2),
      };
    }
    return dummy;
  };

  const generateDummySiteAndOvertimeData = () => {
    const dummySiteNames = [
      "Downtown Office Complex", "Riverside Residential Tower", "Greenfield Industrial Park",
      "Harbor View Mall", "Sunset Hills Villa Project", "Tech Hub Innovation Center",
      "Metro Transit Station", "Central Hospital Extension", "City School Campus", "Sports Arena"
    ];
    const numSites = Math.floor(Math.random() * 5) + 2;
    const shuffled = [...dummySiteNames].sort(() => 0.5 - Math.random());
    const assignedSites = shuffled.slice(0, numSites);
    setMonthlySites(assignedSites);

    const siteMap = {};
    const overtimeMap = {};
    daysInMonth.forEach((day) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const record = attendance[year]?.[months[month]]?.[selectedStaff?._id]?.[day];
      const date = new Date(year, month, day);
      const isSunday = date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday';
      const isPresent = record && (record.status === "present" || record.status === "working");
      if (!isSunday && isPresent) {
        const numSitesForDay = Math.floor(Math.random() * 2) + 1;
        const daySites = [];
        for (let i = 0; i < numSitesForDay && i < assignedSites.length; i++) {
          const randomSite = assignedSites[Math.floor(Math.random() * assignedSites.length)];
          if (!daySites.includes(randomSite)) daySites.push(randomSite);
        }
        siteMap[dateStr] = daySites;
        if (record && record.hours) {
          const totalHours = parseFloat(record.hours);
          const overtime = Math.max(0, totalHours - 8);
          overtimeMap[dateStr] = overtime;
        } else {
          overtimeMap[dateStr] = Math.random() * 3;
        }
      } else {
        siteMap[dateStr] = [];
        overtimeMap[dateStr] = 0;
      }
    });
    setDailySiteMap(siteMap);
    setDailyOvertimeMap(overtimeMap);
    const totalOvertime = Object.values(overtimeMap).reduce((sum, val) => sum + val, 0);
    setMonthlyOvertime(totalOvertime);
  };

  // Helper functions
  const sortFunc = (order) => {
    const sorted = [...staffs].sort((a, b) => order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    setStaffs(sorted);
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";
    const diffMs = new Date(checkOut) - new Date(checkIn);
    if (diffMs <= 0) return "-";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimeOnly = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const getStaffStatusColor = (status) => {
    if (status?.toLowerCase() === "active") return "#32CD32";
    if (status?.toLowerCase() === "inactive") return "red";
    return "gray";
  };

  const calculateAttendanceSummary = () => {
    if (!selectedStaff) return { present: 0, working: 0 };
    let present = 0, working = 0;
    daysInMonth.forEach((day) => {
      const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
      if (record?.status === "present") present++;
      if (record?.status === "working") working++;
    });
    return { present, working };
  };

  const getSelectedDateRecord = () => {
    if (!selectedStaff || !selectedDay) return null;
    return attendance[year]?.[months[month]]?.[selectedStaff._id]?.[selectedDay];
  };

  const getSelectedDateSites = () => {
    if (!selectedDay) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    return dailySiteMap[dateStr] || [];
  };

  const getSelectedDateOvertime = () => {
    if (!selectedDay) return 0;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    return dailyOvertimeMap[dateStr] || 0;
  };

  const exportToExcel = () => {
    if (!selectedStaff) return;
    const exportData = daysInMonth.map((day) => {
      const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
      const date = new Date(year, month, day);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const isSunday = date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday';
      let status = "-";
      if (isSunday) status = "Sunday (Off)";
      else if (record?.status === "present") status = "Present";
      else if (record?.status === "working") status = "Working";
      else if (!record) status = "Absent";
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const overtime = dailyOvertimeMap[dateStr] || 0;
      const sites = (dailySiteMap[dateStr] || []).join(", ");
      const dailySalary = getDailySalary(day, selectedStaff);
      return {
        Date: `${day} ${months[month]} ${year}`,
        Day: dayName,
        Status: status,
        "Check In": record?.checkIn ? formatTimeOnly(record.checkIn) : "-",
        "Check Out": record?.checkOut ? formatTimeOnly(record.checkOut) : "-",
        "Work Hours": record?.checkIn ? calculateHours(record.checkIn, record.checkOut) : "-",
        Overtime: overtime.toFixed(2),
        Sites: sites || "-",
        "Salary (₹)": dailySalary,
        Remarks: isSunday ? "Weekly Off" : record ? "" : "No attendance record",
      };
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `${selectedStaff.name}_${months[month]}_${year}_Attendance.xlsx`);
  };

  const filteredStaff = staffs.filter(emp => emp.name.toLowerCase().includes(searchText.toLowerCase()) || emp.mobile?.includes(searchText));
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  return (
    <div style={{ padding: "20px" }}>
      {!selectedStaff && (
        <Block>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle tag="h3" page><h3 style={{ marginTop: "55px" }}>Staff Attendance</h3></BlockTitle>
                <p className="text-soft">You have total {staffs.length} Staffs.</p>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>
          <DataTable className="card-stretch">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <div className="card-tools"></div>
                <div className="card-tools mr-n1">
                  <ul className="btn-toolbar gx-1">
                    <li><a href="#search" onClick={(ev) => { ev.preventDefault(); setOnSearch(!onSearch); }} className="btn btn-icon search-toggle"><Icon name="search" /></a></li>
                    <li className="btn-toolbar-sep"></li>
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="btn btn-trigger btn-icon"><Icon name="setting" /></DropdownToggle>
                        <DropdownMenu right className="dropdown-menu-xs">
                          <ul className="link-check"><li><span>Show</span></li>{[10, 15].map(n => (<li key={n} className={itemPerPage === n ? "active" : ""}><DropdownItem tag="a" href="#" onClick={(e) => { e.preventDefault(); setItemPerPage(n); }}>{n}</DropdownItem></li>))}</ul>
                          <ul className="link-check"><li><span>Order</span></li><li className={sort === "dsc" ? "active" : ""}><DropdownItem tag="a" href="#" onClick={(e) => { e.preventDefault(); setSortState("dsc"); sortFunc("dsc"); }}>DESC</DropdownItem></li><li className={sort === "asc" ? "active" : ""}><DropdownItem tag="a" href="#" onClick={(e) => { e.preventDefault(); setSortState("asc"); sortFunc("asc"); }}>ASC</DropdownItem></li></ul>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={`card-search search-wrap ${onSearch ? "active" : ""}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button className="search-back btn-icon" onClick={() => { setSearchText(""); setOnSearch(false); }}><Icon name="arrow-left" /></Button>
                    <input type="text" className="form-control border-transparent" placeholder="Search staff name or mobile" value={searchText} onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }} />
                  </div>
                </div>
              </div>
            </div>
            <DataTableBody compact>
              <DataTableHead><DataTableRow><span className="sub-text fw-bold">S.No</span></DataTableRow><DataTableRow><span className="sub-text fw-bold">Name</span></DataTableRow><DataTableRow><span className="sub-text fw-bold">Mobile</span></DataTableRow><DataTableRow><span className="sub-text fw-bold">Type</span></DataTableRow><DataTableRow><span className="sub-text fw-bold">Status</span></DataTableRow></DataTableHead>
              {currentItems.map((emp, index) => (
                <DataTableItem key={emp._id}>
                  <DataTableRow>{index + 1 + (currentPage - 1) * itemPerPage}</DataTableRow>
                  <DataTableRow><span className="tb-lead" style={{ cursor: "pointer" }} onClick={() => { setSelectedStaff(emp); setSelectedDateDetails(null); setSelectedDay(null); }}>{emp.name}</span></DataTableRow>
                  <DataTableRow>{emp.mobile}</DataTableRow>
                  <DataTableRow>{capitalizeFirst(emp.type)}</DataTableRow>
                  <DataTableRow><span style={{ color: getStaffStatusColor(emp.staffStatus), fontWeight: 500 }}>{capitalizeFirst(emp.staffStatus)}</span></DataTableRow>
                </DataTableItem>
              ))}
            </DataTableBody>
            <div className="card-inner">
              {filteredStaff.length > 0 ? <PaginationComponent itemPerPage={itemPerPage} totalItems={filteredStaff.length} paginate={(pageNumber) => setCurrentPage(pageNumber)} currentPage={currentPage} /> : <div className="text-center text-silent">No staff found</div>}
            </div>
          </DataTable>
        </Block>
      )}

      {selectedStaff && (
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", marginTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <button onClick={() => { setSelectedStaff(null); setSelectedDateDetails(null); setSelectedDay(null); }} style={{ background: "#d9d9d9", border: "none", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px" }}>← Back</button>
              <h2 style={{ marginTop: "90px", marginLeft: "-92px", fontSize: "24px", fontWeight: "600", color: "#333" }}>{selectedStaff.name}</h2>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <UncontrolledDropdown>
                <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light"><Icon className="d-none d-sm-inline" name="calender-date" /><span><span className="d-none d-md-inline">{months[month]}</span></span><Icon className="dd-indc" name="chevron-right" /></DropdownToggle>
                <DropdownMenu><ul className="link-list-opt no-bdr" style={{ maxHeight: "300px", overflowY: "auto" }}>{months.map((m, i) => (<li key={m}><DropdownItem tag="a" href="#!" onClick={(ev) => { ev.preventDefault(); setMonth(i); }}><span>{m}</span></DropdownItem></li>))}</ul></DropdownMenu>
              </UncontrolledDropdown>
              <UncontrolledDropdown>
                <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light"><Icon className="d-none d-sm-inline" name="calender-date" /><span><span className="d-none d-md-inline">{year}</span></span><Icon className="dd-indc" name="chevron-right" /></DropdownToggle>
                <DropdownMenu><ul className="link-list-opt no-bdr">{[2023,2024,2025,2026].map(y => (<li key={y}><DropdownItem tag="a" href="#!" onClick={(ev) => { ev.preventDefault(); setYear(y); }}><span>{y}</span></DropdownItem></li>))}</ul></DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </div>

          {/* Main two-column layout */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px", alignItems: "stretch" }}>
            {/* LEFT: Calendar + summary cards */}
            <div style={{ flex: "1 1 0", minWidth: 0, background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, background: "#e8f5e9", padding: "10px", borderRadius: "8px", textAlign: "center" }}><div style={{ fontSize: "14px", color: "#2e7d32", marginBottom: "5px" }}>Present</div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>{calculateAttendanceSummary().present}</div></div>
                <div style={{ flex: 1, background: "#fff3e0", padding: "12px", borderRadius: "8px", textAlign: "center" }}><div style={{ fontSize: "14px", color: "#ef6c00", marginBottom: "5px" }}>Absent</div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#ef6c00" }}>{daysInMonth.filter(day => { const date = new Date(year, month, day); const isSunday = date.getDay() === 0; const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day]; return !isSunday && !record; }).length}</div></div>
                <div style={{ flex: 1, background: "#f3e5f5", padding: "10px", borderRadius: "8px", textAlign: "center" }}><div style={{ fontSize: "14px", color: "#6a1b9a", marginBottom: "5px" }}>Sites Worked (Month)</div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#6a1b9a" }}>{monthlySites.length}</div></div>
                <div style={{ flex: 1, background: "#ffebee", padding: "10px", borderRadius: "8px", textAlign: "center" }}><div style={{ fontSize: "14px", color: "#c62828", marginBottom: "5px" }}>Total Overtime (Month)</div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#c62828" }}>{monthlyOvertime.toFixed(2)} hrs</div></div>
                {/* <div style={{ flex: 1, background: "#e0f7fa", padding: "10px", borderRadius: "8px", textAlign: "center" }}><div style={{ fontSize: "14px", color: "#00838f", marginBottom: "5px" }}>Total Salary (Month)</div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#00838f" }}>₹{monthlyTotalSalary.toLocaleString()}</div></div> */}
              </div>
              <div style={{ display: "flex", gap: "22px", alignItems: "center", justifyContent: "center", marginBottom: "20px", fontSize: "14px", fontWeight: 500, background: "#f8f9fa", padding: "5px 5px", borderRadius: "8px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", backgroundColor: "#81c784", borderRadius: "4px" }}></div><span>Present</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", backgroundColor: "#ffe0b2", borderRadius: "4px" }}></div><span>Absent</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", backgroundColor: "#ffffff", borderRadius: "4px", border: "1px solid #ccc" }}></div><span>Sunday (Week Off)</span></div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", width: "100%", flex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", width: "100%" }}>
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
                    <div key={day} style={{
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#666",
                      padding: "8px 2px",
                      background: "#f8f9fa",
                      borderRadius: "6px"
                    }}>
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={"empty-" + i}></div>
                  ))}
                  {daysInMonth.map((day) => {
                    const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
                    const isSelected = selectedDay === day;
                    const date = new Date(year, month, day);
                    const isSunday = date.getDay() === 0;
                    let bgColor;
                    if (isSunday) {
                      bgColor = "#ffffff";
                    } else if (record && (record.status === "present" || record.status === "working")) {
                      bgColor = "#81c784";
                    } else {
                      bgColor = "#ffe0b2";
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
                          aspectRatio: "3/2",
                          borderRadius: "8px",
                          backgroundColor: bgColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontWeight: 600,
                          boxShadow: isSelected
                            ? "0 0 0 3px #007bff"
                            : "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Day details */}
            <div style={{ flex: "1 1 0", minWidth: 0, background: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
              <h4 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600", color: "#333", borderBottom: "2px solid #f0f0f0", paddingBottom: "12px" }}>Day Details {selectedDay && `- ${selectedDay} ${months[month]} ${year}`}</h4>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-start" }}>
                {selectedDay ? (() => {
                  const record = getSelectedDateRecord();
                  const date = new Date(year, month, selectedDay);
                  const isSunday = date.getDay() === 0;
                  const isAbsent = !record && !isSunday;
                  const sites = getSelectedDateSites();
                  const overtime = getSelectedDateOvertime();
                  const dailySalary = getDailySalary(selectedDay, selectedStaff);
                  return (
                    <div style={{ fontSize: "16px", lineHeight: "2.2", width: "100%", height: "100%" }}>
                      <div style={{ background: "#f8f9fa", padding: "25px", height: "100%", borderRadius: "8px" }}>
                        <p style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center" }}><strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>Status:</strong><span style={{ padding: "6px 16px", borderRadius: "25px", backgroundColor: isSunday ? "#f1f1f1" : isAbsent ? "#ffebee" : record?.status === "working" ? "#e3f2fd" : "#e8f5e9", color: isSunday ? "#666" : isAbsent ? "#d32f2f" : record?.status === "working" ? "#1565c0" : "#2e7d32", fontWeight: "500", marginLeft: "10px", fontSize: "15px" }}>{isSunday ? "Sunday (Weekly Off)" : isAbsent ? "Absent" : record?.status === "working" ? "Working" : "Present"}</span></p>
                        {!isSunday && !isAbsent && record && (<>
                          <p style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center" }}><strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>Check In:</strong><span style={{ marginLeft: "10px", color: "#444", fontSize: "16px" }}>{formatTimeOnly(record.checkIn)}</span></p>
                          <p style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center" }}><strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>Check Out:</strong><span style={{ marginLeft: "10px", color: "#444", fontSize: "16px" }}>{formatTimeOnly(record.checkOut)}</span></p>
                          <p style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center" }}><strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>Work Hours:</strong><span style={{ marginLeft: "10px", fontWeight: "600", color: "#1565c0", fontSize: "18px" }}>{calculateHours(record.checkIn, record.checkOut)}</span></p>
                          <p style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center" }}><strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>Overtime:</strong><span style={{ marginLeft: "10px", fontWeight: "600", color: "#c62828", fontSize: "18px" }}>{overtime.toFixed(2)} hrs</span></p>
                          <p style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center" }}><strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>Salary:</strong><span style={{ marginLeft: "10px", fontWeight: "600", color: "#00838f", fontSize: "18px" }}>₹{dailySalary}</span></p>
                          {sites.length > 0 && <p style={{ margin: "0", display: "flex", alignItems: "flex-start" }}><strong style={{ display: "inline-block", width: "100px", fontSize: "16px" }}>Site(s):</strong><span style={{ marginLeft: "10px", color: "#444", fontSize: "16px", flex: 1 }}>{sites.join(", ")}</span></p>}
                        </>)}
                        {isAbsent && <p style={{ margin: "0", color: "#666", textAlign: "center", fontSize: "16px" }}>No attendance record for this date</p>}
                        {isSunday && !record && <p style={{ margin: "0", color: "#666", textAlign: "center", fontSize: "16px" }}>Weekly Off - No work required</p>}
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ background: "#f8f9fa", padding: "50px 20px", borderRadius: "8px", textAlign: "center", height: "100%", color: "#666", fontSize: "16px", width: "100%" }}><div style={{ fontSize: "32px", marginBottom: "10px", marginTop: "35px" }}>📆</div><p style={{ marginTop: "25px", fontWeight: "500", fontSize: "16px" }}>Select any date from the calendar</p><p style={{ margin: "8px 0 0", fontSize: "14px", color: "#999" }}>Click on a date to view details</p></div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Attendance Table with Salary Column */}
          <div style={{ background: "#fff", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", padding: "20px", marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #f0f0f0", paddingBottom: "15px" }}>
              <div><h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#333" }}>Monthly Attendance Report</h4><p style={{ margin: "5px 0 0", fontSize: "13px", color: "#666" }}>{months[month]} {year} • {selectedStaff.name} • Daily Wage: ₹{staffDailyWage}</p></div>
              <div><button onClick={exportToExcel} style={{ padding: "8px 16px", background: "#4F46E5", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#fff", fontWeight: "500" }}><span>📊</span> Export to Excel</button></div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead><tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Date</th>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Day</th>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Status</th>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Check In</th>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Check Out</th>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Work Hours</th>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Overtime</th>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Site(s)</th>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600", color: "#444" }}>Salary (₹)</th>
                </tr></thead>
                <tbody>
                  {daysInMonth.map((day) => {
                    const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day];
                    const date = new Date(year, month, day);
                    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                    const isSunday = date.getDay() === 0;
                    let statusDisplay = "-", statusColor = "#666", statusBg = "#f5f5f5";
                    if (isSunday) { statusDisplay = "Sunday"; statusColor = "#9e9e9e"; statusBg = "#f5f5f5"; }
                    else if (record?.status === "present") { statusDisplay = "Present"; statusColor = "#2e7d32"; statusBg = "#e8f5e9"; }
                    else if (record?.status === "working") { statusDisplay = "Working"; statusColor = "#1565c0"; statusBg = "#e3f2fd"; }
                    else if (!record) { statusDisplay = "Absent"; statusColor = "#d32f2f"; statusBg = "#ffebee"; }
                    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const sitesForDay = dailySiteMap[dateStr] || [];
                    const overtimeForDay = dailyOvertimeMap[dateStr] || 0;
                    const dailySalary = getDailySalary(day, selectedStaff);
                    return (
                      <tr key={day} onClick={() => { setSelectedDay(day); if (record || isSunday) { if (isSunday && !record) setSelectedDateDetails({ status: "sunday", isSunday: true }); else setSelectedDateDetails(record); } else { setSelectedDateDetails({ status: "absent" }); } }} style={{ borderBottom: "1px solid #f0f0f0", cursor: "pointer", backgroundColor: selectedDay === day ? "#f0f7ff" : "transparent", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedDay === day ? "#f0f7ff" : "transparent"}>
                        <td style={{ padding: "12px 15px", fontWeight: "500" }}>{day} {months[month]} {year}</td>
                        <td style={{ padding: "12px 15px", color: "#666" }}>{dayName}</td>
                        <td style={{ padding: "12px 15px" }}><span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", backgroundColor: statusBg, color: statusColor }}>{statusDisplay}</span></td>
                        <td style={{ padding: "12px 15px", color: "#444" }}>{record?.checkIn ? formatTimeOnly(record.checkIn) : "-"}</td>
                        <td style={{ padding: "12px 15px", color: "#444" }}>{record?.checkOut ? formatTimeOnly(record.checkOut) : "-"}</td>
                        <td style={{ padding: "12px 15px", fontWeight: "600", color: record?.checkIn ? "#1565c0" : "#999" }}>{record?.checkIn ? calculateHours(record.checkIn, record.checkOut) : "-"}</td>
                        <td style={{ padding: "12px 15px", fontWeight: "600", color: overtimeForDay > 0 ? "#c62828" : "#999" }}>{overtimeForDay > 0 ? overtimeForDay.toFixed(2) + " hrs" : "-"}</td>
                        <td style={{ padding: "12px 15px", color: "#444", fontSize: "13px" }}>{sitesForDay.length ? sitesForDay.join(", ") : "-"}</td>
                        <td style={{ padding: "12px 15px", fontWeight: "600", color: dailySalary > 0 ? "#00838f" : "#999" }}>₹{dailySalary}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: "20px", padding: "15px", background: "#f8f9fa", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", flexWrap: "wrap", gap: "15px" }}>
              <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
                <div><span style={{ color: "#666" }}>Total Days: </span><span style={{ fontWeight: "600" }}>{daysInMonth.length}</span></div>
                <div><span style={{ color: "#666" }}>Present: </span><span style={{ fontWeight: "600", color: "#2e7d32" }}>{calculateAttendanceSummary().present + calculateAttendanceSummary().working}</span></div>
                <div><span style={{ color: "#666" }}>Absent: </span><span style={{ fontWeight: "600", color: "#d32f2f" }}>{daysInMonth.filter(day => { const date = new Date(year, month, day); const isSunday = date.getDay() === 0; const record = attendance[year]?.[months[month]]?.[selectedStaff._id]?.[day]; return !isSunday && !record; }).length}</span></div>
                <div><span style={{ color: "#666" }}>Sundays: </span><span style={{ fontWeight: "600", color: "#9e9e9e" }}>{daysInMonth.filter(day => new Date(year, month, day).getDay() === 0).length}</span></div>
                <div><span style={{ color: "#666" }}>Total Overtime: </span><span style={{ fontWeight: "600", color: "#c62828" }}>{monthlyOvertime.toFixed(2)} hrs</span></div>
                <div><span style={{ color: "#666" }}>Total Salary: </span><span style={{ fontWeight: "600", color: "#00838f" }}>₹{monthlyTotalSalary.toLocaleString()}</span></div>
              </div>
              <div style={{ color: "#666", fontSize: "12px" }}>* Overtime = Work Hours - 8 (standard workday)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;