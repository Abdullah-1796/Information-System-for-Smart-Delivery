import React from "react";
import axios from "axios";
import UserFloatingTray from "./UserFloatingTray";
import CustomerCareButton from "./CustomerCareButton";

function ReScheduleDelivery() {
    const [trackingID, setTrackingID] = React.useState("");
    const [stampid, setStampid] = React.useState("");
    const [data, setData] = React.useState([]);

    function handleTrackingID(event) {
        setTrackingID(event.target.value);
    }

    function reserveLocker(lockerid, compid) {
        // console.log(lockerID);
        const value = {
            lockerid: lockerid,
            compid: compid,
            stampid: stampid,
        }
        console.log(value);
        axios.put('http://localhost:4001/updateLockerId', value)
            .then(res => {
                //// console.log(res.data);
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
            column: "SendParcel",
            trackingID: trackingID,
        }

        axios.get('http://localhost:4001/checkEligibility/RePickup', { params: value })
            .then(res => {
                if (res.status == 200 && res.data.eligible) {
                    alert("finding lockers city");
                    // console.log("res.data", res.data);
                    setStampid(res.data.stampid);
                    axios.get(`http://localhost:4001/getlockers?city=${res.data.city}&compcategoryid=${res.data.compcategoryid}`)
                        .then(res => {
                            console.log(res.data.data);
                            setData(res.data.data);
                        })
                        .catch(err => {
                            console.error("Error while fetching available lockers: " + err);
                        });

                }
                else {
                    alert("Not eligible to make rescheduling event!");
                }
            })
            .catch(err => {
                // console.log("Error while checking for eligibility: " + err);
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
                    <input type="text" placeholder="Enter Sender Tracking ID" name="id" value={trackingID} onChange={handleTrackingID} />
                    <div id="button" onClick={findLockers}>Find Lockers</div>
                </div>
                <h1>Select Locker to re-schedule Pickup</h1>
                <div id="locker-list">
                    {
                        data.map((d, i) => (
                            <div id="locker-option">
                                <img src="./images/maps.jpg" onClick={() => { openMaps(d.address) }} />
                                <div id="detail" onClick={() => { reserveLocker(d.lockerid, d.compid) }}>

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

export default ReScheduleDelivery;