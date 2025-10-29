import React, { useState } from "react";
import CallsTab from "./CallsTab";
import BookingsTab from "./BookingsTab";
import "./App.css"; // keeping your styles

export default function HelpDeskDashboard() {
  const [activeTab, setActiveTab] = useState("calls"); // "calls" | "bookings"

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Help Desk Dashboard</h1>

      {/* Tabs header */}
      <div className="tabs-header">
        <button
          className={
            "tab-button " +
            (activeTab === "calls" ? "tab-active" : "tab-inactive")
          }
          onClick={() => setActiveTab("calls")}
        >
          Calls
        </button>

        <button
          className={
            "tab-button " +
            (activeTab === "bookings" ? "tab-active" : "tab-inactive")
          }
          onClick={() => setActiveTab("bookings")}
        >
          Bookings
        </button>
      </div>

      {/* Tab body */}
      <div className="tab-panel">
        <div className="tab-panel-inner">
        {activeTab === "calls" && <CallsTab />}
        {activeTab === "bookings" && <BookingsTab />}
  </div>
</div>
  );
}
