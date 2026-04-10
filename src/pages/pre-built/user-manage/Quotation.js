import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  FormGroup,
  Badge,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  DropdownItem,
  Form,
} from "reactstrap";
import { Icon } from "../../../components/Component";
import { errorToast, successToast } from "../../../utils/toaster";
import Head from "../../../layout/head/Head";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  PaginationComponent,
} from "../../../components/Component";
import "./Quotations.css";

// ---------- DUMMY STOCK ITEMS (CONSTRUCTION MATERIALS) ----------
const DUMMY_STOCK_ITEMS = [
  { id: 1, name: "OPC 43 Grade Cement (50kg)", price: 380, category: "Cement" },
  { id: 2, name: "PPC Cement (50kg)", price: 360, category: "Cement" },
  { id: 3, name: "Red Clay Bricks (1000 pcs)", price: 6500, category: "Bricks" },
  { id: 4, name: "Fly Ash Bricks (1000 pcs)", price: 4500, category: "Bricks" },
  { id: 5, name: "TMT Steel Fe500 (per kg)", price: 68, category: "Steel" },
  { id: 6, name: "TMT Steel Fe550 (per kg)", price: 72, category: "Steel" },
  { id: 7, name: "River Sand (per cubic ft)", price: 65, category: "Sand" },
  { id: 8, name: "M Sand (per cubic ft)", price: 55, category: "Sand" },
  { id: 9, name: "20mm Coarse Aggregate (per ton)", price: 1400, category: "Aggregate" },
  { id: 10, name: "10mm Coarse Aggregate (per ton)", price: 1500, category: "Aggregate" },
  { id: 11, name: "Blue Metal (per ton)", price: 1350, category: "Aggregate" },
  { id: 12, name: "White Putty (20kg)", price: 450, category: "Finishing" },
  { id: 13, name: "Primer (4L)", price: 850, category: "Finishing" },
  { id: 14, name: "Emulsion Paint (1L)", price: 220, category: "Finishing" },
  { id: 15, name: "PVC Pipes 4 inch (3m)", price: 380, category: "Plumbing" },
];

