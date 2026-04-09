import React, { useState, useEffect } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
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
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  FormGroup,
  Progress,
} from "reactstrap";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";

// Full dummy data (matching SiteManagement)
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
    additionalImages: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop",
    ],
    sitePlanImages: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop",
    ],
    progressHistory: [
      { stage: "Basement Excavation", startDate: "2024-01-20", endDate: "2024-02-10", status: "completed", completion: 100 },
      { stage: "Foundation", startDate: "2024-02-15", endDate: "2024-03-20", status: "completed", completion: 100 },
      { stage: "Ground Floor", startDate: "2024-03-25", endDate: "2024-04-30", status: "in-progress", completion: 75 },
      { stage: "First Floor", startDate: "2024-05-05", endDate: "2024-06-10", status: "pending", completion: 0 },
      { stage: "Roofing", startDate: "2024-06-15", endDate: "2024-07-20", status: "pending", completion: 0 },
      { stage: "Finishing", startDate: "2024-07-25", endDate: "2024-09-30", status: "pending", completion: 0 },
    ],
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
    additionalImages: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=250&fit=crop",
    ],
    sitePlanImages: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=250&fit=crop",
    ],
    progressHistory: [
      { stage: "Basement Excavation", startDate: "2024-02-10", endDate: "2024-03-01", status: "completed", completion: 100 },
      { stage: "Foundation", startDate: "2024-03-05", endDate: "2024-04-10", status: "completed", completion: 100 },
      { stage: "Ground Floor", startDate: "2024-04-15", endDate: "2024-05-20", status: "in-progress", completion: 60 },
      { stage: "First Floor", startDate: "2024-05-25", endDate: "2024-06-30", status: "pending", completion: 0 },
      { stage: "Second Floor", startDate: "2024-07-05", endDate: "2024-08-10", status: "pending", completion: 0 },
      { stage: "Roofing", startDate: "2024-08-15", endDate: "2024-09-20", status: "pending", completion: 0 },
      { stage: "Finishing", startDate: "2024-09-25", endDate: "2024-11-30", status: "pending", completion: 0 },
    ],
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
    additionalImages: [
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop",
    ],
    sitePlanImages: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop",
    ],
    progressHistory: [
      { stage: "Land Clearing", startDate: "2023-11-15", endDate: "2023-12-10", status: "completed", completion: 100 },
      { stage: "Foundation", startDate: "2023-12-15", endDate: "2024-01-20", status: "completed", completion: 100 },
      { stage: "Warehouse Shed", startDate: "2024-01-25", endDate: "2024-03-10", status: "completed", completion: 100 },
      { stage: "Office Block", startDate: "2024-03-15", endDate: "2024-05-10", status: "completed", completion: 100 },
      { stage: "Internal Roads", startDate: "2024-05-15", endDate: "2024-06-20", status: "completed", completion: 100 },
      { stage: "Landscaping", startDate: "2024-06-25", endDate: "2024-07-30", status: "completed", completion: 100 },
    ],
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
    additionalImages: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
    ],
    sitePlanImages: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=250&fit=crop",
    ],
    progressHistory: [
      { stage: "Demolition", startDate: "2024-01-25", endDate: "2024-02-15", status: "completed", completion: 100 },
      { stage: "Basement Excavation", startDate: "2024-02-20", endDate: "2024-03-20", status: "completed", completion: 100 },
      { stage: "Foundation", startDate: "2024-03-25", endDate: "2024-05-05", status: "in-progress", completion: 50 },
      { stage: "Ground Floor", startDate: "2024-05-10", endDate: "2024-06-15", status: "pending", completion: 0 },
      { stage: "First Floor", startDate: "2024-06-20", endDate: "2024-07-25", status: "pending", completion: 0 },
      { stage: "Second Floor", startDate: "2024-07-30", endDate: "2024-09-05", status: "pending", completion: 0 },
      { stage: "Roofing", startDate: "2024-09-10", endDate: "2024-10-15", status: "pending", completion: 0 },
      { stage: "Finishing", startDate: "2024-10-20", endDate: "2025-01-15", status: "pending", completion: 0 },
    ],
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
    additionalImages: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=250&fit=crop",
    ],
    sitePlanImages: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop",
    ],
    progressHistory: [
      { stage: "Site Clearing", startDate: "2023-09-10", endDate: "2023-10-05", status: "completed", completion: 100 },
      { stage: "Foundation", startDate: "2023-10-10", endDate: "2023-11-15", status: "completed", completion: 100 },
      { stage: "Villa Construction", startDate: "2023-11-20", endDate: "2024-03-30", status: "completed", completion: 100 },
      { stage: "Internal Finishing", startDate: "2024-04-05", endDate: "2024-06-10", status: "completed", completion: 100 },
      { stage: "Landscaping", startDate: "2024-06-15", endDate: "2024-07-20", status: "completed", completion: 100 },
    ],
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
    additionalImages: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop",
    ],
    sitePlanImages: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop",
    ],
    progressHistory: [
      { stage: "Demolition & Clearing", startDate: "2024-03-05", endDate: "2024-03-25", status: "completed", completion: 100 },
      { stage: "Foundation", startDate: "2024-03-30", endDate: "2024-05-05", status: "in-progress", completion: 40 },
      { stage: "Ground Floor", startDate: "2024-05-10", endDate: "2024-06-15", status: "pending", completion: 0 },
      { stage: "First Floor", startDate: "2024-06-20", endDate: "2024-07-25", status: "pending", completion: 0 },
      { stage: "Roofing", startDate: "2024-07-30", endDate: "2024-08-25", status: "pending", completion: 0 },
      { stage: "Interiors", startDate: "2024-08-30", endDate: "2024-10-15", status: "pending", completion: 0 },
    ],
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
    additionalImages: [
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
    ],
    sitePlanImages: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=250&fit=crop",
    ],
    progressHistory: [
      { stage: "Site Survey", startDate: "2024-02-15", endDate: "2024-03-05", status: "completed", completion: 100 },
      { stage: "Excavation", startDate: "2024-03-10", endDate: "2024-04-20", status: "in-progress", completion: 30 },
      { stage: "Foundation", startDate: "2024-04-25", endDate: "2024-06-10", status: "pending", completion: 0 },
      { stage: "Structural Work", startDate: "2024-06-15", endDate: "2024-08-20", status: "pending", completion: 0 },
      { stage: "Platform Installation", startDate: "2024-08-25", endDate: "2024-10-15", status: "pending", completion: 0 },
      { stage: "Finishing & Testing", startDate: "2024-10-20", endDate: "2025-01-15", status: "pending", completion: 0 },
    ],
  },
];

const SiteDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();

  const [site, setSite] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [sitePlanImages, setSitePlanImages] = useState([]);
  const [progressHistory, setProgressHistory] = useState([]);
  const [photoModal, setPhotoModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editedSite, setEditedSite] = useState({});
  const [staffInput, setStaffInput] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    let currentSite;
    if (location.state?.site) {
      currentSite = location.state.site;
    } else {
      currentSite = dummySites.find((s) => s.id === parseInt(id));
    }
    if (currentSite) {
      setSite(currentSite);
      setPhotos(
        currentSite.additionalImages?.length > 0
          ? currentSite.additionalImages
          : dummySites[0].additionalImages
      );
      setSitePlanImages(
        currentSite.sitePlanImages?.length > 0
          ? currentSite.sitePlanImages
          : dummySites[0].sitePlanImages
      );
      setProgressHistory(
        currentSite.progressHistory?.length > 0
          ? currentSite.progressHistory
          : dummySites[0].progressHistory
      );
      setEditedSite(currentSite);
    }
  }, [id, location.state]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge color="success" pill>Active</Badge>
    ) : (
      <Badge color="secondary" pill>Completed</Badge>
    );
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
      setPhotoModal(false);
    }
  };

  const handleEditSite = () => {
    const errors = {};
    if (!editedSite.name?.trim()) errors.name = "Site name is required";
    if (!editedSite.location?.trim()) errors.location = "Location is required";
    if (!editedSite.startDate) errors.startDate = "Start date is required";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSite({ ...site, ...editedSite, staffAssigned: editedSite.staffAssigned || [] });
    setEditModal(false);
    setFormErrors({});
  };

  const handleAddStaff = () => {
    const staffName = staffInput.trim();
    if (staffName && !editedSite.staffAssigned?.includes(staffName)) {
      setEditedSite({
        ...editedSite,
        staffAssigned: [...(editedSite.staffAssigned || []), staffName],
      });
      setStaffInput("");
    }
  };

  const handleRemoveStaff = (staffToRemove) => {
    setEditedSite({
      ...editedSite,
      staffAssigned: editedSite.staffAssigned?.filter((s) => s !== staffToRemove) || [],
    });
  };

  if (!site) {
    return (
      <div className="text-center py-5">
        <h4>Loading site details...</h4>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Head title="Site Details | Projects" />
      <Content>
        {/* Header with Back button (outside white container) */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <Button
                color="dark"
                size="sm"
                className="mb-2"
                onClick={() => history.push("/SiteManagement")}
              >
                <Icon name="arrow-left" /> Back
              </Button>
              <BlockTitle page tag="h3" className="mt-2">
                {site.name}
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>Complete project information and media gallery</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button color="primary" outline size="sm" onClick={() => setEditModal(true)}>
                <Icon name="edit" /> Edit Site
              </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* White container for all content */}
        <Block className="card card-bordered">
          <div className="card-inner">
            {/* Main image and basic info */}
            <Row className="g-4">
              <Col lg="6">
                <img
                  src={site.image}
                  alt={site.name}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
              </Col>
              <Col lg="6">
                <div className="d-flex justify-content-between align-items-start">
                  <h4>{site.name}</h4>
                  <div>{getStatusBadge(site.status)}</div>
                </div>
                <p className="text-muted mt-2">
                  <Icon name="map-pin" /> {site.location}
                </p>
                <hr />
                <Row>
                  <Col md="6">
                    <strong>Start Date</strong>
                    <p>{formatDate(site.startDate)}</p>
                  </Col>
                  <Col md="6">
                    <strong>Project Value</strong>
                    <p>{site.projectValue || "N/A"}</p>
                  </Col>
                </Row>
                <div className="mt-3">
                  <strong>Description</strong>
                  <p>{site.description || "No description provided."}</p>
                </div>
              </Col>
            </Row>

            {/* Staff assigned */}
            <div className="mt-5">
              <h5>Assigned Staff</h5>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {site.staffAssigned.map((staff, idx) => (
                  <Badge key={idx} color="primary" pill className="p-2 px-3">
                    {staff}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Completion progress if active */}
            {site.status === "active" && site.completion && (
              <div className="mt-5">
                <strong>Overall Completion</strong>
                <div className="mt-2">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Progress</span>
                    <span>{site.completion}%</span>
                  </div>
                  <Progress value={site.completion} color="success" style={{ height: "8px" }} />
                </div>
              </div>
            )}

            {/* Progress History Section */}
            <div className="mt-5">
              <h5>Progress History (Stage-wise)</h5>
              <div className="table-responsive mt-3">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Stage</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressHistory.map((stage, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td><strong>{stage.stage}</strong></td>
                        <td style={{ textTransform: "capitalize" }}>
                          {stage.status.replace("-", " ")}
                        </td>
                        <td>
                          {stage.status === "completed"
                            ? formatDate(stage.endDate)
                            : formatDate(stage.startDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Project Gallery Section */}
            <div className="mt-5">
              <div className="d-flex justify-content-between align-items-center">
                <h5>Project Gallery</h5>
                <Button color="primary" outline onClick={() => setPhotoModal(true)}>
                  <Icon name="plus" /> Add Photo
                </Button>
              </div>
              <Row className="mt-3 g-3">
                {photos.map((photo, idx) => (
                  <Col md="4" key={idx}>
                    <img
                      src={photo}
                      alt=""
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </div>

            {/* Site Plan Images Section */}
            <div className="mt-5">
              <h5>Site Plan Images</h5>
              <Row className="mt-3 g-3">
                {sitePlanImages.map((img, idx) => (
                  <Col md="4" key={idx}>
                    <img
                      src={img}
                      alt=""
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #eee",
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </div>

            {/* Close button */}
            <div className="d-flex justify-content-end gap-3 mt-5">
              <Button color="secondary" onClick={() => history.push("/SiteManagement")}>
                Close
              </Button>
            </div>
          </div>
        </Block>

        {/* Add Photo Modal */}
        <Modal isOpen={photoModal} toggle={() => setPhotoModal(false)}>
          <ModalHeader toggle={() => setPhotoModal(false)}>Add New Photo</ModalHeader>
          <ModalBody>
            <Input
              type="text"
              placeholder="Enter image URL"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
            />
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button color="secondary" onClick={() => setPhotoModal(false)}>Cancel</Button>
              <Button color="primary" onClick={handleAddPhoto}>Add to Gallery</Button>
            </div>
          </ModalBody>
        </Modal>

        {/* Edit Site Modal */}
        <Modal isOpen={editModal} toggle={() => { setEditModal(false); setFormErrors({}); }} size="lg">
          <ModalHeader toggle={() => { setEditModal(false); setFormErrors({}); }}>
            Edit Site Details
          </ModalHeader>
          <ModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <FormGroup>
              <label>Site Name *</label>
              <Input
                type="text"
                value={editedSite.name || ""}
                onChange={(e) => setEditedSite({ ...editedSite, name: e.target.value })}
                invalid={!!formErrors.name}
              />
              {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
            </FormGroup>
            <FormGroup>
              <label>Location *</label>
              <Input
                type="text"
                value={editedSite.location || ""}
                onChange={(e) => setEditedSite({ ...editedSite, location: e.target.value })}
                invalid={!!formErrors.location}
              />
              {formErrors.location && <div className="invalid-feedback d-block">{formErrors.location}</div>}
            </FormGroup>
            <FormGroup>
              <label>Start Date *</label>
              <Input
                type="date"
                value={editedSite.startDate || ""}
                onChange={(e) => setEditedSite({ ...editedSite, startDate: e.target.value })}
                invalid={!!formErrors.startDate}
              />
              {formErrors.startDate && <div className="invalid-feedback d-block">{formErrors.startDate}</div>}
            </FormGroup>
            <FormGroup>
              <label>Project Value (₹)</label>
              <Input
                type="text"
                value={editedSite.projectValue || ""}
                onChange={(e) => setEditedSite({ ...editedSite, projectValue: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Description</label>
              <Input
                type="textarea"
                rows="3"
                value={editedSite.description || ""}
                onChange={(e) => setEditedSite({ ...editedSite, description: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Main Image URL</label>
              <Input
                type="text"
                value={editedSite.image || ""}
                onChange={(e) => setEditedSite({ ...editedSite, image: e.target.value })}
              />
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
                <Button color="secondary" onClick={handleAddStaff}>Add</Button>
              </div>
              <div className="mt-2">
                {editedSite.staffAssigned?.map((staff, idx) => (
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
                {(!editedSite.staffAssigned || editedSite.staffAssigned.length === 0) && (
                  <small className="text-muted">No staff added yet.</small>
                )}
              </div>
            </FormGroup>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button color="secondary" className="p-3 " style={{ marginTop: "-1rem" }} onClick={() => setEditModal(false)}>Cancel</Button>
              <Button color="primary" className="p-3 " style={{ marginTop: "-1rem" }} onClick={handleEditSite}>Save Changes</Button>
            </div>
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default SiteDetail;