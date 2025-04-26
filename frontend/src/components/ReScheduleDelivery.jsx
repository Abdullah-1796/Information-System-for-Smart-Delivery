import React from "react";
import axios from "axios";
import UserFloatingTray from "./UserFloatingTray";
import CustomerCareButton from "./CustomerCareButton";

function ReScheduleDelivery() {
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

        axios.get('http://localhost:4001/checkEligibility/ReDelivery', { params: value })
            .then(res => {
                if (res.status == 200 && res.data.eligible) {

                    axios.get('http://localhost:4001/checkParcelInLocker', { params: value })
                        .then(response => {
                            console.log(response);
                            if (response.status == 200 && response.data.rowCount > 0) {
                                //console.log(res.data.stampid, res.data.lockerid, res.data.compid)
                                const value1 = {
                                    stampid: res.data.stampid,
                                    column: "reattempt"
                                }
                                axios.put('http://localhost:4001/updateTimestamp', value1)
                                    .then(response1 => {
                                        if (response1.status == 200) {
                                            const otp = Math.floor(Math.random() * 9000);
                                            const value2 = {
                                                lockerid: res.data.lockerid,
                                                compid: res.data.compid,
                                                otp: otp
                                            }
                                            axios.put('http://localhost:4002/Locker/Compartment/otp', value2)
                                                .then(response2 => {
                                                    const value3 = {
                                                        parcelID: res.data.parcelid,
                                                        status: "parcelPlaced"
                                                    }
                                                    axios.put('http://localhost:4001/updateStatus', value3)
                                                        .then(response3 => {
                                                            alert("Parcel is already in locker at " + response.data.rows[0].address + " with otp: " + otp);
                                                            console.log(response.data.rows);
                                                        })
                                                        .catch(error3 => {
                                                            console.error(error3);
                                                        });
                                                })
                                                .catch(error2 => {
                                                    console.error("Error while updating otp: " + error2);
                                                });
                                        }
                                    })
                                    .catch(error1 => {
                                        console.error(error1);
                                    });
                            }
                            else {
                                alert("finding lockers");
                                axios.get('http://localhost:4001/availableLockers', { params: value })
                                    .then(res => {
                                        console.log(res.data.rows);
                                        setData(res.data.rows);
                                    })
                                    .catch(err => {
                                        console.error("Error while fetching available lockers: " + err);
                                    });
                            }
                        })
                        .catch(error => {
                            console.error("Error while fetching available lockers: " + error);
                        });
                }
                else {
                    alert("Not eligible to make rescheduling event!");
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
                <h1>Select Locker to re-schedule delivery</h1>
                <div id="locker-list">
                    {
                        data.map((d, i) => (
                            <div id="locker-option">
                                <img src="./images/maps.jpg" onClick={() => {openMaps(d.address)}} />
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

export default ReScheduleDelivery;