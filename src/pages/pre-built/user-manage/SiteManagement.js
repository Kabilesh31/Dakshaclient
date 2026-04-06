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
  PreviewCard,
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
  const viewSiteDetails = (site) => {
    setSelectedSite(site);
    setModal(true);
  };

  const handleAddSite = () => {
    // Simple validation
    if (!newSite.name || !newSite.location || !newSite.startDate) {
      alert("Please fill required fields: Name, Location, Start Date");
      return;
    }

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
    alert("Site added successfully!");
  };

  const handleAddStaff = () => {
    if (staffInput.trim() && !newSite.staffAssigned.includes(staffInput.trim())) {
      setNewSite({
        ...newSite,
        staffAssigned: [...newSite.staffAssigned, staffInput.trim()],
      });
      setStaffInput("");
    }
  };

  const removeStaff = (staffToRemove) => {
    setNewSite({
      ...newSite,
      staffAssigned: newSite.staffAssigned.filter((s) => s !== staffToRemove),
    });
  };

  const formatDate = (dateString) => {
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
                {/* <span>Add New Site</span> */}
              </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* Search Bar */}
        <Block>
          <Row className="g-gs">
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Input
                  type="text"
                  placeholder="Search by site name, location, or assigned staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FormGroup>
            </Col>
            {/* <Col md="6" lg="8" className="text-md-end">
              <Button color="secondary" outline onClick={() => setSearchTerm("")}>
                <Icon name="refresh" /> Reset
              </Button>
            </Col> */}
          </Row>
        </Block>

        {/* Sites Cards Grid */}
        <Block>
          <Row className="g-gs">
            {filteredSites.length > 0 ? (
              filteredSites.map((site) => (
                <Col xl="4" lg="6" md="6" key={site.id}>
                  <Card className="site-card h-100 shadow-sm">
                    <CardImg top src={site.image} alt={site.name} style={{ height: "180px", objectFit: "cover" }} />
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <CardTitle tag="h5" className="mb-0">
                          {site.name}
                        </CardTitle>
                        {getStatusBadge(site.status)}
                      </div>
                      <CardText>
                        <div className="mb-2">
                          <Icon name="map-pin" size={14} className="me-1 text-muted" />
                          <span className="small">{site.location}</span>
                        </div>
                        <div className="mb-2">
                          <Icon name="calendar" size={14} className="me-1 text-muted" />
                          <span className="small">Started: {formatDate(site.startDate)}</span>
                        </div>
                        <div className="mb-2">
                          <Icon name="users" size={14} className="me-1 text-muted" />
                          <span className="small">Staff: {site.staffAssigned.length} assigned</span>
                        </div>
                        {site.projectValue && (
                          <div className="mb-2">
                            <Icon name="trend-up" size={14} className="me-1 text-muted" />
                            <span className="small">Value: {site.projectValue}</span>
                          </div>
                        )}
                        {site.completion && site.status === "active" && (
                          <div className="mt-2">
                            <div className="d-flex justify-content-between small mb-1">
                              <span>Completion</span>
                              <span>{site.completion}%</span>
                            </div>
                            <div className="progress" style={{ height: "6px" }}>
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: `${site.completion}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </CardText>
                    </CardBody>
                    <CardFooter className="bg-transparent border-top-0 pb-3">
                      <Button color="primary" outline block onClick={() => viewSiteDetails(site)}>
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
        </Block>

        {/* Site Details Modal */}
        <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" className="site-modal">
          <ModalHeader toggle={() => setModal(false)}>Site Details</ModalHeader>
          <ModalBody>
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
                  <p>{selectedSite.description}</p>
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

        {/* Add New Site Modal */}
        <Modal isOpen={addModal} toggle={() => setAddModal(false)} size="lg">
          <ModalHeader toggle={() => setAddModal(false)}>Add New Site</ModalHeader>
          <ModalBody>
            <FormGroup>
              <label>Site Name *</label>
              <Input
                type="text"
                placeholder="Enter site name"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Location *</label>
              <Input
                type="text"
                placeholder="City, State"
                value={newSite.location}
                onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Start Date *</label>
              <Input
                type="date"
                value={newSite.startDate}
                onChange={(e) => setNewSite({ ...newSite, startDate: e.target.value })}
              />
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
            </FormGroup>
            <FormGroup>
              <label>Assign Staff</label>
              <div className="d-flex gap-2">
                <Input
                  type="text"
                  placeholder="Staff name"
                  value={staffInput}
                  onChange={(e) => setStaffInput(e.target.value)}
                />
                <Button color="secondary" onClick={handleAddStaff}>
                  Add
                </Button>
              </div>
              <div className="mt-2">
                {newSite.staffAssigned.map((staff, idx) => (
                  <Badge key={idx} color="primary" pill className="me-1 mb-1" style={{ cursor: "pointer" }} onClick={() => removeStaff(staff)}>
                    {staff} &times;
                  </Badge>
                ))}
              </div>
              <small className="text-muted">Click on a badge to remove</small>
            </FormGroup>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button color="secondary" onClick={() => setAddModal(false)}>
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