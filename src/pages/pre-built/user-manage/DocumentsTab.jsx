import React from 'react';
import { Icon} from '../../../components/Component';
import { Spinner } from 'reactstrap';

const DocumentsTab = ({ 
  documents, 
  uploading, 
  deletingItem, 
  onUpload, 
  onView, 
  onDelete,
  getPdfUrl 
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
          Project Documents
        </h6>
        <UploadBtn 
          id="docUpload" 
          label="Upload PDFs" 
          accept=".pdf" 
          uploading={uploading} 
          onChange={onUpload} 
        />
      </div>
      {documents.length > 0 ? (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", 
          gap: "18px" 
        }}>
          {documents.map((doc) => {
            const sizeKB = doc.size ? (doc.size / 1024).toFixed(1) : "—";
            const dateStr = doc.uploadedAt
              ? new Date(doc.uploadedAt).toLocaleDateString("en-IN", { 
                  day: "2-digit", 
                  month: "short", 
                  year: "numeric" 
                })
              : "";

            return (
              <div
                key={doc._id}
                style={{
                  background: "#f1f3f4",
                  borderRadius: "14px",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  border: "2px solid transparent",
                }}
                onClick={() => onView(doc)}
              >
                <div style={{ 
                  height: "170px", 
                  background: "#dfe3e8", 
                  position: "relative", 
                  overflow: "hidden" 
                }}>
                  <div style={{ 
                    width: "100%", 
                    height: "100%", 
                    background: "#fff", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    overflow: "hidden" 
                  }}>
                    <embed 
                      src={getPdfUrl(doc)} 
                      type="application/pdf" 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        border: "none", 
                        overflow: "hidden", 
                        pointerEvents: "none" 
                      }} 
                    />
                  </div>
                  <div style={{ 
                    position: "absolute", 
                    top: "10px", 
                    left: "10px", 
                    width: "20px", 
                    height: "20px", 
                    borderRadius: "6px", 
                    background: "#ea4335", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: "#fff", 
                    fontSize: "9px", 
                    fontWeight: 700, 
                    letterSpacing: "0.4px" 
                  }}>
                    PDF
                  </div>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onDelete(doc._id); 
                    }}
                    disabled={deletingItem === doc._id}
                    style={{ 
                      position: "absolute", 
                      top: "10px", 
                      right: "10px", 
                      width: "28px", 
                      height: "28px", 
                      borderRadius: "50%", 
                      border: "none", 
                      background: "rgba(0,0,0,0.45)", 
                      color: "#fff", 
                      cursor: "pointer", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      fontSize: "12px" 
                    }}
                  >
                    {deletingItem === doc._id ? <Spinner size="sm" /> : <Icon name="trash" />}
                  </button>
                </div>
                <div style={{ 
                  padding: "14px", 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "10px" 
                }}>
                  <div style={{ 
                    width: "38px", 
                    height: "38px", 
                    borderRadius: "50%", 
                    background: "#ea4335", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    flexShrink: 0 
                  }}>
                    <Icon name="file-pdf" style={{ color: "#fff", fontSize: "16px" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ 
                      fontSize: "14px", 
                      fontWeight: 600, 
                      color: "#202124", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      whiteSpace: "nowrap" 
                    }}>
                      {doc.originalName || doc.filename}
                    </div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#5f6368", 
                      marginTop: "3px" 
                    }}>
                      {sizeKB} KB • {dateStr}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState text="No documents uploaded yet." />
      )}
    </>
  );
};

export default DocumentsTab;