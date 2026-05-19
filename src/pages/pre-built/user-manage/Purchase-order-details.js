import React, { useState, useEffect, useRef } from "react";
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
  Label,
  Spinner,
} from "reactstrap";

// ---------- API BASE URL (change to your backend port) ----------
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

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

/* ---------- Helper: Convert YYYY-MM-DD to DD-MM-YYYY ---------- */
const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

/* ---------- Helper: Convert DD-MM-YYYY to YYYY-MM-DD ---------- */
const convertToYYYYMMDD = (dateStr) => {
  if (!dateStr) return "";
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
  const [day, month, year] = dateStr.split("-");
  if (day && month && year) {
    return `${year}-${month}-${day}`;
  }
  return "";
};

/* ---------- AMOUNT TO WORDS ---------- */
function amountToWords(amount) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10] + " ";
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred " + convert(n % 100);
    if (n < 100000) return convert(Math.floor(n / 1000)) + "Thousand " + convert(n % 1000);
    if (n < 10000000) return convert(Math.floor(n / 100000)) + "Lakh " + convert(n % 100000);
    return convert(Math.floor(n / 10000000)) + "Crore " + convert(n % 10000000);
  }

  const num = Math.floor(amount);
  const paise = Math.round((amount - num) * 100);
  let result = "INR " + (convert(num).trim() || "Zero");
  if (paise > 0) result += " and " + convert(paise).trim() + " Paise";
  result += " Only";
  return result;
}

/* ---------- PRINT STYLES ---------- */
const printStyles = `
  @media print {
    body * { visibility: hidden !important; }
    #po-print-area, #po-print-area * { visibility: visible !important; }
    #po-print-area {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      z-index: 99999 !important;
      background: white !important;
    }
    @page {
      size: A4;
      margin: 10mm 12mm;
    }
  }
`;

