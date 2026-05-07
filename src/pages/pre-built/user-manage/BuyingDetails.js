import React, { useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
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
import { initialItems } from "./Buying";

const BuyingDetails = () => {
  const location = useLocation();
  const history = useHistory();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    let itemData = location.state?.item;

    if (!itemData) {
      const stored = sessionStorage.getItem("selectedItem");
      if (stored) {
        itemData = JSON.parse(stored);
        sessionStorage.removeItem("selectedItem");
      }
    }

    if (!itemData && id) {
      itemData = initialItems.find((i) => i.id === id);
    }

    // Add default values for new fields if they don't exist
    if (itemData) {
      setItem({
        ...itemData,
        nilRatedExempted: itemData.nilRatedExempted || false,
        nonGst: itemData.nonGst || false,
        disabled: itemData.disabled || false,
        allowAlternativeItem: itemData.allowAlternativeItem || false,
        hasVariants: itemData.hasVariants || false,
        valuationRate: itemData.valuationRate || "",
        comments: itemData.comments || "",
      });
    } else {
      setItem(null);
    }
  }, [location, id]);

  if (!item) {
    return (
      <Content>
        <div className="text-center py-5">
          <h4>Item not found</h4>
          <Button color="primary" onClick={() => history.push("/Buying")}>
            Go Back to Items
          </Button>
        </div>
      </Content>
    );
  }

  const {
    name,
    id: itemId,
    status,
    group,
    itemCode,
    hsnSac,
    unitMeasure,
    maintainStock,
    isFixedAsset,
    nilRatedExempted,
    nonGst,
    disabled,
    allowAlternativeItem,
    hasVariants,
    valuationRate,
    comments,
  } = item;

  return (
    <>
      <Head title={`Item: ${name}`} />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3">{name}</BlockTitle>
              <p className="text-muted">Item ID: #{itemId}</p>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button
                color="secondary"
                onClick={() => history.push("/Buying")}
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
              {/* Tab Headers */}
              <div className="d-flex gap-4 border-bottom pb-2 mb-4">
                <h5
                  className={`mb-0 mr-3 ${activeTab === "details" ? "text-primary fw-bold" : "text-muted"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("details")}
                >
                  Item Details
                </h5>
                <h5
                  className={`mb-0 mr-3 ${activeTab === "stock" ? "text-primary fw-bold" : "text-muted"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("stock")}
                >
                  Stock & Asset
                </h5>
                <h5
                  className={`mb-0 ${activeTab === "additional" ? "text-primary fw-bold" : "text-muted"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("additional")}
                >
                  Additional Info
                </h5>
              </div>

              {/* Tab 1: Item Details */}
              {activeTab === "details" && (
                <div>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="text-muted small">Item Name</div>
                      <div className="fw-semibold">{name}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Item Code</div>
                      <div>{itemCode}</div>
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
                      <div className="text-muted small">Item Group</div>
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
                      <div className="text-muted small">HSN/SAC Code</div>
                      <div>{hsnSac || "—"}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Default Unit of Measure</div>
                      <div>{unitMeasure}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Item ID</div>
                      <div>#{itemId}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Stock & Asset Info */}
              {activeTab === "stock" && (
                <div>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="text-muted small mb-2">Maintain Stock</div>
                      <div>
                        {maintainStock ? (
                          <span className="badge bg-success" style={{ color: "white", padding: "6px 12px" }}>
                            Yes
                          </span>
                        ) : (
                          <span className="badge bg-secondary" style={{ color: "white", padding: "6px 12px" }}>
                            No
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-2">Is Fixed Asset</div>
                      <div>
                        {isFixedAsset ? (
                          <span className="badge bg-info" style={{ color: "white", padding: "6px 12px" }}>
                            Yes
                          </span>
                        ) : (
                          <span className="badge bg-secondary" style={{ color: "white", padding: "6px 12px" }}>
                            No
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Additional Info */}
              {activeTab === "additional" && (
                <div>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="text-muted small mb-2">Is Nil Rated / Exempted</div>
                      <div>
                        {nilRatedExempted ? (
                          <span className="badge bg-success" style={{ color: "white", padding: "6px 12px" }}>
                            Yes
                          </span>
                        ) : (
                          <span className="badge bg-secondary" style={{ color: "white", padding: "6px 12px" }}>
                            No
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-2">Is Non‑GST</div>
                      <div>
                        {nonGst ? (
                          <span className="badge bg-success" style={{ color: "white", padding: "6px 12px" }}>
                            Yes
                          </span>
                        ) : (
                          <span className="badge bg-secondary" style={{ color: "white", padding: "6px 12px" }}>
                            No
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-2">Disabled</div>
                      <div>
                        {disabled ? (
                          <span className="badge bg-danger" style={{ color: "white", padding: "6px 12px" }}>
                            Yes
                          </span>
                        ) : (
                          <span className="badge bg-secondary" style={{ color: "white", padding: "6px 12px" }}>
                            No
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-2">Allow Alternative Item</div>
                      <div>
                        {allowAlternativeItem ? (
                          <span className="badge bg-success" style={{ color: "white", padding: "6px 12px" }}>
                            Yes
                          </span>
                        ) : (
                          <span className="badge bg-secondary" style={{ color: "white", padding: "6px 12px" }}>
                            No
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-2">Has Variants</div>
                      <div>
                        {hasVariants ? (
                          <span className="badge bg-success" style={{ color: "white", padding: "6px 12px" }}>
                            Yes
                          </span>
                        ) : (
                          <span className="badge bg-secondary" style={{ color: "white", padding: "6px 12px" }}>
                            No
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-2">Valuation Rate</div>
                      <div>{valuationRate ? `₹ ${valuationRate}` : "—"}</div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted small mb-2">Comments</div>
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

export default BuyingDetails;