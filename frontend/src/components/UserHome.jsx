import React from "react";
import "../styles/UserHome.css";
import UserFloatingTray from "./UserFloatingTray";
import CustomerCareButton from "./CustomerCareButton";

function UserHome() {

    
    
    return (
        <div id="userHome-container">
            <UserFloatingTray />
            <CustomerCareButton />
            <h1>Smart Delivery</h1>
            <div id="main-container">
                <div className="goal-container reverse" style={{backgroundColor: "#C1CFA1"}}>
                    <div className="img">
                        <img src="./images/pickup.avif" alt="" />
                    </div>
                    <div className="detail">
                        <p className="heading">Experience hassle-free pickups with Smart Delivery</p>
                        <p>The smarter way to receive packages. No more missed deliveries or long waits. Our secure, automated
                            system lets you pick up parcels at your convenience with real-time updates and contactless access.
                            Save time, stay in control – choose Smart Delivery.</p>
                    </div>
                </div>

                <div className="goal-container" style={{backgroundColor: "#E7CCCC"}}>
                    <div className="img">
                        <img src="./images/location.jpg" alt="" />
                    </div>
                    <div className="detail">
                        <p className="heading">Your parcel, your pickup point</p>
                        <p>Smart Delivery puts you in control. No more missed deliveries or schedule changes. Get instant
                            alerts, 24/7 access, and a secure, stress-free pickup experience. Fast, convenient, and built around
                            you.</p>
                    </div>
                </div>

                <div className="goal-container reverse" style={{backgroundColor: "#A5B68D"}}>
                    <div className="img">
                        <img src="./images/alert.jpg" alt="" />
                    </div>
                    <div className="detail">
                        <p className="heading">On time Alerts with Smart Delivery</p>
                        <p>On-time alerts and smart delivery systems enhance customer satisfaction by providing real-time
                            tracking and updates. For businesses, this leads to fewer complaints, improved efficiency, and
                            stronger customer loyalty.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserHome;