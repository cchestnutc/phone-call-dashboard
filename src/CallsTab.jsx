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
  const [previousPeriodCalls, setPreviousPeriodCalls] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([currentMonth]);
  const [selectedYear, setSelectedYear] = useState([currentYear]);
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
    const fetchCallsForSelectedMonth = async () => {
      if (selectedYear.length !== 1 || selectedMonth.length !== 1) {
        setCallsForAgentFilter([]);
        return;
      }

      try {
        const selectedMonthQuery = query(
          collection(db, "phone_calls"),
          where("year", "==", selectedYear[0]),
          where("month", "==", selectedMonth[0])
        );

        const snap = await getDocs(selectedMonthQuery);
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCallsForAgentFilter(docs);
      } catch (error) {
        console.error("Error fetching calls for selected month:", error);
        setCallsForAgentFilter([]);
      }
    };

    fetchCallsForSelectedMonth();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const fetchPreviousPeriodCalls = async () => {
      if (selectedYear.length !== 1 || selectedMonth.length !== 1) {
        setPreviousPeriodCalls([]);
        return;
      }

      const currentSelectedYear = selectedYear[0];
      const currentSelectedMonth = selectedMonth[0];

      const previousMonth = currentSelectedMonth === 1 ? 12 : currentSelectedMonth - 1;
      const previousMonthYear =
        currentSelectedMonth === 1 ? currentSelectedYear - 1 : currentSelectedYear;

      try {
        const previousMonthQuery = query(
          collection(db, "phone_calls"),
          where("year", "==", previousMonthYear),
          where("month", "==", previousMonth)
        );

        const snap = await getDocs(previousMonthQuery);
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPreviousPeriodCalls(docs);
      } catch (error) {
        console.error("Error fetching previous period calls:", error);
        setPreviousPeriodCalls([]);
      }
    };

    fetchPreviousPeriodCalls();
  }, [selectedYear, selectedMonth]);

  const chartAggregateDocs = useMemo(() => {
    return aggregateDocs;
  }, [aggregateDocs]);

  const agentList = useMemo(() => {
    return getAvailableAgentsFromCalls(callsForAgentFilter);
  }, [callsForAgentFilter]);

  const availableYears = useMemo(() => {
  const allYears = [2022, 2023, 2024, 2025, 2026, currentYear, previousYear];
  return Array.from(new Set(allYears)).sort((a, b) => b - a);
  }, [currentYear, previousYear]);

  const filteredCallsForDetails = useMemo(() => {
    if (selectedAgents.length === 0) return callsForAgentFilter;

    return callsForAgentFilter.filter((call) =>
      selectedAgents.includes(getAgentName(call))
    );
  }, [callsForAgentFilter, selectedAgents]);

  const filteredPreviousPeriodCalls = useMemo(() => {
    if (selectedAgents.length === 0) return previousPeriodCalls;

    return previousPeriodCalls.filter((call) =>
      selectedAgents.includes(getAgentName(call))
    );
  }, [previousPeriodCalls, selectedAgents]);

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
        <CallKpiCards
          calls={filteredCallsForDetails}
          previousPeriodCalls={filteredPreviousPeriodCalls}
        />
      </div>

      <div className="section-block">
        <div className="summary-breakdown-container">
          <div className="monthly-chart">
            <MonthlyCallVolumeChart
              aggregateDocs={chartAggregateDocs}
              selectedAgents={selectedAgents}
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
