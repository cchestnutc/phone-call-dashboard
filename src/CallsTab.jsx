import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

import AgentSummary from "./components/AgentSummary";
import HourlyBreakdown from "./components/HourlyBreakdown";
import MonthlyCallVolumeChart from "./components/MonthlyCallVolumeChart";
import FilterBar from "./components/FilterBar";

export default function CallsTab() {
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  const currentYear = currentDate.getFullYear();
  const previousYear = currentYear - 1;

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([currentMonth]);
  const [selectedYear, setSelectedYear] = useState([previousYear, currentYear]);

  // Fetch calls from Firestore
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const snap = await getDocs(collection(db, "phone_calls"));
        const callData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched calls:", callData.length); // Debug log
        setCalls(callData);
      } catch (error) {
        console.error("Error fetching calls:", error);
      }
    };
    fetchCalls();
  }, []);

  // Filter logic
  useEffect(() => {
    const filtered = calls.filter((call) => {
      const date = new Date(call.startDate);

      const yearMatch =
        selectedYear.length === 0 || selectedYear.includes(date.getFullYear());

      const monthMatch =
        selectedMonth.length === 0 ||
        selectedMonth.includes(date.getMonth() + 1);

      // Check both agentName and agent fields to match what we display
      const callAgent = call.agentName || call.agent;
      const agentMatch =
        selectedAgents.length === 0 || selectedAgents.includes(callAgent);

      return yearMatch && monthMatch && agentMatch;
    });

    setFilteredCalls(filtered);
  }, [calls, selectedYear, selectedMonth, selectedAgents]);

  // Build agent list from ALL calls (not filtered)
  // Use agentName if available, fallback to agent field
  const agentList = React.useMemo(() => {
    const agents = calls
      .map((c) => c.agentName || c.agent)
      .filter((v) => v) // Remove null/undefined/empty
      .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
      .sort(); // Sort alphabetically
    
    console.log("Agent list:", agents); // Debug log
    return agents;
  }, [calls]);

  return (
    <>
      {/* Filters row (full width, centered controls) */}
      <div className="section-block">
        <FilterBar
          agents={agentList}
          calls={calls}
          selectedAgents={selectedAgents}
          setSelectedAgents={setSelectedAgents}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      </div>

      {/* Main tiles/cards grid (full width) */}
      <div className="section-block">
        <div className="summary-breakdown-container">
          <div className="agent-summary">
            <AgentSummary calls={filteredCalls} />
          </div>

          <div className="hourly-breakdown">
            <HourlyBreakdown calls={filteredCalls} />
          </div>

          <div className="monthly-chart">
            <MonthlyCallVolumeChart calls={filteredCalls} />
          </div>
        </div>
      </div>
    </>
  );
}
