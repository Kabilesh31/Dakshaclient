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
import DetailsList from "../../components/forms/DetailsList";
import BillList from "../../components/forms/BillList";

const CustomerDetails = ({ match }) => {
  const [sideBar, setSidebar] = useState(false);
  const [user, setUser] = useState();
  const [noteData, setNoteData] = useState(notes);
  const [addNoteModal, setAddNoteModal] = useState(false);
  const [addNoteText, setAddNoteText] = useState("");
  const history = useHistory();
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [modal, setModal] = useState(false);

  const tabtoggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    if (data?.length === 0) {
      fetchStaffData();
    }
  }, [data]);

  // fetch users list
  const fetchStaffData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/customer", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });
      setData(response.data);
    } catch (err) {
      console.log(err);
    }
  };

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
              style={{ position: "absolute", top: "60px", right: "60px", zIndex: "20" }}
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
                                width: "250px",
                                borderRadius: "50%",
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
                          <span className="profile-ud-label">Type</span>
                          <span className={`  `}>{/* {user.type.charAt(0).toUpperCase() + user.type.slice(1)} */}</span>
                        </div>

                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Status</span>
                          <span className={`  tb-status text-${user.status === true ? "success" : "danger"}`}>
                            {user.status === true ? "Active" : "Deactive"}
                          </span>
                        </div>

                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Created Date</span>
                          <span className="">
                            {user.doj && !isNaN(new Date(user.doj).getTime())
                              ? new Date(user.doj).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                })
                              : "Not Available"}
                          </span>
                        </div>

                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Contact 1</span>
                          <span className={`  `}>{user.phone || "Not Available"}</span>
                        </div>

                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Contact 2</span>
                          <span>{user.phone2 || "Not Available"}</span>
                        </div>
                      </PreviewCard>
                    </Col>

                    <Col lg="9">
                      <div className="mt-4">
                        <BlockTitle tag="h3" page>
                          <strong className="text-primary small">{user.name}</strong>
                        </BlockTitle>
                        <h5 style={{ color: "#798BFF", fontSize: "1rem" }}>
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

                      <div style={{ marginTop: "20px" }}>
                        <ul className="nav nav-tabs nav-tabs-mb-icon nav-tabs-card">
                          <li className="nav-item">
                            <a
                              className={`nav-link ${activeTab === "1" && "active"}`}
                              href="#personal"
                              onClick={(ev) => {
                                ev.preventDefault();
                                tabtoggle("1");
                              }}
                            >
                              <Icon name="user-circle"></Icon>
                              <span>Company Information</span>
                            </a>
                          </li>

                          {/* <li className="nav-item">
                      <a
                         className={`nav-link ${activeTab === "2" &&  "active"}`}
                        href="#transactions"
                        onClick={(ev) => {
                          ev.preventDefault();
                          tabtoggle("2")
                        }}
                      >
                        <Icon name="file"></Icon>
                        <span>Details</span>
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
                        <span>Bills</span>
                      </a>
                    </li> */}
                        </ul>
                      </div>

                      {activeTab === "1" && (
                        <div className="p-4">
                          <Block>
                            <BlockHead>
                              <BlockTitle className="mt-1" tag="h5">
                                Company Information
                              </BlockTitle>
                            </BlockHead>
                            <div className="profile-ud-list mt-2">
                              <div className="profile-ud-item">
                                <div className="profile-ud wider">
                                  <span className="profile-ud-label">Compnay Name</span>
                                  <span className="profile-ud-value">{user.name || "Not Available"}</span>
                                </div>
                              </div>

                              <div className="profile-ud-item"></div>

                              <div className="profile-ud-item">
                                <div className="profile-ud wider">
                                  <span className="profile-ud-label">Mobile</span>
                                  <span className="profile-ud-value">{user.phone || "Not Available"}</span>
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
                                  <span className="profile-ud-label">Pincode</span>
                                  <span className="profile-ud-value">{user.pincode || "Not Available"}</span>
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
                                  <span className="profile-ud-label">Address</span>
                                  <span className="profile-ud-value">
                                    {user.address + ", " + user.district || "Not Available"}
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
                                  <span className="profile-ud-label">State</span>
                                  <span className="profile-ud-value">{user.state || "Not Available"}</span>
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
                              <div className="profile-ud-item"></div>
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
                        </div>
                      )}

                      {activeTab === "2" && (
                        <div className="p-4">
                          <Block>
                            <DetailsList id={user._id} isSelected={true} />
                          </Block>
                        </div>
                      )}

                      {activeTab === "3" && (
                        <div className="p-4">
                          <Block>
                            <BillList isSelected={true} phone={user.phone} />
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
export default CustomerDetails;
