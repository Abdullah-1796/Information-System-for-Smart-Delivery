import React from "react";
import "../styles/CustomerCareButton.css";

function CustomerCareButton() {

    function openWhatsapp() {
        const phoneNumber = "923227888444";
        const message = "Hi, I need your assistance, anyone there to guide me please?";
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    }

    return (
        <div id="customer-care-btn" onClick={openWhatsapp}>
            <img src="./images/customer-service.png" />
        </div>
    );
}

export default CustomerCareButton;