import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Content from "../../../layout/content/Content";
import html2pdf from "html2pdf.js";
import Head from "../../../layout/head/Head";
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
import {
  Modal,
  ModalBody,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
const [onSearch, setOnSearch] = useState(false);


  const modalRef = useRef();

const downloadPDF = () => {
  if (!modalRef.current) return;

  modalRef.current.classList.add("pdf-mode");

  html2pdf()
    .set({
      filename: `Order_${selectedOrder._id}.pdf`,
      margin: 0,
      html2canvas: {
        scale: 2.5,          // 👈 optimal for A4 (sharp + correct size)
        scrollY: 0,
        windowWidth: 794     // A4 width in px
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      }
    })
    .from(modalRef.current)
    .save()
    .then(() => modalRef.current.classList.remove("pdf-mode"));
};


  useEffect(() => {
     
    fetchOrders();
  }, []);

 const fetchOrders = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/bills`);
    const data = Array.isArray(res.data.bills) ? res.data.bills : [];
    // ✅ Store as-is, including customerDetails & staffDetails
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

  // Status filter
  if (statusFilter !== "all") {
    data = data.filter(o => o.orderStatus === statusFilter);
  }

  // Search filter (Customer name OR Order ID)
  if (search.trim()) {
    const keyword = search.toLowerCase();
    data = data.filter(o =>
      o.customerName?.toLowerCase().includes(keyword) ||
      o._id?.toLowerCase().includes(keyword)
    );
  }

  setFiltered(data);
}, [search, statusFilter, orders]);


  // Change order status
  const changeStatus = async (id, status) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_BACKENDURL}/api/bills/${id}/status`,
        { orderStatus: status }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, orderStatus: status } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = (s) =>
    s === "approved" ? "success" : s === "rejected" ? "danger" : "warning";

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

            {/* STATUS FILTER */}
            <div className="btn-group btn-group-sm">
              {["all", "pending", "approved", "rejected"].map(s => (
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
    <tr style={{ borderBottom: "1px solid #e0e0e0", textAlign: "center" }}>
      <th className="px-4 py-2 text-start">Customer</th>
      <th className="px-4 py-2 text-start">Order ID</th>
      
      <th className="px-4 py-2 text-end">Amount</th>
      <th className="px-4 py-2 text-center">Status</th>
      <th className="px-4 py-2 text-center">Actions</th>
    </tr>
  </thead>

  {/* Table Body */}
  <tbody>
    {filtered?.map(order => (
      <tr
        key={order._id}
        className="align-middle"
        style={{ borderTop: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0",textAlign: "center" }}
      >
        <td className=" py-2 text-start">{order.customerName}</td>
        <td className="px-4 py-2 text-start">#{order._id}</td>
        
        <td className="px-4 py-2 text-end">₹ {order.totalAmt}</td>
        <td className="px-4 py-2 text-center">
          <span className={`tb-status text-${statusColor(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
        </td>
        <td className="px-4 py-2 text-center">
          <UncontrolledDropdown>
            <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
              <Icon name="more-h" />
            </DropdownToggle>
            <DropdownMenu right>
              {order.orderStatus === "pending" && (
                <>
                  <DropdownItem onClick={() => changeStatus(order._id, "approved")}>
                    <Icon name="check-circle" /> Approve
                  </DropdownItem>
                  <DropdownItem onClick={() => changeStatus(order._id, "rejected")}>
                    <Icon name="cross-circle" /> Reject
                  </DropdownItem>
                </>
              )}
              <DropdownItem onClick={() => setSelectedOrder(order)}>
                <Icon name="eye" /> View Details
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
      </tr>
    ))}
  </tbody>
</table>

            </DataTable>
            
          )}
        </Block>
      </Content>

{selectedOrder && (
 <Modal isOpen={!!selectedOrder} centered size="lg"  contentClassName="order-modal">
<ModalBody>
  <div ref={modalRef}  > 
    <a
      href="#close"
      className="close"
      onClick={(e) => { e.preventDefault(); setSelectedOrder(null); }}
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
    <strong>Date:</strong>{" "}
    {new Date(selectedOrder.createdAt).toLocaleDateString()}
  </p>
  <span
    className={`tb-status text-${statusColor(selectedOrder.orderStatus)}`}
  >
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
    <p className="mb-0 small">
      Mobile: {selectedOrder.customerDetails?.mobile || "-"}
    </p>
    <p className="mb-0 small">
      Address: {selectedOrder.customerDetails?.address || "-"}
    </p>
  </div>

  <div className="section p-2" style={{ width: "48%" }}>
    <h6 className="mb-1">Staff Details</h6>
    <p className="mb-0 small">
      Name: {selectedOrder.staffDetails?.name || "Unassigned"}
    </p>
    <p className="mb-0 small">
      Role: {selectedOrder.staffDetails?.type || "-"}
    </p>
    <p className="mb-0 small">
      Contact: {selectedOrder.staffDetails?.mobile || "-"}
    </p>
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
              <td colSpan="5" className="text-center">No products found</td>
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
  </div> {/* ✅ end of ref wrapper */}
  

  {/* PDF Button */}
  <div className="text-end mt-3">
    <Button color="primary" size="sm" onClick={downloadPDF}>
      <Icon name="download" /> Download PDF
    </Button>
  </div>
</ModalBody>

</Modal>

)}

    </>
  );
};

export default Orders;
