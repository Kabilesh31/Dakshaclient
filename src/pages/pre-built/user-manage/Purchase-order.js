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
} from "reactstrap";

/* ---------- DUMMY SUPPLIERS ---------- */
const dummySuppliers = [
  { id: "SUP-001", name: "ABC Traders" },
  { id: "SUP-002", name: "XYZ Suppliers" },
  { id: "SUP-003", name: "Steel Max Industries" },
  { id: "SUP-004", name: "Cement Corp Ltd" },
  { id: "SUP-005", name: "Hardware Hub" },
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

// Item Row Component for Add Modal
const ItemRow = ({ item, index, handleItemChange, handleItemCodeChange, handleKeyDown, selectSuggestion, suggestions, activeSuggestionIndex, setActiveSuggestionIndex, isActive }) => {
  return (
    <tr>
      <td style={{ padding: "8px 12px", textAlign: "center", verticalAlign: "middle" }}>
        {item.no || index + 1}
      </td>
      <td style={{ padding: "8px 12px", position: "relative", verticalAlign: "middle" }}>
        <input
          type="text"
          className="form-control form-control-sm"
          value={item.itemCode}
          onChange={(e) => handleItemCodeChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onClick={() => {
            if (item.itemCode && item.itemCode.trim().length > 0) {
              handleItemCodeChange(index, item.itemCode);
            }
          }}
          placeholder="Search item code or name..."
          autoComplete="off"
          style={{ fontSize: "0.85rem" }}
          data-autocomplete-input="true"
        />
        {isActive && suggestions.length > 0 && (
          <div
            data-autocomplete-dropdown="true"
            style={{
              position: "absolute",
              top: "100%",
              left: "12px",
              right: "12px",
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "0 0 8px 8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              zIndex: 99999,
              maxHeight: "220px",
              overflowY: "auto",
              marginTop: "-1px",
            }}
          >
            {suggestions.map((suggestion, sIdx) => (
              <div
                key={sIdx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(index, suggestion);
                }}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  backgroundColor: sIdx === activeSuggestionIndex ? "#eff6ff" : "#fff",
                  borderBottom: sIdx < suggestions.length - 1 ? "1px solid #f3f4f6" : "none",
                  transition: "background-color 0.1s ease",
                }}
                onMouseEnter={() => setActiveSuggestionIndex(sIdx)}
              >
                <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.85rem", marginBottom: "2px" }}>
                  {suggestion.itemCode}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.78rem" }}>
                  {suggestion.itemName}
                </div>
              </div>
            ))}
          </div>
        )}
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input type="date" value={item.requiredBy} onChange={(e) => handleItemChange(index, "requiredBy", e.target.value)} bsSize="sm" />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)} placeholder="0" bsSize="sm" />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input type="number" value={item.rate || ""} onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)} placeholder="0.00" bsSize="sm" />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input type="text" value={item.warehouse} onChange={(e) => handleItemChange(index, "warehouse", e.target.value)} bsSize="sm" />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input type="text" value={item.uom} onChange={(e) => handleItemChange(index, "uom", e.target.value)} placeholder="UOM" bsSize="sm" />
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
  
  const [newOrder, setNewOrder] = useState({
    series: "PO-SER-2026",
    date: "",
    supplier: "",
    modeOfPayment: "Check",
    termsOfPayment: "Net 30 Days",
    requiredBy: "",
    items: [
      { no: 1, itemCode: "", itemName: "", requiredBy: "", quantity: 0, rate: 0, warehouse: "Stores - SD", uom: "" },
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
    const handleClickOutside = (event) => {
      if (activeAutocompleteIndex !== null) {
        const isOutsideDropdown = !event.target.closest('[data-autocomplete-dropdown]');
        const isOutsideInput = !event.target.closest('[data-autocomplete-input]');
        if (isOutsideDropdown && isOutsideInput) {
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
      setFiltered(
        purchaseOrders.filter(
          (po) =>
            po.supplierName?.toLowerCase().includes(keyword) ||
            po._id?.toLowerCase().includes(keyword) ||
            po.status?.toLowerCase().includes(keyword)
        )
      );
    }
  }, [search, purchaseOrders]);

  const getStatusBadge = (status) => {
    return (
      <span
        style={{
          backgroundColor: "#eff6ff",
          color: "#1e40af",
          border: "1px solid #93c5fd",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 500,
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
      >
        {status}
      </span>
    );
  };

  const handleItemCodeChange = (index, value) => {
    handleItemChange(index, "itemCode", value);
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

  const selectSuggestion = (index, item) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = {
      ...updatedItems[index],
      itemCode: item.itemCode,
      itemName: item.itemName,
      uom: item.uom,
      warehouse: item.warehouse || updatedItems[index].warehouse,
    };
    setNewOrder((prev) => ({ ...prev, items: updatedItems }));
    setSuggestions([]);
    setActiveAutocompleteIndex(null);
    setActiveSuggestionIndex(-1);
  };

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

  const addItemRow = () => {
    setNewOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { no: prev.items.length + 1, itemCode: "", itemName: "", requiredBy: prev.requiredBy || "", quantity: 0, rate: 0, warehouse: "Stores - SD", uom: "" },
      ],
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index][field] = value;
    if (field === "quantity" || field === "rate") {
      updatedItems[index].amount = (updatedItems[index].quantity || 0) * (updatedItems[index].rate || 0);
    }
    setNewOrder((prev) => ({ ...prev, items: updatedItems }));
  };

  const calculateGrandTotal = () => {
    return newOrder.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
  };

  const handleAddOrder = () => {
    const newId = `PO-${String(purchaseOrders.length + 1).padStart(5, "0")}`;
    const supplierObj = dummySuppliers.find((s) => s.id === newOrder.supplier || s.name === newOrder.supplier);
    const orderToAdd = {
      _id: newId,
      supplierName: supplierObj?.name || newOrder.supplier,
      supplierId: supplierObj?.id || "",
      status: "To Receive and Bill",
      date: newOrder.date,
      requiredBy: newOrder.requiredBy,
      grandTotal: calculateGrandTotal(),
      series: newOrder.series,
      modeOfPayment: newOrder.modeOfPayment,
      termsOfPayment: newOrder.termsOfPayment,
      items: newOrder.items.map((item, idx) => ({
        ...item,
        no: idx + 1,
        amount: (item.quantity || 0) * (item.rate || 0),
      })),
    };
    const updated = [orderToAdd, ...purchaseOrders];
    setPurchaseOrders(updated);
    setFiltered(updated);
    setAddModal(false);
    setNewOrder({
      series: "PO-SER-2026",
      date: "",
      supplier: "",
      modeOfPayment: "Check",
      termsOfPayment: "Net 30 Days",
      requiredBy: "",
      items: [{ no: 1, itemCode: "", itemName: "", requiredBy: "", quantity: 0, rate: 0, warehouse: "Stores - SD", uom: "" }],
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
  };

  const goToDetails = (order) => {
    history.push(`/purchase-order-details/${order._id}`, { orderData: order });
  };

  return (
    <>
      <Head title="Purchase Order" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Purchase Order</BlockTitle>
            </BlockHeadContent>
            <Button color="primary" onClick={() => setAddModal(true)}>
              <Icon name="plus" /> Add Purchase Order
            </Button>
          </BlockBetween>
        </BlockHead>

        <Block>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div
                style={{
                  width: "40px", height: "40px", border: "3px solid #e5e7eb",
                  borderTopColor: "#3b82f6", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
                }}
              />
              <p style={{ color: "#6b7280" }}>Loading purchase orders...</p>
            </div>
          ) : (
            <DataTable className="card-stretch w-100">
              {/* Search */}
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools mr-n1">
                    <ul className="btn-toolbar gx-1">
                      <li>
                        <a href="#search" onClick={(ev) => { ev.preventDefault(); setOnSearch(true); }} className="btn btn-icon search-toggle">
                          <Icon name="search" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={`card-search search-wrap ${onSearch ? "active" : ""}`}>
                  <div className="card-body">
                    <div className="search-content">
                      <Button className="search-back btn-icon" onClick={() => { setSearch(""); setOnSearch(false); }}>
                        <Icon name="arrow-left" />
                      </Button>
                      <input type="text" className="form-control border-transparent" placeholder="Search by supplier, ID or status" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div style={{ padding: "0 20px 20px" }}>
                <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
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
                      {filtered.length > 0 ? (
                        filtered.map((order, idx) => (
                          <tr key={order._id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <button
                                onClick={() => goToDetails(order)}
                                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 500, textAlign: "left", padding: 0, fontSize: "0.88rem" }}
                              >
                                {order.supplierName}
                              </button>
                            </td>
                            <td style={{ padding: "14px 16px" }}>{getStatusBadge(order.status)}</td>
                            <td style={{ padding: "14px 16px", color: "#374151" }}>{formatDate(order.date)}</td>
                            <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 600, color: "#059669" }}>{formatCurrency(order.grandTotal)}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <code style={{ backgroundColor: "#f9fafb", padding: "4px 10px", borderRadius: "4px", fontSize: "0.82rem", color: "#374151", border: "1px solid #e5e7eb", fontWeight: 600 }}>
                                {order._id}
                              </code>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>No purchase orders found</td>
                        </tr>
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
      <Modal isOpen={addModal} toggle={() => { setAddModal(false); setActiveAutocompleteIndex(null); setSuggestions([]); }} centered size="xl" backdrop="static">
        <ModalHeader toggle={() => { setAddModal(false); setActiveAutocompleteIndex(null); setSuggestions([]); }}>
          Add Purchase Order
        </ModalHeader>
        <ModalBody>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <FormGroup>
                <Label for="series">Series</Label>
                <Input type="text" id="series" value={newOrder.series} onChange={(e) => setNewOrder({ ...newOrder, series: e.target.value })} />
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup>
                <Label for="date">Date *</Label>
                <Input type="date" id="date" value={newOrder.date} onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })} />
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup>
                <Label for="supplier">Supplier *</Label>
                <Input type="select" id="supplier" value={newOrder.supplier} onChange={(e) => setNewOrder({ ...newOrder, supplier: e.target.value })}>
                  <option value="">Select Supplier</option>
                  {dummySuppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup>
                <Label for="modeOfPayment">Mode of Payment *</Label>
                <Input type="select" id="modeOfPayment" value={newOrder.modeOfPayment} onChange={(e) => setNewOrder({ ...newOrder, modeOfPayment: e.target.value })}>
                  <option value="Check">Check</option>
                  <option value="Cash">Cash</option>
                  <option value="DD">DD</option>
                </Input>
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup>
                <Label for="termsOfPayment">Terms of Payment</Label>
                <Input type="text" id="termsOfPayment" value={newOrder.termsOfPayment} onChange={(e) => setNewOrder({ ...newOrder, termsOfPayment: e.target.value })} />
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup>
                <Label for="poRequiredBy">Required By *</Label>
                <Input type="date" id="poRequiredBy" value={newOrder.requiredBy} onChange={(e) => {
                  setNewOrder({ ...newOrder, requiredBy: e.target.value });
                  // Update all items requiredBy
                  const updatedItems = newOrder.items.map(item => ({ ...item, requiredBy: e.target.value }));
                  setNewOrder(prev => ({ ...prev, requiredBy: e.target.value, items: updatedItems }));
                }} />
              </FormGroup>
            </div>
          </div>

          {/* Grand Total */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", padding: "10px 20px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: "0.95rem", color: "#374151", fontWeight: 500 }}>Grand Total: </span>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#059669", marginLeft: "12px" }}>{formatCurrency(calculateGrandTotal())}</span>
          </div>

          <div className="d-flex justify-content-between">
            <div className="d-flex gap-2">
              <Button color="light" onClick={addItemRow}><Icon name="plus" /> Add Row</Button>
            </div>
            <div className="d-flex gap-2">
              <Button color="secondary" onClick={() => { setAddModal(false); setActiveAutocompleteIndex(null); setSuggestions([]); }}>Cancel</Button>
              <Button color="primary" onClick={handleAddOrder}>Submit Order</Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default PurchaseOrderPage;