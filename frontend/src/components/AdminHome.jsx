import React, { useState } from "react";
import "../styles/AdminHome.css";
import AdminFloatingTray from "./AdminFloatingTray";

const AdminHome = () => {
	
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
