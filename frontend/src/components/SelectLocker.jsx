import React from "react";
import axios from "axios";

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
                if(res.status == 200)
                {
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
        axios.get('http://localhost:4001/availableLockers', { params: value })
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
                {
                    data.map((d, i) => {
                        return (
                            <div style={{ border: "1px solid black", backgroundColor: "lightblue", margin: "10px", borderRadius: "25px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", textAlign: "center", width: "800px" }} onClick={() => { reserveLocker(d.lockerid, d.compcategoryid, d.parcelid) }}>
                                <h2>{d.address + " " + (i + 1)} </h2>
                                <h3>{d.city}</h3>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}

export default SelectLocker;