import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/Component';
import { Spinner } from 'reactstrap';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api` || "http://localhost:5000/api";

const DailyWagesTab = ({ 
  projectId,
  wages: propWages,
  loading: propLoading,
  selectedMonth: propSelectedMonth,
  selectedYear: propSelectedYear,
  onMonthChange: propOnMonthChange,
  onYearChange: propOnYearChange,
  onFilter: propOnFilter,
  onClear: propOnClear
}) => {
  const [openMonth, setOpenMonth] = useState(null);
  const [localWages, setLocalWages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(propSelectedMonth || "");
  const [selectedYear, setSelectedYear] = useState(propSelectedYear || "");
  const [filteredWages, setFilteredWages] = useState([]);
  const BRAND = "#4B5694";

  const toggle = (monthKey) => setOpenMonth((prev) => (prev === monthKey ? null : monthKey));

  const formatINR = (val) => {
    if (!val && val !== 0) return "₹0";
    return "₹" + Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Fetch daily wages by site ID
  const fetchDailyWagesBySite = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      console.log(`Fetching daily wages for site: ${projectId}`);
      
      // Use the getBySite endpoint: GET /api/attendance/site/:id
      const response = await axios.get(`${API_URL}/attendance/site/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log("Daily wages response:", response.data);
      
      if (response.data && response.data.data) {
        const records = response.data.data || [];
        
        // Process records to get employee names
        const processedRecords = await Promise.all(records.map(async (record) => {
          let employeeName = 'Unknown';
          let employeeId = '';
          
          // Try to get employee name from employeeId field
          if (record.employeeId) {
            if (typeof record.employeeId === 'object' && record.employeeId.name) {
              employeeName = record.employeeId.name;
              employeeId = record.employeeId._id || record.employeeId;
            } else if (typeof record.employeeId === 'string') {
              employeeId = record.employeeId;
              // Try to fetch employee details if only ID is available
              try {
                const employeeRes = await axios.get(`${API_URL}/employees/${record.employeeId}`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (employeeRes.data.success) {
                  employeeName = employeeRes.data.data.name || 'Unknown';
                }
              } catch (err) {
                console.error(`Failed to fetch employee ${record.employeeId}:`, err);
              }
            }
          }
          
          return {
            ...record,
            employeeName: employeeName,
            employeeIdDisplay: employeeId,
            siteName: record.siteName || record.site?.name || 'Not Assigned'
          };
        }));
        
        setLocalWages(processedRecords);
        setFilteredWages(processedRecords);
        console.log(`Processed ${processedRecords.length} daily wage records`);
      } else {
        console.log("No daily wages data found");
        setLocalWages([]);
        setFilteredWages([]);
      }
    } catch (error) {
      console.error("Error fetching daily wages:", error);
      setLocalWages([]);
      setFilteredWages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchDailyWagesBySite();
    }
  }, [projectId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...localWages];
    
    if (selectedMonth) {
      filtered = filtered.filter(record => {
        const date = new Date(record.date);
        return String(date.getMonth() + 1).padStart(2, '0') === selectedMonth;
      });
    }
    
    if (selectedYear) {
      filtered = filtered.filter(record => {
        const date = new Date(record.date);
        return date.getFullYear() === parseInt(selectedYear);
      });
    }
    
    setFilteredWages(filtered);
  }, [localWages, selectedMonth, selectedYear]);

  // Group by month
  const groupedByMonth = filteredWages.reduce((acc, wage) => {
    const date = new Date(wage.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { 
        monthName, 
        monthKey, 
        records: [], 
        totalAmount: 0,
        totalDays: 0,
        totalOvertime: 0,
        uniqueEmployees: new Set()
      };
    }
    acc[monthKey].records.push(wage);
    acc[monthKey].totalAmount += wage.totalSalary || 0;
    acc[monthKey].totalDays += 1;
    acc[monthKey].totalOvertime += wage.overtimeHours || 0;
    
    let empId = wage.employeeId;
    if (empId && typeof empId === 'object') {
      empId = empId._id || empId;
    }
    if (empId) {
      acc[monthKey].uniqueEmployees.add(empId.toString());
    }
    return acc;
  }, {});

  const monthKeys = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

  const getEmployeeName = (record) => {
    if (record.employeeName) return record.employeeName;
    if (record.employeeId && typeof record.employeeId === 'object' && record.employeeId.name) {
      return record.employeeId.name;
    }
    return 'Unknown';
  };

  const getEmployeeId = (record) => {
    if (!record.employeeId) return 'N/A';
    if (typeof record.employeeId === 'string') return record.employeeId;
    if (typeof record.employeeId === 'object' && record.employeeId._id) {
      return record.employeeId._id;
    }
    return 'N/A';
  };

  const EmptyState = ({ text }) => (
    <div style={{ 
      padding: "24px", 
      background: "#fafafa", 
      borderRadius: "10px", 
      border: "1px dashed #ddd", 
      textAlign: "center", 
      color: "#aaa", 
      fontSize: "14px" 
    }}>
      {text}
    </div>
  );

  const MonthFilter = ({ 
    selectedMonth, 
    onMonthChange,
    selectedYear,
    onYearChange,
    onFilter, 
    onClear 
  }) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      years.push(y);
    }

    const inputStyle = {
      borderRadius: "8px", 
      border: "1.5px solid #e8e4e0",
      fontSize: "13px", 
      padding: "8px 12px",
      color: "#1a1a2e", 
      background: "#fdfcfc",
    };

    const BrandBtn = ({ children, onClick, disabled, size = "md" }) => {
      const pad = size === "sm" ? "5px 13px" : "7px 18px";
      return (
        <button
          onClick={onClick}
          disabled={disabled}
          style={{
            background: BRAND,
            color: "#fff",
            border: `1.5px solid ${BRAND}`,
            padding: pad,
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "13px",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "background 0.18s, opacity 0.18s",
            whiteSpace: "nowrap",
          }}
        >
          {children}
        </button>
      );
    };

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            style={{
              ...inputStyle,
              padding: "6px 10px",
              fontSize: "12px",
              minWidth: "120px",
              cursor: "pointer"
            }}
          >
            <option value="">All Months</option>
            {months.map((month, index) => (
              <option key={month} value={String(index + 1).padStart(2, '0')}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            style={{
              ...inputStyle,
              padding: "6px 10px",
              fontSize: "12px",
              minWidth: "100px",
              cursor: "pointer"
            }}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <BrandBtn size="sm" onClick={onFilter}>
          <Icon name="filter" size={12} /> Apply Filter
        </BrandBtn>

        <button
          onClick={onClear}
          style={{
            background: "transparent",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#666",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Icon name="refresh" size={12} /> Clear
        </button>
      </div>
    );
  };

  const DailyWagesAccordion = ({ wages }) => {
    return (
      <div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {monthKeys.map((monthKey) => {
            const monthData = groupedByMonth[monthKey];
            const isOpen = openMonth === monthKey;

            return (
              <div key={monthKey}
                style={{
                  background: "#fff",
                  border: `1px solid ${isOpen ? BRAND + "55" : "#eee"}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Header */}
                <div
                  onClick={() => toggle(monthKey)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    cursor: "pointer",
                    userSelect: "none",
                    background: isOpen ? BRAND + "06" : "#fff",
                    transition: "background 0.18s",
                  }}
                >
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: BRAND + "15",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Icon name="calendar" style={{ color: BRAND, fontSize: "17px" }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>
                      {monthData.monthName}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#888",
                      marginTop: "2px",
                    }}>
                      {monthData.uniqueEmployees.size} Employees • {monthData.records.length} Records • {monthData.totalOvertime}h Overtime
                    </div>
                  </div>

                  <span style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: BRAND,
                    background: BRAND + "12",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    flexShrink: 0
                  }}>
                    {formatINR(monthData.totalAmount)}
                  </span>

                  <span style={{
                    color: "#aaa",
                    fontSize: "18px",
                    transition: "transform 0.25s",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    flexShrink: 0
                  }}>
                    ▾
                  </span>
                </div>

                {/* Expanded Content */}
                <div style={{
                  maxHeight: isOpen ? "1200px" : "0",
                  overflow: "hidden",
                  transition: "maxHeight 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}>
                  <div style={{ padding: "0 16px 16px" }}>
                    {/* Summary Stats */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "12px",
                      padding: "12px 0",
                      borderBottom: "1px solid #f0f0f0",
                      marginBottom: "12px"
                    }}>
                      <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "11px", color: "#aaa" }}>Total Records</div>
                        <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND }}>{monthData.records.length}</div>
                      </div>
                      <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "11px", color: "#aaa" }}>Employees</div>
                        <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND }}>{monthData.uniqueEmployees.size}</div>
                      </div>
                      <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "11px", color: "#aaa" }}>Total Overtime</div>
                        <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND }}>{monthData.totalOvertime}h</div>
                      </div>
                      <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "11px", color: "#aaa" }}>Total Amount</div>
                        <div style={{ fontSize: "18px", fontWeight: 700, color: BRAND }}>{formatINR(monthData.totalAmount)}</div>
                      </div>
                    </div>

                    {/* Daily Records Table */}
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Employee</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Site</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Daily Salary</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Overtime</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</th>
                            <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthData.records.map((record, idx) => {
                            const employeeName = getEmployeeName(record);
                            const employeeId = getEmployeeId(record);
                            const empIdStr = typeof employeeId === 'string' ? employeeId : employeeId?.toString() || 'N/A';
                            
                            return (
                              <tr key={record._id || idx} style={{ borderBottom: idx < monthData.records.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                <td style={{ padding: "10px 10px", color: "#555" }}>
                                  {record.date ? new Date(record.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "N/A"}
                                </td>
                                <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>
                                  {employeeName}
                                  <div style={{ fontSize: "11px", color: "#888" }}>
                                    ID: {empIdStr.substring(0, 8) || "N/A"}
                                  </div>
                                </td>
                                <td style={{ padding: "10px 10px", color: "#555" }}>
                                  {record.siteName || record.site?.name || "N/A"}
                                </td>
                                <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                                  {formatINR(record.dailySalary || 0)}
                                </td>
                                <td style={{ padding: "10px 10px", textAlign: "right", color: "#e65100" }}>
                                  {record.overtimeHours || 0}h
                                  {record.overtimeAmount > 0 && (
                                    <div style={{ fontSize: "11px", color: "#888" }}>
                                      {formatINR(record.overtimeAmount)}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: BRAND }}>
                                  {formatINR(record.totalSalary || 0)}
                                </td>
                                <td style={{ padding: "10px 10px", textAlign: "center" }}>
                                  <span style={{
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    padding: "2px 10px",
                                    borderRadius: "20px",
                                    background: record.status === "present" ? "#eaf3de" : record.status === "late" ? "#faeeda" : "#fcebeb",
                                    color: record.status === "present" ? "#3b6d11" : record.status === "late" ? "#854f0b" : "#a32d2d",
                                  }}>
                                    {capitalizeFirst(record.status || "Pending")}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        {monthKeys.length > 0 && (
          <div style={{
            marginTop: "16px",
            background: BRAND,
            borderRadius: "12px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "rgba(255,255,255,0.85)",
              fontSize: "14px",
              fontWeight: 600
            }}>
              <Icon name="wallet" style={{ fontSize: "18px", color: "#fff" }} />
              Total Daily Wages (All Months)
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
              {formatINR(Object.values(groupedByMonth).reduce((sum, m) => sum + m.totalAmount, 0))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Use prop functions or local functions
  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    if (propOnMonthChange) propOnMonthChange(value);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    if (propOnYearChange) propOnYearChange(value);
  };

  const handleFilter = () => {
    if (propOnFilter) propOnFilter();
  };

  const handleClear = () => {
    setSelectedMonth("");
    setSelectedYear("");
    if (propOnClear) propOnClear();
  };

  // Determine if we should use props or local state
  const useProps = propWages !== undefined;
  const displayWages = useProps ? propWages : filteredWages;
  const displayLoading = useProps ? propLoading : loading;
  const displaySelectedMonth = useProps ? propSelectedMonth : selectedMonth;
  const displaySelectedYear = useProps ? propSelectedYear : selectedYear;

  return (
    <>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: "16px", 
        flexWrap: "wrap", 
        gap: "12px" 
      }}>
        <h6 style={{ 
          fontWeight: 700, 
          margin: 0, 
          color: "#1a1a2e", 
          fontSize: "15px" 
        }}>
          Daily Wages
        </h6>
        <MonthFilter
          selectedMonth={displaySelectedMonth}
          selectedYear={displaySelectedYear}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          onFilter={handleFilter}
          onClear={handleClear}
        />
      </div>

      {displayLoading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spinner style={{ color: BRAND }} />
          <p style={{ color: "#aaa", fontSize: "13px", marginTop: "10px" }}>Loading daily wages...</p>
        </div>
      ) : displayWages.length > 0 ? (
        <DailyWagesAccordion wages={displayWages} />
      ) : (
        <EmptyState text="No daily wages found for the selected period." />
      )}
    </>
  );
};

export default DailyWagesTab;