import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
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
  RSelect,
} from "../../../components/Component";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api`;
const BRAND = "#4B5694";
const AVATAR_COLOR = "#4d598e";

const StaffAttendance = () => {
  const history = useHistory();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSortState] = useState("asc");
  const [attendanceData, setAttendanceData] = useState({});
  const [sites, setSites] = useState([]);

  // Filter states - using objects for RSelect
  const [filterSite, setFilterSite] = useState(null);
  const [filterRole, setFilterRole] = useState(null);

  // Modal states
  const [checkInModal, setCheckInModal] = useState(false);
  const [checkOutModal, setCheckOutModal] = useState(false);
  const [selectedEmployeeForAction, setSelectedEmployeeForAction] = useState(null);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedSiteName, setSelectedSiteName] = useState("");
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

  // Get unique roles from employees
  const uniqueRoles = [...new Set(employees.map(emp => emp.role).filter(Boolean))];

  // Get unique sites from employees AND projects
  const getUniqueSites = () => {
    // Get sites from employees
    const employeeSites = employees
      .map(emp => emp.site)
      .filter(Boolean);
    
    // Get sites from projects
    const projectSites = sites
      .map(site => site.name)
      .filter(Boolean);
    
    // Combine and get unique values
    const allSites = [...new Set([...employeeSites, ...projectSites])];
    return allSites.sort();
  };

  const uniqueSites = getUniqueSites();

  // Options for RSelect
  const siteOptions = [
    { value: "", label: "All Sites" },
    ...uniqueSites.map(site => ({
      value: site,
      label: site
    }))
  ];

  const roleOptions = [
    { value: "", label: "All Roles" },
    ...uniqueRoles.map(role => ({
      value: role,
      label: role
    }))
  ];

  useEffect(() => {
    fetchEmployees();
    fetchSites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, employees, filterSite, filterRole, sites]);

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
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };
const siteOptionsForModal = sites.map(site => ({
  value: site._id,
  label: `${site.name}${site.location ? ` - ${site.location}` : ''}`
}));

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

  const applyFilters = () => {
    let filtered = [...employees];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.phone?.includes(searchText) ||
        emp.role?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Site filter - compare with employee's site string
    if (filterSite?.value) {
      filtered = filtered.filter(emp => emp.site === filterSite.value);
    }

    // Role filter
    if (filterRole?.value) {
      filtered = filtered.filter(emp => emp.role === filterRole.value);
    }

    setFilteredEmployees(filtered);
  };

  const handleEmployeeClick = (employee) => {
    history.push(`/staff-attendance/${employee.id}`);
  };

  const handleCheckIn = async () => {
    if (!selectedEmployeeForAction) return;
    if (!selectedSite) {
      toast.warning("Please select a site");
      return;
    }

    setCheckInLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const createdBy = localStorage.getItem("userId") || "admin";
      
      const checkInData = {
        employeeId: selectedEmployeeForAction.id,
        date: currentDate,
        site: selectedSite,
        siteName: selectedSiteName,
        createdBy: createdBy,
      };

      const response = await axios.post(`${API_URL}/attendance/checkin`, checkInData, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
    } else {
      setSelectedSiteName("");
    }
  };

  const clearFilters = () => {
    setFilterSite(null);
    setFilterRole(null);
    setSearchText("");
    setOnSearch(false);
    setCurrentPage(1);
  };

  // Status as text with colors (no badges)
  const getStatusText = (employeeId) => {
    const todayAtt = attendanceData[employeeId]?.[currentDate];

    if (todayAtt?.checkOutTime) {
      return {
        text: "Checked Out",
        color: "#ef4444"
      };
    }

    if (todayAtt?.checkInTime) {
      return {
        text: "Working",
        color: "#f59e0b"
      };
    }

    return {
      text: "Not Checked In",
      color: "#10b981"
    };
  };

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Custom styles for RSelect
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

  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // Show loading spinner centered on the page
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        gap: "12px",
        backgroundColor: "#f8f9fa"
      }}>
        <Spinner style={{ color: BRAND, width: "40px", height: "40px" }} />
        <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Loading employees...</p>
      </div>
    );
  }

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
              <div className="card-tools">
                {/* Filters - using RSelect like Suppliers page */}
                {!onSearch && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <div style={{ minWidth: "150px" }}>
                      <RSelect
                        options={siteOptions}
                        value={filterSite}
                        onChange={(opt) => setFilterSite(opt)}
                        placeholder="All Sites"
                        isClearable={false}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                      />
                    </div>

                    <div style={{ minWidth: "150px" }}>
                      <RSelect
                        options={roleOptions}
                        value={filterRole}
                        onChange={(opt) => setFilterRole(opt)}
                        placeholder="All Roles"
                        isClearable={false}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                      />
                    </div>

                    {(filterSite?.value || filterRole?.value || searchText) && (
                      <Button 
                        color="link" 
                        onClick={clearFilters}
                        style={{ color: BRAND, textDecoration: 'none', padding: '4px 8px' }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
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
              <DataTableRow><span className="sub-text fw-bold">Actions</span></DataTableRow>
            </DataTableHead>

            {currentItems.map((emp, index) => {
              const status = getStatusText(emp.id);
              const todayAtt = attendanceData[emp.id]?.[currentDate];
              const isCheckedIn = !!todayAtt?.checkInTime;
              const isCheckedOut = !!todayAtt?.checkOutTime;
              
              return (
                <DataTableItem key={emp.id}>
                  <DataTableRow>{index + 1 + (currentPage - 1) * itemPerPage}</DataTableRow>
                  <DataTableRow>
                    <div 
                      style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                      onClick={() => handleEmployeeClick(emp)}
                    >
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: AVATAR_COLOR,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "10px",
                        }}
                      >
                        {getInitials(emp.name)}
                      </div>
                      <span className="fw-bold" style={{ color: BRAND, cursor: "pointer" }}>
                        {emp.name}
                      </span>
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
                  <DataTableRow>
                    <span
                      style={{
                        color: status.color,
                        fontWeight: 600,
                        fontSize: "13px"
                      }}
                    >
                      {status.text}
                    </span>
                  </DataTableRow>
                  <DataTableRow>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-start" }}>
                      <button
                        onClick={() => openCheckInModal(emp)}
                        disabled={isCheckedIn}
                        style={{
                          padding: "4px 12px",
                          background: isCheckedIn ? "#6c757d" : "#10b981",
                          border: "none",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: "12px",
                          cursor: isCheckedIn ? "not-allowed" : "pointer",
                          opacity: isCheckedIn ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Icon name="log-in" size={12} /> Check In
                      </button>
                      <button
                        onClick={() => openCheckOutModal(emp)}
                        disabled={!isCheckedIn || isCheckedOut}
                        style={{
                          padding: "4px 12px",
                          background: !isCheckedIn || isCheckedOut ? "#6c757d" : "#ef4444",
                          border: "none",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: "12px",
                          cursor: !isCheckedIn || isCheckedOut ? "not-allowed" : "pointer",
                          opacity: !isCheckedIn || isCheckedOut ? 0.6 : 1,
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
              );
            })}
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
      <RSelect
        options={siteOptionsForModal}
        value={siteOptionsForModal.find(opt => opt.value === selectedSite) || null}
        onChange={(opt) => {
          if (opt) {
            setSelectedSite(opt.value);
            const site = sites.find(s => s._id === opt.value);
            setSelectedSiteName(site ? site.name : "");
          } else {
            setSelectedSite("");
            setSelectedSiteName("");
          }
        }}
        placeholder="Select a site..."
        isClearable={true}
        styles={{
          ...selectStyles,
          control: (base) => ({
            ...base,
            minHeight: '38px',
            borderColor: selectedSite ? '#10b981' : '#e8e4e0',
            '&:hover': {
              borderColor: selectedSite ? '#10b981' : '#e8e4e0',
            },
            boxShadow: selectedSite ? '0 0 0 1px #10b981' : 'none',
            cursor: 'pointer',
            borderRadius: '8px',
          }),
        }}
        classNamePrefix="react-select"
      />
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
          <span style={{ fontWeight: 600, color: "#10b981" }}>{selectedSiteName}</span>
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
      style={{ background: "#10b981", borderColor: "#10b981" }}
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
            style={{ background: "#ef4444", borderColor: "#ef4444" }}
          >
            {checkOutLoading ? <Spinner size="sm" /> : "Confirm Check Out"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StaffAttendance;