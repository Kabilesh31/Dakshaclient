import React, { useEffect, useState } from "react";
import Head from "../../../layout/head/Head";
import TransparencyItem from "./TransparencyItem";
import Simplebar from "simplebar-react";
import {
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Icon,
  PaginationComponent,
  UserAvatar,
} from "../../../components/Component";
import { messageData } from "./MessageData";
import PaginationNext from "../../../components/pagination/PaginationNext";
import ContentCard from "../../../layout/content/ContentCard";
import { Modal, ModalBody, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import Dropzone from "react-dropzone";
import * as XLSX from "xlsx";

import { toast } from "react-toastify";
import { useContext } from "react";
import DataContext from "../../../utils/DataContext";
import Grouping from "./Grouping";
import Content from "../../../layout/content/Content";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";
import axios from "axios";
const Transparency = () => {
  const { userData } = useContext(DataContext);
  const [customerData, setCustomerData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [filterCustomerType, setFilterCustomerType] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [auOverview, setAuOverview] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("");
  localStorage.setItem("isGridView", false);
  useEffect(() => {
    if (customerData.length === 0) {
      getTransparencyList();
    }
  }, [customerData]);

  useEffect(() => {
    if (staffData.length === 0) {
      fetchStaffData();
    }
  }, [staffData]);

  console.log(staffData);

  const fetchStaffData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/staff");
      setStaffData(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getTransparencyList = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/customer");
      const resData = await response.json();
      if (response.ok) {
        setCustomerData(resData.data);
        setFilterCustomerType(resData.data); // Set default to show all customers
      } else {
        console.log("Error fetching customer data");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleStaffSelection = (staff) => {
    if (staff === null) {
      setSelectedStaff("All");
      setSelectedStaffId(null);
    } else {
      setSelectedStaff(staff.name);
      setSelectedStaffId(staff._id);
    }

    const filteredByStaff = staff === null ? customerData : customerData.filter((item) => item.staff === staff._id);

    setFilterCustomerType(filteredByStaff);
  };

  const handleTypeSelection = (type) => {
    setSelectedType(type);

    let filteredData = customerData;

    if (selectedStaffId) {
      filteredData = filteredData.filter((item) => item.staff === selectedStaffId);
    }

    if (type !== "All") {
      filteredData = filteredData.filter((item) => item.type.toLowerCase() === type.toLowerCase());
    }

    setFilterCustomerType(filteredData);
  };

  const handlePaymentSelection = (payment) => {
    setSelectedPayment(payment);

    let filteredData = customerData;

    // filter by staff if selected
    if (selectedStaffId) {
      filteredData = filteredData.filter((item) => item.staff === selectedStaffId);
    }

    if (payment === "Not Paid") {
      filteredData = filteredData.filter((item) => item.paymentPending === true);
    } else if (payment === "Paid") {
      filteredData = filteredData.filter((item) => item.paymentPending !== true); // everything else is Paid
    }
    // if "All", no extra filtering

    setFilterCustomerType(filteredData);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <React.Fragment>
      <Head title="App Messages" />

      <Content>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <BlockTitle page tag="h3">
            Reports
          </BlockTitle>

          <div style={{ display: "flex", gap: "1rem" }}>
            <UncontrolledDropdown>
              <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                <Icon className="d-none d-sm-inline" name="user" />
                <span>
                  <span className="d-none d-md-inline">{selectedStaff || "Select Staff"}</span>
                </span>
                <Icon className="dd-indc" name="chevron-right" />
              </DropdownToggle>
              <DropdownMenu>
                <ul className="link-list-opt no-bdr">
                  <li>
                    <DropdownItem
                      tag="a"
                      onClick={(ev) => {
                        ev.preventDefault();
                        handleStaffSelection(null); // For "All", pass null or a special value
                      }}
                      href="#dropdownitem"
                    >
                      <span>All</span>
                    </DropdownItem>
                  </li>
                  {staffData.map((staff) => (
                    <li key={staff._id}>
                      <DropdownItem
                        tag="a"
                        onClick={(ev) => {
                          ev.preventDefault();
                          handleStaffSelection(staff);
                        }}
                        href="#dropdownitem"
                      >
                        <span>{staff.name}</span>
                      </DropdownItem>
                    </li>
                  ))}
                </ul>
              </DropdownMenu>
            </UncontrolledDropdown>

            <UncontrolledDropdown>
              <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                <Icon className="d-none d-sm-inline" name="calender-date" />
                <span>
                  <span className="d-none d-md-inline">{selectedType.length > 1 ? selectedType : "Select Type"}</span>
                </span>
                <Icon className="dd-indc" name="chevron-right" />
              </DropdownToggle>
              <DropdownMenu>
                <ul className="link-list-opt no-bdr">
                  <li>
                    <DropdownItem
                      tag="a"
                      onClick={(ev) => {
                        ev.preventDefault();
                        handleTypeSelection("All");
                      }}
                      href="#!"
                    >
                      <span>All</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem
                      tag="a"
                      onClick={(ev) => {
                        ev.preventDefault();
                        handleTypeSelection("Weekly");
                      }}
                      href="#dropdownitem"
                    >
                      <span>Weekly</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem
                      tag="a"
                      onClick={(ev) => {
                        ev.preventDefault();
                        handleTypeSelection("Monthly");
                      }}
                      href="#dropdownitem"
                    >
                      <span>Monthly</span>
                    </DropdownItem>
                  </li>
                </ul>
              </DropdownMenu>
            </UncontrolledDropdown>

            <UncontrolledDropdown>
              <DropdownToggle tag="a" className="dropdown-toggle btn btn-white btn-dim btn-outline-light">
                <Icon className="d-none d-sm-inline" name="money" />
                <span>
                  <span className="d-none d-md-inline">{selectedPayment.length > 1 ? selectedPayment : "Payment"}</span>
                </span>
                <Icon className="dd-indc" name="chevron-right" />
              </DropdownToggle>
              <DropdownMenu>
                <ul className="link-list-opt no-bdr">
                  <li>
                    <DropdownItem
                      tag="a"
                      onClick={(ev) => {
                        ev.preventDefault();
                        handlePaymentSelection("All");
                      }}
                      href="#!"
                    >
                      <span>All</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem
                      tag="a"
                      onClick={(ev) => {
                        ev.preventDefault();
                        handlePaymentSelection("Paid");
                      }}
                      href="#dropdownitem"
                    >
                      <span>Paid</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem
                      tag="a"
                      onClick={(ev) => {
                        ev.preventDefault();
                        handlePaymentSelection("Not Paid");
                      }}
                      href="#dropdownitem"
                    >
                      <span>Not Paid</span>
                    </DropdownItem>
                  </li>
                </ul>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </div>

        {auOverview ? <Grouping getTransparencyList={getTransparencyList} currentItems={filterCustomerType} /> : <></>}
      </Content>
    </React.Fragment>
  );
};
export default Transparency;
