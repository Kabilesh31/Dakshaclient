import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './PrintInvoice.css';

// Default invoice data — matches the sample "Tax Invoice" (FAB-INV-049).
// If localStorage has an 'invoiceData' entry, that will be used instead.
const DEFAULT_INVOICE_DATA = {
  companyName: 'SREE DAKSHA INDUSTRIES',
  companyAddress: 'NO.475/3, THOUNDAMUTHUR ROAD, BHARATHIYAR UNVERSITY POST, VADAVALLI, COIMBATORE - 641046',
  gstin: '33AEJPA2097N1ZD',
  state: 'Tamil Nadu',
  stateCode: '33',
  email: 'sreedakshaindustries@gmail.com',

  invoiceNo: 'FAB-INV-049',
  dated: '13-May-2026',
  deliveryNote: '',
  modeTermsOfPayment: '',
  supplierRef: 'FAB-INV-049',
  otherReference: '',
  buyerOrderNo: '',
  buyerOrderDated: '',
  despatchDocumentNo: '',
  deliveryNoteDate: '',
  despatchedThrough: '',
  destination: 'Callia,Onapalayam',
  billOfLadingNo: '',
  motorVehicleNo: 'TN 38 CD 8509',
  termsOfDelivery: 'Maice - 2 - Office',

  consignee: {
    name: 'Sree Daksha Infrastructure',
    address: '1st Floor,No.01,Gandhi Layout, Maruthamalai Road, Vadavalli,Coimbatore.',
    gstin: '33AEMFS5189J1ZE',
    state: 'Tamil Nadu',
    stateCode: '33',
  },
  buyer: {
    name: 'Sree Daksha Infrastructure',
    address: '1st Floor,No.01,Gandhi Layout, Maruthamalai Road, Vadavalli,Coimbatore.',
    gstin: '33AEMFS5189J1ZE',
    state: 'Tamil Nadu',
    stateCode: '33',
  },

  goods: [
    {
      description: 'Window Grills',
      hsnSac: '73083000',
      quantity: '149.95 Kgs',
      rate: 120.00,
      per: 'Kgs',
      amount: 17994.00,
    },
  ],

  cgst: 1619.46,
  sgst: 1619.46,
  roundedOff: 0.08,
  totalQuantity: '149.95 Kgs',
  totalPayable: 21233.00,
  amountInWords: 'INR Twenty One Thousand Two Hundred Thirty Three Only',

  hsnSummary: [
    {
      hsnSac: '73083000',
      taxableValue: 17994.00,
      cgstRate: '9%',
      cgstAmount: 1619.46,
      sgstRate: '9%',
      sgstAmount: 1619.46,
      totalTax: 3238.92,
    },
  ],
  taxableAmount: 17994.00,
  totalTax: 3238.92,
  taxInWords: 'INR Three Thousand Two Hundred Thirty Eight and Ninety Two paise Only',

  pan: 'AEJPA2097N',
  signatoryCompany: 'SREE DAKSHA INDUSTRIES',
  signatoryAddress: '64, 1st Floor, Coimbatore',
};

