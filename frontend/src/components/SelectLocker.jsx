import React from "react";
import axios from "axios";
import "../styles/SelectLocker.css";
import UserFloatingTray from "./UserFloatingTray";
import CustomerCareButton from "./CustomerCareButton";

function SelectLocker() {
    const [trackingID, setTrackingID] = React.useState("");
    const [data, setData] = React.useState([]);

    function handleTrackingID(event) {
        setTrackingID(event.target.value);
    }

    function reserveLocker(lockerID, compCategoryID, parcelID) {
        console.log(lockerID);
        const value = {
            lockerID: lockerID,
            compCategoryID: compCategoryID,
            trackingID: trackingID,
            parcelID: parcelID
        }
        axios.post('http://localhost:4001/reserveLocker', value)
            .then(res => {
                //console.log(res.data);
                if (res.status == 200) {
                    alert("Locker Successfully Reserved");
                    setData([]);
                    setTrackingID([]);
                }
                else {
                    alert(res.data);
                }
            })
            .catch(err => {
                console.error("Error while reserving available lockers: " + err);
            });
    }

    function findLockers() {
        const value = {
            trackingID: trackingID,
        }
        axios.get('http://localhost:4001/checkEligibility/Delivery', { params: value })
            .then(res => {
                if (res.status == 200 && res.data.eligible) {

                    axios.get('http://localhost:4001/availableLockers', { params: value })
                        .then(res => {
                            console.log(res.data.rows);
                            setData(res.data.rows);
                        })
                        .catch(err => {
                            console.error("Error while fetching available lockers: " + err);
                        });
                }
                else {
                    alert("Not eligible to make scheduling event!");
                }
            })
            .catch(err => {
                console.log("Error while checking for eligibility: " + err);
            });
    }

    function openMaps(destination) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        window.open(url, '_blank');
    }
    return (
        <div id="select-locker-container">
            <UserFloatingTray />
            <CustomerCareButton />
            <h1>Smart Delivery</h1>
            <div id="select-locker">
                <div id="trackingID-input">
                    <input type="text" placeholder="Enter Receiver Tracking ID" name="id" value={trackingID} onChange={handleTrackingID} />
                    <div id="button" onClick={findLockers}>Find Lockers</div>
                </div>
                <h1>Select Locker for delivery</h1>
                <div id="locker-list">
                    {
                        data.map((d, i) => (
                            <div id="locker-option">
                                <img src="./images/maps.jpg" onClick={() => { openMaps(d.address) }} />
                                <div id="detail" onClick={() => { reserveLocker(d.lockerid, d.compcategoryid, d.parcelid) }}>

                                    <h2>{d.address + " " + (i + 1)} </h2>
                                    <h3>{d.city}</h3>
                                </div>
                            </div>
                        )
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default SelectLocker;