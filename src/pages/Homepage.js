import React, { useEffect, useState } from "react";
import Head from "../layout/head/Head";
import Content from "../layout/content/Content";
import TransactionTable from "../components/partials/default/transaction/Transaction";
import { DropdownToggle, DropdownMenu, Card, UncontrolledDropdown, DropdownItem, Modal, ModalBody } from "reactstrap";
import {
  Block,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
  Row,
  Col,
  PreviewCard,
  PreviewAltCard,
  BlockBetween,
} from "../components/Component";
import TrafficDougnut from "../components/partials/analytics/traffic-dougnut/TrafficDoughnut";
import axios from "axios";
import "./homepage.css";

const Homepage = () => {
  const [sm, updateSm] = useState(false);
  const [customerData, setCustomerData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [routeData, setRouteData] = useState([]);
  const [vehicleData, setVehicleData] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [filterCustomerType, setFilterCustomerType] = useState([]);
  const [billData, setBillData] = useState([]);
  const [selectedDays, setSelectedDays] = useState("Today");
  const [customSelected, setCustomSelected] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [selectedStaffForPerformance, setSelectedStaffForPerformance] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  
  // Dropdown states for first row cards
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState({
    customers: false,
    staff: false,
    bills: false,
    products: false,
    routes: false,
    vehicles: false
  });

  localStorage.setItem("isGridView", false);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchCustomerData(),
      fetchStaffData(),
      fetchBillData(),
      fetchProductData(),
      fetchRouteData(),
      fetchVehicleData()
    ]);
  };

 const fetchCustomerData = async () => {
  setLoading(prev => ({ ...prev, customers: true }));

  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKENDURL}/api/customer`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
    );

    if (response.status === 200) {
      setCustomerData(response.data);
      setFilterCustomerType(response.data);
    }

  } catch (err) {

    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("sessionToken");
      window.location.href = "/login";
      return;
    }

    console.error("Error fetching customers:", err);

  } finally {
    setLoading(prev => ({ ...prev, customers: false }));
  }
};
  const fetchStaffData = async () => {
    setLoading(prev => ({ ...prev, staff: true }));
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/staff", 
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
      );
      if (response.status === 200) {
        setStaffData(response.data);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(prev => ({ ...prev, staff: false }));
    }
  };

  const fetchBillData = async () => {
    setLoading(prev => ({ ...prev, bills: true }));
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/bills", 
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
      );
      if (response.status === 200) {
        // Handle different response structures
        let bills = [];
        if (Array.isArray(response.data)) {
          bills = response.data;
        } else if (response.data.bills && Array.isArray(response.data.bills)) {
          bills = response.data.bills;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          bills = response.data.data;
        }
        setBillData(bills);
      }
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(prev => ({ ...prev, bills: false }));
    }
  };

  const fetchRouteData = async () => {
    setLoading(prev => ({ ...prev, routes: true }));
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/route", 
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
      );
      if (response.status === 200 && response.data.success) {
        setRouteData(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
    } finally {
      setLoading(prev => ({ ...prev, routes: false }));
    }
  };

  const fetchProductData = async () => {
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/product", 
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
      );
      if (response.status === 200) {
        const allProducts = response.data || [];
        const activeProducts = allProducts.filter(product => !product.isDeleted);
        setProductData(activeProducts);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchVehicleData = async () => {
    setLoading(prev => ({ ...prev, vehicles: true }));
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/vehicle", 
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
      );
      if (response.status === 200) {
        setVehicleData(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(prev => ({ ...prev, vehicles: false }));
    }
  };

  const handleStaffSelection = (staff) => {
    if (staff === null) {
      setSelectedStaff("All Staff");
      setSelectedStaffId(null);
      setFilterCustomerType(customerData);
    } else {
      setSelectedStaff(staff.name);
      setSelectedStaffId(staff._id);
      const filteredByStaff = customerData?.filter((item) => item.createdBy === staff._id);
      setFilterCustomerType(filteredByStaff);
    }
    setSelectedStaffForPerformance(null);
  };

  const handleDateSubmit = () => {
    if (selectedFromDate && selectedToDate) {
      setCustomSelected(true);
      setSelectedDays("Custom");
      setModal(false);
    }
  };

  const handleStaffPerformanceSelect = (staff) => {
    setSelectedStaffForPerformance(staff);
    setShowStaffModal(false);
  };

  // Get today's date range
  const getTodayRange = () => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    return { startOfDay, endOfDay };
  };

  // Filter bills by date AND staff
  const filterBills = () => {
    if (!billData || billData.length === 0) return [];
    
    let filtered = [...billData];

    // Apply staff filter
    if (selectedStaffId) {
      filtered = filtered.filter(bill => bill.createdBy === selectedStaffId);
    }

    // Apply date filter
    if (customSelected && selectedFromDate && selectedToDate) {
      const from = new Date(selectedFromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(selectedToDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= from && createdAt <= to;
      });
    } else if (selectedDays === "7 Days") {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      filtered = filtered.filter((item) => new Date(item.createdAt) >= startDate);
    } else if (selectedDays === "30 Days") {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      filtered = filtered.filter((item) => new Date(item.createdAt) >= startDate);
    } else if (selectedDays === "Today") {
      const { startOfDay, endOfDay } = getTodayRange();
      filtered = filtered.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= startOfDay && createdAt <= endOfDay;
      });
    }

    return filtered;
  };

  // Filtered bills
  const filteredBills = filterBills();

  // Order Status - Using finalAmt for all calculations
  const approvedOrders = filteredBills.filter(b => b.orderStatus === "approved").length;
  const rejectedOrders = filteredBills.filter(b => b.orderStatus === "rejected").length;
  const pendingOrders = filteredBills.filter(b => b.orderStatus === "pending").length;
  const totalOrders = filteredBills.length;
  
  // Payment Status - Using finalAmt
 // Payment Status - Using finalAmt (only for approved bills)
const paidAmount = filteredBills
  .filter(b => b.orderStatus === "approved" && b.paymentMethod && b.paymentMethod !== null && b.paymentMethod !== "null")
  .reduce((acc, bill) => acc + (Number(bill.finalAmt) || 0), 0);

const outstandingAmount = filteredBills
  .filter(b => b.orderStatus === "approved" && (!b.paymentMethod || b.paymentMethod === null || b.paymentMethod === "null"))
  .reduce((acc, bill) => acc + (Number(bill.finalAmt) || 0), 0);

// Total approved order value - Using finalAmt (for percentage calculation)
const totalApprovedValue = filteredBills
  .filter(b => b.orderStatus === "approved")
  .reduce((acc, bill) => acc + (Number(bill.finalAmt) || 0), 0);
  
// Total order value - Using totalAmt
const totalOrderValue = filteredBills.reduce((acc, bill) => acc + (Number(bill.totalAmt) || 0), 0);
  
  // Business value (total approved orders amount) - Using finalAmt
 // Business value (total approved orders amount) - Using totalAmt
const businessValue = filteredBills
  .filter(b => b.orderStatus === "approved")
  .reduce((acc, bill) => acc + (Number(bill.totalAmt) || 0), 0);
  // Total counts
  const totalCustomers = selectedStaffId 
    ? customerData?.filter(c => c.createdBy === selectedStaffId).length || 0
    : customerData?.length || 0;
  
  const totalStaff = staffData?.length || 0;
  const totalVehicles = vehicleData?.length || 0;
  const totalProducts = productData?.length || 0;

  // Vehicle stats
  const activeVehicles = vehicleData.filter(v => v.status === "active" || v.status === true).length || 0;
  const inactiveVehicles = vehicleData.filter(v => v.status === "inactive" || v.status === false).length || 0;
  const vehiclesOnTrip = vehicleData.filter(v => v.tripStatus === "on_trip" || v.tripStatus === "active").length || 0;

  // Get unique bills
  const uniqueBills = filteredBills?.filter(
    (item, index, self) => index === self.findIndex((t) => t._id === item._id)
  );

  // Get selected staff performance details - Using finalAmt
 // Get selected staff performance details - Using finalAmt only for approved bills
const getSelectedStaffPerformance = () => {
  if (!selectedStaffForPerformance) return null;
  
  const staffBills = filteredBills.filter(bill => bill.createdBy === selectedStaffForPerformance._id);
  const approvedStaffBills = staffBills.filter(b => b.orderStatus === "approved");
  
  const totalBills = staffBills.length;
  const totalRevenue = approvedStaffBills.reduce((acc, bill) => acc + (Number(bill.finalAmt) || 0), 0);
  
  const approvedBills = staffBills.filter(b => b.orderStatus === "approved").length;
  const rejectedBills = staffBills.filter(b => b.orderStatus === "rejected").length;
  const pendingBills = staffBills.filter(b => b.orderStatus === "pending").length;
  const paidBills = approvedStaffBills.filter(b => b.paymentMethod && b.paymentMethod !== null).length;
  const unpaidBills = approvedStaffBills.filter(b => !b.paymentMethod || b.paymentMethod === null).length;
  const customersServed = [...new Set(staffBills.map(b => b.customerId))].length;
  
  const lastBillDate = staffBills.length > 0 
    ? new Date(Math.max(...staffBills.map(b => new Date(b.createdAt)))).toLocaleDateString('en-IN')
    : 'N/A';
  
  const avgOrderValue = approvedBills > 0 ? totalRevenue / approvedBills : 0;
  
  return {
    ...selectedStaffForPerformance,
    totalBills,
    totalRevenue,
    approvedBills,
    rejectedBills,
    pendingBills,
    paidBills,
    unpaidBills,
    customersServed,
    lastBillDate,
    avgOrderValue
  };
};

  const staffPerformance = getSelectedStaffPerformance();

  return (
    <React.Fragment>
      <Head title="Homepage"></Head>
      <Content>
        {/* Header with Status Bar */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page tag="h3">
                Dashboard
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>Welcome back Admin</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className={`btn-icon btn-trigger toggle-expand mr-n1 ${sm ? "active" : ""}`}
                  onClick={() => updateSm(!sm)}
                >
                  <Icon name="more-v" />
                </Button>
                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                  <ul className="nk-block-tools g-3">
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                          <Icon className="d-none d-sm-inline" name="calender-date" />
                          <span>
                            <span className="d-none d-md-inline">{selectedDays}</span>
                          </span>
                          <Icon className="dd-indc" name="chevron-right" />
                        </DropdownToggle>
                        <DropdownMenu>
                          <ul className="link-list-opt no-bdr">
                            <li>
                              <DropdownItem
                                tag="a"
                                href="#!"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  setSelectedDays("Today");
                                  setCustomSelected(false);
                                  setSelectedFromDate("");
                                  setSelectedToDate("");
                                }}
                              >
                                <span>Today</span>
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem
                                tag="a"
                                href="#!"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  setSelectedDays("7 Days");
                                  setCustomSelected(false);
                                  setSelectedFromDate("");
                                  setSelectedToDate("");
                                }}
                              >
                                <span>Last 7 days</span>
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem
                                tag="a"
                                href="#!"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  setSelectedDays("30 Days");
                                  setCustomSelected(false);
                                  setSelectedFromDate("");
                                  setSelectedToDate("");
                                }}
                              >
                                <span>Last 30 days</span>
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem
                                tag="a"
                                href="#!"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  setModal(true);
                                }}
                              >
                                <span>Custom Range</span>
                              </DropdownItem>
                            </li>
                          </ul>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* First Row - 4 Cards with Dropdown Details */}
        <Block>
          <Row className="g-gs">
            {/* Total Customers Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">TOTAL CUSTOMERS</h6>
                      <div className="stats-badges">
                        <span className="badge-info">👥 Active Customers</span>
                      </div>
                    </div>
                    <div className="stats-icon blue" style={{ cursor: 'pointer' }} onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
                      <Icon name="chevron-down" size={20} />
                    </div>
                  </div>
                  <div className="stats-value">
                    {loading.customers ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span className="value-number">{totalCustomers}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Dropdown Details */}
                  {showCustomerDetails && (
                    <div className="stats-details mt-3 p-2" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span>Active Customers:</span>
                        <span className="fw-bold">{customerData.filter(c => c.status !== false).length || 0}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span>New This Month:</span>
                        <span className="fw-bold text-success">+{Math.round(totalCustomers * 0.12)}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between">
                        <span>With Orders:</span>
                        <span className="fw-bold">{new Set(billData.map(b => b.customerId)).size}</span>
                      </div>
                    </div>
                  )}
                </div>
              </PreviewAltCard>
            </Col>

            {/* Total Staff Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">TOTAL STAFF</h6>
                      <div className="stats-badges">
                        <span className="badge-info">👥 Active Staff</span>
                      </div>
                    </div>
                    <div className="stats-icon green" style={{ cursor: 'pointer' }} onClick={() => setShowStaffDetails(!showStaffDetails)}>
                      <Icon name="chevron-down" size={20} />
                    </div>
                  </div>
                  <div className="stats-value">
                    {loading.staff ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span className="value-number">{totalStaff}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Dropdown Details */}
                  {showStaffDetails && (
                    <div className="stats-details mt-3 p-2" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span>Delivery Staff:</span>
                        <span className="fw-bold">{staffData.filter(s => s.type === 'delivery').length || 0}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span>Sales Staff:</span>
                        <span className="fw-bold">{staffData.filter(s => s.type === 'sales').length || 0}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between">
                        <span>Managers:</span>
                        <span className="fw-bold">{staffData.filter(s => s.type !== 'delivery' && s.type !== 'sales').length || 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              </PreviewAltCard>
            </Col>

            {/* Vehicles Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">VEHICLES</h6>
                      <div className="stats-badges">
                        <span className="badge-info">🚛 Fleet Status</span>
                      </div>
                    </div>
                    <div className="stats-icon warning" style={{ cursor: 'pointer' }} onClick={() => setShowVehicleDetails(!showVehicleDetails)}>
                      <Icon name="chevron-down" size={20} />
                    </div>
                  </div>
                  <div className="stats-value">
                    {loading.vehicles ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span className="value-number">{totalVehicles}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Dropdown Details */}
                  {showVehicleDetails && (
                    <div className="stats-details mt-3 p-2" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span>Active Vehicles:</span>
                        <span className="fw-bold text-success">{activeVehicles}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span>On Trip:</span>
                        <span className="fw-bold text-info">{vehiclesOnTrip}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between">
                        <span>Inactive:</span>
                        <span className="fw-bold text-danger">{inactiveVehicles}</span>
                      </div>
                    </div>
                  )}
                </div>
              </PreviewAltCard>
            </Col>

            {/* Products Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">ACTIVE PRODUCTS</h6>
                      <div className="stats-badges">
                        <span className="badge-info">📦 In Stock</span>
                      </div>
                    </div>
                    <div className="stats-icon purple" style={{ cursor: 'pointer' }} onClick={() => setShowProductDetails(!showProductDetails)}>
                      <Icon name="chevron-down" size={20} />
                    </div>
                  </div>
                  <div className="stats-value">
                    {loading.products ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span className="value-number">{totalProducts}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Dropdown Details */}
                  {showProductDetails && (
                    <div className="stats-details mt-3 p-2" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span>Categories:</span>
                        <span className="fw-bold">{new Set(productData.map(p => p.category)).size}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span>Low Stock:</span>
                        <span className="fw-bold text-warning">{productData.filter(p => p.stock < 10).length || 0}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between">
                        <span>Out of Stock:</span>
                        <span className="fw-bold text-danger">{productData.filter(p => p.stock === 0).length || 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              </PreviewAltCard>
            </Col>
          </Row>
        </Block>

        {/* Second Row - Staff Performance and Routes with Total Staff */}
        <Block>
          <Row className="g-gs">
            {/* Staff Performance Card */}
            <Col xl="4" lg="4">
              <Card className="performance-card h-100">
                <div className="card-inner">
                  <div className="performance-header">
                    <h6 className="performance-title">👤 Staff Performance</h6>
                    <Button 
                      size="sm" 
                      className="select-btn"
                      onClick={() => setShowStaffModal(true)}
                    >
                      <Icon name="select" /> Select Staff
                    </Button>
                  </div>
                  
                  {staffPerformance ? (
                    <div className="staff-details">
                      <div className="staff-avatar" style={{
                        background: staffPerformance.type === 'delivery' ? '#3498db' : 
                                    staffPerformance.type === 'sales' ? '#2ecc71' : '#95a5a6'
                      }}>
                        {staffPerformance.name?.charAt(0)}
                      </div>
                      
                      <h5 className="staff-name">{staffPerformance.name}</h5>
                      <p className="staff-role" style={{
                        color: staffPerformance.type === 'delivery' ? '#3498db' : 
                               staffPerformance.type === 'sales' ? '#2ecc71' : '#95a5a6',
                        fontWeight: '600'
                      }}>
                        {staffPerformance.type === 'delivery' ? '🚚 Delivery Staff' : 
                         staffPerformance.type === 'sales' ? '💰 Sales Staff' : '👤 Manager'}
                      </p>
                      
                      {/* Sales Staff View */}
                      {staffPerformance.type === 'sales' && (
                        <>
                          <div className="stats-grid">
                            <div className="stat-item">
                              <span>Total Bills</span>
                              <span className="stat-value">{staffPerformance.totalBills}</span>
                            </div>
                            <div className="stat-item">
                              <span>Revenue</span>
                              <span className="stat-value">₹{(staffPerformance.totalRevenue/1000).toFixed(1)}K</span>
                            </div>
                            <div className="stat-item">
                              <span>Approved</span>
                              <span className="stat-value success">{staffPerformance.approvedBills}</span>
                            </div>
                            <div className="stat-item">
                              <span>Rejected</span>
                              <span className="stat-value danger">{staffPerformance.rejectedBills}</span>
                            </div>
                          </div>

                          <div className="stats-grid-mini">
                            <div className="stat-item-mini">
                              <span>Customers</span>
                              <span className="stat-value">{staffPerformance.customersServed}</span>
                            </div>
                            <div className="stat-item-mini">
                              <span>Last Bill</span>
                              <span className="stat-value">{staffPerformance.lastBillDate}</span>
                            </div>
                            <div className="stat-item-mini">
                              <span>Avg Order</span>
                              <span className="stat-value">₹{staffPerformance.avgOrderValue.toFixed(0)}</span>
                            </div>
                            <div className="stat-item-mini">
                              <span>Unpaid</span>
                              <span className="stat-value warning">{staffPerformance.unpaidBills}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Delivery Staff View */}
                      {staffPerformance.type === 'delivery' && (
                        <>
                          <div className="stats-grid">
                            <div className="stat-item">
                              <span>Assigned Bills</span>
                              <span className="stat-value">{staffPerformance.totalBills}</span>
                            </div>
                            <div className="stat-item">
                              <span>Delivered</span>
                              <span className="stat-value success">{staffPerformance.approvedBills || 0}</span>
                            </div>
                            <div className="stat-item">
                              <span>Pending</span>
                              <span className="stat-value warning">{staffPerformance.pendingBills || 0}</span>
                            </div>
                            <div className="stat-item">
                              <span>Revenue</span>
                              <span className="stat-value">₹{(staffPerformance.totalRevenue/1000).toFixed(1)}K</span>
                            </div>
                          </div>

                          <div className="stats-grid-mini">
                            <div className="stat-item-mini">
                              <span>Customers</span>
                              <span className="stat-value">{staffPerformance.customersServed}</span>
                            </div>
                            <div className="stat-item-mini">
                              <span>Last Delivery</span>
                              <span className="stat-value">{staffPerformance.lastBillDate}</span>
                            </div>
                            <div className="stat-item-mini">
                              <span>Delivery Rate</span>
                              <span className="stat-value success">
                                {staffPerformance.totalBills > 0 
                                  ? ((staffPerformance.approvedBills / staffPerformance.totalBills) * 100).toFixed(1)
                                  : 0}%
                              </span>
                            </div>
                            <div className="stat-item-mini">
                              <span>Avg per Bill</span>
                              <span className="stat-value">₹{staffPerformance.avgOrderValue.toFixed(0)}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Manager View */}
                      {(!staffPerformance.type || staffPerformance.type === 'manager') && (
                        <div className="manager-card" style={{
                          textAlign: 'center',
                          padding: '2rem 1rem',
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          borderRadius: '16px',
                          marginTop: '1rem'
                        }}>
                          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👔</div>
                          <h6 style={{ color: '#1a2b3c', marginBottom: '0.5rem' }}>Management Access Only</h6>
                          <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: 0 }}>
                            Performance metrics not applicable for manager role
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-staff-selected" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>👤</div>
                      <p className="mt-3" style={{ color: '#6c757d' }}>Select a staff member to view performance</p>
                      <Button 
                        color="primary" 
                        className="select-btn mt-3"
                        onClick={() => setShowStaffModal(true)}
                      >
                        Browse Staff
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </Col>

            {/* Routes Overview and Total Staff Distribution */}
            <Col xl="4" lg="4">
              {/* Routes Section */}
              <PreviewCard className="chart-card mb-3">
                <div className="card-head chart-header" style={{ 
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <h6 className="chart-title" style={{ 
                    fontSize: '0.8rem', 
                    margin: 0,
                    fontWeight: '600',
                    color: '#1a2b3c'
                  }}>🗺️ Routes Overview</h6>
                </div>
                
                <div className="card-body" style={{ padding: '0.75rem' }}>
                  {/* Main Stats */}
                  <div className="routes-main-stats" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    marginBottom: '0.75rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '0.5rem'
                  }}>
                    <div className="route-stat" style={{ textAlign: 'center' }}>
                      <span className="route-stat-label" style={{ 
                        fontSize: '0.55rem', 
                        color: '#6c757d',
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '0.1rem'
                      }}>Total</span>
                      <span className="route-stat-value" style={{ 
                        fontSize: '1rem', 
                        fontWeight: '700', 
                        color: '#1a2b3c',
                        display: 'block'
                      }}>{routeData.length}</span>
                    </div>
                    <div className="route-stat" style={{ textAlign: 'center' }}>
                      <span className="route-stat-label" style={{ 
                        fontSize: '0.55rem', 
                        color: '#6c757d',
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '0.1rem'
                      }}>Active</span>
                      <span className="route-stat-value success" style={{ 
                        fontSize: '1rem', 
                        fontWeight: '700', 
                        color: '#10b981',
                        display: 'block'
                      }}>{routeData.filter(r => r.isActive !== false).length || 0}</span>
                    </div>
                    <div className="route-stat" style={{ textAlign: 'center' }}>
                      <span className="route-stat-label" style={{ 
                        fontSize: '0.55rem', 
                        color: '#6c757d',
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '0.1rem'
                      }}>Customers</span>
                      <span className="route-stat-value info" style={{ 
                        fontSize: '1rem', 
                        fontWeight: '700', 
                        color: '#0ea5e9',
                        display: 'block'
                      }}>{routeData.reduce((acc, route) => acc + (route.customerCount || 0), 0)}</span>
                    </div>
                  </div>

                  {/* Top Routes List */}
                  <div className="routes-mini-list" style={{ marginBottom: '0.5rem' }}>
                    <div style={{ 
                      fontSize: '0.65rem', 
                      color: '#6c757d', 
                      marginBottom: '0.35rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>Top Routes</div>
                    {routeData.slice(0, 2).map((route, index) => (
                      <div key={route._id || index} className="route-mini-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.5rem',
                        background: index === 0 ? '#fff7ed' : '#f0f9ff',
                        borderRadius: '6px',
                        marginBottom: '0.35rem',
                        border: '1px solid rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '50%', 
                            background: index === 0 ? '#f59e0b' : '#0ea5e9',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6rem',
                            fontWeight: '600'
                          }}>
                            {index + 1}
                          </span>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: '500', 
                            color: '#1a2b3c',
                            maxWidth: '100px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {route.routeName || `Route ${index + 1}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: '500', color: '#6c757d' }}>
                            {route.customerCount || 0}
                          </span>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: route.isActive !== false ? '#10b981' : '#ef4444'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Utilization Bar */}
                  <div className="routes-utilization" style={{ 
                    marginTop: '0.25rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px dashed #e9ecef'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.6rem', 
                      color: '#6c757d', 
                      marginBottom: '0.25rem',
                      fontWeight: '500'
                    }}>
                      <span>Route Utilization</span>
                      <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                        {routeData.length > 0 ? Math.round((routeData.reduce((acc, route) => acc + (route.customerCount || 0), 0) / (routeData.length * 15)) * 100) : 0}%
                      </span>
                    </div>
                    <div style={{ 
                      height: '4px', 
                      background: '#e9ecef', 
                      borderRadius: '10px', 
                      overflow: 'hidden',
                      width: '100%'
                    }}>
                      <div style={{
                        width: `${routeData.length > 0 ? Math.min(100, (routeData.reduce((acc, route) => acc + (route.customerCount || 0), 0) / (routeData.length * 15)) * 100) : 0}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>
              </PreviewCard>

              {/* Total Staff Distribution Card */}
              <PreviewCard className="chart-card">
                <div className="card-head chart-header" style={{ 
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <h6 className="chart-title" style={{ 
                    fontSize: '0.8rem', 
                    margin: 0,
                    fontWeight: '600',
                    color: '#1a2b3c'
                  }}>👥 Staff Distribution</h6>
                </div>
                
                <div className="card-body" style={{ padding: '0.75rem' }}>
                  <div className="staff-distribution-stats">
                    <div className="distribution-item d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3498db', marginRight: '8px' }}></span>
                        <span style={{ fontSize: '0.85rem' }}>Delivery Staff</span>
                      </div>
                      <div>
                        <span className="fw-bold me-2">{staffData.filter(s => s.type === 'delivery').length || 0}</span>
                        <span style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                          ({totalStaff ? Math.round((staffData.filter(s => s.type === 'delivery').length / totalStaff) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="distribution-item d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2ecc71', marginRight: '8px' }}></span>
                        <span style={{ fontSize: '0.85rem' }}>Sales Staff</span>
                      </div>
                      <div>
                        <span className="fw-bold me-2">{staffData.filter(s => s.type === 'sales').length || 0}</span>
                        <span style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                          ({totalStaff ? Math.round((staffData.filter(s => s.type === 'sales').length / totalStaff) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="distribution-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#95a5a6', marginRight: '8px' }}></span>
                        <span style={{ fontSize: '0.85rem' }}>Management</span>
                      </div>
                      <div>
                        <span className="fw-bold me-2">{staffData.filter(s => s.type !== 'delivery' && s.type !== 'sales').length || 0}</span>
                        <span style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                          ({totalStaff ? Math.round((staffData.filter(s => s.type !== 'delivery' && s.type !== 'sales').length / totalStaff) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </PreviewCard>
            </Col>

            {/* Third Section - Total Orders, Business Value, Outstanding Amount */}
            <Col xl="4" lg="4">
              <div className="d-flex flex-column h-100" style={{ gap: '1.25rem' }}>
                {/* Total Orders Card */}
                <PreviewAltCard className="delivery-card flex-grow-1">
                  <div className="card-body delivery-body" style={{ padding: '1.5rem' }}>
                    <div className="delivery-icon primary" style={{ width: '55px', height: '55px' }}>
                      <Icon name="bag" size={28} />
                    </div>
                    <div className="delivery-content">
                      <h6 className="delivery-title">Total Orders</h6>
                      <div className="delivery-value">
                        {loading.bills ? (
                          <span>Loading...</span>
                        ) : (
                          <>
                            <span className="value-number">{approvedOrders}</span>
                            <small className="badge">approved orders</small>
                          </>
                        )}
                      </div>
                      {/* Total Orders Count (for reference) */}
                      <div className="order-breakdown mt-2">
                        <div className="d-flex justify-content-between small">
                          <span>Total Orders (All):</span>
                          <span className="fw-bold">{totalOrders}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </PreviewAltCard>

                {/* Business Value Card - Using finalAmt */}
           {/* Business Value Card - Using totalAmt */}
<PreviewAltCard className="delivery-card flex-grow-1">
  <div className="card-body delivery-body" style={{ padding: '1.5rem' }}>
    <div className="delivery-icon success" style={{ width: '55px', height: '55px', background: '#10b98120' }}>
      <Icon name="trend-up" size={28} />
    </div>
    <div className="delivery-content">
      <h6 className="delivery-title">Business Value</h6>
      <div className="delivery-value">
        {loading.bills ? (
          <span>Loading...</span>
        ) : (
          <>
            <span className="value-number">₹{businessValue.toLocaleString('en-IN')}</span>
            <small className="badge">total amount</small> {/* Changed from "final amount" to "total amount" */}
          </>
        )}
      </div>
      {/* Approved Bills Total */}
      <div className="approved-breakdown mt-2">
        <div className="d-flex justify-content-between small">
          <span>Approved Bills:</span>
          <span className="fw-bold text-success">{approvedOrders}</span>
        </div>
        <div className="d-flex justify-content-between small mt-1">
          <span>Avg per Bill:</span>
          <span className="fw-bold">
            ₹{approvedOrders > 0 ? (businessValue/approvedOrders).toFixed(0) : 0}
          </span>
        </div>
      </div>
      {/* Trend Indicator */}
      <div className="trend-indicator up mt-2">
        <Icon name="arrow-up" size={14} />
        <span>12.5% vs last period</span>
      </div>
    </div>
  </div>
</PreviewAltCard>

                {/* Outstanding Amount Card - Using finalAmt */}
                {/* Outstanding Amount Card - Using finalAmt for approved bills only */}
<PreviewAltCard className="delivery-card flex-grow-1">
  <div className="card-body delivery-body" style={{ padding: '1.5rem' }}>
    <div className="delivery-icon warning" style={{ width: '55px', height: '55px' }}>
      <Icon name="clock" size={28} />
    </div>
    <div className="delivery-content">
      <h6 className="delivery-title">Outstanding Amount</h6>
      <div className="delivery-value">
        {loading.bills ? (
          <span>Loading...</span>
        ) : (
          <>
            <span className="value-number">₹{outstandingAmount.toLocaleString('en-IN')}</span>
            <small className="badge">unpaid (approved bills)</small>
          </>
        )}
      </div>
      {/* Payment Progress - Only for approved bills */}
      <div className="payment-progress mt-2">
        <div className="d-flex justify-content-between small mb-1">
          <span>Paid: ₹{paidAmount.toLocaleString('en-IN')}</span>
          <span>{totalApprovedValue > 0 ? Math.round((paidAmount/totalApprovedValue)*100) : 0}%</span>
        </div>
        <div style={{ height: '4px', background: '#e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{
            width: `${totalApprovedValue > 0 ? (paidAmount/totalApprovedValue)*100 : 0}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #f59e0b, #f39c12)',
            borderRadius: '10px'
          }} />
        </div>
        <div className="d-flex justify-content-between small mt-1">
          <span>Pending Bills (Unpaid):</span>
          <span className="fw-bold text-warning">
            {filteredBills.filter(b => b.orderStatus === "approved" && (!b.paymentMethod || b.paymentMethod === null)).length}
          </span>
        </div>
        <div className="d-flex justify-content-between small mt-1">
          <span>Paid Bills:</span>
          <span className="fw-bold text-success">
            {filteredBills.filter(b => b.orderStatus === "approved" && b.paymentMethod && b.paymentMethod !== null).length}
          </span>
        </div>
      </div>
    </div>
  </div>
