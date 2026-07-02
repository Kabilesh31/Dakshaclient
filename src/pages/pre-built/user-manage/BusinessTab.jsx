import React, { useState } from 'react';
import { Icon } from '../../../components/Component';

const BusinessTab = ({ businessData, purchaseOrders, dailyWages }) => {
  const [openBizSection, setOpenBizSection] = useState('budget');
  const BRAND = "#4B5694";

  const toggleBizSection = (section) => {
    setOpenBizSection(openBizSection === section ? null : section);
  };

  const formatINR = (val) => {
    if (!val && val !== 0) return "₹0";
    return "₹" + Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const EmptyState = ({ text }) => (
    <div style={{ 
      padding: "24px", 
      background: "#fafafa", 
      borderRadius: "10px", 
      border: "1px dashed #ddd", 
      textAlign: "center", 
      color: "#aaa", 
      fontSize: "14px" 
    }}>
      {text}
    </div>
  );

  const PLAccordion = ({ 
    title, 
    icon, 
    total, 
    count, 
    isOpen, 
    onToggle, 
    children, 
    color 
  }) => {
    return (
      <div style={{
        background: "#fff",
        border: `1px solid ${isOpen ? color + "55" : "#eee"}`,
        borderRadius: "12px",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}>
        <div
          onClick={onToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            userSelect: "none",
            background: isOpen ? color + "06" : "#fff",
            transition: "background 0.18s",
          }}
        >
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: color + "15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <Icon name={icon} style={{ color: color, fontSize: "17px" }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>
              {title}
            </div>
            <div style={{
              fontSize: "12px",
              color: "#888",
              marginTop: "2px",
            }}>
              {count} {count === 1 ? 'record' : 'records'}
            </div>
          </div>

          <span style={{
            fontSize: "13px",
            fontWeight: 600,
            color: color,
            background: color + "12",
            padding: "4px 12px",
            borderRadius: "20px",
            flexShrink: 0
          }}>
            {formatINR(total)}
          </span>

          <span style={{
            color: "#aaa",
            fontSize: "18px",
            transition: "transform 0.25s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0
          }}>
            ▾
          </span>
        </div>

        <div style={{
          maxHeight: isOpen ? "600px" : "0",
          overflow: "hidden",
          transition: "maxHeight 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <div style={{ padding: "0 16px 16px" }}>
            {children}
          </div>
        </div>
      </div>
    );
  };

  const bizData = businessData;

  return (
    <>
      <h6 style={{ 
        fontWeight: 700, 
        margin: "0 0 20px 0", 
        color: "#1a1a2e", 
        fontSize: "15px" 
      }}>
        Business Overview
      </h6>
      
      {/* Summary Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "16px", 
        marginBottom: "24px" 
      }}>
        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "12px", border: "1px solid #e9ecef" }}>
          <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Total Budget
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: BRAND, marginTop: "6px" }}>
            {formatINR(bizData.totalBudget)}
          </div>
        </div>
        
        <div style={{ background: "#fff3e0", padding: "20px", borderRadius: "12px", border: "1px solid #ffe0b2" }}>
          <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Total Expenses
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#e65100", marginTop: "6px" }}>
            {formatINR(bizData.totalExpenses)}
          </div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
            {bizData.expensePercentage.toFixed(1)}% of budget
          </div>
        </div>

        <div style={{ 
          background: bizData.isProfit ? "#e8f5e9" : "#ffebee", 
          padding: "20px", 
          borderRadius: "12px", 
          border: `1px solid ${bizData.isProfit ? "#c8e6c9" : "#ffcdd2"}` 
        }}>
          <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {bizData.isProfit ? "Net Profit" : "Net Loss"}
          </div>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: 700, 
            color: bizData.isProfit ? "#2e7d32" : "#c62828", 
            marginTop: "6px" 
          }}>
            {formatINR(Math.abs(bizData.profitLoss))}
          </div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
            {bizData.isProfit ? "✅ Profitable" : "⚠️ Review expenses"}
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        
        {/* Budget Section */}
        <PLAccordion 
          title="Budget"
          icon="wallet"
          total={bizData.totalBudget}
          count={1}
          isOpen={openBizSection === 'budget'}
          onToggle={() => toggleBizSection('budget')}
          color={BRAND}
        >
          <div style={{ padding: "12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ color: "#555" }}>Total Project Budget</span>
              <span style={{ fontWeight: 700, color: BRAND, fontSize: "16px" }}>{formatINR(bizData.totalBudget)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", marginTop: "8px" }}>
              <span style={{ color: "#555" }}>Budget Utilization</span>
              <span style={{ fontWeight: 600, color: bizData.expensePercentage > 90 ? "#dc3545" : "#f59e0b" }}>
                {bizData.expensePercentage.toFixed(1)}%
              </span>
            </div>
            <div style={{ height: "8px", background: "#f0f0f0", borderRadius: "4px", marginTop: "8px", overflow: "hidden" }}>
              <div style={{ 
                height: "100%", 
                width: `${Math.min(bizData.expensePercentage, 100)}%`, 
                background: bizData.expensePercentage > 90 ? "#dc3545" : bizData.expensePercentage > 70 ? "#f59e0b" : BRAND,
                borderRadius: "4px",
                transition: "width 0.5s ease"
              }} />
            </div>
          </div>
        </PLAccordion>

        {/* Daily Wages Section */}
        <PLAccordion 
          title="Daily Wages"
          icon="users"
          total={bizData.totalWages}
          count={bizData.totalWageRecords}
          isOpen={openBizSection === 'wages'}
          onToggle={() => toggleBizSection('wages')}
          color="#e65100"
        >
          {dailyWages.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Date</th>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Employee</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Daily Salary</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Overtime</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Total</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyWages.map((record, idx) => {
                    let employeeName = 'Unknown';
                    let employeeId = 'N/A';
                    
                    if (record.employeeId) {
                      if (typeof record.employeeId === 'object' && record.employeeId.name) {
                        employeeName = record.employeeId.name;
                        employeeId = record.employeeId._id || record.employeeId;
                      } else if (typeof record.employeeId === 'string') {
                        employeeId = record.employeeId;
                      }
                    }
                    
                    if (record.employeeName) {
                      employeeName = record.employeeName;
                    }
                    
                    const empIdStr = typeof employeeId === 'string' ? employeeId : employeeId?.toString() || 'N/A';
                    
                    return (
                      <tr key={record._id || idx} style={{ borderBottom: idx < dailyWages.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        <td style={{ padding: "10px 10px", color: "#555" }}>
                          {record.date ? new Date(record.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "N/A"}
                        </td>
                        <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>
                          {employeeName}
                          <div style={{ fontSize: "11px", color: "#888" }}>
                            ID: {empIdStr.substring(0, 8) || "N/A"}
                          </div>
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                          {formatINR(record.dailySalary || 0)}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "right", color: "#e65100" }}>
                          {record.overtimeHours || 0}h
                          {record.overtimeAmount > 0 && (
                            <div style={{ fontSize: "11px", color: "#888" }}>
                              {formatINR(record.overtimeAmount)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#e65100" }}>
                          {formatINR(record.totalSalary || 0)}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "center" }}>
                          <span style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 10px",
                            borderRadius: "20px",
                            background: record.status === "present" ? "#eaf3de" : record.status === "late" ? "#faeeda" : "#fcebeb",
                            color: record.status === "present" ? "#3b6d11" : record.status === "late" ? "#854f0b" : "#a32d2d",
                          }}>
                            {capitalizeFirst(record.status || "Pending")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No wage records found." />
          )}
          <div style={{ 
            marginTop: "12px", 
            padding: "12px 14px", 
            background: "#e6510010", 
            borderRadius: "8px", 
            border: "1px solid #e6510022",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "13px", color: "#e65100", fontWeight: 600 }}>Total Wages</span>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#e65100" }}>{formatINR(bizData.totalWages)}</span>
          </div>
        </PLAccordion>

        {/* Purchase Orders Section */}
        <PLAccordion 
          title="Purchase Orders"
          icon="shopping-cart"
          total={bizData.totalPurchaseOrders}
          count={bizData.totalPurchaseOrdersCount}
          isOpen={openBizSection === 'purchase-orders'}
          onToggle={() => toggleBizSection('purchase-orders')}
          color="#dc3545"
        >
          {purchaseOrders.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>PO #</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Vendor</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Items</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Amount</th>
                  <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po, idx) => {
                  const poTotal = (po.items || []).reduce((s, item) => s + (item.quantity * item.unitPrice || item.amount || 0), 0);
                  return (
                    <tr key={po._id || idx} style={{ borderBottom: idx < purchaseOrders.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                      <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>{po.poNumber || po._id}</td>
                      <td style={{ padding: "10px 10px", color: "#555" }}>{po.vendor || po.supplierName || "N/A"}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                        {po.items?.length || 0}
                      </td>
                      <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#dc3545" }}>
                        {formatINR(poTotal)}
                      </td>
                      <td style={{ padding: "10px 10px", textAlign: "center" }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          padding: "2px 10px",
                          borderRadius: "20px",
                          background: po.status === "approved" ? "#eaf3de" : po.status === "pending" ? "#faeeda" : "#fcebeb",
                          color: po.status === "approved" ? "#3b6d11" : po.status === "pending" ? "#854f0b" : "#a32d2d",
                        }}>
                          {po.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <EmptyState text="No purchase orders found." />
          )}
          <div style={{ 
            marginTop: "12px", 
            padding: "12px 14px", 
            background: "#dc354510", 
            borderRadius: "8px", 
            border: "1px solid #dc354522",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "13px", color: "#dc3545", fontWeight: 600 }}>Total Purchase Orders</span>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#dc3545" }}>{formatINR(bizData.totalPurchaseOrders)}</span>
          </div>
        </PLAccordion>

        {/* Transportation Section */}
        <PLAccordion 
          title="Transportation"
          icon="truck"
          total={bizData.totalTransportation}
          count={bizData.transportation.length}
          isOpen={openBizSection === 'transportation'}
          onToggle={() => toggleBizSection('transportation')}
          color="#f59e0b"
        >
          {bizData.transportation.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Vendor</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Vehicle</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Date</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Amount</th>
                  <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bizData.transportation.map((item, idx) => (
                  <tr key={item._id || idx} style={{ borderBottom: idx < bizData.transportation.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                    <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>{item.vendorName || "N/A"}</td>
                    <td style={{ padding: "10px 10px", color: "#555" }}>{item.vehicleNumber || item.vehicleType || "N/A"}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                      {item.date ? new Date(item.date).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#f59e0b" }}>
                      {formatINR(item.amount || 0)}
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "center" }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 10px",
                        borderRadius: "20px",
                        background: item.status === "paid" ? "#eaf3de" : item.status === "pending" ? "#faeeda" : "#fcebeb",
                        color: item.status === "paid" ? "#3b6d11" : item.status === "pending" ? "#854f0b" : "#a32d2d",
                      }}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState text="No transportation records found." />
          )}
          <div style={{ 
            marginTop: "12px", 
            padding: "12px 14px", 
            background: "#f59e0b10", 
            borderRadius: "8px", 
            border: "1px solid #f59e0b22",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 600 }}>Total Transportation</span>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#f59e0b" }}>{formatINR(bizData.totalTransportation)}</span>
          </div>
        </PLAccordion>

        {/* Other Expenses Section */}
        <PLAccordion 
          title="Other Expenses"
          icon="more-horizontal"
          total={bizData.otherExpenses}
          count={bizData.otherExpensesItems.length}
          isOpen={openBizSection === 'other-expenses'}
          onToggle={() => toggleBizSection('other-expenses')}
          color="#6c757d"
        >
          {bizData.otherExpensesItems.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Category</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Description</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bizData.otherExpensesItems.map((item, idx) => (
                  <tr key={item._id || idx} style={{ borderBottom: idx < bizData.otherExpensesItems.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                    <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>{item.category || "Misc"}</td>
                    <td style={{ padding: "10px 10px", color: "#555" }}>{item.description || "N/A"}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#6c757d" }}>
                      {formatINR(item.amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState text="No other expenses recorded." />
          )}
          <div style={{ 
            marginTop: "12px", 
            padding: "12px 14px", 
            background: "#6c757d10", 
            borderRadius: "8px", 
            border: "1px solid #6c757d22",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: 600 }}>Total Other Expenses</span>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#6c757d" }}>{formatINR(bizData.otherExpenses)}</span>
          </div>
        </PLAccordion>
      </div>

      {/* Overall Summary */}
      <div style={{ 
        marginTop: "24px",
        background: bizData.isProfit ? BRAND : "#dc3545",
        borderRadius: "12px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#fff" }}>
          <Icon name={bizData.isProfit ? "trending-up" : "trending-down"} style={{ fontSize: "24px" }} />
          <div>
            <div style={{ fontSize: "14px", opacity: 0.9, fontWeight: 600 }}>
              Overall {bizData.isProfit ? "Profit" : "Loss"}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              {bizData.isProfit 
                ? `${bizData.profitPercentage.toFixed(1)}% profit margin` 
                : `${Math.abs(bizData.profitPercentage).toFixed(1)}% loss`}
            </div>
          </div>
        </div>
        <div style={{ 
          fontSize: "28px", 
          fontWeight: 700, 
          color: "#fff",
          background: "rgba(255,255,255,0.15)",
          padding: "4px 20px",
          borderRadius: "8px"
        }}>
          {formatINR(Math.abs(bizData.profitLoss))}
        </div>
      </div>
    </>
  );
};

export default BusinessTab;