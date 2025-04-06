import React, { useState } from "react";
import axios from "axios";
import "../styles/AdminHome.css";
import AdminFloatingTray from "./AdminFloatingTray";

const AdminHome = () => {
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
	return (
		<div id="adminHome-container">
			<div id="decor1">
				<img src="./images/decor1.webp" />
			</div>
			
			<div id="decor2">
				<img src="./images/decor4.png" />
			</div>

			<div id="decor31">
				<img src="./images/decor31.png" />
			</div>
			<h1>Smart Delivery</h1>
			<div id="welcome-message-container">
				<AdminFloatingTray />
				<div id="welcome-message">
					<div id="message">
						<h3>Welcome back, Admin!</h3>
						<p>Your leadership drives everything forward. Every click you make shapes a smoother, smarter system. This isn't just a dashboard, it's your command center, where innovation begins and excellence takes form. Keep pushing boundaries, making decisions, and building the future. You've got this, and the whole system runs better because of you.</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminHome;
