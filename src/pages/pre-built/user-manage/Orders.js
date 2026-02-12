import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Content from "../../../layout/content/Content";
import html2pdf from "html2pdf.js";
import DatePicker from "react-multi-date-picker";
import Head from "../../../layout/head/Head";
import "./staff.css";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  PaginationComponent,
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onSearch, setOnSearch] = useState(false);
  const [pdfOrder, setPdfOrder] = useState(null);
  const itemPerPage = 10;
const [currentPage, setCurrentPage] = useState(1);
const [confirmModal, setConfirmModal] = useState(false);
const [actionType, setActionType] = useState(null); 
const [actionOrderId, setActionOrderId] = useState(null);


  const modalRef = useRef();
  const hiddenPdfRef = useRef();

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
        setPdfOrder(null); // cleanup
      });
  }, 100); // 👈 allow DOM to render
};

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/bills`);
      const data = Array.isArray(res.data.bills) ? res.data.bills : [];

      setOrders(data);
      setFiltered(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

 useEffect(() => {
  let data = [...orders];

  // STATUS FILTER
  if (statusFilter !== "all") {
    data = data.filter((o) => o.orderStatus === statusFilter);
  }

  // DATE FILTER
 if (selectedDates.length > 0) {
  const formattedDates = selectedDates.map((d) =>
    d.format("YYYY-MM-DD")
  );

  data = data.filter((o) => {
    const orderDate = new Date(o.createdAt)
      .toISOString()
      .split("T")[0];

    return formattedDates.includes(orderDate);
  });
}


  // SEARCH FILTER
  if (search.trim()) {
    const keyword = search.toLowerCase();
    data = data.filter(
      (o) =>
        o.customerName?.toLowerCase().includes(keyword) ||
        o._id?.toLowerCase().includes(keyword)
    );
  }

  setFiltered(data);
}, [search, statusFilter, selectedDates, orders]);

const openConfirmModal = (id, type) => {
  setActionOrderId(id);
  setActionType(type);
  setConfirmModal(true);
};

const confirmAction = async () => {
  if (!actionOrderId || !actionType) return;

  try {
    await changeStatus(actionOrderId, actionType);
    setConfirmModal(false);
    setActionOrderId(null);
    setActionType(null);
  } catch (err) {
    console.error(err);
  }
};

 const changeStatus = async (id, status) => {
  try {
    const res = await axios.patch(
      `${process.env.REACT_APP_BACKENDURL}/api/bills/${id}/status`,
      { orderStatus: status }
    );

    setOrders((prev) =>
      prev.map((o) =>
        o._id === id ? { ...o, orderStatus: status } : o
      )
    );

    return true; // ✅ important
  } catch (err) {
    console.error(err);
    return false; // ✅ important
  }
};


  const statusColor = (s) => {
  if (s === "approved") return "success";
  if (s === "rejected") return "danger";
  if (s === "delivered") return "primary";
  return "warning"; // pending
};


const indexOfLastItem = currentPage * itemPerPage;
const indexOfFirstItem = indexOfLastItem - itemPerPage;

const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
useEffect(() => {
  setCurrentPage(1);
}, [search, statusFilter, selectedDates]);
const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Head title="My Orders" />
      <Content>
        {/* HEADER */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3"> Orders</BlockTitle>
              
            </BlockHeadContent>

          
            <div className="d-flex align-items-center gap-5">
<div className="position-relative">
 
  <DatePicker
  multiple
  value={selectedDates}
  onChange={setSelectedDates}
  format="YYYY-MM-DD"
   placeholder="Select dates"
  style={{
    width: "110px",
    borderRadius: "8px",
    border: "1px solid #dbdfea",
    height: "31px",
    fontSize: "14px",
  }}
  inputClass="form-control form-control-sm ps-5"
/>

</div>

 

    {/* STATUS FILTER */}
    <div className="btn-group btn-group-sm ml-3">
      {["all", "pending", "approved", "rejected"].map((s) => (
        <Button
          key={s}
          color={statusFilter === s ? "primary" : "light"}
          className="px-3"
          onClick={() => setStatusFilter(s)}
        >
          {s.toUpperCase()}
        </Button>
      ))}
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
                      {/* SEARCH ICON */}
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

                {/* SEARCH BAR */}
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
                {/* Table Header */}
                <thead>
                  <tr style={{ borderBottom: "1px solid #e0e0e0", textAlign: "left" }}>
                     <th className="px-3 py-2 text-center">S.No</th>
                    <th className="px-4 py-2 text-start">Date</th>
                    <th className="px-4 py-2 text-start">Customer</th>
                    <th className="px-4 py-2 text-start">Order ID</th>
                    {/* <th className="px-4 py-2 text-center">Products</th> */}

                    <th className="px-4 py-2 text-end">Amount</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                    
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                 {currentItems.length > 0 ? (
  currentItems.map((order, index) => (
                    <tr
                      key={order._id}
                      className="align-middle"
                      style={{ borderTop: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0", textAlign: "left" }}
                    >
                      <td className="px-3 py-2 text-center">
      {indexOfFirstItem + index + 1}
    </td>
                      
                      <td className="px-4 py-2 text-start">
        {new Date(order.createdAt).toLocaleDateString("en-IN")}
      </td>
                      <td className=" py-2 text-start">{order.customerName}</td>
                     <td
  className="px-4 py-2 text-start"
  title={order._id}
>
  #{order._id.slice(0, 4)}...{order._id.slice(-4)}
</td>
{/* <td className="px-4 py-2 text-center">
  {order.orderedProducts?.length || 0}
</td> */}

                    <td
  className="px-4 py-2 text-end"
  style={{ color: "#66BB6A", fontWeight: 600 }}
>
  ₹ {order.totalAmt}
</td>

                      <td className="px-4 py-2 text-center">
                        <span className={`tb-status text-${statusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <UncontrolledDropdown>
                          <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
                            <Icon name="more-h" />
                          </DropdownToggle>
                          <DropdownMenu right>
                            {order.orderStatus === "pending" && (
                              <>
                               <DropdownItem onClick={() => openConfirmModal(order._id, "approved")}>
                                  <Icon name="check-circle" /> Approve
                                </DropdownItem>
                                <DropdownItem onClick={() => openConfirmModal(order._id, "rejected")}>

                                  <Icon name="cross-circle" /> Reject
                                </DropdownItem>
                              </>
                            )}
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
                      ))
) : (
  <tr>
    <td colSpan="6" className="text-center py-4 text-muted">
      No orders found for selected date
    </td>
  </tr>
)}

                  
                </tbody>
              </table>
              <div className="card-inner">
  {currentItems.length > 0 ? (
    <PaginationComponent
      itemPerPage={itemPerPage}
      totalItems={filtered.length}
      paginate={paginate}
      currentPage={currentPage}
    />
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

      {selectedOrder && (
        <Modal isOpen={!!selectedOrder} centered size="lg" contentClassName="order-modal">
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

              {/* HEADER */}
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

              {/* CUSTOMER & STAFF */}
              <div className="d-flex justify-content-between mb-2">
                <div className="section p-2" style={{ width: "48%" }}>
                  <h6 className="mb-1">Customer Details</h6>
                  <p className="mb-0 small">
                    Name: {selectedOrder.customerDetails?.name || selectedOrder.customerName || "-"}
                  </p>
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

              {/* PRODUCT TABLE */}
              <div className="section">
                <table>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderedProducts?.map((item, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{item.productName}</td>
                        <td>{item.qty}</td>
                        <td>₹ {item.value}</td>
                        <td>₹ {item.qty * item.value}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                  
                </table>
              </div>

              {/* TOTALS */}
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

            {/* PDF Button */}
            <div className="text-end mt-3">
              <Button color="primary" size="sm" onClick={downloadPDF}>
                <Icon name="download" /> Download PDF
              </Button>
            </div>
          </ModalBody>
        </Modal>
      )}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
  <div ref={hiddenPdfRef} className="order-invoice-pdf">
    {pdfOrder && (
      <>
        {/* HEADER */}
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
              <strong>Date:</strong>{" "}
              {new Date(pdfOrder.createdAt).toLocaleDateString("en-IN")}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Status:</strong>{" "}
              <span style={{ textTransform: "capitalize" }}>
                {pdfOrder.orderStatus}
              </span>
            </p>
          </div>
        </div>

        <hr />

        {/* CUSTOMER & STAFF */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          {/* CUSTOMER */}
          <div style={{ width: "48%" }}>
            <h6 style={{ marginBottom: "4px" }}>Customer Details</h6>
            <p style={{ margin: "2px 0" }}>
              <strong>Name:</strong>{" "}
              {pdfOrder.customerDetails?.name || pdfOrder.customerName || "-"}
            </p>
            <p style={{ margin: "2px 0" }}>
              <strong>Mobile:</strong>{" "}
              {pdfOrder.customerDetails?.mobile || "-"}
            </p>
            <p style={{ margin: "2px 0" }}>
              <strong>Address:</strong>{" "}
              {pdfOrder.customerDetails?.address || "-"}
            </p>
          </div>

          {/* STAFF */}
          <div style={{ width: "48%" }}>
            <h6 style={{ marginBottom: "4px" }}>Staff Details</h6>
            <p style={{ margin: "2px 0" }}>
              <strong>Name:</strong>{" "}
              {pdfOrder.staffDetails?.name || "Unassigned"}
            </p>
            <p style={{ margin: "2px 0" }}>
              <strong>Role:</strong>{" "}
              {pdfOrder.staffDetails?.type || "-"}
            </p>
            <p style={{ margin: "2px 0" }}>
              <strong>Mobile:</strong>{" "}
              {pdfOrder.staffDetails?.mobile || "-"}
            </p>
          </div>
        </div>

        {/* PRODUCT TABLE */}
        <table
          width="100%"
          border="1"
          cellPadding="6"
          style={{ borderCollapse: "collapse", marginTop: "10px" }}
        >
          <thead>
            <tr>
              <th>#</th>
              <th align="left">Product</th>
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

        {/* TOTALS */}
        <div style={{ marginTop: "10px", width: "100%", textAlign: "right" }}>
          <p style={{ margin: "4px 0" }}>
            <strong>Subtotal:</strong> ₹ {pdfOrder.totalAmt}
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Discount:</strong> ₹ {pdfOrder.discount || 0}
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Tax:</strong> ₹ {pdfOrder.tax || 0}
          </p>
          <hr />
          <h5 style={{ margin: 0 }}>
            <strong>Total:</strong> ₹ {pdfOrder.totalAmt}
          </h5>
        </div>
      </>
    )}
  </div>
</div>
<Modal isOpen={confirmModal} centered>
  <ModalBody className="text-center p-4">
    <h5 className="mb-3">
      {actionType === "approved"
        ? "Confirm Order Approval"
        : "Confirm Order Rejection"}
    </h5>

    <p>
      Are you sure you want to{" "}
      <strong>
        {actionType === "approved" ? "approve" : "reject"}
      </strong>{" "}
      this order?
    </p>

    <div className="d-flex justify-content-center gap-2 mt-4">
      <Button
        color="light"
        onClick={() => setConfirmModal(false)}
      >
        Cancel
      </Button>

      <Button
        color={actionType === "approved" ? "success" : "danger"}
        onClick={confirmAction}
      >
        Yes, {actionType === "approved" ? "Approve" : "Reject"}
      </Button>
    </div>
  </ModalBody>
</Modal>


    </>
  );
};

export default Orders;
