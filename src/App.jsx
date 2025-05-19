import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import AgentSummary from "./components/AgentSummary";
import HourlyBreakdown from "./components/HourlyBreakdown";
import MonthlyCallVolumeChart from "./components/MonthlyCallVolumeChart";
import FilterBar from "./components/FilterBar";
import './App.css';

function App() {
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState([]);

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

    if (selectedWeek.length > 0) {
      data = data.filter(call => {
        const date = new Date(call.startDate);
        const week = Math.ceil(date.getDate() / 7);
        return selectedWeek.includes(week);
      });
    }

    setFilteredCalls(data);
  }, [calls, selectedAgents, selectedMonth, selectedYear, selectedWeek]);

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
	{/*
      <div className="details-table">
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Start Date</th>
              <th>Start Time</th>
              <th>End Date</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Talk Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map(call => (
              <tr key={call.id}>
                <td>{call.agentName}</td>
                <td>{call.startDate}</td>
                <td>{call.startTime}</td>
                <td>{call.endDate}</td>
                <td>{call.endTime}</td>
                <td>{call.duration}</td>
                <td>{call.talkTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div >
	*/}
    </div>
  );
}

export default App;

