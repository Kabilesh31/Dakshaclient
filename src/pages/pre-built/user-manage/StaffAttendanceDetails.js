import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Row,
  Col,
  Button,
  Icon,
  BlockBetween,
} from "../../../components/Component";
import { Spinner } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { RSelect } from "../../../components/Component";

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api`;
const BRAND = "#4B5694";

const StaffAttendanceDetails = () => {
  const { id } = useParams();
  const history = useHistory();
  
  const [employee, setEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({
    totalDays: 0,
    totalSalary: 0,
    totalOvertime: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [];
  const currentYearNow = new Date().getFullYear();
  for (let y = currentYearNow; y >= currentYearNow - 5; y--) {
    years.push(y);
  }

  // Options for RSelect
  const monthOptions = [
    { value: "", label: "All Months" },
    ...months.map((month, index) => ({
      value: String(index + 1).padStart(2, '0'),
      label: month
    }))
  ];

  const yearOptions = [
    { value: "", label: "All Years" },
    ...years.map(year => ({
      value: year.toString(),
      label: year.toString()
    }))
  ];

  useEffect(() => {
    fetchAttendanceDetails();
  }, [id]);

  const fetchAttendanceDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      const employeeResponse = await axios.get(`${API_URL}/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (employeeResponse.data.success) {
        setEmployee(employeeResponse.data.data);
      }
      
      try {
        const response = await axios.get(
          `${API_URL}/attendance/employee/${id}/all`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          const records = response.data.data || [];
          setAllRecords(records);
          applyFilters(records);
        }
      } catch (err) {
        console.log("Trying fallback to /range endpoint");
        
        const defaultStartDate = '2024-01-01';
        const defaultEndDate = new Date().toISOString().split('T')[0];
        
        const rangeResponse = await axios.get(
          `${API_URL}/attendance/range`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { 
              startDate: defaultStartDate, 
              endDate: defaultEndDate
            }
          }
        );
        
        if (rangeResponse.data.success) {
          let allRecords = rangeResponse.data.data || [];
          const records = allRecords.filter(record => {
            const empId = record.employeeId?._id || record.employeeId;
            return empId === id;
          });
          setAllRecords(records);
          applyFilters(records);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance details:", error);
      toast.error("Failed to load attendance details");
      setAttendanceRecords([]);
      setAllRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (records = allRecords) => {
    let filtered = [...records];
    
    // Filter by month
    if (selectedMonth?.value) {
      filtered = filtered.filter(record => {
        const date = new Date(record.date);
        return (date.getMonth() + 1).toString().padStart(2, '0') === selectedMonth.value;
      });
    }
    
    // Filter by year
    if (selectedYear?.value) {
      filtered = filtered.filter(record => {
        const date = new Date(record.date);
        return date.getFullYear().toString() === selectedYear.value;
      });
    }
    
    // Filter by selected dates
    if (selectedDates.length > 0) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return selectedDates.includes(recordDate);
      });
    }
    
    setAttendanceRecords(filtered);
    calculateSummary(filtered);
  };

  const calculateSummary = (records) => {
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const lateDays = records.filter(r => r.status === 'late').length;
    const totalSalary = records.reduce((sum, r) => sum + (r.totalSalary || 0), 0);
    const totalOvertime = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

    setSummary({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      totalSalary,
      totalOvertime,
    });
  };

  const handleApplyFilter = () => {
    applyFilters(allRecords);
    setShowCalendar(false);
  };

  const clearFilter = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    setSelectedDates([]);
    setAttendanceRecords(allRecords);
    calculateSummary(allRecords);
  };

  // Calendar functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  const isDateSelected = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return selectedDates.includes(dateStr);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const changeMonth = (increment) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: "8px" }}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = isDateSelected(date);
      const isTodayDate = isToday(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          style={{
            padding: "8px",
            textAlign: "center",
            cursor: "pointer",
            borderRadius: "4px",
            backgroundColor: isSelected ? BRAND : isTodayDate ? "#f0f0f0" : "transparent",
            color: isSelected ? "#fff" : isTodayDate ? BRAND : "#333",
            fontWeight: isSelected ? "bold" : isTodayDate ? "bold" : "normal",
            border: isTodayDate && !isSelected ? "2px solid " + BRAND : "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.target.style.backgroundColor = "#f0f0f0";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.target.style.backgroundColor = isTodayDate ? "#f0f0f0" : "transparent";
            }
          }}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const date = new Date(timeStr);
    return date.toLocaleTimeString("en-IN", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  // Status as text with colors (no badges)
  const getStatusText = (status) => {
    const statusMap = {
      present: { text: "Present", color: "#10b981" },
      late: { text: "Late", color: "#f59e0b" },
      absent: { text: "Absent", color: "#ef4444" },
    };

    const defaultStatus = { text: "N/A", color: "#6b7280" };
    return statusMap[status] || defaultStatus;
  };

  const goBack = () => {
    history.goBack();
  };

  // Custom styles for RSelect to match Suppliers page
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '38px',
      borderColor: '#e8e4e0',
      '&:hover': {
        borderColor: '#e8e4e0',
      },
      boxShadow: 'none',
      cursor: 'pointer',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#f0f0f0' : 'transparent',
      color: '#333',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#f0f0f0',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 999,
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6c757d',
    }),
  };

  if (loading) {
    return (
      <Content>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px" }}>
          <Spinner style={{ color: BRAND, width: "36px", height: "36px" }} />
          <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>Loading attendance details...</p>
        </div>
      </Content>
    );
  }

  return (
    <React.Fragment>
      <Head title="Staff Attendance Details | Attendance" />
      <Content>
        {/* White Container */}
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #eee",
        }}>
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Employee Header */}
          {employee && (
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "24px",
              border: "1px solid #eee",
            }}>
              <Row>
                <Col lg="8">
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: BRAND,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "24px",
                    }}>
                      {employee.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700 }}>{employee.name}</h4>
                      <p style={{ margin: "4px 0 0", color: "#666" }}>
                        {employee.role || "N/A"} • {employee.site || "Not Assigned"}
                      </p>
                      <p style={{ margin: "2px 0 0", color: "#888", fontSize: "13px" }}>
                        Phone: {employee.phone || "N/A"} • Daily Wage: ₹{employee.salary || 0}
                      </p>
                    </div>
                  </div>
                </Col>
                <Col lg="4" className="text-lg-end mt-3 mt-lg-0">
                  <div style={{ fontSize: "13px", color: "#888" }}>
                    <div>Total Attendance Records</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: BRAND }}>
                      {attendanceRecords.length}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {/* Summary Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}>
            <div style={{ background: "#f8ffff", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #eee" }}>
              <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Total Days</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: BRAND }}>{summary.totalDays}</div>
            </div>
            <div style={{ background: "#eaf3de", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #c8e6c9" }}>
              <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Present</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#2e7d32" }}>{summary.presentDays}</div>
            </div>
            <div style={{ background: "#fcebeb", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #ffcdd2" }}>
              <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Absent</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#c62828" }}>{summary.absentDays}</div>
            </div>
            <div style={{ background: "#fff3e0", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #ffe0b2" }}>
              <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Late</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#e65100" }}>{summary.lateDays}</div>
            </div>
            <div style={{ background: "#e3f2fd", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #bbdefb" }}>
              <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Total Salary</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#0d47a1" }}>₹{summary.totalSalary}</div>
            </div>
            <div style={{ background: "#f3e5f5", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #e1bee7" }}>
              <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Overtime Hours</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#6a1b9a" }}>{summary.totalOvertime}h</div>
            </div>
          </div>

          {/* Filter - Using RSelect like Suppliers page */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "16px",
            padding: "12px 16px",
            background: "#f8f9fa",
            borderRadius: "10px",
            border: "1px solid #eee",
          }}>
            <span style={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>Filter:</span>
            
            {/* Date Picker with Calendar */}
            <div style={{ position: "relative", minWidth: "180px" }}>
              <div
                onClick={() => setShowCalendar(!showCalendar)}
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  border: "1px solid #e8e4e0",
                  borderRadius: "6px",
                  minWidth: "180px",
                  cursor: "pointer",
                  background: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  minHeight: "38px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#fff"}
              >
                <span style={{ color: selectedDates.length > 0 ? "#333" : "#6c757d" }}>
                  {selectedDates.length > 0 
                    ? `${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} selected` 
                    : "Select Dates"}
                </span>
                <span style={{ marginLeft: "8px", color: "#6c757d" }}>▼</span>
              </div>

              {showCalendar && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "4px",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  width: "280px",
                }}>
                  {/* Calendar Header */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}>
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => changeMonth(-1)}
                      style={{ borderRadius: "4px", padding: "2px 8px" }}
                    >
                      ◀
                    </Button>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>
                      {months[currentMonth]} {currentYear}
                    </span>
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => changeMonth(1)}
                      style={{ borderRadius: "4px", padding: "2px 8px" }}
                    >
                      ▶
                    </Button>
                  </div>

                  {/* Day Names */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    marginBottom: "8px",
                  }}>
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                      <div key={day} style={{
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#888",
                        padding: "4px",
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "2px",
                  }}>
                    {renderCalendar()}
                  </div>

                  {/* Calendar Footer */}
                  <div style={{
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #eee",
                    paddingTop: "8px",
                  }}>
                    <span style={{ fontSize: "11px", color: "#888" }}>
                      {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                    </span>
                    <Button
                      size="sm"
                      color="danger"
                      outline
                      onClick={() => setSelectedDates([])}
                      style={{ borderRadius: "4px", fontSize: "11px" }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Month Filter - RSelect */}
            <div style={{ minWidth: "150px" }}>
              <RSelect
                options={monthOptions}
                value={selectedMonth}
                onChange={(opt) => setSelectedMonth(opt)}
                placeholder="All Months"
                isClearable={false}
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>

            {/* Year Filter - RSelect */}
            <div style={{ minWidth: "120px" }}>
              <RSelect
                options={yearOptions}
                value={selectedYear}
                onChange={(opt) => setSelectedYear(opt)}
                placeholder="All Years"
                isClearable={false}
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>

            {/* Clear Filters Link */}
            {(selectedMonth?.value || selectedYear?.value || selectedDates.length > 0) && (
              <Button 
                color="link" 
                onClick={clearFilter}
                style={{ color: BRAND, textDecoration: 'none', padding: '4px 8px' }}
              >
                Clear Filters
              </Button>
            )}

            <Button size="sm" color="primary" onClick={handleApplyFilter} style={{ borderRadius: "8px", backgroundColor: BRAND, borderColor: BRAND }}>
              <Icon name="filter" size={12} /> Apply
            </Button>
          </div>

          {/* Attendance Table */}
          {attendanceRecords.length > 0 ? (
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #eee",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>#</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Site</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Check In</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Check Out</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Daily Salary</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Overtime</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</th>
                      <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record, idx) => {
                      const status = getStatusText(record.status);
                      return (
                        <tr key={record._id || idx} style={{ borderBottom: idx < attendanceRecords.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          <td style={{ padding: "12px 16px", color: "#555", textAlign: "center" }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#555" }}>
                            {formatDate(record.date)}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#555" }}>
                            {record.siteName || record.site?.name || "N/A"}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: "#555" }}>
                            {formatTime(record.checkInTime)}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: "#555" }}>
                            {formatTime(record.checkOutTime)}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: "#555" }}>
                            ₹{record.dailySalary || 0}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: "#e65100" }}>
                            {record.overtimeHours || 0}h
                            {record.overtimeAmount > 0 && (
                              <div style={{ fontSize: "11px", color: "#888" }}>₹{record.overtimeAmount}</div>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: BRAND }}>
                            ₹{record.totalSalary || 0}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <span
                              style={{
                                color: status.color,
                                fontWeight: 600,
                                fontSize: "13px"
                              }}
                            >
                              {status.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", background: "#fafafa", borderRadius: "10px", border: "1px dashed #ddd" }}>
              <Icon name="inbox" style={{ fontSize: "48px", color: "#ddd" }} />
              <p style={{ color: "#aaa", marginTop: "10px" }}>No attendance records found for this employee.</p>
            </div>
          )}
        </div>
      </Content>
    </React.Fragment>
  );
};

export default StaffAttendanceDetails;