// ---------- DUMMY QUOTATIONS (8 items) ----------
const generateDummyQuotations = () => [
  {
    id: 1,
    quoteNumber: "QP-2025-0001",
    date: "2025-03-15",
    client: {
      name: "Shree Constructions",
      contactPerson: "Ramesh Patel",
      phone: "9876543210",
      altPhone: "9876543211",
      email: "ramesh@shreeconst.com",
      address: "23, Industrial Area, Ahmedabad - 380001",
      gst: "24ABCDE1234F1Z",
    },
    lineItems: [
      { id: "li1", productId: 1, name: "OPC 43 Grade Cement (50kg)", price: 380, quantity: 500, total: 190000 },
      { id: "li2", productId: 3, name: "Red Clay Bricks (1000 pcs)", price: 6500, quantity: 20, total: 130000 },
    ],
    discount: 5000,
    subtotal: 320000,
    totalAfterDiscount: 315000,
    status: "Approved",
  },
  {
    id: 2,
    quoteNumber: "QP-2025-0002",
    date: "2025-03-20",
    client: {
      name: "BuildWell Pvt Ltd",
      contactPerson: "Priya Sharma",
      phone: "9988776655",
      altPhone: "",
      email: "priya@buildwell.com",
      address: "45, Trade Centre, Mumbai - 400001",
      gst: "27XYZ9876L4M2N",
    },
    lineItems: [
      { id: "li3", productId: 5, name: "TMT Steel Fe500 (per kg)", price: 68, quantity: 2500, total: 170000 },
      { id: "li4", productId: 7, name: "River Sand (per cubic ft)", price: 65, quantity: 800, total: 52000 },
      { id: "li5", productId: 9, name: "20mm Coarse Aggregate (per ton)", price: 1400, quantity: 30, total: 42000 },
    ],
    discount: 8000,
    subtotal: 264000,
    totalAfterDiscount: 256000,
    status: "Sent",
  },
  {
    id: 3,
    quoteNumber: "QP-2025-0003",
    date: "2025-03-25",
    client: {
      name: "InfraTech Solutions",
      contactPerson: "Amit Singh",
      phone: "8765432109",
      altPhone: "8765432100",
      email: "amit@infratech.com",
      address: "12, IT Park, Pune - 411001",
      gst: "",
    },
    lineItems: [
      { id: "li6", productId: 2, name: "PPC Cement (50kg)", price: 360, quantity: 300, total: 108000 },
      { id: "li7", productId: 4, name: "Fly Ash Bricks (1000 pcs)", price: 4500, quantity: 15, total: 67500 },
      { id: "li8", productId: 6, name: "TMT Steel Fe550 (per kg)", price: 72, quantity: 1800, total: 129600 },
    ],
    discount: 10000,
    subtotal: 305100,
    totalAfterDiscount: 295100,
    status: "Draft",
  },
  {
    id: 4,
    quoteNumber: "QP-2025-0004",
    date: "2025-04-02",
    client: {
      name: "Goyal Enterprises",
      contactPerson: "Suresh Goyal",
      phone: "9988223344",
      altPhone: "",
      email: "suresh@goyalenterprises.com",
      address: "78, Ring Road, Jaipur - 302001",
      gst: "08GOYAL1234F1Z",
    },
    lineItems: [
      { id: "li9", productId: 8, name: "M Sand (per cubic ft)", price: 55, quantity: 1200, total: 66000 },
      { id: "li10", productId: 10, name: "10mm Coarse Aggregate (per ton)", price: 1500, quantity: 40, total: 60000 },
    ],
    discount: 3000,
    subtotal: 126000,
    totalAfterDiscount: 123000,
    status: "Approved",
  },
  {
    id: 5,
    quoteNumber: "QP-2025-0005",
    date: "2025-04-10",
    client: {
      name: "Vishwakarma Constructions",
      contactPerson: "Mahesh Verma",
      phone: "9876541230",
      altPhone: "9876541231",
      email: "mahesh@vishwakarma.com",
      address: "15, Civil Lines, Lucknow - 226001",
      gst: "09VISH1234F1Z",
    },
    lineItems: [
      { id: "li11", productId: 11, name: "Blue Metal (per ton)", price: 1350, quantity: 25, total: 33750 },
      { id: "li12", productId: 12, name: "White Putty (20kg)", price: 450, quantity: 50, total: 22500 },
      { id: "li13", productId: 14, name: "Emulsion Paint (1L)", price: 220, quantity: 100, total: 22000 },
    ],
    discount: 5000,
    subtotal: 78250,
    totalAfterDiscount: 73250,
    status: "Sent",
  },
  {
    id: 6,
    quoteNumber: "QP-2025-0006",
    date: "2025-04-12",
    client: {
      name: "Metro Infrastructure",
      contactPerson: "Neha Gupta",
      phone: "9871234567",
      altPhone: "",
      email: "neha@metroinfra.com",
      address: "22, BKC, Mumbai - 400051",
      gst: "27METRO1234F1Z",
    },
    lineItems: [
      { id: "li14", productId: 1, name: "OPC 43 Grade Cement (50kg)", price: 380, quantity: 1000, total: 380000 },
      { id: "li15", productId: 5, name: "TMT Steel Fe500 (per kg)", price: 68, quantity: 5000, total: 340000 },
    ],
    discount: 20000,
    subtotal: 720000,
    totalAfterDiscount: 700000,
    status: "Draft",
  },
  {
    id: 7,
    quoteNumber: "QP-2025-0007",
    date: "2025-04-15",
    client: {
      name: "Greenfield Housing",
      contactPerson: "Arun Nair",
      phone: "9988774411",
      altPhone: "9988774422",
      email: "arun@greenfield.com",
      address: "7, Green Valley, Kochi - 682001",
      gst: "32GREE1234F1Z",
    },
    lineItems: [
      { id: "li16", productId: 3, name: "Red Clay Bricks (1000 pcs)", price: 6500, quantity: 30, total: 195000 },
      { id: "li17", productId: 7, name: "River Sand (per cubic ft)", price: 65, quantity: 1500, total: 97500 },
      { id: "li18", productId: 15, name: "PVC Pipes 4 inch (3m)", price: 380, quantity: 200, total: 76000 },
    ],
    discount: 12000,
    subtotal: 368500,
    totalAfterDiscount: 356500,
    status: "Approved",
  },
  {
    id: 8,
    quoteNumber: "QP-2025-0008",
    date: "2025-04-18",
    client: {
      name: "Sai Ram Builders",
      contactPerson: "Venkatesh Rao",
      phone: "9876501234",
      altPhone: "",
      email: "venky@sairam.com",
      address: "56, Ashok Nagar, Hyderabad - 500001",
      gst: "36SAIR1234F1Z",
    },
    lineItems: [
      { id: "li19", productId: 6, name: "TMT Steel Fe550 (per kg)", price: 72, quantity: 3000, total: 216000 },
      { id: "li20", productId: 9, name: "20mm Coarse Aggregate (per ton)", price: 1400, quantity: 60, total: 84000 },
      { id: "li21", productId: 13, name: "Primer (4L)", price: 850, quantity: 30, total: 25500 },
    ],
    discount: 15000,
    subtotal: 325500,
    totalAfterDiscount: 310500,
    status: "Sent",
  },
];

