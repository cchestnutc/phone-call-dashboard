import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import AgentSummary from "./components/AgentSummary";
import HourlyBreakdown from "./components/HourlyBreakdown";
import MonthlyCallVolumeChart from "./components/MonthlyCallVolumeChart";
import './App.css';

function App() {
  const [calls, setCalls] = useState([]);

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

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Phone Call Dashboard</h1>
      <div className="summary-breakdown-container">
        <div className="agent-summary">
          <AgentSummary calls={calls} />
        </div>
        <div className="hourly-breakdown">
          <HourlyBreakdown calls={calls} />
        </div>
        <div className="monthly-chart">
          <MonthlyCallVolumeChart calls={calls} />
        </div>
      </div>
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
            {calls.map(call => (
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
      </div>
    </div>
  );
}

export default App;





