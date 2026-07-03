import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/Component';
import { Spinner } from 'reactstrap';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKENDURL}/api` || "http://localhost:5000/api";

const BusinessTab = ({ projectId }) => {
  const [openBizSection, setOpenBizSection] = useState('quotation');
  const [loading, setLoading] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [dailyWages, setDailyWages] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [wagesLoading, setWagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const BRAND = "#4B5694";

  const toggleBizSection = (section) => {
    setOpenBizSection(openBizSection === section ? null : section);
  };

  const formatINR = (val) => {
    if (!val && val !== 0) return "₹0";
    return "₹" + Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const EmptyState = ({ text }) => (
    <div style={{ 
      padding: "24px", 
      background: "#fafafa", 
      borderRadius: "10px", 
      border: "1px dashed #ddd", 
      textAlign: "center", 
      color: "#aaa", 
      fontSize: "14px" 
    }}>
      {text}
    </div>
  );

  // Fetch all data
  useEffect(() => {
    if (projectId) {
      fetchAllData();
    }
  }, [projectId]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      
      console.log("Fetching business data for project:", projectId);
      
      // Fetch quotations from invoices endpoint
      try {
        const quotationResponse = await axios.get(`${API_URL}/invoices/project/${projectId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        console.log("Quotations response:", quotationResponse.data);
        if (quotationResponse.data.success) {
          setQuotations(quotationResponse.data.data || []);
          if (quotationResponse.data.data && quotationResponse.data.data.length > 0) {
            setSelectedQuotation(quotationResponse.data.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching quotations:", err);
      }

      // Fetch purchase orders
      try {
        const poResponse = await axios.get(`${API_URL}/purchase-orders/byProjectId/${projectId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        console.log("Purchase Orders response:", poResponse.data);
        if (poResponse.data.success) {
          setPurchaseOrders(poResponse.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching purchase orders:", err);
      }

      // Fetch expenses
      try {
        const expenseResponse = await axios.get(`${API_URL}/expenses/project/${projectId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        console.log("Expenses response:", expenseResponse.data);
        if (expenseResponse.data.success) {
          setExpenses(expenseResponse.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }

      // Fetch daily wages using getBySite endpoint
      await fetchDailyWagesBySite();

    } catch (error) {
      console.error("Error fetching business data:", error);
      setError("Failed to load business data. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch daily wages by site ID using the getBySite endpoint
  const fetchDailyWagesBySite = async () => {
    setWagesLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      console.log(`Fetching daily wages for site: ${projectId}`);
      
      // Use the getBySite endpoint: GET /api/attendance/site/:id
      const response = await axios.get(`${API_URL}/attendance/site/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log("Daily wages response:", response.data);
      
      if (response.data && response.data.data) {
        const records = response.data.data || [];
        
        // Process records to get employee names
        const processedRecords = await Promise.all(records.map(async (record) => {
          let employeeName = 'Unknown';
          let employeeId = '';
          
          // Try to get employee name from employeeId field
          if (record.employeeId) {
            if (typeof record.employeeId === 'object' && record.employeeId.name) {
              employeeName = record.employeeId.name;
              employeeId = record.employeeId._id || record.employeeId;
            } else if (typeof record.employeeId === 'string') {
              employeeId = record.employeeId;
              // Try to fetch employee details if only ID is available
              try {
                const employeeRes = await axios.get(`${API_URL}/employees/${record.employeeId}`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (employeeRes.data.success) {
                  employeeName = employeeRes.data.data.name || 'Unknown';
                }
              } catch (err) {
                console.error(`Failed to fetch employee ${record.employeeId}:`, err);
              }
            }
          }
          
          return {
            ...record,
            employeeName: employeeName,
            employeeIdDisplay: employeeId,
            siteName: record.siteName || record.site?.name || 'Not Assigned'
          };
        }));
        
        setDailyWages(processedRecords);
        console.log(`Processed ${processedRecords.length} daily wage records`);
      } else {
        console.log("No daily wages data found");
        setDailyWages([]);
      }
    } catch (error) {
      console.error("Error fetching daily wages:", error);
      // Don't set error here - just log it and continue with empty data
      setDailyWages([]);
    } finally {
      setWagesLoading(false);
    }
  };

  // Calculate totals - use safe fallbacks
  const quotationTotal = selectedQuotation?.price || 0;
  const quotationItems = selectedQuotation ? [{
    description: selectedQuotation.fileName || 'Quotation',
    quantity: 1,
    rate: selectedQuotation.price || 0,
    amount: selectedQuotation.price || 0
  }] : [];

  // Calculate total daily wages
  const totalDailyWages = dailyWages.reduce((sum, record) => sum + (record.totalSalary || 0), 0);
  const totalDailyWageCount = dailyWages.length;
  
  // Calculate total purchase orders
  const totalPurchaseOrders = purchaseOrders.reduce((sum, po) => {
    const poTotal = (po.items || []).reduce((s, item) => s + (item.quantity * item.unitPrice || item.amount || 0), 0);
    return sum + poTotal;
  }, 0);
  const totalPurchaseOrderCount = purchaseOrders.length;
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalExpenseCount = expenses.length;
  
  // Total all expenses (Daily Wages + Purchase Orders + Expenses)
  const totalAllExpenses = totalDailyWages + totalPurchaseOrders + totalExpenses;
  
  // Profit/Loss = Quotation - (Daily Wages + Purchase Orders + Expenses)
  const profitLoss = quotationTotal - totalAllExpenses;
  const isProfit = profitLoss >= 0;
  const expensePercentage = quotationTotal > 0 ? (totalAllExpenses / quotationTotal) * 100 : 0;
  const profitPercentage = quotationTotal > 0 ? (profitLoss / quotationTotal) * 100 : 0;

  const PLAccordion = ({ 
    title, 
    icon, 
    total, 
    count, 
    isOpen, 
    onToggle, 
    children, 
    color 
  }) => {
    return (
      <div style={{
        background: "#fff",
        border: `1px solid ${isOpen ? color + "55" : "#eee"}`,
        borderRadius: "12px",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}>
        <div
          onClick={onToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            cursor: "pointer",
            userSelect: "none",
            background: isOpen ? color + "06" : "#fff",
            transition: "background 0.18s",
          }}
        >
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: color + "15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <Icon name={icon} style={{ color: color, fontSize: "17px" }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>
              {title}
            </div>
            <div style={{
              fontSize: "12px",
              color: "#888",
              marginTop: "2px",
            }}>
              {count} {count === 1 ? 'record' : 'records'}
            </div>
          </div>

          <span style={{
            fontSize: "13px",
            fontWeight: 600,
            color: color,
            background: color + "12",
            padding: "4px 12px",
            borderRadius: "20px",
            flexShrink: 0
          }}>
            {formatINR(total)}
          </span>

          <span style={{
            color: "#aaa",
            fontSize: "18px",
            transition: "transform 0.25s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0
          }}>
            ▾
          </span>
        </div>

        <div style={{
          maxHeight: isOpen ? "600px" : "0",
          overflow: "hidden",
          transition: "maxHeight 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <div style={{ padding: "0 16px 16px" }}>
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <Spinner style={{ color: BRAND, width: "40px", height: "40px" }} />
        <p style={{ marginLeft: "12px", color: "#888" }}>Loading business data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#dc3545" }}>
        <Icon name="alert-circle" style={{ fontSize: "48px", marginBottom: "16px" }} />
        <p>{error}</p>
        <button 
          onClick={() => fetchAllData()}
          style={{
            padding: "8px 20px",
            background: BRAND,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "12px"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <h6 style={{ 
        fontWeight: 700, 
        margin: "0 0 20px 0", 
        color: "#1a1a2e", 
        fontSize: "15px" 
      }}>
        Business Overview
      </h6>

      {/* Quotation Selector */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px", 
        marginBottom: "20px",
        flexWrap: "wrap",
        padding: "12px 16px",
        background: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #eee"
      }}>
        <span style={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>Select Quotation:</span>
        {quotations.length > 0 ? (
          <select
            value={selectedQuotation?._id || ""}
            onChange={(e) => {
              const selected = quotations.find(q => q._id === e.target.value);
              setSelectedQuotation(selected);
            }}
            style={{
              padding: "6px 12px",
              fontSize: "13px",
              border: "1.5px solid #e8e4e0",
              borderRadius: "8px",
              minWidth: "250px",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            {quotations.map((q) => (
              <option key={q._id} value={q._id}>
                {q.fileName || q._id} - {formatINR(q.price)}
              </option>
            ))}
          </select>
        ) : (
          <span style={{ color: "#888", fontSize: "13px" }}>No quotations found for this project</span>
        )}
      </div>
      
      {/* Summary Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "16px", 
        marginBottom: "24px" 
      }}>
        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "12px", border: "1px solid #e9ecef" }}>
          <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Quotation Value
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: BRAND, marginTop: "6px" }}>
            {formatINR(quotationTotal)}
          </div>
          {selectedQuotation && (
            <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
              {selectedQuotation.fileName}
            </div>
          )}
        </div>
        
        <div style={{ background: "#fff3e0", padding: "20px", borderRadius: "12px", border: "1px solid #ffe0b2" }}>
          <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Total Expenses
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#e65100", marginTop: "6px" }}>
            {formatINR(totalAllExpenses)}
          </div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
            {expensePercentage.toFixed(1)}% of quotation
          </div>
        </div>

        <div style={{ 
          background: isProfit ? "#e8f5e9" : "#ffebee", 
          padding: "20px", 
          borderRadius: "12px", 
          border: `1px solid ${isProfit ? "#c8e6c9" : "#ffcdd2"}` 
        }}>
          <div style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {isProfit ? "Net Profit" : "Net Loss"}
          </div>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: 700, 
            color: isProfit ? "#2e7d32" : "#c62828", 
            marginTop: "6px" 
          }}>
            {formatINR(Math.abs(profitLoss))}
          </div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
            {isProfit ? "✅ Profitable" : "⚠️ Review expenses"}
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        
        {/* Quotation Section */}
        <PLAccordion 
          title="Quotation Details"
          icon="file-text"
          total={quotationTotal}
          count={quotations.length}
          isOpen={openBizSection === 'quotation'}
          onToggle={() => toggleBizSection('quotation')}
          color={BRAND}
        >
          {selectedQuotation ? (
            <div style={{ padding: "12px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#555" }}>File Name</span>
                <span style={{ fontWeight: 600, color: BRAND }}>{selectedQuotation.fileName || "N/A"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#555" }}>Price</span>
                <span style={{ fontWeight: 600, color: BRAND }}>{formatINR(selectedQuotation.price)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#555" }}>Uploaded Date</span>
                <span style={{ fontWeight: 600 }}>
                  {selectedQuotation.uploadedAt ? new Date(selectedQuotation.uploadedAt).toLocaleDateString("en-IN") : "N/A"}
                </span>
              </div>
              
              {quotationItems.length > 0 && (
                <>
                  <div style={{ marginTop: "12px", padding: "8px 0", borderTop: "1px solid #f0f0f0" }}>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#555", marginBottom: "8px" }}>Items</div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                          <th style={{ padding: "6px 8px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa" }}>Description</th>
                          <th style={{ padding: "6px 8px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa" }}>Qty</th>
                          <th style={{ padding: "6px 8px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa" }}>Rate</th>
                          <th style={{ padding: "6px 8px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotationItems.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: idx < quotationItems.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                            <td style={{ padding: "6px 8px", color: "#555" }}>{item.description || item.name}</td>
                            <td style={{ padding: "6px 8px", textAlign: "right", color: "#555" }}>{item.quantity || 1}</td>
                            <td style={{ padding: "6px 8px", textAlign: "right", color: "#555" }}>{formatINR(item.rate || 0)}</td>
                            <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600, color: BRAND }}>
                              {formatINR(item.amount || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <div style={{ 
                marginTop: "12px", 
                padding: "12px 14px", 
                background: BRAND + "10", 
                borderRadius: "8px", 
                border: `1px solid ${BRAND}22`,
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span style={{ fontSize: "13px", color: BRAND, fontWeight: 600 }}>Total Quotation Value</span>
                <span style={{ fontSize: "17px", fontWeight: 700, color: BRAND }}>{formatINR(quotationTotal)}</span>
              </div>
            </div>
          ) : (
            <EmptyState text="No quotation selected or available." />
          )}
        </PLAccordion>

        {/* Daily Wages Section */}
        <PLAccordion 
          title="Daily Wages"
          icon="users"
          total={totalDailyWages}
          count={totalDailyWageCount}
          isOpen={openBizSection === 'wages'}
          onToggle={() => toggleBizSection('wages')}
          color="#e65100"
        >
          {wagesLoading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <Spinner style={{ color: BRAND }} />
            </div>
          ) : dailyWages.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Date</th>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Employee</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Daily Salary</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Overtime</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Total</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyWages.map((record, idx) => {
                    let employeeName = record.employeeName || 'Unknown';
                    let employeeId = record.employeeIdDisplay || record.employeeId || 'N/A';
                    
                    const empIdStr = typeof employeeId === 'string' ? employeeId : employeeId?.toString() || 'N/A';
                    
                    return (
                      <tr key={record._id || idx} style={{ borderBottom: idx < dailyWages.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        <td style={{ padding: "10px 10px", color: "#555" }}>
                          {record.date ? new Date(record.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "N/A"}
                        </td>
                        <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>
                          {employeeName}
                          <div style={{ fontSize: "11px", color: "#888" }}>
                            ID: {empIdStr.substring(0, 8) || "N/A"}
                          </div>
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                          {formatINR(record.dailySalary || 0)}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "right", color: "#e65100" }}>
                          {record.overtimeHours || 0}h
                          {record.overtimeAmount > 0 && (
                            <div style={{ fontSize: "11px", color: "#888" }}>
                              {formatINR(record.overtimeAmount)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#e65100" }}>
                          {formatINR(record.totalSalary || 0)}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "center" }}>
                          <span style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 10px",
                            borderRadius: "20px",
                            background: record.status === "present" ? "#eaf3de" : record.status === "late" ? "#faeeda" : "#fcebeb",
                            color: record.status === "present" ? "#3b6d11" : record.status === "late" ? "#854f0b" : "#a32d2d",
                          }}>
                            {capitalizeFirst(record.status || "Pending")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No wage records found." />
          )}
          <div style={{ 
            marginTop: "12px", 
            padding: "12px 14px", 
            background: "#e6510010", 
            borderRadius: "8px", 
            border: "1px solid #e6510022",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "13px", color: "#e65100", fontWeight: 600 }}>Total Daily Wages</span>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#e65100" }}>{formatINR(totalDailyWages)}</span>
          </div>
        </PLAccordion>

        {/* Purchase Orders Section */}
        <PLAccordion 
          title="Purchase Orders"
          icon="shopping-cart"
          total={totalPurchaseOrders}
          count={totalPurchaseOrderCount}
          isOpen={openBizSection === 'purchase-orders'}
          onToggle={() => toggleBizSection('purchase-orders')}
          color="#dc3545"
        >
          {purchaseOrders.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>PO #</th>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Vendor</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Items</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Amount</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po, idx) => {
                    const poTotal = (po.items || []).reduce((s, item) => s + (item.quantity * item.unitPrice || item.amount || 0), 0);
                    return (
                      <tr key={po._id || idx} style={{ borderBottom: idx < purchaseOrders.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>{po.poNumber || po._id}</td>
                        <td style={{ padding: "10px 10px", color: "#555" }}>{po.vendor || po.supplierName || "N/A"}</td>
                        <td style={{ padding: "10px 10px", textAlign: "right", color: "#555" }}>
                          {po.items?.length || 0}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#dc3545" }}>
                          {formatINR(poTotal)}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "center" }}>
                          <span style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 10px",
                            borderRadius: "20px",
                            background: po.status === "approved" ? "#eaf3de" : po.status === "pending" ? "#faeeda" : "#fcebeb",
                            color: po.status === "approved" ? "#3b6d11" : po.status === "pending" ? "#854f0b" : "#a32d2d",
                          }}>
                            {po.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No purchase orders found." />
          )}
          <div style={{ 
            marginTop: "12px", 
            padding: "12px 14px", 
            background: "#dc354510", 
            borderRadius: "8px", 
            border: "1px solid #dc354522",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "13px", color: "#dc3545", fontWeight: 600 }}>Total Purchase Orders</span>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#dc3545" }}>{formatINR(totalPurchaseOrders)}</span>
          </div>
        </PLAccordion>

        {/* Expenses Section */}
        <PLAccordion 
          title="Other Expenses"
          icon="credit-card"
          total={totalExpenses}
          count={totalExpenseCount}
          isOpen={openBizSection === 'expenses'}
          onToggle={() => toggleBizSection('expenses')}
          color="#f59e0b"
        >
          {expenses.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Date</th>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Description</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, idx) => (
                    <tr key={expense._id || idx} style={{ borderBottom: idx < expenses.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                      <td style={{ padding: "10px 10px", color: "#555" }}>
                        {expense.date ? new Date(expense.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                      </td>
                      <td style={{ padding: "10px 10px", fontWeight: 500, color: "#1a1a2e" }}>
                        {expense.description || "N/A"}
                        {expense.notes && (
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                            {expense.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "#f59e0b" }}>
                        {formatINR(expense.amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No other expenses recorded." />
          )}
          <div style={{ 
            marginTop: "12px", 
            padding: "12px 14px", 
            background: "#f59e0b10", 
            borderRadius: "8px", 
            border: "1px solid #f59e0b22",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 600 }}>Total Other Expenses</span>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#f59e0b" }}>{formatINR(totalExpenses)}</span>
          </div>
        </PLAccordion>

        {/* Summary Section */}
        <PLAccordion 
          title="Expense Summary"
          icon="calculator"
          total={totalAllExpenses}
          count={4}
          isOpen={openBizSection === 'summary'}
          onToggle={() => toggleBizSection('summary')}
          color="#6c757d"
        >
          <div style={{ padding: "12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ color: "#555" }}>Quotation Value</span>
              <span style={{ fontWeight: 600, color: BRAND }}>{formatINR(quotationTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ color: "#555" }}>Total Expenses</span>
              <span style={{ fontWeight: 600, color: "#e65100" }}>{formatINR(totalAllExpenses)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ color: "#555" }}>Expense Breakdown:</span>
              <span style={{ fontSize: "12px", color: "#888" }}></span>
            </div>
            <div style={{ paddingLeft: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "12px" }}>
                <span style={{ color: "#888" }}>• Daily Wages</span>
                <span style={{ fontWeight: 500 }}>{formatINR(totalDailyWages)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "12px" }}>
                <span style={{ color: "#888" }}>• Purchase Orders</span>
                <span style={{ fontWeight: 500 }}>{formatINR(totalPurchaseOrders)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "12px" }}>
                <span style={{ color: "#888" }}>• Other Expenses</span>
                <span style={{ fontWeight: 500 }}>{formatINR(totalExpenses)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "12px", borderTop: "1px dashed #f0f0f0", marginTop: "4px", paddingTop: "4px" }}>
                <span style={{ fontWeight: 600, color: "#555" }}>Total All Expenses</span>
                <span style={{ fontWeight: 700, color: "#e65100" }}>{formatINR(totalAllExpenses)}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: "8px", borderTop: "2px solid #f0f0f0" }}>
              <span style={{ fontWeight: 600, color: isProfit ? "#2e7d32" : "#c62828" }}>
                {isProfit ? "Net Profit" : "Net Loss"}
              </span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: isProfit ? "#2e7d32" : "#c62828" }}>
                {formatINR(Math.abs(profitLoss))}
              </span>
            </div>
          </div>
        </PLAccordion>
      </div>

      {/* Overall Summary */}
      <div style={{ 
        marginTop: "24px",
        background: isProfit ? BRAND : "#dc3545",
        borderRadius: "12px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#fff" }}>
          <Icon name={isProfit ? "trending-up" : "trending-down"} style={{ fontSize: "24px" }} />
          <div>
            <div style={{ fontSize: "14px", opacity: 0.9, fontWeight: 600 }}>
              Overall {isProfit ? "Profit" : "Loss"}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              {isProfit 
                ? `${profitPercentage.toFixed(1)}% profit margin` 
                : `${Math.abs(profitPercentage).toFixed(1)}% loss`}
            </div>
          </div>
        </div>
        <div style={{ 
          fontSize: "28px", 
          fontWeight: 700, 
          color: "#fff",
          background: "rgba(255,255,255,0.15)",
          padding: "4px 20px",
          borderRadius: "8px"
        }}>
          {formatINR(Math.abs(profitLoss))}
        </div>
      </div>
    </>
  );
};

export default BusinessTab;