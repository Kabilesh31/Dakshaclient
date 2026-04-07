import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Content from "../../../layout/content/Content";
import html2pdf from "html2pdf.js";
import DatePicker from "react-multi-date-picker";
import Head from "../../../layout/head/Head";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import "./staff.css";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
  DataTable,
} from "../../../components/Component";
import { Modal, ModalBody, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onSearch, setOnSearch] = useState(false);
  const [pdfOrder, setPdfOrder] = useState(null);
  const itemPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeHighlight, setActiveHighlight] = useState(null);
  // New state for detailed view
  const [detailModal, setDetailModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  const modalRef = useRef();
  const hiddenPdfRef = useRef();

  const location = useLocation();
  const highlightOrderId = location.state?.highlightOrderId;
  const history = useHistory();

  
  const downloadPDF = () => {
    if (!modalRef.current) return;

    modalRef.current.classList.add("pdf-mode");

    html2pdf()
      .set({
        filename: `Order_${selectedOrder._id}.pdf`,
        margin: 0,
        html2canvas: {
          scale: 2.5,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: modalRef.current.scrollHeight,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(modalRef.current)
      .save()
      .then(() => modalRef.current.classList.remove("pdf-mode"));
  };

  const downloadOrderDirect = (order) => {
    setPdfOrder(order);

    setTimeout(() => {
      if (!hiddenPdfRef.current) return;

      hiddenPdfRef.current.classList.add("pdf-mode");

      html2pdf()
        .set({
          filename: `Order_${order._id}.pdf`,
          margin: 0,
          html2canvas: {
            scale: 2.5,
            scrollY: 0,
            windowWidth: 794,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(hiddenPdfRef.current)
        .save()
        .then(() => {
          hiddenPdfRef.current.classList.remove("pdf-mode");
          setPdfOrder(null);
        });
    }, 100);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (highlightOrderId) {
      setActiveHighlight(highlightOrderId);
      setTimeout(() => setActiveHighlight(null), 5000);
    }
  }, [highlightOrderId]);

  useEffect(() => {
    if (activeHighlight) {
      const element = document.getElementById(activeHighlight);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeHighlight]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        setOrders([]);
        setFiltered([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/bills`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      const data = Array.isArray(res.data?.bills) ? res.data.bills : [];
      setOrders(data);
      setFiltered(data);
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("sessionToken");
        window.location.href = "/login";
      }
      setOrders([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };
const dummyOrders = [
  {
    _id: "ORD001",
    customerName: "Ravi Kumar",
    createdAt: new Date(),
    totalAmt: 2500,
    orderStatus: "Work in progress",
    siteName: "Site A",
    staffDetails: { name: "Suresh", type: "Technician", mobile: "9876543210" },
    orderedProducts: [{ productName: "Cement", qty: 10, value: 200 }],
  },
  {
    _id: "ORD002",
    customerName: "Arun",
    createdAt: new Date(),
    totalAmt: 1800,
    orderStatus: "Yet to Start",
    siteName: "Site B",
    staffDetails: {},
    orderedProducts: [{ productName: "Bricks", qty: 100, value: 10 }],
  },
  {
    _id: "ORD003",
    customerName: "Karthik",
    createdAt: new Date(),
    totalAmt: 3200,
    orderStatus: "Work in progress",
    siteName: "Site C",
    staffDetails: { name: "Mani", type: "Supervisor", mobile: "9999999999" },
    orderedProducts: [{ productName: "Steel", qty: 20, value: 150 }],
  },
  {
    _id: "ORD004",
    customerName: "Vignesh",
    createdAt: new Date(),
    totalAmt: 900,
    orderStatus: "Yet to Start",
    siteName: "Site D",
    staffDetails: {},
    orderedProducts: [{ productName: "Sand", qty: 5, value: 100 }],
  },
];
  useEffect(() => {
    let data = [...orders];

    // Date filter
    if (selectedDates.length > 0) {
      const formattedDates = selectedDates.map((d) => d.format("YYYY-MM-DD"));
      data = data.filter((o) => {
        const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
        return formattedDates.includes(orderDate);
      });
    }

    // Search filter
    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (o) => o.customerName?.toLowerCase().includes(keyword) || o._id?.toLowerCase().includes(keyword)
      );
    }

    setFiltered(data);
  }, [search, selectedDates, orders]);

  const statusColor = (status) => {
    if (status === "Work in progress") return "warning";
    return "secondary"; // Yet to Start
  };

  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDates]);

  // Open detailed info modal when customer name is clicked
  const openDetailModal = (order) => {
    setDetailOrder(order);
    setDetailModal(true);
  };

  return (
    <>
      <Head title="My Orders" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Orders</BlockTitle>
            </BlockHeadContent>

            <div className="d-flex align-items-center gap-5">
              <div className="position-relative">
                <DatePicker
                  multiple
                  value={selectedDates}
                  onChange={setSelectedDates}
                  format="DD-MM-YYYY"
                  placeholder="    Select dates"
                  style={{
                    width: "160px",
                    borderRadius: "8px",
                    height: "38px",
                    fontSize: "15px",
                  }}
                  inputClass="form-control ps-3"
                />
              </div>
            </div>
          </BlockBetween>
        </BlockHead>

        <Block>
          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : (
            <DataTable className="card-stretch w-100">
              {/* SEARCH BAR */}
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools">
                    <div className="form-inline flex-nowrap gx-3">
                      <div className="form-wrap"></div>
                    </div>
                  </div>
                  <div className="card-tools mr-n1">
                    <ul className="btn-toolbar gx-1">
                      <li>
                        <a
                          href="#search"
                          onClick={(ev) => {
                            ev.preventDefault();
                            setOnSearch(true);
                          }}
                          className="btn btn-icon search-toggle"
                        >
                          <Icon name="search" />
                        </a>
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
                          setSearch("");
                          setOnSearch(false);
                        }}
                      >
                        <Icon name="arrow-left" />
                      </Button>
                      <input
                        type="text"
                        className="form-control border-transparent"
                        placeholder="Search by customer or order ID"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "auto",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #e0e0e0", textAlign: "left" }}>
                    <th className="px-3 py-2 text-center">S.No</th>
                    <th className="px-4 py-2 text-start">Date</th>
                    <th className="px-4 py-2 text-start">Customer</th>
                    <th className="px-4 py-2 text-start">Order ID</th>
                    <th className="px-4 py-2 text-end">Amount</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentItems.length > 0 &&
                    currentItems.map((order, index) => {
                      const isHighlighted = order._id === activeHighlight;
                      return (
                        <tr
                          key={order._id}
                          id={order._id}
                          className={`align-middle ${isHighlighted ? "highlight-row" : ""}`}
                          style={{
                            borderTop: "1px solid #e0e0e0",
                            borderBottom: "1px solid #e0e0e0",
                            textAlign: "left",
                          }}
                        >
                          <td className="px-3 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                          <td className="px-4 py-2 text-start">
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                fontSize: "12px",
                                fontWeight: "600",
                                backgroundColor: "#e0f2fe",
                                color: "#0369a1",
                                borderRadius: "20px",
                              }}
                            >
                              {new Date(order.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </td>
                          <td className="py-2 text-start">
                            <button
                             onClick={() =>
  history.push(`/orders/${order._id}`, {
    order,
  })
}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#0a58ca",
                                textDecoration: "underline",
                                cursor: "pointer",
                                padding: 0,
                                fontWeight: "500",
                              }}
                            >
                              {order.customerName?.charAt(0).toUpperCase() + order.customerName?.slice(1)}
                            </button>
                          </td>
                          <td className="px-4 py-2 text-start" title={order._id}>
                            #{order._id.slice(-6)}
                          </td>
                          <td className="px-4 py-2 text-end" style={{ color: "#66BB6A", fontWeight: 600 }}>
                            ₹ {order.totalAmt}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className={`tb-status text-${statusColor(order.orderStatus)}`}>
                              {order.orderStatus === "Work in progress" ? "Work in progress" : "Yet to Start"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <UncontrolledDropdown>
                              <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
                                <Icon name="more-h" />
                              </DropdownToggle>
                              <DropdownMenu right>
                                <DropdownItem onClick={() => setSelectedOrder(order)}>
                                  <Icon name="eye" /> View Details
                                </DropdownItem>
                                <DropdownItem onClick={() => downloadOrderDirect(order)}>
                                  <Icon name="download" /> Download PDF
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              <div className="card-inner">
                {currentItems.length > 0 ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <button
                      className="btn btn-icon btn-sm btn-outline-light mx-1"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      style={{ borderRadius: "6px" }}
                    >
                      <em className="icon ni ni-chevron-left"></em>
                    </button>

                    {[...Array(Math.ceil(filtered.length / itemPerPage))].map((_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === currentPage ||
                        pageNumber === currentPage - 1 ||
                        pageNumber === currentPage + 1
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`btn btn-sm mx-1 ${
                              currentPage === pageNumber ? "btn-primary" : "btn-outline-light"
                            }`}
                            style={{ minWidth: "36px", borderRadius: "6px", fontWeight: 500 }}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    })}

                    <button
                      className="btn btn-icon btn-sm btn-outline-light mx-1"
                      disabled={currentPage === Math.ceil(filtered.length / itemPerPage)}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      style={{ borderRadius: "6px" }}
                    >
                      <em className="icon ni ni-chevron-right"></em>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-silent">No data found</span>
                  </div>
                )}
              </div>
            </DataTable>
          )}
        </Block>
      </Content>

      {/* Existing Invoice Modal (for View Details) */}
      {selectedOrder && (
        <Modal isOpen={!!selectedOrder} centered size="xl" className="texting" contentClassName="order-modal">
          <ModalBody>
            <div ref={modalRef}>
              <a
                href="#close"
                className="close"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedOrder(null);
                }}
              >
                <Icon name="cross-sm" />
              </a>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h4>Retail Pulse</h4>
                  <p className="text-muted mb-0">Order Invoice</p>
                </div>
                <div className="text-end">
                  <p className="mb-1">
                    <strong>Order ID:</strong> #{selectedOrder._id.slice(-6)}
                  </p>
                  <p className="mb-1">
                    <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                  <span className={`tb-status text-${statusColor(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div className="section p-2" style={{ width: "48%" }}>
                  <h6 className="mb-1">Customer Details</h6>
                  <p className="mb-0 small">Name: {selectedOrder.customerDetails?.name || selectedOrder.customerName || "-"}</p>
                  <p className="mb-0 small">Mobile: {selectedOrder.customerDetails?.mobile || "-"}</p>
                  <p className="mb-0 small">Address: {selectedOrder.customerDetails?.address || "-"}</p>
                </div>
                <div className="section p-2" style={{ width: "48%" }}>
                  <h6 className="mb-1">Staff Details</h6>
                  <p className="mb-0 small">Name: {selectedOrder.staffDetails?.name || "Unassigned"}</p>
                  <p className="mb-0 small">Role: {selectedOrder.staffDetails?.type || "-"}</p>
                  <p className="mb-0 small">Contact: {selectedOrder.staffDetails?.mobile || "-"}</p>
                </div>
              </div>
              <div className="section">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Product Code</th>
                      <th>Products</th>
                      <th>Qty</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderedProducts?.map((item, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{item.productCode}</td>
                        <td>{item.productName}</td>
                        <td>{item.qty}</td>
                        <td>₹ {item.value}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan="5" className="text-center">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="totals d-flex justify-content-between flex-column align-items-end">
                <div className="d-flex justify-content-between w-50 mb-1">
                  <span>Subtotal</span>
                  <span>₹ {selectedOrder.totalAmt}</span>
                </div>
                <div className="d-flex justify-content-between w-50 mb-1">
                  <span>Discount</span>
                  <span>₹ {selectedOrder.discount || 0}</span>
                </div>
                <div className="d-flex justify-content-between w-50 mb-1">
                  <span>Tax</span>
                  <span>₹ {selectedOrder.tax || 0}</span>
                </div>
                <hr style={{ width: "100%" }} />
                <div className="d-flex justify-content-between w-50 fw-bold fs-5">
                  <span>Total</span>
                  <span>₹ {selectedOrder.totalAmt}</span>
                </div>
              </div>
            </div>
            <div className="text-end mt-3">
              <Button color="primary" className="mr-1" size="sm" onClick={downloadPDF}>
                <Icon name="download" />
              </Button>
            </div>
          </ModalBody>
        </Modal>
      )}

      {/* New Detailed Info Modal (Site, Staff, Stocks, Dates) */}
      <Modal isOpen={detailModal} toggle={() => setDetailModal(false)} centered size="lg">
        <ModalBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Order Details</h4>
            <Button color="link" onClick={() => setDetailModal(false)}>
              <Icon name="cross-sm" />
            </Button>
          </div>
          {detailOrder && (
            <div>
              <div className="mb-3">
                <strong>Site Name:</strong> {detailOrder.siteName || "N/A"}
              </div>
              <div className="mb-3">
                <strong>Staff Assigned:</strong>{" "}
                {detailOrder.staffDetails?.name ? (
                  <span>{detailOrder.staffDetails.name} ({detailOrder.staffDetails.type || "Staff"})</span>
                ) : (
                  "Unassigned"
                )}
              </div>
              <div className="mb-3">
                <strong>Stocks Used:</strong>
                <ul className="mt-2">
                  {detailOrder.orderedProducts?.length ? (
                    detailOrder.orderedProducts.map((p, idx) => (
                      <li key={idx}>
                        {p.productName} - {p.qty} unit(s) @ ₹{p.value}
                      </li>
                    ))
                  ) : (
                    <li>No stock information</li>
                  )}
                </ul>
              </div>
              <div className="mb-3">
                <strong>Order Date:</strong> {new Date(detailOrder.createdAt).toLocaleString()}
              </div>
              <div className="mb-3">
                <strong>Status:</strong> {detailOrder.orderStatus}
              </div>
              <div className="mb-3">
                <strong>Total Amount:</strong> ₹ {detailOrder.totalAmt}
              </div>
              <div className="text-end">
                <Button color="primary" onClick={() => setDetailModal(false)}>Close</Button>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Hidden PDF generator */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={hiddenPdfRef} className="order-invoice-pdf">
          {pdfOrder && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <div>
                  <h4 style={{ margin: 0 }}>Retail Pulse</h4>
                  <small>Order Invoice</small>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Order ID:</strong> #{pdfOrder._id.slice(-6)}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Date:</strong> {new Date(pdfOrder.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Status:</strong> {pdfOrder.orderStatus}
                  </p>
                </div>
              </div>
              <hr />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ width: "48%" }}>
                  <h6 style={{ marginBottom: "4px" }}>Customer Details</h6>
                  <p style={{ margin: "2px 0" }}><strong>Name:</strong> {pdfOrder.customerDetails?.name || pdfOrder.customerName || "-"}</p>
                  <p style={{ margin: "2px 0" }}><strong>Mobile:</strong> {pdfOrder.customerDetails?.mobile || "-"}</p>
                  <p style={{ margin: "2px 0" }}><strong>Address:</strong> {pdfOrder.customerDetails?.address || "-"}</p>
                </div>
                <div style={{ width: "48%", marginLeft: "350px" }}>
                  <h6 style={{ marginBottom: "4px" }}>Staff Details</h6>
                  <p style={{ margin: "2px 0" }}><strong>Name:</strong> {pdfOrder.staffDetails?.name || "Unassigned"}</p>
                  <p style={{ margin: "2px 0" }}><strong>Role:</strong> {pdfOrder.staffDetails?.type || "-"}</p>
                  <p style={{ margin: "2px 0" }}><strong>Mobile:</strong> {pdfOrder.staffDetails?.mobile || "-"}</p>
                </div>
              </div>
              <table width="100%" border="1" cellPadding="6" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th align="left">Products</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pdfOrder.orderedProducts?.map((p, i) => (
                    <tr key={i}>
                      <td align="center">{i + 1}</td>
                      <td>{p.productName}</td>
                      <td align="center">{p.qty}</td>
                      <td align="right">₹ {p.value}</td>
                      <td align="right">₹ {p.qty * p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: "10px", width: "100%", textAlign: "right" }}>
                <p style={{ margin: "4px 0" }}><strong>Subtotal:</strong> ₹ {pdfOrder.totalAmt}</p>
                <p style={{ margin: "4px 0" }}><strong>Discount:</strong> ₹ {pdfOrder.discount || 0}</p>
                <p style={{ margin: "4px 0" }}><strong>Tax:</strong> ₹ {pdfOrder.tax || 0}</p>
                <hr />
                <h5 style={{ margin: 0 }}><strong>Total:</strong> ₹ {pdfOrder.totalAmt}</h5>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;