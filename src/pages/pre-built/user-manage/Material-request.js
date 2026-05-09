import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { useHistory } from "react-router-dom";
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
  ModalHeader,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

/* ---------- DUMMY ITEM DATABASE (for autocomplete) ---------- */
const dummyItemDatabase = [
  { itemCode: 'CUT-4INCH', itemName: '4" CUTTING WHEEL', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: 'CUT-4INCH-HW', itemName: '4" CUTTING WHEEL, HARDWARES', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: 'CUT-14INCH', itemName: '14" CUTTING WHEEL', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "PRIMER-20L", itemName: "PRIMER 20 LTR", uom: "LTR", warehouse: "Stores - SD" },
  { itemCode: "THINNER-5L", itemName: "THINNER 5 LTR", uom: "LTR", warehouse: "Stores - SD" },
  { itemCode: "GS-8.6-045-GRAY", itemName: '8\'6" GALVANIZED SHEET [0.45MM] GRAY COLOUR', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "GS-17.6-045", itemName: '17\'6" GALVANIZED SHEET [0.45MM]', uom: "NOS", warehouse: "Stores - SD" },
  { itemCode: "TS-6x3.6-1.5-CLEAR", itemName: 'TRANSPARENT SHEET 6\'x3\'6" [1.5MM]: 1.5MM COMPACT CLEAR NATLITE', uom: "SQM", warehouse: "Stores - SD" },
  { itemCode: "CEMENT-50KG", itemName: "CEMENT 50KG BAG", uom: "BAG", warehouse: "Stores - SD" },
  { itemCode: "STEEL-12MM", itemName: "STEEL ROD TMT 12MM", uom: "KG", warehouse: "Stores - SD" },
  { itemCode: "SAND-RIVER", itemName: "RIVER SAND", uom: "TON", warehouse: "Stores - SD" },
  { itemCode: "BRICKS-1000", itemName: "BRICKS (1000 PCS)", uom: "PKT", warehouse: "Stores - SD" },
  { itemCode: "PAINT-PRIMER", itemName: "PAINT PRIMER 20 LTR", uom: "LTR", warehouse: "Stores - SD" },
  { itemCode: "PAINT-WHITE", itemName: "WHITE PAINT 10 LTR", uom: "LTR", warehouse: "Stores - SD" },
];

/* ---------- DUMMY DATA with dates in YYYY-MM-DD format (backend format) ---------- */
const dummyMaterialRequests = [
  {
    _id: "MREQ-00007",
    title: "Purchase Request for PRIMER 20 LTR",
    status: "Pending",
    purpose: "Purchase",
    requiredBy: "2026-05-15",
    transactionDate: "2026-05-02",
    priceList: "Standard Buying",
    warehouse: "Stores - SD",
    items: [
      {
        no: 1,
        itemCode: "PRIMER-20L",
        itemName: "PRIMER 20 LTR",
        requiredBy: "2026-05-15",
        quantity: 10,
        warehouse: "Stores - SD",
        uom: "LTR",
      },
      {
        no: 2,
        itemCode: "THINNER-5L",
        itemName: "THINNER 5 LTR",
        requiredBy: "2026-05-15",
        quantity: 5,
        warehouse: "Stores - SD",
        uom: "LTR",
      },
    ],
  },
  {
    _id: "MREQ-00008",
    title:
      "Purchase Request for 8'6\" GALVANIZED SHEET [0.45MM] GRAY COLOUR -35NOS, 17'6\" GALVANIZED SHEET [0.45MM]",
    status: "Ordered",
    purpose: "Purchase",
    requiredBy: "2026-05-20",
    transactionDate: "2026-05-03",
    priceList: "Standard Buying",
    warehouse: "Stores - SD",
    items: [
      {
        no: 1,
        itemCode: "GS-8.6-045-GRAY",
        itemName: "8'6\" GALVANIZED SHEET [0.45MM] GRAY COLOUR",
        requiredBy: "2026-05-20",
        quantity: 35,
        warehouse: "Stores - SD",
        uom: "NOS",
      },
      {
        no: 2,
        itemCode: "GS-17.6-045",
        itemName: "17'6\" GALVANIZED SHEET [0.45MM]",
        requiredBy: "2026-05-20",
        quantity: 20,
        warehouse: "Stores - SD",
        uom: "NOS",
      },
    ],
  },
  {
    _id: "MREQ-00009",
    title:
      "Purchase Request for TRANSPARENT SHEET 6'x3'6\" [1.5MM]: 1.5MM COMPACT CLEAR NATLITE (1.08x1.830)6'=24NOS",
    status: "Partially Ordered",
    purpose: "Purchase",
    requiredBy: "2026-05-25",
    transactionDate: "2026-05-04",
    priceList: "Standard Buying",
    warehouse: "Stores - SD",
    items: [
      {
        no: 1,
        itemCode: "TS-6x3.6-1.5-CLEAR",
        itemName:
          "TRANSPARENT SHEET 6'x3'6\" [1.5MM]: 1.5MM COMPACT CLEAR NATLITE (1.08x1.830)6'=24NOS",
        requiredBy: "2026-05-25",
        quantity: 24,
        warehouse: "Stores - SD",
        uom: "SQM",
      },
    ],
  },
];

