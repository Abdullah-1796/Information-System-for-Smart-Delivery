import React from "react";
import axios from "axios";

function ParcelDeliveryDetail()
{
    const [trackingID, setTrackingID] = React.useState("");
    const [data, setData] = React.useState([]);

    function handleTrackingID(event) {
        setTrackingID(event.target.value);
    }

    function findLockers() {
        const value = {
            trackingID: trackingID,
        }
        axios.get('http://localhost:4001/parcelToDeliverDetails', { params: value })
            .then(res => {
                console.log(res.data.rows);
                setData(res.data.rows);
            })
            .catch(err => {
                console.error("Error while fetching available lockers: " + err);
            });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", margin: "0px 100px", alignItems: "center" }}>
            <h1>Select Locker for delivery</h1>
            <div>
                <input type="text" placeholder="Enter Receiver Tracking ID" name="id" value={trackingID} onChange={handleTrackingID} />
                <button onClick={findLockers}>Find Lockers</button>
            </div>
            <div>
                <h3>Locker ID: {data.length !== 0 ? data[0].lockerid : null}</h3>
                <h3>Compartment ID: {data.length !== 0 ? data[0].compid : null}</h3>
                <h3>Address: {data.length !== 0 ? data[0].address : null}</h3>
                <h3>City: {data.length !== 0 ? data[0].city : null}</h3>
                <h3>Province: {data.length !== 0 ? data[0].province : null}</h3>
                <h3>Item Name: {data.length !== 0 ? data[0].itemname : null}</h3>
                <h3>Sender Name: {data.length !== 0 ? data[0].sname : null}</h3>
                <h3>Receiver Name: {data.length !== 0 ? data[0].rname : null}</h3>
                <h3>OTP: {data.length !== 0 ? data[0].otp : null}</h3>
            </div>
        </div>
    );
}

export default ParcelDeliveryDetail;