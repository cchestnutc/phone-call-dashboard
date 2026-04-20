import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

import AgentSummary from "./components/AgentSummary";
import CallKpiCards from "./components/CallKpiCards";
import HourlyBreakdown from "./components/HourlyBreakdown";
import MonthlyCallVolumeChart from "./components/MonthlyCallVolumeChart";
import RawCallsDrilldown from "./components/RawCallsDrilldown";
import FilterBar from "./components/FilterBar";
import {
  buildAgentSummaryFromCalls,
  buildHourlyRowsFromCalls,
  getAgentName,
  getAvailableAgentsFromCalls,
  getAvailableYearsFromAggregateDocs,
} from "./utils/phoneDashboardData";

export default function CallsTab() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const previousYear = currentYear - 1;

  const [aggregateDocs, setAggregateDocs] = useState([]);
  const [callsForAgentFilter, setCallsForAgentFilter] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([currentMonth]);
  const [selectedYear, setSelectedYear] = useState([previousYear, currentYear]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const fetchAggregates = async () => {
      if (selectedYear.length === 0) {
        setAggregateDocs([]);
        return;
      }

      setLoadingSummary(true);

      try {
        const summaryQuery = query(
          collection(db, "phone_call_monthly_aggregates"),
          where("year", "in", selectedYear.slice(0, 10)),
          orderBy("year", "desc"),
          orderBy("month", "asc")
        );

        const snap = await getDocs(summaryQuery);
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAggregateDocs(docs);
      } catch (error) {
        console.error("Error fetching monthly aggregate docs:", error);
        setAggregateDocs([]);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchAggregates();
  }, [selectedYear]);

  useEffect(() => {
    const fetchCallsForAgentFilter = async () => {
      if (selectedYear.length !== 1 || selectedMonth.length !== 1) {
        setCallsForAgentFilter([]);
        return;
      }

      try {
        const filterQuery = query(
          collection(db, "phone_calls"),
          where("year", "==", selectedYear[0]),
          where("month", "==", selectedMonth[0])
        );

        const snap = await getDocs(filterQuery);
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCallsForAgentFilter(docs);
      } catch (error) {
        console.error("Error fetching calls for agent filter:", error);
        setCallsForAgentFilter([]);
      }
    };

    fetchCallsForAgentFilter();
  }, [selectedYear, selectedMonth]);

  const filteredAggregateDocs = useMemo(() => {
    if (selectedMonth.length === 0) return aggregateDocs;
    return aggregateDocs.filter((doc) => selectedMonth.includes(doc.month));
  }, [aggregateDocs, selectedMonth]);

  const agentList = useMemo(() => {
    return getAvailableAgentsFromCalls(callsForAgentFilter);
  }, [callsForAgentFilter]);

  const availableYears = useMemo(() => {
    const aggregateYears = getAvailableYearsFromAggregateDocs(aggregateDocs);
    const fallbackYears = [previousYear, currentYear];
    return aggregateYears.length > 0 ? aggregateYears : fallbackYears;
  }, [aggregateDocs, currentYear, previousYear]);

  const filteredCallsForDetails = useMemo(() => {
    if (selectedAgents.length === 0) return callsForAgentFilter;

    return callsForAgentFilter.filter((call) =>
      selectedAgents.includes(getAgentName(call))
    );
  }, [callsForAgentFilter, selectedAgents]);

  const agentSummaryRows = useMemo(() => {
    return buildAgentSummaryFromCalls(filteredCallsForDetails);
  }, [filteredCallsForDetails]);

  const hourlyRows = useMemo(() => {
    return buildHourlyRowsFromCalls(filteredCallsForDetails);
  }, [filteredCallsForDetails]);

  return (
    <>
      <div className="section-block">
        <FilterBar
          agents={agentList}
          calls={callsForAgentFilter}
          availableYears={availableYears}
          selectedAgents={selectedAgents}
          setSelectedAgents={setSelectedAgents}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      </div>

      <div className="section-block">
        <CallKpiCards calls={filteredCallsForDetails} />
      </div>

      <div className="section-block">
        <div className="summary-breakdown-container">
          <div className="monthly-chart">
            <MonthlyCallVolumeChart
              aggregateDocs={filteredAggregateDocs}
              selectedAgents={selectedAgents}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              title={loadingSummary ? "Call Volume (Loading...)" : "Call Volume"}
            />
          </div>

          <div className="agent-summary">
            <AgentSummary rows={agentSummaryRows} />
          </div>

          <div className="hourly-breakdown">
            <HourlyBreakdown rows={hourlyRows} />
          </div>

          <div className="agent-summary">
            <RawCallsDrilldown
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              selectedAgents={selectedAgents}
            />
          </div>
        </div>
      </div>
    </>
  );
}
