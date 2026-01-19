import React, { useEffect, useState } from "react";
import SimpleBar from "simplebar-react";
import { Row, Col, UncontrolledDropdown, DropdownToggle, DropdownMenu, Card } from "reactstrap";
import { findUpper } from "../../../utils/Utils";
import { Icon, UserAvatar, LinkList, LinkItem } from "../../../components/Component";

const MessageProfileSidebar = ({ id, sidebar, profile }) => {
  const [allocatedData, setAllocatedData] = useState([])
  const [facultyData, setFacultyData] = useState([])
// GETTING ASSIGNED FACULTY DATA BY SUBJECT_PACKET_NO
  const subject_no = profile.answer_packet_number
  const facultyId = allocatedData?.ov_faculty_id
  useEffect(()=> {
    const getAllocatedData = async() => {
      try{
        const response = await fetch(process.env.REACT_APP_BACKENDURL+`/getassignpacket/${subject_no}`)
      const resData = await response.json()
      if(response.ok){
        setAllocatedData(resData.data)
      }
      else{
        console.log(resData.message)
      }
      }catch(err){
        console.log(err)
      }
    }
    getAllocatedData()
  }, [id, subject_no])



  // Gettong Faculty Data
  
    useEffect(()=> {
      const getfacultyData = async() => {
        try{
          const response = await fetch(process.env.REACT_APP_BACKENDURL+`/api/facultylist/${facultyId}`)
        const resData = await response.json()
        
        if(response.ok){
          setFacultyData(resData)
        }
        else{
          
        }
        }catch(err){
          console.log(err)
        }
      }
        getfacultyData()
    },[subject_no, id, facultyId])


  return (
    <SimpleBar className={`nk-msg-profile ${sidebar ? "visible" : ""}`}>
      <Card>
        <div className="card-inner-group">
          <div className="card-inner">
            <div className="user-card user-card-s2 mb-2">
              <UserAvatar className="md" theme={profile.theme} image="" text="" />
              <div className="user-info">
                <h5>{profile.name}</h5>
                <span className="sub-text">Faculty</span>
              </div>
              {/* <UncontrolledDropdown className="user-card-menu dropdown">
                <DropdownToggle tag="a" className="btn btn-icon btn-sm btn-trigger dropdown-toggle">
                  <Icon name="more-h"></Icon>
                </DropdownToggle>
                <DropdownMenu right>
                  <LinkList opt className="no-bdr">
                    <LinkItem link={"/user-details-regular/1"} icon="eye">
                      View Profile
                    </LinkItem>
                    <LinkItem link={""} tag="a" icon="na">
                      Block From System
                    </LinkItem>
                    <LinkItem link={""} tag="a" icon="repeat">
                      View Orders
                    </LinkItem>
                  </LinkList>
                </DropdownMenu>
              </UncontrolledDropdown> */}
            </div>
            <Row className="text-center g-1">
              <Col xs={4}>
                <div className="profile-stats">
                  <span className="amount">{profile.total_answer_scripts || 0}</span>
                  <span className="sub-text">Total Packets</span>
                </div>
              </Col>
              <Col xs={4}>
                <div className="profile-stats">
                  <span className="amount">20</span>
                  <span className="sub-text">0</span>
                </div>
              </Col>
              <Col xs={4}>
                <div className="profile-stats">
                  <span className="amount">1</span>
                  <span className="sub-text">In Progress</span>
                </div>
              </Col>
            </Row>
          </div>
          <div className="card-inner">
            <div className="aside-wg">
              <h6 className="overline-title-alt mb-2">Faculty Information</h6>
              <ul className="user-contacts">
                <li>
                  <Icon name="mail"></Icon>
                  <span>{facultyData.email}</span>
                </li>
                <li>
                  <Icon name="call"></Icon>
                  <span>{facultyData.phone_no}</span>
                </li>
                <li>
                  <Icon name="map-pin"></Icon>
                  <span>
                    14 Ridder Park Road <br />
                    Coimbatore, 641027
                  </span>
                </li>
              </ul>
            </div>

            <div className="aside-wg">
              <h6 className="overline-title-alt mb-2">Additional Information</h6>
              <Row className="gx-1 gy-3">
                <Col xs={6}>
                  <span className="sub-text">ID: </span>
                  <span>{facultyData.id}</span>
                </Col>
                <Col xs={6}>
                  <span className="sub-text">College</span>
                  <span>{facultyData.college_name}</span>
                </Col>
                <Col xs={6}>
                  <span className="sub-text">Status:</span>
                  <span className={`lead-text text-${profile.closed ? "danger" : "success"}`}>
                    {profile.closed ? "Closed" : "Active"}
                  </span>
                </Col>
                <Col xs={6}>
                  <span className="sub-text">Last Login:</span>
                  {/* <span>{profile.reply.length === 0 ? "None" : profile.reply[profile.reply.length - 1].name}</span> */}
                  <span>17th October 2023 at 5.15PM</span>
                </Col>
              </Row>
            </div>
            <div className="aside-wg">
              <h6 className="overline-title-alt mb-2">Completed Exams</h6>
              <ul className="align-center g-2">
                {/* <li>
                  <UserAvatar theme="purple" text="15 Oct" />
                </li>
                <li>
                  <UserAvatar theme="pink" text="16 Oct" />
                </li>
                <li>
                  <UserAvatar theme="gray" text="17th Oct" />
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </SimpleBar>
  );
};

export default MessageProfileSidebar;
