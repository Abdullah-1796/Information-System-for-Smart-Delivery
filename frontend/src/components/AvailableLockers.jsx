import React, { useState, useEffect } from "react";
import axios from "axios";

function AvailableLockers({ city, parcelDetails, onLockerSelect }) {
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState("");
  const [compId,setCompId]=useState();
  const [compcategoryid,setCompCategory]=useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAvailableLockers = async () => {
      if (!city||!compcategoryid){ 
        alert("Select City and Weight of the parcel to get the available delivery boxes.")
        return;
      } // Prevent unnecessary API calls
      console.log("detail is ",compcategoryid," ",city);
      
      setLoading("loading");
      try {
        const response = await axios.get(`http://localhost:4001/getlockers?city=${city}&compcategoryid=${compcategoryid}`);
        console.log("API Response:", response.data); // Debugging
        if (!Array.isArray(response.data.data)) {
          throw new Error("Invalid response format");
        }
        if (response.data.data.length === 0) {
          alert("Sorry, this option is not available in your location. Please try another city.");
        }
        setLockers(response.data.data); // Correct access to `data`
        setError(""); 
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch lockers");
        setLockers([]); // Ensure lockers is always an array
      } finally {
        setLoading("selected");
      }
    };

    if(compcategoryid!==""){
      console.log("weight is ",parcelDetails.parcelWeight);
      fetchAvailableLockers();
    }
  }, [compcategoryid]);
  useEffect(()=>{
    setCompCategory(parcelDetails.parcelWeight === "small" ? 1 : parcelDetails.parcelWeight === "medium" ? 2 : "large"?3:"");
  },[parcelDetails.parcelWeight]);

  const handleLockerSelection = async (lockerId,compId) => {
    setSelectedLocker(lockerId);
    onLockerSelect(lockerId,compId); // Notify parent component
    setLockers([]);
    setLoading("selected");
    console.log("lockers are ",lockers);
  };
  useEffect(() => {
    console.log("Updated lockers state:", lockers);
  }, [lockers,loading]); // Runs when lockers state changes
  
  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "0px 100px", alignItems: "center" }}>
      <h3>Available Lockers</h3>

      {loading &&loading==='loading'&& <p>Loading lockers...</p>}
      {loading&&loading==='selected'&&<p>Locker selected</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading==="" && lockers.length === 0 && <p>No lockers available in {city}</p>}

      <div>
        {lockers.map((d, i) => (
          <div
            key={d.lockerid} // Unique key added
            style={{
              border: "1px solid black",
              backgroundColor: "lightblue",
              margin: "10px",
              borderRadius: "25px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              width: "500px",
              cursor: "pointer",
              transition: "all 0.3s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "dodgerblue";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "lightblue";
              e.target.style.transform = "scale(1)";
            }}
            onClick={() => handleLockerSelection(d.lockerid,d.compid)}
          >
            <h2>{d.address + " " + (i + 1)}</h2>
            <h3>{d.city}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AvailableLockers;