import React from "react";

function HourlyBreakdown({ rows = [] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
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
        Hourly Call Breakdown
      </h2>

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.95rem",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "center",
                  padding: "0.75rem",
                  borderBottom: "2px solid #e5e7eb",
                  background: "#f3f4f6",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Hour
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "0.75rem",
                  borderBottom: "2px solid #e5e7eb",
                  background: "#f3f4f6",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Call Count
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td
                  style={{
                    textAlign: "center",
                    padding: "0.6rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {row.label}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "0.6rem",
                    borderBottom: "1px solid #e5e7eb",
                    fontWeight: 500,
                  }}
                >
                  {row.count}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="2"
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    color: "#6b7280",
                  }}
                >
                  No hourly data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HourlyBreakdown;
