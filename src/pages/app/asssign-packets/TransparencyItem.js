import React, { useEffect, useState, useRef, useContext } from "react";
import SimpleBar from "simplebar-react";
import classNames from "classnames";
import MessageProfileSidebar from "./MessageProfile";
import { Modal, ModalBody, DropdownMenu, DropdownToggle, UncontrolledDropdown, DropdownItem, FormGroup } from "reactstrap";
import { Button, Col, Icon, TooltipComponent, UserAvatar } from "../../../components/Component";
import Dropzone from "react-dropzone";
import TransparencyAllocationPage from "../../pre-built/trans-list/TransparencyAllocationPage";
import "../../../components/button/Confirmation.css"
import DataContext from "../../../utils/DataContext"

const TransparencyItem = ({ id, onClosed, toggleState, subjectCode, transparencyData, mobileView, getTransparencyList, setMobileView, data, facultyData,  selectedCode}) => {

  const {userData} = useContext(DataContext)
  const [itemData, setItemData] = useState([]);
  const [sidebar, setSideBar] = useState(false);
  const [item, setItem] = useState({});
  const [assignModal, setAssignModal] = useState(false);
  const [keyassignModal, setkeyAssignModal] = useState(false);
  const [textInput, setTextInput] = useState("");
  const messagesEndRef = useRef(null);
  const [refreshData, setRefreshData] = useState(false) 
  const [transdata, setTransData] = useState([])


  useEffect(()=> {
    if(transparencyData){
      setItemData(transparencyData)
    }
  },[transparencyData])


  const resizeFunc = () => {
    if (window.innerWidth > 1540) {
      setSideBar(true);
    } else {
      setSideBar(false);
    }
  };

  useEffect(() => {
    resizeFunc();
    window.addEventListener("resize", resizeFunc);
    return () => {
      window.removeEventListener("resize", resizeFunc);
    };
  }, []);

  useEffect(() => {
    const checkId = (id) => {
      itemData.forEach((items) => {
        if (items.transparencyId === id) {
          setTimeout(setItem(items), 1000);
          setTransData(items)
        }
      });
    };
    checkId(id);
  }, [id, item, itemData, transparencyData]);
  
 

  const chatBodyClass = classNames({
    "nk-msg-body": true,
    "bg-white": true,
    "show-message": mobileView,
    "profile-shown": sidebar,
  });
  

  return (
    <React.Fragment>
    {!selectedCode.length>0 && (
    <div style={{display:"flex", justifyContent:"center", marginTop:"15%", margin:"25% auto auto auto"}} >
                  <div className="text-center">
                    <h6>Click Transparency to View</h6>
                  </div>
              </div>
    )}

      {Object.keys(item).length > 0 && (
        <div className={chatBodyClass}>
        
          <div className="nk-msg-head">
            <h4 className="title d-none d-lg-block">{item.subjectName}</h4>
            <h6 style={{color:"grey", fontSize:"16px", fontWeight:"bold"}} className="">{item.subjectCode}, <span style={{fontSize:"15px"}}>{item.examMonth}</span> {item.examYear}</h6>
          </div>
       
          {/*nk-msg-head*/}
          <SimpleBar className="nk-msg-reply nk-reply" scrollableNodeProps={{ ref: messagesEndRef }}>
            <div className="nk-msg-head py-4 d-lg-none">
              <h4 className="title">{id}</h4>
              <ul className="nk-msg-tags">
                <li>
                  <span className="label-tag">
                    <Icon name="flag-fill"></Icon> <span>17/10/2023</span>
                  </span>
                </li>
              </ul>
            </div>
            
         
              <TransparencyAllocationPage subjectCode={subjectCode} toggleState={toggleState} getTransparencyList={getTransparencyList} transData={transdata} refreshData={refreshData} setRefreshData={setRefreshData} selectedCode={selectedCode}  id={id}/>
          </SimpleBar>
              

          {/* {sidebar && (
            <div className={window.innerWidth < 1550 ? "nk-msg-profile-overlay" : ""} onClick={() => toggleSidebar()} />
          )} */}
        </div>
      )}

      {/*Assign Members Modal*/}
    
    </React.Fragment>
  );
};

export default TransparencyItem ;
