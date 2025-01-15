import React, { useState } from "react";
import "./DashBoard.css";

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const stats = [
    { label: "Total Branches", value: 3, icon: "🏢" },
    { label: "Total Parcels", value: 3, icon: "📦" },
    { label: "Total Staff", value: 2, icon: "👥" },
    { label: "Shipped", value: 1, icon: "📦" },
    { label: "In-Transit", value: 0, icon: "📦" },
    { label: "Delivered", value: 1, icon: "📦" },
    { label: "Unsuccessful Delivery Attempt", value: 0, icon: "📦" },
  ];

  return (
    <div className="dashboard">
      <nav className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <button
          className="toggle-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? ">" : "<"}
        </button>
        <h2 className="sidebar-title">ADMIN</h2>
        <ul className="sidebar-menu">
          <li>Dashboard</li>
          <li>Branch</li>
          <li>Branch Staff</li>
          <li>Parcels</li>
          <li>Track Parcel</li>
          <li>Reports</li>
          <li>Manage Lockers</li>
        </ul>
      </nav>
      <main className="main-content">
        <header className="header">
          <h1>Courier Management System</h1>
          <div className="user-info">Administrator</div>
        </header>
        <section className="stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="icon">{stat.icon}</div>
              <div className="details">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
