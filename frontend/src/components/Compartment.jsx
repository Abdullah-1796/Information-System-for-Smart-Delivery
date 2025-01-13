import React, { useState } from "react";
import Modal from "./Modal";
import axios from "axios";
import "../styles/Modal.css";

function Compartment(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComp, setSelectedComp] = useState();
    const handleDelete = () =>
    {
        axios.delete(`http://localhost:4001/compartment`, {
            params: { lockerid: selectedComp },
        })
            .then(res => {
                console.log("message", res.data.message);
                props.loadData()
            })
            .catch(err => {
                console.error(err);
            });
    }
    return (
        <>
            <div className={props.className + " comp"}>
                <h3>Compartment ID: {props.compID}</h3>
                <h4>State: {props.compState}</h4>
                <h4>Category: {props.compCategory}</h4>
                <h4>Is Locked: {props.isLocked}</h4>
                <h4>OTP: {props.otp}</h4>
                <button style={{ backgroundColor: "red", color: "white", padding: "10px", borderRadius: "10px" }} onClick={() => {setIsModalOpen(true);setSelectedComp(props.compID)}}>Delete</button>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <p className="modal_P">Are you sure you want to delete this compartment?</p>
                <div className="modal-buttons">
                    <button
                        style={{
                            backgroundColor: "red",
                            color: "white",
                            padding: "20px",
                            borderRadius: "10px",
                        }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        Close
                    </button>
                    <button
                        style={{
                            backgroundColor: "green",
                            color: "white",
                            padding: "0px 20px 0px 20px",
                            borderRadius: "10px",
                        }}
                        onClick={() => {setIsModalOpen(false);handleDelete()}}
                    >
                        Yes
                    </button>
                </div>
            </Modal>

        </>
    );
}

export default Compartment;