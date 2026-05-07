import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
} from "../../../components/Component";

const SupplierDetails = () => {
  const location = useLocation();
  const history = useHistory();
  const supplier = location.state?.supplier;
  const [activeTab, setActiveTab] = useState("details"); // "details" or "address"

  if (!supplier) {
    return (
      <Content>
        <div className="text-center py-5">
          <h4>Supplier not found</h4>
          <Button color="primary" onClick={() => history.push("/Suppliers")}>
            Go Back to Suppliers
          </Button>
        </div>
      </Content>
    );
  }

  const {
    name,
    id,
    status,
    group,
    gstNumber,
    supplierType,
    gstCategory,
    contact,
    address,
    country = "India",
    billingCurrency = "INR",
    defaultBankAccount = "HDFC Bank - 1234567890",
    priceList = "Standard Buying",
    secondaryContact = {
      firstName: "Secondary",
      lastName: "Contact",
      email: "secondary@example.com",
      mobile: "9876543219",
    },
    comments = "Regular supplier, net 30 days payment terms.",
  } = supplier;

  const handleEditDetails = () => {
    history.push("/Suppliers");
  };

  return (
    <>
      <Head title={`Supplier: ${name}`} />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">{name}</BlockTitle>
              <p className="text-muted">Supplier ID: #{id}</p>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button
                color="secondary"
                onClick={() => history.push("/Suppliers")}
                className="me-2"
              >
                <Icon name="arrow-left" /> Back
              </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <div className="card">
            <div className="card-inner">
              {/* Tab Headers - side by side */}
              <div className="d-flex gap-4 border-bottom pb-2 mb-4">
                <h5
                  className={`mb-0 mr-4 ${activeTab === "details" ? "text-primary fw-bold" : "text-muted"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </h5>
                <h5
                  className={`mb-0 ${activeTab === "address" ? "text-primary fw-bold" : "text-muted"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("address")}
                >
                  Address & Contact
                </h5>
              </div>

              {/* Tab Content - only one active at a time */}
              {activeTab === "details" && (
                <div>
                  <div className="d-flex justify-content-end mb-3">
                    <Button
                      size="sm"
                      style={{
                        backgroundColor: "#644634",
                        borderColor: "#800000",
                        color: "#fff",
                      }}
                      onClick={handleEditDetails}
                    >
                      <Icon name="edit" /> Edit
                    </Button>
                  </div>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="text-muted small">Supplier Name</div>
                      <div className="fw-semibold">{name}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Supplier Group</div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: "#e0f2fe",
                          color: "#0369a1",
                          borderRadius: "20px",
                        }}
                      >
                        {group}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Country</div>
                      <div>{country}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Supplier Type</div>
                      <div>{supplierType}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Billing Currency</div>
                      <div>{billingCurrency}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Default Bank Account</div>
                      <div>{defaultBankAccount}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Price List</div>
                      <div>{priceList}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Status</div>
                      <span
                        className={`badge bg-${status === "Enabled" ? "success" : "danger"}`}
                        style={{ color: "white", padding: "6px 12px", borderRadius: "12px" }}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">GST Number</div>
                      <div>{gstNumber || "—"}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">GST Category</div>
                      <div>{gstCategory}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "address" && (
                <div>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="text-muted small fw-bold mb-1">Billing Address</div>
                      <div className="border rounded p-3 bg-light">
                        {address?.billing || "—"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small fw-bold mb-1">Shipping Address</div>
                      <div className="border rounded p-3 bg-light">
                        {address?.shipping || "—"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small fw-bold mb-1">Primary Contact</div>
                      <div className="border rounded p-3 bg-light">
                        <div>
                          <strong>Name:</strong>{" "}
                          {`${contact?.firstName || ""} ${contact?.lastName || ""}`.trim() || "—"}
                        </div>
                        <div>
                          <strong>Email:</strong> {contact?.email || "—"}
                        </div>
                        <div>
                          <strong>Mobile:</strong> {contact?.mobile || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small fw-bold mb-1">Secondary Contact</div>
                      <div className="border rounded p-3 bg-light">
                        <div>
                          <strong>Name:</strong>{" "}
                          {`${secondaryContact?.firstName || ""} ${secondaryContact?.lastName || ""}`.trim() ||
                            "—"}
                        </div>
                        <div>
                          <strong>Email:</strong> {secondaryContact?.email || "—"}
                        </div>
                        <div>
                          <strong>Mobile:</strong> {secondaryContact?.mobile || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted small fw-bold mb-1">Comments</div>
                      <div className="border rounded p-3 bg-light">{comments || "—"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Block>
      </Content>
    </>
  );
};

export default SupplierDetails;