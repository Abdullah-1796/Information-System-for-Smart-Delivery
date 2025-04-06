import React from "react";
import "../styles/FloatingTray.css";
import Option from "./Option";

function AdminFloatingTray() {

    const [visible, setVisible] = React.useState(true);

    function toggleTray() {
        const tray = document.getElementById("floating-tray-container");
        const btn = document.getElementById("toggle-btn");
        const img = document.getElementById("toggle-btn-img");
        if (visible) {
            tray.classList.add("hidden");
            setTimeout(() => {
                tray.style.display = "none";
                setVisible(false);
            }, 500);
            btn.style.bottom = "1%";
            img.src = "./images/up arrow.png";
        }
        else {
            tray.style.display = "flex";
            void tray.offsetWidth;
            tray.classList.remove("hidden");
            btn.style.bottom = "23%";
            img.src = "./images/down arrow.png";
            setVisible(true);
        }
    }

    return (
        <div id="tray-outer-container">
            <div id="toggle-btn" onClick={toggleTray}>
                <img src="./images/down arrow.png" alt="Down Arrow Icon" id="toggle-btn-img"/>
            </div>
            <div id="floating-tray-container">
                <div id="floating-tray">

                    <Option
                        backgroundColor="#1E201E"
                        color="white"
                        label="Post Parcels"
                        link=""
                    />
                    <Option
                        backgroundColor="#697565"
                        color="white"
                        label="Get Updated Parcels"
                        link=""
                    />
                    <Option
                        backgroundColor="#3C3D37"
                        color="white"
                        label="Mark Fail Deliveries"
                        link=""
                    />
                    <Option
                        backgroundColor="#123458"
                        color="white"
                        label="Get Pending Parcels"
                        link=""
                    />
                    <Option
                        backgroundColor="#EDE8DC"
                        color="black"
                        label="Placed in Box"
                        link=""
                    />
                    <Option
                        backgroundColor="#1E201E"
                        color="white"
                        label="Parcels Delivered"
                        link=""
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminFloatingTray;