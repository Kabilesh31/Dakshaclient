// SupplierDetails.js
import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { Icon,Button } from "../../../components/Component";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const S = {
  page: { padding: "8px 0 32px" },

  /* topbar */
  topbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280", marginBottom: 5 },
  bcSep: { color: "#9ca3af", fontSize: 11 },
  pageTitle: { fontSize: 22, fontWeight: 500, color: "#111827" },
  pageSub: { fontSize: 12, color: "#9ca3af", marginTop: 3 },
  actions: { display: "flex", alignItems: "center", gap: 8 },
  btnBase: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, padding: "7px 14px", borderRadius: 8, cursor: "pointer", border: "0.5px solid #d1d5db", background: "#fff", color: "#6b7280" },
  btnEdit: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, padding: "7px 14px", borderRadius: 8, cursor: "pointer", border: "0.5px solid #534AB7", background: "#534AB7", color: "#EEEDFE" },

  /* metrics */
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 },
  metric: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px" },
  metricLbl: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 5 },
  metricVal: { fontSize: 15, fontWeight: 500, color: "#111827" },

  /* card */
  card: { background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" },
  tabNav: { display: "flex", borderBottom: "0.5px solid #e5e7eb", padding: "0 20px" },
  tab: (active) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "13px 16px", fontSize: 13, fontWeight: 500,
    color: active ? "#111827" : "#6b7280",
    cursor: "pointer", background: "none", border: "none",
    borderBottom: active ? "2px solid #534AB7" : "2px solid transparent",
    marginBottom: -1,
  }),
  tabBody: { padding: "20px" },

  /* fields */
  fieldGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px 28px" },
  fLbl: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 4 },
  fVal: { fontSize: 13, fontWeight: 500, color: "#111827" },
  fValMuted: { fontSize: 13, color: "#6b7280" },

  /* address */
  addrGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  addrBox: { background: "#f9fafb", borderRadius: 8, padding: "14px 16px" },
  addrBoxLbl: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 8 },
  addrBoxVal: { fontSize: 13, color: "#111827", lineHeight: 1.6 },

  /* contacts */
  contactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 },
  contactCard: { background: "#f9fafb", borderRadius: 8, padding: "14px 16px" },
  contactCardLbl: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 10 },
  contactRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  contactName: { fontSize: 13, fontWeight: 500, color: "#111827" },
  contactDetailRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7280", marginTop: 6 },

  divider: { height: 1, background: "#f3f4f6", margin: "18px 0" },
  commentsBox: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginTop: 8 },
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const PILLS = {
  blue:   { background: "#E6F1FB", color: "#0C447C" },
  purple: { background: "#EEEDFE", color: "#3C3489" },
  green:  { background: "#EAF3DE", color: "#27500A" },
  red:    { background: "#FCEBEB", color: "#791F1F" },
  amber:  { background: "#FAEEDA", color: "#633806" },
  neutral:{ background: "#f3f4f6", color: "#6b7280", border: "0.5px solid #e5e7eb" },
};

const Pill = ({ variant = "neutral", style = {}, children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    fontSize: 12, fontWeight: 500,
    padding: "3px 10px", borderRadius: 99,
    ...PILLS[variant], ...style,
  }}>
    {children}
  </span>
);

const StatusDot = ({ enabled }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: "#111827" }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: enabled ? "#10b981" : "#ef4444", display: "inline-block" }} />
    {enabled ? "Enabled" : "Disabled"}
  </span>
);

// Status text component (no badge/pill)
const StatusText = ({ enabled }) => (
  <span style={{
    color: enabled ? "#10b981" : "#ef4444",
    fontWeight: 600,
    fontSize: "13px"
  }}>
    {enabled ? "Enabled" : "Disabled"}
  </span>
);

