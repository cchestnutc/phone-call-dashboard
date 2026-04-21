import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
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

  const [aggregateDocs, setAggregateDocs] = useState([]);
  const [callsForSelectedPeriod, setCallsForSelectedPeriod] = useState([]);
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
          where("year", "in", selectedYear.slice(0, 10))
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
    const fetchCallsForSelectedPeriod = async () => {
      if (selectedYear.length === 0) {
        setCallsForSelectedPeriod([]);
        return;
      }

      try {
        const results = [];

        for (const year of selectedYear.slice(0, 10)) {
          const q = query(
            collection(db, "phone_calls"),
            where("year", "==", year)
          );

          const snap = await getDocs(q);

          snap.docs.forEach((doc) => {
            results.push({
              id: doc.id,
              ...doc.data(),
            });
          });
        }

        setCallsForSelectedPeriod(results);
      } catch (error) {
        console.error("Error fetching calls for selected period:", error);
        setCallsForSelectedPeriod([]);
      }
    };

    fetchCallsForSelectedPeriod();
  }, [selectedYear]);

  const filteredAggregateDocs = useMemo(() => {
    let docs = aggregateDocs;

    if (selectedMonth.length > 0) {
      docs = docs.filter((doc) => selectedMonth.includes(Number(doc.month)));
    }

    return docs;
  }, [aggregateDocs, selectedMonth]);

  const filteredCallsByTime = useMemo(() => {
    let calls = callsForSelectedPeriod;

    if (selectedMonth.length > 0) {
      calls = calls.filter((call) => selectedMonth.includes(Number(call.month)));
    }

    return calls;
  }, [callsForSelectedPeriod, selectedMonth]);

  const filteredCallsForDetails = useMemo(() => {
    if (selectedAgents.length === 0) return filteredCallsByTime;

    return filteredCallsByTime.filter((call) =>
      selectedAgents.includes(getAgentName(call))
    );
  }, [filteredCallsByTime, selectedAgents]);

  const agentList = useMemo(() => {
    return getAvailableAgentsFromCalls(filteredCallsByTime);
  }, [filteredCallsByTime]);

  const availableYears = useMemo(() => {
    const aggregateYears = getAvailableYearsFromAggregateDocs(aggregateDocs);
    return aggregateYears.length > 0 ? aggregateYears : [currentYear];
  }, [aggregateDocs, currentYear]);

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
          calls={filteredCallsByTime}
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
