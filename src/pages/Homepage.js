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
const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [filterCustomerType, setFilterCustomerType] = useState([]);
  const [billData, setBillData] = useState([]);
  const [selectedDays, setSelectedDays] = useState("All");
  const [customSelected, setCustomSelected] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [selectedStaffForPerformance, setSelectedStaffForPerformance] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState({
    customers: false,
    staff: false,
    bills: false,
    products: false,
     routes: false
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
      fetchRouteData() 
    ]);
  };

  const fetchCustomerData = async () => {
    setLoading(prev => ({ ...prev, customers: true }));
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/customer");
      if (response.status === 200) {
        setCustomerData(response.data);
        setFilterCustomerType(response.data);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const fetchStaffData = async () => {
    setLoading(prev => ({ ...prev, staff: true }));
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/staff");
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
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/bills");
      if (response.status === 200) {
        setBillData(response.data.bills || []);
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
    const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/route");
    console.log('Routes API response:', response.data);
    
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
    const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/product");
    if (response.status === 200) {
      // Filter to only show active products (isDeleted === false)
      const allProducts = response.data || [];
      const activeProducts = allProducts.filter(product => !product.isDeleted);
      console.log('Total products:', allProducts.length);
      console.log('Active products:', activeProducts.length);
      setProductData(activeProducts);
    }
  } catch (err) {
    console.error("Error fetching products:", err);
  } finally {
    setLoading(prev => ({ ...prev, products: false }));
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
    }

    return filtered;
  };

  // Filtered bills
  const filteredBills = filterBills();

  // 1. Order Status (based on orderStatus string)
  const approvedOrders = filteredBills.filter(b => b.orderStatus === "approved").length;
  const rejectedOrders = filteredBills.filter(b => b.orderStatus === "rejected").length;
  const pendingOrders = filteredBills.filter(b => b.orderStatus === "pending").length;
  const totalOrders = filteredBills.length;
  
  // 2. Payment Status (based on paymentMethod existence)
  const paidAmount = filteredBills
    .filter(b => b.paymentMethod && b.paymentMethod !== null && b.paymentMethod !== "null")
    .reduce((acc, bill) => acc + (bill.totalAmt || 0), 0);
  
  const notPaidAmount = filteredBills
    .filter(b => !b.paymentMethod || b.paymentMethod === null || b.paymentMethod === "null")
    .reduce((acc, bill) => acc + (bill.totalAmt || 0), 0);
  
  const totalOrderValue = filteredBills.reduce((acc, bill) => acc + (bill.totalAmt || 0), 0);
  
  // 3. Delivery Status (based on orderStatus string)
  const deliveredOrders = filteredBills.filter(b => b.orderStatus === "approved").length;
  const pendingDeliveryOrders = filteredBills.filter(b => b.orderStatus === "rejected" || b.orderStatus === "pending").length;
  
  // 4. Total products count
  const totalProducts = productData?.length || 0;
  
  // 5. Total customers
  const totalCustomers = selectedStaffId 
    ? customerData?.filter(c => c.createdBy === selectedStaffId).length || 0
    : customerData?.length || 0;
  
  const totalStaff = staffData?.length || 0;

  // Get unique bills
  const uniqueBills = filteredBills?.filter(
    (item, index, self) => index === self.findIndex((t) => t._id === item._id)
  );

  // Get selected staff performance details
  const getSelectedStaffPerformance = () => {
    if (!selectedStaffForPerformance) return null;
    
    const staffBills = filteredBills.filter(bill => bill.createdBy === selectedStaffForPerformance._id);
    
    const totalBills = staffBills.length;
    const totalRevenue = staffBills.reduce((acc, bill) => acc + (bill.totalAmt || 0), 0);
    
    // Order Status counts
    const approvedBills = staffBills.filter(b => b.orderStatus === "approved").length;
    const rejectedBills = staffBills.filter(b => b.orderStatus === "rejected").length;
    const pendingBills = staffBills.filter(b => b.orderStatus === "pending").length;
    
    // Payment Status
    const paidBills = staffBills.filter(b => b.paymentMethod && b.paymentMethod !== null).length;
    const unpaidBills = staffBills.filter(b => !b.paymentMethod || b.paymentMethod === null).length;
    
    const customersServed = [...new Set(staffBills.map(b => b.customerId))].length;
    
    const lastBillDate = staffBills.length > 0 
      ? new Date(Math.max(...staffBills.map(b => new Date(b.createdAt)))).toLocaleDateString('en-IN')
      : 'N/A';
    
    // Calculate average order value
    const avgOrderValue = totalBills > 0 ? totalRevenue / totalBills : 0;
    
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
                      {/* <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                          <Icon className="d-none d-sm-inline" name="user" />
                          <span>
                            <span className="d-none d-md-inline">{selectedStaff || "Select Staff"}</span>
                          </span>
                          <Icon className="dd-indc" name="chevron-right" />
                        </DropdownToggle>
                        <DropdownMenu>
                          <ul className="link-list-opt no-bdr">
                            <li>
                              <DropdownItem
                                tag="a"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  handleStaffSelection(null);
                                }}
                                href="#dropdownitem"
                              >
                                <span>All Staff</span>
                              </DropdownItem>
                            </li>
                            {staffData.map((staff) => (
                              <li key={staff._id}>
                                <DropdownItem
                                  tag="a"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    handleStaffSelection(staff);
                                  }}
                                  href="#dropdownitem"
                                >
                                  <span>{staff.name}</span>
                                </DropdownItem>
                              </li>
                            ))}
                          </ul>
                        </DropdownMenu>
                      </UncontrolledDropdown> */}
                    </li>

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
                                  setSelectedDays("All");
                                  setCustomSelected(false);
                                  setSelectedFromDate("");
                                  setSelectedToDate("");
                                }}
                              >
                                <span>All Time</span>
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

        {/* First Row - 4 Cards with Status Bars */}
        <Block>
          <Row className="g-gs">
            {/* Total Orders Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header p-1">
                    <div>
                      <h6 className="stats-title">TOTAL ORDERS</h6>
                      <div className="stats-badges">
                        <span className="badge-approved">✓ {approvedOrders}</span>
                        <span className="badge-rejected">✗ {rejectedOrders}</span>
                          <span className="badge-pending">⏳ {pendingOrders}</span>
                      
                      </div>
                    </div>
                    <div className="stats-icon blue">
                      <Icon name="bag" size={24} />
                    </div>
                  </div>
                  <div className="stats-value">
                    {loading.bills ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span className="value-number">{totalOrders}</span>
                      </>
                    )}
                  </div>
                  {/* Status Bar */}
                  <div className="status-bar-container ">
                    <div className="status-bar mt-2">
                      <div 
                        className="status-bar-segment approved" 
                        style={{ width: `${totalOrders ? (approvedOrders/totalOrders)*100 : 0}%` }}
                        title={`Approved: ${approvedOrders}`}
                      />
                      <div 
                        className="status-bar-segment rejected" 
                        style={{ width: `${totalOrders ? (rejectedOrders/totalOrders)*100 : 0}%` }}
                        title={`Rejected: ${rejectedOrders}`}
                      />
                      {pendingOrders > 0 && (
                        <div 
                          className="status-bar-segment pending" 
                          style={{ width: `${(pendingOrders/totalOrders)*100}%`,}}
                          title={`Pending: ${pendingOrders}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </PreviewAltCard>
            </Col>

            {/* Paid Amount Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">PAID AMOUNT</h6>
                      <div className="stats-badges">
                        <span className="badge-paid">✓ Paid</span>
                      </div>
                    </div>
                    <div className="stats-icon green">
                      <Icon name="check" size={24} />
                    </div>
                  </div>
                  <div className="stats-value">
                    {loading.bills ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span className="value-number">₹{(paidAmount).toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="progress-mini">
                    <div className="progress-mini-label">
                      <span>of ₹{(totalOrderValue).toLocaleString('en-IN')}</span>
                      <span>{totalOrderValue ? ((paidAmount/totalOrderValue)*100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="progress-mini-bar">
                      <div 
                        className="progress-mini-fill paid" 
                        style={{ width: `${totalOrderValue ? (paidAmount/totalOrderValue)*100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </PreviewAltCard>
            </Col>

            {/* Pending Amount Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">PENDING AMOUNT</h6>
                      <div className="stats-badges">
                        <span className="badge-pending">⏳ Pending</span>
                      </div>
                    </div>
                    <div className="stats-icon warning">
                      <Icon name="clock" size={24} />
                    </div>
                  </div>
                  <div className="stats-value">
                    {loading.bills ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span className="value-number">₹{(notPaidAmount).toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="progress-mini">
                    <div className="progress-mini-label">
                      <span>of ₹{(totalOrderValue).toLocaleString('en-IN')}</span>
                      <span>{totalOrderValue ? ((notPaidAmount/totalOrderValue)*100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="progress-mini-bar">
                      <div 
                        className="progress-mini-fill pending" 
                        style={{ width: `${totalOrderValue ? (notPaidAmount/totalOrderValue)*100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </PreviewAltCard>
            </Col>

            {/* Total Products Card */}
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
        <div className="stats-icon purple">
          <Icon name="box" size={24} />
        </div>
      </div>
      <div className="stats-value">
        {loading.products ? (
          <span>Loading...</span>
        ) : (
          <>
            <span className="value-number">{totalProducts.toLocaleString('en-IN')}</span>
          </>
        )}
      </div>
      {/* Stock Indicator */}
      <div className="stock-indicator">
        <div className="stock-dot active" />
        <span className="stock-text">Active Products</span>
      </div>
    </div>
  </PreviewAltCard>
</Col>
          </Row>
        </Block>

        {/* Second Row - Staff Performance and Charts */}
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
                  <span >Total Bills</span>
                  <span className="stat-value">{staffPerformance.totalBills}</span>
                </div>
                <div className="stat-item">
                  <span >Revenue</span>
                  <span className="stat-value">₹{(staffPerformance.totalRevenue/1000).toFixed(1)}K</span>
                </div>
                <div className="stat-item">
                  <span >Approved</span>
                  <span className="stat-value success">{staffPerformance.approvedBills}</span>
                </div>
                <div className="stat-item">
                  <span >Rejected</span>
                  <span className="stat-value danger">{staffPerformance.rejectedBills}</span>
                </div>
              </div>

              <div className="stats-grid-mini">
                <div className="stat-item-mini">
                  <span >Customers</span>
                  <span className="stat-value">{staffPerformance.customersServed}</span>
                </div>
                <div className="stat-item-mini">
                  <span >Last Bill</span>
                  <span className="stat-value">{staffPerformance.lastBillDate}</span>
                </div>
                <div className="stat-item-mini">
                  <span >Avg Order</span>
                  <span className="stat-value">₹{staffPerformance.avgOrderValue.toFixed(0)}</span>
                </div>
                <div className="stat-item-mini">
                  <span >Unpaid</span>
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
                  <span >Assigned Bills</span>
                  <span className="stat-value">{staffPerformance.totalBills}</span>
                </div>
                <div className="stat-item">
                  <span >Delivered</span>
                  <span className="stat-value success">{staffPerformance.deliveredBills || 0}</span>
                </div>
                <div className="stat-item">
                  <span >Pending</span>
                  <span className="stat-value warning">{staffPerformance.pendingBills || 0}</span>
                </div>
                <div className="stat-item">
                  <span >Revenue</span>
                  <span className="stat-value">₹{(staffPerformance.totalRevenue/1000).toFixed(1)}K</span>
                </div>
              </div>

              <div className="stats-grid-mini">
                <div className="stat-item-mini">
                  <span >Customers</span>
                  <span className="stat-value">{staffPerformance.customersServed}</span>
                </div>
                <div className="stat-item-mini">
                  <span >Last Delivery</span>
                  <span className="stat-value">{staffPerformance.lastBillDate}</span>
                </div>
                <div className="stat-item-mini">
                  <span >Delivery Rate</span>
                  <span className="stat-value success">
                    {staffPerformance.totalBills > 0 
                      ? ((staffPerformance.deliveredBills / staffPerformance.totalBills) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="stat-item-mini">
                  <span >Avg per Bill</span>
                  <span className="stat-value">₹{staffPerformance.avgOrderValue.toFixed(0)}</span>
                </div>
              </div>

              {/* Delivery Progress Bar */}
              <div className="performance-progress" style={{ marginTop: '1rem' }}>
                {/* <div className="progress-label">
                  <span>Delivery Completion</span>
                  <span className="score">
                    {staffPerformance.totalBills > 0 
                      ? ((staffPerformance.deliveredBills / staffPerformance.totalBills) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div> */}
                {/* <div className="progress-bar">
                  <div 
                    className="progress-fill success" 
                    style={{ 
                      width: staffPerformance.totalBills > 0 
                        ? `${(staffPerformance.deliveredBills / staffPerformance.totalBills) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div> */}
              </div>
            </>
          )}

          {/* Manager View - Simple Card */}
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

          {/* Order Distribution Chart */}
{/* Order Distribution Chart */}
<Col xl="4" lg="4">
  {/* Routes Section - Separate Container */}
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
      {/* Main Stats - Fixed alignment */}
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

      {/* Routes List - Fixed spacing */}
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

      {/* Utilization Bar - Fixed alignment */}
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

  {/* Payment Distribution Chart - Separate Container */}
 <PreviewCard className="chart-card">
  {/* Stats Container - Now on top */}
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    gap: '0.5rem',
    background: '#f8f9fa',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    margin: '0.75rem 0.75rem 0.25rem 0.75rem'
  }}>
    <div className="chart-stat" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.35rem',
      flex: 1
    }}>
      <span className="stat-dot paid" style={{ 
        width: '8px', 
        height: '8px', 
        borderRadius: '50%', 
        background: '#2ecc71',
        display: 'inline-block',
        boxShadow: '0 0 0 2px rgba(46, 204, 113, 0.2)'
      }} />
      <span style={{ 
        fontSize: '0.7rem', 
        fontWeight: '500',
        color: '#1a2b3c',
        whiteSpace: 'nowrap'
      }}>
        Paid: <span style={{ fontWeight: '700', color: '#2ecc71' }}>₹{(paidAmount/1000).toFixed(1)}K</span>
      </span>
    </div>
    
    <div style={{ width: '1px', height: '20px', background: '#dee2e6' }} />
    
    <div className="chart-stat" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.35rem',
      flex: 1,
      justifyContent: 'flex-end'
    }}>
      <span className="stat-dot unpaid" style={{ 
        width: '8px', 
        height: '8px', 
        borderRadius: '50%', 
        background: '#f39c12',
        display: 'inline-block',
        boxShadow: '0 0 0 2px rgba(243, 156, 18, 0.2)'
      }} />
      <span style={{ 
        fontSize: '0.7rem', 
        fontWeight: '500',
        color: '#1a2b3c',
        whiteSpace: 'nowrap'
      }}>
        Unpaid: <span style={{ fontWeight: '700', color: '#f39c12' }}>₹{(notPaidAmount/1000).toFixed(1)}K</span>
      </span>
    </div>
  </div>
  
  {/* Chart Container - Now below stats */}
  <div className="chart-container" style={{ 
    height: '130px', 
    padding: '0.25rem 0.5rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: '0.25rem'
  }}>
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop:"65px"
    }}>
      <TrafficDougnut
        selectedDays={selectedDays}
        selectedFromDate={selectedFromDate}
        selectedToDate={selectedToDate}
        data={uniqueBills}
      />
    </div>
  </div>
