import React, { useState, useEffect } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import LogoDark from "../../../images/logo-dark2x.png";
import { Button, Icon, Block, PreviewCard } from "../../../components/Component";
import { invoiceData } from "./Invoice";


const BillInvoice = ({ match }) => {
  const [data] = useState(invoiceData);
  const [user, setUser] = useState();

  const orderNo = localStorage.getItem('orderNo')
  
  useEffect(() => {
    setTimeout(() => window.print(), 500);
  }, []);

const now = new Date();
const options = { day: 'numeric', month: 'short', year: 'numeric' };
const currentDate = now.toLocaleDateString('en-GB', options);
const storedData = JSON.parse(localStorage.getItem('submittedData'));
const selectedProducts = JSON.parse(localStorage.getItem('selectedProducts'))

  useEffect(() => {
    const id = match.params.id;
    if (id !== undefined || null || "") {
      let spUser = data.find((item) => item.id === Number(id));
      setUser(spUser);
    } else {
      setUser(data[0]);
    }
  }, [match.params.id, data]);


  const styles = {
    container: {
      padding: '0px',
      maxWidth: '700px',
      margin: '0 auto',
      marginTop:"5px"
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textDecoration:"underline"
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
    <body className="bg-white">
      <Head title="Invoice Print"></Head>
      {user && (
        <Content>
          <Block>
            <div className="invoice invoice-print">
              <div className="invoice-action">
                <Button
                  size="lg"
                  color="primary"
                  outline
                  className="btn-icon btn-white btn-dim"
                  onClick={() => window.print()}
                >
                  <Icon name="printer-fill"></Icon>
                </Button>
              </div>
              <div className="invoice-wrap">
                <div className="invoice-brand text-center">
                  {/* <img src={LogoDark} alt="" /> */}
                  {/* <h4 style={{ color: "black", fontSize:"30px",marginTop:"5px",fontFamily: "'Ubuntu', sans-serif" }}>CALIX</h4> */}
                </div>

                <div className="invoice-head">

                <div className="invoice-desc ">
                <h3 className="title">Retail Pulse</h3>
                <ul className="list-plain">
                      <li className="invoice-id">
                        <span>GST Number</span>:<span>54548470sbsy</span>
                      </li>
                      <li className="invoice-id">
                      
                      <Icon name="call-fill"></Icon> <span>Phone</span> :<span>8838116412</span>
                      </li>
                      <li className="invoice-date">
                      
                      <Icon name="map-pin-fill"></Icon> <span>Address</span> :<span>458/1, Coimbatore, Tamilnadu</span>
                      </li>
                    </ul>
                   
                  </div>

                  <div className="invoice-contact">
                  <div className="invoice-desc">
                  <h3 className="title">Invoice</h3>
                    <ul className="list-plain">
                      <li className="invoice-id">
                        <span>Invoice ID</span>:<span>{orderNo}</span>
                      </li>
                      <li className="invoice-date">
                        <span>Date</span>:<span>{currentDate}</span>
                      </li>
                    </ul>
                    </div>
                    <div style={{marginTop:"50px"}} className="invoice-desc">
                    <ul className="list-plain">
                      <li className="invoice-id">
                        <span>Invoice To</span><span></span>
                      </li>
                      </ul>
                    <div style={{marginTop:"10px"}} className="invoice-contact-info">
                      <h4 className="title">{storedData.companyName?.length > 2 ? storedData.companyName : storedData.customerName}</h4>
                      <ul className="list-plain">
                        <li>
                          <Icon name="map-pin-fill"></Icon>
                          <span>
                            {storedData.address?.length < 1 ? "-" : storedData.address}
                            {/* <br />
                            Newbury, VT 05051 */}
                          </span>
                        </li>
                        <li>
                          <Icon name="call-fill"></Icon>
                          <span>{storedData.phone?.length < 1 ? "-" : storedData.phone}</span>
                          
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                </div>

                <div className="invoice-bills">
                <div className="table-responsive">
                <PreviewCard className="h-100">
              {/* <h5 style={{ textDecoration: 'underline' }} className="card-title">Billing</h5> */}
              {selectedProducts.length > 0 ? (
                <div style={{ minHeight: '400px' }}>
             
                  <div style={styles.container}>
                          <h6 style={styles.title}>Bill Details</h6>
                          <table style={styles.table}>
                            <thead>
                              <tr>
                                <th style={styles.th}>Product Name</th>
                                <th style={styles.th}>Price (excl. GST)</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>GST</th>
                                <th style={styles.th}>Total (incl. GST)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedProducts.map((product, index) => (
                                <tr key={index}>
                                  <td style={styles.td}>{product.productName}</td>
                                  <td style={styles.td}>Rs. {product.value.toFixed(2)}</td>
                                  <td style={styles.td}>
                                    {/* <Button  size="sm" onClick={() => decreaseProductQuantity(index)}>
                                      -
                                    </Button> */}
                                    {product.quantity}
                                    {/* <Button  size="sm" onClick={() => increaseProductQuantity(index)}>
                                     +
                                    </Button> */}
                                  </td>
                                  {/* <td style={styles.td}>${item.gst.toFixed(2)}</td>
                                  <td style={styles.td}>${item.total.toFixed(2)}</td> */}

                                  <td style={styles.td}>Rs {25}</td>
                                  <td style={styles.td}>Rs {(product.value * product.quantity).toFixed(2)}</td>

                                  <td style={{ ...styles.td, ...styles.action }}>
                                  {/* <Button  size="sm" onClick={() => removeProduct(index)}>
                                                  <Icon name="trash"></Icon>
                                                </Button> */}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.subtotalRow }}>
                                  Subtotal (excl. GST):
                                </td>
                                {/* <td style={{ ...styles.td, ...styles.subtotalRow }}>${subtotal.toFixed(2)}</td> */}
                                <td style={{ ...styles.td, ...styles.subtotalRow }}>45</td>
                                <td style={styles.td}></td>
                              </tr>
                              <tr>
                                <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.subtotalRow }}>
                                  Total GST:
                                </td>
                                <td style={{ ...styles.td, ...styles.subtotalRow }}>200</td>
                                {/* <td style={{ ...styles.td, ...styles.subtotalRow }}>${totalGST.toFixed(2)}</td> */}
                                <td style={styles.td}></td>
                              </tr>
                              <tr>
                                <td colSpan="4" style={{ ...styles.td, ...styles.tdRight, ...styles.grandTotalRow }}>
                                  Grand Total (incl. GST):
                                </td>
                                <td style={{ ...styles.td, ...styles.grandTotalRow }}>Rs. {storedData.totalAmount}</td>
                                <td style={styles.td}></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                  <div style={{display:"flex", justifyContent:"flex-end", alignItems:"flex-end", marginTop:"50px"}}>
                  {/* <Button color="danger" onClick={handleClearAll} style={{marginRight:"8px"}} >Clear All</Button>
                  <Button onClick={toggleAssignModal} color="primary">Bill</Button> */}
                  </div>
                </div>
              ) : (
                <p style={{ height: '400px' }}>No products added to the bill.</p>
               
              )}
             
              </PreviewCard>
              </div>
            </div>
              </div>
            </div>
          </Block>
        </Content>
      )}
    </body>
  );
};

export default BillInvoice;