// Helper function: Convert YYYY-MM-DD to DD-MM-YYYY for display
const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

// Helper function: Convert DD-MM-YYYY to YYYY-MM-DD for backend/input
const convertToYYYYMMDD = (dateStr) => {
  if (!dateStr) return "";
  // Check if it's already in YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  // Convert from DD-MM-YYYY to YYYY-MM-DD
  const [day, month, year] = dateStr.split("-");
  if (day && month && year) {
    return `${year}-${month}-${day}`;
  }
  return "";
};

// Autocomplete Item Row Component
const ItemRow = ({ item, index, handleItemChange, handleItemCodeChange, handleKeyDown, selectSuggestion, suggestions, activeSuggestionIndex, setActiveSuggestionIndex, isActive, inputRef }) => {
  // Display date in DD-MM-YYYY format for the input field
  const displayDate = item.requiredBy ? formatDateToDDMMYYYY(item.requiredBy) : "";
  
  return (
    <tr>
      <td style={{ padding: "8px 12px", textAlign: "center", verticalAlign: "middle" }}>
        {item.no || index + 1}
      </td>
      <td style={{ padding: "8px 12px", position: "relative", verticalAlign: "middle" }}>
        <input
          ref={inputRef}
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
        />
        {/* Suggestions Dropdown */}
        {isActive && suggestions.length > 0 && (
          <div
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
                  backgroundColor:
                    sIdx === activeSuggestionIndex ? "#eff6ff" : "#fff",
                  borderBottom:
                    sIdx < suggestions.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                  transition: "background-color 0.1s ease",
                }}
                onMouseEnter={() => setActiveSuggestionIndex(sIdx)}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: "#111827",
                    fontSize: "0.85rem",
                    marginBottom: "2px",
                  }}
                >
                  {suggestion.itemCode}
                </div>
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "0.78rem",
                  }}
                >
                  {suggestion.itemName}
                </div>
              </div>
            ))}
          </div>
        )}
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input
          type="text"
          placeholder="DD-MM-YYYY"
          value={displayDate}
          onChange={(e) => {
            // Store in YYYY-MM-DD format in state
            const yyyymmdd = convertToYYYYMMDD(e.target.value);
            handleItemChange(index, "requiredBy", yyyymmdd);
          }}
          bsSize="sm"
        />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) =>
            handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)
          }
          placeholder="0.000"
          step="0.001"
          bsSize="sm"
        />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input
          type="text"
          value={item.warehouse}
          onChange={(e) => handleItemChange(index, "warehouse", e.target.value)}
          bsSize="sm"
        />
      </td>
      <td style={{ padding: "8px 12px", verticalAlign: "middle" }}>
        <Input
          type="text"
          value={item.uom}
          onChange={(e) => handleItemChange(index, "uom", e.target.value)}
          placeholder="UOM"
          bsSize="sm"
        />
      </td>
    </tr>
  );
};

