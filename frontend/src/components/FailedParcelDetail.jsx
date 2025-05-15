import React from "react";
import axios from "axios";

function FailedParcelDetail() {
    const [trackingID, setTrackingID] = React.useState("");
    const [data, setData] = React.useState([]);

    function handleTrackingID(event) {
        setTrackingID(event.target.value);
    }

    function findDetails() {
        const value = { trackingID };
        axios.get('http://localhost:4001/failedDelivery/ParcelToBring/Details', { params: value })
            .then(res => {
                setData(res.data.rows);
            })
            .catch(err => {
                console.error("Error while fetching parcel details: " + err);
                setData([]); // reset data on error
            });
    }

    // Fallback values if no data
    const parcel = data[0] || {
        lockerid: "",
        compid: "",
        address: "",
        city: "",
        province: "",
        itemname: "",
        sname: "",
        rname: "",
        otp: "",
    };

    return (
        <div id="delivery-detail-container">
            <h1>Details of parcel for smart delivery</h1>

            <div id="trackingID-input">
                <input
                    type="text"
                    placeholder="Enter Rider Tracking ID"
                    name="id"
                    value={trackingID}
                    onChange={handleTrackingID}
                />
                <div id="button" onClick={findDetails}>Find Details</div>
            </div>

            <div id="delivery-detail">
                <h1>Parcel Information</h1>
                <div id="detail-list">
                    <h3>Locker ID: {parcel.lockerid}</h3>
                    <h3>Compartment ID: {parcel.compid}</h3>
                    <h3>Address: {parcel.address}</h3>
                    <h3>City: {parcel.city}</h3>
                    <h3>Province: {parcel.province}</h3>
                    <h3>Item Name: {parcel.itemname}</h3>
                    <h3>Sender Name: {parcel.sname}</h3>
                    <h3>Receiver Name: {parcel.rname}</h3>
                    <h3>OTP: {parcel.otp}</h3>
                </div>
            </div>
        </div>
    );
}

export default FailedParcelDetail;
