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

function getPreviousMonthYear(year, month) {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

export default function CallsTab() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [aggregateDocs, setAggregateDocs] = useState([]);
  const [allAggregateDocs, setAllAggregateDocs] = useState([]);
  const [callsForSelectedYears, setCallsForSelectedYears] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([currentMonth]);
  const [selectedYear, setSelectedYear] = useState([currentYear]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const fetchAllAggregateDocs = async () => {
      try {
        const snap = await getDocs(collection(db, "phone_call_monthly_aggregates"));
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllAggregateDocs(docs);
      } catch (error) {
        console.error("Error fetching all aggregate docs:", error);
        setAllAggregateDocs([]);
      }
    };

    fetchAllAggregateDocs();
  }, []);

  useEffect(() => {
    const fetchAggregates = async () => {
      if (selectedYear.length === 0) {
        setAggregateDocs([]);
        return;
      }

      setLoadingSummary(true);

      try {
        const results = [];

        for (const year of selectedYear.slice(0, 10)) {
          const q = query(
            collection(db, "phone_call_monthly_aggregates"),
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

        setAggregateDocs(results);
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
    const fetchCallsForSelectedYears = async () => {
      if (selectedYear.length === 0) {
        setCallsForSelectedYears([]);
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

        setCallsForSelectedYears(results);
      } catch (error) {
        console.error("Error fetching calls for selected years:", error);
        setCallsForSelectedYears([]);
      }
    };

    fetchCallsForSelectedYears();
  }, [selectedYear]);

  const filteredAggregateDocs = useMemo(() => {
    let docs = aggregateDocs;

    if (selectedMonth.length > 0) {
      docs = docs.filter((doc) => selectedMonth.includes(Number(doc.month)));
    }

    return docs;
  }, [aggregateDocs, selectedMonth]);

  const filteredCallsByTime = useMemo(() => {
    let calls = callsForSelectedYears;

    if (selectedMonth.length > 0) {
      calls = calls.filter((call) => selectedMonth.includes(Number(call.month)));
    }

    return calls;
  }, [callsForSelectedYears, selectedMonth]);

  const filteredCallsForDetails = useMemo(() => {
    if (selectedAgents.length === 0) return filteredCallsByTime;

    return filteredCallsByTime.filter((call) =>
      selectedAgents.includes(getAgentName(call))
    );
  }, [filteredCallsByTime, selectedAgents]);

  const previousPeriodCalls = useMemo(() => {
    if (selectedYear.length === 0 || selectedMonth.length === 0) return [];

    const sortedSelections = [];

    selectedYear.forEach((year) => {
      selectedMonth.forEach((month) => {
        sortedSelections.push({
          year: Number(year),
          month: Number(month),
        });
      });
    });

    sortedSelections.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const latest = sortedSelections[sortedSelections.length - 1];
    if (!latest) return [];

    const prev = getPreviousMonthYear(latest.year, latest.month);

    let previousCalls = callsForSelectedYears.filter(
      (call) =>
        Number(call.year) === prev.year &&
        Number(call.month) === prev.month
    );

    if (selectedAgents.length > 0) {
      previousCalls = previousCalls.filter((call) =>
        selectedAgents.includes(getAgentName(call))
      );
    }

    return previousCalls;
  }, [callsForSelectedYears, selectedAgents, selectedMonth, selectedYear]);

  const agentList = useMemo(() => {
    return getAvailableAgentsFromCalls(filteredCallsByTime);
  }, [filteredCallsByTime]);

  const availableYears = useMemo(() => {
    const aggregateYears = getAvailableYearsFromAggregateDocs(allAggregateDocs);
    return aggregateYears.length > 0 ? aggregateYears : [currentYear];
  }, [allAggregateDocs, currentYear]);

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
        <CallKpiCards
          calls={filteredCallsForDetails}
          previousPeriodCalls={previousPeriodCalls}
        />
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
