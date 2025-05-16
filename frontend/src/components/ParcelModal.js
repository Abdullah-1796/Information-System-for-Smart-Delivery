// components/ParcelModal.js
import React, { useEffect, useRef } from "react";
import "../styles/ParcelModal.css";

function ParcelModal({ parcels, onClose, title = "Parcel Details" }) {
  const modalRef = useRef(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) onClose();
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      ref={modalRef}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {parcels.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No parcels found</p>
            </div>
          ) : (
            <div className="modal-list">
              {parcels.map((parcel, index) => (
                <div key={index} className="parcel-card">
                  <div className="parcel-header">
                    <h3>
                      <span className="parcel-icon">📦</span>
                      {parcel.itemname}
                    </h3>
                    <span className={`status ${parcel.status.toLowerCase().replace(' ', '-')}`}>
                      {parcel.status}
                    </span>
                  </div>
                  
                  <div className="parcel-details-grid">
                    <div className="detail-group">
                      <span className="detail-label">Sender</span>
                      <span className="detail-value">
                        {parcel.sname} ({parcel.sphone})
                      </span>
                    </div>
                    
                    <div className="detail-group">
                      <span className="detail-label">Receiver</span>
                      <span className="detail-value">
                        {parcel.rname} ({parcel.rphone})
                      </span>
                    </div>
                    
                    <div className="detail-group full-width">
                      <span className="detail-label">Address</span>
                      <span className="detail-value">
                        {parcel.address}, {parcel.city}, {parcel.province}
                      </span>
                    </div>
                    
                    <div className="detail-group">
                      <span className="detail-label">Weight</span>
                      <span className="detail-value">{parcel.weight}g</span>
                    </div>
                    
                    {parcel.trackingNumber && (
                      <div className="detail-group full-width">
                        <span className="detail-label">Tracking #</span>
                        <span className="detail-value highlight">
                          {parcel.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {/* <button className="close-button" onClick={onClose}>
            Close
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default ParcelModal;