</PreviewCard>
</Col>
            {/* Delivery Status Cards */}
            <Col xl="4" lg="4">
              <div className="d-flex flex-column h-100" style={{ gap: '1.25rem' }}>
                <PreviewAltCard className="delivery-card flex-grow-1">
                  <div className="card-body delivery-body" style={{ padding: '1.5rem' }}>
                    <div className="delivery-icon primary" style={{ width: '55px', height: '55px' }}>
                      <Icon name="user" size={28} />
                    </div>
                    <div className="delivery-content">
                      <h6 className="delivery-title">Total Customers</h6>
                      <div className="delivery-value">
                        {loading.customers ? (
                          <span>Loading...</span>
                        ) : (
                          <>
                            <span className="value-number">{totalCustomers}</span>
                            <small className="badge">customers</small>
                          </>
                        )}
                      </div>
                      {/* Customer Growth Indicator */}
                      <div className="growth-indicator">
                        <Icon name="arrow-up" size={14} className="growth-icon" />
                        <span className="growth-text">+{Math.round(totalCustomers * 0.15)} this month</span>
                      </div>
                    </div>
                  </div>
                </PreviewAltCard>
                {/* Total Staff Card */}
               <PreviewAltCard className="delivery-card flex-grow-1">
  <div className="card-body delivery-body" style={{ padding: '1.5rem' }}>
    <div className="delivery-icon info" style={{ width: '55px', height: '55px' }}>
      <Icon name="users" size={28} />
    </div>
    <div className="delivery-content">
      <h6 className="delivery-title">Active Staff</h6>
      <div className="delivery-value">
        {loading.staff ? (
          <span>Loading...</span>
        ) : (
          <>
            <span className="value-number">{totalStaff}</span>
            <small className="badge">total</small>
          </>
        )}
      </div>
      
      {/* Staff Type Distribution */}
      <div className="staff-type-distribution" style={{ marginTop: '0.75rem' }}>
        {/* Delivery Staff */}
        <div className="type-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3498db' }} />
            <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>Delivery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a2b3c' }}>
              {staffData.filter(s => s.type === 'delivery').length || 0}
            </span>
            <small style={{ fontSize: '0.65rem', color: '#6c757d' }}>
              ({totalStaff ? Math.round((staffData.filter(s => s.type === 'delivery').length / totalStaff) * 100) : 0}%)
            </small>
          </div>
        </div>

        {/* Sales Staff */}
        <div className="type-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71' }} />
            <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>Sales</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a2b3c' }}>
              {staffData.filter(s => s.type === 'sales').length || 0}
            </span>
            <small style={{ fontSize: '0.65rem', color: '#6c757d' }}>
              ({totalStaff ? Math.round((staffData.filter(s => s.type === 'sales').length / totalStaff) * 100) : 0}%)
            </small>
          </div>
        </div>

        {/* Other/Unspecified Staff */}
        {staffData.filter(s => s.type !== 'delivery' && s.type !== 'sales').length > 0 && (
          <div className="type-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#95a5a6' }} />
              <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>Other</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a2b3c' }}>
                {staffData.filter(s => s.type !== 'delivery' && s.type !== 'sales').length}
              </span>
              <small style={{ fontSize: '0.65rem', color: '#6c757d' }}>
                ({totalStaff ? Math.round((staffData.filter(s => s.type !== 'delivery' && s.type !== 'sales').length / totalStaff) * 100) : 0}%)
              </small>
            </div>
          </div>
        )}
      </div>

      
    </div>
  </div>
