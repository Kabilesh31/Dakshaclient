import React, { useEffect, useState } from "react";
import Icon from "../../../icon/Icon";
import UserAvatar from "../../../user/UserAvatar";
import { transactionData } from "./TransactionData";
import { CardTitle, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { DataTableBody, DataTableHead, DataTableItem, DataTableRow } from "../../../table/DataTable";
import { Link } from "react-router-dom";
import axios from "axios"
const TransactionTable = () => {
  const [data, setData] = useState(transactionData);
  const [trans, setTrans] = useState("");
  const [datas, setDatas] = useState([])

  
  const fetchTransactions = async() => {
     try{
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/customer/transaction");
      if(response.status === 200){
        setDatas(response.data.data)
      }
     }catch(err){
      console.error(err)
     }
  }

  useEffect(()=> {
    if(datas.length === 0){
      fetchTransactions();
    }
  })

  useEffect(() => {
    let filteredData;
    if (trans === "Due") {
      filteredData = transactionData.filter((item) => item.status === "Due");
    } else if (trans === "Paid") {
      filteredData = transactionData.filter((item) => item.status === "Paid");
    } else {
      filteredData = transactionData;
    }
    setData(filteredData);
  }, [trans]);

  const DropdownTrans = () => {
    return (
      <UncontrolledDropdown>
        <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon btn-trigger">
          <Icon name="more-h"></Icon>
        </DropdownToggle>
        <DropdownMenu right>
          <ul className="link-list-plain">
            <li>
              <DropdownItem
                tag="a"
                href="#view"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                View
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                tag="a"
                href="#invoice"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                Invoice
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                tag="a"
                href="#print"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                Print
              </DropdownItem>
            </li>
          </ul>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  };
  return (
    <React.Fragment>
      <div className="card-inner">
        <div className="card-title-group">
          <CardTitle>
            <h6 className="title">
              <span className="mr-2">Recent Transactions</span>{" "}
              {/* <Link to={`${process.env.PUBLIC_URL}/transaction-basic`} className="link d-none d-sm-inline">
                See History
              </Link> */}
            </h6>
          </CardTitle>
          {/* <div className="card-tools">
            <ul className="card-tools-nav">
              <li className={trans === "Paid" ? "active" : ""} onClick={() => setTrans("Paid")}>
                <a
                  href="#paid"
                  onClick={(ev) => {
                    ev.preventDefault();
                  }}
                >
                  <span>Paid</span>
                </a>
              </li>
              <li className={trans === "Due" ? "active" : ""} onClick={() => setTrans("Due")}>
                <a
                  href="#pending"
                  onClick={(ev) => {
                    ev.preventDefault();
                  }}
                >
                  <span>Pending</span>
                </a>
              </li>
              <li className={trans === "" ? "active" : ""} onClick={() => setTrans("")}>
                <a
                  href="#all"
                  onClick={(ev) => {
                    ev.preventDefault();
                  }}
                >
                  <span>All</span>
                </a>
              </li>
            </ul>
          </div> */}
        </div>
      </div>
      <DataTableBody className="border-top" bodyclass="nk-tb-orders">
        <DataTableHead>
          <DataTableRow>
            {/* <span>Order No.</span> */}
          </DataTableRow>
          <DataTableRow size="sm">
            <span>Customer Name</span>
          </DataTableRow>
          <DataTableRow size="md">
            <span>Date</span>
          </DataTableRow>
          <DataTableRow size="lg">
            <span>Phone No</span>
          </DataTableRow>
          <DataTableRow>
            <span>Type</span>
          </DataTableRow>
          <DataTableRow>
            <span className="d-none d-sm-inline">Status</span>
          </DataTableRow>
          {/* <DataTableRow>
            <span>&nbsp;</span>
          </DataTableRow> */}
        </DataTableHead>
        {datas.map((item, idx) => {
          return (
            <DataTableItem key={idx}>
              <DataTableRow>
                {/* <span className="tb-lead">
                  <a href="#order">{item.order}</a>
                </span> */}
              </DataTableRow>
              <DataTableRow size="sm">
                <div className="user-card">
                  {/* <UserAvatar size="sm" theme={item.theme} text={item.name} image={item.img}></UserAvatar> */}
                  <div className="user-name">
                    <span className="tb-lead">{item.name}</span>
                  </div>
                </div>
              </DataTableRow>
              <DataTableRow size="md">
                <span className="tb-sub">{item.billUpdateAt?.slice(0, 10).split("-").reverse().join("/")}</span>
              </DataTableRow>
              <DataTableRow size="lg">
                <span className="tb-sub text-primary">{item.phone}</span>
              </DataTableRow>
              <DataTableRow>
                <span style={{backgroundColor:"#FF7D7D", color:"white", padding:"2px", width:"70px", textAlign:"center", border:"", borderRadius:"20px" }} className="tb-sub tb-amount ">
                  {item.type?.toUpperCase()} 
                </span>
              </DataTableRow>
              <DataTableRow>
                <span
                  className={`badge badge-dot badge-dot-xs badge-${
                    item.paymentPending === false ? "success" : "danger"
                  }`}
                >
                  {item.paymentPending ? "Not Paid" : "Paid"}
                </span>
              </DataTableRow>
              {/* <DataTableRow className="nk-tb-col-action">
                <DropdownTrans />
              </DataTableRow> */}
            </DataTableItem>
          );
        })}
      </DataTableBody>
    </React.Fragment>
  );
};
export default TransactionTable;
