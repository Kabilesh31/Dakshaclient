import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Button, Row, Col, Spinner, Modal, ModalHeader, ModalBody, TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
// import { errorToast } from "../../utils/toaster";
import * as XLSX from "xlsx";
import "./report.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf, FaImage, FaFilePdf as FaPdf, FaMap } from "react-icons/fa";

const ProjectsReportPage = () => {
  const [projectsList, setProjectsList] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Aggregated metrics (shown when no project selected)
  const [aggregatedMetrics, setAggregatedMetrics] = useState({
    totalProjects: 0,
    totalBudget: 0,
    avgCompletion: 0,
    activeProjects: 0,
    inactiveProjects: 0,
    totalStaffAssigned: 0,
  });

  // Fetch all projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      const projects = res.data.data || [];
      setProjectsList(projects);
      calculateAggregatedMetrics(projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      errorToast("Failed to fetch projects list");
    } finally {
      setLoadingProjects(false);
    }
  };

  // Calculate aggregated metrics from all projects
  const calculateAggregatedMetrics = (projects) => {
    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const avgCompletion = totalProjects > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.completion || 0), 0) / totalProjects) 
      : 0;
    const activeProjects = projects.filter(p => p.status === "active").length;
    const inactiveProjects = projects.filter(p => p.status === "inactive").length;
    const totalStaffAssigned = projects.reduce((sum, p) => sum + (p.staffAssigned?.length || 0), 0);

    setAggregatedMetrics({
      totalProjects,
      totalBudget,
      avgCompletion,
      activeProjects,
      inactiveProjects,
      totalStaffAssigned,
    });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on search and status
  useEffect(() => {
    let filtered = [...projectsList];
    
    // Search filter
    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        (p.projectId && p.projectId.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  }, [projectsList, search, statusFilter]);

  // Reset all filters and selection
  const resetFilters = () => {
    setSelectedProject(null);
    setSearch("");
    setStatusFilter("all");
  };

  // When a project is selected, reset media tab to gallery
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setActiveTab("gallery");
  };

  // Export functions
  const exportPDF = () => {
    if (selectedProject) {
      exportSingleProjectPDF(selectedProject);
    } else {
      exportAllProjectsPDF();
    }
  };

  const exportSingleProjectPDF = (project) => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Project Report", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, margin, y);
    y += 6;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Project Information", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${project.name}`, margin, y);
    y += 6;
    doc.text(`ID: ${project.projectId}`, margin, y);
    y += 6;
    doc.text(`Location: ${project.location}`, margin, y);
    y += 6;
    doc.text(`Status: ${project.status}`, margin, y);
    y += 6;
    doc.text(`Start Date: ${project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN") : "-"}`, margin, y);
    y += 6;
    doc.text(`Completion: ${project.completion}%`, margin, y);
    y += 6;
    doc.text(`Budget: ₹${(project.budget || 0).toLocaleString("en-IN")}`, margin, y);
    y += 6;
    doc.text(`Project Value: ${project.projectValue || "-"}`, margin, y);
    y += 6;
    doc.text(`Staff Assigned: ${project.staffAssigned?.length || 0}`, margin, y);
    y += 10;

    if (project.progressHistory && project.progressHistory.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Progress Stages", margin, y);
      y += 6;
      const tableColumn = ["Stage", "Start Date", "End Date", "Status", "Completion %"];
      const tableRows = project.progressHistory.map(stage => [
        stage.stage,
        stage.startDate ? new Date(stage.startDate).toLocaleDateString("en-IN") : "-",
        stage.endDate ? new Date(stage.endDate).toLocaleDateString("en-IN") : "-",
        stage.status,
        `${stage.completion}%`,
      ]);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: y,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 9 },
      });
      y = doc.lastAutoTable.finalY + 10;
    } else {
      doc.text("No progress history available.", margin, y);
      y += 10;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Media Attachments", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Gallery Images: ${project.galleryImages?.length || 0}`, margin, y);
    y += 5;
    doc.text(`Site Plans: ${project.sitePlanImages?.length || 0}`, margin, y);
    y += 5;
    doc.text(`Documents: ${project.documents?.length || 0}`, margin, y);

    doc.save(`${project.name}_Project_Report.pdf`);
  };

  const exportAllProjectsPDF = () => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Projects Summary Report", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, margin, y);
    y += 6;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Metrics", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Total Projects: ${aggregatedMetrics.totalProjects}`, margin, y);
    y += 6;
    doc.text(`Total Budget: ₹${aggregatedMetrics.totalBudget.toLocaleString("en-IN")}`, margin, y);
    y += 6;
    doc.text(`Average Completion: ${aggregatedMetrics.avgCompletion}%`, margin, y);
    y += 6;
    doc.text(`Active Projects: ${aggregatedMetrics.activeProjects}`, margin, y);
    y += 6;
    doc.text(`Inactive Projects: ${aggregatedMetrics.inactiveProjects}`, margin, y);
    y += 6;
    doc.text(`Total Staff Assigned: ${aggregatedMetrics.totalStaffAssigned}`, margin, y);
    y += 10;

    const tableColumn = ["Project ID", "Name", "Location", "Status", "Completion %", "Budget (₹)"];
    const tableRows = filteredProjects.map(p => [
      p.projectId || "-",
      p.name,
      p.location,
      p.status,
      `${p.completion}%`,
      (p.budget || 0).toLocaleString("en-IN"),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9 },
    });

    doc.save("All_Projects_Report.pdf");
  };

  const exportExcel = () => {
    if (selectedProject) {
      exportSingleProjectExcel(selectedProject);
    } else {
      exportAllProjectsExcel();
    }
  };

  const exportSingleProjectExcel = (project) => {
    const summaryData = [
      { Metric: "Project Name", Value: project.name },
      { Metric: "Project ID", Value: project.projectId },
      { Metric: "Location", Value: project.location },
      { Metric: "Status", Value: project.status },
      { Metric: "Start Date", Value: project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN") : "-" },
      { Metric: "Completion", Value: `${project.completion}%` },
      { Metric: "Budget (₹)", Value: (project.budget || 0).toLocaleString("en-IN") },
      { Metric: "Project Value", Value: project.projectValue || "-" },
      { Metric: "Staff Count", Value: project.staffAssigned?.length || 0 },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    const progressData = (project.progressHistory || []).map((stage, idx) => ({
      "S.No": idx + 1,
      Stage: stage.stage,
      "Start Date": stage.startDate ? new Date(stage.startDate).toLocaleDateString("en-IN") : "-",
      "End Date": stage.endDate ? new Date(stage.endDate).toLocaleDateString("en-IN") : "-",
      Status: stage.status,
      "Completion %": stage.completion,
    }));
    const progressSheet = XLSX.utils.json_to_sheet(progressData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    if (progressData.length) XLSX.utils.book_append_sheet(wb, progressSheet, "Progress History");
    XLSX.writeFile(wb, `${project.name}_Project_Report.xlsx`);
  };

  const exportAllProjectsExcel = () => {
    const summaryData = [
      { Metric: "Total Projects", Value: aggregatedMetrics.totalProjects },
      { Metric: "Total Budget (₹)", Value: aggregatedMetrics.totalBudget.toLocaleString("en-IN") },
      { Metric: "Average Completion (%)", Value: aggregatedMetrics.avgCompletion },
      { Metric: "Active Projects", Value: aggregatedMetrics.activeProjects },
      { Metric: "Inactive Projects", Value: aggregatedMetrics.inactiveProjects },
      { Metric: "Total Staff Assigned", Value: aggregatedMetrics.totalStaffAssigned },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    const projectsData = filteredProjects.map((p, idx) => ({
      "S.No": idx + 1,
      "Project ID": p.projectId,
      Name: p.name,
      Location: p.location,
      Status: p.status,
      "Start Date": p.startDate ? new Date(p.startDate).toLocaleDateString("en-IN") : "-",
      "Completion %": p.completion,
      "Budget (₹)": p.budget,
      "Project Value": p.projectValue,
      "Staff Count": p.staffAssigned?.length || 0,
    }));
    const projectsSheet = XLSX.utils.json_to_sheet(projectsData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(wb, projectsSheet, "All Projects");
    XLSX.writeFile(wb, "All_Projects_Report.xlsx");
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2 className="mt-5 reports-title">Projects Report</h2>
        <p className="reports-subtitle">
          View overall project metrics and detailed information per project
        </p>
      </div>

      <div className="reports-content">
        {/* Left Panel - Project List with Reset button */}
        <div className="customers-panel">
          <div className="customers-panel-header" style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
            <h5 className="panel-title" style={{ margin: 0 }}>Projects</h5>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="customer-count">{filteredProjects.length} of {projectsList.length}</span>
              <Button size="sm" color="secondary" onClick={resetFilters} className="ml-2" style={{ padding: "4px 8px", fontSize: "12px" }}>
                <i className="ni ni-refresh-01"></i> Reset
              </Button>
            </div>
          </div>
          <div className="search-box">
            <i className="ni ni-search search-icon ml-4"></i>
            <Input
              type="text"
              placeholder="Search by name, location or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && <button className="clear-search" onClick={() => setSearch("")}>×</button>}
          </div>
          <div className="customers-list">
            {loadingProjects ? (
              <div className="text-center p-4"><Spinner size="sm" color="primary" /> Loading projects...</div>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((p) => (
                <div
                  key={p._id}
                  className={`customer-item ${selectedProject?._id === p._id ? "selected" : ""}`}
                  onClick={() => handleProjectSelect(p)}
                >
                  <div className="customer-avatar">{p.name.charAt(0)}</div>
                  <div className="customer-info">
                    <div className="customer-name">{p.name}</div>
                    <div className="customer-details" style={{ fontSize: "11px" }}>
                      {p.projectId} • {p.location}
                    </div>
                  </div>
                  {selectedProject?._id === p._id && <div className="selected-indicator"><i className="ni ni-check"></i></div>}
                </div>
              ))
            ) : (
              <div className="no-customers"><i className="ni ni-building"></i><p>No projects found</p></div>
            )}
          </div>
        </div>

        {/* Right Panel - Aggregated or Detailed Report */}
        <div className="reports-panel">
          {selectedProject ? (
            // Detailed view for selected project
            <>
              <div className="action-bar ultra-compact d-flex align-items-center justify-content-end gap-2 flex-wrap">
                <div className="status-filter-wrapper mr-auto" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label className="mb-0">Status Filter: </label>
                  <select 
                    className="form-control form-control-sm" 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: "120px" }}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="export-buttons ultra-compact d-flex align-items-center gap-1">
                  <button onClick={exportExcel} className="export-btn excel ultra-compact"><FaFileExcel /></button>
                  <button onClick={exportPDF} className="export-btn pdf ultra-compact"><FaFilePdf size={13} /></button>
                </div>
              </div>

              <div className="customer-header">
                <div
                  className="customer-header-info"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div className="customer-header-avatar">
                      {selectedProject.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="customer-header-name" style={{ marginBottom: "4px" }}>
                        {selectedProject.name}
                      </h3>
                      <p className="customer-header-meta">
                        {selectedProject.projectId} • {selectedProject.location}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      className="badge"
                      style={{
                        background: selectedProject.status === "active" ? "#28a745" : "#6c757d",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        display: "inline-block",
                        marginBottom: "6px",
                      }}
                    >
                      {selectedProject.status === "active" ? "Active" : "Inactive"}
                    </span>
                    <p className="customer-header-meta" style={{ margin: 0 }}>
                      Completion: <strong>{selectedProject.completion}%</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <Row className="stats-row g-2">
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon blue compact"><i className="ni ni-wallet-fill"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Budget</span>
                      <span className="stat-value">₹{(selectedProject.budget || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon success compact"><i className="ni ni-growth-fill"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Completion</span>
                      <span className="stat-value">{selectedProject.completion}%</span>
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon info compact"><i className="ni ni-building-fill"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Project Value</span>
                      <span className="stat-value">{selectedProject.projectValue || "-"}</span>
                    </div>
                  </div>
                </Col>
                <Col md="3">
                  <div className="stat-card compact">
                    <div className="stat-icon purple compact"><i className="ni ni-users-fill"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Staff Assigned</span>
                      <span className="stat-value">{selectedProject.staffAssigned?.length || 0}</span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Description */}
              {selectedProject.description && (
                <div className="project-description" style={{ marginTop: "15px", padding: "10px", background: "#f8f9fa", borderRadius: "8px" }}>
                  <strong>Description:</strong> {selectedProject.description}
                </div>
              )}

              {/* Progress History Table */}
              {selectedProject.progressHistory && selectedProject.progressHistory.length > 0 && (
                <div className="transactions-section" style={{ marginTop: "20px" }}>
                  <div className="transactions-header">
                    <h6 className="transactions-title">Progress Stages</h6>
                    <span className="transactions-count">{selectedProject.progressHistory.length} stages</span>
                  </div>
                  <div className="table-responsive">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Stage</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Status</th>
                          <th>Completion %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProject.progressHistory.map((stage, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{stage.stage}</td>
                            <td>{stage.startDate ? new Date(stage.startDate).toLocaleDateString("en-IN") : "-"}</td>
                            <td>{stage.endDate ? new Date(stage.endDate).toLocaleDateString("en-IN") : "-"}</td>
                            <td>
                              <span className="badge" style={{
                                background: stage.status === "completed" ? "#28a745" : stage.status === "in-progress" ? "#ffc107" : "#6c757d",
                                color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "11px"
                              }}>
                                {stage.status}
                              </span>
                            </td>
                            <td>{stage.completion}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Media Tabs */}
              <div style={{ marginTop: "20px" }}>
                <Nav tabs>
                  <NavItem>
                    <NavLink className={activeTab === "gallery" ? "active" : ""} onClick={() => setActiveTab("gallery")}>
                      <FaImage /> Gallery ({selectedProject.galleryImages?.length || 0})
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink className={activeTab === "siteplans" ? "active" : ""} onClick={() => setActiveTab("siteplans")}>
                      <FaMap /> Site Plans ({selectedProject.sitePlanImages?.length || 0})
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>
                      <FaPdf /> Documents ({selectedProject.documents?.length || 0})
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab} style={{ padding: "15px", border: "1px solid #dee2e6", borderTop: "none", borderRadius: "0 0 8px 8px" }}>
                  <TabPane tabId="gallery">
                    <div className="gallery-grid" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {selectedProject.galleryImages && selectedProject.galleryImages.length > 0 ? (
                        selectedProject.galleryImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={`Gallery ${idx + 1}`}
                            style={{ width: "120px", height: "120px", objectFit: "cover", cursor: "pointer", borderRadius: "8px", border: "1px solid #ddd" }}
                            onClick={() => { setSelectedImage(img.url); setImageModalOpen(true); }}
                          />
                        ))
                      ) : <p className="text-muted">No gallery images available.</p>}
                    </div>
                  </TabPane>
                  <TabPane tabId="siteplans">
                    <div className="siteplans-grid" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {selectedProject.sitePlanImages && selectedProject.sitePlanImages.length > 0 ? (
                        selectedProject.sitePlanImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={`Site Plan ${idx + 1}`}
                            style={{ width: "200px", height: "150px", objectFit: "cover", cursor: "pointer", borderRadius: "8px", border: "1px solid #ddd" }}
                            onClick={() => { setSelectedImage(img.url); setImageModalOpen(true); }}
                          />
                        ))
                      ) : <p className="text-muted">No site plan images available.</p>}
                    </div>
                  </TabPane>
                  <TabPane tabId="documents">
                    <div className="documents-list">
                      {selectedProject.documents && selectedProject.documents.length > 0 ? (
                        <ul className="list-group">
                          {selectedProject.documents.map((doc, idx) => (
                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                              <span><FaPdf /> {doc.originalName || doc.filename}</span>
                              <a href={`${process.env.REACT_APP_BACKENDURL}${doc.url}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">View</a>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-muted">No documents uploaded.</p>}
                    </div>
                  </TabPane>
                </TabContent>
              </div>
            </>
          ) : (
            // Aggregated view for all projects
            <>
              <div className="action-bar ultra-compact d-flex align-items-center justify-content-end gap-2 flex-wrap">
                <div className="status-filter-wrapper mr-auto" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label className="mb-0">Status Filter: </label>
                  <select 
                    className="form-control form-control-sm" 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: "120px" }}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="export-buttons ultra-compact d-flex align-items-center gap-1">
                  <button onClick={exportExcel} className="export-btn excel ultra-compact"><FaFileExcel /></button>
                  <button onClick={exportPDF} className="export-btn pdf ultra-compact"><FaFilePdf size={13} /></button>
                </div>
              </div>

              <div className="customer-header">
                <div className="customer-header-info">
                  <div className="customer-header-avatar"><i className="ni ni-building" style={{ fontSize: "24px" }}></i></div>
                  <div>
                    <h3 className="customer-header-name">Projects Summary</h3>
                    <p className="customer-header-meta">Overall metrics across all projects</p>
                  </div>
                </div>
              </div>

              {/* Aggregated Stats Cards */}
              <Row className="stats-row g-2">
                <Col md="4">
                  <div className="stat-card compact">
                    <div className="stat-icon blue compact"><i className="ni ni-building"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Total Projects</span>
                      <span className="stat-value">{aggregatedMetrics.totalProjects}</span>
                    </div>
                  </div>
                </Col>
                <Col md="4">
                  <div className="stat-card compact">
                    <div className="stat-icon success compact"><i className="ni ni-credit-card"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Total Budget</span>
                      <span className="stat-value">₹{aggregatedMetrics.totalBudget.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </Col>
                <Col md="4">
                  <div className="stat-card compact">
                    <div className="stat-icon info compact"><i className="ni ni-chart-pie-36"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Avg Completion</span>
                      <span className="stat-value">{aggregatedMetrics.avgCompletion}%</span>
                    </div>
                  </div>
                </Col>
                <Col md="4">
                  <div className="stat-card compact">
                    <div className="stat-icon purple compact"><i className="ni ni-check"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Active Projects</span>
                      <span className="stat-value">{aggregatedMetrics.activeProjects}</span>
                    </div>
                  </div>
                </Col>
                <Col md="4">
                  <div className="stat-card compact">
                    <div className="stat-icon warning compact"><i className="ni ni-circle-08"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Inactive Projects</span>
                      <span className="stat-value">{aggregatedMetrics.inactiveProjects}</span>
                    </div>
                  </div>
                </Col>
                <Col md="4">
                  <div className="stat-card compact">
                    <div className="stat-icon orange compact"><i className="ni ni-single-02"></i></div>
                    <div className="stat-content">
                      <span className="stat-label">Total Staff Assigned</span>
                      <span className="stat-value">{aggregatedMetrics.totalStaffAssigned}</span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* List of filtered projects (table) */}
              <div className="transactions-section" style={{ marginTop: "20px" }}>
                <div className="transactions-header">
                  <h6 className="transactions-title">Project List</h6>
                  <span className="transactions-count">{filteredProjects.length} projects</span>
                </div>
                <div className="table-responsive">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Project ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Completion</th>
                        <th>Budget (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((p, idx) => (
                        <tr key={p._id} style={{ cursor: "pointer" }} onClick={() => handleProjectSelect(p)}>
                          <td>{idx + 1}</td>
                          <td>{p.projectId}</td>
                          <td>{p.name}</td>
                          <td>{p.location}</td>
                          <td>
                            <span className="badge" style={{
                              background: p.status === "active" ? "#28a745" : "#6c757d",
                              color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "11px"
                            }}>
                              {p.status}
                            </span>
                           </td>
                          <td>{p.completion}%</td>
                          <td>₹{(p.budget || 0).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <Modal isOpen={imageModalOpen} toggle={() => setImageModalOpen(false)} size="lg" centered>
        <ModalHeader toggle={() => setImageModalOpen(false)}>Image Preview</ModalHeader>
        <ModalBody className="text-center">
          {selectedImage && <img src={selectedImage} alt="Preview" style={{ maxWidth: "100%", maxHeight: "70vh" }} />}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ProjectsReportPage;