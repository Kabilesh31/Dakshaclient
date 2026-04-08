import React, { useEffect, useState } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
import { Button } from "reactstrap";

// ✅ Complete dummy order with all fields
const DEFAULT_DUMMY_ORDER = {
  _id: "001",
  siteName: "Velan Site - 100",
  siteAddress: "123, Richie Street, Chennai",
  location: "Tamil Nadu",
  orderedBy: "Harshad",
  totalAmt: 150000,
  estimatedCost: 175000,
  orderStatus: "Work in progress",
  startDate: "2026-04-01",
  targetDate: "2026-04-30",
  staffList: [
    { name: "John", role: "Painter", mobile: "9876543210" },
    { name: "Joseph", role: "Tiles worker", mobile: "9876543211" },
  ],
  supervisor: { name: "Rajesh Kumar", mobile: "989895659" },
  orderedProducts: [
    { productName: "Cement", qty: 100, value: 400 },
    { productName: "Sand", qty: 50, value: 150 },
  ],
  progress: 45,
  notes: "All details are given.",
};

const OrderDetails = () => {
  const { state } = useLocation();
  const history = useHistory();
  const { id } = useParams();

  const [order, setOrder] = useState(() => {
if (state?.order) {
  return {
    ...DEFAULT_DUMMY_ORDER,
    ...state.order,

    // ✅ force fallback if missing
    orderedProducts:
      state.order?.orderedProducts && state.order.orderedProducts.length > 0
        ? state.order.orderedProducts
        : DEFAULT_DUMMY_ORDER.orderedProducts,

    staffList:
      state.order?.staffList && state.order.staffList.length > 0
        ? state.order.staffList
        : DEFAULT_DUMMY_ORDER.staffList,

    supervisor:
      state.order?.supervisor?.name
        ? state.order.supervisor
        : DEFAULT_DUMMY_ORDER.supervisor,
  };
}
    return null;
  });

  useEffect(() => {
    if (!order) {
      setOrder({ ...DEFAULT_DUMMY_ORDER, _id: id });
    }
    console.log("ORDER DATA:", order);
  }, [id, order]);

  if (!order) return <div className="text-center mt-5">Loading...</div>;

  const safeStaffList = order.staffList || [];
  const safeSupervisor = order.supervisor || {};
  const safeProducts = order.orderedProducts || [];

  return (
    <div className="container-fluid px-4" style={{ marginTop: "90px" }}>
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button color="secondary" size="sm" onClick={() => history.goBack()}>
          ← Back
        </Button>
      </div>

      <div className="card p-4 shadow-sm">

        {/* TITLE + STATUS */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">{order.siteName}</h5>
          <span
            className={`badge ${
              order.orderStatus === "Work in progress"
                ? "bg-warning text-dark"
                : "bg-secondary"
            }`}
          >
            {order.orderStatus}
          </span>
        </div>

        {/* BASIC INFO */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <strong>Ordered By</strong>
            <div>{order.orderedBy}</div>
          </div>

          <div className="col-md-6">
            <strong>Location</strong>
            <div>{order.location}</div>
          </div>

          <div className="col-md-6">
            <strong>Site Address</strong>
            <div>{order.siteAddress}</div>
          </div>

          <div className="col-md-6">
            <strong>Start Date</strong>
            <div>{order.startDate}</div>
          </div>

          <div className="col-md-6">
            <strong>Target Date</strong>
            <div>{order.targetDate}</div>
          </div>
        </div>

        {/* STAFF + SUPERVISOR */}
        <div className="row g-3 mb-4">
          <div className="col-md-6 mt-2">
            <strong>Supervisor</strong>
            <div className="mt-1">
              {safeSupervisor.name
                ? `${safeSupervisor.name} - ${safeSupervisor.mobile}`
                : "Not assigned"}
            </div>
          </div>

            <div className="col-md-6" style={{ marginTop: "-52px", marginBottom: "30px" }}>
                <strong>Total Staffs</strong>
                <div>{safeStaffList.length}</div>

                <ul className="mt-2 mb-0 ps-3">
                {safeStaffList.map((staff, idx) => (
                    <li key={idx}>
                    {staff.name} ({staff.role}) - {staff.mobile}
                    </li>
                ))}
                </ul>
            </div>
        </div>

        {/* COST CARDS */}
        <div className="row g-3 mb-4 text-center">
          <div className="col-md-4">
            <div className="border rounded p-3">
              <small className="text-muted">Estimated</small>
              <h6 className="mb-0">
                ₹ {(order.estimatedCost || 0).toLocaleString()}
              </h6>
            </div>
          </div>

          <div className="col-md-4">
            <div className="border rounded p-3">
              <small className="text-muted">Spent</small>
              <h6 className="mb-0">
                ₹ {(order.totalAmt || 0).toLocaleString()}
              </h6>
            </div>
          </div>

          <div className="col-md-4">
            <div className="border rounded p-3">
              <small className="text-muted">Difference</small>
              <h6 className="mb-0">
                ₹{" "}
                {(
                  (order.estimatedCost || 0) - (order.totalAmt || 0)
                ).toLocaleString()}
              </h6>
            </div>
          </div>
        </div>

        {/* MATERIALS TABLE */}
        <div className="mb-4 mt-4">
          <strong>Materials Used</strong>

          <table className="table table-bordered mt-3">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Material</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Rate (₹)</th>
                <th className="text-end">Total (₹)</th>
              </tr>
            </thead>

            <tbody>
              {safeProducts.length > 0 ? (
                safeProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{p.productName}</td>
                    <td className="text-center">{p.qty}</td>
                    <td className="text-end">₹ {p.value}</td>
                    <td className="text-end">
                      ₹ {(p.qty || 0) * (p.value || 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No materials found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* NOTES */}
        <div className="pt-3 border-top">
          <strong>Notes</strong>
          <p className="text-muted mt-2 mb-0">
            {order.notes || "No notes available"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;