</PreviewAltCard>

                {/* Total Customers Card */}
                

                {/* Average Order Value Card */}
                <PreviewAltCard className="delivery-card flex-grow-1">
                  <div className="card-body delivery-body" style={{ padding: '1.5rem' }}>
                    <div className="delivery-icon purple" style={{ width: '55px', height: '55px' }}>
                      <Icon name="trend-up" size={28} />
                    </div>
                    <div className="delivery-content">
                      <h6 className="delivery-title">Avg Order Value</h6>
                      <div className="delivery-value">
                        {loading.bills ? (
                          <span>Loading...</span>
                        ) : (
                          <>
                            <span className="value-number">
                              ₹{totalOrders > 0 ? (totalOrderValue/totalOrders).toFixed(0) : 0}
                            </span>
                            <small className="badge">per order</small>
                          </>
                        )}
                      </div>
                      {/* Trend Indicator */}
                      <div className="trend-indicator up">
                        <Icon name="arrow-up" size={14} />
                        <span>8.2% vs last period</span>
                      </div>
                    </div>
                  </div>
                </PreviewAltCard>
              </div>
            </Col>
          </Row>
        </Block>

        {/* Third Row - Transaction Table */}
        {/* <Block>
          <Row className="g-gs">
            <Col xxl="12">
              <Card className="table-card">
                <div className="card-inner table-header">
                  <div className="title-section">
                    <h6 className="table-title">Recent Transactions</h6>
                    <p className="table-subtitle">Last 10 bills</p>
                  </div>
                  <div className="table-tools">
                    <Button tag="a" href="#!" size="sm" className="view-btn">
                      View All <Icon name="arrow-right" />
                    </Button>
                  </div>
                </div>
                <TransactionTable 
                  bills={uniqueBills.slice(0, 10)} 
                  loading={loading.bills}
                />
              </Card>
            </Col>
          </Row>
        </Block> */}
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
                staffData.map((staff) => {
                  const staffBills = billData.filter(b => b.createdBy === staff._id);
                  const totalRevenue = staffBills.reduce((acc, b) => acc + (b.totalAmt || 0), 0);
                  const approvedCount = staffBills.filter(b => b.orderStatus === "approved").length;
                  const pendingCount = staffBills.filter(b => b.orderStatus === "pending").length;
                  
                  return (
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
                        {/* <span className="stat-badge">
                          {staffBills.length} bills
                        </span>
                        <span className="stat-badge approved">
                          {approvedCount} approved
                        </span>
                        {pendingCount > 0 && (
                          <span className="stat-badge pending">
                            {pendingCount} pending
                          </span>
                        )}
                        <span className="stat-badge revenue">
                          ₹{(totalRevenue/1000).toFixed(1)}K
                        </span> */}
                      </div>
                    </div>
                  );
                })
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