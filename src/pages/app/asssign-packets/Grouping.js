import { useContext, useEffect, useState } from "react";
import DataContext from "../../../utils/DataContext";
import { DataTableRow, Icon, OutlinedInput, InputSwitch, PaginationComponent } from "../../../components/Component";
import { Button, Col, Input, Modal, ModalBody } from "reactstrap";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";
import axios from "axios";

const Grouping = ({ currentItems, toggleState }) => {
  const { userData } = useContext(DataContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState(false);
  const [groupData, setGroupData] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);
  const [selectedTransparencyId, setSelectedTransparencyId] = useState(null);

  const [selectedData, setSelectedData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [inVoicePayId, setInvoicePayId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (toggleState && selectedSubjectCode) {
      getTransparencyDataBySubjectCode();
    }
  }, [toggleState, selectedSubjectCode]);

  const getTransparencyDataBySubjectCode = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/transparency/" + selectedSubjectCode);
      const resData = await response.json();
      if (response.ok) {
        setGroupData(resData.data);
      } else {
        console.log("error");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getInvoiceDataByPhone = async (phone) => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/bill/getAllBillByPhone/" + phone);
      const resData = await response.json();
      if (response.ok) {
        setGroupData(resData);
        localStorage.setItem("invoiceData", JSON.stringify(resData));
      } else {
        console.log("error");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const filteredInvoice = groupData.filter(
    (item, index, self) => index === self.findIndex((t) => t.invoiceNo === item.invoiceNo),
  );

  const filteredData = filteredInvoice.filter((item) => item.isGenerated === true);

  // Filtered items based on search
  const filteredItems = currentItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Update pagination based on filtered items
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems1 = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNavigate = (invoiceNo) => {
    const filterData = groupData.filter((item) => item.invoiceNo === invoiceNo);
    localStorage.setItem("selectedProducts", JSON.stringify(selectedCustomer));
    localStorage.setItem("selectedProducts", JSON.stringify(filterData));
    window.open("/printInvoice", "_blank");
  };

  const toggleDeleteModal = (item) => {
    setDeleteModal(!deleteModal);
  };

  const handleIsPaid = async () => {
    try {
      for (const bill of filteredData) {
        await axios.put(
          `${process.env.REACT_APP_BACKENDURL}/api/bill/updateisPaid/${inVoicePayId}`,
          { isPaid: true }, // Always setting to true
        );
        console.log(`Payment updated for invoice no: ${bill.invoiceNo}`);
      }
      getInvoiceDataByPhone(selectedCustomer.phone);
      successToast("Payment Updated");
      setDeleteModal(false); // Close modal after success
    } catch (error) {
      console.error("Error updating invoices:", error);
      errorToast("An error occurred while updating invoices.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to first page when searching
  };
  return (
    <>
      <div style={{ backgroundColor: "white", padding: "10px" }} className="">
        <div style={{ display: "flex", justifyContent: "end" }}>
          <div></div>
          <Input
            type="text"
            style={{
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "30%",
            }}
            placeholder="Search by Customer name"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {/* <Button
          // onClick={handleCreateInvoice}
          className="btn-icon ml-2 "
          color="primary">
          <Icon name="search" />
        </Button> */}
        </div>

        <ul>
          <li
            style={{
              fontSize: "15px",
              fontFamily: "'Nunito Sans', sans-serif",
              fontWeight: 600,
              margin: "10px 30px",
              textDecoration: "underline",
              textDecorationColor: "#6576FF",
              fontWeight: "bold",
              color: "#4E56C0",
            }}
            className={"active"}
          >
            CUSTOMER NAME
          </li>
          {currentItems1.map((item) => (
            <li
              key={item.phone}
              style={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: 600,
                fontSize: "17px",
                margin: "20px 30px",
                cursor: "pointer",
                fontWeight: "bold",
                color: selectedSubjectCode === item.phone ? "#6576FF" : "black",
              }}
              onClick={() => {
                if (selectedTransparencyId === item.phone) {
                  setSelectedTransparencyId(null);
                } else {
                  setSelectedTransparencyId(item.phone);
                  getInvoiceDataByPhone(item.phone);
                  setSelectedCustomer(item);
                }
                setSelectedSubjectCode(item.phone);
              }}
            >
              {item.name}
              {/* Toggle table when subjectCode is clicked */}
              {selectedTransparencyId === item.phone && (
                <div className="card-inner-group">
                  <div className="card-inner p-0">
                    <table style={{ border: "2px solid #f2f2f2" }} className="table table-tranx mt-2">
                      <thead>
                        <tr className="tb-tnx-head">
                          <th className="tb-tnx-id">
                            <span></span> {/* Add content for the ID column */}
                          </th>
                          <th className="tb-tnx-info">
                            Invoice No
                            {/* <span>Amount</span> */}
                          </th>
                          <th>
                            <span>From</span>
                          </th>
                          <th>
                            <span>To</span>
                          </th>

                          <th>
                            <span>Type</span>
                          </th>
                          <th>
                            <span className="tb-tnx-total">Status</span>
                          </th>
                          <th>
                            <span className="tb-tnx-total">Action</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((groupItem) => (
                            <tr key={groupItem._id} className="tb-tnx-item" onClick={(e) => e.stopPropagation()}>
                              <td className="tb-tnx-id">
                                <span>{/* ID content */}</span>
                              </td>
                              <td className="tb-tnx-info">
                                <div>
                                  <span
                                    className="tb-tnx-desc"
                                    onClick={() => handleNavigate(groupItem.invoiceNo)}
                                    onMouseEnter={() => setHoveredInvoice(groupItem.invoiceNo)}
                                    onMouseLeave={() => setHoveredInvoice(null)}
                                    style={{
                                      color: isHovered ? "blue" : "grey",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {groupItem.invoiceNo}
                                  </span>
                                </div>
                                {/* <div className="tb-tnx-desc">
                          <span style={{ color: "grey" }}>2000</span>
                        </div> */}
                              </td>
                              <td>
                                <div className="tb-tnx-desc">
                                  <span style={{ color: "grey" }}>{groupItem.fromDate}</span>
                                </div>
                              </td>
                              <td>
                                <div className="tb-tnx-date">
                                  <span>{groupItem.toDate}</span>
                                </div>
                              </td>
                              <td>
                                <div className="tb-tnx-date">
                                  <span>{selectedCustomer.type}</span>
                                </div>
                              </td>

                              {/* <td>
                      <Button> <icon name="">click</icon></Button>
                      </td> */}
                              <td>
                                <span className={`tb-status text-${groupItem.isPaid === true ? "success" : "danger"}`}>
                                  {groupItem.isPaid === true ? "Paid" : "Not Paid"}
                                </span>
                              </td>
                              <td>
                                <div className="custom-control custom-switch mr-n2">
                                  <InputSwitch
                                    id={`activity-log-${groupItem._id}`}
                                    checked={groupItem.isPaid}
                                    onChange={() => {
                                      if (!groupItem.isPaid) {
                                        setInvoicePayId(groupItem.invoiceNo);
                                        toggleDeleteModal(); // Open delete confirmation if not paid
                                      }
                                    }}
                                    disabled={groupItem.isPaid}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", color: "grey" }}>
                              No Invoice Generated
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Modal for assign */}

        <div style={{ textAlign: "center" }}>
          {currentItems.length > 0 ? (
            <PaginationComponent
              itemPerPage={itemPerPage}
              totalItems={filteredItems.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          ) : (
            <div className="text-center">
              <span className="text-silent">No data found</span>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={deleteModal} toggle={toggleDeleteModal} className="modal-dialog-centered" size="md">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              toggleDeleteModal();
            }}
            className="close"
          >
            <Icon onClick={toggleDeleteModal} name="cross-sm"></Icon>
          </a>
          <div className="nk-modal-head ">
            <div className="card-inner-group">
              <div className="card-inner p-0">
                <div className="confirmation-container">
                  <h5 className="confirmation-message"> Payment {selectedData && selectedData.name}</h5>
                  <div className="confirmation-buttons">
                    <button className="confirm-button" onClick={handleIsPaid}>
                      Confirm
                    </button>
                    <button className="cancel-button" onClick={toggleDeleteModal}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};
export default Grouping;