const Avatar = ({ initials, color = "purple" }) => {
  const colors = {
    purple: { background: "#EEEDFE", color: "#3C3489" },
    amber:  { background: "#FAEEDA", color: "#633806" },
  };
  const s = colors[color] || colors.purple;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: s.background, color: s.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 500, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

const getInitials = (first = "", last = "") =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "—";

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const SupplierDetails = () => {
  const location = useLocation();
  const history = useHistory();
  const supplier = location.state?.supplier;
  const [activeTab, setActiveTab] = useState("details");

  /* ── No data guard ── */
  if (!supplier) {
    return (
      <Content>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon name="alert-circle" style={{ fontSize: 32, color: "#BA7517" }} />
          </div>
          <h4 style={{ marginBottom: 8, fontWeight: 500, color: "#111827" }}>Supplier not found</h4>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
            The supplier data could not be loaded. Please go back and try again.
          </p>
          <button style={S.btnBase} onClick={() => history.push("/Suppliers")}>
            ← Back to suppliers
          </button>
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

  const isEnabled = status === "Enabled";

  const tabs = [
    { key: "details", label: "Details", icon: "file-description" },
    { key: "address", label: "Address & contact", icon: "map-pin" },
  ];

  return (
    <>
      <Head title={`Supplier: ${name}`} />
      <Content>
        <div style={S.page}>

          {/* ── Top bar ── */}
          <div style={S.topbar}>
            <div>
              <div style={S.breadcrumb}>
                
                <span>Suppliers</span>
                <span style={S.bcSep}>›</span>
                <span style={{ color: "#111827" }}>{name}</span>
              </div>
              <div style={S.pageTitle}>{name}</div>
              {/* <div style={S.pageSub}>Supplier ID: #{id}</div> */}
            </div>
            <div style={S.actions}>
              
               
             
            </div>
          </div>

          {/* ── Summary metrics ── */}
          <div style={S.metricsGrid}>
            <div style={S.metric}>
              <div style={S.metricLbl}>Status</div>
              <div style={S.metricVal}>
                <StatusText enabled={isEnabled} />
              </div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLbl}>Supplier group</div>
              <div style={S.metricVal}><Pill variant="purple">{group || "—"}</Pill></div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLbl}>Supplier type</div>
              <div style={{ ...S.metricVal, fontSize: 13 }}>{supplierType || "—"}</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLbl}>Currency</div>
              <div style={S.metricVal}>{billingCurrency || "—"}</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLbl}>Price list</div>
              <div style={{ ...S.metricVal, fontSize: 13 }}>{priceList || "—"}</div>
            </div>
          </div>

          {/* ── Card ── */}
          <div style={S.card}>

            {/* Tab nav */}
            <div style={S.tabNav}>
              {tabs.map(({ key, label, icon }) => (
                <button key={key} style={S.tab(activeTab === key)} onClick={() => setActiveTab(key)}>
                  <Icon name={icon} style={{ fontSize: 15 }} />
                  {label}
                </button>
              ))}
            </div>

            {/* ── Tab: Details ── */}
            {activeTab === "details" && (
              <div style={S.tabBody}>
                <div style={S.fieldGrid}>
                  <div>
                    <div style={S.fLbl}>Supplier name</div>
                    <div style={S.fVal}>{name}</div>
                  </div>
                  <div>
                    <div style={S.fLbl}>Supplier group</div>
                    <div style={S.fVal}><Pill variant="purple">{group || "—"}</Pill></div>
                  </div>
                  <div>
                    <div style={S.fLbl}>Country</div>
                    <div style={S.fVal}>{country}</div>
                  </div>
                  <div>
                    <div style={S.fLbl}>Supplier type</div>
                    <div style={S.fVal}>{supplierType || "—"}</div>
                  </div>
                  <div>
                    <div style={S.fLbl}>Billing currency</div>
                    <div style={S.fVal}>{billingCurrency}</div>
                  </div>
                  <div>
                    <div style={S.fLbl}>Default bank account</div>
                    <div style={{ ...S.fVal, fontSize: 12 }}>{defaultBankAccount}</div>
                  </div>
                  <div>
                    <div style={S.fLbl}>Price list</div>
                    <div style={S.fVal}>{priceList}</div>
                  </div>
                  <div>
                    <div style={S.fLbl}>Status</div>
                    <div style={S.fVal}>
                      <StatusText enabled={isEnabled} />
                    </div>
                  </div>
                  <div>
                    <div style={S.fLbl}>GST number</div>
                    <div style={S.fValMuted}>{gstNumber || "—"}</div>
                  </div>
                  <div>
                    <div style={S.fLbl}>GST category</div>
                    <div style={S.fVal}><Pill variant="blue">{gstCategory || "—"}</Pill></div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Address & Contact ── */}
            {activeTab === "address" && (
              <div style={S.tabBody}>

                {/* Addresses */}
                <div style={S.addrGrid}>
                  <div style={S.addrBox}>
                    <div style={S.addrBoxLbl}>
                      <Icon name="building" style={{ fontSize: 13, verticalAlign: -1, marginRight: 4 }} />
                      Billing address
                    </div>
                    <div style={S.addrBoxVal}>{address?.billing || "—"}</div>
                  </div>
                  <div style={S.addrBox}>
                    <div style={S.addrBoxLbl}>
                      <Icon name="truck-delivery" style={{ fontSize: 13, verticalAlign: -1, marginRight: 4 }} />
                      Shipping address
                    </div>
                    <div style={S.addrBoxVal}>{address?.shipping || "—"}</div>
                  </div>
                </div>

                {/* Contacts */}
                <div style={S.contactGrid}>
                  {/* Primary */}
                  <div style={S.contactCard}>
                    <div style={S.contactCardLbl}>Primary contact</div>
                    <div style={S.contactRow}>
                      <Avatar
                        initials={getInitials(contact?.firstName, contact?.lastName)}
                        color="purple"
                      />
                      <div>
                        <div style={S.contactName}>
                          {`${contact?.firstName || ""} ${contact?.lastName || ""}`.trim() || "—"}
                        </div>
                        <Pill variant="blue" style={{ fontSize: 11, padding: "1px 8px", marginTop: 3 }}>
                          Primary
                        </Pill>
                      </div>
                    </div>
                    <div style={S.contactDetailRow}>
                      <Icon name="mail" style={{ fontSize: 14 }} />
                      {contact?.email || "—"}
                    </div>
                    <div style={S.contactDetailRow}>
                      <Icon name="phone" style={{ fontSize: 14 }} />
                      {contact?.mobile || "—"}
                    </div>
                  </div>

                  {/* Secondary */}
                  <div style={S.contactCard}>
                    <div style={S.contactCardLbl}>Secondary contact</div>
                    <div style={S.contactRow}>
                      <Avatar
                        initials={getInitials(secondaryContact?.firstName, secondaryContact?.lastName)}
                        color="amber"
                      />
                      <div>
                        <div style={S.contactName}>
                          {`${secondaryContact?.firstName || ""} ${secondaryContact?.lastName || ""}`.trim() || "—"}
                        </div>
                        <Pill variant="amber" style={{ fontSize: 11, padding: "1px 8px", marginTop: 3 }}>
                          Secondary
                        </Pill>
                      </div>
                    </div>
                    <div style={S.contactDetailRow}>
                      <Icon name="mail" style={{ fontSize: 14 }} />
                      {secondaryContact?.email || "—"}
                    </div>
                    <div style={S.contactDetailRow}>
                      <Icon name="phone" style={{ fontSize: 14 }} />
                      {secondaryContact?.mobile || "—"}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div style={{ ...S.fLbl, marginTop: 18, marginBottom: 4 }}>Comments</div>
                <div style={S.commentsBox}>{comments || "No comments added."}</div>

              </div>
            )}

          </div>
        </div>
      </Content>
    </>
  );
};

export default SupplierDetails;