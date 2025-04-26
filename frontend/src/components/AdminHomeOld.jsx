import React, { useState } from "react";
import axios from "axios";
import "../styles/AdminHomeOld.css";

const AdminHomeOld = () => {
  const [data, setData] = useState([
    {
      id: 1,
      itemName: "AKG Handfree",
      sname: "Mario",
      sphone: "03000000000",
      semail: "stest1@gmail.com",
      rname: "John William",
      rphone: "+923227888444",
      remail: "rtest1@gmail.com",
      address: "Faisal Town A Block",
      city: "Lahore",
      province: "Punjab",
      weight: 20,
      selected: true,
    },
    {
      id: 2,
      itemName: "Leather wallet",
      sname: "Daraz",
      sphone: "03000000000",
      semail: "stest1@gmail.com",
      rname: "Michal",
      rphone: "+923227888444",
      remail: "rtest2@gmail.com",
      address: "Faisal Town A Block",
      city: "Lahore",
      province: "Punjab",
      weight: 100,
      selected: true,
    },
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [parcels, setParcels] = useState([]); // State to store fetched parcels
  const [loading, setLoading] = useState(false); // State to handle loading state
  const [error, setError] = useState(null); // State to handle errors
  const [showtable,setShowtable] = useState(false);
  const [status, setStatus] = useState("pending");
  function handleCheckboxChange(index) {
    const updatedData = [...data];
    updatedData[index].selected = !updatedData[index].selected;
    setData(updatedData);
  }

  function postUpdates() {
    setParcels(""); // Update state with fetched data
        setShowtable(false); // Show the table
    setShowPopup(true);
  }

  function confirmPostUpdates() {
    const selectedData = data.filter((item) => item.selected);
    if (selectedData.length === 0) {
      alert("No records selected for posting!");
      return;
    }

    axios
      .post("http://localhost:4001/postUpdates", selectedData)
      .then((res) => {
        console.log(res.data.message);
        if (res.status === 200) {
          alert(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    setShowPopup(false);
  }

  function getUpdates() {
    setParcels(""); // Update state with fetched data
        setShowtable(false); // Show the table
    axios
      .get("http://localhost:4001/getUpdates")
      .then((res) => {
        console.log(res.data);

        if (res.status === 200) {
          const fetchedData = res.data.rows || []; // Extract 'rows' from response

          if (fetchedData.length === 0) {
            alert("No updates available.");
            return;
          }
          setParcels(fetchedData); // Update state with fetched data
          setShowtable(true); // Show the table
          // Format data properly for confirmation popup
          const formattedData = fetchedData
            .map(
              (item, index) =>
                `${index + 1}. ${item.itemname} - ${item.city} (${
                  item.status
                })\nReceiver: ${item.rname}, ${item.rphone}`
            )
            .join("\n\n");

          // // Show formatted data in confirm box
          // if (
          //   window.confirm(
          //     `Fetched ${fetchedData.length} row(s):\n\n${formattedData}\n\nDo you want to proceed?`
          //   )
          // ) {
          //   // alert("User confirmed!");
          // } else {
          //   // alert("User canceled!");
          // }
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Error fetching updates!");
      });
  }

  function markFailDeliveries() {
    setParcels(""); // Update state with fetched data
    setShowtable(false); // Show the table
    const days = prompt(
      "Enter number of days, the parcel has not been picked up:"
    );
    if (
      days &&
      window.confirm(
        `Mark parcels as failed deliveries if not picked up in ${days} days?`
      )
    ) {
      const values = { days: days };
      axios
        .put("http://localhost:4001/markFailDeliveries", values)
        .then((res) => {
          console.log(res.data);
          if (res.status === 200) {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  // Function to fetch pending parcels
  const getPendingParcels = async () => {
    setLoading(true); // Set loading to true
    setError(null); // Reset any previous errors
    setStatus("Pending");
    try {
      // Call the API using Axios
      const response = await axios.get("http://localhost:4001/getPendingParcels");

      if (response.data.success) {
        setParcels(response.data.data); // Update state with fetched data
        setShowtable(true); // Show the table
        console.log("Data is:", response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching pending parcels:", error);
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const getPlacedParcels = async () => {
    setLoading(true); // Set loading to true
    setError(null); // Reset any previous errors
    setStatus("Placed");
    try {
      // Call the API using Axios
      const response = await axios.get("http://localhost:4001/getPlacedParcels");

      if (response.data.success) {
        setParcels(response.data.data); // Update state with fetched data
        setShowtable(true); // Show the table
        // console.log("Data is:", response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching Selection Done parcels:", error);
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const getDeliveredParcels = async () => {
    setLoading(true); // Set loading to true
    setError(null); // Reset any previous errors
    setStatus("Delivered Parcels");
    try {
      // Call the API using Axios
      const response = await axios.get("http://localhost:4001/getDeliveredParcels");

      if (response.data.success) {
        setParcels(response.data.data); // Update state with fetched data
        setShowtable(true); // Show the table
        // console.log("Data is:", response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching Delivered parcels:", error);
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Set loading to false
    }
  };
  return (
    <div id="adminHomeBody">
      <h1 style={{position:"fixed",top:50}}>Admin Home Page</h1>
      <div id="adminHomeButtonView" style={{ display: "flex" }}>
        <button onClick={postUpdates} className="adminButton">
          Post Parcels
        </button>
        <button onClick={getUpdates} className="adminButton">
          Get Updated Parcels
        </button>
        <button onClick={markFailDeliveries} className="adminButton">
          Mark Fail Deliveries
        </button>
        <button onClick={getPendingParcels} className="adminButton">
          Get Pending Parcels
        </button>
        <button onClick={getPlacedParcels} className="adminButton">
          Placed in Box
        </button>
        <button onClick={getDeliveredParcels} className="adminButton">
          Parcels Delivered
        </button>
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Confirm Data Submission</h2>
            <table>
              <thead>
                <tr>
                  <th>Select</th>
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
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleCheckboxChange(index)}
                      />
                    </td>
                    <td>{item.itemName}</td>
                    <td>
                      {item.sname} ({item.sphone})
                    </td>
                    <td>
                      {item.rname} ({item.rphone})
                    </td>
                    <td>{item.address}</td>
                    <td>{item.city}</td>
                    <td>{item.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="popup-buttons">
              <button onClick={confirmPostUpdates} className="submit-btn">
                OK
              </button>
              <button onClick={() => setShowPopup(false)} className="close-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showtable&&<div>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {parcels.length > 0 && (
          <table border="1" cellPadding="10" cellSpacing="0" >
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>Item Name</th>
                <th>Sender Name</th>
                <th>Sender Phone</th>
                <th>Sender Email</th>
                <th>Receiver Name</th>
                <th>Receiver Phone</th>
                <th>Receiver Email</th>
                <th>Address</th>
                <th>City</th>
                <th>Province</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel) => (
                <tr key={parcel.parcelid}>
                  <td>{parcel.parcelid}</td>
                  <td>{parcel.itemname}</td>
                  <td>{parcel.sname}</td>
                  <td>{parcel.sphone}</td>
                  <td>{parcel.semail}</td>
                  <td>{parcel.rname}</td>
                  <td>{parcel.rphone}</td>
                  <td>{parcel.remail}</td>
                  <td>{parcel.address}</td>
                  <td>{parcel.city}</td>
                  <td>{parcel.province}</td>
                  <td>{parcel.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {parcels.length === 0 && !loading && !error && (
          <p>No {status} parcels found.</p>
        )}
      </div>}
    </div>
  );
};

export default AdminHomeOld;
