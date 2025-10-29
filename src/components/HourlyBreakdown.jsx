import React from "react";

function HourlyBreakdown({ calls }) {
  // Count calls by hour
  const hourCounts = Array(24).fill(0);

  calls.forEach((call) => {
    if (call.startTime) {
      // assumes startTime like "14:37:00" or "14:37"
      const [hourStr] = call.startTime.split(":");
      const hour = parseInt(hourStr, 10);
      if (!isNaN(hour)) {
        hourCounts[hour] += 1;
      }
    }
  });

  // Build rows only for hours 7 AM - 5 PM
  const rows = [];
  for (let hour = 7; hour <= 17; hour++) {
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    rows.push({
      label: `${displayHour} ${period}`,
      count: hourCounts[hour],
    });
  }

  return (
    <table className="summary-table">
      <thead>
        <tr>
          <th>Hour</th>
          <th>Call Count</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td>{row.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default HourlyBreakdown;
