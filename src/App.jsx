import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import AgentSummary from "./components/AgentSummary";
import HourlyBreakdown from "./components/HourlyBreakdown";
import MonthlyCallVolumeChart from "./components/MonthlyCallVolumeChart";
import FilterBar from "./components/FilterBar";
import './App.css';

function App() {
  const currentMonth = new Date().getMonth() + 1; // 1-based month number

  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([currentMonth]); // default to current month
  const [selectedYear, setSelectedYear] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "phone_calls"));
      const callData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCalls(callData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let data = [...calls];

    if (selectedAgents.length > 0) {
      data = data.filter(call => selectedAgents.includes(call.agentName));
    }

    if (selectedMonth.length > 0) {
      data = data.filter(call => {
        const date = new Date(call.startDate);
        return selectedMonth.includes(date.getMonth() + 1);
      });
    }

    if (selectedYear.length > 0) {
      data = data.filter(call => {
        const date = new Date(call.startDate);
        return selectedYear.includes(date.getFullYear());
      });
    }

    setFilteredCalls(data);
  }, [calls, selectedAgents, selectedMonth, selectedYear]);

  const uniqueAgents = [...new Set(calls.map(call => call.agentName))];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Phone Call Dashboard</h1>

      <FilterBar
        agents={uniqueAgents}
        selectedAgents={selectedAgents}
        onAgentChange={setSelectedAgents}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        calls={calls}
      />

      <div className="summary-breakdown-container">
        <div className="agent-summary">
          <AgentSummary calls={filteredCalls} />
        </div>
        <div className="hourly-breakdown">
          <HourlyBreakdown calls={filteredCalls} />
        </div>
        <div className="monthly-chart">
          <MonthlyCallVolumeChart title="Call Volume" calls={filteredCalls} />
        </div>
      </div>

    </div>
  );
}

export default App;
