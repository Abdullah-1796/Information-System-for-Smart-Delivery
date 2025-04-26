import React, { useState } from "react";
import "../styles/FloatingTray.css";
import Option from "./Option";
import axios from "axios";


function AdminFloatingTray() {

    const [visible, setVisible] = React.useState(true);
    const [data, setData] = useState([
        {
            id: 1,
            itemName: "AKG Handfree",
            sname: "Mario",
            sphone: "03000000000",
            semail: "stest1@gmail.com",
            rname: "John William",
            rphone: "+923227888444",
            remail: "rtest1@gmail.com",
            address: "Faisal Town A Block",
            city: "Lahore",
            province: "Punjab",
            weight: 20,
            selected: true,
        },
        {
            id: 2,
            itemName: "Leather wallet",
            sname: "Daraz",
            sphone: "03000000000",
            semail: "stest1@gmail.com",
            rname: "Michal",
            rphone: "+923227888444",
            remail: "rtest2@gmail.com",
            address: "Faisal Town A Block",
            city: "Lahore",
            province: "Punjab",
            weight: 100,
            selected: true,
        },
    ]);

    const [showPopup, setShowPopup] = useState(false);
    const [parcels, setParcels] = useState([]); // State to store fetched parcels
    const [loading, setLoading] = useState(false); // State to handle loading state
    const [error, setError] = useState(null); // State to handle errors
    const [showtable, setShowtable] = useState(false);
    const [status, setStatus] = useState("pending");
    function handleCheckboxChange(index) {
        const updatedData = [...data];
        updatedData[index].selected = !updatedData[index].selected;
        setData(updatedData);
    }

    function postUpdates() {
        setParcels(""); // Update state with fetched data
        setShowtable(false); // Show the table
        setShowPopup(true);
    }

    function confirmPostUpdates() {
        const selectedData = data.filter((item) => item.selected);
        if (selectedData.length === 0) {
            alert("No records selected for posting!");
            return;
        }

        axios
            .post("http://localhost:4001/postUpdates", selectedData)
            .then((res) => {
                console.log(res.data.message);
                if (res.status === 200) {
                    alert(res.data.message);
                }
            })
            .catch((err) => {
                console.log(err);
            });

        setShowPopup(false);
    }

    function getUpdates() {
        setParcels(""); // Update state with fetched data
        setShowtable(false); // Show the table
        axios
            .get("http://localhost:4001/getUpdates")
            .then((res) => {
                console.log(res.data);

                if (res.status === 200) {
                    const fetchedData = res.data.rows || []; // Extract 'rows' from response

                    if (fetchedData.length === 0) {
                        alert("No updates available.");
                        return;
                    }
                    setParcels(fetchedData); // Update state with fetched data
                    setShowtable(true); // Show the table
                    // Format data properly for confirmation popup
                    const formattedData = fetchedData
                        .map(
                            (item, index) =>
                                `${index + 1}. ${item.itemname} - ${item.city} (${item.status
                                })\nReceiver: ${item.rname}, ${item.rphone}`
                        )
                        .join("\n\n");

                    // // Show formatted data in confirm box
                    // if (
                    //   window.confirm(
                    //     `Fetched ${fetchedData.length} row(s):\n\n${formattedData}\n\nDo you want to proceed?`
                    //   )
                    // ) {
                    //   // alert("User confirmed!");
                    // } else {
                    //   // alert("User canceled!");
                    // }
                }
            })
            .catch((err) => {
                console.log(err);
                alert("Error fetching updates!");
            });
    }

    function markFailDeliveries() {
        setParcels(""); // Update state with fetched data
        setShowtable(false); // Show the table
        const days = prompt(
            "Enter number of days, the parcel has not been picked up:"
        );
        if (
            days &&
            window.confirm(
                `Mark parcels as failed deliveries if not picked up in ${days} days?`
            )
        ) {
            const values = { days: days };
            axios
                .put("http://localhost:4001/markFailDeliveries", values)
                .then((res) => {
                    console.log(res.data);
                    if (res.status === 200) {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    // Function to fetch pending parcels
    const getPendingParcels = async () => {
        setLoading(true); // Set loading to true
        setError(null); // Reset any previous errors
        setStatus("Pending");
        try {
            // Call the API using Axios
            const response = await axios.get("http://localhost:4001/getPendingParcels");

            if (response.data.success) {
                setParcels(response.data.data); // Update state with fetched data
                setShowtable(true); // Show the table
                console.log("Data is:", response.data.data);
            } else {
                throw new Error(response.data.message || "Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching pending parcels:", error);
            setError(error.message); // Set error message
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    const getPlacedParcels = async () => {
        setLoading(true); // Set loading to true
        setError(null); // Reset any previous errors
        setStatus("Placed");
        try {
            // Call the API using Axios
            const response = await axios.get("http://localhost:4001/getPlacedParcels");

            if (response.data.success) {
                setParcels(response.data.data); // Update state with fetched data
                setShowtable(true); // Show the table
                // console.log("Data is:", response.data.data);
            } else {
                throw new Error(response.data.message || "Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching Selection Done parcels:", error);
            setError(error.message); // Set error message
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    const getDeliveredParcels = async () => {
        setLoading(true); // Set loading to true
        setError(null); // Reset any previous errors
        setStatus("Delivered Parcels");
        try {
            // Call the API using Axios
            const response = await axios.get("http://localhost:4001/getDeliveredParcels");

            if (response.data.success) {
                setParcels(response.data.data); // Update state with fetched data
                setShowtable(true); // Show the table
                // console.log("Data is:", response.data.data);
            } else {
                throw new Error(response.data.message || "Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching Delivered parcels:", error);
            setError(error.message); // Set error message
        } finally {
            setLoading(false); // Set loading to false
        }
    };

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
                <img src="./images/down arrow.png" alt="Down Arrow Icon" id="toggle-btn-img" />
            </div>
            <div id="floating-tray-container">
                <div id="floating-tray">
                    <div onClick={confirmPostUpdates}>
                        <Option
                            backgroundColor="#1E201E"
                            color="white"
                            label="Post Parcels"
                            link=""
                        />
                    </div>
                    <Option
                        backgroundColor="#697565"
                        color="white"
                        label="Old Admin Home"
                        link="/AdminHomeOld"
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