// BuyingDetails.js
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
import { Spinner } from "reactstrap";

const API_BASE_URL = `${process.env.REACT_APP_BACKENDURL}/api`;

/* ─── inline styles ─────────────────────────────────────────────────────── */
const styles = {
  /* breadcrumb */
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  breadcrumbSep: { color: "#9ca3af", fontSize: 11 },
  breadcrumbCurrent: { color: "#111827" },

  /* page title */
  itemTitle: { fontSize: 22, fontWeight: 500, color: "#111827" },
  itemSub: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  /* back button */
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "#6b7280",
    border: "0.5px solid #d1d5db",
    background: "#fff",
    borderRadius: 8,
    padding: "7px 14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  /* summary metric cards */
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 10,
    marginBottom: 20,
  },
  metric: {
    background: "#f9fafb",
    borderRadius: 8,
    padding: "14px 16px",
  },
  metricLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#9ca3af",
    marginBottom: 6,
  },
  metricValue: { fontSize: 15, fontWeight: 500, color: "#111827" },

  /* card */
  card: {
    background: "#fff",
    border: "0.5px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },

  /* tab nav */
  tabNav: {
    display: "flex",
    borderBottom: "0.5px solid #e5e7eb",
    padding: "0 20px",
  },
  tab: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "14px 16px",
    fontSize: 13,
    fontWeight: 500,
    color: active ? "#111827" : "#6b7280",
    cursor: "pointer",
    borderBottom: active ? "2px solid #534AB7" : "2px solid transparent",
    marginBottom: -1,
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #534AB7" : "2px solid transparent",
  }),

  /* tab body */
  tabBody: { padding: "24px 20px" },

  /* field grid */
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px 32px",
  },
  fieldLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#9ca3af",
    marginBottom: 5,
  },
  fieldValue: { fontSize: 14, fontWeight: 500, color: "#111827" },
  fieldValueMuted: { fontSize: 14, fontWeight: 400, color: "#6b7280" },

  divider: { height: 1, background: "#f3f4f6", margin: "20px 0" },

  /* boolean grid */
  boolRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 10,
  },
  boolItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    background: "#f9fafb",
    borderRadius: 8,
  },
  boolLabel: { fontSize: 13, color: "#6b7280" },

  /* comments */
  commentsBox: {
    background: "#f9fafb",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.6,
    marginTop: 8,
  },
};

/* ─── badge helper ───────────────────────────────────────────────────────── */
const BADGE = {
  success: { background: "#EAF3DE", color: "#3B6D11" },
  danger:  { background: "#FCEBEB", color: "#A32D2D" },
  info:    { background: "#E6F1FB", color: "#185FA5" },
  purple:  { background: "#EEEDFE", color: "#3C3489" },
  neutral: { background: "#f3f4f6", color: "#6b7280", border: "0.5px solid #e5e7eb" },
};

const Badge = ({ variant = "neutral", children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      fontSize: 12,
      fontWeight: 500,
      padding: "3px 10px",
      borderRadius: 99,
      ...BADGE[variant],
    }}
  >
    {children}
  </span>
);

/* ─── status dot ─────────────────────────────────────────────────────────── */
const StatusDot = ({ enabled }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500 }}>
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: enabled ? "#639922" : "#E24B4A",
        display: "inline-block",
      }}
    />
    {enabled ? "Enabled" : "Disabled"}
  </span>
);

/* ─── boolean field ──────────────────────────────────────────────────────── */
const BoolField = ({ label, value }) => (
  <div style={styles.boolItem}>
    <span style={styles.boolLabel}>{label}</span>
    <Badge variant={value ? "success" : "neutral"}>{value ? "Yes" : "No"}</Badge>
  </div>
);

