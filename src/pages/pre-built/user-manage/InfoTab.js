import React from 'react'
import { Col, Icon, Row } from '../../../components/Component';


const InfoBox = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "3px" }}>{label}</div>
    <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "15px" }}>{value}</div>
  </div>
);

const InfoTab = ({ site }) => {
  const STATUS_CONFIG = {
    active:    { text: "Active",    bg: "#06c96a" },
    inactive:  { text: "Completed", bg: "#dc3545" },
    onhold:    { text: "On Hold",   bg: "#f59e0b" },
    cancelled: { text: "Cancelled", bg: "#6c757d" },
  };
  const BRAND = "#4B5694";
  
  const formatDate = (d) => {
    if (!d) return "N/A";
    const [y, m, day] = d.split("-");
    return y && m && day ? `${day}-${m}-${y}` : d;
  };
  
  const sc = STATUS_CONFIG[site.status] || STATUS_CONFIG.active;
  
  return (
    <>
      <Row className="g-4 mb-2">
        <Col lg="5">
          <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
            <img 
              src={site.image} 
              alt={site.name}
              style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
              onError={(e) => { 
                e.target.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop"; 
              }}
            />
            <span style={{ 
              position: "absolute", top: "14px", right: "14px", 
              background: sc.bg + "22", color: sc.bg, 
              border: `1px solid ${sc.bg}55`, 
              padding: "4px 14px", borderRadius: "20px", 
              fontSize: "12px", fontWeight: 700, letterSpacing: "0.3px" 
            }}>
              {sc.text}
            </span>
          </div>
        </Col>
        <Col lg="7">
          <div style={{ paddingLeft: "8px" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "6px" }}>{site.name}</h4>
            <p className="text-muted mb-1">
              <Icon name="map-pin" className="me-1" />
              {site.location}
            </p>
            <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
              <Icon name="hash" className="me-1" />
              Project ID: {site.projectId}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: "16px" }}>
              <InfoBox label="Start Date" value={formatDate(site.startDate)} />
              <InfoBox label="Project Value" value={site.projectValue || "N/A"} />
              {site.budget > 0 && <InfoBox label="Budget" value={`₹${site.budget.toLocaleString()}`} />}
            </div>
            {site.description && (
              <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#555", lineHeight: 1.6 }}>
                  {site.description}
                </p>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Progress */}
      {site.status === "active" && site.completion !== undefined && (
        <>
          <div style={{ margin: "32px 0 16px" }}>
            <h6 style={{ fontWeight: 700, margin: 0, color: "#1a1a2e", fontSize: "15px", letterSpacing: "0.2px" }}>
              Project Completion
            </h6>
          </div>
          <div className="d-flex justify-content-between small mb-1">
            <span>Progress</span>
            <strong style={{ color: BRAND }}>{site.completion}%</strong>
          </div>
          <div style={{ height: "8px", background: "#f0ece9", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ 
              height: "100%", 
              width: `${site.completion}%`, 
              background: `linear-gradient(90deg, ${BRAND}, #a0674a)`, 
              borderRadius: "10px" 
            }} />
          </div>
        </>
      )}
    </>
  );
};

export default InfoTab;