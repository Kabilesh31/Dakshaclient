import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

// Format date helper - displays as dd/mm/yyyy
const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format currency
const formatCurrency = (amount) => {
  return `₹${parseFloat(amount).toFixed(2)}`;
};

// Custom Date Input Component
const CustomDateInput = React.forwardRef(({ value, onClick, onChange, placeholder, invalid }, ref) => {
  // Format the date for display
  const formatDisplayDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [inputValue, setInputValue] = useState(value ? formatDisplayDate(value) : "");

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value ? formatDisplayDate(value) : "");
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Try to parse dd/mm/yyyy
    if (val.length === 10) {
      const parts = val.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            // Call onChange with the date object
            if (onChange) {
              onChange(date);
            }
          }
        }
      }
    }
  };

  return (
    <input
      ref={ref}
      type="text"
      placeholder="dd/mm/yyyy"
      value={inputValue}
      onChange={handleChange}
      onClick={onClick}
      style={{
        borderRadius: "8px",
        border: `1.5px solid ${invalid ? "#dc3545" : "#e8e4e0"}`,
        fontSize: "13px",
        padding: "8px 12px",
        width: "100%",
        background: "#fff",
        outline: "none",
        transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
        cursor: "pointer",
      }}
    />
  );
});

const ExpensesTab = () => {
  const { id: projectId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: null,
    notes: ''
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    description: '',
    date: null,
    notes: ''
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Fetch expenses
  const fetchExpenses = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/expenses/project/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setExpenses(response.data.data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err.response?.data?.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle date changes
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
    // Clear error when date is selected
    if (formErrors.date) {
      setFormErrors(prev => ({ ...prev, date: null }));
    }
  };

  const handleEditDateChange = (date) => {
    setEditFormData(prev => ({ ...prev, date }));
    // Clear error when date is selected
    if (formErrors.date) {
      setFormErrors(prev => ({ ...prev, date: null }));
    }
  };

  // Create expense
  const handleCreateExpense = async () => {
    const errors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "Please enter a valid amount";
    }
    if (!formData.description || !formData.description.trim()) {
      errors.description = "Please enter a description";
    }
    if (!formData.date) {
      errors.date = "Please select a date";
    }
    
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setUploading(true);
    const data = {
      projectId,
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      date: formData.date.toISOString().split('T')[0],
      notes: formData.notes
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/expenses`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      showSuccess("Expense created successfully!");
      setOpenModal(false);
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error("Error creating expense:", err);
      showError(err.response?.data?.message || "Failed to create expense");
    } finally {
      setUploading(false);
    }
  };

  // Update expense
  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    
    const errors = {};
    if (!editFormData.amount || parseFloat(editFormData.amount) <= 0) {
      errors.amount = "Please enter a valid amount";
    }
    if (!editFormData.description || !editFormData.description.trim()) {
      errors.description = "Please enter a description";
    }
    if (!editFormData.date) {
      errors.date = "Please select a date";
    }
    
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setUploading(true);
    const data = {
      amount: parseFloat(editFormData.amount),
      description: editFormData.description.trim(),
      date: editFormData.date.toISOString().split('T')[0],
      notes: editFormData.notes
    };

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/expenses/${editingExpense._id}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      showSuccess("Expense updated successfully!");
      setOpenEditModal(false);
      setEditingExpense(null);
      resetEditForm();
      fetchExpenses();
    } catch (err) {
      console.error("Error updating expense:", err);
      showError(err.response?.data?.message || "Failed to update expense");
    } finally {
      setUploading(false);
    }
  };

  // Delete expense
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/expenses/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      showSuccess("Expense deleted successfully");
      fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
      showError(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeletingId(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      date: null,
      notes: ''
    });
    setFormErrors({});
  };

  const resetEditForm = () => {
    setEditFormData({
      amount: '',
      description: '',
      date: null,
      notes: ''
    });
    setFormErrors({});
  };

  // Open edit modal
  const openEditModalHandler = (expense) => {
    setEditingExpense(expense);
    setEditFormData({
      amount: expense.amount.toString(),
      description: expense.description || '',
      date: expense.date ? new Date(expense.date) : null,
      notes: expense.notes || ''
    });
    setOpenEditModal(true);
  };

  return (
    <React.Fragment>
      {/* Header */}
      <BlockHead size="sm">
        <BlockBetween>
          <BlockHeadContent>
            <BlockTitle page tag="h5" className="mt-2">
              Expenses
            </BlockTitle>
            <BlockDes className="text-soft">
              <p>Track and manage project expenses</p>
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
              <Icon name="plus" />
              Add Expense
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
          ) : expenses.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#fafafa",
              }}
            >
              <Icon
                name="credit-card"
                style={{
                  fontSize: "48px",
                  color: "#ccc",
                  marginBottom: "16px",
                }}
              />
              <h5 style={{ color: "#666", marginBottom: "8px" }}>
                No Expenses Recorded
              </h5>
              <p style={{ color: "#999", fontSize: "14px" }}>
                Add your first expense to track project costs
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
                <Icon name="plus" style={{ marginRight: "6px" }} />
                Add Expense
              </Button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      #
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      Date
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      Description
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      Amount
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "#666", borderBottom: "2px solid #f0f0f0", textAlign: "left" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, index) => (
                    <tr
                      key={expense._id}
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
                      <td style={{ padding: "14px 20px", fontSize: "13px", color: "#666", textAlign: "left" }}>
                        {formatDate(expense.date)}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "left" }}>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a2e" }}>
                          {expense.description}
                        </span>
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
                          {formatCurrency(expense.amount)}
                        </Badge>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "left" }}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          <Button
                            size="sm"
                            color="info"
                            outline
                            onClick={() => openEditModalHandler(expense)}
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
                            onClick={() => handleDelete(expense._id)}
                            disabled={deletingId === expense._id}
                            style={{
                              borderRadius: "6px",
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderColor: "#dc3545",
                              color: "#dc3545",
                            }}
                          >
                            {deletingId === expense._id ? (
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

      {/* Create Expense Modal */}
      <Modal
        isOpen={openModal}
        toggle={() => {
          setOpenModal(false);
          resetForm();
        }}
        size="lg"
        centered
      >
        <ModalHeader
          toggle={() => {
            setOpenModal(false);
            resetForm();
          }}
          style={{ borderBottom: "none", padding: "24px 28px 0" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "17px", color: "#1a1a2e" }}>
                Add Expense
              </div>
              <div style={{ fontSize: "12px", color: "#aaa", marginTop: "1px" }}>
                Record a new project expense
              </div>
            </div>
          </div>
        </ModalHeader>

        <ModalBody style={{ padding: "16px 28px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Date */}
            <FormGroup>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "5px", display: "block" }}>
                Date *
              </label>
              <DatePicker
                selected={formData.date}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                customInput={<CustomDateInput invalid={!!formErrors.date} />}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                popperPlacement="bottom-start"
                className="form-control"
                wrapperClassName="w-100"
              />
              {formErrors.date && (
                <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>
                  {formErrors.date}
                </div>
              )}
            </FormGroup>

            {/* Amount */}
            <FormGroup>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "5px", display: "block" }}>
                Amount (₹) *
              </label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                invalid={!!formErrors.amount}
                style={{
                  borderRadius: "8px",
                  border: `1.5px solid ${formErrors.amount ? "#dc3545" : "#e8e4e0"}`,
                  fontSize: "13px",
                  padding: "8px 12px",
                }}
              />
              {formErrors.amount && (
                <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>
                  {formErrors.amount}
                </div>
              )}
            </FormGroup>

            {/* Description - Full Width */}
            <FormGroup style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "5px", display: "block" }}>
                Description *
              </label>
              <Input
                type="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter expense description"
                rows="2"
                invalid={!!formErrors.description}
                style={{
                  borderRadius: "8px",
                  border: `1.5px solid ${formErrors.description ? "#dc3545" : "#e8e4e0"}`,
                  fontSize: "13px",
                  padding: "8px 12px",
                  resize: "vertical",
                }}
              />
              {formErrors.description && (
                <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>
                  {formErrors.description}
                </div>
              )}
            </FormGroup>
          </div>

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
                resetForm();
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
              onClick={handleCreateExpense}
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
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="check" /> Add Expense
                </>
              )}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={openEditModal}
        toggle={() => {
          setOpenEditModal(false);
          setEditingExpense(null);
          resetEditForm();
        }}
        size="lg"
        centered
      >
        <ModalHeader
          toggle={() => {
            setOpenEditModal(false);
            setEditingExpense(null);
            resetEditForm();
          }}
          style={{ borderBottom: "none", padding: "24px 28px 0" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: BRAND + "18",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="edit" style={{ color: BRAND, fontSize: "18px" }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "17px", color: "#1a1a2e" }}>
                Edit Expense
              </div>
              <div style={{ fontSize: "12px", color: "#aaa", marginTop: "1px" }}>
                Update expense details
              </div>
            </div>
          </div>
        </ModalHeader>

        <ModalBody style={{ padding: "16px 28px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Date */}
            <FormGroup>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "5px", display: "block" }}>
                Date *
              </label>
              <DatePicker
                selected={editFormData.date}
                onChange={handleEditDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                customInput={<CustomDateInput invalid={!!formErrors.date} />}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                popperPlacement="bottom-start"
                className="form-control"
                wrapperClassName="w-100"
              />
              {formErrors.date && (
                <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>
                  {formErrors.date}
                </div>
              )}
            </FormGroup>

            {/* Amount */}
            <FormGroup>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "5px", display: "block" }}>
                Amount (₹) *
              </label>
              <Input
                type="number"
                name="amount"
                value={editFormData.amount}
                onChange={handleEditInputChange}
                placeholder="Enter amount"
                invalid={!!formErrors.amount}
                style={{
                  borderRadius: "8px",
                  border: `1.5px solid ${formErrors.amount ? "#dc3545" : "#e8e4e0"}`,
                  fontSize: "13px",
                  padding: "8px 12px",
                }}
              />
              {formErrors.amount && (
                <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>
                  {formErrors.amount}
                </div>
              )}
            </FormGroup>

            {/* Description - Full Width */}
            <FormGroup style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "5px", display: "block" }}>
                Description *
              </label>
              <Input
                type="textarea"
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                placeholder="Enter expense description"
                rows="2"
                invalid={!!formErrors.description}
                style={{
                  borderRadius: "8px",
                  border: `1.5px solid ${formErrors.description ? "#dc3545" : "#e8e4e0"}`,
                  fontSize: "13px",
                  padding: "8px 12px",
                  resize: "vertical",
                }}
              />
              {formErrors.description && (
                <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "4px" }}>
                  {formErrors.description}
                </div>
              )}
            </FormGroup>
          </div>

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
                setEditingExpense(null);
                resetEditForm();
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
              onClick={handleUpdateExpense}
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
                  <Icon name="check" /> Update Expense
                </>
              )}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default ExpensesTab;