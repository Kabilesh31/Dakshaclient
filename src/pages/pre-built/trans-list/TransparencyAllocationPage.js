import React, { useState, useEffect, useContext } from "react";

import {
  Input,
  Modal,
  ModalBody,

} from "reactstrap";
import {
  Button,
  Icon,
  Col,
  DataTableRow,
  OutlinedInput,
} from "../../../components/Component";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import DataContext from "../../../utils/DataContext";
import { Link } from "react-router-dom/cjs/react-router-dom.min";


  const TransparencyAllocationPage = ({transData, toggleState, getTransparencyList, subjectCode}) => {
  const {userData} = useContext(DataContext)
  const [key, setKey] = useState(0);
  const [assignModal, setAssignModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [isValid, setIsValid] = useState(false)
  const [groupData, setGroupData] = useState([])
  const [toggle, setToggle] = useState(false);
  const [transparencyModal, setTransparencyModal] = useState(false)
  const [message, setMessage] = useState("")
  const [dummyNumberData, setDummyNumberData] = useState([])
  // Changing state value when searching name

  const CloseButton = () => {
    return (
      <span className="btn-trigger toast-close-button" role="button">
        <Icon name="cross"></Icon>
      </span>
    );
  };
  const successToast = (msg) => {
    toast.success(msg);
  };
  const warningToast = (msg) => {
    toast.warning(msg);
  };

  const infoToast = () => {
    toast.info("This is a note for info toast");
  };

  const errorToast = () => {
    toast.error("Network Error");
  };

  const getTransparencyDataByDummyNumber = async(dummyno)=> {
    try{
     const response = await fetch(process.env.REACT_APP_BACKENDURL+"/getdummynumbers/bydummyno/"+dummyno)
     const resData = await response.json()
     if(response.ok){
       setDummyNumberData(resData.data)
     }
     else{
       console.log("error")
     }
    }catch(err){
     console.log(err)
    }
   }

  useEffect(() => {
    if (toggleState && subjectCode) {
      getTransparencyDataBySubjectCode();
    }
  }, [toggleState, subjectCode]);

  const toggleAssignModal = () => {
    setAssignModal(!assignModal);
  };
  const toggleDeleteModal = () => {
    setDeleteModal(!deleteModal);
  };
  const toggleTransparencyModal = () => {
    setTransparencyModal(!transparencyModal);
  };
  const getTransparencyDataBySubjectCode = async()=> {
   try{
    const response = await fetch(process.env.REACT_APP_BACKENDURL+"/api/transparency/"+subjectCode)
    const resData = await response.json()
    if(response.ok){
      setGroupData(resData.data)
    }
    else{
      console.log("error")
    }
   }catch(err){
    console.log(err)
   }}
  const handleChangeApply = (e) => {
    setMessage(e.target.value)
  }
  const handleChange = (e) => {
    setKey(e.target.value)
  }

  useEffect(()=> {
    if(transData.bookletKey === parseInt(key)){
      setIsValid(true)
    }
    else{
      setIsValid(false)
    }
  }, [key])


  const handleUpload = () => {
    toggleAssignModal()
        setTimeout(() => {
          updateTransparencyStatus()
    }, 15 * 60 * 1000);
  }

  const id = transData.transparencyId
  const updateTransparencyStatus = async() => {
    const submittedData = {
      status : 1
    }
    const patchData = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submittedData)
    }
    try{
      const patchResponse = await fetch(process.env.REACT_APP_BACKENDURL+"/api/transparency/"+id, patchData); // Replace PATCH_ENDPOINT_HERE with your actual endpoint
      const patchResData = await patchResponse.json();
    
      if (patchResponse.ok) {
        setAssignModal(prevState => !prevState);
        setModal({ add: false })
        getTransparencyList()
        toggleDeleteModal()
        toggleAssignModal()

      } else {
        errorToast(patchResData.message);
      }
    } catch (patchErr) {
      console.log(patchErr);
    }
  }


  // const handleUpdateRevaluation = async() => {
  //   const submittedData = {
  //     status : 1
  //   }
  //   const patchData = {
  //     method: "PATCH",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(submittedData)
  //   }
  //   try{
  //     const patchResponse = await fetch(process.env.REACT_APP_BACKENDURL+"/api/transparency/revaulation/"+id, patchData); // Replace PATCH_ENDPOINT_HERE with your actual endpoint
  //     const patchResData = await patchResponse.json();
    
  //     if (patchResponse.ok) {
  //      setToggle(false)
  //      getTransparencyList()
  //     } else {
  //       errorToast(patchResData.message);
  //     }
  //   } catch (patchErr) {
  //     console.log(patchErr);
  //   }
  // }


  const handleUpdateRevaluation = async () => {
    const submittedData = {
      status: 1
    };
    const patchData1 = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submittedData)
    };
  
    try {
      // First PATCH request
      const patchResponse1 = await fetch(
        `${process.env.REACT_APP_BACKENDURL}/api/transparency/revaulation/${id}`,
        patchData1
      );
      const patchResData1 = await patchResponse1.json();
  
      if (patchResponse1.ok) {
        setToggle(false);
        getTransparencyList();
  
        // Proceed with the second PATCH request to update status to 0
        const submittedData2 = {
          status: 0
        };
        const patchData2 = {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submittedData2)
        };
  
        const patchResponse2 = await fetch(
          `${process.env.REACT_APP_BACKENDURL}/getdummynumbers/${transData.dummyNumber}`,
          patchData2
        );
        const patchResData2 = await patchResponse2.json();
  
        if (patchResponse2.ok) {
          // Third PATCH request
          const submittedData3 = {
            status: 3
          };
          const patchData3 = {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submittedData3)
          };
  
          const patchResponse3 = await fetch(
            `${process.env.REACT_APP_BACKENDURL}/answerpacketlist/byanswerpacketnumber/${dummyNumberData.answer_packet_number}`,
            patchData3
          );
          const patchResData3 = await patchResponse3.json();
  
          if (patchResponse3.ok) {
            successToast("Revaluation Applied Successfully");
          } else {
            errorToast(patchResData3.message);
          }
        } else {
          errorToast(patchResData2.message);
        }
      } else {
        errorToast(patchResData1.message);
      }
    } catch (patchErr) {
      errorToast("An error occurred during the request.");
    }
  };
  


  return (
    <React.Fragment>
    <Modal isOpen={toggle} toggle={toggleTransparencyModal} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                setToggle(false)
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Enter Message to Apply</h5>
              <div className="mt-4">
              
              <textarea
                      type="text"
                      className="form-control"
                      onChange={handleChangeApply}
                      id="applyTransaparency"
                      icon="key-fill"
                      required
                    >
                    
                    </textarea>
                <div style={{marginTop:"20px", display:"flex", justifyContent:"end"}}>
              <Button disabled={message.length<6} onClick={message.length >=   6 ? handleUpdateRevaluation : null} style={{backgroundColor:`${message.length>= 6 ? "#206296" : "grey" }`,marginTop:"20px", color:"white"}}> Apply </Button>
              </div>
              </div>
            </div>
          </ModalBody>
        </Modal>
      <Modal isOpen={modal.add} toggle={() => setModal({ add: false })} className="modal-dialog-centered" size="sm">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                setModal({ edit: false, add: false });
                setIsValid(false)
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Enter Key</h5>
              <div className="mt-4">
              <OutlinedInput
                      type="number"
                      className="form-control"
                      onChange={handleChange}
                      id="txtOtp"
                      icon="key-fill"
                      name="otp"
                      required
                      maxLength={5}
                      
                      // refs={register({ required: true })}
                    >
                      {/* {errors.otp && <span className="invalid">OTP is required</span>} */}
                    </OutlinedInput>
                <div style={{marginTop:"20px", display:"flex", justifyContent:"end"}}>
              <Button disabled={!isValid} onClick={isValid ? handleUpload : ""} style={{backgroundColor:`${isValid ? "#206296" : "grey" }`,marginTop:"20px", color:"white"}}> Submit </Button>
              </div>
              </div>
            </div>
          </ModalBody>
        </Modal>
            <div className="card-inner-group">
              <div className="card-inner p-0">
             
                <table className="table table-tranx">
                <thead>
                    <tr className="tb-tnx-head">
                      <th className="tb-tnx-id">
                        <span></span> {/* Add content for the ID column */}
                      </th>
                      
                      <th className="tb-tnx-info">
                        {/* Conditional rendering for the "Subject Name" based on the user's role */}
                        {userData.role === "transparency" && (
                          <span className="tb-tnx-desc d-none d-md-inline-block">
                          Subject Name
                           
                          </span>
                        )}
                              
                          <span>Dummy Number</span>
                        
                      </th>
                      <th className="">
                        <span className="">Degree Type</span>
                      </th>
                      <th className="">
                        <span className="">Subject Code</span>
                      </th>
                      
                      {/* Conditional rendering for the "Booklet Key" column based on the user's role */}
                      {userData.role === "superadmin" && (
                        <th className="tb-tnx-amount is-alt">
                          <span className="tb-tnx-total">Booklet Key</span>
                        </th>
                      )}
                      
                      <th className="">
                        <span className="">Status</span>
                      </th>

                      {userData.role === "superadmin" && (
                        <th className="">
                          <span className="tb-tnx-total">Request</span>
                        </th>
                      )}
                    </tr>
                  </thead>

                  {!toggleState ? (
  <tbody>
    <tr className="tb-tnx-item">
      <td className="tb-tnx-id">
        <span>{}</span>
      </td>

      <td className="tb-tnx-info">
        {userData.role === "transparency" && (
          transData.transparencyStatus === 0 ? (
            <div className="tb-tnx-desc">
              <Link>
                <span style={{ color: "grey" }} onClick={() => setModal({ add: true })}>
                  {transData.subjectName}
                </span>
              </Link>
            </div>
          ) : (
            <div className="tb-tnx-desc">
              <span style={{ color: "grey" }}>{transData.subjectName}</span>
            </div>
          )
        )}

        <div className="tb-tnx-desc">
          <span style={{ color: "grey" }}>{transData.dummyNumber}</span>
        </div>
      </td>

      <td>
        <div className="tb-tnx-desc">
          <span style={{ color: "grey" }}>{transData.degreeType}</span>
        </div>
      </td>

      <td>
        <div className="tb-tnx-date">
          <span>{transData.subjectCode}</span>
        </div>
      </td>

      {userData.role === "superadmin" && (
        <td>
          <div className="tb-tnx-date">
            <span>{transData.bookletKey}</span>
          </div>
        </td>
      )}

      <td>
        <span
          className="date mt-0.5"
          style={{ color: transData.transparencyStatus === 1 ? "#35A29F" : "#FF0000" }}
        >
          <Icon name="eye" />
        </span>
      </td>

      {userData.role === "superadmin" && (
        <td className="nk-msg-menu-item">
        <Button disabled={transData.reValuationStatus === 1} onClick={()=>{setToggle(true); getTransparencyDataByDummyNumber(transData.dummyNumber)}} style={{backgroundColor:"#206296", color:"white"}}>
            {transData.reValuationStatus === 0 ? "Apply": "Applied"}
          </Button>
        </td>
      )}
      <DataTableRow className="nk-tb-col-tools">
        <Modal isOpen={deleteModal} toggle={toggleDeleteModal} className="modal-dialog-centered" size="xs">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                toggleAssignModal();
              }}
              className="close"
            />
            <div className="confirmation-container">
              <h5 className="confirmation-message">"If you close it, you can't open it again."</h5>
              <div className="confirmation-buttons">
                <button className="confirm-button" onClick={() => { updateTransparencyStatus(); toggleAssignModal(); }}>
                  Confirm
                </button>
                <button className="cancel-button" onClick={() => { toggleDeleteModal(); }}>Cancel</button>
              </div>
            </div>
          </ModalBody>
        </Modal>

        <Modal isOpen={assignModal} className="modal-dialog-centered" size="xl">
          <ModalBody>
            <div className="nk-modal-head ml-5 mr-5 mt-2">
              <a
                href="#cancel"
                onClick={(ev) => {
                  ev.preventDefault();
                  toggleDeleteModal();
                  setModal({ add: false });
                  setIsValid(false);
                }}
                className="close"
              >
                <Icon name="cross-sm" />
              </a>
            
              <div style={{ display: "flex", marginBottom: "20px" }}>
                <Col md="11">
                  <h4 className="nk-modal-title title">{transData.subjectName}</h4>
                </Col>
                <Col md="1" />
              </div>

             
             
            </div>
          </ModalBody>
        </Modal>
      </DataTableRow>
    </tr>
  </tbody>
) : (
  groupData.map((item) => (
    <tbody>
      <tr className="tb-tnx-item">
        <td className="tb-tnx-id">
          <span>{}</span>
        </td>
        <td className="tb-tnx-info">
          {userData.role === "transparency" && (
            item.transparencyStatus === 0 ? (
              <div className="tb-tnx-desc">
                <Link>
                  <span style={{ color: "grey" }} onClick={() => setModal({ add: true })}>
                    {item.subjectName}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="tb-tnx-desc">
                <span style={{ color: "grey" }}>{item.subjectName}</span>
              </div>
            )
          )}

          <div className="tb-tnx-desc">
            <span style={{ color: "grey" }}>{item.dummyNumber}</span>
          </div>
        </td>

        <td>
          <div className="tb-tnx-desc">
            <span style={{ color: "grey" }}>{item.degreeType}</span>
          </div>
        </td>

        <td>
          <div className="tb-tnx-date">
            <span>{item.subjectCode}</span>
          </div>
        </td>

        {userData.role === "superadmin" && (
          <td>
            <div className="tb-tnx-date">
              <span>{item.bookletKey}</span>
            </div>
          </td>
        )}

        <td>
          <span
            className="date mt-0.5"
            style={{ color: item.transparencyStatus === 1 ? "#35A29F" : "#FF0000" }}
          >
            <Icon name="eye" />
          </span>
        </td>

        {userData.role === "superadmin" && (
        <td>
          <div className="tb-tnx-date">
          <Button><Icon name="reports"></Icon></Button>
          </div>
        </td>
      )}
        <DataTableRow className="nk-tb-col-tools">
          <Modal isOpen={deleteModal} toggle={toggleDeleteModal} className="modal-dialog-centered" size="xs">
            <ModalBody>
              <a
                href="#cancel"
                onClick={(ev) => {
                  ev.preventDefault();
                  toggleAssignModal();
                }}
                className="close"
              />
              <div className="confirmation-container">
                <h5 className="confirmation-message">"If you close it, you can't open it again."</h5>
                <div className="confirmation-buttons">
                  <button className="confirm-button" onClick={() => { updateTransparencyStatus(); toggleAssignModal(); }}>
                    Confirm
                  </button>
                  <button className="cancel-button" onClick={() => { toggleDeleteModal(); }}>Cancel</button>
                </div>
              </div>
            </ModalBody>
          </Modal>

          <Modal isOpen={assignModal} className="modal-dialog-centered" size="xl">
            <ModalBody>
              <div className="nk-modal-head ml-5 mr-5 mt-2">
                <a
                  href="#cancel"
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggleDeleteModal();
                    setModal({ add: false });
                    setIsValid(false);
                  }}
                  className="close"
                >
                  <Icon name="cross-sm" />
                </a>
                <Timer />
                <div style={{ display: "flex", marginBottom: "20px" }}>
                  <Col md="11">
                    <h4 className="nk-modal-title title">{item.subjectName}</h4>
                  </Col>
                  <Col md="1" />
                </div>

                <div className="card-inner-group">
                  <Col md="12">
                    <iframe
                      src={file}
                      name="iframe_a"
                      height="600px"
                      width="100%"
                      title="Iframe Example"
                    />
                  </Col>
                  <div className="card-inner p-0" />
                </div>
              </div>
            </ModalBody>
          </Modal>
        </DataTableRow>
      </tr>
    </tbody>
  ))
)}

                </table>
              </div>
            </div>

            <ToastContainer
      position ={"bottom-right"}
      closeOnClick= {true}
      autoClose = {2000}
      hideProgressBar= {true}  
      pauseOnHover= {true}
      draggable= {true}
      progress= {false}
      closeButton= <CloseButton/>
      />
    </React.Fragment>
  );
};

export default TransparencyAllocationPage;
