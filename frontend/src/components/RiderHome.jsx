import React from "react";
import {Link} from "react-router";

function RiderHome()
{
    return(
        <div>
            <Link to={"/ParcelReceivingDetail"}><button>Parcel Receiving Details</button></Link>
            <br/>
            <Link to={"/ParcelDeliveryDetail"}><button>Parcel Delivery Details</button></Link>
        </div>
    );
}

export default RiderHome;