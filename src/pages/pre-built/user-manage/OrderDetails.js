import React, { useEffect, useState } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";

// Complete dummy order with all fields
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
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state?.order) {
      setOrder({
        ...DEFAULT_DUMMY_ORDER,
        ...state.order,
        orderedProducts: state.order?.orderedProducts?.length > 0 
          ? state.order.orderedProducts 
          : DEFAULT_DUMMY_ORDER.orderedProducts,
        staffList: state.order?.staffList?.length > 0 
          ? state.order.staffList 
          : DEFAULT_DUMMY_ORDER.staffList,
        supervisor: state.order?.supervisor?.name 
          ? state.order.supervisor 
          : DEFAULT_DUMMY_ORDER.supervisor,
      });
    } else {
      setOrder({ ...DEFAULT_DUMMY_ORDER, _id: id });
    }
    setLoading(false);
  }, [id, state]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-container">
        <p>Order not found</p>
        <button onClick={() => history.goBack()}>Go Back</button>
      </div>
    );
  }

  const safeStaffList = order.staffList || [];
  const safeSupervisor = order.supervisor || {};
  const safeProducts = order.orderedProducts || [];
  const difference = (order.estimatedCost || 0) - (order.totalAmt || 0);
  const isUnderBudget = difference >= 0;

  const getStatusClass = (status) => {
    switch(status) {
      case "Work in progress": return "status-badge status-in-progress";
      case "Completed": return "status-badge status-completed";
      case "Pending": return "status-badge status-pending";
      case "On Hold": return "status-badge status-on-hold";
      default: return "status-badge status-in-progress";
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case "Work in progress": return "In Progress";
      case "Completed": return "Completed";
      case "Pending": return "Pending";
      case "On Hold": return "On Hold";
      default: return status;
    }
  };

  return (
    <div style={styles.container}>
      <style>{styles.innerStyles}</style>
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => history.goBack()} style={styles.backButton}>
            ← Back
          </button>
          <div style={styles.headerRight}>
            <span style={styles.orderId}>Order #{order._id}</span>
            <span className={getStatusClass(order.orderStatus)}>
              {getStatusText(order.orderStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Site Title */}
        <div style={styles.titleSection}>
          <h1 style={styles.siteTitle}>{order.siteName}</h1>
          <p style={styles.siteAddress}>{order.siteAddress}</p>
        </div>

        {/* Info Grid */}
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>

            <div>
              <p style={styles.infoLabel}>Ordered By</p>
              <p style={styles.infoValue}>{order.orderedBy}</p>
            </div>
          </div>

          <div style={styles.infoCard}>
        
            <div>
              <p style={styles.infoLabel}>Location</p>
              <p style={styles.infoValue}>{order.location}</p>
            </div>
          </div>

          <div style={styles.infoCard}>
         
            <div>
              <p style={styles.infoLabel}>Start Date</p>
              <p style={styles.infoValue}>{order.startDate}</p>
            </div>
          </div>

          <div style={styles.infoCard}>
            {/* <div style={styles.infoIcon}>🎯</div> */}
            <div>
              <p style={styles.infoLabel}>Target Date</p>
              <p style={styles.infoValue}>{order.targetDate}</p>
            </div>
          </div>

          <div style={styles.infoCard}>
            {/* <div style={styles.infoIcon}>👨‍💼</div> */}
            <div>
              <p style={styles.infoLabel}>Supervisor</p>
              <p style={styles.infoValue}>
                {safeSupervisor.name ? `${safeSupervisor.name} - ${safeSupervisor.mobile}` : "Not assigned"}
              </p>
            </div>
          </div>
        </div>

        {/* Staff Section */}
        <div style={styles.staffSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Staff Members</h3>
            <span style={styles.staffCount}>{safeStaffList.length} total</span>
          </div>
          <div style={styles.staffList}>
            {safeStaffList.map((staff, idx) => (
              <div key={idx} style={styles.staffItem}>
                <div>
                  <p style={styles.staffName}>{staff.name}</p>
                  <p style={styles.staffRole}>{staff.role}</p>
                </div>
                <div style={styles.staffMobile}>{staff.mobile}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span>Progress</span>
            <span style={styles.progressPercent}>{order.progress || 0}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${order.progress || 0}%` }} />
          </div>
        </div>

        {/* Cost Cards */}
        <div style={styles.costGrid}>
          <div style={styles.costCard}>
            <p style={styles.costLabel}>Estimated Cost</p>
            <p style={styles.costValue}>₹ {(order.estimatedCost || 0).toLocaleString()}</p>
          </div>
          <div style={styles.costCard}>
            <p style={styles.costLabel}>Total Spent</p>
            <p style={styles.costValue}>₹ {(order.totalAmt || 0).toLocaleString()}</p>
          </div>
          <div style={{ ...styles.costCard, ...(isUnderBudget ? styles.costPositive : styles.costNegative) }}>
            <p style={styles.costLabel}>Difference</p>
            <p style={styles.costValue}>
              {isUnderBudget ? "↓" : "↑"} ₹ {Math.abs(difference).toLocaleString()}
              <span style={styles.costBadge}>{isUnderBudget ? "Under Budget" : "Over Budget"}</span>
            </p>
          </div>
        </div>

        {/* Materials Table */}
        <div style={styles.tableSection}>
          <div style={styles.sectionHeader}>
          
            <h3 style={styles.sectionTitle}>Materials Used</h3>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Material</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Rate (₹)</th>
                  <th style={styles.th}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {safeProducts.length > 0 ? (
                  safeProducts.map((product, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={styles.td}>Cement</td>
                      <td style={styles.td}>{product.qty}</td>
                      <td style={styles.td}>₹ {product.value}</td>
                      <td style={styles.td}>₹ {(product.qty || 0) * (product.value || 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.emptyTable}>No materials found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        {order.notes && (
          <div style={styles.notesSection}>
            <div style={styles.sectionHeader}>
  
              <h3 style={styles.sectionTitle}>Notes</h3>
            </div>
            <p style={styles.notesText}>{order.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button style={styles.editButton}>Edit Order</button>
          <button style={styles.downloadButton}>Download Report</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #e0e0e0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#666",
    transition: "all 0.2s",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  orderId: {
    fontSize: "14px",
    color: "#999",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
  },
  titleSection: {
    marginBottom: "24px",
  },
  siteTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 8px 0",
  },
  siteAddress: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  infoCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  infoIcon: {
    fontSize: "24px",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#999",
    margin: "0 0 4px 0",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    margin: 0,
  },
  staffSection: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    marginBottom: "24px",
    overflow: "hidden",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "16px 20px",
    backgroundColor: "#fafafa",
    borderBottom: "1px solid #e0e0e0",
  },
  sectionIcon: {
    fontSize: "18px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
    flex: 1,
  },
  staffCount: {
    fontSize: "12px",
    color: "#999",
  },
  staffList: {
    padding: "16px 20px",
  },
  staffItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  staffName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    margin: "0 0 4px 0",
  },
  staffRole: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },
  staffMobile: {
    fontSize: "13px",
    color: "#666",
  },
  progressSection: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    padding: "20px",
    marginBottom: "24px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "14px",
    color: "#666",
  },
  progressPercent: {
    fontWeight: "600",
    color: "#e2c418",
  },
  progressBar: {
    height: "8px",
    backgroundColor: "#e0e0e0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#e2c418",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  costGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  costCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    padding: "20px",
    textAlign: "center",
  },
  costPositive: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  costNegative: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  costLabel: {
    fontSize: "13px",
    color: "#999",
    margin: "0 0 8px 0",
  },
  costValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  costBadge: {
    display: "block",
    fontSize: "11px",
    marginTop: "6px",
    fontWeight: "normal",
  },
  tableSection: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    marginBottom: "24px",
    overflow: "hidden",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    backgroundColor: "#fafafa",
    borderBottom: "1px solid #e0e0e0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#666",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
    color: "#333",
  },
  emptyTable: {
    padding: "40px",
    textAlign: "center",
    color: "#999",
  },
  notesSection: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    marginBottom: "24px",
    overflow: "hidden",
  },
  notesText: {
    padding: "20px",
    margin: 0,
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },
  editButton: {
    padding: "10px 24px",
    backgroundColor: "#e2c418",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  downloadButton: {
    padding: "10px 24px",
    backgroundColor: "#fff",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  innerStyles: `
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-in-progress {
      background-color: #fef3c7;
      color: #d97706;
    }
    .status-completed {
      background-color: #d1fae5;
      color: #059669;
    }
    .status-pending {
      background-color: #fee2e2;
      color: #dc2626;
    }
    .status-on-hold {
      background-color: #fed7aa;
      color: #ea580c;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 16px;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #e2c418;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 16px;
    }
    .error-container button {
      padding: 8px 16px;
      background-color: #e2c418;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    button:hover {
      opacity: 0.9;
    }
    .staff-item:last-child {
      border-bottom: none;
    }
  `,
};

export default OrderDetails;