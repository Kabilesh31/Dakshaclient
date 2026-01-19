import React from 'react';

const Billing = () => {
  const items = [
    { name: 'Widget A', price: 10.0, quantity: 2, gst: 2.0, total: 22.0 },
    { name: 'Gadget B', price: 25.0, quantity: 1, gst: 2.5, total: 27.5 },
    { name: 'Doohickey C', price: 5.5, quantity: 3, gst: 1.65, total: 18.15 },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalGST = items.reduce((sum, item) => sum + item.gst, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const styles = {
    container: {
      padding: '32px',
      maxWidth: '600px',
      margin: '0 auto',
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
    },
    table: {
      width: '100%',
      textAlign: 'left',
      borderCollapse: 'collapse',
    },
    th: {
      borderBottom: '1px solid #ddd',
      padding: '8px',
    },
    td: {
      padding: '8px',
      borderBottom: '1px solid #ddd',
    },
    tdRight: {
      textAlign: 'right',
    },
    action: {
      textAlign: 'center',
      color: 'red',
      cursor: 'pointer',
    },
    subtotalRow: {
      fontWeight: '600',
    },
    grandTotalRow: {
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Bill Details (including GST)</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Product Name</th>
            <th style={styles.th}>Price (excl. GST)</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>GST</th>
            <th style={styles.th}>Total (incl. GST)</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={styles.td}>{item.name}</td>
              <td style={styles.td}>${item.price.toFixed(2)}</td>
              <td style={styles.td}>{item.quantity}</td>
              <td style={styles.td}>${item.gst.toFixed(2)}</td>
              <td style={styles.td}>${item.total.toFixed(2)}</td>
              <td style={{ ...styles.td, ...styles.action }}>🗑️</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.subtotalRow }}>
              Subtotal (excl. GST):
            </td>
            <td style={{ ...styles.td, ...styles.subtotalRow }}>${subtotal.toFixed(2)}</td>
            <td style={styles.td}></td>
          </tr>
          <tr>
            <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.subtotalRow }}>
              Total GST:
            </td>
            <td style={{ ...styles.td, ...styles.subtotalRow }}>${totalGST.toFixed(2)}</td>
            <td style={styles.td}></td>
          </tr>
          <tr>
            <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.grandTotalRow }}>
              Grand Total (incl. GST):
            </td>
            <td style={{ ...styles.td, ...styles.grandTotalRow }}>${grandTotal.toFixed(2)}</td>
            <td style={styles.td}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Billing;