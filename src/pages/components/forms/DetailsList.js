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
import axios from "axios";
const DetailsList = ({selectedProduct, isSelected, id}) => {
  
  const dispatch = useDispatch(); 
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [data, setData] = useState([])
  const [actionText, setActionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [activityData, setActivityData] = useState([])

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggle = () => setonSearch(!onSearch);
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(()=> {
    if(activityData.length === 0){
      getActivityStatus()
    }
  },[])

  const handleAddProduct = () => {
    dispatch(addProduct(selectedProduct));
    successToast("Product Added to Billing")
  };
  
  const getActivityStatus = async() => {
    try{
      const response = await axios.get(process.env.REACT_APP_BACKENDURL+"/api/activity", 
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      }
      )
      setActivityData(response.data.data)
      
    }catch(err){
      console.log(err)
    }
  }

  const filterData = activityData.filter((item)=> item.customerId === id)
  console.log(filterData)

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
                
                {/* <DataTableRow>
                  <span className="sub-text"></span>
                </DataTableRow> */}
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">S.No</span>
                  
                </DataTableRow>
                <DataTableRow size="sm">
                  <span style={{fontWeight:"bold"}} className="sub-text">Date</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span style={{fontWeight:"bold"}} className="sub-text">Status</span>
                </DataTableRow>


                <DataTableRow>
                  <span className="sub-text"></span>
                </DataTableRow>
              </DataTableHead>

              {/*Head*/}
              
                      
              {isSelected && (
                             filterData.length > 0 ? (
                               filterData.map((item, index) => (
                                 <DataTableItem key={item._id}>
                                 
                                   <DataTableRow size="md">
                                     <span>{index + 1}</span>
                                   </DataTableRow>
                                   <DataTableRow size="md">
                                    <span>
                                      {item.createdAt
                                        ? new Date(item.createdAt).toLocaleDateString("en-GB")
                                        : "N/A"}
                                    </span>
                                  </DataTableRow>
                                   <DataTableRow size="lg">
                                   <span 
                                      className={`  tb-status text-${
                                        item.activityStatus === true ? "success" :  "danger"
                                      }`}
                                    >
                                      {item.activityStatus === true ? "Active" : "Deactive"}
                                    </span>
                                   </DataTableRow>
             
                                   <DataTableRow size="lg">
                                  
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
export default DetailsList;
