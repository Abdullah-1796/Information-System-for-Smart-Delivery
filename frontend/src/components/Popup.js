import React from "react";

const Popup = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Parcel Details</h2>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Address</th>
              <th>City</th>
              <th>Weight (g)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.itemName}</td>
                <td>{item.sname} ({item.sphone})</td>
                <td>{item.rname} ({item.rphone})</td>
                <td>{item.address}</td>
                <td>{item.city}</td>
                <td>{item.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