/* ---------- PRINT DOCUMENT COMPONENT ---------- */
const PrintDocument = ({ orderData, id, formatDateForPrint, formatCurrency }) => {
  const items = orderData?.items || [];
  const subtotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
  const sgst = subtotal * 0.09;
  const cgst = subtotal * 0.09;
  const grandTotal = orderData?.grandTotal || (subtotal + sgst + cgst);

  return (
    <div id="po-print-area" style={{
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: "11px",
      color: "#000",
      backgroundColor: "#fff",
      padding: "0",
      width: "100%",
      maxWidth: "794px",
      margin: "0 auto",
    }}>
      <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "600", borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "6px", letterSpacing: "1px" }}>
        {orderData?.supplierName?.toUpperCase() || "SRI VIGNESWARA HARDWARES"}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "2px" }}>SREE DAKSHA INDUSTRIES</div>
          <div style={{ fontSize: "10px", lineHeight: "1.5", color: "#333" }}>
            <div>Fabrication Factory,</div>
            <div>Karamunur Road, Vadavalli,</div>
            <div>Coimbatore, Tamilnadu - 641046. India.</div>
            <div>Email : dakshafabrication@gmail.com</div>
            <div>Tel : +91422 2975815</div>
            <div>GST : 33AEJPA2097N1ZD</div>
          </div>
        </div>

        <div style={{ textAlign: "right", minWidth: "160px" }}>
          {/* <div style={{
            border: "2px solid #000",
            padding: "6px 14px",
            display: "inline-block",
            marginBottom: "4px",
          }}> */}
            
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#333" }}>{id || orderData?._id || "PO-00677"}</div>
          {/* </div> */}
        </div>
      </div>

      <div style={{ borderTop: "1.5px solid #000", marginBottom: "8px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
        <div style={{ flex: 1 }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ color: "#555", paddingBottom: "4px", width: "120px", verticalAlign: "top" }}>Supplier Name:</td>
                <td style={{ fontWeight: "700", paddingBottom: "4px", verticalAlign: "top" }}>{orderData?.supplierName || "SRI VIGNESWARA HARDWARES"}</td>
                <td style={{ color: "#555", paddingBottom: "4px", width: "120px", verticalAlign: "top", paddingLeft: "20px" }}>Date:</td>
                <td style={{ fontWeight: "600", paddingBottom: "4px", verticalAlign: "top" }}>{formatDateForPrint(orderData?.date)}</td>
              </tr>
              <tr>
                <td style={{ color: "#555" }}></td>
                <td></td>
                <td style={{ color: "#555", paddingLeft: "20px", verticalAlign: "top" }}>Mode Of Payment:</td>
                <td style={{ fontWeight: "600", verticalAlign: "top" }}>{orderData?.modeOfPayment || "Cheque"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ fontSize: "11px", marginBottom: "8px" }}>
        <span style={{ color: "#555" }}>Warehouse Name</span>
        <div style={{ fontWeight: "600" }}>{orderData?.warehouse || "CALIES C - SD"}</div>
      </div>

      <div style={{ borderTop: "1px solid #000", marginBottom: "0" }} />

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "0" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #999", padding: "5px 8px", textAlign: "center", width: "35px" }}>Sr</th>
            <th style={{ border: "1px solid #999", padding: "5px 8px", textAlign: "left" }}>Description</th>
            <th style={{ border: "1px solid #999", padding: "5px 8px", textAlign: "center", width: "50px" }}>UOM</th>
            <th style={{ border: "1px solid #999", padding: "5px 8px", textAlign: "center", width: "70px" }}>Quantity</th>
            <th style={{ border: "1px solid #999", padding: "5px 8px", textAlign: "right", width: "80px" }}>Rate</th>
            <th style={{ border: "1px solid #999", padding: "5px 8px", textAlign: "right", width: "90px" }}>Amount</th>
           </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map((item, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px", textAlign: "center" }}>{item.no || idx + 1}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                {item.itemName || dummyItemDatabase.find(d => d.itemCode === item.itemCode)?.itemName || item.itemCode || "-"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px", textAlign: "center" }}>{item.uom || "Kg"}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px", textAlign: "center" }}>{item.quantity || 0}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px", textAlign: "right" }}>₹ {(item.rate || 0).toFixed(2)}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px", textAlign: "right" }}>₹ {((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center", color: "#999" }}>No items</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc", borderBottom: "1px solid #ccc", marginBottom: "16px" }}>
        <div style={{ flex: 1, padding: "8px 10px", borderRight: "1px solid #ccc", fontSize: "10.5px" }}>
          <div style={{ color: "#555", marginBottom: "2px" }}>In Words (Company Currency):</div>
          <div style={{ fontWeight: "600", lineHeight: "1.5" }}>{amountToWords(grandTotal)}</div>
        </div>

        <div style={{ minWidth: "230px", fontSize: "11px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", borderBottom: "1px solid #e0e0e0" }}>
            <span>Total</span>
            <span style={{ fontWeight: "600" }}>₹ {subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", borderBottom: "1px solid #e0e0e0" }}>
            <span>Input Tax SGST @ 9.0</span>
            <span>₹ {sgst.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", borderBottom: "1px solid #e0e0e0" }}>
            <span>Input Tax CGST @ 9.0</span>
            <span>₹ {cgst.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", fontWeight: "700", backgroundColor: "#f9f9f9" }}>
            <span>Grand Total:</span>
            <span>₹ {grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "28px", fontSize: "10px" }}>
        <div style={{ fontWeight: "700", fontSize: "11px", marginBottom: "5px", textDecoration: "underline" }}>TERMS AND CONDITIONS:</div>
        <ol style={{ margin: 0, paddingLeft: "16px", lineHeight: "1.8", color: "#444" }}>
          <li>Goods/Services must be supplied exactly as per specification only. If supplied otherwise acceptance subject to our sole discretionary powers.</li>
          <li>Supply of spurious goods or substandard goods/deficiency in services will not be accepted. If found later, amount will be deducted from bill amount.</li>
          <li>Part shipment will be allowed subject to the confirmation by the company. Payment strictly in accordance with the terms of payment / Cr.period.</li>
          <li>For delay in payment supplied is not entitled for any interest. Payment will be made after the agreed period subject to the condition No.1 & No.2</li>
          <li>For supply delay, the supplier is solely responsible and has to compensate the company as prescribed by the company. Bill should accompany with a copy of PO.</li>
        </ol>
      </div>

      <div style={{ textAlign: "right", fontSize: "11px", marginBottom: "40px", paddingRight: "20px" }}>
        For Sree Daksha Industries
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", borderTop: "1px solid #ccc", paddingTop: "8px" }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ marginBottom: "30px" }}></div>
          <div>Prepared By</div>
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ marginBottom: "30px" }}></div>
          <div>Purchase Manager</div>
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ marginBottom: "30px" }}></div>
          <div>Managing Director/Director Authority</div>
        </div>
      </div>
    </div>
  );
};

