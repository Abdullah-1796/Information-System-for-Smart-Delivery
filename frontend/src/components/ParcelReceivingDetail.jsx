import React from "react";
import axios from "axios";
import "../styles/ParcelDeliveryDetail.css";
import UserFloatingTray from "./UserFloatingTray";
import CustomerCareButton from "./CustomerCareButton";

function ParcelReceivingDetail() {
    const [trackingID, setTrackingID] = React.useState("");
    const [data, setData] = React.useState([]);

    function handleTrackingID(event) {
        setTrackingID(event.target.value);
    }

    function findDetails() {
        const value = {
            trackingID: trackingID,
        }
        axios.get('http://localhost:4001/parcelToReceive/Details', { params: value })
            .then(res => {
                console.log(res.data.rows);
                setData(res.data.rows);
            })
            .catch(err => {
                console.error("Error while fetching available lockers: " + err);
            });
    }

    return (
        <div id="delivery-detail-container">
            <UserFloatingTray />
            <CustomerCareButton />
            <h1>Smart Delivery</h1>
            <div id="delivery-detail">
                <div id="trackingID-input">
                    <input type="text" placeholder="Enter Rider Tracking ID" name="id" value={trackingID} onChange={handleTrackingID} />
                    <div id="button" onClick={findDetails}>Find Details</div>
                </div>
                <h1>Details of parcel for smart delivery</h1>
                <div id="detail-list">
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
        </div>
    );
}

export default ParcelReceivingDetail;