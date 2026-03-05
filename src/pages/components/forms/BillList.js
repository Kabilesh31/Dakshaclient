import React, { useState, useEffect, useContext, useRef } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  DropdownItem,
  Form,
} from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Row,
  Col,
  UserAvatar,
  PaginationComponent,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  Button,
  RSelect,
  TooltipComponent,
} from "../../../components/Component";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { ToastContainer, toast } from "react-toastify";
import { useForm } from "react-hook-form";
import DataContext from "../../../utils/DataContext"
import { addProduct} from '../../../store/billingSlice';
import { useDispatch, useSelector } from "react-redux";
import { successToast } from "../../../utils/toaster";
const BillList = ({selectedProduct, isSelected, phone}) => {
  
  const dispatch = useDispatch(); 
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [data, setData] = useState([])
  const [actionText, setActionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [billData, setBillData] = useState([])

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggle = () => setonSearch(!onSearch);
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  
  const handleAddProduct = () => {
    dispatch(addProduct(selectedProduct));
    successToast("Product Added to Billing")
  };

  useEffect(()=> {
    if(billData.length === 0){
      getInvoiceDataByPhone()
    }
  },[phone])


  const getInvoiceDataByPhone = async()=> {
    try{
      const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/bill/getAllBillByPhone/"+phone, 
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
      )
      const resData = await response.json()
      if(response.ok){
        setBillData(resData)
       
      }
      else{
        console.log("error")
      }
     }catch(err){
      console.log(err)
     }
   }

   const filteredInvoice = billData.filter((item, index, self) => 
    index === self.findIndex((t) => t.invoiceNo === item.invoiceNo)
  )

  const filteredData = filteredInvoice && filteredInvoice.filter((item) => item.isPaid === true)
  
  const calculateTotalAmountByInvoice = (invoiceNo) => {
    // Filter all items with the same invoice number
    const invoiceItems = billData.filter((item) => item.invoiceNo === invoiceNo);
  
    // Calculate total by multiplying values and quantities across all matching entries
    return invoiceItems.reduce((total, item) => {
      if (Array.isArray(item.value) && Array.isArray(item.quantity) && item.value.length === item.quantity.length) {
        const sum = item.value.reduce((acc, val, index) => acc + val * item.quantity[index], 0);
        return total + sum; // Accumulate total across multiple matching invoices
      }
      return total;
    }, 0);
  };

  return (
    <React.Fragment>    
    <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
            </BlockHeadContent>
            <BlockHeadContent>
          
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <DataTable className="card-stretch">
           
              <div className="card-title-group">
                <div className="card-tools">
                  <div className="form-inline flex-nowrap gx-3">
                  </div>
                </div>
                <div className="card-tools mr-n1">
                
                </div>
              </div>
              <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button
                      className="search-back btn-icon toggle-search active"
                      onClick={() => {
                        setSearchText("");
                        toggle();
                      }}
                    >
                      <Icon name="arrow-left"></Icon>
                    </Button>
                    <input
                      type="text"
                      className="border-transparent form-focus-none form-control"
                      placeholder="Search by Role"
                      value={onSearchText}
                      onChange={(e) => onFilterChange(e)}
                    />
                    <Button className="search-submit btn-icon">
                      <Icon name="search"></Icon>
                    </Button>
                  </div>
                </div>
              </div>
          
            <div >
            <DataTableBody compact>
              <DataTableHead>
                
                <DataTableRow>
                  <span className="sub-text">S.No</span>
                </DataTableRow>
                
                <DataTableRow size="sm">
                  <span style={{fontWeight:"bold"}} className="sub-text">Invoice No</span>
                </DataTableRow>
                

                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Date</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Total Amount</span>
                </DataTableRow>
                {/* <DataTableRow>
                  <span className="sub-text">Actions</span>
                </DataTableRow> */}
              </DataTableHead>

              {/*Head*/}
              
                      
              {isSelected && (
                filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <DataTableItem key={item._id}>
                    
                      <DataTableRow size="md">
                        <span>{index + 1}</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span>{item.invoiceNo || "N/A"}</span>
                      </DataTableRow>
                      <DataTableRow size="lg">
                        <span>{`${item?.fromDate} to ${item?.toDate}` || "N/A"}</span>
                      </DataTableRow>

                      <DataTableRow size="lg">
                      <span>{calculateTotalAmountByInvoice(item?.invoiceNo)}</span>
                      </DataTableRow>

                    </DataTableItem>
                  ))
                ) : (
                  <div className="text-center">
                    <span className="text-silent">No data found</span>
                  </div>
                )
              )}
                                 
            </DataTableBody>
            </div>
           
          </DataTable>
          </Block>

    </React.Fragment>
  );
};
export default BillList;