/* ========== MAIN COMPONENT ========== */
const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();
  const [orderData, setOrderData] = useState(location.state?.orderData || null);
  const [loading, setLoading] = useState(!location.state?.orderData && id);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [supplierModal, setSupplierModal] = useState(false);

  // Autocomplete states
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // Fetch order data if not provided via location state
  useEffect(() => {
    if (!orderData && id) {
      fetchOrderData();
    }
  }, [id, orderData]);

  const fetchOrderData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/purchase-orders/${id}`);
      const result = await response.json();
      if (result.success) {
        setOrderData(result.data);
      } else {
        setError(result.message || "Failed to fetch purchase order");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

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

  /* ---- Print Handler ---- */
  const handlePrint = () => {
    window.print();
  };

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
    setEditedItems(updated.map((item, i) => ({ ...item, no: i + 1 })));
  };

  // Save edits with API call
  const saveEdits = async () => {
    // Prepare updated items with correct amounts
    const updatedItems = editedItems.map((item, idx) => ({
      ...item,
      no: idx + 1,
      amount: (item.quantity || 0) * (item.rate || 0),
    }));
    const newGrandTotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Build payload - only send items and grandTotal (other fields remain unchanged on server)
    const payload = {
      items: updatedItems,
      grandTotal: newGrandTotal,
    };
    
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/purchase-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      
      if (result.success) {
        // Update local state with server response
        setOrderData(result.data);
        setIsEditing(false);
        setEditedItems([]);
        setActiveAutocompleteIndex(null);
        setSuggestions([]);
        alert("Purchase order updated successfully!");
      } else {
        alert(result.message || "Failed to update purchase order");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Network error: Could not update purchase order. Make sure backend is running on port 8000.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to format date for editing input display (DD-MM-YYYY format)
  const getDisplayDateForEdit = (dateStr) => {
    if (!dateStr) return "";
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  // Handle date change in edit mode (from text input to YYYY-MM-DD state)
  const handleDateEditChange = (index, inputValue) => {
    if (inputValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const yyyymmdd = convertToYYYYMMDD(inputValue);
      handleItemEdit(index, "requiredBy", yyyymmdd);
    } else if (inputValue === "") {
      handleItemEdit(index, "requiredBy", "");
    }
  };

  // CSV Download function
  const downloadCSV = () => {
    if (!orderData || !orderData.items || orderData.items.length === 0) return;
    
    const formatForCSV = (dateStr) => {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    };
    
    let csvContent = "";
    const headers = ["S.No", "Item Code", "Item Name", "Required By", "Quantity", "UOM", "Rate (INR)", "Amount (INR)"];
    csvContent += headers.join(",") + "\n";
    csvContent += `\n"Purchase Order:","${orderData._id || id}"\n`;
    csvContent += `"Supplier:","${orderData.supplierName || ""}"\n`;
    csvContent += `"Status:","${orderData.status || ""}"\n`;
    csvContent += `"Date:","${formatForCSV(orderData.date) || ""}"\n`;
    csvContent += `"Required By:","${formatForCSV(orderData.requiredBy) || ""}"\n`;
    csvContent += `"Mode of Payment:","${orderData.modeOfPayment || ""}"\n`;
    csvContent += `"Terms of Payment:","${orderData.termsOfPayment || ""}"\n`;
    csvContent += `"Grand Total:","${orderData.grandTotal || 0}"\n\n`;
    csvContent += headers.join(",") + "\n";
    orderData.items.forEach((item, index) => {
      const row = [
        item.no || index + 1,
        `"${(item.itemCode || "").replace(/"/g, '""')}"`,
        `"${(item.itemName || "").replace(/"/g, '""')}"`,
        formatForCSV(item.requiredBy) || "",
        item.quantity || 0,
        `"${(item.uom || "").replace(/"/g, '""')}"`,
        item.rate || 0,
        (item.quantity || 0) * (item.rate || 0),
      ];
      csvContent += row.join(",") + "\n";
    });
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

  if (loading) {
    return (
      <>
        <Head title="Loading..." />
        <Content>
          <Block>
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <Spinner color="primary" />
              <p style={{ marginTop: "20px", color: "#64748b" }}>Loading purchase order...</p>
            </div>
          </Block>
        </Content>
      </>
    );
  }

  if (error || !orderData) {
    return (
      <>
        <Head title="Purchase Order Details" />
        <Content>
          <Block>
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#fef3e0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Icon name="alert-circle" style={{ fontSize: "36px", color: "#f5a623" }} />
              </div>
              <h4 style={{ marginBottom: "8px", fontWeight: 600, color: "#1e293b" }}>{error ? "Error Loading Order" : "No Order Data Found"}</h4>
              <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "0.95rem" }}>
                {error || "The purchase order information could not be loaded."}
              </p>
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
      case "To Receive and Bill": return { bg: "#eff6ff", color: "#1e40af", border: "1px solid #93c5fd", dot: "#3b82f6" };
      case "Completed": return { bg: "#ecfdf5", color: "#065f46", border: "1px solid #6ee7b7", dot: "#10b981" };
      case "Cancelled": return { bg: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", dot: "#ef4444" };
      default: return { bg: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d", dot: "#f59e0b" };
    }
  };

  const statusStyle = getStatusStyles(orderData.status);

  // Format date as DD-MM-YYYY for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    if (year && month && day) {
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  // Format date for print (also DD-MM-YYYY)
  const formatDateForPrint = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
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
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 16px", backgroundColor: "#f9fafb",
    borderRadius: "6px", border: "1px solid #e5e7eb",
    fontSize: "0.85rem", fontWeight: 500, color: "#374151",
  };

  const getItemDisplayName = (item) => {
    if (item.itemName) return item.itemName;
    const found = dummyItemDatabase.find(db => db.itemCode === item.itemCode);
    return found ? found.itemName : "-";
  };

  return (
    <>
      <Head title={`Purchase Order ${id}`} />

      <style>{printStyles}</style>

      <PrintDocument
        orderData={orderData}
        id={id}
        formatDateForPrint={formatDateForPrint}
        formatCurrency={formatCurrency}
      />

      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <div style={{ marginTop: "100px" }} className="d-flex align-items-center gap-3 ">
                <BlockTitle tag="h3" style={{ marginBottom: 0 }}>Purchase Order</BlockTitle>
                <span style={{
                  backgroundColor: statusStyle.bg, color: statusStyle.color,
                  border: statusStyle.border, padding: "4px 14px", borderRadius: "20px",
                  fontSize: "0.78rem", fontWeight: 600, marginLeft: "10px",
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: statusStyle.dot, display: "inline-block" }} />
                  {orderData.status}
                </span>
              </div>
            </BlockHeadContent>

            <div className="d-flex align-items-center gap-2">
              <Button
                color="dark"
                size="sm"
                className=""
                onClick={() => history.push("/purchase-order")}
              >
                <Icon name="arrow-left" /> Back
              </Button>
              {isEditing ? (
                <>
                  <Button color="secondary" size="sm" onClick={cancelEditing} disabled={isSaving}>
                    <Icon name="cross" /> Cancel
                  </Button>
                  <Button color="success" size="sm" onClick={saveEdits} disabled={isSaving}>
                    {isSaving ? <Spinner size="sm" style={{ marginRight: "8px" }} /> : <Icon name="check-circle" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button color="warning" outline size="sm" onClick={startEditing}>
                    <Icon name="edit" />
                  </Button>
                  <UncontrolledDropdown>
                    <DropdownToggle
                      tag="button"
                      className="btn btn-primary d-flex align-items-center gap-1"
                      style={{ borderRadius: "4px", padding: "15px 14px", fontSize: "0.85rem" }}
                    >
                      <Icon name="download" />
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem onClick={downloadCSV}>
                        <Icon name="file" className="me-2" /> Download as CSV
                      </DropdownItem>
                      <DropdownItem onClick={handlePrint}>
                        <Icon name="printer" className="me-2" /> Print / Save as PDF
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
                  style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 600, textDecoration: "underline", padding: 0, fontSize: "inherit" }}
                >
                  {orderData.supplierName}
                </button>
              </h5>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.87rem", marginBottom: "20px" }}>
                {[
                  { icon: "calendar", label: "Date", value: formatDate(orderData.date) },
                  { icon: "calendar-check", label: "Required By", value: formatDate(orderData.requiredBy) },
                  { icon: "credit-card", label: "Payment", value: orderData.modeOfPayment || "-" },
                  { icon: "file-text", label: "Terms", value: orderData.termsOfPayment || "-" },
                  { icon: "layers", label: "Series", value: orderData.series || "-" },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Icon name={icon} style={{ fontSize: "14px", color: "#6b7280" }} />
                    <span style={{ color: "#6b7280" }}>{label}:</span>
                    <span style={{ color: "#111827", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Checkboxes Display */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                {[
                  { key: "applyTaxWithholding", label: "Apply Tax Withholding Amount (TDS)" },
                  { key: "isReverseCharge", label: "Is Reverse Charge" },
                  { key: "isSubcontracted", label: "Is Subcontracted" },
                ].map(({ key, label }) => (
                  <div key={key} style={checkboxStyle}>
                    <span style={{
                      width: "18px", height: "18px", borderRadius: "4px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: orderData[key] ? "#3b82f6" : "#fff",
                      border: `2px solid ${orderData[key] ? "#3b82f6" : "#d1d5db"}`,
                    }}>
                      {orderData[key] && <Icon name="check-thick" style={{ fontSize: "10px", color: "#fff" }} />}
                    </span>
                    <span>{label}</span>
                  </div>
                ))}
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
                  {displayItems.length > 0 ? displayItems.map((item, idx) => (
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
                              onFocus={() => { if (item.itemCode?.trim().length > 0) handleItemCodeChange(idx, item.itemCode); }}
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
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="DD-MM-YYYY"
                            value={item.requiredBy ? formatDateToDDMMYYYY(item.requiredBy) : ""}
                            onChange={(e) => handleDateEditChange(idx, e.target.value)}
                            style={{ fontSize: "0.82rem" }}
                            onClick={(e) => e.stopPropagation()}
                          />
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
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px 6px", borderRadius: "4px" }}
                            title="Remove row"
                            disabled={editedItems.length <= 1}
                          >
                            <Icon name="trash" style={{ fontSize: "16px", opacity: editedItems.length <= 1 ? 0.3 : 1 }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  )) : (
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
                <Button color="light" size="sm" onClick={addEditRow} disabled={isSaving}>
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
        .date-input-hidden::-webkit-calendar-picker-indicator { display: none; }
        .date-input-hidden { -webkit-appearance: none; }
        @media screen {
          #po-print-area { display: none; }
        }
      `}</style>
    </>
  );
};

export default PurchaseOrderDetails;