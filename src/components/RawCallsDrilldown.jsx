import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { formatSecondsToHms, getAgentName, parseTalkTimeToSeconds } from "../utils/phoneDashboardData";

function RawCallsDrilldown({
  selectedYear = [],
  selectedMonth = [],
  selectedAgents = [],
}) {
  const [rawCalls, setRawCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const canLoadDrilldown =
    selectedYear.length === 1 && selectedMonth.length === 1;

  useEffect(() => {
    const fetchRawCalls = async () => {
      if (!canLoadDrilldown) {
        setRawCalls([]);
        setMessage("Select exactly one year and one month to load raw calls.");
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const year = selectedYear[0];
        const month = selectedMonth[0];

        const rawCallsQuery = query(
          collection(db, "phone_calls"),
          where("year", "==", year),
          where("month", "==", month),
          orderBy("startDateISO", "desc"),
          limit(250)
        );

        const snap = await getDocs(rawCallsQuery);
        const rows = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRawCalls(rows);

        if (rows.length === 250) {
          setMessage("Showing the newest 250 calls for this month.");
        } else if (rows.length === 0) {
          setMessage("No raw calls found for that month.");
        }
      } catch (error) {
        console.error("Error loading raw drilldown calls:", error);
        setRawCalls([]);
        setMessage("Unable to load raw calls. You may need a Firestore index.");
      } finally {
        setLoading(false);
      }
    };

    fetchRawCalls();
  }, [canLoadDrilldown, selectedYear, selectedMonth]);

  const filteredRows = useMemo(() => {
    if (selectedAgents.length === 0) return rawCalls;

    return rawCalls.filter((call) => selectedAgents.includes(getAgentName(call)));
  }, [rawCalls, selectedAgents]);

  return (
    <div
      style={{
        width: "100%",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#1f2937",
          textAlign: "center",
        }}
      >
        Raw Call Drill-Down
      </h2>

      {!canLoadDrilldown && (
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            padding: "1rem",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
          }}
        >
          {message}
        </div>
      )}

      {canLoadDrilldown && (
        <>
          {loading && (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                padding: "0.75rem",
              }}
            >
              Loading raw calls...
            </div>
          )}

          {!loading && message && (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                padding: "0.75rem",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
              }}
            >
              {message}
            </div>
          )}

          {!loading && filteredRows.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Agent</th>
                    <th>Talk Time</th>
                    <th>Talk Seconds</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((call) => {
                    const talkSeconds = parseTalkTimeToSeconds(call.talkTime);
                    return (
                      <tr key={call.id}>
                        <td>{call.startDate || ""}</td>
                        <td>{call.startTime || ""}</td>
                        <td>{getAgentName(call)}</td>
                        <td>{formatSecondsToHms(talkSeconds)}</td>
                        <td>{talkSeconds}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RawCallsDrilldown;
