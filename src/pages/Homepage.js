import React, { useState } from "react";
import Head from "../layout/head/Head";
import Content from "../layout/content/Content";
import {
  Block,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
  Row,
  Col,
  PreviewAltCard,
  PreviewCard,
  BlockBetween,
} from "../components/Component";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./homepage.css";

const Homepage = () => {
  // ======================== DUMMY DATA ========================
  // Staff Data (with active/inactive status)
  const [staffData] = useState([
    { id: 1, name: "John Doe", role: "Manager", status: "active", type: "management", mobile: "9876543210" },
    { id: 2, name: "Jane Smith", role: "Site Supervisor", status: "active", type: "delivery", mobile: "9876543211" },
    { id: 3, name: "Mike Johnson", role: "Worker", status: "inactive", type: "sales", mobile: "9876543212" },
    { id: 4, name: "Sarah Williams", role: "Architect", status: "active", type: "delivery", mobile: "9876543213" },
    { id: 5, name: "David Brown", role: "Engineer", status: "active", type: "sales", mobile: "9876543214" },
    { id: 6, name: "Emily Davis", role: "Site Manager", status: "inactive", type: "management", mobile: "9876543215" },
    { id: 7, name: "Chris Wilson", role: "Worker", status: "active", type: "sales", mobile: "9876543216" },
    { id: 8, name: "Jessica Taylor", role: "Supervisor", status: "active", type: "delivery", mobile: "9876543217" },
  ]);

  // Sites Data (with active/inactive status)
  const [sitesData] = useState([
    { id: 1, name: "Downtown Office Complex", location: "City Center", status: "active", staffCount: 12 },
    { id: 2, name: "Riverside Residential Tower", location: "Riverbank", status: "active", staffCount: 8 },
    { id: 3, name: "Greenfield Industrial Park", location: "North Industrial Area", status: "inactive", staffCount: 0 },
    { id: 4, name: "Harbor View Mall", location: "Waterfront", status: "active", staffCount: 15 },
    { id: 5, name: "Sunset Hills Villa Project", location: "Eastern Hills", status: "inactive", staffCount: 3 },
    { id: 6, name: "Tech Hub Innovation Center", location: "Tech Corridor", status: "active", staffCount: 20 },
    { id: 7, name: "Metro Transit Station", location: "Central District", status: "active", staffCount: 9 },
  ]);

  // ======================== COMPUTED METRICS ========================
  const totalStaff = staffData.length;
  const activeStaff = staffData.filter((staff) => staff.status === "active").length;
  const inactiveStaff = staffData.filter((staff) => staff.status === "inactive").length;

  const totalSites = sitesData.length;
  const activeSites = sitesData.filter((site) => site.status === "active").length;
  const inactiveSites = sitesData.filter((site) => site.status === "inactive").length;

  // Data for Pie Chart: Staff Status Distribution
  const staffStatusData = [
    { name: "Active Staff", value: activeStaff, color: "#10b981" },
    { name: "Inactive Staff", value: inactiveStaff, color: "#ef4444" },
  ];

  // Data for Bar Chart: Sites Status Distribution
  const sitesStatusData = [
    { name: "Active Sites", count: activeSites, fill: "#0ea5e9" },
    { name: "Inactive Sites", count: inactiveSites, fill: "#f59e0b" },
  ];

  // Data for additional Bar Chart: Staff per Site (Top 5)
  const staffPerSiteData = sitesData
    .filter((site) => site.staffCount > 0)
    .slice(0, 5)
    .map((site) => ({
      name: site.name.length > 15 ? site.name.substring(0, 12) + "..." : site.name,
      staff: site.staffCount,
    }));

  // ======================== STATE FOR UI INTERACTIONS ========================
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [showSitesDetails, setShowSitesDetails] = useState(false);

   const getStatusBadge = (qty) => {
    if (qty === 0) return <span className="badge bg-danger">Out of Stock</span>;
    if (qty < 10) return <span className="badge bg-warning text-dark">Low Stock</span>;
    return <span className="badge bg-success">In Stock</span>;
  };


  return (
    <React.Fragment>
      <Head title="Dashboard | Staff & Sites Overview" />
      <Content>
        {/* Header Section */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page tag="h3">
                Dashboard Overview
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>Welcome back, Admin! Here's your staff and sites summary.</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button className="btn-icon btn-trigger toggle-expand mr-n1">
                  <Icon name="calendar" />
                </Button>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* ======================== STATS CARDS ROW ======================== */}
        <Block>
          <Row className="g-gs">
            {/* Total Staff Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">TOTAL STAFF</h6>
                      <div className="stats-badges">
                        <span className="badge-info"> All Personnel</span>
                      </div>
                    </div>
                    <div
                      className="stats-icon blue"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowStaffDetails(!showStaffDetails)}
                    >
                      <Icon name="chevron-down" size={20} />
                    </div>
                  </div>
                  <div className="stats-value">
                    <span className="value-number">{totalStaff}</span>
                  </div>

                  {/* Dropdown Details */}
                  {showStaffDetails && (
                    <div className="stats-details mt-3 p-2" style={{ background: "#f8f9fa", borderRadius: "8px" }}>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span>👤 Active Staff:</span>
                        <span className="fw-bold text-success">{activeStaff}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span> Inactive Staff:</span>
                        <span className="fw-bold text-danger">{inactiveStaff}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between">
                        <span> Managers:</span>
                        <span className="fw-bold">
                          {staffData.filter((s) => s.role === "Manager" || s.role === "Site Manager").length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </PreviewAltCard>
            </Col>

            {/* Total Sites Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">TOTAL SITES</h6>
                      <div className="stats-badges">
                        <span className="badge-info"> Projects & Locations</span>
                      </div>
                    </div>
                    <div
                      className="stats-icon green"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowSitesDetails(!showSitesDetails)}
                    >
                      <Icon name="chevron-down" size={20} />
                    </div>
                  </div>
                  <div className="stats-value">
                    <span className="value-number">{totalSites}</span>
                  </div>

                  {/* Dropdown Details */}
                  {showSitesDetails && (
                    <div className="stats-details mt-3 p-2" style={{ background: "#f8f9fa", borderRadius: "8px" }}>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span> Active Sites:</span>
                        <span className="fw-bold text-success">{activeSites}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between mb-2">
                        <span> Inactive Sites:</span>
                        <span className="fw-bold text-danger">{inactiveSites}</span>
                      </div>
                      <div className="detail-item d-flex justify-content-between">
                        <span> Total Staff on Sites:</span>
                        <span className="fw-bold">
                          {sitesData.reduce((sum, site) => sum + site.staffCount, 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </PreviewAltCard>
            </Col>

            {/* Active Staff Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">ACTIVE STAFF</h6>
                      <div className="stats-badges">
                        <span className="badge-info"> Currently Working</span>
                      </div>
                    </div>
                  </div>
                  <div className="stats-value">
                    <span className="value-number text-success">{activeStaff}</span>
                    <small className="text-soft"> / {totalStaff}</small>
                  </div>
                  <div className="progress mt-2" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${(activeStaff / totalStaff) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </PreviewAltCard>
            </Col>

            {/* Active Sites Card */}
            <Col xl="3" md="3">
              <PreviewAltCard className="stats-card h-100">
                <div className="card-body">
                  <div className="stats-header">
                    <div>
                      <h6 className="stats-title">ACTIVE SITES</h6>
                      <div className="stats-badges">
                        <span className="badge-info"> Operational Locations</span>
                      </div>
                    </div>
                  </div>
                  <div className="stats-value">
                    <span className="value-number text-info">{activeSites}</span>
                    <small className="text-soft"> / {totalSites}</small>
                  </div>
                  <div className="progress mt-2" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-info"
                      style={{ width: `${(activeSites / totalSites) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </PreviewAltCard>
            </Col>
          </Row>
        </Block>

        {/* ======================== CHARTS SECTION ======================== */}
        <Block>
          <Row className="g-gs">
            {/* Pie Chart: Staff Status Distribution */}
            <Col xl="6" lg="6">
              <PreviewCard className="chart-card h-100">
                <div
                  className="card-head chart-header"
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  <h6
                    className="chart-title"
                    style={{
                      fontSize: "1rem",
                      margin: 0,
                      fontWeight: "600",
                      color: "#1a2b3c",
                    }}
                  >
                     Staff Status Distribution
                  </h6>
                </div>
                <div className="card-body" style={{ padding: "1.5rem" }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={staffStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {staffStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} staff`, "Count"]} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-3">
                    <p className="text-soft small">
                      Active staff make up {Math.round((activeStaff / totalStaff) * 100)}% of the workforce
                    </p>
                  </div>
                </div>
              </PreviewCard>
            </Col>

            {/* Bar Chart: Sites Status Distribution */}
            <Col xl="6" lg="6">
              <PreviewCard className="chart-card h-100">
                <div
                  className="card-head chart-header"
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  <h6
                    className="chart-title"
                    style={{
                      fontSize: "1rem",
                      margin: 0,
                      fontWeight: "600",
                      color: "#1a2b3c",
                    }}
                  >
                     Sites Status Overview
                  </h6>
                </div>
                <div className="card-body" style={{ padding: "1.5rem" }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sitesStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} sites`, "Count"]} />
                      <Legend />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-3">
                    <p className="text-soft small">
                      {activeSites} sites are currently operational, {inactiveSites} are on hold or completed
                    </p>
                  </div>
                </div>
              </PreviewCard>
            </Col>
          </Row>
        </Block>

        {/* ======================== STAFF PER SITE BAR CHART ======================== */}
        <Block>
          <Row className="g-gs">
            <Col xl="12" lg="12">
              <PreviewCard className="chart-card">
                <div
                  className="card-head chart-header"
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  <h6
                    className="chart-title"
                    style={{
                      fontSize: "1rem",
                      margin: 0,
                      fontWeight: "600",
                      color: "#1a2b3c",
                    }}
                  >
                     Staff Distribution Across Top Sites
                  </h6>
                </div>
                <div className="card-body" style={{ padding: "1.5rem" }}>
                  {staffPerSiteData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={staffPerSiteData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                        <YAxis label={{ value: "Number of Staff", angle: -90, position: "insideLeft" }} />
                        <Tooltip formatter={(value) => [`${value} staff`, "Count"]} />
                        <Legend />
                        <Bar dataKey="staff" fill="#8884d8" radius={[8, 8, 0, 0]}>
                          {staffPerSiteData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#8b5cf6"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-5">
                      <Icon name="bar-chart" size={48} className="text-soft" />
                      <p className="mt-3">No site data available for staff distribution</p>
                    </div>
                  )}
                  <div className="text-center mt-3">
                    <p className="text-soft small">
                      Total staff currently assigned to active sites:{" "}
                      <strong>{sitesData.reduce((sum, site) => sum + site.staffCount, 0)}</strong>
                    </p>
                  </div>
                </div>
              </PreviewCard>
            </Col>
          </Row>
        </Block>

        {/* ======================== RECENT SITES & STAFF SUMMARY ======================== */}
        <Block>
          <Row className="g-gs">
            <Col xl="6" lg="6">
              <PreviewCard className="h-100">
                <div
                  className="card-head"
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  <h6 className="card-title" style={{ margin: 0, fontWeight: "600" }}>
                     Recent Sites
                  </h6>
                </div>
                <div className="card-body" style={{ padding: "1rem" }}>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Site Name</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Staff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sitesData.slice(0, 4).map((site) => (
                          <tr key={site.id}>
                            <td>{site.name}</td>
                            <td>{site.location}</td>
                            <td>
                              <span
                                className={`badge ${site.status === "active" ? "bg-success" : "bg-danger"}`}
                                style={{ padding: "5px 10px", color: "white", borderRadius: "14px" }}
                              >
                                {site.status === "active" ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>{site.staffCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </PreviewCard>
            </Col>

            <Col xl="6" lg="6">
              <PreviewCard className="h-100">
                <div
                  className="card-head"
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  <h6 className="card-title" style={{ margin: 0, fontWeight: "600" }}>
                     Staff Highlights
                  </h6>
                </div>
                <div className="card-body" style={{ padding: "1rem" }}>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffData.slice(0, 5).map((staff) => (
                          <tr key={staff.id}>
                            <td>{staff.name}</td>
                            <td>{staff.role}</td>
                            <td>
                              <span
                                className={`badge ${staff.status === "active" ? "bg-success" : "bg-danger"}`}
                                style={{ padding: "5px 10px", color: "white", borderRadius: "14px" }}
                              >
                                {staff.status === "active" ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>{staff.mobile}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </PreviewCard>
            </Col>
          </Row>
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default Homepage;