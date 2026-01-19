import React, { useContext, useEffect, useState } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { Card, Modal, ModalBody } from "reactstrap";
import {
  Button,
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Col,
  Row,
  OverlineTitle,
  Sidebar,
  UserAvatar,
  PreviewCard,
} from "../../../components/Component";
import { useHistory } from "react-router";
import { currentTime, findUpper, monthNames, todaysDate } from "../../../utils/Utils";
import axios from "axios";
import { notes } from "./UserData";
import FilesStaff from "./FilesStaff";
import PayRollFiles from "./PayRollFiles";
import EducationDetails from "./EducationDetails";
import FamilyDetails from "./FamilyDetails";



const StaffDetails = ({ match }) => {
  

  const [sideBar, setSidebar] = useState(false);
  const [user, setUser] = useState();
  const [noteData, setNoteData] = useState(notes);
  const [addNoteModal, setAddNoteModal] = useState(false);
  const [addNoteText, setAddNoteText] = useState("");
  const history = useHistory();
  const [data, setData] = useState([])
  const [activeTab, setActiveTab] = useState("1");
  const [modal, setModal] = useState(false)

  const tabtoggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(()=> {
    if(data?.length === 0){
      fetchStaffData()
    }
  },[data])

// fetch users list
const fetchStaffData = async() => {
  try{
    const response = await axios.get(process.env.REACT_APP_BACKENDURL+"/api/staff")
    setData(response.data)
    } catch (err){
      console.log(err)
    }}
    

    

  // grabs the id of the url and loads the corresponding data
  useEffect(() => {
    const id = match.params.id;
    if (id !== undefined || null || "") {
      let spUser = data.find((item) => item._id === id);
      setUser(spUser);
    } else {
      setUser(data[0]);
    }
  }, [match.params.id, data]);

  // function to toggle sidebar
  const toggle = () => {
    setSidebar(!sideBar);
  };

  // delete a note
  const deleteNote = (id) => {
    let defaultNote = noteData;
    defaultNote = defaultNote.filter((item) => item.id !== id);
    setNoteData(defaultNote);
  };

  const submitNote = () => {
    let submitData = {
      id: Math.random(),
      text: addNoteText,
      date: `${monthNames[todaysDate.getMonth()]} ${todaysDate.getDate()}, ${todaysDate.getFullYear()}`,
      time: `${currentTime()}`,
      company: "Softnio",
    };
    setNoteData([...noteData, submitData]);
    setAddNoteModal(false);
    setAddNoteText("");
  };


  return (
    <React.Fragment>
      <Head title="User Details - Regular"></Head>
      {user && (
        <Content>
          
           
              <BlockHeadContent>
                <Button
                  style={{position:"absolute", top:"60px", right:"60px", zIndex:"20"}}
                  color="light"
                  outline
                  className="bg-white d-none d-sm-inline-flex"
                  onClick={() => history.goBack()}
                >
                  <Icon name="arrow-left"></Icon>
                  <span>Back</span>
                </Button>
                <a
                  href="#back"
                  onClick={(ev) => {
                    ev.preventDefault();
                    history.goBack();
                  }}
                  className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                >
                  <Icon name="arrow-left"></Icon>
                </a>
              </BlockHeadContent>
        

          <Block>
            <Card className="">
              <div className="card-aside-wrap" id="user-detail-block">
                <div className="card-content">

                <Row className="g-gs">
                  <Col lg="3">
                  <PreviewCard>
                  <div className="p-2">
                    {user.file ? (
                      <img
                        style={{
                          height: "250px",
                          width: "250px", // Ensure consistent dimensions
                          borderRadius: "50%", // Circular image
                          objectFit: "cover",
                        }}
                        className="product-image"
                        src={user.file}
                        alt={user.name}
                      />
                    ) : (
                      <div
                        style={{
                          height: "250px",
                          width: "200px",
                          borderRadius: "50%",
                          backgroundColor: "#ddd",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "#999",
                          fontSize: "1rem",
                          fontWeight: "500",
                        }}
                      >
                        Preview Not Available
                      </div>
                    )}
                  </div> 
                          {/* <div className="profile-ud wider  mt-3">
                            <span className="profile-ud-label">Staff ID</span>
                            <span 
                            className={` profile-ud-value `}
                          >
                            {user.staffId}
                          </span>
                          </div> */}


                          <div className="profile-ud wider">
                              <span className="profile-ud-label">Employee ID</span>
                              <span 
                              className={`  `}
                            >
                              {user.employeeId}
                            </span>
                            </div>


                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Status</span>
                            <span 
                            className={`  tb-status text-${
                              user.staffStatus === "active" ? "success" : user.staffStatus === "suspend" ? "warning" : "danger"
                            }`}
                          >
                            {user.staffStatus === "active" ? "Active" : "Deactive"}
                          </span>
                          </div>

                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Blood Group</span>
                            <span 
                            // profile-ud-value
                            className={`  tb-status text-${
                              user.staffStatus !== "active" ? "success" : user.staffStatus === "suspend" ? "warning" : "danger"
                            }`}
                          >
                            {user.blood || "Not Available"}
                          </span>
                          </div>

                          <div className="profile-ud wider">
                            <span className="profile-ud-label">D.O.J</span>
                            <span   className="">{user.doj && !isNaN(new Date(user.doj).getTime())
                          ? new Date(user.doj).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            
                            })
                          : "Not Available"}</span>
                          </div>

                          
                         
                            <div className="profile-ud wider">
                              <span className="profile-ud-label">Emergency No</span>
                              <span 
                              className={`  `}
                            >
                              {user.emergencyContact || "Not Available"}
                            </span>
                            </div>

                            <div className="profile-ud wider">
                              <span className="profile-ud-label">Emergency No 2</span>
                              <span 
                              
                            >
                              {user.emergencyContact2 || "Not Available"}
                            </span>
                            </div>
                  </PreviewCard>
              </Col>

                  <Col lg="9">
                  <div className="mt-4">
                  <BlockTitle  tag="h3" page>
                      <strong className="text-primary small">{user.name}</strong>
                    </BlockTitle>
                    <h5 style={{color: "#798BFF", fontSize:"1rem"}} >
                    <span>{user.designation}</span>
                    </h5>
                  
                    {/* <BlockDes className="text-soft">
                      <ul className="list-inline">
                        <li>
                          User ID: <span className="text-base">UD003054</span>
                        </li>
                        <li>
                          Last Login: <span className="text-base">{user.lastLogin} 01:02 PM</span>
                        </li>
                      </ul>
                    </BlockDes> */}
                  </div>

                      <div style={{marginTop:"20px"}} >
              <ul className="nav nav-tabs nav-tabs-mb-icon nav-tabs-card">
                    <li className="nav-item">
                      <a
                        className={`nav-link ${activeTab === "1" && "active"}`}
                        href="#personal"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("1")
                        }}
                      >
                        <Icon name="user-circle"></Icon>
                        <span>Personal</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                         className={`nav-link ${activeTab === "5" &&  "active"}`}
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("5")
                        }}
                      >
                        <Icon name="money"></Icon>
                        <span>Education</span>
                      </a>
                    </li>
                   
                    <li className="nav-item">
                      <a
                         className={`nav-link ${activeTab === "6" &&  "active"}`}
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("6")
                        }}
                      >
                        <Icon name="money"></Icon>
                        <span>Family</span>
                      </a>
                    </li>
                   
                    <li className="nav-item">
                      <a
                         className={`nav-link ${activeTab === "2" &&  "active"}`}
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("2")
                        }}
                      >
                        <Icon name="money"></Icon>
                        <span>Bank Details</span>
                      </a>
                    </li>
                   

                    <li className="nav-item">
                      <a
                         className={`nav-link ${activeTab === "3" &&  "active"}`}
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("3")
                        }}
                      >
                        <Icon name="file"></Icon>
                        <span>Documents</span>
                      </a>
                    </li>

                    <li className="nav-item">
                      <a
                         className={`nav-link ${activeTab === "4" &&  "active"}`}
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("4")
                        }}
                      >
                        <Icon name="file-pdf"></Icon>
                        <span>Payroll</span>
                      </a>
                    </li>

                    {/* <li className="nav-item">
                      <a
                         className={`nav-link ${activeTab === "4" &&  "active"}`}
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("4")
                        }}
                      >
                        <Icon name="calendar-fill"></Icon>
                        <span>Attendance</span>
                      </a>
                    </li>

                    <li className="nav-item">
                      <a
                         className={`nav-link ${activeTab === "5" &&  "active"}`}
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("5")
                        }}
                      >
                        <Icon name="location"></Icon>
                        <span>Location</span>
                      </a>
                    </li>


                    <li className="nav-item">
                      <a
                         className={`nav-link ${activeTab === "6" &&  "active"}`}
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("6")
                        }}
                      >
                        <Icon name="todo"></Icon>
                        <span>Activity History</span>
                      </a>
                    </li> */}

                  </ul>
                    </div>

                    {activeTab === "1" && (
                  <div  className="p-4">
                    <Block>
                      <BlockHead>
                        <BlockTitle className="mt-1" tag="h5">Personal Information</BlockTitle>
                      
                      </BlockHead>
                      <div className="profile-ud-list mt-2">
                       
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Full Name</span>
                            <span className="profile-ud-value">{user.name || "Not Available"}</span>
                          </div>
                        </div>

                        <div className="profile-ud-item">
                       
                       </div>

                       <div className="profile-ud-item">
                         <div className="profile-ud wider">
                           <span className="profile-ud-label">Mobile</span>
                           <span className="profile-ud-value">{user.phone || "Not Available"}</span>
                         </div>
                       </div>


                        <div className="profile-ud-item">
                       
                        </div>

                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Email Address</span>
                            <span className="profile-ud-value">{user.email || "Not Available"}</span>
                          </div>
                        </div>

                        
                        <div className="profile-ud-item">
                          {/* <div className="profile-ud wider">
                            <span className="profile-ud-label">Surname</span>
                            <span className="profile-ud-value">{user.name.split(" ")[1]}</span>
                          </div> */}
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Aadhar No</span>
                            <span className="profile-ud-value">{user.aadhar || "Not Available" }</span>
                          </div>
                        </div>
                        <div className="profile-ud-item">
                          {/* <div className="profile-ud wider">
                            <span className="profile-ud-label">Email Address</span>
                            <span className="profile-ud-value">{user.email}</span>
                          </div> */}
                        </div>

                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Date of Birth</span>
                            <span className="profile-ud-value">
                            {user.dob && !isNaN(new Date(user.dob).getTime())
                              ? new Date(user.dob).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Not Available"}
                          </span>
                          </div>
                        </div>
                      
                        <div className="profile-ud-item">
                          {/* <div className="profile-ud wider">
                            <span className="profile-ud-label">Surname</span>
                            <span className="profile-ud-value">{user.name.split(" ")[1]}</span>
                          </div> */}
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Address</span>
                            <span className="profile-ud-value">{user.address || "Not Available" }</span>
                          </div>
                        </div>
                      
                      </div>
                    </Block>

                    <Block>
                      {/* <BlockHead className="nk-block-head-line">
                        <BlockTitle tag="h6" className="overline-title text-base">
                          Additional Information
                        </BlockTitle>
                      </BlockHead> */}
                      <div className="profile-ud-list">
                        <div className="profile-ud-item">
                         
                        </div>
                        <div className="profile-ud-item">
                          {/* <div className="profile-ud wider">
                            <span className="profile-ud-label">Reg Method</span>
                            <span className="profile-ud-value">Email</span>
                          </div> */}
                        </div>
                       
                        <div className="profile-ud-item">
                          {/* <div className="profile-ud wider">
                            <span className="profile-ud-label">Nationality</span>
                            <span className="profile-ud-value">{user.country}</span>
                          </div> */}
                        </div>
                      </div>
                    </Block>   
                  </div>) 
                    }
                    
                    {activeTab === "5" && <EducationDetails user={user}/>}

                    {activeTab === "6" && <FamilyDetails user={user}/>}
                    
                    {activeTab === "2" && (
                  <div  className="p-4">
                    <Block>

                    
                      <BlockHead>
                        <BlockTitle className="mt-1" tag="h5">Bank Details</BlockTitle>
                      
                      </BlockHead>
                      <div className="profile-ud-list mt-2">
                       
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Bank Name</span>
                            <span className="profile-ud-value">{user.bankName || "Not Available"}</span>
                          </div>
                        </div>

                        <div className="profile-ud-item">
                       
                        </div>

                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Branch</span>
                            <span className="profile-ud-value">{user.branch || "Not Available"}</span>
                          </div>
                        </div>

                        
                        <div className="profile-ud-item">
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Account No</span>
                            <span className="profile-ud-value">{user.accountNo || "Not Available"}</span>
                          </div>
                        </div>

                        <div className="profile-ud-item">
                        </div>

                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">IFSC Code</span>
                            <span className="profile-ud-value">{user.ifsc || "Not Available"}</span>
                          </div>
                        </div>
                      
                        <div className="profile-ud-item">
                         
                        </div>
                        <div className="profile-ud-item">
                          <div className="profile-ud wider">
                            <span className="profile-ud-label">Account Type</span>
                            <span className="profile-ud-value">Savings</span>
                          </div>
                        </div>
                      
                      </div>
                    </Block>
                  </div>
                    )}

                    {activeTab === "3" && (
                  <div  className="p-4">
                    <Block>
                     
                      <FilesStaff/>
                    </Block>
                  </div>
                    )}


                  {activeTab === "4" && (
                  <div  className="p-4">
                    <Block>
                     
                      <PayRollFiles/>
                    </Block>
                  </div>
                    )}
                </Col>
              </Row>
                </div>
               
              </div>
            </Card>
          </Block>
        </Content>
      )}
    </React.Fragment>
  );
};
export default StaffDetails;
