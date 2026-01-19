import React from 'react'
import { Block, BlockHead, BlockTitle } from '../../../components/Component'

const FamilyDetails = ({user}) => {
  return (
   
        
         <div  className="p-4">
            <Block>
                <BlockHead>
                <BlockTitle className="mt-1" tag="h5">Family Information</BlockTitle>
                
                </BlockHead>
                <div className="profile-ud-list">
                
                <div className="profile-ud-item mt-2">
                    <div className="profile-ud wider">
                    <span className="profile-ud-label">Father Name</span>
                    <span className="profile-ud-value">{user.family.fatherName || "Not Available"}</span>
                    </div>
                </div>
    
                <div className="profile-ud-item">
                
                </div>
    
                <div className="profile-ud-item">
                <div className="profile-ud wider">
                    <span className="profile-ud-label">Mother Name</span>
                    <span className="profile-ud-value">{user.family.motherName || "Not Available"}</span>
                </div>
                </div>
    
    
                <div className="profile-ud-item">
                
                </div>
    
                <div className="profile-ud-item">
                    <div className="profile-ud wider">
                    <span className="profile-ud-label">Sibling Name</span>
                    <span className="profile-ud-value">{user.family.siblingName || "Not Available"}</span>
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
                    <span className="profile-ud-label">Phone</span>
                    <span className="profile-ud-value">{user.family.familyNumber || "Not Available" }</span>
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
                    <span className="profile-ud-label">Family Members</span>
                    <span className="profile-ud-value">{user.family.familyMembers || "Not Available" }</span>
                    </div>
                </div>

                </div>
            </Block>
    
            </div>) 
                           
    }

export default FamilyDetails