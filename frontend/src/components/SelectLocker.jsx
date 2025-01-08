import React from "react";
import axios from "axios";

function SelectLocker() {
    const [trackingID, setTrackingID] = React.useState("");
    const [data, setData] = React.useState([]);

    function handleTrackingID(event) {
        setTrackingID(event.target.value);
    }

    function reserveLocker(lockerID, compCategoryID)
    {
        console.log(lockerID);
        const value = {
            lockerID: lockerID,
            compCategoryID: compCategoryID
        }
        axios.post('http://localhost:4001/reserveLocker', value)
        .then(res => {
        })
        .catch(err => {
            console.error("Error while reserving available lockers: " + err);
        });
    }

    function findLockers()
    {
        const value = {
            trackingID: trackingID,
        }
        axios.get('http://localhost:4001/availableLockers', {params: value})
        .then(res => {
            console.log(res.data.rows);
            setData(res.data.rows);
        })
        .catch(err => {
            console.error("Error while fetching available lockers: " + err);
        });
    }
    return (
        <div>
            <h1>Select Locker for delivery</h1>
            <input type="text" placeholder="Enter Receiver Tracking ID" name="id" value={trackingID} onChange={handleTrackingID} />
            <button onClick={findLockers}>Find Lockers</button>
            <div>
                {
                    data.map((d, i) => {
                        return (
                            <div onClick={() => {reserveLocker(d.lockerid, d.compcategoryid)}}>
                                <h2>{d.address}</h2>
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