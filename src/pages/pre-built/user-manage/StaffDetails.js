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
import "./staff.css";

const StaffDetails = ({ match }) => {
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

  const fetchStaffData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (response.status === 200) {
        setData(response.data);
      }
    } catch (err) {
      console.log("Fetch staff data error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");
          window.location.href = "/login";
        }
      } else {
        console.log("Network error");
      }
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

  const toggle = () => {
    setSidebar(!sideBar);
  };

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

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <React.Fragment>
      <Head title="Staff Details"></Head>
      {user && (
        <Content>
          <BlockHeadContent>
            {/* <Button
              style={{ position: "absolute", top: "42px", right: "60px", zIndex: "20" }}
              color="light"
              outline
              className="bg-white d-none d-sm-inline-flex"
              onClick={() => history.goBack()}
            >
              <Icon name="arrow-left"></Icon>
              <span>Back</span>
            </Button> */}
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
            <Card className="shadow-sm border-0">
              <div className="card-aside-wrap" id="user-detail-block">
                <div className="card-content">
                  <Row className="g-gs">
                    {/* Left Column - Profile Card */}
                    <Col lg="3">
                      <div className="staff-profile-card">
                        {/* Profile Image Section */}
                        <div className="staff-profile-image-wrapper">
                          <div className="staff-profile-image-container">
                            {user.img ? (
                              <img
                                className="staff-profile-image"
                                src={user.img}
                                alt={user.name}
                              />
                            ) : (
                              <div className="staff-profile-avatar">
                                <span>{getInitials(user.name)}</span>
                              </div>
                            )}
                          </div>
                          <div className={`staff-status-badge ${user.staffStatus === "active" ? "status-active" : "status-inactive"}`}>
                            {user.staffStatus || "Not Available"}
                          </div>
                        </div>

                        {/* Staff Name & Designation */}
                        <div className="staff-name-section">
                          <h3 className="staff-name">{user.name || "Not Available"}</h3>
                          <p className="staff-designation">{user.designation || "Not Available"}</p>
                          <span className="staff-code">#{user.staffCode || "N/A"}</span>
                        </div>

                        {/* Staff Details */}
                        <div className="staff-info-grid">
                          <div className="staff-info-item">
                            <Icon name="mail" className="staff-info-icon" />
                            <div>
                              <span className="staff-info-label">Email</span>
                              <p className="staff-info-value">{user.email || "Not Available"}</p>
                            </div>
                          </div>
                          <div className="staff-info-item">
                            <Icon name="user" className="staff-info-icon" />
                            <div>
                              <span className="staff-info-label">Staff Type</span>
                              <p className="staff-info-value">{user.type || "Not Available"}</p>
                            </div>
                          </div>
                          <div className="staff-info-item">
                            <Icon name="calendar" className="staff-info-icon" />
                            <div>
                              <span className="staff-info-label">Joined On</span>
                              <p className="staff-info-value">
                                {user.createdAt
                                  ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "Not Available"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>

                    {/* Right Column - Tab Content (Single Column) */}
                    <Col lg="9">
                      <div className="staff-details-container">
                        {/* Tabs Navigation */}
                        <div className="staff-tabs-navigation">
                          <ul className="staff-tabs-list">
                            <li>
                              <a
                                className={`staff-tab-item ${activeTab === "1" ? "active" : ""}`}
                                href="#personal"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  tabtoggle("1");
                                }}
                              >
                                <Icon name="user-circle"></Icon>
                                <span>Personal</span>
                              </a>
                            </li>
                            <li>
                              <a
                                className={`staff-tab-item ${activeTab === "2" ? "active" : ""}`}
                                href="#bank"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  tabtoggle("2");
                                }}
                              >
                                <Icon name="building"></Icon>
                                <span>Bank Details</span>
                              </a>
                            </li>
                            <li>
                              <a
                                className={`staff-tab-item ${activeTab === "3" ? "active" : ""}`}
                                href="#documents"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  tabtoggle("3");
                                }}
                              >
                                <Icon name="file"></Icon>
                                <span>Documents</span>
                              </a>
                            </li>
                            <li>
                              <a
                                className={`staff-tab-item ${activeTab === "4" ? "active" : ""}`}
                                href="#payroll"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  tabtoggle("4");
                                }}
                              >
                                <Icon name="dollar-sign"></Icon>
                                <span>Payroll</span>
                              </a>
                            </li>
                            {/* <li>
                              <a
                                className={`staff-tab-item ${activeTab === "5" ? "active" : ""}`}
                                href="#education"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  tabtoggle("5");
                                }}
                              >
                                <Icon name="book"></Icon>
                                <span>Education</span>
                              </a>
                            </li> */}
                            {/* <li>
                              <a
                                className={`staff-tab-item ${activeTab === "6" ? "active" : ""}`}
                                href="#family"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  tabtoggle("6");
                                }}
                              >
                                <Icon name="users"></Icon>
                                <span>Family</span>
                              </a>
                            </li> */}
                          </ul>
                        </div>

                        {/* Tab Content - Single Column */}
                        <div className="staff-tab-content">
                          {/* Personal Information Tab */}
                          {activeTab === "1" && (
                            <div className="staff-tab-panel">
                              <h5 className="staff-tab-title">Personal Information</h5>
                              <div className="staff-details-single-column">
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Full Name</span>
                                  <span className="staff-detail-value">{user.name || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Staff Code</span>
                                  <span className="staff-detail-value">{user.staffCode || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Staff Type</span>
                                  <span className="staff-detail-value">{user.type || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Email Address</span>
                                  <span className="staff-detail-value">{user.email || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Designation</span>
                                  <span className="staff-detail-value">{user.designation || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Department</span>
                                  <span className="staff-detail-value">{user.department || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Created On</span>
                                  <span className="staff-detail-value">
                                    {user.createdAt
                                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        })
                                      : "Not Available"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Bank Details Tab */}
                          {activeTab === "2" && (
                            <div className="staff-tab-panel">
                              <h5 className="staff-tab-title">Bank Details</h5>
                              <div className="staff-details-single-column">
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Bank Name</span>
                                  <span className="staff-detail-value">{user.bankName || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Branch</span>
                                  <span className="staff-detail-value">{user.branch || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Account Number</span>
                                  <span className="staff-detail-value">{user.accountNo || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">IFSC Code</span>
                                  <span className="staff-detail-value">{user.ifsc || "Not Available"}</span>
                                </div>
                                <div className="staff-detail-row">
                                  <span className="staff-detail-label">Account Type</span>
                                  <span className="staff-detail-value">Savings</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Documents Tab */}
                          {activeTab === "3" && (
                            <div className="staff-tab-panel">
                              <h5 className="staff-tab-title">Documents</h5>
                              <FilesStaff />
                            </div>
                          )}

                          {/* Payroll Tab */}
                          {activeTab === "4" && (
                            <div className="staff-tab-panel">
                              <h5 className="staff-tab-title">Payroll Information</h5>
                              <PayRollFiles />
                            </div>
                          )}

                          {/* Education Tab */}
                          {activeTab === "5" && (
                            <div className="staff-tab-panel">
                              <h5 className="staff-tab-title">Education Details</h5>
                              <EducationDetails user={user} />
                            </div>
                          )}

                          {/* Family Tab */}
                          {activeTab === "6" && (
                            <div className="staff-tab-panel">
                              <h5 className="staff-tab-title">Family Details</h5>
                              <FamilyDetails user={user} />
                            </div>
                          )}
                        </div>
                      </div>
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