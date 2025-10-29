import React, { useState } from "react";
import CallsTab from "./CallsTab";
import BookingsTab from "./BookingsTab";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("calls");

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Help Desk Dashboard</h1>

      {/* Tabs Header */}
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

      {/* Centered White Card */}
      <div className="tab-panel">
        <div className="tab-panel-inner">
          {activeTab === "calls" && <CallsTab />}
          {activeTab === "bookings" && <BookingsTab />}
        </div>
      </div>
    </div>
  );
}

  );
}

