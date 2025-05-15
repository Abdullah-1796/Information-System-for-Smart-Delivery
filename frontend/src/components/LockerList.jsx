import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import Modal from "./Modal";
import "../styles/LockerList.css";
import "../styles/Modal.css";
import LoadingScreen from "./LoadingScreen";

function LockerList() {
    const [data, setData] = React.useState([]);
    const [isAddModalOpen, setisAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLocker, setSelectedLocker] = useState("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        province: "",
        small: 0,
        medium: 0,
        large: 0,
    });
        const [collapsed, setCollapsed] = useState({});
    
        const getTownName = (address) => {
            if (!address) return ""; // Handle empty or undefined addresses
        
            const words = address.trim().toLowerCase().split(" ");
        
            // If the address has only one word, return it as is
            if (words.length === 1) {
                return words[0].charAt(0).toUpperCase() + words[0].slice(1); // Capitalize first letter
            }
        
            // Otherwise, return the first two words capitalized
            return words[0].charAt(0).toUpperCase() + words[0].slice(1) + " " +
                   words[1].charAt(0).toUpperCase() + words[1].slice(1);
        };
        
    
        // Group lockers by (town, city)
        const groupedLockers = data.reduce((acc, d) => {
            const town = getTownName(d.address);
            const key = `${town}, ${d.city}`;
    
            if (!acc[key]) acc[key] = [];
            acc[key].push(d);
            return acc;
        }, {});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        axios.post('http://localhost:4001/L', formData)
            .then(res => {
                // console.log("res is ", res);
    
                if (res.status === 201) { // Correct status for successful insertion
                    // console.log(res.data.message);
                    alert(res.data.message); // Notify user
                    loadData(); // Refresh data
                }
            })
            .catch(err => {
                console.error("Error:", err);
                if (err.response && err.response.status === 400) {
                    alert(err.response.data.error || "A locker with this address and city already exists.");
                } else {
                    alert("An error occurred. Please try again.");
                }
            })
            .finally(() => {
                setLoading(false);
                setisAddModalOpen(false);
            }); // Ensure loading state is updated
    };    

    function loadData() {
        setLoading(true);
        axios.get("http://localhost:4002/")
            .then(res => {
                setData(res.data);
                //// console.log(res.data.rows);
            })
            .catch(error => {
                // console.log(`Error while fecthing lockers ${error}`);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleDelete = () => {
        setLoading(true);
        axios.delete(`http://localhost:4001/L`, {
            params: { lockerid: selectedLocker },
        })
            .then(res => {
                // console.log("message", res.data.message);
                loadData();
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
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
        setLoading(true);
        const data = { ...formData, lockerid: selectedLocker.lockerid };
        axios.put(`http://localhost:4001/L`, data)
            .then(res => {
                // console.log("message", res.data.message);
                loadData();
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setIsEditModalOpen(false);
                setLoading(false);
            });
    };


    React.useEffect(() => {
        loadData();
    }, []);
    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}>
                <LoadingScreen />
            </div>
        );
    }
    return (
        <div style={{padding: "20px"}}>
            <div id="Bar">
                <div id="screenButton" onClick={() => setisAddModalOpen(true)}>
                    Add Locker
                </div>
            </div>
            <div id="lockerListContainer" style={{ justifyContent: "center", alignItems: "center" }}>
            <h1>List of Smart Lockers</h1>
            {Object.entries(groupedLockers).map(([key, lockers]) => (
                <div key={key} className="town-group">
                    <h2
                        style={{ cursor: "pointer", padding: "10px", borderRadius: "10px", backgroundColor: "#b9e5e8",margin:"2%", }}
                        onClick={() => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))}
                    >
                        {key} {collapsed[key] ? "▼" : "▲"}
                    </h2>
                    {!collapsed[key] && (
                        <div >
                            {lockers.map(d => (
                                <div className="card" key={d.lockerid}>
                                    <Link to={`/Locker/${d.lockerid}`} className="lockerItem">
                                        <p>{d.lockerid} {d.address}</p>
                                    </Link>
                                    <div className="modal-buttons">
                                        <button
                                            style={{ backgroundColor: "grey", color: "white", padding: "10px", borderRadius: "10px", width: "100px" }}
                                            onClick={() => { setIsEditModalOpen(true); openEditModal(d) }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            style={{ backgroundColor: "red", color: "white", padding: "10px", borderRadius: "10px", width: "100px" }}
                                            onClick={() => { setIsDeleteModalOpen(true); setSelectedLocker(d.lockerid) }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
            {AddnewLockerModal()}
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
        </div>
    );

    function AddnewLockerModal() {
        return <Modal isOpen={isAddModalOpen} onClose={() => setisAddModalOpen(false)}>
            <p className="modal_P">Add a new Locker</p>
            <form onSubmit={handleSubmit} style={{paddingLeft: "20px",paddingRight: "40px"}}>
                <div className="inputFields">
                    <label htmlFor="address">Enter Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        style={{ padding: "10px", borderRadius: "10px", marginBottom: "10px" }} />
                    <label htmlFor="city">Enter City</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        style={{ padding: "10px", borderRadius: "10px", marginBottom: "10px" }} />
                    <label htmlFor="province">Enter Province</label>
                    <input
                        type="text"
                        id="province"
                        name="province"
                        required
                        value={formData.province}
                        onChange={handleChange}
                        style={{ padding: "10px", borderRadius: "10px" }} />
                    <label htmlFor="small">Enter Number of Small Lockers</label>
                    <input
                        type="number"
                        id="small"
                        name="small"
                        required
                        min="0"
                        value={formData.small}
                        onChange={handleChange}
                        style={{ padding: "10px", borderRadius: "10px" }} />
                    <label htmlFor="medium">Enter Number of Medium Lockers</label>
                    <input
                        type="number"
                        id="medium"
                        name="medium"
                        required
                        min="0"
                        value={formData.medium}
                        onChange={handleChange}
                        style={{ padding: "10px", borderRadius: "10px" }} />
                    <label htmlFor="large">Enter Number of Large Lockers</label>
                    <input
                        type="number"
                        id="large"
                        name="large"
                        required
                        min="0"
                        value={formData.large}
                        onChange={handleChange}
                        style={{ padding: "10px", borderRadius: "10px" }} />
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
        </Modal>;
    }
}

export default LockerList;