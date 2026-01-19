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
const RoleList = ({selectedProduct, isSelected}) => {
  
  const dispatch = useDispatch(); 
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [data, setData] = useState([])
  const [actionText, setActionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  


  const [assignedUsers, setAssignedUsers] = useState([])



  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggle = () => setonSearch(!onSearch);
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };


  const handleAddProduct = () => {
    dispatch(addProduct(selectedProduct));
    successToast("Product Added to Billing")
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
                  <span className="sub-text"></span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Product Name</span>
                  
                </DataTableRow>
                <DataTableRow size="sm">
                  <span style={{fontWeight:"bold"}} className="sub-text">Product Code</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Value</span>
                </DataTableRow>

                <DataTableRow size="lg">
                  <span  style={{fontWeight:"bold"}} className="sub-text">Stock</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text">Actions</span>
                </DataTableRow>
              </DataTableHead>

              {/*Head*/}
              
                      
              {isSelected? 

                    <DataTableItem key={selectedProduct._id}>
                      
                      <DataTableRow>
                          <div className="user-card">
                            
                            <div className="user-info">
                              <span className="tb-lead"></span>
                            </div>
                          </div>
                        
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span>{selectedProduct.productName}</span>
                      </DataTableRow>
                      {/* <DataTableRow size="sm">
                        <span  className={`tb-status text-${item.status === 1 ? "success" : item.status === 1 ? "warning" : "danger"
                            }`}>{item.status === 0 ? "Inactive": "Active"}</span>
                      </DataTableRow> */}

                      <DataTableRow size="lg">
                        <span>{selectedProduct.productCode}</span>
                      </DataTableRow>

                      <DataTableRow size="md">
                      <span>Rs. {selectedProduct.value}</span>
                      </DataTableRow>

                      <DataTableRow size="md">
                      <span>{selectedProduct.stock}</span>
                      </DataTableRow>

                      <DataTableRow size="md">
                      <span>
                        <Button onClick={handleAddProduct} color="primary"> 
                        Bill 
                        </Button>
                      </span>
                      </DataTableRow>
                    </DataTableItem>
                  
                : null}
            </DataTableBody>
            </div>
            {!isSelected  && (
            <div className="card-inner">
              
                <div className="text-center">
                  <span className="text-silent">No Product Selected</span>
                </div>
              
            </div>
          )}
          </DataTable>
          </Block>

    </React.Fragment>
  );
};
export default RoleList;
