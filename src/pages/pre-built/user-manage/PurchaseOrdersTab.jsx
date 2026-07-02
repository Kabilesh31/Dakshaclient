import React, { useState } from 'react';
import { Icon } from '../../../components/Component';

const PurchaseOrdersTab = ({ orders }) => {
  const [openId, setOpenId] = useState(null);
  const BRAND = "#4B5694";

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const formatINR = (val) => {
    if (!val && val !== 0) return "₹0";
    return "₹" + Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const STATUS_BADGE = {
    approved: { bg: "#eaf3de", color: "#3b6d11", label: "Approved" },
    pending:  { bg: "#faeeda", color: "#854f0b", label: "Pending"  },
    rejected: { bg: "#fcebeb", color: "#a32d2d", label: "Rejected" },
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

  const grandTotal = orders.reduce((sum, po) => {
    const poTotal = (po.items || []).reduce((s, item) => s + (item.quantity * item.unitPrice || item.amount || 0), 0);
    return sum + poTotal;
  }, 0);

  return (
    <>
      <h6 style={{ 
        fontWeight: 700, 
        margin: "0 0 16px 0", 
        color: "#1a1a2e", 
        fontSize: "15px" 
      }}>
        Purchase Orders
      </h6>
      {orders.length > 0 ? (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {orders.map((po) => {
              const isOpen = openId === po._id;
              const items = po.items || [];
              const poTotal = items.reduce((s, i) => s + (i.quantity * i.unitPrice || i.amount || 0), 0);
              const badge = STATUS_BADGE[po.status?.toLowerCase()] || STATUS_BADGE.pending;

              return (
                <div key={po._id}
                  style={{
                    background: "#fff",
                    border: `1px solid ${isOpen ? BRAND + "55" : "#eee"}`,
                    borderRadius: "12px", 
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div
                    onClick={() => toggle(po._id)}
                    style={{
                      display: "flex", 
                      alignItems: "center", 
                      gap: "12px",
                      padding: "14px 16px", 
                      cursor: "pointer", 
                      userSelect: "none",
                      background: isOpen ? BRAND + "06" : "#fff",
                      transition: "background 0.18s",
                    }}
                  >
                    <div style={{ 
                      width: "36px", 
                      height: "36px", 
                      borderRadius: "8px", 
                      background: BRAND + "15", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      flexShrink: 0 
                    }}>
                      <Icon name="file-text" style={{ color: BRAND, fontSize: "17px" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>
                        {po.poNumber || po._id}
                      </div>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#888", 
                        marginTop: "2px", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis", 
                        whiteSpace: "nowrap" 
                      }}>
                        {po.vendor || po.supplierName || "Vendor"}
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: 600, 
                      padding: "3px 10px", 
                      borderRadius: "20px", 
                      background: badge.bg, 
                      color: badge.color, 
                      flexShrink: 0 
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ 
                      fontSize: "13px", 
                      fontWeight: 600, 
                      color: BRAND, 
                      background: BRAND + "12", 
                      padding: "4px 12px", 
                      borderRadius: "20px", 
                      flexShrink: 0 
                    }}>
                      {formatINR(poTotal)}
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
                      {items.length > 0 ? (
                        <table style={{ 
                          width: "100%", 
                          borderCollapse: "collapse", 
                          fontSize: "13px", 
                          tableLayout: "fixed" 
                        }}>
                          <colgroup>
                            <col style={{ width: "40%" }} />
                            <col style={{ width: "20%" }} />
                            <col style={{ width: "20%" }} />
                            <col style={{ width: "20%" }} />
                          </colgroup>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                              {["Item", "Qty", "Unit Price", "Amount"].map((h, i) => (
                                <th key={h} style={{ 
                                  padding: "6px 8px 10px", 
                                  fontSize: "11px", 
                                  fontWeight: 600, 
                                  color: "#aaa", 
                                  textTransform: "uppercase", 
                                  letterSpacing: "0.5px", 
                                  textAlign: i > 0 ? "right" : "left" 
                                }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => {
                              const amount = item.quantity * item.unitPrice || item.amount || 0;
                              return (
                                <tr key={item._id || idx} style={{ 
                                  borderBottom: idx < items.length - 1 ? "1px solid #f5f5f5" : "none" 
                                }}>
                                  <td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                                    <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "13px" }}>
                                      {item.name || item.itemName}
                                    </div>
                                    {item.category && (
                                      <span style={{ 
                                        fontSize: "11px", 
                                        color: "#888", 
                                        background: "#f5f5f5", 
                                        padding: "2px 8px", 
                                        borderRadius: "20px", 
                                        display: "inline-block", 
                                        marginTop: "3px" 
                                      }}>
                                        {item.category}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ 
                                    padding: "10px 8px", 
                                    textAlign: "right", 
                                    color: "#555", 
                                    verticalAlign: "top" 
                                  }}>
                                    {item.quantity} {item.unit || ""}
                                  </td>
                                  <td style={{ 
                                    padding: "10px 8px", 
                                    textAlign: "right", 
                                    color: "#555", 
                                    verticalAlign: "top" 
                                  }}>
                                    {formatINR(item.rate || 0)}
                                  </td>
                                  <td style={{ 
                                    padding: "10px 8px", 
                                    textAlign: "right", 
                                    fontWeight: 600, 
                                    color: "#1a1a2e", 
                                    verticalAlign: "top" 
                                  }}>
                                    {formatINR(amount)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ 
                          padding: "16px", 
                          background: "#fafafa", 
                          borderRadius: "8px", 
                          textAlign: "center", 
                          color: "#bbb", 
                          fontSize: "13px" 
                        }}>
                          No items found for this order.
                        </div>
                      )}
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between", 
                        marginTop: "12px", 
                        padding: "12px 14px", 
                        background: BRAND + "10", 
                        borderRadius: "8px", 
                        border: `1px solid ${BRAND}22` 
                      }}>
                        <div style={{ 
                          fontSize: "13px", 
                          color: BRAND, 
                          fontWeight: 600, 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "6px" 
                        }}>
                          <Icon name="calculator" /> Order Total
                        </div>
                        <div style={{ 
                          fontSize: "17px", 
                          fontWeight: 700, 
                          color: BRAND 
                        }}>
                          {formatINR(poTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {orders.length > 0 && (
            <div style={{ 
              marginTop: "16px", 
              background: BRAND, 
              borderRadius: "12px", 
              padding: "16px 20px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between" 
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                color: "rgba(255,255,255,0.85)", 
                fontSize: "14px", 
                fontWeight: 600 
              }}>
                <Icon name="report-money" style={{ fontSize: "18px", color: "#fff" }} /> 
                Total Purchase Order Value
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
                {formatINR(grandTotal)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState text="No purchase orders found for this project." />
      )}
    </>
  );
};

export default PurchaseOrdersTab;