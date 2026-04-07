    import React, { useEffect, useState } from "react";
    import { useLocation, useHistory, useParams } from "react-router-dom";
    import { Button } from "reactstrap";

    const OrderDetails = () => {
    const { state } = useLocation();
    const history = useHistory();
    const { id } = useParams();

    const [order, setOrder] = useState(state?.order || null);

    useEffect(() => {
        if (!order) {
        const dummyOrders = [
  {
    _id: "ORD001",
    siteName: "Sunrise Villa Project",
    location: "Chennai, Tamil Nadu",
    totalAmt: 250000,
    estimatedCost: 270000,
    orderStatus: "Work in progress",
    startDate: "2026-04-01",
    targetDate: "2026-04-20",

    staffDetails: {
      name: "Suresh Kumar",
      type: "Site Engineer",
      mobile: "9876543210",
    },

    supervisor: {
      name: "Mani",
      mobile: "9999999999",
    },

    orderedProducts: [
      { productName: "Cement", qty: 100, value: 400 },
      { productName: "Sand", qty: 50, value: 150 },
      { productName: "Steel Rod", qty: 30, value: 800 },
    ],

    progress: 65,

    notes: "Foundation completed. Column work in progress.",
  },
];
        const found = dummyOrders.find((o) => o._id === id);
        setOrder(found);
        }
    }, [id, order]);

    if (!order) return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container-fluid px-4" style={{ marginTop: "90px" }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
            {/* <h3>Order #{order._id}</h3> */}
            {/* <span
                className={`badge ${
                order.orderStatus === "Work in progress"
                    ? "bg-warning"
                    : "bg-secondary"
                }`}
            >
                {order.orderStatus}
            </span> */}
            </div>
            <Button color="primary" onClick={() => history.goBack()}>
            Back
            </Button>
        </div>

      <div className="row g-4">
  {/* SITE INFO */}
  <div className="col-md-6 d-flex">
    <div className="card p-3 shadow-sm h-100 w-100">
      <h5>🏗 Site Information</h5>
      <p><strong>Site Name:</strong> {order.siteName}</p>
      <p><strong>Location:</strong> {order.location || "N/A"}</p>
    </div>
  </div>

  {/* STAFF */}
  <div className="col-md-6 d-flex">
    <div className="card p-3 shadow-sm h-100 w-100">
      <h5>👷 Staff Assigned</h5>
      {order.staffDetails?.name ? (
        <p>
          {order.staffDetails.name} ({order.staffDetails.type})
        </p>
      ) : (
        <p>Unassigned</p>
      )}
    </div>
  </div>

  {/* TIMELINE */}
  <div className="col-md-6 d-flex">
    <div className="card p-3 shadow-sm h-100 w-100">
      <h5>📅 Timeline</h5>
      <p><strong>Start Date:</strong> {order.startDate}</p>
      <p><strong>Target Date:</strong> {order.targetDate}</p>
    </div>
  </div>

  {/* COST */}
  <div className="col-md-6 d-flex">
    <div className="card p-3 shadow-sm h-100 w-100">
      <h5>💰 Cost Summary</h5>
      <p><strong>Total Amount:</strong> ₹ {order.totalAmt}</p>
    </div>
  </div>

  {/* STOCKS */}
  <div className="col-12 d-flex">
    <div className="card p-3 shadow-sm h-100 w-100">
      <h5>📦 Stocks Used</h5>
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.orderedProducts?.map((p, i) => (
            <tr key={i}>
              <td>{p.productName}</td>
              <td>{p.qty}</td>
              <td>₹ {p.value}</td>
              <td>₹ {p.qty * p.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
        </div>
    );
    };

    export default OrderDetails;