import React, { useEffect, useState } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { useHistory } from "react-router-dom";
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
  ModalHeader,
  FormGroup,
  Label,
  Input,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";

/* ---------- DUMMY SUPPLIERS ---------- */
const dummySuppliers = [
  { id: "SUP-001", name: "ABC Traders", address: "123, MG Road, Chennai - 600001", contact: "9876543210" },
  { id: "SUP-002", name: "XYZ Suppliers", address: "45, Anna Salai, Chennai - 600002", contact: "9876543211" },
  { id: "SUP-003", name: "Steel Max Industries", address: "78, GST Road, Chennai - 600003", contact: "9876543212" },
  { id: "SUP-004", name: "Cement Corp Ltd", address: "12, Mount Road, Chennai - 600004", contact: "9876543213" },
  { id: "SUP-005", name: "Hardware Hub", address: "90, Poonamallee High Road, Chennai - 600005", contact: "9876543214" },
];

/* ---------- DUMMY MATERIAL REQUESTS (for selection) ---------- */
const dummyMaterialRequestsList = [
  { _id: "MREQ-00007", title: "Purchase Request for PRIMER 20 LTR", status: "Pending", items: [{ itemCode: "PRIMER-20L", itemName: "PRIMER 20 LTR", quantity: 10, uom: "LTR", warehouse: "Stores - SD", requiredBy: "2026-05-15" }] },
  { _id: "MREQ-00008", title: "Purchase Request for GALVANIZED SHEET", status: "Ordered", items: [{ itemCode: "GS-8.6-045-GRAY", itemName: '8\'6" GALVANIZED SHEET', quantity: 35, uom: "NOS", warehouse: "Stores - SD", requiredBy: "2026-05-20" }] },
  { _id: "MREQ-00009", title: "Purchase Request for TRANSPARENT SHEET", status: "Partially Ordered", items: [{ itemCode: "TS-6x3.6-1.5-CLEAR", itemName: 'TRANSPARENT SHEET 6\'x3\'6"', quantity: 24, uom: "SQM", warehouse: "Stores - SD", requiredBy: "2026-05-25" }] },
];

/* ---------- DUMMY PROJECTS ---------- */
const dummyProjects = [
  { id: "PROJ-001", name: "Sunrise Villa Project" },
  { id: "PROJ-002", name: "Green Field Apartment" },
  { id: "PROJ-003", name: "Lake View Residency" },
];

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

/* ---------- DUMMY PURCHASE ORDERS ---------- */
const dummyPurchaseOrders = [
  {
    _id: "PO-00001",
    supplierName: "ABC Traders",
    supplierId: "SUP-001",
    status: "To Receive and Bill",
    date: "2026-05-01",
    requiredBy: "2026-05-20",
    grandTotal: 125000,
    series: "PO-SER-2026",
    modeOfPayment: "Check",
    termsOfPayment: "Net 30 Days",
    items: [
      { no: 1, itemCode: "PRIMER-20L", itemName: "PRIMER 20 LTR", requiredBy: "2026-05-20", quantity: 50, warehouse: "Stores - SD", uom: "LTR", rate: 250, amount: 12500 },
      { no: 2, itemCode: "THINNER-5L", itemName: "THINNER 5 LTR", requiredBy: "2026-05-20", quantity: 30, warehouse: "Stores - SD", uom: "LTR", rate: 150, amount: 4500 },
    ],
  },
  {
    _id: "PO-00002",
    supplierName: "Steel Max Industries",
    supplierId: "SUP-003",
    status: "To Receive and Bill",
    date: "2026-05-03",
    requiredBy: "2026-05-25",
    grandTotal: 450000,
    series: "PO-SER-2026",
    modeOfPayment: "DD",
    termsOfPayment: "Net 15 Days",
    items: [
      { no: 1, itemCode: "STEEL-12MM", itemName: "STEEL ROD TMT 12MM", requiredBy: "2026-05-25", quantity: 500, warehouse: "Stores - SD", uom: "KG", rate: 85, amount: 42500 },
      { no: 2, itemCode: "GS-8.6-045-GRAY", itemName: '8\'6" GALVANIZED SHEET [0.45MM] GRAY COLOUR', requiredBy: "2026-05-25", quantity: 100, warehouse: "Stores - SD", uom: "NOS", rate: 1200, amount: 120000 },
    ],
  },
  {
    _id: "PO-00003",
    supplierName: "Cement Corp Ltd",
    supplierId: "SUP-004",
    status: "To Receive and Bill",
    date: "2026-05-05",
    requiredBy: "2026-05-30",
    grandTotal: 85000,
    series: "PO-SER-2026",
    modeOfPayment: "Cash",
    termsOfPayment: "Immediate",
    items: [
      { no: 1, itemCode: "CEMENT-50KG", itemName: "CEMENT 50KG BAG", requiredBy: "2026-05-30", quantity: 200, warehouse: "Stores - SD", uom: "BAG", rate: 400, amount: 80000 },
    ],
  },
];

