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
import axios from "axios";
const Homepage = () => {
  
    const [sm, updateSm] = useState(false);
    const [customerData, setCustomerData] = useState([]);
    const [staffData, setStaffData] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [filterCustomerType, setFilterCustomerType] = useState([]);
    const [billData, setBillData] = useState([]);
    const [amount, setAmount] = useState([])
    const [selectedDays, setSelectedDays] = useState("All")
    const [customSelected, setCustomSelected] = useState(false)
    const [modal, setModal] = useState(false);
    const [selectedFromDate, setSelectedFromDate] = useState('');
    const [selectedToDate, setSelectedToDate] = useState('');

    localStorage.setItem("isGridView", false);

    useEffect(() => {
      if (customerData.length === 0) {
        getTransparencyList();
      }
    }, [customerData]);
  
    useEffect(() => {
      if (staffData.length === 0) {
        fetchStaffData();
      }
    }, [staffData]);
  
    useEffect(() => { 
      if (billData.length === 0) {
        getBillData();
      }
    }, []);
    

    useEffect(() => { 
      if (amount.length === 0) {
        getAmountDatas();
      }
    }, []);

    const fetchStaffData = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/staff");
        setStaffData(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    const getAmountDatas = async() => {
      try{
        const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/bill/totalAmounts/all");
        if(response.status === 200){
          setAmount(response.data.data)
        }
      }catch(err){  
          console.log(err)
      }
    }
  
    const getBillData = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/bill");
        setBillData(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    const filteredBill = billData.filter((item, index, self) => 
      index === self.findIndex((t) => t.invoiceNo === item.invoiceNo)
    )
    
    const getTransparencyList = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/customer");
        const resData = await response.json();
        if (response.ok) {
          setCustomerData(resData.data);
          setFilterCustomerType(resData.data); // Set default to show all customers
        } else {
          console.log("Error fetching customer data");
        }
      } catch (err) {
        console.log(err);
      }
    };
  
    const handleStaffSelection = (staff) => {
      if (staff === null) {
        setSelectedStaff("All");
        setSelectedStaffId(null); 
      } else {
        setSelectedStaff(staff.name);
        setSelectedStaffId(staff._id);
      }
    
   
      const filteredByStaff = staff === null
        ? customerData 
        : customerData.filter((item) => item.staff === staff._id);
    
        setFilterCustomerType(filteredByStaff);
      };
    
    const handleDateSubmit = () => {
    // Handle the date submission here
    console.log('From Date:', selectedFromDate);
    console.log('To Date:', selectedToDate);
    setCustomSelected(true);   // keep true for filtering
    setModal(false);
  };

      
  

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    const currentYearCutomers = customerData.filter(customer => {
      const createdAt = new Date(customer.createdAt);
      return createdAt.getFullYear() === currentYear;
    });

    const currentMonthCustomers = customerData.filter(customer => {
      const createdAt = new Date(customer.createdAt);
      return createdAt.getFullYear() === currentYear && createdAt.getMonth() === currentMonth;
  });
  
  
    const today = new Date();
    const currentDayOfWeek = today.getDay(); 

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1)); // Adjust for Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);


    const currentWeekCustomers = customerData.filter(customer => { 
      const createdAt = new Date(customer.createdAt);
      return createdAt >= startOfWeek && createdAt <= endOfWeek;
    });


  // amount filters


      const filterByDate = (data) => {
      if (!customSelected && selectedDays === "All") {
        return data; // no filter
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
        return data.filter(item => new Date(item.createdAt) >= startDate);
      }

      // Custom date filter
      if (customSelected && selectedFromDate && selectedToDate) {
        const from = new Date(selectedFromDate); // yyyy-mm-dd
        const to = new Date(selectedToDate);
        to.setHours(23, 59, 59, 999); // include entire "to" day
        return data.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= from && createdAt <= to;
        });
      }

      return data;
    };

  const filteredAmount = filterByDate(amount);

  const totalAmount = filteredAmount.reduce(
    (acc, amt) => acc + (amt.totalAmount || 0),
    0
  );

  const paidTotalAmount = filteredAmount
    .filter(amt => amt.isPaid === true)
    .reduce((acc, amt) => acc + (amt.totalAmount || 0), 0);

  const unpaidTotalAmount = filteredAmount
    .filter(amt => amt.isPaid === false)
    .reduce((acc, amt) => acc + (amt.totalAmount || 0), 0);
  

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
                <p>Welcome to KO CHAI</p>
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
                                    handleStaffSelection(null); // For "All", pass null or a special value
                                  }}
                                  href="#dropdownitem"
                                >
                                  <span>All</span>
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
      setCustomSelected(false); // reset
    }}
  >
    <span>All</span>
  </DropdownItem>
