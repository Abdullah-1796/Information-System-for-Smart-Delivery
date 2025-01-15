import React, { useState, useEffect } from "react";
import axios from "axios";
// import { GoogleMap, LoadScript, Marker, useJsApiLoader } from "@react-google-maps/api";

const SelectCompartment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [parcelTrackingID, setParcelTrackingID] = useState("");
  const [selectedCompartment, setSelectedCompartment] = useState(null);
  const [deliveryBoxes, setDeliveryBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parcelDetail, setParcelDetail] = useState({
    "parcelid": 3,
    "itemname": "AKG Handfree",
    "sname": "Mario",
    "sphone": "03000000000",
    "semail": "stest1@gmail.com",
    "rname": "John William",
    "rphone": "03110000000",
    "remail": "rtest1@gmail.com",
    "dimensionid": "small",
    "receivertrackingid": "123456",
    "ridertrackingid": "123456",
    "lockerid": null,
    "creationtime": "2024-12-18T07:32:17.877Z"
  });
  
  useEffect(() => {
    axios
      .get("http://localhost:4001/api/delivery-boxes")
      .then((response) => {
        setDeliveryBoxes(response.data.deliveryBoxes);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching delivery boxes:", error);
        setLoading(false);
      });
  }, []);

  const getParceldetail = () => {
    if (!parcelTrackingID) {
      alert("Please enter a parcel ID");
      return;
    }

    setLoading(true);

    axios
      .get(`http://localhost:4001/api/parcel/${parcelTrackingID}`)
      .then((response) => {
        setParcelDetail(response.data);
        setLoading(false);
      })
      .catch((err) => {
        alert("No parcel with the ID ");
        setParcelDetail("");
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <button onClick={() => console.log("Go back")}>&larr; Back</button>
        <h2>Select a Delivery Compartment</h2>
        {parcelDetail && (
          <h3>
            ParcelID: {parcelDetail.parcelid} is {parcelDetail.dimensionid}
          </h3>
        )}
        <button onClick={() => console.log("Help")}>?</button>
      </div>

      <div style={{ display: "flex", flexDirection: "row" }}>
        <input
          type="text"
          placeholder="Enter Tracking ID of the Parcel"
          value={parcelTrackingID}
          onChange={(e) => setParcelTrackingID(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={getParceldetail}
          style={{
            padding: "8px",
            marginBottom: "16px",
            marginLeft: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          Search
        </button>
      </div>

      {/* Google Map Section */}
        <div
        style={{
          height: "300px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "16px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <p style={{ textAlign: "center", paddingTop: "140px" }}>
          Map Placeholder
        </p>
      </div>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for a location or compartment"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "16px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      {/* Loading State */}
      {loading && <p>Loading delivery boxes...</p>}

      {/* Delivery Boxes and Compartments */}
      {!loading &&
        deliveryBoxes
          .filter((box) =>
            box.location?.address
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            box.compartments.some(
              (compartment) =>
                compartment.size === parcelDetail.dimensionid &&
                compartment.status === "available" &&
                compartment.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
          .map((box) => (
            <div
              key={box.id}
              style={{
                marginBottom: "16px",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3>{box.location.address}</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                Latitude: {box.location.latitude}, Longitude: {box.location.longitude}
              </p>
              <h4>Compartments:</h4>
              <div>
                {box.compartments
                  .filter(
                    (compartment) =>
                      compartment.size === parcelDetail.dimensionid &&
                      compartment.status === "available" &&
                      (!searchQuery ||
                        compartment.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((compartment) => (
                    <div
                      key={compartment.id}
                      style={{
                        padding: "12px",
                        marginBottom: "8px",
                        border: "1px solid",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor:
                          selectedCompartment?.id === compartment.id
                            ? "#e0f7fa"
                            : "#fff",
                        borderColor:
                          selectedCompartment?.id === compartment.id
                            ? "#00796b"
                            : "#ccc",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedCompartment(compartment)}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            backgroundColor: "#4caf50",
                            marginRight: "8px",
                          }}
                        ></div>
                        <div>
                          <strong>Compartment {compartment.name}</strong>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#666",
                            }}
                          >
                            Size: {compartment.size} | Status:{" "}
                            {compartment.status} | Door:{" "}
                            {compartment.doorStatus}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      <button
        onClick={() => alert("Compartment selected")}
        disabled={!selectedCompartment}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: selectedCompartment ? "#00796b" : "#ccc",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: selectedCompartment ? "pointer" : "not-allowed",
        }}
      >
        Confirm Selection
      </button>
    </div>
  );
};

export default SelectCompartment;
