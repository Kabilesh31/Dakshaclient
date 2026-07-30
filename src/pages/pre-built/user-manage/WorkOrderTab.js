import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WorkOrderPage.css';

const WorkOrderPage = ({ projectId, projectName }) => {
  // State management
  const [workOrders, setWorkOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const BASE_URL = `${process.env.REACT_APP_BACKENDURL}` || "http://localhost:5000";
  
  // Form state
  const [formData, setFormData] = useState({
    workOrderName: '',
    goods: []
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Current goods being edited
  const [currentGoods, setCurrentGoods] = useState({
    goodsName: '',
    hsnSac: '',
    kg: 0,
    sqft: 0,
    rate: 0,
    amount: 0
  });
  const [editingGoodsIndex, setEditingGoodsIndex] = useState(null);

  // Fetch work orders
  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/api/workorders/project/${projectId}`);
      if (response.data.success) {
        setWorkOrders(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch work orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchWorkOrders();
    }
  }, [projectId]);

  // Auto-calculate amount for current goods
  useEffect(() => {
    const amount = (currentGoods.kg || 0) * (currentGoods.rate || 0);
    setCurrentGoods(prev => ({
      ...prev,
      amount: amount
    }));
  }, [currentGoods.kg, currentGoods.rate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle goods input changes
  const handleGoodsChange = (e) => {
    const { name, value, type } = e.target;
    setCurrentGoods(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Add goods to list
  const addGoodsToList = () => {
    if (!currentGoods.goodsName.trim()) {
      alert('Please enter goods name');
      return;
    }

    if (editingGoodsIndex !== null) {
      // Update existing goods
      const updatedGoods = [...formData.goods];
      updatedGoods[editingGoodsIndex] = { ...currentGoods };
      setFormData(prev => ({ ...prev, goods: updatedGoods }));
      setEditingGoodsIndex(null);
    } else {
      // Add new goods
      setFormData(prev => ({
        ...prev,
        goods: [...prev.goods, { ...currentGoods }]
      }));
    }

    // Reset current goods
    setCurrentGoods({
      goodsName: '',
      hsnSac: '',
      kg: 0,
      sqft: 0,
      rate: 0,
      amount: 0
    });
  };

  // Edit goods
  const editGoods = (index) => {
    setCurrentGoods({ ...formData.goods[index] });
    setEditingGoodsIndex(index);
  };

  // Remove goods
  const removeGoods = (index) => {
    if (window.confirm('Remove this goods item?')) {
      const updatedGoods = formData.goods.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, goods: updatedGoods }));
      if (editingGoodsIndex === index) {
        setEditingGoodsIndex(null);
        setCurrentGoods({
          goodsName: '',
          hsnSac: '',
          kg: 0,
          sqft: 0,
          rate: 0,
          amount: 0
        });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.workOrderName.trim()) {
      errors.workOrderName = 'Work order name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate goods for completion
  const validateGoods = () => {
    if (formData.goods.length === 0) {
      alert('Please add at least one goods item');
      return false;
    }
    return true;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      workOrderName: '',
      goods: []
    });
    setFormErrors({});
    setSelectedWorkOrder(null);
    setIsCompleting(false);
    setCurrentGoods({
      goodsName: '',
      hsnSac: '',
      kg: 0,
      sqft: 0,
      rate: 0,
      amount: 0
    });
    setEditingGoodsIndex(null);
  };

  // Open modal for create
  const openCreateModal = () => {
    resetForm();
    setIsCompleting(false);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const openEditModal = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsCompleting(false);
    setFormData({
      workOrderName: workOrder.workOrderName || '',
      goods: workOrder.goods || []
    });
    setCurrentGoods({
      goodsName: '',
      hsnSac: '',
      kg: 0,
      sqft: 0,
      rate: 0,
      amount: 0
    });
    setEditingGoodsIndex(null);
    setIsModalOpen(true);
  };

  // Open modal for completing
  const openCompleteModal = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsCompleting(true);
    setFormData({
      workOrderName: workOrder.workOrderName || '',
      goods: workOrder.goods || []
    });
    setCurrentGoods({
      goodsName: '',
      hsnSac: '',
      kg: 0,
      sqft: 0,
      rate: 0,
      amount: 0
    });
    setEditingGoodsIndex(null);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Create work order
  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/api/workorders`, {
        workOrderName: formData.workOrderName,
        projectId,
        projectName
      });
      
      if (response.data.success) {
        setSuccessMessage('Work order created successfully!');
        await fetchWorkOrders();
        closeModal();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to create work order: ' + err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Update work order
  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Only update name and goods
      const response = await axios.put(`${BASE_URL}/api/workorders/${selectedWorkOrder._id}`, {
        workOrderName: formData.workOrderName
      });
      
      if (response.data.success) {
        // Update goods individually
        const workOrder = response.data.data;
        
        // Add new goods
        for (const goods of formData.goods) {
          if (!goods._id) {
            await axios.post(`${BASE_URL}/api/workorders/${selectedWorkOrder._id}/goods`, goods);
          }
        }
        
        setSuccessMessage('Work order updated successfully!');
        await fetchWorkOrders();
        closeModal();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to update work order: ' + err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Complete work order
  const handleComplete = async () => {
    if (!validateGoods()) return;

    try {
      setLoading(true);
      
      // Update goods
      const workOrder = await axios.get(`${BASE_URL}/api/workorders/${selectedWorkOrder._id}`);
      
      // Remove existing goods
      for (const goods of workOrder.data.data.goods) {
        await axios.delete(`${BASE_URL}/api/workorders/${selectedWorkOrder._id}/goods/${goods._id}`);
      }
      
      // Add new goods
      for (const goods of formData.goods) {
        await axios.post(`${BASE_URL}/api/workorders/${selectedWorkOrder._id}/goods`, goods);
      }
      
      // Mark as complete
      const completeResponse = await axios.patch(`${BASE_URL}/api/workorders/${selectedWorkOrder._id}/complete`);
      
      if (completeResponse.data.success) {
        setSuccessMessage('Work order completed successfully!');
        await fetchWorkOrders();
        closeModal();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to complete work order: ' + err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Delete work order
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work order?')) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(`${BASE_URL}/api/workorders/${id}`);
      
      if (response.data.success) {
        setSuccessMessage('Work order deleted successfully!');
        await fetchWorkOrders();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to delete work order: ' + err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle print invoice - Store data in localStorage and open new window
  const handlePrintInvoice = (workOrder) => {
    // Get today's date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // Calculate GST (9% CGST + 9% SGST)
    const taxableAmount = workOrder.totalAmount || 0;
    const cgst = taxableAmount * 0.09;
    const sgst = taxableAmount * 0.09;
    const totalTax = cgst + sgst;
    const grandTotal = taxableAmount + totalTax;

    const printData = {
      companyName: "SREE DAKSHA INDUSTRIES",
      companyAddress: "NO.475/3, THONDAMUTHUR ROAD, BHARATHIYAR UNIVERSITY POST, VADAVALLI, COIMBATORE - 641046",
      gstin: "33AEEJPA2097N1ZD",
      state: "Tamil Nadu",
      stateCode: "33",
      email: "sreedakshaindustries@gmail.com",
      
      consignee: {
        name: projectName || "Sree Daksha Infrastructure",
        address: "1st Floor, No.01, Gandhi Layout, Maruthamalai Road, Vadavalli, Coimbatore.",
        gstin: "33AEMFS5189J1ZE",
        state: "Tamil Nadu",
        stateCode: "33"
      },
      
      buyer: {
        name: projectName || "Sree Daksha Infrastructure",
        address: "1st Floor, No.01, Gandhi Layout, Maruthamalai Road, Vadavalli, Coimbatore.",
        gstin: "33AEMFS5189J1ZE",
        state: "Tamil Nadu",
        stateCode: "33"
      },
      
      invoiceNo: `FAB-INV-${String(workOrder.invoiceNo).padStart(3, '0')}`,
      deliveryNote: `FAB-INV-${String(workOrder.invoiceNo).padStart(3, '0')}`,
      supplierRef: `FAB-INV-${String(workOrder.invoiceNo).padStart(3, '0')}`,
      buyerOrderNo: `FAB-INV-${String(workOrder.invoiceNo).padStart(3, '0')}`,
      dated: formattedDate,
      deliveryNoteDate: formattedDate,
      destination: "Callia, Onapalayam",
      motorVehicleNo: "TN 38 CD 8509",
      termsOfDelivery: "M/s - 2 - office",
      
      goods: workOrder.goods.map((item, index) => ({
        slNo: index + 1,
        description: item.goodsName,
        hsnSac: item.hsnSac || '73083000',
        quantity: `${item.kg} Kgs`,
        rate: item.rate,
        per: "Kgs",
        amount: item.amount
      })),
      
      totalKg: workOrder.totalKg || 0,
      taxableAmount: taxableAmount,
      cgst: cgst,
      sgst: sgst,
      totalTax: totalTax,
      grandTotal: grandTotal,
      roundedOff: Math.round(grandTotal) - grandTotal,
      totalPayable: Math.round(grandTotal),
      
      amountInWords: numberToWords(Math.round(grandTotal)),
      taxInWords: numberToWords(Math.round(totalTax)),
      
      hsnSummary: [{
        hsnSac: workOrder.goods[0]?.hsnSac || '73083000',
        taxableValue: taxableAmount,
        cgstRate: '9%',
        cgstAmount: cgst,
        sgstRate: '9%',
        sgstAmount: sgst,
        totalTax: totalTax
      }]
    };

    // Store data in localStorage
    localStorage.setItem('invoiceData', JSON.stringify(printData));
    
    // Open print page in new window
    const printWindow = window.open('/print-invoice', '_blank', 'width=1100,height=900,scrollbars=yes');
    if (printWindow) {
      printWindow.focus();
    } else {
      // If popup is blocked, navigate to the page
      window.location.href = '/print-invoice';
    }
  };

  // Number to words converter
  const numberToWords = (num) => {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const numToWords = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    };
    
    return 'INR ' + numToWords(num) + ' Only';
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedWorkOrder) {
      if (isCompleting) {
        handleComplete();
      } else {
        handleUpdate();
      }
    } else {
      handleCreate();
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format number with padding
  const formatNumber = (num, padding = 3) => {
    return String(num).padStart(padding, '0');
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalKg = formData.goods.reduce((sum, item) => sum + (item.kg || 0), 0);
    const totalSqft = formData.goods.reduce((sum, item) => sum + (item.sqft || 0), 0);
    const totalAmount = formData.goods.reduce((sum, item) => sum + (item.amount || 0), 0);
    return { totalKg, totalSqft, totalAmount };
  };

  const totals = calculateTotals();

  // Determine modal title
  const getModalTitle = () => {
    if (isCompleting) return 'Complete Work Order';
    if (selectedWorkOrder) return 'Edit Work Order';
    return 'Add New Work Order';
  };

  // Determine if we should show goods section
  const showGoodsSection = () => {
    return selectedWorkOrder !== null || isCompleting;
  };

  return (
    <div className="work-order-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Work Orders</h1>
          <p className="project-info">Project: {projectName}</p>
        </div>
        <button 
          className="btn btn-primary add-btn"
          onClick={openCreateModal}
          disabled={loading}
        >
          <span className="icon">+</span> Add Work Order
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{workOrders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">
            {workOrders.filter(wo => wo.isCompleted).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">
            {workOrders.filter(wo => !wo.isCompleted).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Amount</div>
          <div className="stat-value">
            ₹{workOrders.reduce((sum, wo) => sum + (wo.totalAmount || 0), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* List View */}
      <div className="list-container">
        {loading && !workOrders.length ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading work orders...</p>
          </div>
        ) : workOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Work Orders Found</h3>
            <p>Click the "Add Work Order" button to create your first work order.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="work-order-table">
              <thead>
                <tr>
                  <th>WO #</th>
                  <th>Invoice #</th>
                  <th>Name</th>
                  <th>Total KG</th>
                  <th>Total SQFT</th>
                  <th>Total Amount</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((wo) => (
                  <tr key={wo._id} className={wo.isCompleted ? '' : ''}>
                    <td className="wo-number">
                      WO-{formatNumber(wo.workOrderNo)}
                    </td>
                    <td className="invoice-number">
                      INV-{formatNumber(wo.invoiceNo)}
                    </td>
                    <td className="wo-name">{wo.workOrderName}</td>
                    <td>{wo.totalKg || 0} kg</td>
                    <td>{wo.totalSqft || 0}</td>
                    <td className="amount">₹{(wo.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      <span className="item-count">
                        {wo.goods ? wo.goods.length : 0}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${wo.isCompleted ? 'completed' : 'pending'}`}>
                        {wo.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td>{formatDate(wo.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        {!wo.isCompleted ? (
                          <>
                            <button 
                              className="btn-action complete"
                              onClick={() => openCompleteModal(wo)}
                              title="Complete with goods"
                              disabled={loading}
                            >
                              ✓
                            </button>
                            <button 
                              className="btn-action edit"
                              onClick={() => openEditModal(wo)}
                              title="Edit"
                              disabled={loading}
                            >
                              ✎
                            </button>
                          </>
                        ) : (
                          <button 
                            className="btn-action print"
                            onClick={() => handlePrintInvoice(wo)}
                            title="Print Invoice"
                            disabled={loading}
                          >
                            Print
                          </button>
                        )}
                        <button 
                          className="btn-action delete"
                          onClick={() => handleDelete(wo._id)}
                          title="Delete"
                          disabled={loading}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className={`modal-content ${isCompleting ? 'complete-modal' : selectedWorkOrder ? 'edit-modal' : 'create-modal'}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{getModalTitle()}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Project Info */}
                <div className="form-group">
                  <label>Project</label>
                  <input 
                    type="text"
                    value={projectName}
                    disabled
                    className="form-control"
                  />
                </div>

                {/* Work Order Name */}
                <div className="form-group">
                  <label>Work Order Name <span className="required">*</span></label>
                  <input 
                    type="text"
                    name="workOrderName"
                    value={formData.workOrderName}
                    onChange={handleInputChange}
                    placeholder="Enter work order name"
                    className={`form-control ${formErrors.workOrderName ? 'is-invalid' : ''}`}
                    disabled={loading || isCompleting}
                  />
                  {formErrors.workOrderName && (
                    <div className="invalid-feedback">{formErrors.workOrderName}</div>
                  )}
                </div>

                {/* Goods Section */}
                {showGoodsSection() && (
                  <>
                    <hr className="section-divider" />
                    <div className="section-title">
                      {isCompleting ? 'Add Goods Items' : 'Goods Items'}
                      {isCompleting && <span className="required"> *</span>}
                    </div>

                    {/* Goods List */}
                    {formData.goods.length > 0 && (
                      <div className="goods-list">
                        {formData.goods.map((goods, index) => (
                          <div key={index} className="goods-item">
                            <div className="goods-info">
                              <div className="goods-name">{goods.goodsName}</div>
                              <div className="goods-details">
                                <span>HSN: {goods.hsnSac || 'N/A'}</span>
                                <span>KG: {goods.kg}</span>
                                <span>SQFT: {goods.sqft}</span>
                                <span>Rate: ₹{goods.rate}</span>
                                <span className="goods-amount">₹{goods.amount.toFixed(2)}</span>
                              </div>
                            </div>
                            {!isCompleting && !selectedWorkOrder?.isCompleted && (
                              <div className="goods-actions">
                                <button 
                                  type="button"
                                  className="btn-action edit"
                                  onClick={() => editGoods(index)}
                                >
                                  ✎
                                </button>
                                <button 
                                  type="button"
                                  className="btn-action delete"
                                  onClick={() => removeGoods(index)}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Goods Form */}
                    {!selectedWorkOrder?.isCompleted && (
                      <div className="add-goods-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Goods Name <span className="required">*</span></label>
                            <input 
                              type="text"
                              name="goodsName"
                              value={currentGoods.goodsName}
                              onChange={handleGoodsChange}
                              placeholder="e.g., Window Grill"
                              className="form-control"
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label>HSN/SAC</label>
                            <input 
                              type="text"
                              name="hsnSac"
                              value={currentGoods.hsnSac}
                              onChange={handleGoodsChange}
                              placeholder="e.g., 73089090"
                              className="form-control"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>KG <span className="required">*</span></label>
                            <input 
                              type="number"
                              name="kg"
                              value={currentGoods.kg}
                              onChange={handleGoodsChange}
                              min="0"
                              step="0.01"
                              className="form-control"
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label>SQFT</label>
                            <input 
                              type="number"
                              name="sqft"
                              value={currentGoods.sqft}
                              onChange={handleGoodsChange}
                              min="0"
                              step="0.01"
                              className="form-control"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Rate (₹) <span className="required">*</span></label>
                            <input 
                              type="number"
                              name="rate"
                              value={currentGoods.rate}
                              onChange={handleGoodsChange}
                              min="0"
                              step="0.01"
                              className="form-control"
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label>Amount (₹)</label>
                            <input 
                              type="number"
                              value={currentGoods.amount.toFixed(2)}
                              disabled
                              className="form-control amount-display"
                            />
                          </div>
                        </div>

                        <button 
                          type="button"
                          className="btn btn-add-goods"
                          onClick={addGoodsToList}
                          disabled={loading}
                        >
                          {editingGoodsIndex !== null ? 'Update Goods' : '+ Add Goods'}
                        </button>
                      </div>
                    )}

                    {/* Totals */}
                    {formData.goods.length > 0 && (
                      <div className="totals-section">
                        <div className="total-item">
                          <span>Total KG:</span>
                          <strong>{totals.totalKg.toFixed(2)} kg</strong>
                        </div>
                        <div className="total-item">
                          <span>Total SQFT:</span>
                          <strong>{totals.totalSqft.toFixed(2)}</strong>
                        </div>
                        <div className="total-item total-amount">
                          <span>Total Amount:</span>
                          <strong>₹{totals.totalAmount.toFixed(2)}</strong>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn ${isCompleting ? 'btn-success' : 'btn-primary'}`}
                  disabled={loading || (isCompleting && formData.goods.length === 0)}
                >
                  {loading ? (
                    <span className="btn-loader"></span>
                  ) : (
                    isCompleting ? 'Complete Work Order' : (selectedWorkOrder ? 'Update' : 'Create')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderPage;