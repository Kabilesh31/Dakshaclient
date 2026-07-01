// EmployeeAttendance.js
import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { toast } from "react-toastify";

const EmployeeAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onSearch, setOnSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [itemPerPage, setItemPerPage] = useState(10);
  const [sort, setSortState] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [checkInModal, setCheckInModal] = useState(false);
  const [checkOutModal, setCheckOutModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Check-in states
  const [checkInTime, setCheckInTime] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [sites, setSites] = useState([]);
  
  // Check-out states
  const [checkOutTime, setCheckOutTime] = useState("");
  const [workHours, setWorkHours] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);
  const [dailyWage, setDailyWage] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [attendanceRecord, setAttendanceRecord] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch sites
  useEffect(() => {
    fetchSites();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");
      if (!token || !sessionToken) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}`, "session-token": sessionToken },
      });
      if (res.status === 200) {
        // Check current attendance status for each employee
        const employeesWithStatus = await Promise.all(
          res.data.map(async (emp) => {
            const status = await checkEmployeeStatus(emp._id);
            return { ...emp, currentStatus: status };
          })
        );
        setEmployees(employeesWithStatus);
      }
      setLoading(false);
    } catch (err) {
      console.log("Fetch employees error:", err);
      setLoading(false);
    }
  };

  const checkEmployeeStatus = async (employeeId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/attendance/employee/${employeeId}/today`,
        {
          headers: { Authorization: `Bearer ${token}`, "session-token": sessionToken },
        }
      );
      return res.data.status || "not-checked-in";
    } catch (error) {
      return "not-checked-in";
    }
  };

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/sites`, {
        headers: { Authorization: `Bearer ${token}`, "session-token": sessionToken },
      });
      if (res.status === 200) {
        setSites(res.data);
      }
    } catch (err) {
      console.log("Fetch sites error:", err);
    }
  };

  const capitalizeFirst = (text) => {
    if (!text) return "-";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const sortFunc = (order) => {
    const sorted = [...employees].sort((a, b) => 
      order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setEmployees(sorted);
  };

  // Handle Check-in
  const handleCheckIn = async () => {
    if (!selectedSite) {
      toast.error("Please select a site");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");
      
      const attendanceData = {
        employeeId: selectedEmployee._id,
        site: selectedSite,
        checkInTime: checkInTime || new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        status: "checked-in"
      };

      const res = await axios.post(
        `${process.env.REACT_APP_BACKENDURL}/api/attendance/checkin`,
        attendanceData,
        {
          headers: { Authorization: `Bearer ${token}`, "session-token": sessionToken },
        }
      );

      if (res.status === 201) {
        toast.success(`${selectedEmployee.name} checked in successfully!`);
        setCheckInModal(false);
        setSelectedEmployee(null);
        setSelectedSite("");
        setCheckInTime("");
        fetchEmployees(); // Refresh the list
      }
    } catch (err) {
      console.log("Check-in error:", err);
      toast.error(err.response?.data?.message || "Check-in failed");
    }
  };

  // Handle Check-out
  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      const checkOutData = {
        employeeId: selectedEmployee._id,
        checkOutTime: checkOutTime || new Date().toISOString(),
        workHours: workHours,
        overtimeHours: isOvertime ? overtimeHours : 0,
        overtimeRate: isOvertime ? overtimeRate : 0,
        dailyWage: dailyWage,
        totalSalary: totalSalary,
        date: new Date().toISOString().split('T')[0]
      };

      const res = await axios.post(
        `${process.env.REACT_APP_BACKENDURL}/api/attendance/checkout`,
        checkOutData,
        {
          headers: { Authorization: `Bearer ${token}`, "session-token": sessionToken },
        }
      );

      if (res.status === 200) {
        toast.success(`${selectedEmployee.name} checked out successfully!`);
        setCheckOutModal(false);
        setSelectedEmployee(null);
        setWorkHours(0);
        setOvertimeHours(0);
        setOvertimeRate(0);
        setIsOvertime(false);
        setDailyWage(0);
        setTotalSalary(0);
        setCheckOutTime("");
        fetchEmployees(); // Refresh the list
      }
    } catch (err) {
      console.log("Check-out error:", err);
      toast.error(err.response?.data?.message || "Check-out failed");
    }
  };

  // Open Check-in Modal
  const openCheckInModal = (employee) => {
    setSelectedEmployee(employee);
    setCheckInTime(new Date().toLocaleTimeString());
    // Set default site if employee has one
    if (employee.site) {
      setSelectedSite(employee.site);
    }
    setCheckInModal(true);
  };

  // Open Check-out Modal
  const openCheckOutModal = async (employee) => {
    setSelectedEmployee(employee);
    setDailyWage(employee.salary || 0);
    
    // Fetch today's attendance record
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");
      const res = await axios.get(
        `${process.env.REACT_APP_BACKENDURL}/api/attendance/employee/${employee._id}/today`,
        {
          headers: { Authorization: `Bearer ${token}`, "session-token": sessionToken },
        }
      );
      
      if (res.data && res.data.checkIn) {
        const checkInTime = new Date(res.data.checkIn);
        const now = new Date();
        const diffMs = now - checkInTime;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // Calculate regular hours (max 8) and overtime
        const regularHours = Math.min(diffHours, 8);
        const overtime = Math.max(0, diffHours - 8);
        
        setWorkHours(Math.round(regularHours * 100) / 100);
        setOvertimeHours(Math.round(overtime * 100) / 100);
        setOvertimeRate((employee.salary || 0) / 8 * 1.5); // 1.5x for overtime
        
        // Calculate total salary
        const regularSalary = regularHours * (employee.salary || 0) / 8;
        const overtimeSalary = overtime * ((employee.salary || 0) / 8 * 1.5);
        setTotalSalary(regularSalary + overtimeSalary);
        
        setAttendanceRecord(res.data);
      }
    } catch (error) {
      console.log("Error fetching attendance:", error);
    }
    
    setCheckOutTime(new Date().toLocaleTimeString());
    setCheckOutModal(true);
  };

  // Calculate salary when overtime changes
  useEffect(() => {
    if (selectedEmployee) {
      const baseRate = (selectedEmployee.salary || 0) / 8;
      const regularHours = Math.min(workHours, 8);
      const regularSalary = regularHours * baseRate;
      const overtimeSalary = isOvertime ? overtimeHours * overtimeRate : 0;
      setTotalSalary(regularSalary + overtimeSalary);
    }
  }, [workHours, overtimeHours, overtimeRate, isOvertime, selectedEmployee]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'checked-in':
        return <span className="badge bg-success" style={{ padding: "5px 10px", color: "white", borderRadius: "14px" }}>Checked In</span>;
      case 'checked-out':
        return <span className="badge bg-secondary" style={{ padding: "5px 10px", color: "white", borderRadius: "14px" }}>Checked Out</span>;
      default:
        return <span className="badge bg-warning" style={{ padding: "5px 10px", color: "white", borderRadius: "14px" }}>Not Checked In</span>;
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchText.toLowerCase()) || 
    emp.phone?.includes(searchText) ||
    emp.employeeId?.toLowerCase().includes(searchText.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ padding: "20px" }}>
      <Block>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                <h3 style={{ marginTop: "55px" }}>Employee Attendance Management</h3>
              </BlockTitle>
              <p className="text-soft">Manage daily attendance for {employees.length} employees.</p>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <DataTable className="card-stretch">
          <div className="card-inner position-relative card-tools-toggle">
            <div className="card-title-group">
              <div className="card-tools"></div>
              <div className="card-tools mr-n1">
                <ul className="btn-toolbar gx-1">
                  <li>
                    <a 
                      href="#search" 
                      onClick={(ev) => { ev.preventDefault(); setOnSearch(!onSearch); }} 
                      className="btn btn-icon search-toggle"
                    >
                      <Icon name="search" />
                    </a>
                  </li>
                  <li className="btn-toolbar-sep"></li>
                  <li>
                    <UncontrolledDropdown>
                      <DropdownToggle tag="a" className="btn btn-trigger btn-icon">
                        <Icon name="setting" />
                      </DropdownToggle>
                      <DropdownMenu right className="dropdown-menu-xs">
                        <ul className="link-check">
                          <li><span>Show</span></li>
                          {[10, 15, 20, 50].map(n => (
                            <li key={n} className={itemPerPage === n ? "active" : ""}>
                              <DropdownItem tag="a" href="#" onClick={(e) => { e.preventDefault(); setItemPerPage(n); }}>
                                {n}
                              </DropdownItem>
                            </li>
                          ))}
                        </ul>
                        <ul className="link-check">
                          <li><span>Order</span></li>
                          <li className={sort === "dsc" ? "active" : ""}>
                            <DropdownItem tag="a" href="#" onClick={(e) => { e.preventDefault(); setSortState("dsc"); sortFunc("dsc"); }}>
                              DESC
                            </DropdownItem>
                          </li>
                          <li className={sort === "asc" ? "active" : ""}>
                            <DropdownItem tag="a" href="#" onClick={(e) => { e.preventDefault(); setSortState("asc"); sortFunc("asc"); }}>
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
            <div className={`card-search search-wrap ${onSearch ? "active" : ""}`}>
              <div className="card-body">
                <div className="search-content">
                  <Button className="search-back btn-icon" onClick={() => { setSearchText(""); setOnSearch(false); }}>
                    <Icon name="arrow-left" />
                  </Button>
                  <input 
                    type="text" 
                    className="form-control border-transparent" 
                    placeholder="Search by name, employee ID, or phone" 
                    value={searchText} 
                    onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <DataTableBody compact>
            <DataTableHead>
              <DataTableRow><span className="sub-text fw-bold">#</span></DataTableRow>
              <DataTableRow><span className="sub-text fw-bold">Employee ID</span></DataTableRow>
              <DataTableRow><span className="sub-text fw-bold">Name</span></DataTableRow>
              <DataTableRow><span className="sub-text fw-bold">Role</span></DataTableRow>
              <DataTableRow><span className="sub-text fw-bold">Site</span></DataTableRow>
              <DataTableRow><span className="sub-text fw-bold">Daily Wage</span></DataTableRow>
              <DataTableRow><span className="sub-text fw-bold">Status</span></DataTableRow>
              <DataTableRow><span className="sub-text fw-bold">Action</span></DataTableRow>
            </DataTableHead>
            
            {currentItems.map((emp, index) => (
              <DataTableItem key={emp._id}>
                <DataTableRow>{index + 1 + (currentPage - 1) * itemPerPage}</DataTableRow>
                <DataTableRow>{emp.employeeId || "-"}</DataTableRow>
                <DataTableRow>
                  <span className="tb-lead" style={{ fontWeight: "500" }}>{emp.name}</span>
                </DataTableRow>
                <DataTableRow>{capitalizeFirst(emp.role)}</DataTableRow>
                <DataTableRow>{emp.siteName || "-"}</DataTableRow>
                <DataTableRow>₹{emp.salary || 0}</DataTableRow>
                <DataTableRow>{getStatusBadge(emp.currentStatus)}</DataTableRow>
                <DataTableRow>
                  {emp.currentStatus === 'checked-in' ? (
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => openCheckOutModal(emp)}
                      style={{ padding: "5px 15px", borderRadius: "20px" }}
                    >
                      Check Out
                    </button>
                  ) : emp.currentStatus === 'checked-out' ? (
                    <button 
                      className="btn btn-sm btn-secondary"
                      disabled
                      style={{ padding: "5px 15px", borderRadius: "20px", opacity: 0.6 }}
                    >
                      Completed
                    </button>
                  ) : (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => openCheckInModal(emp)}
                      style={{ padding: "5px 15px", borderRadius: "20px" }}
                    >
                      Check In
                    </button>
                  )}
                </DataTableRow>
              </DataTableItem>
            ))}
          </DataTableBody>

          <div className="card-inner">
            {filteredEmployees.length > 0 ? (
              <PaginationComponent 
                itemPerPage={itemPerPage} 
                totalItems={filteredEmployees.length} 
                paginate={(pageNumber) => setCurrentPage(pageNumber)} 
                currentPage={currentPage} 
              />
            ) : (
              <div className="text-center text-silent">No employees found</div>
            )}
          </div>
        </DataTable>
      </Block>

      {/* Check-in Modal */}
      <Modal isOpen={checkInModal} toggle={() => setCheckInModal(false)} size="md">
        <ModalHeader toggle={() => setCheckInModal(false)}>
          Check In - {selectedEmployee?.name}
        </ModalHeader>
        <ModalBody>
          <div style={{ padding: "10px 0" }}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}>
                <Icon name="clock" style={{ marginRight: "8px" }} />
                Check In Time
              </label>
              <input 
                type="time" 
                className="form-control" 
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}>
                <Icon name="location" style={{ marginRight: "8px" }} />
                Select Site
              </label>
              <select 
                className="form-control"
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
              >
                <option value="">Select a site</option>
                {sites.map(site => (
                  <option key={site._id} value={site._id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                <strong>Employee:</strong> {selectedEmployee?.name} ({selectedEmployee?.employeeId})
              </p>
              <p style={{ margin: "5px 0 0", fontSize: "14px", color: "#666" }}>
                <strong>Role:</strong> {capitalizeFirst(selectedEmployee?.role)}
              </p>
              <p style={{ margin: "5px 0 0", fontSize: "14px", color: "#666" }}>
                <strong>Daily Wage:</strong> ₹{selectedEmployee?.salary || 0}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setCheckInModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleCheckIn}>
            <Icon name="check" style={{ marginRight: "5px" }} />
            Confirm Check In
          </Button>
        </ModalFooter>
      </Modal>

      {/* Check-out Modal */}
      <Modal isOpen={checkOutModal} toggle={() => setCheckOutModal(false)} size="lg">
        <ModalHeader toggle={() => setCheckOutModal(false)}>
          Check Out - {selectedEmployee?.name}
        </ModalHeader>
        <ModalBody>
          <div style={{ padding: "10px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div className="form-group">
                <label style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}>
                  <Icon name="clock" style={{ marginRight: "8px" }} />
                  Check Out Time
                </label>
                <input 
                  type="time" 
                  className="form-control" 
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}>
                  <Icon name="clock" style={{ marginRight: "8px" }} />
                  Work Hours
                </label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={workHours}
                  onChange={(e) => setWorkHours(parseFloat(e.target.value) || 0)}
                  step="0.5"
                  min="0"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
              </div>
            </div>

            <div style={{ 
              background: "#f0f7ff", 
              padding: "15px", 
              borderRadius: "8px", 
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "15px"
            }}>
              <label style={{ fontWeight: "500", display: "flex", alignItems: "center", margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={isOvertime}
                  onChange={(e) => {
                    setIsOvertime(e.target.checked);
                    if (!e.target.checked) {
                      setOvertimeHours(0);
                    }
                  }}
                  style={{ marginRight: "8px", transform: "scale(1.2)" }}
                />
                <Icon name="clock" style={{ marginRight: "8px" }} />
                Overtime Work
              </label>
              <span style={{ fontSize: "13px", color: "#666" }}>(Optional)</span>
            </div>

            {isOvertime && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div className="form-group">
                  <label style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}>
                    Overtime Hours
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    min="0"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}>
                    Overtime Rate (per hour)
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={overtimeRate}
                    onChange={(e) => setOvertimeRate(parseFloat(e.target.value) || 0)}
                    step="10"
                    min="0"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                  />
                </div>
              </div>
            )}

            {/* Salary Summary */}
            <div style={{ 
              background: "#f8f9fa", 
              padding: "20px", 
              borderRadius: "8px",
              border: "2px solid #e0e0e0"
            }}>
              <h5 style={{ margin: "0 0 15px 0", fontWeight: "600", color: "#333" }}>
                <Icon name="money" style={{ marginRight: "8px" }} />
                Salary Summary
              </h5>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <div>
                  <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#666" }}>Daily Wage</p>
                  <p style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#333" }}>
                    ₹{selectedEmployee?.salary || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#666" }}>Work Hours</p>
                  <p style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#333" }}>
                    {workHours.toFixed(1)} hrs
                    {isOvertime && overtimeHours > 0 && (
                      <span style={{ fontSize: "14px", color: "#c62828", marginLeft: "8px" }}>
                        (+{overtimeHours.toFixed(1)} hrs OT)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#666" }}>Total Salary</p>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#00838f" }}>
                    ₹{totalSalary.toFixed(2)}
                  </p>
                </div>
              </div>
              {isOvertime && overtimeHours > 0 && (
                <div style={{ 
                  marginTop: "10px", 
                  padding: "10px", 
                  background: "#fff3e0", 
                  borderRadius: "6px",
                  fontSize: "13px",
                  color: "#ef6c00"
                }}>
                  <Icon name="info" style={{ marginRight: "5px" }} />
                  Overtime calculation: {overtimeHours.toFixed(1)} hrs × ₹{overtimeRate.toFixed(2)}/hr = ₹{(overtimeHours * overtimeRate).toFixed(2)}
                </div>
              )}
            </div>

            <div style={{ 
              marginTop: "20px",
              padding: "15px", 
              background: "#e8f5e9", 
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <p style={{ margin: 0, fontSize: "13px", color: "#2e7d32" }}>
                  <Icon name="check-circle" style={{ marginRight: "5px" }} />
                  Confirm checkout to save attendance record
                </p>
              </div>
              <div>
                <span style={{ fontWeight: "600", fontSize: "14px", color: "#2e7d32" }}>
                  Total: ₹{totalSalary.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setCheckOutModal(false)}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onClick={handleCheckOut}
            disabled={workHours <= 0}
          >
            <Icon name="check" style={{ marginRight: "5px" }} />
            Confirm Check Out
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EmployeeAttendance;