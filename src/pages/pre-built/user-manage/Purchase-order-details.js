import React, { useState, useEffect } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
} from "../../../components/Component";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

/* ---------- DUMMY ITEM DATABASE ---------- */
const dummyItemDatabase = [
  { itemCode: "CUT-4INCH", itemName: '4" CUTTING WHEEL', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "CUT-4INCH-HW", itemName: '4" CUTTING WHEEL, HARDWARES', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "CUT-14INCH", itemName: '14" CUTTING WHEEL', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "PRIMER-20L", itemName: "PRIMER 20 LTR", uom: "LTR", warehouse: "Stores - SD" },
  { itemCode: "THINNER-5L", itemName: "THINNER 5 LTR", uom: "LTR", warehouse: "Stores - SD" },
  { itemCode: "GS-8.6-045-GRAY", itemName: '8\'6" GALVANIZED SHEET [0.45MM] GRAY COLOUR', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "GS-17.6-045", itemName: '17\'6" GALVANIZED SHEET [0.45MM]', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "TS-6x3.6-1.5-CLEAR", itemName: 'TRANSPARENT SHEET 6\'x3\'6" [1.5MM]', uom: "SQM", warehouse: "Stores - SD" },
  { itemCode: "CEMENT-50KG", itemName: "CEMENT 50KG BAG", uom: "BAG", warehouse: "Stores - SD" },
  { itemCode: "STEEL-12MM", itemName: "STEEL ROD TMT 12MM", uom: "KG", warehouse: "Stores - SD" },
  { itemCode: "SAND-RIVER", itemName: "RIVER SAND", uom: "TON", warehouse: "Stores - SD" },
  { itemCode: "BRICKS-1000", itemName: "BRICKS (1000 PCS)", uom: "PKT", warehouse: "Stores - SD" },
  { itemCode: "PAINT-PRIMER", itemName: "PAINT PRIMER 20 LTR", uom: "LTR", warehouse: "Stores - SD" },
  { itemCode: "PAINT-WHITE", itemName: "WHITE PAINT 10 LTR", uom: "LTR", warehouse: "Stores - SD" },
];

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();
  const [orderData, setOrderData] = useState(location.state?.orderData || null);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [supplierModal, setSupplierModal] = useState(false);

  // Autocomplete states
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeAutocompleteIndex !== null) {
        if (!event.target.closest('[data-autocomplete-dropdown]') && !event.target.closest('[data-autocomplete-input]')) {
          setActiveAutocompleteIndex(null);
          setSuggestions([]);
          setActiveSuggestionIndex(-1);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeAutocompleteIndex]);

  // Start editing
  const startEditing = () => {
    setEditedItems(JSON.parse(JSON.stringify(orderData.items || [])));
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedItems([]);
    setIsEditing(false);
    setActiveAutocompleteIndex(null);
    setSuggestions([]);
  };

  // Handle item change in edit mode
  const handleItemEdit = (index, field, value) => {
    const updated = [...editedItems];
    updated[index][field] = value;
    setEditedItems(updated);
  };

  // Handle item code change with autocomplete
  const handleItemCodeChange = (index, value) => {
    handleItemEdit(index, "itemCode", value);
    
    if (value && value.trim().length > 0) {
      const filtered = dummyItemDatabase.filter(
        (item) =>
          item.itemCode?.toLowerCase().includes(value.toLowerCase()) ||
          item.itemName?.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setActiveAutocompleteIndex(index);
      setActiveSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setActiveAutocompleteIndex(null);
      setActiveSuggestionIndex(-1);
    }
  };

  // Select suggestion and auto-fill
  const selectSuggestion = (index, item) => {
    const updated = [...editedItems];
    updated[index] = {
      ...updated[index],
      itemCode: item.itemCode,
      itemName: item.itemName,
      uom: item.uom,
      warehouse: item.warehouse || updated[index].warehouse,
    };
    setEditedItems(updated);
    setSuggestions([]);
    setActiveAutocompleteIndex(null);
    setActiveSuggestionIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e, index) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        selectSuggestion(index, suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveAutocompleteIndex(null);
      setActiveSuggestionIndex(-1);
    }
  };

  // Add new row in edit mode
  const addEditRow = () => {
    setEditedItems([
      ...editedItems,
      { no: editedItems.length + 1, itemCode: "", itemName: "", requiredBy: "", quantity: 0, uom: "", rate: 0, warehouse: "Stores - SD" },
    ]);
  };

  // Remove row in edit mode
  const removeEditRow = (index) => {
    if (editedItems.length <= 1) return;
    const updated = editedItems.filter((_, i) => i !== index);
    // Re-number items
    setEditedItems(updated.map((item, i) => ({ ...item, no: i + 1 })));
  };

  // Save edits
  const saveEdits = () => {
    const updatedItems = editedItems.map((item, idx) => ({
      ...item,
      no: idx + 1,
      amount: (item.quantity || 0) * (item.rate || 0),
    }));
    const newGrandTotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    setOrderData({
      ...orderData,
      items: updatedItems,
      grandTotal: newGrandTotal,
    });
    setIsEditing(false);
    setEditedItems([]);
    setActiveAutocompleteIndex(null);
    setSuggestions([]);
  };

  // CSV Download function
  const downloadCSV = () => {
    if (!orderData || !orderData.items || orderData.items.length === 0) return;

    let csvContent = "";
    const headers = ["S.No", "Item Code", "Item Name", "Required By", "Quantity", "UOM", "Rate (INR)", "Amount (INR)"];
    csvContent += headers.join(",") + "\n";

    csvContent += `\n"Purchase Order:","${orderData._id || id}"\n`;
    csvContent += `"Supplier:","${orderData.supplierName || ""}"\n`;
    csvContent += `"Status:","${orderData.status || ""}"\n`;
    csvContent += `"Date:","${orderData.date || ""}"\n`;
    csvContent += `"Required By:","${orderData.requiredBy || ""}"\n`;
    csvContent += `"Mode of Payment:","${orderData.modeOfPayment || ""}"\n`;
    csvContent += `"Terms of Payment:","${orderData.termsOfPayment || ""}"\n`;
    csvContent += `"Apply Tax Withholding:","${orderData.applyTaxWithholding ? 'Yes' : 'No'}"\n`;
    csvContent += `"Is Reverse Charge:","${orderData.isReverseCharge ? 'Yes' : 'No'}"\n`;
    csvContent += `"Is Subcontracted:","${orderData.isSubcontracted ? 'Yes' : 'No'}"\n`;
    csvContent += `"Grand Total:","${orderData.grandTotal || 0}"\n\n`;

    csvContent += headers.join(",") + "\n";
    orderData.items.forEach((item, index) => {
      const row = [
        item.no || index + 1,
        `"${(item.itemCode || "").replace(/"/g, '""')}"`,
        `"${(item.itemName || "").replace(/"/g, '""')}"`,
        item.requiredBy || "",
        item.quantity || 0,
        `"${(item.uom || "").replace(/"/g, '""')}"`,
        item.rate || 0,
        (item.quantity || 0) * (item.rate || 0),
      ];
      csvContent += row.join(",") + "\n";
    });

    const totalQty = orderData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    csvContent += `\n"Total Quantity:","${totalQty}"\n`;
    csvContent += `"Grand Total:","${orderData.grandTotal || 0}"\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Purchase_Order_${orderData._id || id}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!orderData) {
    return (
      <>
        <Head title="Purchase Order Details" />
        <Content>
          <Block>
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#fef3e0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Icon name="alert-circle" style={{ fontSize: "36px", color: "#f5a623" }} />
              </div>
              <h4 style={{ marginBottom: "8px", fontWeight: 600, color: "#1e293b" }}>No Order Data Found</h4>
              <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "0.95rem" }}>The purchase order information could not be loaded.</p>
              <Button color="primary" onClick={() => history.push("/purchase-order")}>
                <Icon name="arrow-left" /> Back to Purchase Orders
              </Button>
            </div>
          </Block>
        </Content>
      </>
    );
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case "To Receive and Bill":
        return { bg: "#eff6ff", color: "#1e40af", border: "1px solid #93c5fd", dot: "#3b82f6" };
      case "Completed":
        return { bg: "#ecfdf5", color: "#065f46", border: "1px solid #6ee7b7", dot: "#10b981" };
      case "Cancelled":
        return { bg: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", dot: "#ef4444" };
      default:
        return { bg: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d", dot: "#f59e0b" };
    }
  };

  const statusStyle = getStatusStyles(orderData.status);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);
  };

  const displayItems = isEditing ? editedItems : (orderData.items || []);
  const totalItems = displayItems.length;
  const totalQuantity = displayItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const grandTotal = isEditing 
    ? editedItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0)
    : orderData.grandTotal;

  const supplierDetails = {
    name: orderData.supplierName || "N/A",
    address: "123, MG Road, Chennai - 600001",
    contact: "9876543210",
    email: "supplier@example.com",
    gstin: "33AAAAA0000A1Z5",
    pan: "AAAAA0000A",
  };

  const checkboxStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "#374151",
  };

  const getItemDisplayName = (item) => {
    if (item.itemName) return item.itemName;
    const found = dummyItemDatabase.find(db => db.itemCode === item.itemCode);
    return found ? found.itemName : "-";
  };

  return (
    <>
      <Head title={`Purchase Order ${id}`} />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <div className="d-flex align-items-center gap-3">
                <BlockTitle tag="h3" style={{ marginBottom: 0 }}>
                  Purchase Order
                </BlockTitle>
                <span
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: statusStyle.border,
                    padding: "4px 14px",
                    borderRadius: "20px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    marginLeft: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: statusStyle.dot, display: "inline-block" }} />
                  {orderData.status}
                </span>
              </div>
            </BlockHeadContent>
            <div className="d-flex align-items-center gap-2">
              <Button color="light" outline onClick={() => history.push("/purchase-order")}>
                <Icon name="arrow-left" /> Back
              </Button>
              {isEditing ? (
                <>
                  <Button color="secondary" size="sm" onClick={cancelEditing}>
                    <Icon name="cross" /> Cancel
                  </Button>
                  <Button color="success" size="sm" onClick={saveEdits}>
                    <Icon name="check-circle" /> Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button color="warning" outline size="sm" onClick={startEditing}>
                    <Icon name="edit" /> Edit Items
                  </Button>
                  <UncontrolledDropdown>
                    <DropdownToggle style={{padding:"20px"}} tag="button"  className="btn p-3 btn-primary d-flex align-items-center gap-1" style={{ borderRadius: "4px", padding: "6px 14px", fontSize: "0.85rem" }}>
                      <Icon name="download" />
                      <span >Download</span>
                      <Icon name="chevron-down" style={{ fontSize: "12px", marginLeft: "2px" }} />
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem onClick={downloadCSV}>
                        <Icon name="file" className="me-2" /> Download as CSV
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </>
              )}
            </div>
          </BlockBetween>
        </BlockHead>

        <Block>
          <div className="card-inner">
            {/* Order ID and Supplier Info */}
            <div style={{ marginBottom: "28px", paddingBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "8px", fontFamily: "monospace", fontWeight: 500 }}>
                {id}
              </div>
              <h5 style={{ fontWeight: 600, color: "#111827", lineHeight: "1.5", marginBottom: "16px", wordBreak: "break-word" }}>
                Purchase Order -{" "}
                <button
                  onClick={() => setSupplierModal(true)}
                  style={{
                    background: "none", border: "none", color: "#2563eb", cursor: "pointer",
                    fontWeight: 600, textDecoration: "underline", padding: 0, fontSize: "inherit",
                  }}
                >
                  {orderData.supplierName}
                </button>
              </h5>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.87rem", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon name="calendar" style={{ fontSize: "14px", color: "#6b7280" }} />
                  <span style={{ color: "#6b7280" }}>Date:</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>{formatDate(orderData.date)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon name="calendar-check" style={{ fontSize: "14px", color: "#6b7280" }} />
                  <span style={{ color: "#6b7280" }}>Required By:</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>{formatDate(orderData.requiredBy)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon name="credit-card" style={{ fontSize: "14px", color: "#6b7280" }} />
                  <span style={{ color: "#6b7280" }}>Payment:</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>{orderData.modeOfPayment || "-"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon name="file-text" style={{ fontSize: "14px", color: "#6b7280" }} />
                  <span style={{ color: "#6b7280" }}>Terms:</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>{orderData.termsOfPayment || "-"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon name="layers" style={{ fontSize: "14px", color: "#6b7280" }} />
                  <span style={{ color: "#6b7280" }}>Series:</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>{orderData.series || "-"}</span>
                </div>
              </div>

              {/* Checkboxes Display */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div style={checkboxStyle}>
                  <span style={{
                    width: "18px", height: "18px", borderRadius: "4px", border: "2px solid #d1d5db",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: orderData.applyTaxWithholding ? "#3b82f6" : "#fff",
                    borderColor: orderData.applyTaxWithholding ? "#3b82f6" : "#d1d5db",
                  }}>
                    {orderData.applyTaxWithholding && <Icon name="check-thick" style={{ fontSize: "10px", color: "#fff" }} />}
                  </span>
                  <span>Apply Tax Withholding Amount (TDS)</span>
                </div>
                <div style={checkboxStyle}>
                  <span style={{
                    width: "18px", height: "18px", borderRadius: "4px", border: "2px solid #d1d5db",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: orderData.isReverseCharge ? "#3b82f6" : "#fff",
                    borderColor: orderData.isReverseCharge ? "#3b82f6" : "#d1d5db",
                  }}>
                    {orderData.isReverseCharge && <Icon name="check-thick" style={{ fontSize: "10px", color: "#fff" }} />}
                  </span>
                  <span>Is Reverse Charge</span>
                </div>
                <div style={checkboxStyle}>
                  <span style={{
                    width: "18px", height: "18px", borderRadius: "4px", border: "2px solid #d1d5db",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: orderData.isSubcontracted ? "#3b82f6" : "#fff",
                    borderColor: orderData.isSubcontracted ? "#3b82f6" : "#d1d5db",
                  }}>
                    {orderData.isSubcontracted && <Icon name="check-thick" style={{ fontSize: "10px", color: "#fff" }} />}
                  </span>
                  <span>Is Subcontracted</span>
                </div>
              </div>

              <div style={{ padding: "16px 20px", backgroundColor: "#ecfdf5", borderRadius: "8px", border: "1px solid #6ee7b7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", color: "#065f46", fontWeight: 500 }}>Grand Total</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#065f46" }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Items Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h6 style={{ fontWeight: 600, color: "#111827", marginBottom: 0, fontSize: "0.95rem" }}>
                Items {isEditing && <span style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: 500, marginLeft: "8px" }}>(Editing Mode)</span>}
              </h6>
              <span style={{ fontSize: "0.82rem", color: "#6b7280", backgroundColor: "#f9fafb", padding: "4px 12px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                {totalItems} item{totalItems !== 1 ? "s" : ""} • Total Qty: {totalQuantity}
              </span>
            </div>

            {/* Items Table */}
            <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "visible", marginBottom: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: "#374151", width: "60px" }}>No</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", minWidth: "160px" }}>Item Code</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", minWidth: "180px" }}>Item Name</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "140px" }}>Required By</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: "#374151", width: "100px" }}>Quantity</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "80px" }}>UOM</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#374151", width: "110px" }}>Rate (INR)</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#374151", width: "130px" }}>Amount (INR)</th>
                    {isEditing && <th style={{ padding: "12px 8px", textAlign: "center", fontWeight: 600, color: "#374151", width: "50px" }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {displayItems.length > 0 ? (
                    displayItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < displayItems.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <td style={{ padding: "10px 16px", textAlign: "center", color: "#6b7280", fontWeight: 500, verticalAlign: "middle" }}>
                          {item.no || idx + 1}
                        </td>
                        <td style={{ padding: "10px 16px", position: "relative", verticalAlign: "middle" }}>
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={item.itemCode || ""}
                                onChange={(e) => handleItemCodeChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                onFocus={() => {
                                  if (item.itemCode && item.itemCode.trim().length > 0) {
                                    handleItemCodeChange(idx, item.itemCode);
                                  }
                                }}
                                placeholder="Search item code..."
                                autoComplete="off"
                                style={{ fontSize: "0.82rem" }}
                                data-autocomplete-input="true"
                                onClick={(e) => e.stopPropagation()}
                              />
                              {activeAutocompleteIndex === idx && suggestions.length > 0 && (
                                <div
                                  data-autocomplete-dropdown="true"
                                  style={{
                                    position: "absolute", top: "100%", left: "16px", right: "16px",
                                    backgroundColor: "#fff", border: "1px solid #d1d5db",
                                    borderRadius: "0 0 8px 8px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                    zIndex: 99999, maxHeight: "200px", overflowY: "auto", marginTop: "-1px",
                                  }}
                                >
                                  {suggestions.map((suggestion, sIdx) => (
                                    <div
                                      key={sIdx}
                                      onMouseDown={(e) => { e.preventDefault(); selectSuggestion(idx, suggestion); }}
                                      style={{
                                        padding: "10px 14px", cursor: "pointer",
                                        backgroundColor: sIdx === activeSuggestionIndex ? "#eff6ff" : "#fff",
                                        borderBottom: sIdx < suggestions.length - 1 ? "1px solid #f3f4f6" : "none",
                                      }}
                                      onMouseEnter={() => setActiveSuggestionIndex(sIdx)}
                                    >
                                      <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.85rem", marginBottom: "2px" }}>{suggestion.itemCode}</div>
                                      <div style={{ color: "#6b7280", fontSize: "0.78rem" }}>{suggestion.itemName}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <code style={{ backgroundColor: "#f9fafb", padding: "3px 8px", borderRadius: "4px", fontSize: "0.82rem", color: "#374151", border: "1px solid #e5e7eb" }}>
                              {item.itemCode || "-"}
                            </code>
                          )}
                        </td>
                        <td style={{ padding: "10px 16px", wordBreak: "break-word", color: "#111827", fontWeight: 500, verticalAlign: "middle" }}>
                          {isEditing ? (
                            <input type="text" className="form-control form-control-sm" value={item.itemName || ""} onChange={(e) => handleItemEdit(idx, "itemName", e.target.value)} style={{ fontSize: "0.82rem" }} onClick={(e) => e.stopPropagation()} />
                          ) : (
                            getItemDisplayName(item)
                          )}
                        </td>
                        <td style={{ padding: "10px 16px", color: "#374151", verticalAlign: "middle" }}>
                          {isEditing ? (
                            <div style={{ position: "relative" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm date-input-hidden"
                                value={item.requiredBy ? formatDate(item.requiredBy) : ""}
                                readOnly
                                placeholder="Select date"
                                style={{ fontSize: "0.82rem", cursor: "pointer", backgroundColor: "#fff" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Trigger the hidden date input
                                  const hiddenInput = e.currentTarget.nextSibling;
                                  if (hiddenInput) {
                                    hiddenInput.showPicker ? hiddenInput.showPicker() : hiddenInput.click();
                                  }
                                }}
                              />
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={item.requiredBy || ""}
                                onChange={(e) => handleItemEdit(idx, "requiredBy", e.target.value)}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  opacity: 0,
                                  cursor: "pointer",
                                  zIndex: 1,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          ) : (
                            formatDate(item.requiredBy)
                          )}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "center", color: "#111827", fontWeight: 600, verticalAlign: "middle" }}>
                          {isEditing ? (
                            <input type="number" className="form-control form-control-sm" value={item.quantity || ""} onChange={(e) => handleItemEdit(idx, "quantity", parseFloat(e.target.value) || 0)} style={{ fontSize: "0.82rem", width: "80px", textAlign: "center" }} onClick={(e) => e.stopPropagation()} />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td style={{ padding: "10px 16px", verticalAlign: "middle" }}>
                          {isEditing ? (
                            <input type="text" className="form-control form-control-sm" value={item.uom || ""} onChange={(e) => handleItemEdit(idx, "uom", e.target.value)} style={{ fontSize: "0.82rem", width: "70px" }} onClick={(e) => e.stopPropagation()} />
                          ) : (
                            <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 500 }}>
                              {item.uom || "-"}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "right", color: "#374151", fontFamily: "monospace", verticalAlign: "middle" }}>
                          {isEditing ? (
                            <input type="number" className="form-control form-control-sm" value={item.rate || ""} onChange={(e) => handleItemEdit(idx, "rate", parseFloat(e.target.value) || 0)} style={{ fontSize: "0.82rem", width: "90px", textAlign: "right" }} onClick={(e) => e.stopPropagation()} />
                          ) : (
                            formatCurrency(item.rate)
                          )}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#059669", fontFamily: "monospace", verticalAlign: "middle" }}>
                          {formatCurrency((item.quantity || 0) * (item.rate || 0))}
                        </td>
                        {isEditing && (
                          <td style={{ padding: "10px 4px", textAlign: "center", verticalAlign: "middle" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeEditRow(idx); }}
                              style={{
                                background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                                padding: "4px 6px", borderRadius: "4px",
                              }}
                              title="Remove row"
                              disabled={editedItems.length <= 1}
                            >
                              <Icon name="trash" style={{ fontSize: "16px", opacity: editedItems.length <= 1 ? 0.3 : 1 }} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isEditing ? 9 : 8} style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>
                        <div style={{ marginBottom: "8px" }}><Icon name="inbox" style={{ fontSize: "28px", color: "#d1d5db" }} /></div>
                        No items found in this order
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {isEditing && (
              <div className="mb-3">
                <Button color="light" size="sm" onClick={addEditRow}>
                  <Icon name="plus" /> Add Row
                </Button>
              </div>
            )}

            {displayItems.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", gap: "40px" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Total Items: </span>
                    <span style={{ fontWeight: 600, color: "#111827" }}>{totalItems}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Total Quantity: </span>
                    <span style={{ fontWeight: 600, color: "#111827" }}>{totalQuantity}</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.9rem", color: "#6b7280", marginRight: "12px" }}>Grand Total:</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#059669" }}>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </Block>
      </Content>

      {/* Supplier Details Modal */}
      <Modal isOpen={supplierModal} toggle={() => setSupplierModal(false)} centered size="md">
        <ModalHeader toggle={() => setSupplierModal(false)}>Supplier Details</ModalHeader>
        <ModalBody>
          <div style={{ padding: "10px 0" }}>
            <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #e5e7eb" }}>
              <h5 style={{ fontWeight: 600, color: "#111827", marginBottom: "4px" }}>{supplierDetails.name}</h5>
              <span style={{ fontSize: "0.8rem", color: "#6b7280", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: "4px" }}>Supplier</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <Label style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "2px" }}>Address</Label>
                <p style={{ fontSize: "0.9rem", color: "#111827", margin: 0 }}>{supplierDetails.address}</p>
              </div>
              <div className="row">
                <div className="col-6">
                  <Label style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "2px" }}>Contact</Label>
                  <p style={{ fontSize: "0.9rem", color: "#111827", margin: 0 }}>{supplierDetails.contact}</p>
                </div>
                <div className="col-6">
                  <Label style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "2px" }}>Email</Label>
                  <p style={{ fontSize: "0.9rem", color: "#111827", margin: 0, wordBreak: "break-all" }}>{supplierDetails.email}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <Label style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "2px" }}>GSTIN</Label>
                  <p style={{ fontSize: "0.9rem", color: "#111827", margin: 0, fontFamily: "monospace" }}>{supplierDetails.gstin}</p>
                </div>
                <div className="col-6">
                  <Label style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "2px" }}>PAN</Label>
                  <p style={{ fontSize: "0.9rem", color: "#111827", margin: 0, fontFamily: "monospace" }}>{supplierDetails.pan}</p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <style>{`
        .date-input-hidden::-webkit-calendar-picker-indicator {
          display: none;
        }
        .date-input-hidden {
          -webkit-appearance: none;
        }
      `}</style>
    </>
  );
};

export default PurchaseOrderDetails;