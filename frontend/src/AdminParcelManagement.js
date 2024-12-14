import React, { useState, useEffect } from "react";
import "./App.css"; // Import the CSS file

const AdminParcelManagement = () => {
  const [parcels, setParcels] = useState([]); // State to hold parcel data
  const [assignedRiders, setAssignedRiders] = useState({}); // State to hold rider assignments
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const parcelsPerPage = 20; // Number of parcels per page

  useEffect(() => {
    // Populate with dummy data for now
    const dummyParcels = Array.from({ length: 100 }, (_, index) => ({
      id: `P${index + 1}`,
      sender: `Sender ${index + 1}`,
      receiver: `Receiver ${index + 1}`,
      status: "Pending",
      city: ["Lahore", "Karachi", "Islamabad", "Peshawar", "Quetta"][
        Math.floor(Math.random() * 5)
      ],
      area: ["Model Town", "Gulberg", "DHA", "Johar Town", "Cantt"][
        Math.floor(Math.random() * 5)
      ],
      subArea: ["A Block", "B Block", "C Block", "D Block", "E Block"][
        Math.floor(Math.random() * 5)
      ],
      charges: Math.floor(Math.random() * (150 - 100 + 1)) + 100,
    }));
    setParcels(dummyParcels);
  }, []);

  const ridersForSubArea = {
    Lahore: {
      "Model Town": ["Rider A1", "Rider A2"],
      Gulberg: ["Rider B1", "Rider B2"],
      DHA: ["Rider C1", "Rider C2"],
      "Johar Town": ["Rider C1", "Rider C2"],
      Cantt: ["Rider C1", "Rider C2"],
    },
    Karachi: {
      "Model Town": ["Rider K1", "Rider K2"],
      Gulberg: ["Rider K3", "Rider K4"],
      DHA: ["Rider K5", "Rider K6"],
      "Johar Town": ["Rider C1", "Rider C2"],
      Cantt: ["Rider C1", "Rider C2"],
    },
    Islamabad: {
      "Model Town": ["Rider A1", "Rider A2"],
      Gulberg: ["Rider B1", "Rider B2"],
      DHA: ["Rider C1", "Rider C2"],
      "Johar Town": ["Rider C1", "Rider C2"],
      Cantt: ["Rider C1", "Rider C2"],
    },
    Peshawar: {
      "Model Town": ["Rider K1", "Rider K2"],
      Gulberg: ["Rider K3", "Rider K4"],
      DHA: ["Rider K5", "Rider K6"],
      "Johar Town": ["Rider C1", "Rider C2"],
      Cantt: ["Rider C1", "Rider C2"],
    },
    Quetta: {
      "Model Town": ["Rider K1", "Rider K2"],
      Gulberg: ["Rider K3", "Rider K4"],
      DHA: ["Rider K5", "Rider K6"],
      "Johar Town": ["Rider C1", "Rider C2"],
      Cantt: ["Rider C1", "Rider C2"],
    },
  };

  const handleAssignRider = (parcelId, rider) => {
    setAssignedRiders((prev) => ({
      ...prev,
      [parcelId]: rider,
    }));
  };

  // Calculate the parcels to display based on the current page
  const indexOfLastParcel = currentPage * parcelsPerPage;
  const indexOfFirstParcel = indexOfLastParcel - parcelsPerPage;
  const currentParcels = parcels.slice(indexOfFirstParcel, indexOfLastParcel);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate total pages
  const totalPages = Math.ceil(parcels.length / parcelsPerPage);

  // Function to save the assigned riders to a JSON file
  const saveAssignedRiders = () => {
    const data = JSON.stringify(assignedRiders, null, 2); // Convert assigned riders data to JSON format
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];
    link.download = `assigned_riders${formattedDate}.json`; // Set the file name
    link.click(); // Trigger the download
  };

  return (
    <div className="admin-parcel-management">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <h1 className="title" style={{ flex: 1 }}>
          Admin Parcel Management
        </h1>
        {/* Assign Button */}
        <div className="assign-button">
          <button onClick={saveAssignedRiders}>Assign & Save</button>
        </div>
      </div>

      <table className="parcel-table">
        <thead>
          <tr>
            <th>Parcel ID</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>City</th>
            <th>Area</th>
            <th>Sub Area</th>
            <th>Status</th>
            <th>Charges</th>
            <th>Assign Rider</th>
          </tr>
        </thead>
        <tbody>
          {currentParcels.map((parcel) => (
            <tr key={parcel.id}>
              <td>{parcel.id}</td>
              <td>{parcel.sender}</td>
              <td>{parcel.receiver}</td>
              <td>{parcel.city}</td>
              <td>{parcel.area}</td>
              <td>{parcel.subArea}</td>
              <td>{parcel.status}</td>
              <td>{parcel.charges}</td>
              <td>
                <select
                  value={assignedRiders[parcel.id] || ""}
                  onChange={(e) => handleAssignRider(parcel.id, e.target.value)}
                >
                  <option value="" disabled>
                    Select Rider
                  </option>
                  {(ridersForSubArea[parcel.city]?.[parcel.area] || []).map(
                    (rider) => (
                      <option key={rider} value={rider}>
                        {rider}
                      </option>
                    )
                  )}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {[...Array(totalPages).keys()].map((page) => (
          <button
            key={page + 1}
            onClick={() => handlePageChange(page + 1)}
            className={currentPage === page + 1 ? "active" : ""}
          >
            {page + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminParcelManagement;
