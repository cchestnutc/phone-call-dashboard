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
      const callData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCalls(callData);
    };
    fetchCalls();
  }, []);

  // Apply filters
  useEffect(() => {
    const filtered = calls.filter((call) => {
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

  // Unique agent names for filter dropdown
  const agentList = calls
    .map((call) => call.agent)
    .filter((v, i, a) => v && a.indexOf(v) === i);

  return (
    <>
      {/* Filters */}
      <div className="section-block">
        <div className="filterbar-row">
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
      </div>

      {/* Agent Summary */}
      <div className="section-block">
        <h2>Agent Summary</h2>
        <AgentSummary calls={filteredCalls} />
      </div>

      {/* Hourly Breakdown */}
      <div className="section-block">
        <h2>Hourly Call Breakdown</h2>
        <HourlyBreakdown calls={filteredCalls} />
      </div>

      {/* Monthly Call Volume */}
      <div className="section-block">
        <h2>Monthly Call Volume</h2>
        <MonthlyCallVolumeChart calls={filteredCalls} />
      </div>
    </>
  );
}
