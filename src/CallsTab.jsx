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

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);

  // Fetch calls from Firestore
  useEffect(() => {
    const fetchCalls = async () => {
      const querySnapshot = await getDocs(collection(db, "phone_calls"));
      const callData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCalls(callData);
    };
    fetchCalls();
  }, []);

  // Filter logic (unchanged from your code)
  useEffect(() => {
    const filtered = calls.filter(call => {
      const date = new Date(call.startDate);

      const yearMatch =
        selectedYear.length === 0 ||
        selectedYear.includes(date.getFullYear());

      const monthMatch =
        selectedMonth.length === 0 ||
        selectedMonth.includes(date.getMonth() + 1);

      const agentMatch =
        selectedAgents.length === 0 ||
        selectedAgents.includes(call.agent);

      return yearMatch && monthMatch && agentMatch;
    });

    setFilteredCalls(filtered);
  }, [calls, selectedYear, selectedMonth, selectedAgents]);

  // Unique agent list for FilterBar
  const agentList = calls
    .map(call => call.agent)
    .filter((v, i, a) => v && a.indexOf(v) === i);

  return (
    <div className="flex flex-col gap-4">
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
  );
}