// ---------- UTILITIES ----------
const generateQuoteNumber = () => {
  const random = Math.floor(Math.random() * 10000);
  return `QP-${new Date().getFullYear()}-${random.toString().padStart(4, "0")}`;
};

const calculateTotals = (lineItems, discount) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAfterDiscount = Math.max(0, subtotal - (discount || 0));
  return { subtotal, totalAfterDiscount };
};

const Quotation = () => {
  // ---------- Data State ----------
  const [quotations, setQuotations] = useState([]);
  const [stockItems] = useState(DUMMY_STOCK_ITEMS);
  const [originalData, setOriginalData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [onSearch, setOnSearch] = useState(true);   // toggle search bar visibility
  const [sortOrder, setSortOrder] = useState("");   // "asc" / "dsc"

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    quoteNumber: "",
    date: new Date().toISOString().split("T")[0],
    client: {
      name: "",
      contactPerson: "",
      phone: "",
      altPhone: "",
      email: "",
      address: "",
      gst: "",
    },
    lineItems: [],
    discount: 0,
    status: "Draft",
  });
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Load dummy data on mount
  useEffect(() => {
    const dummy = generateDummyQuotations();
    setQuotations(dummy);
    setOriginalData(dummy);
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...quotations];
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.client.name.toLowerCase().includes(term) ||
          q.quoteNumber.toLowerCase().includes(term) ||
          q.client.contactPerson.toLowerCase().includes(term)
      );
    }
    // Date filter
    if (selectedDate) {
      filtered = filtered.filter((q) => q.date === selectedDate);
    }
    // Sorting by client name
    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.client.name.localeCompare(b.client.name));
    } else if (sortOrder === "dsc") {
      filtered.sort((a, b) => b.client.name.localeCompare(a.client.name));
    }
    return filtered;
  }, [quotations, searchTerm, selectedDate, sortOrder]);

  // Update displayed data when filters change, reset page to 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate, sortOrder]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Toggle search bar
  const toggleSearch = () => setOnSearch(!onSearch);

  // Clear search and reset to original data
  const clearSearch = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSortOrder("");
    toggleSearch();
    setQuotations(originalData);
  };

  // Recalculate totals when lineItems or discount change
  useEffect(() => {
    const { subtotal, totalAfterDiscount } = calculateTotals(formData.lineItems, formData.discount);
    setFormData((prev) => ({ ...prev, subtotal, totalAfterDiscount }));
  }, [formData.lineItems, formData.discount]);

  // Filter products for dropdown
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return stockItems;
    return stockItems.filter((item) =>
      item.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch, stockItems]);

  // ---------- CRUD Handlers ----------
  const handleAddQuotation = () => {
    setIsEditMode(false);
    setFormData({
      id: null,
      quoteNumber: generateQuoteNumber(),
      date: new Date().toISOString().split("T")[0],
      client: {
        name: "",
        contactPerson: "",
        phone: "",
        altPhone: "",
        email: "",
        address: "",
        gst: "",
      },
      lineItems: [],
      discount: 0,
      status: "Draft",
      subtotal: 0,
      totalAfterDiscount: 0,
    });
    setProductSearch("");
    setFormModalOpen(true);
  };

  const handleEditQuotation = (quotation) => {
    setIsEditMode(true);
    setFormData({
      ...quotation,
      discount: quotation.discount || 0,
    });
    setFormModalOpen(true);
  };

  const handleDeleteQuotation = (id, quoteNumber) => {
    if (window.confirm(`Delete quotation ${quoteNumber}? This action cannot be undone.`)) {
      const newData = quotations.filter((q) => q.id !== id);
      setQuotations(newData);
      setOriginalData(newData);
      successToast("Quotation deleted successfully");
    }
  };

  const handleViewDetails = (quotation) => {
    setSelectedQuotation(quotation);
    setDetailModalOpen(true);
  };

  const saveQuotation = () => {
    // Validation
    if (!formData.client.name.trim()) {
      errorToast("Client name is required");
      return;
    }
    if (!formData.client.contactPerson.trim()) {
      errorToast("Contact person name is required");
      return;
    }
    if (!formData.client.phone.trim()) {
      errorToast("Phone number is required");
      return;
    }
    if (formData.lineItems.length === 0) {
      errorToast("At least one product item is required");
      return;
    }

    const newQuotation = {
      ...formData,
      id: isEditMode ? formData.id : Date.now(),
      subtotal: formData.subtotal,
      totalAfterDiscount: formData.totalAfterDiscount,
    };

    let updatedList;
    if (isEditMode) {
      updatedList = quotations.map((q) => (q.id === newQuotation.id ? newQuotation : q));
    } else {
      updatedList = [newQuotation, ...quotations];
    }
    setQuotations(updatedList);
    setOriginalData(updatedList);
    successToast(isEditMode ? "Quotation updated successfully" : "Quotation created successfully");
    setFormModalOpen(false);
  };

  // Line items management
  const addProductToLineItems = (product) => {
    const existing = formData.lineItems.find((item) => item.productId === product.id);
    if (existing) {
      updateLineItemQuantity(existing.id, existing.quantity + 1);
    } else {
      const newItem = {
        id: Date.now() + Math.random(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
      };
      setFormData((prev) => ({ ...prev, lineItems: [...prev.lineItems, newItem] }));
    }
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const updateLineItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity, total: item.price * newQuantity } : item
      ),
    }));
  };

  const removeLineItem = (itemId) => {
    setFormData((prev) => ({ ...prev, lineItems: prev.lineItems.filter((item) => item.id !== itemId) }));
  };

  const getStatusBadge = (status) => {
    const colors = { Draft: "secondary", Sent: "primary", Approved: "success", Rejected: "danger" };
    return <Badge color={colors[status] || "light"}>{status}</Badge>;
  };

  return (
    <React.Fragment>
      <Head title="Quotations | Sree Daksha" />
      <div className="quotations-container" style={{ marginTop: "50px" }}>
         <div className="form-wrap">
           <div className="quotations-header">
          <h2>Quotations</h2>
            <div className="form-control-wrap" style={{marginLeft:"830px"}}>
                      <Input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: "120px" }}
                      />
                    </div>
          <Button style={{
    backgroundColor: "#644634",
    borderColor: "#800000",
   
    color: "#fff",
    padding: "6px 6px"
  }}  onClick={handleAddQuotation}>
            <Icon name="plus" /> 
          </Button>
        </div>
                    {/* Date picker integrated as an additional filter */}
                  
                    
                  </div>
                   
        <DataTable className="card-stretch">
          <div className="card-inner position-relative card-tools-toggle">
            <div className="card-title-group">
              <div className="card-tools">
                <div className="form-inline flex-nowrap gx-3">
                 
                  <div className="btn-wrap">
                    <span className="d-md-none">
                      <Button color="light" outline className="btn-dim btn-icon">
                        <Icon name="arrow-right" />
                      </Button>
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-tools mr-n1">
                <ul className="btn-toolbar gx-1">
                  <li>
                    <a
                      href="#search"
                      onClick={(ev) => {
                        ev.preventDefault();
                        toggleSearch();
                      }}
                      className="btn btn-icon search-toggle toggle-search"
                    >
                      <Icon name="search" />
                    </a>
                  </li>
                  <li className="btn-toolbar-sep"></li>
                  <li>
                    <div className="toggle-wrap">
                      <Button className="btn-icon btn-trigger toggle" onClick={() => {}}>
                        <Icon name="menu-right" />
                      </Button>
                      <div className="toggle-content">
                        <ul className="btn-toolbar gx-1">
                          <li className="toggle-close">
                            <Button className="btn-icon btn-trigger toggle" onClick={() => {}}>
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
                                  <li>
                                    <span>Show</span>
                                  </li>
                                  <li className={itemPerPage === 10 ? "active" : ""}>
                                    <DropdownItem
                                      tag="a"
                                      href="#dropdownitem"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                        setItemPerPage(10);
                                        setCurrentPage(1);
                                      }}
                                    >
                                      10
                                    </DropdownItem>
                                  </li>
                                  <li className={itemPerPage === 15 ? "active" : ""}>
                                    <DropdownItem
                                      tag="a"
                                      href="#dropdownitem"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                        setItemPerPage(15);
                                        setCurrentPage(1);
                                      }}
                                    >
                                      15
                                    </DropdownItem>
                                  </li>
                                  <li className={itemPerPage === 20 ? "active" : ""}>
                                    <DropdownItem
                                      tag="a"
                                      href="#dropdownitem"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                        setItemPerPage(20);
                                        setCurrentPage(1);
                                      }}
                                    >
                                      20
                                    </DropdownItem>
                                  </li>
                                </ul>
                                <ul className="link-check">
                                  <li>
                                    <span>Order by</span>
                                  </li>
                                  <li className={sortOrder === "dsc" ? "active" : ""}>
                                    <DropdownItem
                                      tag="a"
                                      href="#dropdownitem"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                        setSortOrder("dsc");
                                      }}
                                    >
                                      DESC
                                    </DropdownItem>
                                  </li>
                                  <li className={sortOrder === "asc" ? "active" : ""}>
                                    <DropdownItem
                                      tag="a"
                                      href="#dropdownitem"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                        setSortOrder("asc");
                                      }}
                                    >
                                      ASC
                                    </DropdownItem>
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
            <div className={`card-search search-wrap ${!onSearch ? "active" : ""}`}>
              <div className="card-body">
                <div className="search-content">
                  <Button
                    className="search-back btn-icon toggle-search active"
                    onClick={clearSearch}
                  >
                    <Icon name="arrow-left" />
                  </Button>
                  <input
                    type="text"
                    className="border-transparent form-focus-none form-control"
                    placeholder="Search by client, quote #, or contact person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
              <DataTableRow className="nk-tb-col-check"></DataTableRow>
              <DataTableRow>
                <span className="sub-text">Client Name</span>
              </DataTableRow>
              <DataTableRow size="md">
                <span className="sub-text">Date</span>
              </DataTableRow>
              <DataTableRow>
                <span className="sub-text">Quotation #</span>
              </DataTableRow>
              <DataTableRow size="md">
                <span className="sub-text">Total Value</span>
              </DataTableRow>
              <DataTableRow>
                <span className="sub-text">Status</span>
              </DataTableRow>
              <DataTableRow className="nk-tb-col-tools text-right">
                <span>Actions</span>
              </DataTableRow>
            </DataTableHead>

            {currentItems.length > 0 ? (
              currentItems.map((quote) => (
                <DataTableItem key={quote.id}>
                  <DataTableRow className="nk-tb-col-check"></DataTableRow>
                  <DataTableRow>
                    <div className="user-card">
                      <div className="user-info">
                        <span className="tb-lead">{quote.client.name}</span>
                      </div>
                    </div>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span>{new Date(quote.date).toLocaleDateString()}</span>
                  </DataTableRow>
                  <DataTableRow>
                    <span
                      style={{ cursor: "pointer", color: "#3b82f6", fontWeight: 500 }}
                      onClick={() => handleViewDetails(quote)}
                    >
                      {quote.quoteNumber}
                    </span>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span>₹{quote.totalAfterDiscount.toLocaleString()}</span>
                  </DataTableRow>
                 <DataTableRow>
  <span
    className={`badge ${
      quote.status === "Approved"
        ? "bg-success"
        : quote.status === "Sent"
        ? "bg-warning"
        : quote.status === "Draft"
        ? "bg-danger"
        : "bg-secondary"
    }`}
    style={{
      padding:
        quote.status === "Approved"
          ? "5px 10px"
          : quote.status === "Sent"
          ? "5px 24px"
          : quote.status === "Draft"
          ? "5px 21px"
          : "5px 10px",
      borderRadius: "14px",
      color: "white",
      textTransform: "capitalize",
    }}
  >
    {quote.status}
  </span>
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
                              <li onClick={() => handleViewDetails(quote)}>
                                <DropdownItem tag="a" href="#view">
                                  <Icon name="eye" />
                                  <span>View Details</span>
                                </DropdownItem>
                              </li>
                              <li onClick={() => handleEditQuotation(quote)}>
                                <DropdownItem tag="a" href="#edit">
                                  <Icon name="edit" />
                                  <span>Edit</span>
                                </DropdownItem>
                              </li>
                              <li onClick={() => handleDeleteQuotation(quote.id, quote.quoteNumber)}>
                                <DropdownItem tag="a" href="#delete">
                                  <Icon name="trash" />
                                  <span>Delete</span>
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
            ) : (
              <DataTableItem>
                <DataTableRow colSpan={7} className="text-center">
                  <span className="text-silent">No quotations found</span>
                </DataTableRow>
              </DataTableItem>
            )}
          </DataTableBody>

          <div className="card-inner">
            {currentItems.length > 0 ? (
              <PaginationComponent
                itemPerPage={itemPerPage}
                totalItems={filteredData.length}
                paginate={(page) => setCurrentPage(page)}
                currentPage={currentPage}
              />
            ) : (
              <div className="text-center">
                <span className="text-silent">No data found</span>
              </div>
            )}
          </div>
        </DataTable>
      </div>

      {/* CREATE / EDIT MODAL (unchanged from previous version) */}
      <Modal
        isOpen={formModalOpen}
        toggle={() => setFormModalOpen(false)}
        size="lg"
        className="quotation-modal scrollable-modal"
      >
        <ModalHeader toggle={() => setFormModalOpen(false)}>
          {isEditMode ? "Edit Quotation" : "Create New Quotation"}
        </ModalHeader>
        <ModalBody>
          <div className="form-sections">
            {/* Client Information */}
            <div className="form-section">
              <h4>Client Details</h4>
              <div className="form-row">
                <FormGroup className="flex-1">
                  <Label>Client / Company Name *</Label>
                  <Input
                    value={formData.client.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client: { ...prev.client, name: e.target.value } }))
                    }
                    placeholder="e.g., Shree Constructions"
                  />
                </FormGroup>
                <FormGroup className="flex-1">
                  <Label>Contact Person *</Label>
                  <Input
                    value={formData.client.contactPerson}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client: { ...prev.client, contactPerson: e.target.value } }))
                    }
                    placeholder="Full name"
                  />
                </FormGroup>
              </div>
              <div className="form-row">
                <FormGroup className="flex-1">
                  <Label>Phone *</Label>
                  <Input
                    value={formData.client.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client: { ...prev.client, phone: e.target.value } }))
                    }
                    placeholder="Mobile / Landline"
                  />
                </FormGroup>
                <FormGroup className="flex-1">
                  <Label>Alternate Phone</Label>
                  <Input
                    value={formData.client.altPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client: { ...prev.client, altPhone: e.target.value } }))
                    }
                    placeholder="Optional"
                  />
                </FormGroup>
              </div>
              <div className="form-row">
                <FormGroup className="flex-1">
                  <Label>Email (Optional)</Label>
                  <Input
                    type="email"
                    value={formData.client.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client: { ...prev.client, email: e.target.value } }))
                    }
                    placeholder="client@example.com"
                  />
                </FormGroup>
                <FormGroup className="flex-1">
                  <Label>GST (Optional)</Label>
                  <Input
                    value={formData.client.gst}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client: { ...prev.client, gst: e.target.value } }))
                    }
                    placeholder="GSTIN"
                  />
                </FormGroup>
              </div>
              <FormGroup>
                <Label>Address</Label>
                <Input
                  type="textarea"
                  rows="2"
                  value={formData.client.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, client: { ...prev.client, address: e.target.value } }))
                  }
                  placeholder="Street, City, PIN"
                />
              </FormGroup>
            </div>

            {/* Products */}
            <div className="form-section">
              <h4>Products / Stock Items</h4>
              <div className="product-search-area">
                <div className="search-input-wrapper">
                  <Icon name="search" className="search-icon" />
                  <Input
                    placeholder="Search and add construction materials..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                  />
                </div>
                {showProductDropdown && filteredProducts.length > 0 && (
                  <div className="product-dropdown">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="product-option"
                        onClick={() => addProductToLineItems(product)}
                      >
                        <span>{product.name}</span>
                        <span className="product-price">₹{product.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formData.lineItems.length > 0 && (
                <div className="line-items-table">
                  <table className="table table-sm">
                    <thead>
                      <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr>
                    </thead>
                    <tbody>
                      {formData.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>₹{item.price.toLocaleString()}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="quantity-input"
                            />
                          </td>
                          <td>₹{(item.price * item.quantity).toLocaleString()}</td>
                          <td>
                            <button className="remove-item-btn" onClick={() => removeLineItem(item.id)}>
                              <Icon name="x" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Discount & Totals */}
            <div className="form-section totals-section">
              <div className="totals-row">
                <div className="discount-box">
                  <Label>Discount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.discount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="totals-box">
                  <div className="total-line"><span>Subtotal:</span><strong>₹{formData.subtotal?.toLocaleString() || 0}</strong></div>
                  <div className="total-line discount-line"><span>Discount:</span><span>- ₹{(formData.discount || 0).toLocaleString()}</span></div>
                  <div className="total-line grand-total"><span>Grand Total:</span><strong>₹{formData.totalAfterDiscount?.toLocaleString() || 0}</strong></div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <FormGroup>
                <Label>Status</Label>
                <Input
                  type="select"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                </Input>
              </FormGroup>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setFormModalOpen(false)}>Cancel</Button>
          <Button style={{
    backgroundColor: "#644634",
    borderColor: "#800000",
   
    color: "#fff",
    padding: "9px 20px"
  }} onClick={saveQuotation}>
            {isEditMode ? "Update Quotation" : "Create Quotation"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal
        isOpen={detailModalOpen}
        toggle={() => setDetailModalOpen(false)}
        size="lg"
        className="detail-modal scrollable-modal"
      >
        <ModalHeader toggle={() => setDetailModalOpen(false)}>Quotation Details</ModalHeader>
        <ModalBody>
          {selectedQuotation && (
            <div className="quotation-invoice">
              <div className="invoice-header">
                <div className="brand">
                  <Icon name="shopping-cart" className="invoice-icon" />
                  <h3>Sree Daksha</h3>
                </div>
                <div className="quote-meta">
                  <h4>{selectedQuotation.quoteNumber}</h4>
                  <p>Date: {new Date(selectedQuotation.date).toLocaleDateString()}</p>
                  <p>Status: {getStatusBadge(selectedQuotation.status)}</p>
                </div>
              </div>
              <div className="client-details">
                <h5>Bill To:</h5>
                <p>
                  <strong>{selectedQuotation.client.name}</strong><br />
                  Attn: {selectedQuotation.client.contactPerson}<br />
                  Phone: {selectedQuotation.client.phone}{selectedQuotation.client.altPhone && ` / ${selectedQuotation.client.altPhone}`}<br />
                  Email: {selectedQuotation.client.email || "—"}<br />
                  Address: {selectedQuotation.client.address || "—"}<br />
                  GST: {selectedQuotation.client.gst || "Not provided"}
                </p>
              </div>
              <div className="invoice-items">
                <table className="invoice-table">
                  <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {selectedQuotation.lineItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price.toLocaleString()}</td>
                        <td>₹{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr><td colSpan="4" className="text-right">Subtotal:</td><td>₹{selectedQuotation.subtotal?.toLocaleString()}</td></tr>
                    {selectedQuotation.discount > 0 && <tr><td colSpan="4" className="text-right">Discount:</td><td>- ₹{selectedQuotation.discount.toLocaleString()}</td></tr>}
                    <tr className="grand-total-row"><td colSpan="4" className="text-right">Grand Total:</td><td>₹{selectedQuotation.totalAfterDiscount?.toLocaleString()}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDetailModalOpen(false)}>Close</Button>
          <Button style={{
    backgroundColor: "#644634",
    borderColor: "#800000",
   
    color: "#fff",
    padding: "8px 20px"
  }} onClick={() => { setDetailModalOpen(false); handleEditQuotation(selectedQuotation); }}>Edit Quotation</Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default Quotation;