</li>

<li>
  <DropdownItem
    tag="a"
    href="#!"
    onClick={(ev) => {
      ev.preventDefault();
      setSelectedDays("7 Days");
      setCustomSelected(false); // reset
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
      setCustomSelected(false); // reset
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
      setCustomSelected(true); // only here it's true
      setModal(true);
    }}
  >
    <span>Custom</span>
  </DropdownItem>
</li>

                          </ul>
                          
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                    {/* <li className="nk-block-tools-opt">
                      <Button color="primary">
                        <Icon name="reports" />
                        <span>Reports</span>
                      </Button>
                    </li> */}
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

          <Block>
          <Row className="g-gs">
            <Col xxl="6">
              <Row className="g-gs">
                <Col lg="4" xxl="12">
                  <Row className="g-gs">
                    <Col sm="4" lg="12" xxl="4">
                      <PreviewAltCard>
                        <AvgSubscription value={Math.floor(totalAmount)} title = "Total Revenue"/>
                      </PreviewAltCard>
                    </Col>
                    
                  </Row>
                </Col>
                <Col lg="4" xxl="12">
                  <Row className="g-gs">
                    <Col sm="4" lg="12" xxl="4">
                      <PreviewAltCard>
                        <AvgSubscription value={Math.floor(paidTotalAmount)} title = "Paid Amount"/>
                      </PreviewAltCard>
                    </Col>
                  </Row>
                </Col>
                <Col lg="4" xxl="12">
                  <Row className="g-gs">
                    <Col sm="4" lg="12" xxl="4">
                      <PreviewAltCard>
                        <AvgSubscription value={Math.floor(unpaidTotalAmount)} title= "Pending Amount"/>
                      </PreviewAltCard>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>


          </Row>
        </Block>

        <Block>
          <Row className="g-gs">
            <Col xxl="6">
              <Row className="g-gs">
                <Col lg="6" xxl="12">
                  <PreviewCard>
                  <TrafficDougnut 
                    selectedDays={selectedDays} 
                    selectedFromDate={selectedFromDate} 
                    selectedToDate={selectedToDate}   
                    data={filteredBill}
                    />
             
                  </PreviewCard>
                </Col>
                <Col lg="6" xxl="12">
                  <Row className="g-gs">
                    <Col sm="6" lg="12" xxl="6">
                      <PreviewAltCard>
                       <ActiveUser data={filterCustomerType}  currentWeekCustomers={currentWeekCustomers} currentMonthCustomers={currentMonthCustomers} currentYearCutomers={currentYearCutomers} type={true}/>
                      </PreviewAltCard>
                    </Col>
                  
                  </Row>
                </Col>
              </Row>
            </Col>
            
            {/* <Col md={12}>
              <PreviewCard>
                <div className="card-head">
                  <h6 className="title">Staff Sales Preview</h6>
                </div>
                <div className="nk-ck-sm">
                  <LineChartExample legend={false} data={straightLineChart} />
                </div>
              </PreviewCard>
            </Col> */}

           

            <Col xxl="8">
              <Card className="card-bordered card-full">
                <TransactionTable />
              </Card>
            </Col>

          
            {/* <Col xxl="4" md="6">
              <Card className="card-bordered card-full">
                <RecentActivity />
              </Card>
            </Col> */}
            {/* <Col xxl="4" md="6">
              <Card className="card-bordered card-full">
                <NewsUsers />
              </Card>
            </Col> */}
            {/* <Col lg="6" xxl="4">
              <Card className="card-bordered h-100">
                <Support />
              </Card>
            </Col> */}
            {/* <Col lg="6" xxl="4">
              <Card className="card-bordered h-100">
                <Notifications />
              </Card>
            </Col> */}
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
              setSelectedDays("All")
              // onFormCancel();
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">Select the Date</h5>
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
                      min={selectedFromDate} // Prevent selecting to date before from date
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-right">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDateSubmit}
                  disabled={!selectedFromDate || !selectedToDate}
                >
                  Submit
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
