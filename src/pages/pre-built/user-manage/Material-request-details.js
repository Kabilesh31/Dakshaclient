import React from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Button,
} from "../../../components/Component";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

const MaterialRequestDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();
  const requestData = location.state?.requestData;

  // CSV Download function
  const downloadCSV = () => {
    if (!requestData || !requestData.items || requestData.items.length === 0) {
      return;
    }

    // CSV Header
    let csvContent = "";
    const headers = [
      "S.No",
      "Item Code",
      "Item Name",
      "Required By",
      "Quantity",
      "Warehouse",
      "UOM",
    ];
    csvContent += headers.join(",") + "\n";

    // Request info rows (metadata)
    csvContent += `\n"Material Request:","${requestData._id || id}"\n`;
    csvContent += `"Title:","${requestData.title?.replace(/"/g, '""') || ""}"\n`;
    csvContent += `"Status:","${requestData.status || ""}"\n`;
    csvContent += `"Purpose:","${requestData.purpose || ""}"\n`;
    csvContent += `"Required By:","${requestData.requiredBy || ""}"\n`;
    csvContent += `"Warehouse:","${requestData.warehouse || ""}"\n`;
    csvContent += `"Price List:","${requestData.priceList || ""}"\n`;
    csvContent += `\n`;

    // Items data
    csvContent += headers.join(",") + "\n";
    requestData.items.forEach((item, index) => {
      const row = [
        item.no || index + 1,
        `"${(item.itemCode || "").replace(/"/g, '""')}"`,
        `"${(item.itemName || "").replace(/"/g, '""')}"`,
        item.requiredBy || "",
        item.quantity || 0,
        `"${(item.warehouse || "").replace(/"/g, '""')}"`,
        `"${(item.uom || "").replace(/"/g, '""')}"`,
      ];
      csvContent += row.join(",") + "\n";
    });

    // Summary
    const totalQuantity = requestData.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    csvContent += `\n"Total Items:","${requestData.items.length}"\n`;
    csvContent += `"Total Quantity:","${totalQuantity}"\n`;

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Material_Request_${requestData._id || id}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!requestData) {
    return (
      <>
        <Head title="Material Request Details" />
        <Content>
          <Block>
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "#fef3e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Icon name="alert-circle" style={{ fontSize: "36px", color: "#f5a623" }} />
              </div>
              <h4 style={{ marginBottom: "8px", fontWeight: 600, color: "#1e293b" }}>
                No Request Data Found
              </h4>
              <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "0.95rem" }}>
                The material request information could not be loaded. Please go back and try again.
              </p>
              <Button
                color="primary"
                onClick={() => history.push("/material-request")}
              >
                <Icon name="arrow-left" /> Back to Material Requests
              </Button>
            </div>
          </Block>
        </Content>
      </>
    );
  }

  // Status styles
  const getStatusStyles = (status) => {
    switch (status) {
      case "Ordered":
        return {
          bg: "#ecfdf5",
          color: "#065f46",
          border: "1px solid #6ee7b7",
          dot: "#10b981",
        };
      case "Partially Ordered":
        return {
          bg: "#eff6ff",
          color: "#1e40af",
          border: "1px solid #93c5fd",
          dot: "#3b82f6",
        };
      default:
        return {
          bg: "#fffbeb",
          color: "#92400e",
          border: "1px solid #fcd34d",
          dot: "#f59e0b",
        };
    }
  };

  const statusStyle = getStatusStyles(requestData.status);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate totals
  const totalItems = requestData.items?.length || 0;
  const totalQuantity =
    requestData.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <>
      <Head title={`Material Request ${id}`} />
      <Content>
        {/* Page Header */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <div className="d-flex align-items-center gap-3">
                <BlockTitle tag="h3" style={{ marginBottom: 0 }}>
                  Material Request
                </BlockTitle>
                <span
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: statusStyle.border,
                    padding: "4px 14px",
                    borderRadius: "20px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    marginLeft: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor: statusStyle.dot,
                      display: "inline-block",
                    }}
                  />
                  {requestData.status}
                </span>
              </div>
            </BlockHeadContent>
            <div className="d-flex align-items-center gap-2">
              <Button
                color="light"
                outline
                onClick={() => history.push("/material-request")}
              >
                <Icon name="arrow-left" /> Back
              </Button>

              {/* Download Dropdown */}
              <UncontrolledDropdown>
                <DropdownToggle
                  tag="button"
                  className="btn btn-primary d-flex align-items-center gap-1"
                  style={{
                    borderRadius: "4px",
                    padding: "15px 14px",
                    fontSize: "0.85rem",
                  }}
                >
                  <Icon name="download" />
                  <span>Download</span>
                  <Icon name="chevron-down" style={{ fontSize: "12px", marginLeft: "2px" }} />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem onClick={downloadCSV}>
                    <Icon name="file" className="me-2" />
                    Download as CSV
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </BlockBetween>
        </BlockHead>

        <Block>
          <div className="card-inner">
            {/* ID and Title Section */}
            <div
              style={{
                marginBottom: "28px",
                paddingBottom: "24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  marginBottom: "8px",
                  fontFamily: "monospace",
                  fontWeight: 500,
                }}
              >
                {id}
              </div>
              <h5
                style={{
                  fontWeight: 600,
                  color: "#111827",
                  lineHeight: "1.5",
                  marginBottom: "16px",
                  wordBreak: "break-word",
                }}
              >
                {requestData.title}
              </h5>

              {/* Info Pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "20px",
                  fontSize: "0.9rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>Purpose:</span>
                  <span
                    style={{
                      backgroundColor: "#f3f4f6",
                      padding: "3px 10px",
                      borderRadius: "4px",
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {requestData.purpose}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>Required By:</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>
                    {formatDate(requestData.requiredBy)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>Transaction Date:</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>
                    {formatDate(requestData.transactionDate)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>Warehouse:</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>
                    {requestData.warehouse || "-"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>Price List:</span>
                  <span style={{ color: "#111827", fontWeight: 500 }}>
                    {requestData.priceList || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Section Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h6
                style={{
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 0,
                  fontSize: "0.95rem",
                }}
              >
                Items
              </h6>
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "#6b7280",
                  backgroundColor: "#f9fafb",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                }}
              >
                {totalItems} item{totalItems !== 1 ? "s" : ""} • Total Qty: {totalQuantity}
              </span>
            </div>

            {/* Items Table */}
            <div
              style={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.88rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontWeight: 600,
                        color: "#374151",
                        width: "60px",
                      }}
                    >
                      No
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Item Code
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Item Name
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#374151",
                        width: "130px",
                      }}
                    >
                      Required By
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontWeight: 600,
                        color: "#374151",
                        width: "100px",
                      }}
                    >
                      Quantity
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Warehouse
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#374151",
                        width: "100px",
                      }}
                    >
                      UOM
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requestData.items?.length > 0 ? (
                    requestData.items.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom:
                            idx < requestData.items.length - 1
                              ? "1px solid #f3f4f6"
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 16px",
                            textAlign: "center",
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          {item.no || idx + 1}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <code
                            style={{
                              backgroundColor: "#f9fafb",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "0.82rem",
                              color: "#374151",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {item.itemCode || "-"}
                          </code>
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            wordBreak: "break-word",
                            color: "#111827",
                            fontWeight: 500,
                          }}
                        >
                          {item.itemName || "-"}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            color: "#374151",
                          }}
                        >
                          {formatDate(item.requiredBy)}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            textAlign: "center",
                            color: "#111827",
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            color: "#374151",
                          }}
                        >
                          {item.warehouse || "-"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              backgroundColor: "#eff6ff",
                              color: "#1d4ed8",
                              padding: "3px 10px",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                              fontWeight: 500,
                            }}
                          >
                            {item.uom || "-"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: "48px 16px",
                          color: "#9ca3af",
                        }}
                      >
                        <div style={{ marginBottom: "8px" }}>
                          <Icon
                            name="inbox"
                            style={{ fontSize: "28px", color: "#d1d5db" }}
                          />
                        </div>
                        No items found in this request
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {requestData.items?.length > 0 && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "14px 20px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.88rem", color: "#6b7280" }}>
                  Total Items: <strong style={{ color: "#111827" }}>{totalItems}</strong>
                </span>
                <span style={{ fontSize: "0.88rem", color: "#6b7280" }}>
                  Total Quantity: <strong style={{ color: "#111827" }}>{totalQuantity}</strong>
                </span>
              </div>
            )}
          </div>
        </Block>
      </Content>
    </>
  );
};

export default MaterialRequestDetails;