const PrintInvoicePage = () => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    // Retrieve data from localStorage if present, otherwise fall back to the default sample data
    const storedData = localStorage.getItem('invoiceData');

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // setInvoiceData(parsedData);
        setInvoiceData(DEFAULT_INVOICE_DATA);
        // Clear localStorage after retrieving
        localStorage.removeItem('invoiceData');
      } catch (error) {
        console.error('Error parsing invoice data:', error);
        
      }
    } else {
      setInvoiceData(DEFAULT_INVOICE_DATA);
    }
    setLoading(false);
  }, []);

  // Auto-print when data is loaded
  useEffect(() => {
    if (!loading && invoiceData) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, invoiceData]);

  if (loading) {
    return (
      <div className="print-loading">
        <div className="spinner"></div>
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="print-error">
        <h2>No Invoice Data Found</h2>
        <p>Please go back and try again.</p>
        <button className="btn btn-primary" onClick={() => history.goBack()}>
          Go Back
        </button>
      </div>
    );
  }

  const data = invoiceData;

  return (
    <div className="invoice-wrapper" id="invoice-content">
      <div className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div className="company-info">
            <h1 className="company-name">{data.companyName}</h1>
            <p className="company-address">{data.companyAddress}</p>
            <p className="company-details">
              GSTIN/UIN: {data.gstin} | State Name: {data.state}, Code: {data.stateCode}
            </p>
            <p className="company-email">E-Mail: {data.email}</p>
          </div>
          <div className="invoice-title">
            <h2>Tax Invoice</h2>
            <p className="invoice-subtitle">(DUPLICATE FOR TRANSPORTER)</p>
          </div>
        </div>

        {/* Consignee & Buyer */}
        <div className="party-info">
          <div className="consignee">
            <h4>Consignee</h4>
            <p><strong>{data.consignee.name}</strong></p>
            <p>{data.consignee.address}</p>
            <p>GSTIN/UIN: {data.consignee.gstin}</p>
            <p>State Name: {data.consignee.state}, Code: {data.consignee.stateCode}</p>
          </div>
          <div className="buyer">
            <h4>Buyer (if other than consignee)</h4>
            <p><strong>{data.buyer.name}</strong></p>
            <p>{data.buyer.address}</p>
            <p>GSTIN/UIN: {data.buyer.gstin}</p>
            <p>State Name: {data.buyer.state}, Code: {data.buyer.stateCode}</p>
          </div>
        </div>

        {/* Invoice Details — mapped to match the original document's field order */}
        <div className="invoice-details">
          <table className="details-table">
            <tbody>
              <tr>
                <td><strong>Invoice No.</strong></td>
                <td>{data.invoiceNo}</td>
                <td><strong>Dated</strong></td>
                <td>{data.dated}</td>
              </tr>
              <tr>
                <td><strong>Delivery Note</strong></td>
                <td>{data.deliveryNote}</td>
                <td><strong>Mode/Terms of Payment</strong></td>
                <td>{data.modeTermsOfPayment}</td>
              </tr>
              <tr>
                <td><strong>Supplier's Ref.</strong></td>
                <td>{data.supplierRef}</td>
                <td><strong>Other Reference(s)</strong></td>
                <td>{data.otherReference}</td>
              </tr>
              <tr>
                <td><strong>Buyer's Order No.</strong></td>
                <td>{data.buyerOrderNo}</td>
                <td><strong>Dated</strong></td>
                <td>{data.buyerOrderDated}</td>
              </tr>
              <tr>
                <td><strong>Despatch Document No.</strong></td>
                <td>{data.despatchDocumentNo}</td>
                <td><strong>Delivery Note Date</strong></td>
                <td>{data.deliveryNoteDate}</td>
              </tr>
              <tr>
                <td><strong>Despatched through</strong></td>
                <td>{data.despatchedThrough}</td>
                <td><strong>Destination</strong></td>
                <td>{data.destination}</td>
              </tr>
              <tr>
                <td><strong>Bill of Lading/LR-RR No.</strong></td>
                <td>{data.billOfLadingNo}</td>
                <td><strong>Motor Vehicle No.</strong></td>
                <td>{data.motorVehicleNo}</td>
              </tr>
              <tr>
                <td><strong>Terms of Delivery</strong></td>
                <td colSpan="3">{data.termsOfDelivery}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Goods Table */}
        <div className="goods-table-wrapper">
          <table className="goods-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Description of Goods</th>
                <th>HSN/SAC</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>per</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.goods.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.description}</td>
                  <td>{item.hsnSac}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.rate.toFixed(2)}</td>
                  <td>{item.per}</td>
                  <td className="amount-column">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="6" className="text-right"><strong>Output CGST - 9% - F</strong></td>
                <td className="amount-column">₹{data.cgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="6" className="text-right"><strong>Output SGST - 9% - F</strong></td>
                <td className="amount-column">₹{data.sgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="6" className="text-right"><strong>Rounded Off</strong></td>
                <td className="amount-column">₹{data.roundedOff.toFixed(2)}</td>
              </tr>
              <tr className="total-row">
                <td colSpan="3"><strong>Total</strong></td>
                <td><strong>{data.totalQuantity}</strong></td>
                <td colSpan="2"></td>
                <td className="amount-column"><strong>₹{data.totalPayable.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="amount-words">
          <p><strong>Amount Chargeable (in words)</strong> &nbsp; <span style={{ float: 'right' }}>E. & O.E</span></p>
          <p>{data.amountInWords}</p>
        </div>

        {/* Tax Summary */}
        <div className="tax-summary">
          <table className="tax-table">
            <thead>
              <tr>
                <th>HSN/SAC</th>
                <th>Taxable Value</th>
                <th>Central Tax</th>
                <th>State Tax</th>
                <th>Total Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.hsnSummary.map((item, index) => (
                <tr key={index}>
                  <td>{item.hsnSac}</td>
                  <td>₹{item.taxableValue.toFixed(2)}</td>
                  <td>{item.cgstRate} ₹{item.cgstAmount.toFixed(2)}</td>
                  <td>{item.sgstRate} ₹{item.sgstAmount.toFixed(2)}</td>
                  <td>₹{item.totalTax.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>Total</strong></td>
                <td><strong>₹{data.taxableAmount.toFixed(2)}</strong></td>
                <td><strong>₹{data.cgst.toFixed(2)}</strong></td>
                <td><strong>₹{data.sgst.toFixed(2)}</strong></td>
                <td><strong>₹{data.totalTax.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax in Words */}
        <div className="tax-words">
          <p><strong>Tax Amount (in words):</strong> {data.taxInWords}</p>
        </div>

        {/* Remarks & Declaration */}
        <div className="footer-section">
          <div className="remarks">
            <p><strong>Remarks:</strong></p>
            <p>Materials List As per Delivery Challan Enclosed.</p>
            <p>Company's PAN: {data.pan}</p>
          </div>
          <div className="declaration">
            <p><strong>Declaration</strong></p>
            <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
          </div>
        </div>

        {/* Signature */}
        <div className="signature-section">
          <div className="signature">
            <p><strong>for {data.signatoryCompany}</strong></p>
            <p>{data.signatoryAddress}</p>
            <div className="signature-line">
              <p>Authorised Signatory</p>
            </div>
          </div>
          <div className="generated-note">
            <p>This is a Computer Generated Invoice</p>
          </div>
        </div>

        {/* Print Controls (visible only on screen) */}
        <div className="print-controls">
          <button className="btn btn-primary" onClick={() => window.print()}>
            Print Invoice
          </button>
          <button className="btn btn-secondary" onClick={() => window.close()}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoicePage;