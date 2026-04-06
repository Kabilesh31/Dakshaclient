import React, { useState, useEffect } from "react";
import Head from "../../../layout/head/Head";
import Content from "../../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Row,
  Col,
  Button,
  PreviewCard,
  Icon,
  BlockBetween,
} from "../../../components/Component";
import {
  Table,
  Input,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Badge,
  DropdownToggle,
  DropdownMenu,
  UncontrolledDropdown,
  DropdownItem,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

const Bills = () => {
  // ========== Dummy Data ==========
  const dummyBills = [
    {
      _id: "BILL-001",
      billNumber: "INV-2024-001",
      customerId: "CUST-101",
      customerName: "Rajesh Traders",
      customerMobile: "9876543210",
      totalAmt: 12500,
      orderStatus: "approved",
      paidStatus: true,
      createdAt: "2024-03-15T10:30:00Z",
      items: [
        { product: "Rice 5kg", qty: 10, price: 400, total: 4000 },
        { product: "Wheat Flour", qty: 5, price: 300, total: 1500 },
        { product: "Sugar 1kg", qty: 20, price: 350, total: 7000 },
      ],
      paymentMethod: "UPI",
      deliveryAddress: "123, Gandhi Road, Mumbai - 400001",
      createdBy: "Sales Staff A",
    },
    {
      _id: "BILL-002",
      billNumber: "INV-2024-002",
      customerId: "CUST-102",
      customerName: "Green Fields Agro",
      customerMobile: "9988776655",
      totalAmt: 8750,
      orderStatus: "pending",
      paidStatus: false,
      createdAt: "2024-03-16T14:20:00Z",
      items: [
        { product: "Pesticide", qty: 2, price: 1200, total: 2400 },
        { product: "Fertilizer 50kg", qty: 3, price: 1800, total: 5400 },
        { product: "Seeds", qty: 5, price: 190, total: 950 },
      ],
      paymentMethod: "Cash",
      deliveryAddress: "45, Green Park, Delhi - 110001",
      createdBy: "Sales Staff B",
    },
    {
      _id: "BILL-003",
      billNumber: "INV-2024-003",
      customerId: "CUST-103",
      customerName: "Sunrise Dairy",
      customerMobile: "9876543211",
      totalAmt: 5600,
      orderStatus: "delivered",
      paidStatus: true,
      createdAt: "2024-03-14T09:15:00Z",
      items: [
        { product: "Milk Powder", qty: 8, price: 450, total: 3600 },
        { product: "Butter", qty: 20, price: 100, total: 2000 },
      ],
      paymentMethod: "Card",
      deliveryAddress: "78, Lake View, Bangalore - 560001",
      createdBy: "Sales Staff A",
    },
    {
      _id: "BILL-004",
      billNumber: "INV-2024-004",
      customerId: "CUST-104",
      customerName: "Metro Supermarket",
      customerMobile: "9988776654",
      totalAmt: 24300,
      orderStatus: "rejected",
      paidStatus: false,
      createdAt: "2024-03-17T16:45:00Z",
      items: [
        { product: "Detergent", qty: 30, price: 250, total: 7500 },
        { product: "Soap", qty: 100, price: 40, total: 4000 },
        { product: "Oil 1L", qty: 20, price: 640, total: 12800 },
      ],
      paymentMethod: "Credit",
      deliveryAddress: "12, Mall Road, Chennai - 600001",
      createdBy: "Sales Staff C",
    },
    {
      _id: "BILL-005",
      billNumber: "INV-2024-005",
      customerId: "CUST-105",
      customerName: "Kumar Stores",
      customerMobile: "9876543212",
      totalAmt: 3500,
      orderStatus: "approved",
      paidStatus: false,
      createdAt: "2024-03-18T11:00:00Z",
      items: [
        { product: "Snacks", qty: 25, price: 80, total: 2000 },
        { product: "Cold Drinks", qty: 15, price: 100, total: 1500 },
      ],
      paymentMethod: "Cash",
      deliveryAddress: "56, Station Road, Kolkata - 700001",
      createdBy: "Sales Staff B",
    },
  ];

  // ========== State ==========
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBill, setSelectedBill] = useState(null);
  const [modal, setModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load dummy data on mount
  useEffect(() => {
    // Simulate API call
    setBills(dummyBills);
    setFilteredBills(dummyBills);
  }, []);

  // Filter bills based on search and status
  useEffect(() => {
    let result = [...bills];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((bill) => bill.orderStatus === statusFilter);
    }

    // Search filter (bill number, customer name, mobile)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (bill) =>
          bill.billNumber.toLowerCase().includes(term) ||
          bill.customerName.toLowerCase().includes(term) ||
          bill.customerMobile.includes(term)
      );
    }

    setFilteredBills(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, statusFilter, bills]);

  // ========== Pagination ==========
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ========== Handlers ==========
  const viewBillDetails = (bill) => {
    setSelectedBill(bill);
    setModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge color="success">Approved</Badge>;
      case "pending":
        return <Badge color="warning">Pending</Badge>;
      case "rejected":
        return <Badge color="danger">Rejected</Badge>;
      case "delivered":
        return <Badge color="info">Delivered</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (paidStatus) => {
    return paidStatus ? <Badge color="success">Paid</Badge> : <Badge color="danger">Unpaid</Badge>;
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <React.Fragment>
      <Head title="Bills | Invoice Management" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page tag="h3">
                Bills / Invoices
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>Manage all customer bills and invoices</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button color="primary" className="btn-icon">
                <Icon name="plus" />
                {/* <span>New Bill</span> */}
              </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <PreviewCard className="card-bordered">
            {/* Filters Row */}
            <div className="card-inner">
              <Row className="g-gs">
                <Col md="6">
                  <FormGroup>
                    <Label>Search</Label>
                    <Input
                      type="text"
                      placeholder="Search by Bill No., Customer, Mobile..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md="4">
                  <FormGroup>
                    <Label>Order Status</Label>
                    <Input
                      type="select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="delivered">Delivered</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="2" className="align-self-end">
                  <Button color="secondary" outline onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
                    <Icon name="refresh" /> Reset
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Bills Table */}
            <div className="table-responsive">
              <Table className="table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Bill No.</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount (₹)</th>
                    <th>Order Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBills.length > 0 ? (
                    currentBills.map((bill) => (
                      <tr key={bill._id}>
                        <td className="fw-bold">{bill.billNumber}</td>
                        <td>
                          {bill.customerName}
                          <br />
                          <small className="text-muted">{bill.customerMobile}</small>
                        </td>
                        <td>{formatDate(bill.createdAt)}</td>
                        <td className="fw-bold">₹{bill.totalAmt.toLocaleString("en-IN")}</td>
                        <td>{getStatusBadge(bill.orderStatus)}</td>
                        <td>{getPaymentBadge(bill.paidStatus)}</td>
                        <td>
                          <UncontrolledDropdown>
                            <DropdownToggle tag="a" className="btn btn-sm btn-icon btn-trigger">
                              <Icon name="more-h" />
                            </DropdownToggle>
                            <DropdownMenu right>
                              <DropdownItem onClick={() => viewBillDetails(bill)}>
                                <Icon name="eye" /> View Details
                              </DropdownItem>
                              <DropdownItem>
                                <Icon name="edit" /> Edit
                              </DropdownItem>
                              <DropdownItem divider />
                              <DropdownItem className="text-danger">
                                <Icon name="trash" /> Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <Icon name="file-text" size={40} className="text-soft" />
                        <p className="mt-2">No bills found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredBills.length > 0 && (
              <div className="card-inner">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBills.length)} of{" "}
                    {filteredBills.length} bills
                  </div>
                  <Pagination size="sm">
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink first onClick={() => paginate(1)} />
                    </PaginationItem>
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink previous onClick={() => paginate(currentPage - 1)} />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem active={currentPage === i + 1} key={i}>
                        <PaginationLink onClick={() => paginate(i + 1)}>{i + 1}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink next onClick={() => paginate(currentPage + 1)} />
                    </PaginationItem>
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink last onClick={() => paginate(totalPages)} />
                    </PaginationItem>
                  </Pagination>
                </div>
              </div>
            )}
          </PreviewCard>
        </Block>

        {/* Bill Details Modal */}
        <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" className="bill-modal">
          <ModalHeader toggle={() => setModal(false)}>Bill Details</ModalHeader>
          <ModalBody>
            {selectedBill && (
              <div className="bill-details">
                <div className="bill-header mb-4 pb-3 border-bottom">
                  <Row>
                    <Col md="6">
                      <h5>Invoice #{selectedBill.billNumber}</h5>
                      <p className="text-muted">Date: {formatDate(selectedBill.createdAt)}</p>
                    </Col>
                    <Col md="6" className="text-md-end">
                      <h6>Status: {getStatusBadge(selectedBill.orderStatus)}</h6>
                      <h6>Payment: {getPaymentBadge(selectedBill.paidStatus)}</h6>
                    </Col>
                  </Row>
                </div>

                <Row className="mb-4">
                  <Col md="6">
                    <strong>Customer Information</strong>
                    <p className="mb-0">{selectedBill.customerName}</p>
                    <p className="mb-0">Mobile: {selectedBill.customerMobile}</p>
                    <p className="mb-0">Delivery Address: {selectedBill.deliveryAddress}</p>
                  </Col>
                  <Col md="6" className="text-md-end">
                    <strong>Order Details</strong>
                    <p className="mb-0">Created By: {selectedBill.createdBy}</p>
                    <p className="mb-0">Payment Method: {selectedBill.paymentMethod}</p>
                  </Col>
                </Row>

                <div className="bill-items mb-4">
                  <strong>Items</strong>
                  <Table size="sm" className="mt-2">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price (₹)</th>
                        <th>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.product}</td>
                          <td>{item.qty}</td>
                          <td>{item.price.toFixed(2)}</td>
                          <td>{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan="3" className="text-end">
                          Grand Total:
                        </th>
                        <th>₹{selectedBill.totalAmt.toLocaleString("en-IN")}</th>
                      </tr>
                    </tfoot>
                  </Table>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Button color="secondary" onClick={() => setModal(false)}>
                    Close
                  </Button>
                  <Button color="primary">Download PDF</Button>
                </div>
              </div>
            )}
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default Bills;