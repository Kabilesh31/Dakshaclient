import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  BlockBetween,
  Icon,
  Button,
} from "../../../components/Component";
import {
  Alert,
  Card,
  CardBody,
  FormGroup,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
  Badge
} from "reactstrap";

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api` || "http://localhost:5000/api";
const BASE_URL = `${process.env.REACT_APP_BACKENDURL}` || "http://localhost:5000";
const BRAND = "#4B5694";

// Sidebar Component for PDF View
const PdfSidebar = ({ isOpen, onClose, quotation }) => {
  if (!quotation) return null;

  const getPdfUrl = () => {
    if (quotation.pdfUrl?.startsWith("http")) return quotation.pdfUrl;
    if (quotation.pdfUrl?.startsWith("/uploads")) return `${BASE_URL}${quotation.pdfUrl}`;
    return `${BASE_URL}${quotation.pdfUrl || ""}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1040,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "clamp(500px, 70vw, 900px)",
          background: "#fff",
          zIndex: 1050,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #eef0f2",
            background: "#fafbfc",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "#f5f0eb",
                borderRadius: "8px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="file-pdf" style={{ fontSize: "24px", color: "#dc3545" }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "15px", color: "#1a1a2e" }}>
                {quotation.fileName}
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                ₹{quotation.price.toFixed(2)} • {new Date(quotation.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "24px",
              lineHeight: 1,
              color: "#666",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            ×
          </button>
        </div>

        {/* PDF Viewer */}
        <div style={{ flex: 1, overflow: "hidden", background: "#f5f5f5" }}>
          <iframe
            src={getPdfUrl()}
            title={quotation.fileName}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#fff",
            }}
          />
        </div>

        {/* Sidebar Footer with Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 24px",
            borderTop: "1px solid #eef0f2",
            background: "#fafbfc",
            flexShrink: 0,
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              size="sm"
              color="primary"
              href={getPdfUrl()}
              download
              style={{
                borderRadius: "6px",
                fontSize: "13px",
                padding: "6px 16px",
                background: BRAND,
                border: "none",
              }}
            >
              <Icon name="download" style={{ marginRight: "6px" }} />
              Download
            </Button>
            <Button
              size="sm"
              color="primary"
              outline
              href={getPdfUrl()}
              target="_blank"
              style={{
                borderRadius: "6px",
                fontSize: "13px",
                padding: "6px 16px",
                borderColor: BRAND,
                color: BRAND,
              }}
            >
              <Icon name="external-link" style={{ marginRight: "6px" }} />
              Open in New Tab
            </Button>
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {formatFileSize(quotation.fileSize)}
          </div>
        </div>
      </div>
    </>
  );
};

// Format file size helper
const formatFileSize = (bytes) => {
  if (!bytes) return "N/A";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Format date helper
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const QuotationsTab = () => {
  const { id: projectId } = useParams();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPdfSidebar, setOpenPdfSidebar] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [price, setPrice] = useState("");
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editFileName, setEditFileName] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Fetch quotations
  const fetchQuotations = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/invoices/project/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setQuotations(response.data.data || []);
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setError(err.response?.data?.message || "Failed to fetch quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [projectId]);

  // Show success/error messages
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        showError("Please select a valid PDF file");
        event.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showError("File size should be less than 10MB");
        event.target.value = "";
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleEditFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        showError("Please select a valid PDF file");
        event.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showError("File size should be less than 10MB");
        event.target.value = "";
        return;
      }
      setEditFile(file);
      setEditFileName(file.name);
    }
  };

  // Upload quotation
  const handleUpload = async () => {
    const errors = {};
    if (!selectedFile) errors.file = "Please select a PDF file";
    if (!price || parseFloat(price) <= 0) errors.price = "Please enter a valid price";
    
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("pdf", selectedFile);
    formData.append("price", parseFloat(price));
    formData.append("projectId", projectId);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/invoices`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      showSuccess("Quotation uploaded successfully!");
      setOpenModal(false);
      setSelectedFile(null);
      setFileName("");
      setPrice("");
      setFormErrors({});
      fetchQuotations();
    } catch (err) {
      console.error("Error uploading quotation:", err);
      showError(err.response?.data?.message || "Failed to upload quotation");
    } finally {
      setUploading(false);
    }
  };

  // Update quotation
  const handleUpdate = async () => {
    if (!editingQuotation) return;
    
    const errors = {};
    if (!editPrice || parseFloat(editPrice) <= 0) errors.editPrice = "Please enter a valid price";
    
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("price", parseFloat(editPrice));
    if (editFile) {
      formData.append("pdf", editFile);
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/invoices/${editingQuotation._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      showSuccess("Quotation updated successfully!");
      setOpenEditModal(false);
      setEditingQuotation(null);
      setEditPrice("");
      setEditFile(null);
      setEditFileName("");
      setFormErrors({});
      fetchQuotations();
    } catch (err) {
      console.error("Error updating quotation:", err);
      showError(err.response?.data?.message || "Failed to update quotation");
    } finally {
      setUploading(false);
    }
  };

  // Delete quotation
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation?")) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/invoices/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      showSuccess("Quotation deleted successfully");
      fetchQuotations();
    } catch (err) {
      console.error("Error deleting quotation:", err);
      showError(err.response?.data?.message || "Failed to delete quotation");
    } finally {
      setDeletingId(null);
    }
  };

  // View PDF in sidebar
  const handleViewPdf = (quotation) => {
    setSelectedQuotation(quotation);
    setOpenPdfSidebar(true);
  };

  // Get PDF URL
  const getPdfUrl = (quotation) => {
    if (quotation.pdfUrl?.startsWith("http")) return quotation.pdfUrl;
    if (quotation.pdfUrl?.startsWith("/uploads")) return `${BASE_URL}${quotation.pdfUrl}`;
    return `${BASE_URL}${quotation.pdfUrl || ""}`;
  };

  return (
    <React.Fragment>
      {/* Header */}
      <BlockHead size="sm">
        <BlockBetween>
          <BlockHeadContent>
            <BlockTitle page tag="h5" className="mt-2">
              Quotations
            </BlockTitle>
            <BlockDes className="text-soft">
              <p>Upload and manage quotation PDFs with pricing</p>
            </BlockDes>
          </BlockHeadContent>
          <BlockHeadContent>
            <Button
              color="primary"
              onClick={() => setOpenModal(true)}
              style={{
                background: BRAND,
                border: "none",
                borderRadius: "8px",
                padding: "8px 20px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Icon name="upload" />
              Upload Quotation
            </Button>
          </BlockHeadContent>
        </BlockBetween>
      </BlockHead>

      {/* Alerts */}
      {error && (
        <Alert color="danger" className="mb-3 d-flex align-items-center justify-content-between">
          <span>{error}</span>
          <Button close onClick={() => setError(null)} />
        </Alert>
      )}
      {successMessage && (
        <Alert color="success" className="mb-3 d-flex align-items-center justify-content-between">
          <span>{successMessage}</span>
          <Button close onClick={() => setSuccessMessage(null)} />
        </Alert>
      )}

      {/* Table */}
      <Card className="card-bordered" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <CardBody style={{ padding: 0 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <Spinner style={{ color: BRAND }} />
            </div>
          ) : quotations.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#fafafa",
              }}
            >
              <Icon
                name="file-pdf"
                style={{
                  fontSize: "48px",
                  color: "#ccc",
                  marginBottom: "16px",
                }}
              />
              <h5 style={{ color: "#666", marginBottom: "8px" }}>
                No Quotations Uploaded
              </h5>
              <p style={{ color: "#999", fontSize: "14px" }}>
                Upload your first quotation PDF with pricing information
              </p>
              <Button
                color="primary"
                onClick={() => setOpenModal(true)}
                style={{
                  background: BRAND,
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 24px",
                  marginTop: "12px",
                }}
              >
                <Icon name="upload" style={{ marginRight: "6px" }} />
                Upload Now
              </Button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      S.No
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      File Name
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      Price (₹)
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      Size
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      Uploaded Date
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((quotation, index) => (
                    <tr
                      key={quotation._id}
                      style={{
                        transition: "background 0.2s ease",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 20px", fontSize: "13px", color: "#888", textAlign: "left" }}>
                        {index + 1}
                      </td>
                      
                      <td style={{ padding: "14px 20px", textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              background: "#f5f0eb",
                              borderRadius: "6px",
                              padding: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon name="file-pdf" style={{ fontSize: "18px", color: "#dc3545" }} />
                          </div>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "#1a1a2e",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "inline-block",
                            }}
                            title={quotation.fileName}
                          >
                            {quotation.fileName}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "left" }}>
                        <Badge
                          color="success"
                          style={{
                            background: "#eaf3de",
                            color: "#3b6d11",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          ₹{quotation.price.toFixed(2)}
                        </Badge>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "13px", color: "#666", textAlign: "left" }}>
                        {formatFileSize(quotation.fileSize)}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "13px", color: "#666", textAlign: "left" }}>
                        {formatDate(quotation.uploadedAt)}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "left" }}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          <Button
                            size="sm"
                            color="primary"
                            outline
                            onClick={() => handleViewPdf(quotation)}
                            style={{
                              borderRadius: "6px",
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderColor: BRAND,
                              color: BRAND,
                              minWidth: "60px",
                            }}
                          >
                            <Icon name="eye" /> View
                          </Button>
                          <Button
                            size="sm"
                            color="primary"
                            outline
                            href={getPdfUrl(quotation)}
                            download
                            style={{
                              borderRadius: "6px",
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderColor: BRAND,
                              color: BRAND,
                            }}
                          >
                            <Icon name="download" />
                          </Button>
                          <Button
                            size="sm"
                            color="info"
                            outline
                            onClick={() => {
                              setEditingQuotation(quotation);
                              setEditPrice(quotation.price.toString());
                              setOpenEditModal(true);
                            }}
                            style={{
                              borderRadius: "6px",
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderColor: "#17a2b8",
                              color: "#17a2b8",
                            }}
                          >
                            <Icon name="edit" />
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => handleDelete(quotation._id)}
                            disabled={deletingId === quotation._id}
                            style={{
                              borderRadius: "6px",
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderColor: "#dc3545",
                              color: "#dc3545",
                            }}
                          >
                            {deletingId === quotation._id ? (
                              <Spinner size="sm" />
                            ) : (
                              <Icon name="trash" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* PDF Sidebar */}
      <PdfSidebar
        isOpen={openPdfSidebar}
        onClose={() => {
          setOpenPdfSidebar(false);
          setSelectedQuotation(null);
        }}
        quotation={selectedQuotation}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={openModal}
        toggle={() => {
          setOpenModal(false);
          setSelectedFile(null);
          setFileName("");
          setPrice("");
          setFormErrors({});
        }}
        size="lg"
        centered
      >
        <ModalHeader
          toggle={() => {
            setOpenModal(false);
            setSelectedFile(null);
            setFileName("");
            setPrice("");
            setFormErrors({});
          }}
          style={{ borderBottom: "none", padding: "24px 28px 0" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "17px", color: "#1a1a2e" }}>
                Upload Quotation
              </div>
              <div style={{ fontSize: "12px", color: "#aaa", marginTop: "1px" }}>
                Upload PDF quotation with pricing
              </div>
            </div>
          </div>
        </ModalHeader>

        <ModalBody style={{ padding: "16px 28px 28px" }}>
          {/* File Upload */}
          <FormGroup style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#555",
                marginBottom: "5px",
                display: "block",
              }}
            >
              PDF File *
            </label>
            <div
              style={{
                border: `2px dashed ${formErrors.file ? "#dc3545" : "#e0e0e0"}`,
                borderRadius: "12px",
                padding: "30px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: "#fafafa",
              }}
              onClick={() => document.getElementById("file-upload").click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = BRAND;
                e.currentTarget.style.background = "#f0f5ff";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = formErrors.file ? "#dc3545" : "#e0e0e0";
                e.currentTarget.style.background = "#fafafa";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  if (file.type === "application/pdf") {
                    setSelectedFile(file);
                    setFileName(file.name);
                  } else {
                    showError("Please drop a valid PDF file");
                  }
                }
                e.currentTarget.style.borderColor = formErrors.file ? "#dc3545" : "#e0e0e0";
                e.currentTarget.style.background = "#fafafa";
              }}
            >
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              {selectedFile ? (
                <div>
                  <Icon
                    name="check-circle"
                    style={{ fontSize: "32px", color: "#28a745", marginBottom: "8px" }}
                  />
                  <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{fileName}</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    outline
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setFileName("");
                    }}
                    style={{
                      marginTop: "8px",
                      fontSize: "11px",
                      padding: "2px 12px",
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Icon
                    name="cloud-upload"
                    style={{ fontSize: "48px", color: BRAND, marginBottom: "8px" }}
                  />
                  <div style={{ fontWeight: 600, color: "#1a1a2e" }}>
                    Drop your PDF here
                  </div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    or click to browse (Max 10MB)
                  </div>
                </div>
              )}
            </div>
            {formErrors.file && (
              <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>
                {formErrors.file}
              </div>
            )}
          </FormGroup>

          {/* Price Input */}
          <FormGroup>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#555",
                marginBottom: "5px",
                display: "block",
              }}
            >
              Price (₹) *
            </label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter quotation price"
              invalid={!!formErrors.price}
              style={{
                borderRadius: "8px",
                border: `1.5px solid ${formErrors.price ? "#dc3545" : "#e8e4e0"}`,
                fontSize: "13px",
                padding: "8px 12px",
              }}
            />
            {formErrors.price && (
              <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>
                {formErrors.price}
              </div>
            )}
          </FormGroup>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button
              onClick={() => {
                setOpenModal(false);
                setSelectedFile(null);
                setFileName("");
                setPrice("");
                setFormErrors({});
              }}
              style={{
                background: "#f5f5f5",
                color: "#555",
                border: "1.5px solid #e0e0e0",
                borderRadius: "8px",
                padding: "9px 22px",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                background: BRAND,
                border: "none",
                borderRadius: "8px",
                padding: "9px 22px",
                fontWeight: 600,
                fontSize: "13px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: uploading ? 0.6 : 1,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? (
                <>
                  <Spinner size="sm" style={{ color: "#fff" }} />
                  Uploading...
                </>
              ) : (
                <>
                  <Icon name="upload" /> Upload Quotation
                </>
              )}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={openEditModal}
        toggle={() => {
          setOpenEditModal(false);
          setEditingQuotation(null);
          setEditPrice("");
          setEditFile(null);
          setEditFileName("");
          setFormErrors({});
        }}
        size="lg"
        centered
      >
        <ModalHeader
          toggle={() => {
            setOpenEditModal(false);
            setEditingQuotation(null);
            setEditPrice("");
            setEditFile(null);
            setEditFileName("");
            setFormErrors({});
          }}
          style={{ borderBottom: "none", padding: "24px 28px 0" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            
            <div>
              <div style={{ fontWeight: 700, fontSize: "17px", color: "#1a1a2e" }}>
                Edit Quotation
              </div>
              <div style={{ fontSize: "12px", color: "#aaa", marginTop: "1px" }}>
                Update price or replace PDF
              </div>
            </div>
          </div>
        </ModalHeader>

        <ModalBody style={{ padding: "16px 28px 28px" }}>
          {/* Current File Info */}
          <div
            style={{
              background: "#f8f9fa",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#666", fontWeight: 600 }}>
              Current File
            </div>
            <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>
              {editingQuotation?.fileName}
            </div>
            <div style={{ fontSize: "11px", color: "#999" }}>
              {formatFileSize(editingQuotation?.fileSize)}
            </div>
          </div>

          {/* Replace File */}
          <FormGroup style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#555",
                marginBottom: "5px",
                display: "block",
              }}
            >
              Replace PDF (Optional)
            </label>
            <div
              style={{
                border: "2px dashed #e0e0e0",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: "#fafafa",
              }}
              onClick={() => document.getElementById("edit-file-upload").click()}
            >
              <input
                id="edit-file-upload"
                type="file"
                accept=".pdf"
                onChange={handleEditFileSelect}
                style={{ display: "none" }}
              />
              {editFile ? (
                <div>
                  <Icon
                    name="check-circle"
                    style={{ fontSize: "24px", color: "#28a745", marginBottom: "4px" }}
                  />
                  <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{editFileName}</div>
                  <div style={{ fontSize: "11px", color: "#999" }}>
                    {(editFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    outline
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditFile(null);
                      setEditFileName("");
                    }}
                    style={{
                      marginTop: "4px",
                      fontSize: "11px",
                      padding: "2px 12px",
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Icon
                    name="cloud-upload"
                    style={{ fontSize: "32px", color: BRAND, marginBottom: "4px" }}
                  />
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    Click to replace PDF (Max 10MB)
                  </div>
                </div>
              )}
            </div>
          </FormGroup>

          {/* Price Input */}
          <FormGroup>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#555",
                marginBottom: "5px",
                display: "block",
              }}
            >
              Price (₹) *
            </label>
            <Input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="Enter quotation price"
              invalid={!!formErrors.editPrice}
              style={{
                borderRadius: "8px",
                border: `1.5px solid ${formErrors.editPrice ? "#dc3545" : "#e8e4e0"}`,
                fontSize: "13px",
                padding: "8px 12px",
              }}
            />
            {formErrors.editPrice && (
              <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>
                {formErrors.editPrice}
              </div>
            )}
          </FormGroup>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button
              onClick={() => {
                setOpenEditModal(false);
                setEditingQuotation(null);
                setEditPrice("");
                setEditFile(null);
                setEditFileName("");
                setFormErrors({});
              }}
              style={{
                background: "#f5f5f5",
                color: "#555",
                border: "1.5px solid #e0e0e0",
                borderRadius: "8px",
                padding: "9px 22px",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={uploading}
              style={{
                background: BRAND,
                border: "none",
                borderRadius: "8px",
                padding: "9px 22px",
                fontWeight: 600,
                fontSize: "13px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: uploading ? 0.6 : 1,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? (
                <>
                  <Spinner size="sm" style={{ color: "#fff" }} />
                  Updating...
                </>
              ) : (
                <>
                  <Icon name="check" /> Update Quotation
                </>
              )}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default QuotationsTab;