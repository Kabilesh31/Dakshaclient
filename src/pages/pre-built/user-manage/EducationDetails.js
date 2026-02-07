import React from "react";
import { Block, BlockHead, BlockTitle } from "../../../components/Component";

const EducationDetails = ({ user }) => {
  return (
    <div className="p-4">
      <Block>
        <BlockHead>
          <BlockTitle className="mt-1" tag="h5">
            Education Information
          </BlockTitle>
        </BlockHead>
        <div className="profile-ud-list">
          <div className="profile-ud-item mt-2">
            <div className="profile-ud wider">
              <span className="profile-ud-label">University Name</span>
              <span className="profile-ud-value">{user.education.universityName || "Not Available"}</span>
            </div>
          </div>

          <div className="profile-ud-item"></div>

          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Degree</span>
              <span className="profile-ud-value">{user.education.degree || "Not Available"}</span>
            </div>
          </div>

          <div className="profile-ud-item"></div>

          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Degree 1</span>
              <span className="profile-ud-value">{user.education.degreeName1 || "Not Available"}</span>
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
              <span className="profile-ud-label">Degree 2</span>
              <span className="profile-ud-value">{user.education.degreeName2 || "Not Available"}</span>
            </div>
          </div>
        </div>
      </Block>
    </div>
  );
};

export default EducationDetails;
