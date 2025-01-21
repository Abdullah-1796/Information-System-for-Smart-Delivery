import React from "react";
import {Link} from "react-router";
import "../styles/AdminHome.css";

function ReceiverHome()
{
    return(
        <div id="adminHomeBody">
            <button className="adminButton"><Link to={"/SelectLocker"}>Select Locker</Link></button>
            <button className="adminButton"><Link to={"/ReScheduleDelivery"}>Re-schedule failed delivery</Link></button>
        </div>
    );
}

export default ReceiverHome;