import React, { useState, useEffect } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { errorToast, successToast } from "../../../utils/toaster";
import {
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  DropdownItem,
} from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  UserAvatar,
  PaginationComponent,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  Button,
} from "../../../components/Component";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api`;

// ─── Inline styles ─────────────────────────────────────────────────────────────
const S = {
  modalBody: {
    padding: "1.5rem",
    overflowY: "auto",
    maxHeight: "85vh",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 10,
  },
  totalsBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "1rem 1.25rem",
    marginTop: "0.5rem",
  },
  grandTotalValue: { color: "#28a745" },
  saveBtn: {
    backgroundColor: "#644634",
    borderColor: "#800000",
    color: "#fff",
    padding: "6px 20px",
  },
  quoteLink: { cursor: "pointer", color: "#3b82f6", fontWeight: 500 },
  badge: (status) => ({
    padding: "4px 10px",
    color: "white",
    borderRadius: "14px",
    background:
      status === "Approved"
        ? "#28a745"
        : status === "Sent"
        ? "#ffc107"
        : status === "Draft"
        ? "#dc3545"
        : "#6c757d",
  }),
};

// ─── QuotationForm — Enhanced with boxed item entry and labels ────────────────
const QuotationForm = ({
  formData,
  setFormData,
  newItem,
  setNewItem,
  handleAddItem,
  updateLineItemPrice,
  updateLineItemQuantity,
  removeLineItem,
  saveQuotation,
  onFormCancel,
  isEditMode,
}) => (
  <div className="mt-4">
    {/* Customer Details */}
    {/* <h6 className="mb-3">Customer Details</h6> */}
    <div className="row gy-3 mb-4">
      {[
        { label: "Client Name *", field: "name", type: "text", placeholder: "Enter client name", col: "col-md-6" },
        { label: "Contact Person *", field: "contactPerson", type: "text", placeholder: "Contact person", col: "col-md-6" },
        { label: "Phone *", field: "phone", type: "tel", placeholder: "Phone number", col: "col-md-6" },
        { label: "Alternate Phone", field: "altPhone", type: "tel", placeholder: "Alternate phone", col: "col-md-6" },
        { label: "Email", field: "email", type: "email", placeholder: "Email address", col: "col-md-6" },
        { label: "GST Number", field: "gst", type: "text", placeholder: "GSTIN", col: "col-md-6" },
      ].map(({ label, field, type, placeholder, col }) => (
        <div className={col} key={field}>
          <FormGroup>
            <label className="form-label">{label}</label>
            <input
              className="form-control"
              type={type}
              value={formData.client[field]}
              onChange={(e) =>
                setFormData((p) => ({ ...p, client: { ...p.client, [field]: e.target.value } }))
              }
              placeholder={placeholder}
            />
          </FormGroup>
        </div>
      ))}
      <div className="col-12">
        <FormGroup>
          <label className="form-label">Address</label>
          <textarea
            className="form-control"
            rows="2"
            value={formData.client.address}
            onChange={(e) =>
              setFormData((p) => ({ ...p, client: { ...p.client, address: e.target.value } }))
            }
            placeholder="Complete address"
          />
        </FormGroup>
      </div>
    </div>

    {/* Item Entry - Boxed Section with Labels */}
    <h6 className="mb-2 mt-2">Items</h6>
    <div
      className="item-entry-box"
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "1rem",
        background: "#fafcff",
        marginBottom: "1.5rem",
      }}
    >
      <div className="row g-3 align-items-end">
        <div className="col-md-5">
          <label className="form-label">Item Name</label>
          <input
            className="form-control"
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g., Cement, Steel, Labour"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Price (₹)</label>
          <input
            className="form-control"
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
            placeholder="Price per unit"
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Quantity</label>
          <input
            className="form-control"
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem((p) => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
            placeholder="Qty"
          />
        </div>
        <div className="col-md-2">
          <Button color="primary" onClick={handleAddItem} block style={{ marginTop: "0" }}>
            <Icon name="plus" /> Add
          </Button>
        </div>
      </div>
    </div>

    {/* Existing Item List */}
    {formData.lineItems.length > 0 && (
      <div className="table-responsive mb-4">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th></th>
            </tr>
          </thead>
          <tbody>
            {formData.lineItems.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.name}</td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={item.price}
                    onChange={(e) => updateLineItemPrice(item.id, parseFloat(e.target.value) || 0)}
                    style={{ width: "100px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={item.quantity}
                    onChange={(e) => updateLineItemQuantity(item.id, parseInt(e.target.value) || 1)}
                    style={{ width: "80px" }}
                  />
                </td>
                <td>₹{(item.price * item.quantity).toLocaleString()}</td>
                <td>
                  <Button color="danger" size="sm" onClick={() => removeLineItem(item.id)}>
                    <Icon name="trash" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Discount, Status, Notes */}
    <div className="row gy-3 mb-4">
      <div className="col-md-6">
        <FormGroup>
          <label className="form-label">Discount (₹)</label>
          <input
            className="form-control"
            type="number"
            value={formData.discount}
            onChange={(e) =>
              setFormData((p) => ({ ...p, discount: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormGroup>
      </div>
      <div className="col-md-6">
        <FormGroup>
          <label className="form-label">Status</label>
          <select
            className="form-control"
            value={formData.status}
            onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </FormGroup>
      </div>
      <div className="col-12">
        <FormGroup>
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            rows="2"
            value={formData.notes}
            onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Additional notes..."
          />
        </FormGroup>
      </div>
    </div>

    {/* Totals Box */}
    <div style={S.totalsBox}>
      <div className="d-flex justify-content-between mb-1">
        <span>Subtotal:</span>
        <span>₹{formData.subtotal?.toLocaleString() || 0}</span>
      </div>
      {formData.discount > 0 && (
        <div className="d-flex justify-content-between mb-1 text-danger">
          <span>Discount:</span>
          <span>- ₹{formData.discount.toLocaleString()}</span>
        </div>
      )}
      <div className="d-flex justify-content-between pt-2 border-top">
        <strong>Grand Total:</strong>
        <strong style={S.grandTotalValue}>₹{formData.totalAfterDiscount?.toLocaleString() || 0}</strong>
      </div>
    </div>

    {/* Action Buttons */}
    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2 mt-4">
      <li>
        <Button style={S.saveBtn} size="md" onClick={saveQuotation}>
          {isEditMode ? "Update Quotation" : "Add Quotation"}
        </Button>
      </li>
      <li>
        <a
          href="#cancel"
          onClick={(ev) => { ev.preventDefault(); onFormCancel(); }}
          className="link link-light"
        >
          Cancel
        </a>
      </li>
    </ul>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const Quotation = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [modal, setModal] = useState({ add: false, edit: false, view: false });
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const emptyForm = {
    id: null,
    quoteNumber: "",
    date: new Date().toISOString().split("T")[0],
    client: { name: "", contactPerson: "", phone: "", altPhone: "", email: "", address: "", gst: "" },
    lineItems: [],
    discount: 0,
    status: "Draft",
    subtotal: 0,
    totalAfterDiscount: 0,
    notes: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [newItem, setNewItem] = useState({ name: "", price: 0, quantity: 1, total: 0 });

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: itemPerPage };
      if (onSearchText) params.search = onSearchText;
      if (selectedDate) { params.startDate = selectedDate; params.endDate = selectedDate; }
      const response = await axios.get(`${API_URL}/quotations`, { params });
      const list = response.data.data || [];
      setData(list);
      setOriginalData(list);
    } catch (error) {
      errorToast(error.response?.data?.message || "Failed to fetch quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuotations(); }, [currentPage, itemPerPage]);

  useEffect(() => {
    if (onSearchText !== "") {
      const filtered = originalData.filter(
        (item) =>
          item.client?.name?.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.quoteNumber?.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.client?.contactPerson?.toLowerCase().includes(onSearchText.toLowerCase())
      );
      setData(filtered);
    } else {
      setData(originalData);
    }
  }, [onSearchText, originalData]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = originalData.filter(
        (item) => new Date(item.date).toISOString().split("T")[0] === selectedDate
      );
      setData(filtered);
    } else {
      setData(originalData);
    }
  }, [selectedDate]);

  // Recalculate totals
  useEffect(() => {
    const subtotal = formData.lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAfterDiscount = Math.max(0, subtotal - (formData.discount || 0));
    setFormData((prev) => ({ ...prev, subtotal, totalAfterDiscount }));
  }, [formData.lineItems, formData.discount]);

  const sortFunc = (order) => {
    const sorted = [...data].sort((a, b) =>
      order === "asc"
        ? a.client.name.localeCompare(b.client.name)
        : b.client.name.localeCompare(a.client.name)
    );
    setData(sorted);
    setSortOrder(order);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setNewItem({ name: "", price: 0, quantity: 1, total: 0 });
  };

  const onFormCancel = () => { setModal({ add: false, edit: false, view: false }); resetForm(); };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return errorToast("Please enter item name");
    if (newItem.price <= 0) return errorToast("Please enter valid price");
    if (newItem.quantity <= 0) return errorToast("Please enter valid quantity");
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { id: Date.now(), productId: Date.now(), ...newItem, total: newItem.price * newItem.quantity },
      ],
    }));
    setNewItem({ name: "", price: 0, quantity: 1, total: 0 });
  };

  const updateLineItemQuantity = (itemId, val) => {
    if (val < 1) return;
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === itemId ? { ...item, quantity: val, total: item.price * val } : item
      ),
    }));
  };

  const updateLineItemPrice = (itemId, val) => {
    if (val < 0) return;
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === itemId ? { ...item, price: val, total: val * item.quantity } : item
      ),
    }));
  };

  const removeLineItem = (itemId) => {
    setFormData((prev) => ({ ...prev, lineItems: prev.lineItems.filter((i) => i.id !== itemId) }));
  };

  const onEditClick = (quotation) => {
    setIsEditMode(true);
    setFormData({
      id: quotation._id,
      quoteNumber: quotation.quoteNumber,
      date: quotation.date.split("T")[0],
      client: quotation.client,
      lineItems: quotation.lineItems.map((item) => ({ ...item, id: item._id || Date.now() })),
      discount: quotation.discount,
      status: quotation.status,
      subtotal: quotation.subtotal,
      totalAfterDiscount: quotation.totalAfterDiscount,
      notes: quotation.notes || "",
    });
    setModal({ edit: true });
  };

  const handleDeleteQuotation = async (id, quoteNumber) => {
    if (window.confirm(`Delete quotation ${quoteNumber}? This action cannot be undone.`)) {
      try {
        await axios.delete(`${API_URL}/quotations/${id}`);
        successToast("Quotation deleted successfully");
        fetchQuotations();
      } catch (error) {
        errorToast(error.response?.data?.message || "Failed to delete quotation");
      }
    }
  };

  const saveQuotation = async () => {
    if (!formData.client.name.trim()) return errorToast("Client name is required");
    if (!formData.client.contactPerson.trim()) return errorToast("Contact person is required");
    if (!formData.client.phone.trim()) return errorToast("Phone number is required");
    if (formData.lineItems.length === 0) return errorToast("At least one item is required");
    try {
      const payload = {
        client: formData.client,
        lineItems: formData.lineItems.map(({ id, productId, name, price, quantity, total }) => ({
          productId: productId || id, name, price, quantity, total,
        })),
        discount: formData.discount,
        status: formData.status,
        notes: formData.notes,
      };
      if (isEditMode) {
        await axios.put(`${API_URL}/quotations/${formData.id}`, payload);
        successToast("Quotation updated successfully");
      } else {
        await axios.post(`${API_URL}/quotations`, payload);
        successToast("Quotation created successfully");
      }
      setModal({ add: false, edit: false });
      fetchQuotations();
    } catch (error) {
      errorToast(error.response?.data?.message || "Failed to save quotation");
    }
  };

  const toggle = () => setonSearch(!onSearch);
  const getInitials = (name) =>
    name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const indexOfLastItem = currentPage * itemPerPage;
  const currentItems = data.slice(indexOfLastItem - itemPerPage, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Shared props for QuotationForm
  const formProps = {
    formData, setFormData, newItem, setNewItem,
    handleAddItem, updateLineItemPrice, updateLineItemQuantity,
    removeLineItem, saveQuotation, onFormCancel, isEditMode,
  };

  return (
    <React.Fragment>
      <Head title="Quotations" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>Quotations Lists</BlockTitle>
              <BlockDes className="text-soft">
                <p>You have total {data?.length} quotations.</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className={`btn-icon btn-trigger toggle-expand mr-n1 ${sm ? "active" : ""}`}
                  onClick={() => updateSm(!sm)}
                >
                  <Icon name="menu-alt-r" />
                </Button>
                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                  <ul className="nk-block-tools g-3">
                    <li>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Icon name="calendar" />
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          style={{ width: "160px" }}
                        />
                        {selectedDate && (
                          <button className="btn btn-sm btn-light" onClick={() => setSelectedDate("")}>
                            <Icon name="x" />
                          </button>
                        )}
                      </div>
                    </li>
                    <li className="nk-block-tools-opt">
                      <Button
                        className="btn-icon"
                        style={{ backgroundColor: "#644634", borderColor: "#800000", color: "#fff" }}
                        onClick={() => { setIsEditMode(false); resetForm(); setModal({ add: true }); }}
                      >
                        <Icon name="plus" />
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <DataTable className="card-stretch">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <div className="card-tools">
                  <div className="form-inline flex-nowrap gx-3">
                    <div className="btn-wrap">
                      <span className="d-md-none">
                        <Button color="light" outline className="btn-dim btn-icon">
                          <Icon name="arrow-left" />
                        </Button>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-tools mr-n1">
                  <ul className="btn-toolbar gx-1">
                    <li>
                      <a href="#search" onClick={(ev) => { ev.preventDefault(); toggle(); }}
                        className="btn btn-icon search-toggle toggle-search">
                        <Icon name="search" />
                      </a>
                    </li>
                    <li className="btn-toolbar-sep" />
                    <li>
                      <div className="toggle-wrap">
                        <Button
                          className={`btn-icon btn-trigger toggle ${tablesm ? "active" : ""}`}
                          onClick={() => updateTableSm(true)}
                        >
                          <Icon name="menu-right" />
                        </Button>
                        <div className={`toggle-content ${tablesm ? "content-active" : ""}`}>
                          <ul className="btn-toolbar gx-1">
                            <li className="toggle-close">
                              <Button className="btn-icon btn-trigger toggle" onClick={() => updateTableSm(false)}>
                                <Icon name="arrow-left" />
                              </Button>
                            </li>
                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                                  <Icon name="setting" />
                                </DropdownToggle>
                                <DropdownMenu right className="dropdown-menu-xs">
                                  <ul className="link-check">
                                    <li><span>Show</span></li>
                                    {[10, 15, 20].map((n) => (
                                      <li key={n} className={itemPerPage === n ? "active" : ""}>
                                        <DropdownItem tag="a" href="#dropdownitem"
                                          onClick={(ev) => { ev.preventDefault(); setItemPerPage(n); setCurrentPage(1); }}>
                                          {n}
                                        </DropdownItem>
                                      </li>
                                    ))}
                                  </ul>
                                  <ul className="link-check">
                                    <li><span>Order</span></li>
                                    <li className={sortOrder === "dsc" ? "active" : ""}>
                                      <DropdownItem tag="a" href="#dropdownitem"
                                        onClick={(ev) => { ev.preventDefault(); sortFunc("dsc"); }}>DESC</DropdownItem>
                                    </li>
                                    <li className={sortOrder === "asc" ? "active" : ""}>
                                      <DropdownItem tag="a" href="#dropdownitem"
                                        onClick={(ev) => { ev.preventDefault(); sortFunc("asc"); }}>ASC</DropdownItem>
                                    </li>
                                  </ul>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button className="search-back btn-icon toggle-search active"
                      onClick={() => { setSearchText(""); toggle(); fetchQuotations(); }}>
                      <Icon name="arrow-left" />
                    </Button>
                    <input
                      type="text"
                      className="border-transparent form-focus-none form-control"
                      placeholder="Search by client name, quote #, or contact person..."
                      value={onSearchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button className="search-submit btn-icon">
                      <Icon name="search" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DataTableBody compact>
              <DataTableHead>
                <DataTableRow className="nk-tb-col-check" />
                <DataTableRow><span className="sub-text">Client Name</span></DataTableRow>
                <DataTableRow size="md"><span className="sub-text">Date</span></DataTableRow>
                <DataTableRow><span className="sub-text">Quotation #</span></DataTableRow>
                <DataTableRow size="md"><span className="sub-text">Total Value</span></DataTableRow>
                <DataTableRow><span className="sub-text">Status</span></DataTableRow>
                <DataTableRow className="nk-tb-col-tools text-right"><span>More</span></DataTableRow>
              </DataTableHead>

              {currentItems.length > 0
                ? currentItems.map((quote) => (
                    <DataTableItem key={quote._id}>
                      <DataTableRow className="nk-tb-col-check" />
                      <DataTableRow>
                        <div className="user-card">
                          <UserAvatar text={getInitials(quote.client.name)} className="sm" />
                          <div className="user-info">
                            <span className="tb-lead">{quote.client.name}</span>
                            <span className="tb-sub">{quote.client.contactPerson}</span>
                          </div>
                        </div>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span>{new Date(quote.date).toLocaleDateString()}</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span
                          style={S.quoteLink}
                          onClick={() => { setSelectedQuotation(quote); setModal({ view: true }); }}
                        >
                          {quote.quoteNumber}
                        </span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span>₹{quote.totalAfterDiscount?.toLocaleString()}</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span style={S.badge(quote.status)}>{quote.status}</span>
                      </DataTableRow>
                      <DataTableRow className="nk-tb-col-tools">
                        <ul className="nk-tb-actions gx-1">
                          <li>
                            <UncontrolledDropdown>
                              <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                <Icon name="more-h" />
                              </DropdownToggle>
                              <DropdownMenu right>
                                <ul className="link-list-opt no-bdr">
                                  <li onClick={() => { setSelectedQuotation(quote); setModal({ view: true }); }}>
                                    <DropdownItem tag="a" href="#view" onClick={(e) => e.preventDefault()}>
                                      <Icon name="eye" /><span>View Details</span>
                                    </DropdownItem>
                                  </li>
                                  <li onClick={() => onEditClick(quote)}>
                                    <DropdownItem tag="a" href="#edit" onClick={(e) => e.preventDefault()}>
                                      <Icon name="edit" /><span>Edit</span>
                                    </DropdownItem>
                                  </li>
                                  <li onClick={() => handleDeleteQuotation(quote._id, quote.quoteNumber)}>
                                    <DropdownItem tag="a" href="#delete" onClick={(e) => e.preventDefault()}>
                                      <Icon name="trash" /><span>Delete</span>
                                    </DropdownItem>
                                  </li>
                                </ul>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </li>
                        </ul>
                      </DataTableRow>
                    </DataTableItem>
                  ))
                : null}
            </DataTableBody>

            <div className="card-inner">
              {currentItems.length > 0 ? (
                <PaginationComponent
                  itemPerPage={itemPerPage}
                  totalItems={data.length}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              ) : (
                <div className="text-center">
                  <span className="text-silent">No data found</span>
                </div>
              )}
            </div>
          </DataTable>
        </Block>

        {/* ── Add Modal ── */}
        <Modal isOpen={modal.add} toggle={() => setModal({ add: false })}
          className="modal-dialog-centered" size="lg">
          <ModalBody style={S.modalBody}>
            <a href="#cancel" onClick={(ev) => { ev.preventDefault(); onFormCancel(); }}
              className="close" style={S.closeBtn}>
              <Icon name="cross-sm" />
            </a>
            <h5 className="title">Add Quotation</h5>
            <QuotationForm {...formProps} />
          </ModalBody>
        </Modal>

        {/* ── Edit Modal ── */}
        <Modal isOpen={modal.edit} toggle={() => setModal({ edit: false })}
          className="modal-dialog-centered" size="lg">
          <ModalBody style={S.modalBody}>
            <a href="#cancel" onClick={(ev) => { ev.preventDefault(); onFormCancel(); }}
              className="close" style={S.closeBtn}>
              <Icon name="cross-sm" />
            </a>
            <h5 className="title">Edit Quotation</h5>
            <QuotationForm {...formProps} />
          </ModalBody>
        </Modal>

        {/* ── View Modal ── */}
        <Modal isOpen={modal.view} toggle={() => setModal({ view: false })}
          className="modal-dialog-centered" size="lg">
          <ModalBody style={S.modalBody}>
            <a href="#cancel" onClick={(ev) => { ev.preventDefault(); setModal({ view: false }); }}
              className="close" style={S.closeBtn}>
              <Icon name="cross-sm" />
            </a>
            <h5 className="title">Quotation Details</h5>
            {selectedQuotation && (
              <div className="mt-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Sree Daksha</h6>
                    <p className="text-soft">Building Materials Supplier</p>
                  </div>
                  <div className="col-md-6 text-right">
                    <h5>{selectedQuotation.quoteNumber}</h5>
                    <p>Date: {new Date(selectedQuotation.date).toLocaleDateString()}</p>
                    <span style={S.badge(selectedQuotation.status)}>{selectedQuotation.status}</span>
                  </div>
                </div>

                <div className="border rounded p-3 mb-4">
                  <h6>Bill To:</h6>
                  <p className="mb-0">
                    <strong>{selectedQuotation.client.name}</strong><br />
                    Attn: {selectedQuotation.client.contactPerson}<br />
                    Phone: {selectedQuotation.client.phone}<br />
                    {selectedQuotation.client.email && <>Email: {selectedQuotation.client.email}<br /></>}
                    {selectedQuotation.client.address && <>Address: {selectedQuotation.client.address}<br /></>}
                    GST: {selectedQuotation.client.gst || "Not provided"}
                  </p>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th><th>Item</th>
                        <th className="text-center">Price</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotation.lineItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{item.name}</td>
                          <td className="text-center">₹ {item.price}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-right"><strong>Subtotal:</strong></td>
                        <td className="text-right">₹{selectedQuotation.subtotal?.toLocaleString()}</td>
                      </tr>
                      {selectedQuotation.discount > 0 && (
                        <tr>
                          <td colSpan="4" className="text-right"><strong>Discount:</strong></td>
                          <td className="text-right text-danger">- ₹{selectedQuotation.discount.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr className="table-active">
                        <td colSpan="4" className="text-right"><strong>Grand Total:</strong></td>
                        <td className="text-right"><strong>₹{selectedQuotation.totalAfterDiscount?.toLocaleString()}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedQuotation.notes && (
                  <div className="mt-3">
                    <strong>Notes:</strong>
                    <p className="mt-1">{selectedQuotation.notes}</p>
                  </div>
                )}

                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2 mt-4">
                  <li>
                    <Button style={S.saveBtn} size="md"
                      onClick={() => { setModal({ view: false }); onEditClick(selectedQuotation); }}>
                      Edit Quotation
                    </Button>
                  </li>
                  <li>
                    <a href="#cancel"
                      onClick={(ev) => { ev.preventDefault(); setModal({ view: false }); }}
                      className="link link-light">Close</a>
                  </li>
                </ul>
              </div>
            )}
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default Quotation;