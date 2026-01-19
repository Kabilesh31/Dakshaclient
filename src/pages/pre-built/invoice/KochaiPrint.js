import React, { useState, useEffect } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { Button, Icon, Block, PreviewCard } from "../../../components/Component";
import { invoiceData } from "./Invoice";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Logo from "../../../assets/images/logo.jpeg"
import "./Invoice.css";
const KochaiPrint = ({ match }) => {
  const [data] = useState(invoiceData);
  const [user, setUser] = useState();

  
  useEffect(() => {
    setTimeout(() => window.print(), 500);
  }, []);

const selectedProducts = JSON.parse(localStorage.getItem('selectedProducts'))
const selectedCustomer = JSON.parse(localStorage.getItem('selectedCustomer'))

  useEffect(() => {
    const id = match.params.id;
    if (id !== undefined || null || "") {
      let spUser = data.find((item) => item.id === Number(id));
      setUser(spUser);
    } else {
      setUser(data[0]);
    }
  }, [match.params.id, data]);

  

  const processBillData = (data) => {
    const groupedData = {};
  
    data.forEach((item) => {
      const date = new Date(item.createdAt).toLocaleDateString('en-GB'); // Format date as DD/MM/YYYY
      const session = item.session;
  
      if (!groupedData[date]) {
        groupedData[date] = { am: null, pm: null };
      }
  
      groupedData[date][session] = item;
    });
  
    return Object.entries(groupedData).map(([date, sessions], index) => ({
      sno: index + 1,
      date,
      am: sessions.am,
      pm: sessions.pm,
    }));
  };

  const groupedData = processBillData(selectedProducts); 
  
  const formatQuantityWithPrice = (quantity, value) => {
    return quantity.map((qty, index) => `${qty} * ${value[index]}`).join(', ');
  };

  function convertNumberToWords(num) {
    if (num === 0) return 'Zero';
  
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];
  
    function convertLessThanThousand(n) {
      let str = '';
      if (n >= 100) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 11 && n <= 19) {
        str += teens[n - 11] + ' ';
      } else {
        if (n >= 20 || n === 10) {
          str += tens[Math.floor(n / 10)] + ' ';
          n %= 10;
        }
        if (n > 0 && n < 10) {
          str += units[n] + ' ';
        }
      }
      return str.trim();
    }
  
    let words = '';
    let chunkIndex = 0;
  
    while (num > 0) {
      let chunk = num % 1000;
      if (chunk > 0) {
        words = convertLessThanThousand(chunk) + (thousands[chunkIndex] ? ' ' + thousands[chunkIndex] : '') + ' ' + words;
      }
      num = Math.floor(num / 1000);
      chunkIndex++;
    }
  
    return words.trim();
  }


  const total = groupedData.reduce((acc, row) => {
    const amTotal = row.am ? row.am.value.reduce((sum, num, index) => sum + num * row.am.quantity[index], 0) : 0;
    const pmTotal = row.pm ? row.pm.value.reduce((sum, num, index) => sum + num * row.pm.quantity[index], 0) : 0;
    return acc + amTotal + pmTotal;
  }, 0);

  const totalWithGST = selectedProducts[0].gst ? total * 1.05 : total;
  return (
    <body className="bg-white">
      <Head title="Invoice Print"></Head>
      {user && (
        <Content>
          <Block>
          <div className="invoice-container">
      {/* Invoice Header */}
      <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
  {/* Logo Section */}
  <div className="invoice-logo" style={{ flex: '0 0 auto', marginRight: '20px' }}>
    <img src={Logo} alt="Logo" style={{ maxWidth: '135px', maxHeight: '150px' }} />
  </div>

  {/* Company Details Section */}
  <div className="invoice-company-details" style={{ textAlign: 'left', flex: '1' }}>
    <h2>Retail Pulse</h2>
    <p>1320a Thadagam Main Road, R.S.Puram</p>
    <p>Coimbatore, Tamilnadu</p>
    <p>GSTIN: 33ARGPD2779J2ZO</p>
    <p>📞 Mobile: 8838116412</p>
  </div>

  {/* Bill of Supply Section */}
  <div className="invoice-info" style={{ textAlign: 'right', flex: '0 0 auto' }}>
    <p><strong>Bill Of Supply:</strong> Original for Receipt</p>
    <p><strong>Invoice No:</strong> {selectedProducts[0].invoiceNo}</p>
    <p><strong>Invoice Date:</strong> {selectedProducts[0].fromDate} to {selectedProducts[0].toDate}</p>
  </div>
</div>

      
      {/* Bill To and Bank Details */}
      <div className="invoice-section" style={{ textAlign: 'left', flex: '0 0 auto' }} >
        <div className="invoice-bank-details">
          <h3>Bill To</h3>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>Name:</strong> {selectedProducts[0].customerName}</p>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>Phone:</strong> {selectedProducts[0].phone}</p>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>Area: {selectedCustomer.location}</strong> </p>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>District:</strong> {selectedCustomer.district} </p>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>State & Pincode : </strong>{selectedCustomer.state} - {selectedCustomer.pincode}</p>
          
        </div>
        <div className="invoice-bank-details" style={{ textAlign: 'right', flex: '0 0 auto' }}>
          <h3 style={{ marginBottom: '5px', lineHeight: '1.2' }}>Bank Details</h3>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>Banking Name:</strong> KO KAAPI</p>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>GPAY:</strong> 97514 63174</p>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>Acc No:</strong> 920020056100919</p>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>IFSC Code:</strong> UTIB0000563</p>
          <p style={{ margin: '2px 0', lineHeight: '2' }}><strong>Branch:</strong> R.S Puram</p>
        </div>

      </div>

      {/* Table Section */}
      <div className="invoice-table">
          <TableContainer
              component={Paper}
              style={{
              maxWidth: 1100,
              margin: '20px auto',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Table>
              <TableHead style={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell align="center"><b>Sno</b></TableCell>
                  <TableCell align="center"><b>Date</b></TableCell>
                  <TableCell align="center" colSpan={2}><b>AM</b></TableCell>
                  <TableCell align="center" colSpan={2}><b>PM</b></TableCell>
                  <TableCell align="center"><b>Amount</b></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell />
                  <TableCell />
                  <TableCell align="center"><b>Items</b></TableCell>
                  <TableCell align="center"><b>Qty</b></TableCell>
                  <TableCell align="center"><b>Items</b></TableCell>
                  <TableCell align="center"><b>Qty</b></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedData.map((row) => (
                  <TableRow key={row.sno}>
                    <TableCell align="center">{row.sno}</TableCell>
                    <TableCell align="center">{row.date}</TableCell>
                    <TableCell align="center">
                      {row.am ? row.am.productName.join(', ') : '-'}
                    </TableCell>
                    <TableCell align="center">
                    {row.am
                    ? formatQuantityWithPrice(row.am.quantity, row.am.value)
                    : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {row.pm ? row.pm.productName.join(', ') : '-'}
                    </TableCell>
                    <TableCell align="center">
                    {row.pm
                    ? formatQuantityWithPrice(row.pm.quantity, row.pm.value)
                    : '-'}
                    </TableCell>
                    <TableCell align="center">
                       {(() => {
                                    const amTotal = row.am ? row.am.value.reduce((sum, num, index) => sum + num * row.am.quantity[index], 0) : 0;
                                    const pmTotal = row.pm ? row.pm.value.reduce((sum, num, index) => sum + num * row.pm.quantity[index], 0) : 0;
                                    const subtotal = amTotal + pmTotal;
                                    
                                    if (subtotal === 0) return "-";
                                    
                                    const finalAmount = selectedProducts[0].gst ? subtotal * 1.05 : subtotal;
                                    return Math.floor(finalAmount.toFixed(2));
                                  })()}
                    </TableCell>
                  </TableRow>
                ))}
                {selectedProducts[0].gst &&
                <>
                <TableRow>
                  <TableCell colSpan={10} align="right">
                    Bill Amount : {Math.floor(total)}.00
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={12} align="right">
                    CGST 2.5% :  {(total * 0.025).toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={12} align="right">
                    SGST 2.5% : {(total * 0.025).toFixed(2)}
                  </TableCell>
                </TableRow>
                </> }
                <TableRow>
                  <TableCell colSpan={6} align="left">
                    Total Amount (in words) Rounded : {convertNumberToWords(Math.floor(totalWithGST))} Rupees Only
                  </TableCell>
                  <TableCell colSpan={6} align="center">
                    {Math.floor(totalWithGST)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          </div>
        </div>
      </Block>
    </Content>
      )}
    </body>
  );
};

export default KochaiPrint;
