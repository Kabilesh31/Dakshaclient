import React from 'react';
import { Row, Col, Icon} from '../../../components/Component';
import { Spinner } from 'reactstrap';
const PlansTab = ({ 
  images, 
  uploading, 
  deletingItem, 
  onUpload, 
  onView, 
  onDelete 
}) => {
  const EmptyState = ({ text }) => (
    <div style={{ 
      padding: "24px", 
      background: "#fafafa", 
      borderRadius: "10px", 
      border: "1px dashed #ddd", 
      textAlign: "center", 
      color: "#aaa", 
      fontSize: "14px" 
    }}>
      {text}
    </div>
  );

  const ImageCard = ({ img, idx, deletingItem, onView, onDelete }) => (
    <div style={{ 
      position: "relative", 
      borderRadius: "10px", 
      overflow: "hidden", 
      cursor: "pointer" 
    }} 
    onClick={onView}
    >
      <img 
        src={img.url} 
        alt={`plan-${idx + 1}`} 
        style={{ 
          width: "100%", 
          height: "140px", 
          objectFit: "cover", 
          display: "block" 
        }} 
      />
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" 
      }} />
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onDelete(); 
        }} 
        disabled={deletingItem === img._id}
        style={{ 
          position: "absolute", 
          top: "7px", 
          right: "7px", 
          background: "rgba(220,53,69,0.9)", 
          border: "none", 
          color: "#fff", 
          borderRadius: "6px", 
          padding: "3px 8px", 
          cursor: "pointer", 
          fontSize: "13px" 
        }}
      >
        {deletingItem === img._id ? <Spinner size="sm" /> : "✕"}
      </button>
      <span style={{ 
        position: "absolute", 
        bottom: "6px", 
        left: "8px", 
        color: "#fff", 
        fontSize: "11px", 
        fontWeight: 500 
      }}>
        View
      </span>
    </div>
  );

  const UploadBtn = ({ id, label, accept, uploading, onChange }) => (
    <>
      <button
        onClick={() => document.getElementById(id).click()}
        disabled={uploading}
        style={{
          background: "#4B5694", 
          color: "#fff", 
          border: "none",
          padding: "6px 14px", 
          borderRadius: "8px", 
          fontSize: "13px", 
          fontWeight: 600,
          cursor: uploading ? "not-allowed" : "pointer", 
          opacity: uploading ? 0.6 : 1,
          display: "flex", 
          alignItems: "center", 
          gap: "6px",
        }}
      >
        {uploading ? <Spinner size="sm" style={{ color: "#fff" }} /> : <Icon name="upload" />}
        {uploading ? "Uploading..." : label}
      </button>
      <input 
        id={id} 
        type="file" 
        accept={accept} 
        multiple 
        style={{ display: "none" }} 
        onChange={onChange} 
        disabled={uploading} 
      />
    </>
  );

  return (
    <>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: "16px" 
      }}>
        <h6 style={{ 
          fontWeight: 700, 
          margin: 0, 
          color: "#1a1a2e", 
          fontSize: "15px" 
        }}>
          Site Plans
        </h6>
        <UploadBtn 
          id="planUpload" 
          label="Upload Plans" 
          accept="image/*" 
          uploading={uploading} 
          onChange={onUpload} 
        />
      </div>
      {images.length > 0 ? (
        <Row className="g-3">
          {images.map((img, idx) => (
            <Col md="3" sm="6" key={img._id || idx}>
              <ImageCard 
                img={img} 
                idx={idx} 
                deletingItem={deletingItem}
                onView={() => onView(idx)}
                onDelete={() => onDelete(img._id)}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState text="No site plans uploaded yet." />
      )}
    </>
  );
};

export default PlansTab;