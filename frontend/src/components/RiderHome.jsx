import React from "react";
import {Link} from "react-router";
import "../styles/AdminHome.css";

function RiderHome()
{
    return(
        <div id="adminHomeBody">
            <button className="adminButton"><Link to={"/ParcelReceivingDetail"}>Parcel Receiving Details</Link></button>
            <button className="adminButton"><Link to={"/ParcelDeliveryDetail"}>Parcel Delivery Details</Link></button>
            <button className="adminButton"><Link to={"/FailedParcelDetail"}>Failed Parcel Details</Link></button>
        </div>
    );
}

export default RiderHome;