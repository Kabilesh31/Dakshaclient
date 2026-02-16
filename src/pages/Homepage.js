import React, { useEffect, useState } from "react";
import Head from "../layout/head/Head";
import Content from "../layout/content/Content";
import AvgSubscription from "../components/partials/default/avg-subscription/AvgSubscription";
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
import ActiveUser from "../components/partials/analytics/active-user/ActiveUser";
import TrafficDougnut from "../components/partials/analytics/traffic-dougnut/TrafficDoughnut";
// Remove this line: import PerformerOfTheWeek from "../components/partials/analytics/performer/PerformerOfTheWeek";
import axios from "axios";
import "./homepage.css";

const Homepage = () => {
  const [sm, updateSm] = useState(false);
  const [customerData, setCustomerData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [filterCustomerType, setFilterCustomerType] = useState([]);
  const [billData, setBillData] = useState([]);
  const [selectedDays, setSelectedDays] = useState("All");
  const [customSelected, setCustomSelected] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  
  // Loading states
  const [loading, setLoading] = useState({
    customers: false,
    staff: false,
    bills: false
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
      fetchBillData()
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

  const handleStaffSelection = (staff) => {
    if (staff === null) {
      setSelectedStaff("All");
      setSelectedStaffId(null);
      setFilterCustomerType(customerData);
    } else {
      setSelectedStaff(staff.name);
      setSelectedStaffId(staff._id);
      const filteredByStaff = customerData?.filter((item) => item.createdBy === staff._id);
      setFilterCustomerType(filteredByStaff);
    }
  };

  const handleDateSubmit = () => {
    setCustomSelected(true);
    setModal(false);
  };

  // Date filters
  const filterByDate = (data) => {
    if (!data || data.length === 0) return [];
    
    if (!customSelected && selectedDays === "All") {
      return data;
    }

    const now = new Date();
    let startDate;

    if (!customSelected) {
      if (selectedDays === "7 Days") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
      } else if (selectedDays === "30 Days") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 30);
      }
      return data.filter((item) => new Date(item.createdAt) >= startDate);
    }

    // Custom date filter
    if (customSelected && selectedFromDate && selectedToDate) {
      const from = new Date(selectedFromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(selectedToDate);
      to.setHours(23, 59, 59, 999);
      
      return data?.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= from && createdAt <= to;
      });
    }

    return data;
  };

  // Filter bills by date
  const filteredBills = filterByDate(billData);

  // Calculate metrics
  const totalOrders = filteredBills.length;
  const totalOrderValue = filteredBills.reduce((acc, bill) => acc + (bill.totalAmt || 0), 0);
  const totalCustomers = customerData?.length || 0;
  const totalStaff = staffData?.length || 0;

  // Get unique bills
  const uniqueBills = filteredBills?.filter(
    (item, index, self) => index === self.findIndex((t) => t._id === item._id)
  );

  // Calculate performer of the week (staff with most orders)
  const getPerformerOfTheWeek = () => {
    if (!billData.length || !staffData.length) return null;
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentBills = billData.filter(bill => new Date(bill.createdAt) >= last7Days);
    
    const staffPerformance = {};
    recentBills.forEach(bill => {
      if (bill.createdBy) {
        staffPerformance[bill.createdBy] = (staffPerformance[bill.createdBy] || 0) + 1;
      }
    });
    
    let topStaffId = null;
    let maxOrders = 0;
    
    Object.entries(staffPerformance).forEach(([staffId, orders]) => {
      if (orders > maxOrders) {
        maxOrders = orders;
        topStaffId = staffId;
      }
    });
    
    const topStaff = staffData.find(s => s._id === topStaffId);
    
    return topStaff ? {
      name: topStaff.name,
      orders: maxOrders,
      image: topStaff.img || null,
      revenue: recentBills
        .filter(b => b.createdBy === topStaffId)
        .reduce((acc, bill) => acc + (bill.totalAmt || 0), 0)
    } : null;
  };

  const performerOfTheWeek = getPerformerOfTheWeek();

  return (
    <React.Fragment>
      <Head title="Homepage"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page tag="h3">
                Dashboard
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>Welcome to Retail Pulse</p>
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
                      </UncontrolledDropdown>
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
                                  setSelectedDays("Custom");
                                  setCustomSelected(true);
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

        {/* First Row - 3 Boxes */}
        <Block>
          <Row className="g-gs">
            {/* Total Orders Card */}
            <Col xl="4" md="4">
              <PreviewAltCard className="h-100">
                <div className="card-body">
                  <div className="card-title-group mb-2">
                    <div className="card-title">
                      <h6 className="title">Total Orders</h6>
                    </div>
                    <div className="card-tools">
                      <Icon name="bag" size={24} className="text-primary" />
                    </div>
                  </div>
                  <div className="card-amount">
                    {loading.bills ? (
                      <span className="amount">Loading...</span>
                    ) : (
                      <>
                        <span className="amount">{totalOrders.toLocaleString('en-IN')}</span>
                        <small className="change up text-success ms-2">
                          <Icon name="arrow-up" /> +12.5%
                        </small>
                      </>
                    )}
                  </div>
                  <div className="card-info">
                    <small className="text-soft">vs last period</small>
                  </div>
                </div>
              </PreviewAltCard>
            </Col>

            {/* Total Order Value Card */}
            <Col xl="4" md="4">
              <PreviewAltCard className="h-100">
                <div className="card-body">
                  <div className="card-title-group mb-2">
                    <div className="card-title">
                      <h6 className="title">Total Order Value</h6>
                    </div>
                    <div className="card-tools">
                      <Icon name="card" size={24} className="text-success" />
                    </div>
                  </div>
                  <div className="card-amount">
                    {loading.bills ? (
                      <span className="amount">Loading...</span>
                    ) : (
                      <>
                        <span className="amount">₹{totalOrderValue.toLocaleString('en-IN')}</span>
                        <small className="change up text-success ms-2">
                          <Icon name="arrow-up" /> +8.2%
                        </small>
                      </>
                    )}
                  </div>
                  <div className="card-info">
                    <small className="text-soft">vs last period</small>
                  </div>
                </div>
              </PreviewAltCard>
            </Col>

            {/* Total Customers Card */}
            <Col xl="4" md="4">
              <PreviewAltCard className="h-100">
                <div className="card-body">
                  <div className="card-title-group mb-2">
                    <div className="card-title">
                      <h6 className="title">Total Customers</h6>
                    </div>
                    <div className="card-tools">
                      <Icon name="users" size={24} className="text-info" />
                    </div>
                  </div>
                  <div className="card-amount">
                    {loading.customers ? (
                      <span className="amount">Loading...</span>
                    ) : (
                      <>
                        <span className="amount">{totalCustomers.toLocaleString('en-IN')}</span>
                        <small className="change up text-success ms-2">
                          <Icon name="arrow-up" /> +5.3%
                        </small>
                      </>
                    )}
                  </div>
                  <div className="card-info">
                    <small className="text-soft">active customers</small>
                  </div>
                </div>
              </PreviewAltCard>
            </Col>
          </Row>
        </Block>

        {/* Second Row - Performer of the Week (Left) and Circle Chart (Right) */}
        <Block>
          <Row className="g-gs">
  {/* Performer of the Week - Takes 4 columns */}
  <Col xl="4" lg="4">
    <Card className="card-bordered h-100">
      <div className="card-inner">
        <div className="card-title-group mb-3">
          <div className="card-title">
            <h6 className="title">🏆 Performer of the Week</h6>
          </div>
          <div className="card-tools">
            <UncontrolledDropdown>
              <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                <Icon name="more-h"></Icon>
              </DropdownToggle>
              <DropdownMenu end>
                <ul className="link-list-opt no-bdr">
                  <li>
                    <DropdownItem tag="a" href="#dropdownitem" onClick={(ev) => ev.preventDefault()}>
                      <span>This Week</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem tag="a" href="#dropdownitem" onClick={(ev) => ev.preventDefault()}>
                      <span>Last Week</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem tag="a" href="#dropdownitem" onClick={(ev) => ev.preventDefault()}>
                      <span>This Month</span>
                    </DropdownItem>
                  </li>
                </ul>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </div>
        
        {performerOfTheWeek ? (
          <div className="text-center">
            <div className="mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
              {performerOfTheWeek.image ? (
                <img 
                  src={performerOfTheWeek.image} 
                  alt={performerOfTheWeek.name}
                  className="rounded-circle w-100 h-100"
                  style={{ objectFit: 'cover', border: '3px solid #f0f5ff' }}
                />
              ) : (
                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center w-100 h-100 text-white fw-bold" 
                     style={{ fontSize: '32px' }}>
                  {performerOfTheWeek.name.charAt(0)}
                </div>
              )}
            </div>
            
            <h5 className="fw-bold mb-1">{performerOfTheWeek.name}</h5>
            <p className="text-soft small mb-3">Sales Representative</p>

            <Row className="g-2 mb-3">
              <Col xs="6">
                <div className="bg-light rounded p-2">
                  <div className="small text-soft">Orders</div>
                  <div className="h4 fw-bold mb-0">{performerOfTheWeek.orders}</div>
                </div>
              </Col>
              <Col xs="6">
                <div className="bg-light rounded p-2">
                  <div className="small text-soft">Revenue</div>
                  <div className="h4 fw-bold mb-0">₹{performerOfTheWeek.revenue.toLocaleString('en-IN')}</div>
                </div>
              </Col>
            </Row>

            <div className="text-start">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-soft">Monthly Target</small>
                <small className="fw-medium text-primary">75%</small>
              </div>
              <div className="progress mb-3" style={{ height: '6px' }}>
                <div className="progress-bar bg-primary" style={{ width: '75%' }} />
              </div>
            </div>

            <div className="d-flex justify-content-between pt-2 border-top">
              <div>
                <small className="text-soft d-block">Completed</small>
                <span className="fw-bold">24</span>
              </div>
              <div>
                <small className="text-soft d-block">Target</small>
                <span className="fw-bold">32</span>
              </div>
              <div>
                <small className="text-soft d-block">Left</small>
                <span className="fw-bold">8</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Icon name="user" size={40} className="text-soft mb-2" />
            <p className="text-soft mb-0">No performer data</p>
          </div>
        )}
      </div>
    </Card>
  </Col>

  {/* Circle Chart - Takes 4 columns */}
  <Col xl="4" lg="4">
                  <PreviewCard className="h-100">
                    <div className="card-head">
                      <h6 className="title">Order Distribution</h6>
                    </div>
                    <div className="nk-ck-sm" style={{ height: '280px' }}>
                      <TrafficDougnut
                        selectedDays={selectedDays}
                        selectedFromDate={selectedFromDate}
                        selectedToDate={selectedToDate}
                        data={uniqueBills}
                      />
                    </div>
                  </PreviewCard>
                </Col>

  {/* Small Cards Stack - Takes 4 columns */}
  <Col xl="4" lg="4">
    <div className="d-flex flex-column h-100" style={{ gap: '1rem' }}>
      {/* Total Staff */}
      <PreviewAltCard className="flex-grow-1">
        <div className="card-body d-flex align-items-center">
          <div className="bg-info-soft rounded p-3 me-3">
            <Icon name="users" size={24} className="text-info" />
          </div>
          <div>
            <h6 className="title ml-5 mb-1">Total Staff</h6>
            <div className="d-flex ml-5 align-items-baseline">
              {loading.staff ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span className="h3 mb-0 ml-4 mt-1 me-2">{totalStaff}</span>
                  <small className="text-soft">active</small>
                </>
              )}
            </div>
          </div>
        </div>
      </PreviewAltCard>

      {/* Paid Amount */}
      <PreviewAltCard className="flex-grow-1">
        <div className="card-body d-flex align-items-center">
          <div className="bg-success-soft rounded p-3 me-3">
            <Icon name="check-circle" size={24} className="text-success" />
          </div>
          <div>
            <h6 className="title mb-1 ml-5">Paid Amount</h6>
            <div className="d-flex align-items-baseline ml-5 flex-wrap">
              {loading.bills ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span className="h4 mb-0 ml-4  mt-1 me-2">
                    ₹{filteredBills
                      .filter(b => b.paidStatus)
                      .reduce((acc, b) => acc + (b.totalAmt || 0), 0)
                      .toLocaleString('en-IN')}
                  </span>
                  <small className="text-soft">paid</small>
                </>
              )}
            </div>
          </div>
        </div>
      </PreviewAltCard>

      {/* Pending Amount */}
      <PreviewAltCard className="flex-grow-1">
        <div className="card-body d-flex ">
          <div className="bg-warning-soft rounded p-3 me-3">
            <Icon name="clock" size={24} className="text-warning" />
          </div>
          <div>
            <h6 className="title mb-1 ml-5">Pending Amount</h6>
            <div className="d-flex align-items-baseline ml-5 flex-wrap">
              {loading.bills ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span className="h4 mb-0 ml-4 mt-1 me-2">
                    ₹{filteredBills
                      .filter(b => !b.paidStatus)
                      .reduce((acc, b) => acc + (b.totalAmt || 0), 0)
                      .toLocaleString('en-IN')}
                  </span>
                  <small className="text-soft">pending</small>
                </>
              )}
            </div>
          </div>
        </div>
      </PreviewAltCard>
    </div>
  </Col>
</Row>
        </Block>

        {/* Third Row - Transaction Table */}
        <Block>
          <Row className="g-gs">
            <Col xxl="12">
              <Card className="card-bordered card-full">
                <div className="card-inner">
                  <div className="card-title-group mb-3">
                    <div className="card-title">
                      <h6 className="title">Recent Transactions</h6>
                    </div>
                    <div className="card-tools">
                      <Button tag="a" href="#!" size="sm" className="btn-outline-light">
                        View All
                      </Button>
                    </div>
                  </div>
                  <TransactionTable 
                    bills={uniqueBills.slice(0, 10)} 
                    loading={loading.bills}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Block>
      </Content>

      <Modal isOpen={modal} toggle={() => setModal(false)} className="modal-dialog-centered" size="lg">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              setModal(false);
              setSelectedDays("All");
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">Select Date Range</h5>
            <div className="mt-4">
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

              <div className="mt-4 text-right">
                <button type="button" className="btn btn-secondary mr-2" onClick={() => setModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
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