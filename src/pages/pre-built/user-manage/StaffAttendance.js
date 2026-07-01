import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
  Label,
  Spinner,
} from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  PaginationComponent,
} from "../../../components/Component";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api`;

const StaffAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSortState] = useState("asc");
  const [attendanceData, setAttendanceData] = useState({});

  // Modal states
  const [checkInModal, setCheckInModal] = useState(false);
  const [checkOutModal, setCheckOutModal] = useState(false);
  const [selectedEmployeeForAction, setSelectedEmployeeForAction] = useState(null);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedSiteName, setSelectedSiteName] = useState("");
  const [sites, setSites] = useState([]);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  // Checkout form states
  const [dailySalary, setDailySalary] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(0);
  const [overtimeAmount, setOvertimeAmount] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [notes, setNotes] = useState("");
  const [todayAttendance, setTodayAttendance] = useState(null);

  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchEmployees();
    fetchSites();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(emp =>
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.phone?.includes(searchText) ||
      emp.role?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchText, employees]);

  useEffect(() => {
    if (selectedEmployeeForAction) {
      const todayAtt = attendanceData[selectedEmployeeForAction.id]?.[currentDate];
      if (todayAtt) {
        setTodayAttendance(todayAtt);
        setDailySalary(todayAtt.dailySalary || selectedEmployeeForAction.salary || 0);
      } else {
        setTodayAttendance(null);
        setDailySalary(selectedEmployeeForAction.salary || 0);
      }
    }
  }, [selectedEmployeeForAction, attendanceData, currentDate]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setEmployees(response.data.data);
        setFilteredEmployees(response.data.data);
        // Fetch attendance for each employee
        response.data.data.forEach(emp => {
          fetchEmployeeAttendance(emp.id);
        });
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSites(response.data.data);
        console.log("Sites fetched:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const fetchEmployeeAttendance = async (employeeId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/attendance/employee/${employeeId}/date/${currentDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data) {
        setAttendanceData(prev => ({
          ...prev,
          [employeeId]: {
            ...prev[employeeId],
            [currentDate]: response.data.data
          }
        }));
      }
    } catch (error) {
      // No attendance record found - this is normal
      console.log(`No attendance for employee ${employeeId} on ${currentDate}`);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedEmployeeForAction) return;
    if (!selectedSite) {
      toast.warning("Please select a site");
      return;
    }
console.log(`${API_URL}/attendance/checkin`);
    setCheckInLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const createdBy = localStorage.getItem("userId") || "admin";
      
      // Prepare the data
      const checkInData = {
        employeeId: selectedEmployeeForAction.id,
        date: currentDate,
        site: selectedSite,
        siteName: selectedSiteName,
        createdBy: createdBy,
      };

      // Log the complete data being sent
      console.log("=== SENDING CHECK-IN DATA ===");
      console.log("Employee ID:", selectedEmployeeForAction.id);
      console.log("Date:", currentDate);
      console.log("Site ID:", selectedSite);
      console.log("Site Name:", selectedSiteName);
      console.log("Created By:", createdBy);
      console.log("Full Payload:", JSON.stringify(checkInData, null, 2));
      console.log("==============================");

      const response = await axios.post(`${API_URL}/attendance/checkin`, checkInData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Check-In Response:", response.data);

      if (response.data.success) {
        toast.success(`${selectedEmployeeForAction.name} checked in successfully!`);
        setAttendanceData(prev => ({
          ...prev,
          [selectedEmployeeForAction.id]: {
            ...prev[selectedEmployeeForAction.id],
            [currentDate]: response.data.data
          }
        }));
        setCheckInModal(false);
        setSelectedSite("");
        setSelectedSiteName("");
        setSelectedEmployeeForAction(null);
      }
    } catch (error) {
      console.error("Check-in error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to check in");
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedEmployeeForAction) return;

    setCheckOutLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      const checkOutData = {
        employeeId: selectedEmployeeForAction.id,
        date: currentDate,
        dailySalary: dailySalary,
        overtimeHours: overtimeHours,
        overtimeRate: overtimeRate,
        notes: notes,
        createdBy: localStorage.getItem("userId") || "admin",
      };

      console.log("=== SENDING CHECK-OUT DATA ===");
      console.log("Employee ID:", selectedEmployeeForAction.id);
      console.log("Date:", currentDate);
      console.log("Daily Salary:", dailySalary);
      console.log("Overtime Hours:", overtimeHours);
      console.log("Overtime Rate:", overtimeRate);
      console.log("Full Payload:", JSON.stringify(checkOutData, null, 2));
      console.log("==============================");

      const response = await axios.post(`${API_URL}/attendance/checkout`, checkOutData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`${selectedEmployeeForAction.name} checked out successfully!`);
        setAttendanceData(prev => ({
          ...prev,
          [selectedEmployeeForAction.id]: {
            ...prev[selectedEmployeeForAction.id],
            [currentDate]: response.data.data
          }
        }));
        setCheckOutModal(false);
        resetCheckoutForm();
        setSelectedEmployeeForAction(null);
      }
    } catch (error) {
      console.error("Check-out error:", error);
      toast.error(error.response?.data?.message || "Failed to check out");
    } finally {
      setCheckOutLoading(false);
    }
  };

  const resetCheckoutForm = () => {
    setDailySalary(0);
    setOvertimeHours(0);
    setOvertimeRate(0);
    setOvertimeAmount(0);
    setTotalSalary(0);
    setNotes("");
    setTodayAttendance(null);
  };

  const calculateOvertime = (hours, rate) => {
    const amount = hours * rate;
    setOvertimeAmount(amount);
    const total = dailySalary + amount;
    setTotalSalary(total);
  };

  const openCheckInModal = (employee) => {
    setSelectedEmployeeForAction(employee);
    setSelectedSite("");
    setSelectedSiteName("");
    setCheckInModal(true);
  };

  const openCheckOutModal = (employee) => {
    setSelectedEmployeeForAction(employee);
    const todayAtt = attendanceData[employee.id]?.[currentDate];
    if (!todayAtt) {
      toast.warning("Employee hasn't checked in today");
      return;
    }
    setTodayAttendance(todayAtt);
    setDailySalary(employee.salary || 0);
    setOvertimeHours(0);
    setOvertimeRate(0);
    setOvertimeAmount(0);
    setTotalSalary(employee.salary || 0);
    setNotes("");
    setCheckOutModal(true);
  };

  const sortEmployees = (order) => {
    const sorted = [...employees].sort((a, b) =>
      order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setEmployees(sorted);
  };

  const handleSiteChange = (e) => {
    const siteId = e.target.value;
    setSelectedSite(siteId);
    if (siteId) {
      const site = sites.find(s => s._id === siteId);
      const name = site ? site.name : "";
      setSelectedSiteName(name);
      console.log("Selected Site ID:", siteId);
      console.log("Selected Site Name:", name);
      console.log("Full Site Object:", site);
    } else {
      setSelectedSiteName("");
    }
  };

const getStatusBadge = (employeeId) => {
  const todayAtt = attendanceData[employeeId]?.[currentDate];

  if (todayAtt?.checkOutTime) {
    return (
      <span
        className="badge bg-danger text-white"
        style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px" }}
      >
        Checked Out
      </span>
    );
  }

  if (todayAtt?.checkInTime) {
    return (
      <span
        className="badge bg-warning text-white"
        style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px" }}
      >
        Working
      </span>
    );
  }

  return (
    <span
      className="badge bg-success text-white"
      style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px" }}
    >
      Not Checked In
    </span>
  );
};

  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Block>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                <h3 style={{ marginTop: "55px" }}>Staff Attendance</h3>
              </BlockTitle>
              <p className="text-soft">You have total {employees.length} employees.</p>
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
                              <DropdownItem tag="a" href="#" onClick={(e) => {
                                e.preventDefault();
                                setItemPerPage(n);
                              }}>{n}</DropdownItem>
                            </li>
                          ))}
                        </ul>
                        <ul className="link-check">
                          <li><span>Order</span></li>
                          <li className={sort === "dsc" ? "active" : ""}>
                            <DropdownItem tag="a" href="#" onClick={(e) => {
                              e.preventDefault();
                              setSortState("dsc");
                              sortEmployees("dsc");
                            }}>DESC</DropdownItem>
                          </li>
                          <li className={sort === "asc" ? "active" : ""}>
                            <DropdownItem tag="a" href="#" onClick={(e) => {
                              e.preventDefault();
                              setSortState("asc");
                              sortEmployees("asc");
                            }}>ASC</DropdownItem>
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
                    placeholder="Search by name, role, or phone"
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

          <DataTableBody compact>
  <DataTableHead>
    <DataTableRow><span className="sub-text fw-bold">S.No</span></DataTableRow>
    <DataTableRow><span className="sub-text fw-bold">Name</span></DataTableRow>
    <DataTableRow><span className="sub-text fw-bold">Role</span></DataTableRow>
    <DataTableRow><span className="sub-text fw-bold">Site</span></DataTableRow>
    <DataTableRow><span className="sub-text fw-bold">Daily Wage</span></DataTableRow>
    <DataTableRow><span className="sub-text fw-bold">Today's Status</span></DataTableRow>
    <DataTableRow style={{ textAlign: "right" }}><span className="sub-text ml-5 fw-bold">Actions</span></DataTableRow>
  </DataTableHead>

  { (
    currentItems.map((emp, index) => (
      <DataTableItem key={emp.id}>
        <DataTableRow>{index + 1 + (currentPage - 1) * itemPerPage}</DataTableRow>
        <DataTableRow>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "#644634",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "10px",
                
              }}
            >
              {emp.name?.charAt(0).toUpperCase()}
            </div>
           <span className="fw-bold">{emp.name}</span>
          </div>
        </DataTableRow>
        <DataTableRow>
          <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px" }} className="fw-bold">
            {emp.role || "N/A"}
          </span>
        </DataTableRow>
        <DataTableRow>
          {attendanceData[emp.id]?.[currentDate]?.siteName || emp.site || "Not Assigned"}
        </DataTableRow>
        <DataTableRow>₹{emp.salary || 0}</DataTableRow>
        <DataTableRow>{getStatusBadge(emp.id)}</DataTableRow>
        <DataTableRow style={{ textAlign: "right" }}>
          <div style={{ display: "flex", gap: "6px",  }}>
            <button
              onClick={() => openCheckInModal(emp)}
              disabled={!!attendanceData[emp.id]?.[currentDate]?.checkInTime}
              style={{
                padding: "4px 12px",
                background: attendanceData[emp.id]?.[currentDate]?.checkInTime ? "#6c757d" : "#28a745",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "12px",
                cursor: attendanceData[emp.id]?.[currentDate]?.checkInTime ? "not-allowed" : "pointer",
                opacity: attendanceData[emp.id]?.[currentDate]?.checkInTime ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Icon name="log-in" size={12} /> Check In
            </button>
            <button
              onClick={() => openCheckOutModal(emp)}
              disabled={!attendanceData[emp.id]?.[currentDate]?.checkInTime || !!attendanceData[emp.id]?.[currentDate]?.checkOutTime}
              style={{
                padding: "4px 12px",
                background: !attendanceData[emp.id]?.[currentDate]?.checkInTime || attendanceData[emp.id]?.[currentDate]?.checkOutTime ? "#6c757d" : "#dc3545",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "12px",
                cursor: !attendanceData[emp.id]?.[currentDate]?.checkInTime || attendanceData[emp.id]?.[currentDate]?.checkOutTime ? "not-allowed" : "pointer",
                opacity: !attendanceData[emp.id]?.[currentDate]?.checkInTime || attendanceData[emp.id]?.[currentDate]?.checkOutTime ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Icon name="log-out" size={12} /> Check Out
            </button>
          </div>
        </DataTableRow>
      </DataTableItem>
    ))
  )}
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

      {/* Check-In Modal */}
      <Modal 
        isOpen={checkInModal} 
        toggle={() => setCheckInModal(false)} 
        centered
        style={{ maxHeight: "90vh" }}
      >
        <ModalHeader toggle={() => setCheckInModal(false)}>
          <div>
            <h5 style={{ fontWeight: 600, margin: 0 }}>Check In</h5>
            <p style={{ fontSize: "13px", color: "#666", margin: "4px 0 0" }}>
              {selectedEmployeeForAction?.name} - {selectedEmployeeForAction?.role}
            </p>
          </div>
        </ModalHeader>
        <ModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <FormGroup>
            <Label for="siteSelect">Select Site *</Label>
            <Input
              type="select"
              id="siteSelect"
              value={selectedSite}
              onChange={handleSiteChange}
              style={{ borderRadius: "8px" }}
            >
              <option value="">Select a site...</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.name} - {site.location || ""}
                </option>
              ))}
            </Input>
          </FormGroup>

          <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "8px", marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "#666" }}>Date:</span>
              <span style={{ fontWeight: 600 }}>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginTop: "4px" }}>
              <span style={{ color: "#666" }}>Time:</span>
              <span style={{ fontWeight: 600 }}>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginTop: "4px" }}>
              <span style={{ color: "#666" }}>Daily Wage:</span>
              <span style={{ fontWeight: 600, color: "#644634" }}>₹{selectedEmployeeForAction?.salary || 0}</span>
            </div>
            {selectedSiteName && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginTop: "4px", paddingTop: "8px", borderTop: "1px solid #e0e0e0" }}>
                <span style={{ color: "#666" }}>Selected Site:</span>
                <span style={{ fontWeight: 600, color: "#28a745" }}>{selectedSiteName}</span>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setCheckInModal(false)}>
            Cancel
          </Button>
          <Button
            color="success"
            onClick={handleCheckIn}
            disabled={checkInLoading || !selectedSite}
            style={{ background: "#28a745", borderColor: "#28a745" }}
          >
            {checkInLoading ? <Spinner size="sm" /> : "Check In"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Check-Out Modal */}
      <Modal 
        isOpen={checkOutModal} 
        toggle={() => { setCheckOutModal(false); resetCheckoutForm(); }} 
        size="lg" 
        centered
        style={{ maxHeight: "90vh" }}
      >
        <ModalHeader toggle={() => { setCheckOutModal(false); resetCheckoutForm(); }}>
          <div>
            <h5 style={{ fontWeight: 600, margin: 0 }}>Check Out</h5>
            <p style={{ fontSize: "13px", color: "#666", margin: "4px 0 0" }}>
              {selectedEmployeeForAction?.name} - {selectedEmployeeForAction?.role}
            </p>
          </div>
        </ModalHeader>
        <ModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {todayAttendance && (
            <div style={{ background: "#e8f5e9", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Check In Time:</span>
                <span style={{ fontWeight: 600 }}>
                  {todayAttendance.checkInTime ? new Date(todayAttendance.checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                </span>
              </div>
              {todayAttendance.siteName && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginTop: "4px" }}>
                  <span style={{ color: "#666" }}>Site:</span>
                  <span style={{ fontWeight: 600 }}>{todayAttendance.siteName}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginTop: "4px" }}>
                <span style={{ color: "#666" }}>Current Time:</span>
                <span style={{ fontWeight: 600 }}>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormGroup>
              <Label for="dailySalary">Daily Salary (₹) *</Label>
              <Input
                type="number"
                id="dailySalary"
                value={dailySalary}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setDailySalary(val);
                  setTotalSalary(val + overtimeAmount);
                }}
                style={{ borderRadius: "8px" }}
              />
            </FormGroup>

            <FormGroup>
              <Label for="overtimeHours">Overtime Hours</Label>
              <Input
                type="number"
                id="overtimeHours"
                value={overtimeHours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setOvertimeHours(val);
                  calculateOvertime(val, overtimeRate);
                }}
                step="0.5"
                style={{ borderRadius: "8px" }}
              />
            </FormGroup>

            <FormGroup>
              <Label for="overtimeRate">Overtime Rate (₹/hr)</Label>
              <Input
                type="number"
                id="overtimeRate"
                value={overtimeRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setOvertimeRate(val);
                  calculateOvertime(overtimeHours, val);
                }}
                style={{ borderRadius: "8px" }}
              />
            </FormGroup>

            <FormGroup>
              <Label for="overtimeAmount">Overtime Amount (₹)</Label>
              <Input
                type="text"
                id="overtimeAmount"
                value={overtimeAmount.toFixed(2)}
                disabled
                style={{ borderRadius: "8px", background: "#f8f9fa" }}
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label for="notes">Notes</Label>
            <Input
              type="textarea"
              id="notes"
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any remarks..."
              style={{ borderRadius: "8px" }}
            />
          </FormGroup>

          <div style={{ background: "#644634", padding: "16px", borderRadius: "8px", marginTop: "10px", color: "#fff" }}>
            <h6 style={{ margin: "0 0 8px 0", fontWeight: 600, color: "#fff" }}>Salary Summary</h6>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "14px" }}>
              <div>
                <span style={{ opacity: 0.8 }}>Daily Salary:</span>
                <div style={{ fontWeight: 600 }}>₹{dailySalary.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ opacity: 0.8 }}>Overtime:</span>
                <div style={{ fontWeight: 600 }}>₹{overtimeAmount.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ opacity: 0.8 }}>Total Hours:</span>
                <div style={{ fontWeight: 600 }}>{overtimeHours > 0 ? `8 + ${overtimeHours}` : "8"} hrs</div>
              </div>
              <div>
                <span style={{ opacity: 0.8, fontSize: "16px" }}>Total Salary:</span>
                <div style={{ fontWeight: 700, fontSize: "18px", color: "#ffd700" }}>₹{totalSalary.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => { setCheckOutModal(false); resetCheckoutForm(); }}>
            Cancel
          </Button>
          <Button
            color="danger"
            onClick={handleCheckOut}
            disabled={checkOutLoading || !dailySalary}
            style={{ background: "#dc3545", borderColor: "#dc3545" }}
          >
            {checkOutLoading ? <Spinner size="sm" /> : "Confirm Check Out"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StaffAttendance;