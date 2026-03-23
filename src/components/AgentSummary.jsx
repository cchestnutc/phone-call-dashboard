import React from "react";
import { formatSecondsToHms } from "../utils/phoneDashboardData";

function AgentSummary({ rows = [] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: "1rem",
      }}
    >
      <h2
        style={{
          margin: "0 0 1rem 0",
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#1f2937",
          textAlign: "center",
        }}
      >
        Agent Summary
      </h2>

      <div style={{ overflowX: "auto" }}>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>Year</th>
              <th>Total Calls</th>
              <th>Total Talk Time (hh:mm:ss)</th>
              <th>Avg Talk Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((data) => {
              const avgSeconds =
                data.totalCalls > 0 ? data.totalTalkSeconds / data.totalCalls : 0;

              return (
                <tr key={`${data.agent}-${data.year}`}>
                  <td>{data.agent}</td>
                  <td>{data.year}</td>
                  <td>{data.totalCalls}</td>
                  <td>{formatSecondsToHms(data.totalTalkSeconds)}</td>
                  <td>{formatSecondsToHms(avgSeconds)}</td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                  No agent summary data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AgentSummary;