/* ─── main component ─────────────────────────────────────────────────────── */
const BuyingDetails = () => {
  const location = useLocation();
  const history = useHistory();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemData = async () => {
      if (location.state?.item) {
        setItem(location.state.item);
        setLoading(false);
        return;
      }

      const stored = sessionStorage.getItem("selectedItem");
      if (stored) {
        setItem(JSON.parse(stored));
        sessionStorage.removeItem("selectedItem");
        setLoading(false);
        return;
      }

      if (id) {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/items/${id}`);
          const data = await response.json();
          setItem(data.success ? data.data : null);
        } catch (error) {
          console.error("Error fetching item:", error);
          setItem(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchItemData();
  }, [location, id]);

  /* ── loading ── */
  if (loading) {
    return (
      <Content>
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2" style={{ color: "#6b7280", fontSize: 14 }}>
            Loading item details…
          </p>
        </div>
      </Content>
    );
  }

  /* ── not found ── */
  if (!item) {
    return (
      <Content>
        <div className="text-center py-5">
          <h4 style={{ marginBottom: 12 }}>Item not found</h4>
          <Button color="primary" onClick={() => history.push("/Buying")}>
            Go back to items
          </Button>
        </div>
      </Content>
    );
  }

  const {
    name,
    _id,
    id: itemId,
    status,
    group,
    itemCode,
    hsnSac,
    unitMeasure,
    maintainStock,
    isFixedAsset,
    nilRatedExempted = false,
    nonGst = false,
    disabled = false,
    allowAlternativeItem = false,
    hasVariants = false,
    valuationRate = "",
    comments = "",
  } = item;

  const displayId = _id || itemId;
  const isEnabled = status === "Enabled";

  const tabs = [
    { key: "details",    label: "Item details" },
    { key: "stock",      label: "Stock & asset" },
    { key: "additional", label: "Additional info" },
  ];

  return (
    <>
      <Head title={`Item: ${name}`} />
      <Content>
        <div style={{ padding: "8px 0 24px" }}>

          {/* ── top bar ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={styles.breadcrumb}>
                <span>Buying</span>
                <span style={styles.breadcrumbSep}>›</span>
                <span>Items</span>
                <span style={styles.breadcrumbSep}>›</span>
                <span style={styles.breadcrumbCurrent}>{name}</span>
              </div>
              <div style={styles.itemTitle}>{name}</div>
              <div style={styles.itemSub}>Item ID: #{displayId}</div>
            </div>

                
            <Button
                            color="dark"
                            size="sm"
                            className="mb-2"
                            onClick={() => history.push("/Buying")}>
                            <Icon name="arrow-left" /> Back
                          </Button>
          </div>

          {/* ── summary metrics ── */}
          <div style={styles.summaryRow}>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Status</div>
              <div style={styles.metricValue}>
                <StatusDot enabled={isEnabled} />
              </div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Item group</div>
              <div style={styles.metricValue}>
                <Badge variant="purple">{group || "—"}</Badge>
              </div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Unit of measure</div>
              <div style={styles.metricValue}>{unitMeasure || "—"}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Valuation rate</div>
              <div style={styles.metricValue}>
                {valuationRate ? `₹ ${Number(valuationRate).toLocaleString("en-IN")}` : "—"}
              </div>
            </div>
          </div>

          {/* ── card ── */}
          <div style={styles.card}>

            {/* tab nav */}
            <div style={styles.tabNav}>
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  style={styles.tab(activeTab === key)}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── tab: item details ── */}
            {activeTab === "details" && (
              <div style={styles.tabBody}>
                <div style={styles.fieldGrid}>
                  <div>
                    <div style={styles.fieldLabel}>Item name</div>
                    <div style={styles.fieldValue}>{name}</div>
                  </div>
                  <div>
                    <div style={styles.fieldLabel}>Item code</div>
                    <div style={styles.fieldValue}>{itemCode || "—"}</div>
                  </div>
                  <div>
                    <div style={styles.fieldLabel}>HSN / SAC code</div>
                    <div style={styles.fieldValue}>{hsnSac || "—"}</div>
                  </div>
                  <div>
                    <div style={styles.fieldLabel}>Default unit of measure</div>
                    <div style={styles.fieldValue}>{unitMeasure || "—"}</div>
                  </div>
                  <div>
                    <div style={styles.fieldLabel}>Item group</div>
                    <div style={styles.fieldValue}>
                      <Badge variant="purple">{group || "—"}</Badge>
                    </div>
                  </div>
                  <div>
                    <div style={styles.fieldLabel}>Status</div>
                    <div style={styles.fieldValue}>
                      <Badge variant={isEnabled ? "success" : "danger"}>{status}</Badge>
                    </div>
                  </div>
                  <div>
                    <div style={styles.fieldLabel}>Item ID</div>
                    <div style={styles.fieldValueMuted}>#{displayId}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── tab: stock & asset ── */}
            {activeTab === "stock" && (
              <div style={styles.tabBody}>
                <div style={styles.boolRow}>
                  <BoolField label="Maintain stock"  value={maintainStock} />
                  <BoolField label="Is fixed asset"  value={isFixedAsset} />
                </div>
              </div>
            )}

            {/* ── tab: additional info ── */}
            {activeTab === "additional" && (
              <div style={styles.tabBody}>
                <div style={styles.boolRow}>
                  <BoolField label="Nil rated / Exempted"   value={nilRatedExempted} />
                  <BoolField label="Non-GST"                value={nonGst} />
                  <BoolField label="Disabled"               value={disabled} />
                  <BoolField label="Allow alternative item" value={allowAlternativeItem} />
                  <BoolField label="Has variants"           value={hasVariants} />
                </div>

                <div style={styles.divider} />

                <div>
                  <div style={styles.fieldLabel}>Valuation rate</div>
                  <div style={{ ...styles.fieldValue, marginBottom: 16 }}>
                    {valuationRate
                      ? `₹ ${Number(valuationRate).toLocaleString("en-IN")}`
                      : "—"}
                  </div>
                </div>

                <div>
                  <div style={styles.fieldLabel}>Comments</div>
                  <div style={styles.commentsBox}>{comments || "No comments added."}</div>
                </div>
              </div>
            )}

          </div>
        </div>
      </Content>
    </>
  );
};

export default BuyingDetails;