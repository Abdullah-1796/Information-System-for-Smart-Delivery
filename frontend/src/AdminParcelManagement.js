import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file

const AdminParcelManagement = () => {
  const [parcels, setParcels] = useState([]); // State to hold parcel data
  const [selectedParcels, setSelectedParcels] = useState([]); // State to hold selected parcels for delivery boxes

  useEffect(() => {
    // Populate with dummy data for now
    const dummyParcels = Array.from({ length: 100 }, (_, index) => ({
      id: `P${index + 1}`,
      sender: `Sender ${index + 1}`,
      receiver: `Receiver ${index + 1}`,
      status: 'Pending',
      city: "Lahore",
      Province:"Punjab",
      charges: Math.floor(Math.random() * (150 - 100 + 1)) + 100,
    }));
    setParcels(dummyParcels);
  }, []);

  const handleSelectParcel = (parcelId) => {
    setSelectedParcels((prevSelected) => {
      if (prevSelected.includes(parcelId)) {
        return prevSelected.filter((id) => id !== parcelId);
      } else {
        return [...prevSelected, parcelId];
      }
    });
  };

  const handleAssignToDeliveryBox = async () => {
    try {
      // Simulate API call
      alert(`Parcels assigned to delivery boxes: ${selectedParcels.join(', ')}`);
      setSelectedParcels([]); // Clear the selection
    } catch (error) {
      console.error('Error assigning parcels:', error);
    }
  };

  return (
    <div className="admin-parcel-management">
      <h1 className="title">Admin Parcel Management</h1>

      <table className="parcel-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Parcel ID</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Status</th>
            <th>Charges</th>
          </tr>
        </thead>
        <tbody>
          {parcels.map((parcel) => (
            <tr
              key={parcel.id}
              className={selectedParcels.includes(parcel.id) ? 'selected-row' : ''}
              onClick={() => handleSelectParcel(parcel.id)}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedParcels.includes(parcel.id)}
                  readOnly
                />
              </td>
              <td>{parcel.id}</td>
              <td>{parcel.sender}</td>
              <td>{parcel.receiver}</td>
              <td>{parcel.status}</td>
              <td>{parcel.charges}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="assign-button"
        onClick={handleAssignToDeliveryBox}
        disabled={selectedParcels.length === 0}
      >
        Assign to Delivery Box
      </button>
    </div>
  );
};

export default AdminParcelManagement;