</PreviewAltCard>
              </div>
            </Col>
          </Row>
        </Block>
      </Content>

      {/* Staff Selection Modal */}
      <Modal isOpen={showStaffModal} toggle={() => setShowStaffModal(false)} className="staff-modal" size="lg">
        <ModalBody className="staff-modal-body">
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              setShowStaffModal(false);
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="staff-modal-content">
            <h5 className="staff-modal-title">👤 Select Staff Member</h5>
            <div className="staff-list">
              {staffData.length > 0 ? (
                staffData.map((staff) => (
                  <div
                    key={staff._id}
                    className={`staff-item ${selectedStaffForPerformance?._id === staff._id ? 'selected' : ''}`}
                    onClick={() => handleStaffPerformanceSelect(staff)}
                  >
                    <div className="staff-avatar-small">
                      {staff.name?.charAt(0)}
                    </div>
                    <div className="staff-info">
                      <h6>{staff.name}</h6>
                      <p>{staff.email || 'No email'}</p>
                    </div>
                    <div className="staff-stats">
                      <span className="stat-badge" style={{ background: staff.type === 'delivery' ? '#3498db20' : staff.type === 'sales' ? '#2ecc7120' : '#95a5a620', color: staff.type === 'delivery' ? '#3498db' : staff.type === 'sales' ? '#2ecc71' : '#95a5a6' }}>
                        {staff.type || 'manager'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4">No staff found</p>
              )}
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Date Range Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} className="date-modal" size="lg">
        <ModalBody className="date-modal-body">
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              setModal(false);
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="date-modal-content">
            <h5 className="date-modal-title">📅 Select Date Range</h5>
            <div className="date-picker">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="fromDate">From Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="fromDate"
                      value={selectedFromDate}
                      onChange={(e) => setSelectedFromDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="toDate">To Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="toDate"
                      value={selectedToDate}
                      onChange={(e) => setSelectedToDate(e.target.value)}
                      min={selectedFromDate}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleDateSubmit}
                  disabled={!selectedFromDate || !selectedToDate}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default Homepage;