// Helper function: Convert YYYY-MM-DD to DD-MM-YYYY for display
const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

// Helper function: Convert DD-MM-YYYY to YYYY-MM-DD for backend
const convertToYYYYMMDD = (dateStr) => {
  if (!dateStr) return "";
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
  const [day, month, year] = dateStr.split("-");
  if (day && month && year) {
    return `${year}-${month}-${day}`;
  }
  return "";
};

// Custom Date Input Component for DD-MM-YYYY format
const CustomDateInput = ({ value, onChange, className, id, placeholder, onClick }) => {
  const [displayValue, setDisplayValue] = useState(value ? formatDateToDDMMYYYY(value) : "");
  
  const handleChange = (e) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    if (inputValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const yyyymmdd = convertToYYYYMMDD(inputValue);
      onChange({ target: { value: yyyymmdd } });
    } else if (inputValue === "") {
      onChange({ target: { value: "" } });
    }
  };
  
  React.useEffect(() => {
    setDisplayValue(value ? formatDateToDDMMYYYY(value) : "");
  }, [value]);
  
  return (
    <input
      type="text"
      className={className}
      id={id}
      placeholder="DD-MM-YYYY"
      value={displayValue}
      onChange={handleChange}
      onClick={onClick}
    />
  );
};

// Item Row Component with DD-MM-YYYY date input
const ItemRow = ({ item, index, handleItemChange, handleItemCodeChange, handleKeyDown, selectSuggestion, suggestions, activeSuggestionIndex, setActiveSuggestionIndex, isActive }) => {
  const [itemDisplayDate, setItemDisplayDate] = useState(item.requiredBy ? formatDateToDDMMYYYY(item.requiredBy) : "");
  
  React.useEffect(() => {
    setItemDisplayDate(item.requiredBy ? formatDateToDDMMYYYY(item.requiredBy) : "");
  }, [item.requiredBy]);
  
  const handleDateChange = (e) => {
    const inputValue = e.target.value;
    setItemDisplayDate(inputValue);
    if (inputValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const yyyymmdd = convertToYYYYMMDD(inputValue);
      handleItemChange(index, "requiredBy", yyyymmdd);
    } else if (inputValue === "") {
      handleItemChange(index, "requiredBy", "");
    }
  };
  
  return (
    <tr>
      <td style={{ padding: "8px 10px", textAlign: "center", verticalAlign: "middle", fontSize: "0.85rem" }}>
        {item.no || index + 1}
      </td>
      <td style={{ padding: "8px 10px", position: "relative", verticalAlign: "middle" }}>
        <input
          type="text"
          className="form-control form-control-sm"
          value={item.itemCode}
          onChange={(e) => handleItemCodeChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => {
            if (item.itemCode && item.itemCode.trim().length > 0) {
              handleItemCodeChange(index, item.itemCode);
            }
          }}
          placeholder="Search item code..."
          autoComplete="off"
          style={{ fontSize: "0.82rem" }}
          data-autocomplete-input="true"
        />
        {isActive && suggestions.length > 0 && (
          <div
            data-autocomplete-dropdown="true"
            style={{
              position: "absolute", top: "100%", left: "10px", right: "10px",
              backgroundColor: "#fff", border: "1px solid #d1d5db",
              borderRadius: "0 0 8px 8px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              zIndex: 99999, maxHeight: "200px", overflowY: "auto", marginTop: "-1px",
            }}
          >
            {suggestions.map((suggestion, sIdx) => (
              <div
                key={sIdx}
                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(index, suggestion); }}
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
      </td>
      <td style={{ padding: "8px 10px", verticalAlign: "middle" }}>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="DD-MM-YYYY"
          value={itemDisplayDate}
          onChange={handleDateChange}
          style={{ fontSize: "0.82rem", cursor: "pointer" }}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td style={{ padding: "8px 10px", verticalAlign: "middle" }}>
        <input
          type="number"
          className="form-control form-control-sm"
          value={item.quantity}
          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
          placeholder="0"
          style={{ fontSize: "0.82rem", width: "80px" }}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td style={{ padding: "8px 10px", verticalAlign: "middle" }}>
        <input
          type="text"
          className="form-control form-control-sm"
          value={item.uom}
          onChange={(e) => handleItemChange(index, "uom", e.target.value)}
          placeholder="UOM"
          style={{ fontSize: "0.82rem", width: "80px" }}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td style={{ padding: "8px 10px", verticalAlign: "middle" }}>
        <input
          type="number"
          className="form-control form-control-sm"
          value={item.rate || ""}
          onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          style={{ fontSize: "0.82rem", width: "100px" }}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td style={{ padding: "8px 10px", verticalAlign: "middle", textAlign: "right", fontWeight: 500, color: "#374151", fontSize: "0.85rem" }}>
        {((item.quantity || 0) * (item.rate || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  );
};

const PurchaseOrderPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [onSearch, setOnSearch] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showMaterialRequestModal, setShowMaterialRequestModal] = useState(false);
  const [selectedMaterialRequest, setSelectedMaterialRequest] = useState(null);

  const [newOrder, setNewOrder] = useState({
    series: "PO-SER-2026",
    date: "",
    supplier: "",
    costCenter: "",
    project: "",
    modeOfPayment: "Check",
    termsOfPayment: "Net 30 Days",
    requiredBy: "",
    supplierAddress: "",
    supplierContact: "",
    shippingAddress: "",
    shippingContact: "",
    companyBillingAddress: "",
    placeOfSupply: "",
    applyTaxWithholding: false,
    isReverseCharge: false,
    isSubcontracted: false,
    termsAndConditions: "",
    items: [
      { no: 1, itemCode: "", itemName: "", requiredBy: "", quantity: 0, uom: "", rate: 0, warehouse: "Stores - SD" },
    ],
  });

  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPurchaseOrders(dummyPurchaseOrders);
      setFiltered(dummyPurchaseOrders);
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (addModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [addModal]);

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

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(purchaseOrders);
    } else {
      const keyword = search.toLowerCase();
      setFiltered(purchaseOrders.filter(po =>
        po.supplierName?.toLowerCase().includes(keyword) ||
        po._id?.toLowerCase().includes(keyword) ||
        po.status?.toLowerCase().includes(keyword)
      ));
    }
  }, [search, purchaseOrders]);

  // Updated status badge to match MaterialRequestPage style
  const getStatusBadge = (status) => {
    let backgroundColor = "";
    let borderColor = "";
    switch (status) {
      case "To Receive and Bill":
        backgroundColor = "#10b981";
        borderColor = "#059669";
        break;
      case "Pending":
        backgroundColor = "#f59e0f";
        borderColor = "#d97706";
        break;
      case "Ordered":
        backgroundColor = "#3b82f6";
        borderColor = "#2563eb";
        break;
      case "Partially Ordered":
        backgroundColor = "#8b5cf6";
        borderColor = "#7c3aed";
        break;
      default:
        backgroundColor = "#6b7280";
        borderColor = "#4b5563";
    }
    return (
      <span
        style={{
          backgroundColor,
          border: `1px solid ${borderColor}`,
          color: "#ffffff",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 500,
          whiteSpace: "nowrap",
          display: "inline-block",
          lineHeight: "1.5",
        }}
      >
        {status}
      </span>
    );
  };

  const handleItemCodeChange = (index, value) => {
    handleItemChange(index, "itemCode", value);
    if (value && value.trim().length > 0) {
      const filtered = dummyItemDatabase.filter(item =>
        item.itemCode?.toLowerCase().includes(value.toLowerCase()) ||
        item.itemName?.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setActiveAutocompleteIndex(index);
      setActiveSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setActiveAutocompleteIndex(null);
    }
  };

  const selectSuggestion = (index, item) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], itemCode: item.itemCode, itemName: item.itemName, uom: item.uom, warehouse: item.warehouse || updatedItems[index].warehouse };
    setNewOrder((prev) => ({ ...prev, items: updatedItems }));
    setSuggestions([]);
    setActiveAutocompleteIndex(null);
  };

  const handleKeyDown = (e, index) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveSuggestionIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1); }
    else if (e.key === "Enter") { e.preventDefault(); if (activeSuggestionIndex >= 0) selectSuggestion(index, suggestions[activeSuggestionIndex]); }
    else if (e.key === "Escape") { setSuggestions([]); setActiveAutocompleteIndex(null); }
  };

  const addItemRow = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { no: prev.items.length + 1, itemCode: "", itemName: "", requiredBy: prev.requiredBy || "", quantity: 0, uom: "", rate: 0, warehouse: "Stores - SD" }],
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index][field] = value;
    setNewOrder((prev) => ({ ...prev, items: updatedItems }));
  };

  const selectMaterialRequest = (mr) => {
    setSelectedMaterialRequest(mr);
    const mrItems = mr.items.map((item, idx) => ({
      no: newOrder.items.filter(i => i.itemCode).length + idx + 1,
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      requiredBy: item.requiredBy || newOrder.requiredBy || "",
      quantity: item.quantity || 0,
      uom: item.uom || "",
      rate: 0,
      warehouse: item.warehouse || "Stores - SD",
    }));
    setNewOrder(prev => ({ ...prev, items: [...prev.items.filter(i => i.itemCode.trim()), ...mrItems] }));
    setShowMaterialRequestModal(false);
  };

  const calculateTotalQuantity = () => newOrder.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const calculateGrandTotal = () => newOrder.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);

  const handleAddOrder = () => {
    const newId = `PO-${String(purchaseOrders.length + 1).padStart(5, "0")}`;
    const supplierObj = dummySuppliers.find(s => s.id === newOrder.supplier);
    const orderToAdd = {
      _id: newId, supplierName: supplierObj?.name || "", supplierId: supplierObj?.id || "",
      status: "To Receive and Bill", date: newOrder.date, requiredBy: newOrder.requiredBy,
      grandTotal: calculateGrandTotal(), series: newOrder.series,
      modeOfPayment: newOrder.modeOfPayment, termsOfPayment: newOrder.termsOfPayment,
      items: newOrder.items.map((item, idx) => ({ ...item, no: idx + 1, amount: (item.quantity || 0) * (item.rate || 0) })),
    };
    setPurchaseOrders([orderToAdd, ...purchaseOrders]);
    setFiltered([orderToAdd, ...purchaseOrders]);
    setAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewOrder({
      series: "PO-SER-2026", date: "", supplier: "", costCenter: "", project: "",
      modeOfPayment: "Check", termsOfPayment: "Net 30 Days", requiredBy: "",
      supplierAddress: "", supplierContact: "", shippingAddress: "", shippingContact: "",
      companyBillingAddress: "", placeOfSupply: "",
      applyTaxWithholding: false, isReverseCharge: false, isSubcontracted: false,
      termsAndConditions: "",
      items: [{ no: 1, itemCode: "", itemName: "", requiredBy: "", quantity: 0, uom: "", rate: 0, warehouse: "Stores - SD" }],
    });
    setActiveTab("details");
    setSelectedMaterialRequest(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };
  
  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);

  const goToDetails = (order) => history.push(`/purchase-order-details/${order._id}`, { orderData: order });

  return (
    <>
      <Head title="Purchase Order" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent><BlockTitle tag="h3">Purchase Order</BlockTitle></BlockHeadContent>
            <Button color="primary" onClick={() => { resetForm(); setAddModal(true); }}><Icon name="plus" /> Add Purchase Order</Button>
          </BlockBetween>
        </BlockHead>

        <Block>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ width: "40px", height: "40px", border: "3px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#6b7280" }}>Loading purchase orders...</p>
            </div>
          ) : (
            <DataTable className="card-stretch w-100">
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools mr-n1">
                    <ul className="btn-toolbar gx-1">
                      <li><a href="#search" onClick={(ev) => { ev.preventDefault(); setOnSearch(true); }} className="btn btn-icon search-toggle"><Icon name="search" /></a></li>
                    </ul>
                  </div>
                </div>
                <div className={`card-search search-wrap ${onSearch ? "active" : ""}`}>
                  <div className="card-body">
                    <div className="search-content">
                      <Button className="search-back btn-icon" onClick={() => { setSearch(""); setOnSearch(false); }}><Icon name="arrow-left" /></Button>
                      <input type="text" className="form-control border-transparent" placeholder="Search by supplier, ID or status" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "0 20px 20px" }}>
                <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden", marginTop: "20px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "25%" }}>Supplier Name</th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "20%" }}>Status</th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "15%" }}>Date</th>
                        <th style={{ padding: "14px 16px", textAlign: "right", fontWeight: 600, color: "#374151", width: "20%" }}>Grand Total</th>
                        <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: "20%" }}>ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length > 0 ? filtered.map((order, idx) => (
                        <tr key={order._id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <button onClick={() => goToDetails(order)} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 500, textAlign: "left", padding: 0, fontSize: "0.88rem" }}>{order.supplierName}</button>
                          </td>
                          <td style={{ padding: "14px 16px" }}>{getStatusBadge(order.status)}</td>
                          <td style={{ padding: "14px 16px", color: "#374151" }}>{formatDate(order.date)}</td>
                          <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 600, color: "#059669" }}>{formatCurrency(order.grandTotal)}</td>
                          <td style={{ padding: "14px 16px" }}><code style={{ backgroundColor: "#f9fafb", padding: "4px 10px", borderRadius: "4px", fontSize: "0.82rem", color: "#374151", border: "1px solid #e5e7eb", fontWeight: 600 }}>{order._id}</code></td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>No purchase orders found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </DataTable>
          )}
        </Block>
      </Content>

      {/* Add Purchase Order Modal */}
      <Modal 
        isOpen={addModal} 
        toggle={() => { setAddModal(false); setActiveAutocompleteIndex(null); }} 
        centered 
        size="xl" 
        backdrop="static"
        scrollable={true}
        style={{ maxHeight: "90vh" }}
      >
        <ModalHeader toggle={() => { setAddModal(false); setActiveAutocompleteIndex(null); }}>
          Add Purchase Order
        </ModalHeader>
        <ModalBody style={{ overflowY: "auto", maxHeight: "70vh" }}>
          <Nav tabs className="mb-4">
            <NavItem>
              <NavLink className={classnames({ active: activeTab === "details" })} onClick={() => setActiveTab("details")} style={{ cursor: "pointer" }}>Details</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: activeTab === "address" })} onClick={() => setActiveTab("address")} style={{ cursor: "pointer" }}>Address & Contact</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: activeTab === "terms" })} onClick={() => setActiveTab("terms")} style={{ cursor: "pointer" }}>Terms</NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="details">
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <FormGroup><Label for="series">Series</Label><Input type="text" id="series" value={newOrder.series} onChange={(e) => setNewOrder({ ...newOrder, series: e.target.value })} bsSize="sm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-md-3">
                  <FormGroup><Label for="date">Date *</Label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      id="date" 
                      placeholder="DD-MM-YYYY"
                      value={newOrder.date ? formatDateToDDMMYYYY(newOrder.date) : ""} 
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
                          const yyyymmdd = convertToYYYYMMDD(inputValue);
                          setNewOrder({ ...newOrder, date: yyyymmdd });
                        } else if (inputValue === "") {
                          setNewOrder({ ...newOrder, date: "" });
                        }
                      }} 
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </FormGroup>
                </div>
                <div className="col-md-3">
                  <FormGroup><Label for="supplier">Supplier *</Label>
                    <Input type="select" id="supplier" value={newOrder.supplier} onChange={(e) => {
                      const sup = dummySuppliers.find(s => s.id === e.target.value);
                      setNewOrder({ ...newOrder, supplier: e.target.value, supplierAddress: sup?.address || "", supplierContact: sup?.contact || "" });
                    }} bsSize="sm" onClick={(e) => e.stopPropagation()}>
                      <option value="">Select Supplier</option>
                      {dummySuppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                    </Input>
                  </FormGroup>
                </div>
                <div className="col-md-3">
                  <FormGroup><Label for="modeOfPayment">Mode of Payment *</Label>
                    <Input type="select" id="modeOfPayment" value={newOrder.modeOfPayment} onChange={(e) => setNewOrder({ ...newOrder, modeOfPayment: e.target.value })} bsSize="sm" onClick={(e) => e.stopPropagation()}>
                      <option value="Check">Check</option><option value="Cash">Cash</option><option value="DD">DD</option>
                    </Input>
                  </FormGroup>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <FormGroup><Label for="termsOfPayment">Terms of Payment</Label><Input type="text" id="termsOfPayment" value={newOrder.termsOfPayment} onChange={(e) => setNewOrder({ ...newOrder, termsOfPayment: e.target.value })} bsSize="sm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-md-3">
                  <FormGroup><Label for="poRequiredBy">Required By *</Label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      id="poRequiredBy" 
                      placeholder="DD-MM-YYYY"
                      value={newOrder.requiredBy ? formatDateToDDMMYYYY(newOrder.requiredBy) : ""} 
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
                          const yyyymmdd = convertToYYYYMMDD(inputValue);
                          const updatedItems = newOrder.items.map(item => ({ ...item, requiredBy: yyyymmdd }));
                          setNewOrder({ ...newOrder, requiredBy: yyyymmdd, items: updatedItems });
                        } else if (inputValue === "") {
                          const updatedItems = newOrder.items.map(item => ({ ...item, requiredBy: "" }));
                          setNewOrder({ ...newOrder, requiredBy: "", items: updatedItems });
                        }
                      }} 
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </FormGroup>
                </div>
                <div className="col-md-3">
                  <FormGroup><Label for="costCenter">Cost Center</Label><Input type="text" id="costCenter" value={newOrder.costCenter} onChange={(e) => setNewOrder({ ...newOrder, costCenter: e.target.value })} placeholder="Cost Center" bsSize="sm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-md-3">
                  <FormGroup><Label for="project">Project</Label>
                    <Input type="select" id="project" value={newOrder.project} onChange={(e) => setNewOrder({ ...newOrder, project: e.target.value })} bsSize="sm" onClick={(e) => e.stopPropagation()}>
                      <option value="">Select Project</option>
                      {dummyProjects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                    </Input>
                  </FormGroup>
                </div>
              </div>

              <div className="d-flex gap-4 mb-3 flex-wrap">
                <FormGroup check inline>
                  <Label check style={{ fontSize: "0.85rem" }}>
                    <Input type="checkbox" checked={newOrder.applyTaxWithholding} onChange={(e) => setNewOrder({ ...newOrder, applyTaxWithholding: e.target.checked })} onClick={(e) => e.stopPropagation()} /> Apply Tax Withholding Amount
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Label check style={{ fontSize: "0.85rem" }}>
                    <Input type="checkbox" checked={newOrder.isReverseCharge} onChange={(e) => setNewOrder({ ...newOrder, isReverseCharge: e.target.checked })} onClick={(e) => e.stopPropagation()} /> Is Reverse Charge
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Label check style={{ fontSize: "0.85rem" }}>
                    <Input type="checkbox" checked={newOrder.isSubcontracted} onChange={(e) => setNewOrder({ ...newOrder, isSubcontracted: e.target.checked })} onClick={(e) => e.stopPropagation()} /> Is Subcontracted
                  </Label>
                </FormGroup>
              </div>

              <div className="mb-3">
                <Button color="info" outline size="sm" onClick={(e) => { e.stopPropagation(); setShowMaterialRequestModal(true); }}>
                  <Icon name="file-text" /> Select Material Request
                </Button>
                {selectedMaterialRequest && (
                  <span className="ms-3" style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: 500 }}>
                    Selected: {selectedMaterialRequest._id} - {selectedMaterialRequest.title}
                  </span>
                )}
              </div>

              <h6 style={{ fontWeight: 600, marginBottom: "8px", fontSize: "0.9rem" }}>Items</h6>
              <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "visible", marginBottom: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
                      <th style={{ padding: "10px 10px", width: "50px" }}>No.</th>
                      <th style={{ padding: "10px 10px", minWidth: "160px" }}>Item Code *</th>
                      <th style={{ padding: "10px 10px", width: "130px" }}>Required By *</th>
                      <th style={{ padding: "10px 10px", width: "90px" }}>Quantity *</th>
                      <th style={{ padding: "10px 10px", width: "80px" }}>UOM *</th>
                      <th style={{ padding: "10px 10px", width: "110px" }}>Rate (INR)</th>
                      <th style={{ padding: "10px 10px", width: "120px", textAlign: "right" }}>Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newOrder.items.map((item, index) => (
                      <ItemRow key={index} item={item} index={index} handleItemChange={handleItemChange} handleItemCodeChange={handleItemCodeChange} handleKeyDown={handleKeyDown} selectSuggestion={selectSuggestion} suggestions={suggestions} activeSuggestionIndex={activeSuggestionIndex} setActiveSuggestionIndex={setActiveSuggestionIndex} isActive={activeAutocompleteIndex === index} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex gap-2 mb-3">
                <Button color="light" size="sm" onClick={addItemRow}><Icon name="plus" /> Add Row</Button>
                <Button color="light" size="sm" outline><Icon name="plus" /> Add Multiple</Button>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "30px", padding: "10px 20px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "12px" }}>
                <div><span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Total Quantity: </span><span style={{ fontWeight: 600, color: "#111827" }}>{calculateTotalQuantity()}</span></div>
                <div><span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Total (INR): </span><span style={{ fontWeight: 700, color: "#059669", fontSize: "1rem" }}>{formatCurrency(calculateGrandTotal())}</span></div>
              </div>

              <h6 style={{ fontWeight: 600, marginBottom: "8px", fontSize: "0.9rem" }}>Taxes and Charges</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <FormGroup><Label style={{ fontSize: "0.82rem" }}>Tax Category</Label><Input type="text" bsSize="sm" placeholder="Tax Category" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-md-3">
                  <FormGroup><Label style={{ fontSize: "0.82rem" }}>Shipping Rule</Label><Input type="text" bsSize="sm" placeholder="Shipping Rule" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-md-3">
                  <FormGroup><Label style={{ fontSize: "0.82rem" }}>Incoterm</Label><Input type="text" bsSize="sm" placeholder="Incoterm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
              </div>
            </TabPane>

            <TabPane tabId="address">
              <div className="row g-3">
                <div className="col-12"><h6 style={{ fontWeight: 600, color: "#374151", marginBottom: "12px" }}>Supplier Address</h6></div>
                <div className="col-md-6">
                  <FormGroup><Label style={{ fontSize: "0.85rem" }}>Supplier Address</Label><Input type="textarea" value={newOrder.supplierAddress} onChange={(e) => setNewOrder({ ...newOrder, supplierAddress: e.target.value })} rows={2} bsSize="sm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup><Label style={{ fontSize: "0.85rem" }}>Supplier Contact</Label><Input type="text" value={newOrder.supplierContact} onChange={(e) => setNewOrder({ ...newOrder, supplierContact: e.target.value })} bsSize="sm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-12"><h6 style={{ fontWeight: 600, color: "#374151", marginBottom: "12px", marginTop: "10px" }}>Shipping Address</h6></div>
                <div className="col-md-6">
                  <FormGroup><Label style={{ fontSize: "0.85rem" }}>Shipping Address</Label><Input type="textarea" value={newOrder.shippingAddress} onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })} rows={2} bsSize="sm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup><Label style={{ fontSize: "0.85rem" }}>Shipping Contact</Label><Input type="text" value={newOrder.shippingContact} onChange={(e) => setNewOrder({ ...newOrder, shippingContact: e.target.value })} bsSize="sm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-12"><h6 style={{ fontWeight: 600, color: "#374151", marginBottom: "12px", marginTop: "10px" }}>Company Billing Address</h6></div>
                <div className="col-md-6">
                  <FormGroup><Label style={{ fontSize: "0.85rem" }}>Company Billing Address</Label><Input type="textarea" value={newOrder.companyBillingAddress} onChange={(e) => setNewOrder({ ...newOrder, companyBillingAddress: e.target.value })} rows={2} bsSize="sm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup><Label style={{ fontSize: "0.85rem" }}>Place of Supply</Label><Input type="text" value={newOrder.placeOfSupply} onChange={(e) => setNewOrder({ ...newOrder, placeOfSupply: e.target.value })} bsSize="sm" onClick={(e) => e.stopPropagation()} /></FormGroup>
                </div>
              </div>
            </TabPane>

            <TabPane tabId="terms">
              <FormGroup>
                <Label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Terms and Conditions</Label>
                <Input type="textarea" value={newOrder.termsAndConditions} onChange={(e) => setNewOrder({ ...newOrder, termsAndConditions: e.target.value })} rows={8} placeholder="Enter terms and conditions..." bsSize="sm" onClick={(e) => e.stopPropagation()} />
              </FormGroup>
            </TabPane>
          </TabContent>

          <div className="d-flex justify-content-end gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #e5e7eb" }}>
            <Button style={{padding:"15px"}} color="secondary" size="sm" onClick={() => { setAddModal(false); setActiveAutocompleteIndex(null); }}>Cancel</Button>
            <Button style={{padding:"15px"}} color="primary" size="sm" onClick={handleAddOrder}>Submit Purchase Order</Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Select Material Request Modal */}
      <Modal isOpen={showMaterialRequestModal} toggle={() => setShowMaterialRequestModal(false)} centered size="lg" scrollable={true}>
        <ModalHeader toggle={() => setShowMaterialRequestModal(false)}>Select Material Request</ModalHeader>
        <ModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600 }}>ID</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600 }}>Title</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, width: "100px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dummyMaterialRequestsList.map(mr => (
                  <tr key={mr._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 14px" }}><code>{mr._id}</code></td>
                    <td style={{ padding: "10px 14px", wordBreak: "break-word" }}>{mr.title}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <Button color="primary" size="sm" onClick={() => selectMaterialRequest(mr)}>Select</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModalBody>
      </Modal>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-dialog { max-height: 90vh; }
        .modal-content { max-height: 90vh; overflow: hidden; }
        .modal-body { overflow-y: auto; }
      `}</style>
    </>
  );
};

export default PurchaseOrderPage;