const MaterialRequestPage = () => {
  const [materialRequests, setMaterialRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [onSearch, setOnSearch] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    transactionDate: "",
    purpose: "Purchase",
    requiredBy: "",
    priceList: "Standard Buying",
    warehouse: "Stores - SD",
    items: [
      {
        no: 1,
        itemCode: "",
        itemName: "",
        requiredBy: "",
        quantity: 0,
        warehouse: "Stores - SD",
        uom: "",
      },
    ],
  });

  // Autocomplete state
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const itemInputRefs = useRef({});

  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMaterialRequests(dummyMaterialRequests);
      setFiltered(dummyMaterialRequests);
      setLoading(false);
    }, 300);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeAutocompleteIndex !== null) {
        // Check if click is outside any suggestion dropdown or input
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
      setFiltered(materialRequests);
    } else {
      const keyword = search.toLowerCase();
      setFiltered(
        materialRequests.filter(
          (req) =>
            req.title?.toLowerCase().includes(keyword) ||
            req._id?.toLowerCase().includes(keyword) ||
            req.purpose?.toLowerCase().includes(keyword)
        )
      );
    }
  }, [search, materialRequests]);

  const sliceTitle = (title, maxLength = 55) => {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + "...";
  };

  // *** UPDATED getStatusBadge with white text ***
  const getStatusBadge = (status) => {
    let backgroundColor = "";
    let borderColor = "";

    switch (status) {
      case "Pending":
        backgroundColor = "#f59e0f"; // Amber
        borderColor = "#d97706";
        break;
      case "Ordered":
        backgroundColor = "#10b981"; // Emerald
        borderColor = "#059669";
        break;
      case "Partially Ordered":
        backgroundColor = "#3b82f6"; // Blue
        borderColor = "#2563eb";
        break;
      default:
        backgroundColor = "#6b7280"; // Gray
        borderColor = "#4b5563";
    }

    return (
      <span
        style={{
          backgroundColor,
          border: `1px solid ${borderColor}`,
          color: "#ffffff", // White text
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

  const goToDetails = (request) => {
    history.push(`/material-request-details/${request._id}`, {
      requestData: request,
    });
  };

  // Handle item code input change with autocomplete
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

  // Select suggestion
  const selectSuggestion = (index, item) => {
    const updatedItems = [...newRequest.items];
    updatedItems[index] = {
      ...updatedItems[index],
      itemCode: item.itemCode,
      itemName: item.itemName,
      uom: item.uom,
      warehouse: item.warehouse || updatedItems[index].warehouse,
    };
    setNewRequest((prev) => ({ ...prev, items: updatedItems }));
    setSuggestions([]);
    setActiveAutocompleteIndex(null);
    setActiveSuggestionIndex(-1);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e, index) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
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
    setNewRequest((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          no: prev.items.length + 1,
          itemCode: "",
          itemName: "",
          requiredBy: prev.requiredBy || "",
          quantity: 0,
          warehouse: prev.warehouse || "Stores - SD",
          uom: "",
        },
      ],
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newRequest.items];
    updatedItems[index][field] = value;
    setNewRequest((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleAddRequest = () => {
    const newId = `MREQ-${String(materialRequests.length + 1).padStart(5, "0")}`;
    const requestToAdd = {
      _id: newId,
      title: `Purchase Request for ${newRequest.items[0]?.itemName || newRequest.items[0]?.itemCode || "Materials"}`,
      status: "Pending",
      purpose: newRequest.purpose,
      requiredBy: newRequest.requiredBy,
      transactionDate: newRequest.transactionDate,
      priceList: newRequest.priceList,
      warehouse: newRequest.warehouse,
      items: newRequest.items.map((item, idx) => ({ ...item, no: idx + 1 })),
    };
    const updated = [requestToAdd, ...materialRequests];
    setMaterialRequests(updated);
    setFiltered(updated);
    setAddModal(false);
    setNewRequest({
      transactionDate: "",
      purpose: "Purchase",
      requiredBy: "",
      priceList: "Standard Buying",
      warehouse: "Stores - SD",
      items: [
        {
          no: 1,
          itemCode: "",
          itemName: "",
          requiredBy: "",
          quantity: 0,
          warehouse: "Stores - SD",
          uom: "",
        },
      ],
    });
  };

  // Format date for display in table (DD-MM-YYYY)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  return (
    <>
      <Head title="Material Request" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">Material Request</BlockTitle>
            </BlockHeadContent>
            <Button color="primary" onClick={() => setAddModal(true)}>
              <Icon name="plus" /> Add Material Request
            </Button>
          </BlockBetween>
        </BlockHead>

        <Block>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #e5e7eb",
                  borderTopColor: "#3b82f6",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p style={{ color: "#6b7280" }}>Loading material requests...</p>
            </div>
          ) : (
            <DataTable className="card-stretch w-100">
              {/* Search Bar */}
              <div className="card-inner position-relative card-tools-toggle">
                <div className="card-title-group">
                  <div className="card-tools mr-n1">
                    <ul className="btn-toolbar gx-1">
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
                        placeholder="Search by title, ID or purpose"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div style={{ padding: "0 20px 20px" }}>
                <div
                  style={{
                    borderRadius: "8px",
                    marginTop : "20px",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.88rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#f9fafb",
                          borderBottom: "2px solid #e5e7eb",
                        }}
                      >
                        <th
                          style={{
                            padding: "14px 16px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#374151",
                            width: "35%",
                          }}
                        >
                          Title
                        </th>
                        <th
                          style={{
                            padding: "14px 16px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#374151",
                            width: "18%",
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: "14px 16px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#374151",
                            width: "15%",
                          }}
                        >
                          Purpose
                        </th>
                        <th
                          style={{
                            padding: "14px 16px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#374151",
                            width: "15%",
                          }}
                        >
                          Required By
                        </th>
                        <th
                          style={{
                            padding: "14px 16px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#374151",
                            width: "17%",
                          }}
                        >
                          ID
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length > 0 ? (
                        filtered.map((req, idx) => (
                          <tr
                            key={req._id}
                            style={{
                              borderBottom:
                                idx < filtered.length - 1
                                  ? "1px solid #f3f4f6"
                                  : "none",
                            }}
                          >
                            <td style={{ padding: "14px 16px" }}>
                              <button
                                onClick={() => goToDetails(req)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#2563eb",
                                  cursor: "pointer",
                                  fontWeight: 500,
                                  textAlign: "left",
                                  padding: 0,
                                  wordBreak: "break-word",
                                  lineHeight: "1.4",
                                  fontSize: "0.88rem",
                                }}
                                title={req.title}
                              >
                                {sliceTitle(req.title, 55)}
                              </button>
                            </td>
                            <td style={{ padding: "8px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "500",
                              color: "white", }}>
                              {getStatusBadge(req.status)}
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                color: "#374151",
                                fontWeight: 500,
                              }}
                            >
                              {req.purpose}
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                color: "#374151",
                                fontSize: "0.85rem",
                              }}
                            >
                              {formatDateForDisplay(req.requiredBy)}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <code
                                style={{
                                  backgroundColor: "#f9fafb",
                                  padding: "4px 10px",
                                  borderRadius: "4px",
                                  fontSize: "0.82rem",
                                  color: "#374151",
                                  border: "1px solid #e5e7eb",
                                  fontWeight: 600,
                                }}
                              >
                                {req._id}
                              </code>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              textAlign: "center",
                              padding: "48px 16px",
                              color: "#9ca3af",
                            }}
                          >
                            No material requests found
                          </td>
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

      {/* Add Material Request Modal */}
      <Modal
        isOpen={addModal}
        toggle={() => {
          setAddModal(false);
          setActiveAutocompleteIndex(null);
          setSuggestions([]);
        }}
        centered
        size="xl"
        backdrop="static"
      >
        <ModalHeader toggle={() => {
          setAddModal(false);
          setActiveAutocompleteIndex(null);
          setSuggestions([]);
        }}>
          New Material Request
        </ModalHeader>
        <ModalBody>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <FormGroup>
                <Label for="transactionDate">Transaction Date *</Label>
                <Input
                  type="text"
                  id="transactionDate"
                  placeholder="DD-MM-YYYY"
                  value={newRequest.transactionDate ? formatDateToDDMMYYYY(newRequest.transactionDate) : ""}
                  onChange={(e) => {
                    const yyyymmdd = convertToYYYYMMDD(e.target.value);
                    setNewRequest({ ...newRequest, transactionDate: yyyymmdd });
                  }}
                />
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup>
                <Label for="purpose">Purpose *</Label>
                <Input
                  type="select"
                  id="purpose"
                  value={newRequest.purpose}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, purpose: e.target.value })
                  }
                >
                  <option>Purchase</option>
                  <option>Material Transfer</option>
                  <option>Material Issue</option>
                  <option>Manufacture</option>
                  <option>Customer Provided</option>
                </Input>
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup>
                <Label for="requiredBy">Required By *</Label>
                <Input
                  type="text"
                  id="requiredBy"
                  placeholder="DD-MM-YYYY"
                  value={newRequest.requiredBy ? formatDateToDDMMYYYY(newRequest.requiredBy) : ""}
                  onChange={(e) => {
                    const yyyymmdd = convertToYYYYMMDD(e.target.value);
                    setNewRequest({ ...newRequest, requiredBy: yyyymmdd });
                  }}
                />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="priceList">Price List</Label>
                <Input
                  type="text"
                  id="priceList"
                  value={newRequest.priceList}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, priceList: e.target.value })
                  }
                />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="warehouse">Set Warehouse</Label>
                <Input
                  type="text"
                  id="warehouse"
                  value={newRequest.warehouse}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, warehouse: e.target.value })
                  }
                />
              </FormGroup>
            </div>
          </div>

          <h6 style={{ fontWeight: 600, marginBottom: "12px", marginTop: "10px" }}>Add Materials</h6>
          <div
            style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "visible",
              marginBottom: "16px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th style={{ padding: "10px 12px", width: "50px" }}>No.</th>
                  <th style={{ padding: "10px 12px", minWidth: "200px" }}>Item Code *</th>
                  <th style={{ padding: "10px 12px", width: "150px" }}>Required By *</th>
                  <th style={{ padding: "10px 12px", width: "120px" }}>Quantity *</th>
                  <th style={{ padding: "10px 12px", minWidth: "150px" }}>Warehouse</th>
                  <th style={{ padding: "10px 12px", width: "100px" }}>UOM *</th>
                 </tr>
              </thead>
              <tbody>
                {newRequest.items.map((item, index) => (
                  <ItemRow
                    key={index}
                    item={item}
                    index={index}
                    handleItemChange={handleItemChange}
                    handleItemCodeChange={handleItemCodeChange}
                    handleKeyDown={handleKeyDown}
                    selectSuggestion={selectSuggestion}
                    suggestions={suggestions}
                    activeSuggestionIndex={activeSuggestionIndex}
                    setActiveSuggestionIndex={setActiveSuggestionIndex}
                    isActive={activeAutocompleteIndex === index}
                    inputRef={(el) => (itemInputRefs.current[index] = el)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <Button color="light" style={{padding:"12px"}} onClick={addItemRow}>
                <Icon name="plus" /> Add Row
              </Button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Button color="secondary" onClick={() => {
                setAddModal(false);
                setActiveAutocompleteIndex(null);
                setSuggestions([]);
              }}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleAddRequest}>
                Submit Request
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Spinner animation style */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Fix date input overlapping */
        .form-control[type="date"] {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  );
};

export default MaterialRequestPage;