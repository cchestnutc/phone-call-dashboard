import React, { useState } from "react";
import CallsTab from "./CallsTab";
import BookingsTab from "./BookingsTab";
import "./index.css";   // ensure global layout rules are loaded
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("calls");

  return (
    <div className="dashboard-shell">
      {/* Top block: title + tabs */}
      <div className="dashboard-header-block">
        <h1 className="dashboard-title">Help Desk Dashboard</h1>

        <div className="tabs-header">
          <button
            className={"tab-button " + (activeTab === "calls" ? "tab-active" : "tab-inactive")}
            onClick={() => setActiveTab("calls")}
          >
            Calls
          </button>

          <button
            className={"tab-button " + (activeTab === "bookings" ? "tab-active" : "tab-inactive")}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings
          </button>
        </div>
      </div>

      {/* White card content area */}
      <div className="tab-panel">
        <div className="tab-panel-inner">
          {activeTab === "calls" && <CallsTab />}
          {activeTab === "bookings" && <BookingsTab />}
        </div>
      </div>
    </div>
  );
}
