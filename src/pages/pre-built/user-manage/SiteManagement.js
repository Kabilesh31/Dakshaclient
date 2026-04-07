import React, { useState, useEffect } from "react";
import Head from "../../../layout/head/Head";
import Content from "../../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Row,
  Col,
  Button,
  Icon,
  BlockBetween,
} from "../../../components/Component";
import {
  Input,
  FormGroup,
  Modal,
  ModalBody,
  ModalHeader,
  Badge,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardImg,
  CardFooter,
} from "reactstrap";

const SiteManagement = () => {
  // ========== Dummy Data with Images ==========
  const dummySites = [
    {
      id: 1,
      name: "Downtown Office Complex",
      location: "City Center, Mumbai",
      startDate: "2024-01-15",
      staffAssigned: ["John Doe", "Jane Smith", "Mike Johnson"],
      status: "active",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop",
      description: "Modern office complex with 20 floors, includes parking and retail space.",
      projectValue: "₹15 Crore",
      completion: 65,
    },
    {
      id: 2,
      name: "Riverside Residential Tower",
      location: "Riverbank, Delhi",
      startDate: "2024-02-01",
      staffAssigned: ["Sarah Williams", "David Brown", "Emily Davis"],
      status: "active",
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=250&fit=crop",
      description: "Luxury apartments with river view, 12 stories high.",
      projectValue: "₹22 Crore",
      completion: 40,
    },
    {
      id: 3,
      name: "Greenfield Industrial Park",
      location: "North Industrial Area, Chennai",
      startDate: "2023-11-10",
      staffAssigned: ["Chris Wilson", "Jessica Taylor"],
      status: "inactive",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop",
      description: "Warehouse and manufacturing units spread over 50 acres.",
      projectValue: "₹35 Crore",
      completion: 100,
    },
    {
      id: 4,
      name: "Harbor View Mall",
      location: "Waterfront, Kolkata",
      startDate: "2024-01-20",
      staffAssigned: ["Rajesh Kumar", "Priya Sharma", "Amit Verma"],
      status: "active",
      image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=250&fit=crop",
      description: "Shopping mall with multiplex, food court, and 100+ retail outlets.",
      projectValue: "₹45 Crore",
      completion: 30,
    },
    {
      id: 5,
      name: "Sunset Hills Villa Project",
      location: "Eastern Hills, Bangalore",
      startDate: "2023-09-05",
      staffAssigned: ["Neha Gupta", "Rahul Mehta"],
      status: "inactive",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=250&fit=crop",
      description: "Premium villas with private gardens and clubhouse.",
      projectValue: "₹28 Crore",
      completion: 100,
    },
    {
      id: 6,
      name: "Tech Hub Innovation Center",
      location: "Tech Corridor, Hyderabad",
      startDate: "2024-03-01",
      staffAssigned: ["Sandeep Reddy", "Anjali Nair", "Vikram Singh", "Divya Patil"],
      status: "active",
      image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=250&fit=crop",
      description: "Co-working and office spaces for startups and tech companies.",
      projectValue: "₹18 Crore",
      completion: 20,
    },
    {
      id: 7,
      name: "Metro Transit Station",
      location: "Central District, Pune",
      startDate: "2024-02-10",
      staffAssigned: ["Mahesh Joshi", "Sonali Patil"],
      status: "active",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop",
      description: "Integrated metro station with commercial spaces and parking.",
      projectValue: "₹60 Crore",
      completion: 15,
    },
  ];

  // ========== State ==========
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [onSearch, setOnSearch] = useState(true);
  const [selectedSite, setSelectedSite] = useState(null);
  const [modal, setModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [newSite, setNewSite] = useState({
    name: "",
    location: "",
    startDate: "",
    staffAssigned: [],
    description: "",
    projectValue: "",
    image: "",
  });
  const [staffInput, setStaffInput] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Load dummy data on mount
  useEffect(() => {
    setSites(dummySites);
    setFilteredSites(dummySites);
  }, []);

  // Filter sites based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSites(sites);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = sites.filter(
        (site) =>
          site.name.toLowerCase().includes(term) ||
          site.location.toLowerCase().includes(term) ||
          site.staffAssigned.some((staff) => staff.toLowerCase().includes(term))
      );
      setFilteredSites(filtered);
    }
  }, [searchTerm, sites]);

  // ========== Handlers ==========
  const toggleSearch = () => setOnSearch(!onSearch);

  const viewSiteDetails = (site) => {
    setSelectedSite(site);
    setModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!newSite.name.trim()) errors.name = "Site name is required";
    if (!newSite.location.trim()) errors.location = "Location is required";
    if (!newSite.startDate) errors.startDate = "Start date is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSite = () => {
    if (!validateForm()) return;

    const newId = sites.length + 1;
    const siteToAdd = {
      id: newId,
      ...newSite,
      staffAssigned: newSite.staffAssigned.length ? newSite.staffAssigned : ["Not Assigned"],
      status: "active",
      image: newSite.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
      completion: 0,
    };
    setSites([siteToAdd, ...sites]);
    setAddModal(false);
    resetNewSiteForm();
  };

  const resetNewSiteForm = () => {
    setNewSite({
      name: "",
      location: "",
      startDate: "",
      staffAssigned: [],
      description: "",
      projectValue: "",
      image: "",
    });
    setStaffInput("");
    setFormErrors({});
  };

  const handleAddStaff = () => {
    const staffName = staffInput.trim();
    if (staffName && !newSite.staffAssigned.includes(staffName)) {
      setNewSite({
        ...newSite,
        staffAssigned: [...newSite.staffAssigned, staffName],
      });
      setStaffInput("");
    }
  };

  const handleRemoveStaff = (staffToRemove) => {
    setNewSite({
      ...newSite,
      staffAssigned: newSite.staffAssigned.filter((s) => s !== staffToRemove),
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge color="success" pill>Active</Badge>
    ) : (
      <Badge color="secondary" pill>Completed</Badge>
    );
  };

  return (
    <React.Fragment>
      <Head title="Site Management | Projects" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page tag="h3">
                Site Management
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>Manage all construction and project sites</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button color="primary" className="btn-icon" onClick={() => setAddModal(true)}>
                <Icon name="plus" />
              </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* White container for search and cards */}
        <Block className="card card-bordered">
          {/* Search Bar */}
          <div className="card-inner position-relative card-tools-toggle border-bottom">
            <div className="card-title-group">
              <div className="card-tools">
                <div className="form-inline flex-nowrap gx-3">
                  <div className="form-wrap"></div>
                  <div className="btn-wrap">
                    <span className="d-md-none">
                      <Button color="light" outline className="btn-dim btn-icon">
                        <Icon name="arrow-right"></Icon>
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
                      <Icon name="search"></Icon>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`card-search search-wrap ${!onSearch && "active"}`}>
              <div className="card-body">
                <div className="search-content">
                  <Button
                    className="search-back btn-icon toggle-search active"
                    onClick={() => {
                      setSearchTerm("");
                      toggleSearch();
                    }}
                  >
                    <Icon name="arrow-left"></Icon>
                  </Button>
                  <input
                    type="text"
                    className="border-transparent form-focus-none form-control"
                    placeholder="Search by site name, location, or assigned staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button className="search-submit btn-icon">
                    <Icon name="search"></Icon>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sites Cards Grid */}
          <div className="card-inner">
            <Row className="g-gs">
              {filteredSites.length > 0 ? (
                filteredSites.map((site) => (
                  <Col xxl="3" lg="4" md="6" key={site.id}>
                    <Card className="site-card h-100 shadow-sm" style={{ borderRadius: "12px" }}>
                      <CardImg
                        top
                        src={site.image}
                        alt={site.name}
                        style={{ height: "140px", objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
                      />
                      <CardBody className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <CardTitle tag="h6" className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>
                            {site.name}
                          </CardTitle>
                          {getStatusBadge(site.status)}
                        </div>
                        <CardText className="small">
                          <div className="mb-1">
                            <Icon name="map-pin" size={12} className="me-1 text-muted" />
                            <span className="text-muted">{site.location}</span>
                          </div>
                          <div className="mb-1">
                            <Icon name="calendar" size={12} className="me-1 text-muted" />
                            <span className="text-muted">{formatDate(site.startDate)}</span>
                          </div>
                          <div className="mb-2">
                            <Icon name="users" size={12} className="me-1 text-muted" />
                            <span className="text-muted">{site.staffAssigned.length} staff</span>
                          </div>
                          {site.projectValue && (
                            <div className="mb-2">
                              <Icon name="trend-up" size={12} className="me-1 text-muted" />
                              <span className="text-muted">{site.projectValue}</span>
                            </div>
                          )}
                          {site.completion && site.status === "active" && (
                            <div className="mt-2">
                              <div className="d-flex justify-content-between small mb-1">
                                <span>Completion</span>
                                <span>{site.completion}%</span>
                              </div>
                              <div className="progress" style={{ height: "4px" }}>
                                <div
                                  className="progress-bar bg-primary"
                                  style={{ width: `${site.completion}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </CardText>
                      </CardBody>
                      <CardFooter className="bg-transparent border-top-0 pb-3 pt-0 px-3">
                        <Button color="primary" outline size="sm" block onClick={() => viewSiteDetails(site)}>
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs="12">
                  <div className="text-center py-5">
                    <Icon name="building" size={48} className="text-soft" />
                    <h5 className="mt-3">No sites found</h5>
                    <p className="text-muted">Try adjusting your search or add a new site.</p>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </Block>

        {/* Site Details Modal - Scrollable with visible scrollbar */}
        <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" className="site-modal">
          <ModalHeader toggle={() => setModal(false)}>Site Details</ModalHeader>
          <ModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {selectedSite && (
              <div className="site-details">
                <div className="text-center mb-4">
                  <img
                    src={selectedSite.image}
                    alt={selectedSite.name}
                    style={{ maxWidth: "100%", height: "250px", objectFit: "cover", borderRadius: "8px" }}
                  />
                </div>
                <Row className="mb-4">
                  <Col md="8">
                    <h4>{selectedSite.name}</h4>
                    <p className="text-muted">
                      <Icon name="map-pin" /> {selectedSite.location}
                    </p>
                  </Col>
                  <Col md="4" className="text-md-end">
                    {getStatusBadge(selectedSite.status)}
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md="6">
                    <strong>Start Date:</strong>
                    <p>{formatDate(selectedSite.startDate)}</p>
                  </Col>
                  <Col md="6">
                    <strong>Project Value:</strong>
                    <p>{selectedSite.projectValue || "N/A"}</p>
                  </Col>
                </Row>

                <div className="mb-4">
                  <strong>Description:</strong>
                  <p>{selectedSite.description || "No description provided."}</p>
                </div>

                <div className="mb-4">
                  <strong>Assigned Staff:</strong>
                  <ul className="mt-2">
                    {selectedSite.staffAssigned.map((staff, idx) => (
                      <li key={idx}>{staff}</li>
                    ))}
                  </ul>
                </div>

                {selectedSite.completion && (
                  <div className="mb-4">
                    <strong>Completion Status</strong>
                    <div className="mt-2">
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Progress</span>
                        <span>{selectedSite.completion}%</span>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${selectedSite.completion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button color="secondary" onClick={() => setModal(false)}>
                    Close
                  </Button>
                  <Button color="primary">Edit Site</Button>
                </div>
              </div>
            )}
          </ModalBody>
        </Modal>

        {/* Add New Site Modal - Scrollable with visible scrollbar */}
        <Modal isOpen={addModal} toggle={() => { setAddModal(false); resetNewSiteForm(); }} size="lg">
          <ModalHeader toggle={() => { setAddModal(false); resetNewSiteForm(); }}>Add New Site</ModalHeader>
          <ModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <FormGroup>
              <label>Site Name *</label>
              <Input
                type="text"
                placeholder="Enter site name"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                invalid={!!formErrors.name}
              />
              {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
            </FormGroup>
            <FormGroup>
              <label>Location *</label>
              <Input
                type="text"
                placeholder="City, State"
                value={newSite.location}
                onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                invalid={!!formErrors.location}
              />
              {formErrors.location && <div className="invalid-feedback d-block">{formErrors.location}</div>}
            </FormGroup>
            <FormGroup>
              <label>Start Date *</label>
              <Input
                type="date"
                value={newSite.startDate}
                onChange={(e) => setNewSite({ ...newSite, startDate: e.target.value })}
                invalid={!!formErrors.startDate}
              />
              {formErrors.startDate && <div className="invalid-feedback d-block">{formErrors.startDate}</div>}
            </FormGroup>
            <FormGroup>
              <label>Project Value (₹)</label>
              <Input
                type="text"
                placeholder="e.g., ₹15 Crore"
                value={newSite.projectValue}
                onChange={(e) => setNewSite({ ...newSite, projectValue: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Description</label>
              <Input
                type="textarea"
                rows="3"
                placeholder="Brief description of the site/project"
                value={newSite.description}
                onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Image URL (optional)</label>
              <Input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={newSite.image}
                onChange={(e) => setNewSite({ ...newSite, image: e.target.value })}
              />
              <small className="text-muted">Leave blank to use default image</small>
            </FormGroup>
            <FormGroup>
              <label>Assign Staff (multiple)</label>
              <div className="d-flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter staff name"
                  value={staffInput}
                  onChange={(e) => setStaffInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStaff()}
                />
                <Button color="secondary" onClick={handleAddStaff}>
                  Add
                </Button>
              </div>
              <div className="mt-2">
                {newSite.staffAssigned.map((staff, idx) => (
                  <Badge 
                    key={idx} 
                    color="primary" 
                    pill 
                    className="me-1 mb-1" 
                    style={{ cursor: "pointer", fontSize: "0.8rem", padding: "5px 10px" }}
                    onClick={() => handleRemoveStaff(staff)}
                  >
                    {staff} &times;
                  </Badge>
                ))}
                {newSite.staffAssigned.length === 0 && (
                  <small className="text-muted">No staff added yet. Type name and click Add.</small>
                )}
              </div>
              <small className="text-muted">Click on a badge to remove staff</small>
            </FormGroup>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button color="secondary" onClick={() => { setAddModal(false); resetNewSiteForm(); }}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleAddSite}>
                Add Site
              </Button>
            </div>
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default SiteManagement;