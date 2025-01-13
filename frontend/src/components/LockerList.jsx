import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router";
import Modal from "./Modal";
import "../styles/LockerList.css";
import "../styles/Modal.css";

function LockerList() {
    const [data, setData] = React.useState([]);
    const [isAddModalOpen, setisAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLocker, setSelectedLocker] = useState("");
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        province: "",
        small: 0,
        medium: 0,
        large: 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:4001/L', formData)
            .then(res => {
                console.log(res.data.message);
                loadData();
            })
            .catch(err => {
                console.log(err);
            });
    };

    function loadData() {
        axios.get("http://localhost:4002/")
            .then(res => {
                setData(res.data.rows);
                //console.log(res.data.rows);
            })
            .catch(error => {
                console.log(`Error while fecthing lockers ${error}`);
            });
    }

    const handleDelete = () => {
        axios.delete(`http://localhost:4001/L`, {
            params: { lockerid: selectedLocker },
        })
            .then(res => {
                console.log("message", res.data.message);
                loadData();
            })
            .catch(err => {
                console.error(err);
            });
    };

    const openEditModal = (locker) => {
        setSelectedLocker(locker);
        setFormData({
            address: locker.address || '',
            city: locker.city || '',
            province: locker.province || '',
        });
        setIsEditModalOpen(true);
    };
    const handleEdit = () => {
        const data = { ...formData, lockerid: selectedLocker.lockerid };
        axios.put(`http://localhost:4001/L`, data)
            .then(res => {
                console.log("message", res.data.message);
                loadData();
            })
            .catch(err => {
                console.error(err);
            });
    };


    React.useEffect(() => {
        loadData();
    }, []);
    return (
        <>
            <div id="Bar">
                <div id="screenButton" onClick={() => setisAddModalOpen(true)}>
                    Add Locker
                </div>
            </div>
            <div id="lockerListContainer">
                <h1>List of Smart Lockers</h1>
                {
                    data.map(d => {
                        return (
                            <div className="card" key={d.lockerid}>
                                <Link to={`/Locker/${d.lockerid}`} className="lockerItem">
                                    <p>{d.lockerid} {d.address}</p>
                                </Link>
                                <div className="modal-buttons">
                                    <button
                                        style={{ backgroundColor: "grey", color: "white", padding: "10px", borderRadius: "10px" }}
                                        onClick={() => { setIsEditModalOpen(true); openEditModal(d) }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        style={{ backgroundColor: "red", color: "white", padding: "10px", borderRadius: "10px" }}
                                        onClick={() => { setIsDeleteModalOpen(true); setSelectedLocker(d.lockerid) }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
            <Modal isOpen={isAddModalOpen} onClose={() => setisAddModalOpen(false)}>
                <p className="modal_P">Add a new Locker</p>
                <form onSubmit={handleSubmit}>
                    <div className="inputFields">
                        <label htmlFor="address">Enter Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            style={{ padding: "10px", borderRadius: "10px", marginBottom: "10px" }}
                        />
                        <label htmlFor="city">Enter City</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            style={{ padding: "10px", borderRadius: "10px", marginBottom: "10px" }}
                        />
                        <label htmlFor="province">Enter Province</label>
                        <input
                            type="text"
                            id="province"
                            name="province"
                            required
                            value={formData.province}
                            onChange={handleChange}
                            style={{ padding: "10px", borderRadius: "10px" }}
                        />
                        <label htmlFor="small">Enter Number of Small Lockers</label>
                        <input
                            type="number"
                            id="small"
                            name="small"
                            required
                            value={formData.small}
                            onChange={handleChange}
                            style={{ padding: "10px", borderRadius: "10px" }}
                        />
                        <label htmlFor="medium">Enter Number of Medium Lockers</label>
                        <input
                            type="number"
                            id="medium"
                            name="medium"
                            required
                            value={formData.medium}
                            onChange={handleChange}
                            style={{ padding: "10px", borderRadius: "10px" }}
                        />
                        <label htmlFor="large">Enter Number of Large Lockers</label>
                        <input
                            type="number"
                            id="large"
                            name="large"
                            required
                            value={formData.large}
                            onChange={handleChange}
                            style={{ padding: "10px", borderRadius: "10px" }}
                        />
                    </div>
                    <div className="modal-buttons">
                        <button
                            type="submit"
                            className=""
                            style={{
                                padding: "10px",
                                borderRadius: "10px",
                                backgroundColor: "green",
                                color: "white",
                                marginTop: "10px",
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </Modal>
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <p className="modal_P">Are you sure you want to delete this Locker?</p>
                <div className="modal-buttons">
                    <button
                        style={{
                            backgroundColor: "red",
                            color: "white",
                            padding: "20px",
                            borderRadius: "10px",
                        }}
                        onClick={() => setIsDeleteModalOpen(false)}
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
                        onClick={() => { setIsDeleteModalOpen(false); handleDelete(); }}
                    >
                        Yes
                    </button>
                </div>
            </Modal>
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <p className="modal_P">Edit Locker Details</p>
                <form onSubmit={handleEdit}>
                    <div className="inputFields">
                        <label htmlFor="address">Enter Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            required
                            value={formData.address || selectedLocker.address}
                            onChange={handleChange}
                            style={{ padding: "10px", borderRadius: "10px", marginBottom: "10px" }}
                        />
                        <label htmlFor="city">Enter City</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            required
                            value={formData.city || selectedLocker.address}
                            onChange={handleChange}
                            style={{ padding: "10px", borderRadius: "10px", marginBottom: "10px" }}
                        />
                        <label htmlFor="province">Enter Province</label>
                        <input
                            type="text"
                            id="province"
                            name="province"
                            required
                            value={formData.province || selectedLocker.address}
                            onChange={handleChange}
                            style={{ padding: "10px", borderRadius: "10px" }}
                        />

                    </div>
                    <div className="modal-buttons">
                        <button
                            type="submit"
                            className=""
                            style={{
                                padding: "10px",
                                borderRadius: "10px",
                                backgroundColor: "green",
                                color: "white",
                                marginTop: "10px",
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default LockerList;