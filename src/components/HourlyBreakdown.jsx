// src/components/HourlyBreakdown.jsx
import React from "react";

function HourlyBreakdown({ calls }) {
  // Count calls by hour (only include 7 AM to 5 PM)
  const hourCounts = Array(24).fill(0);
  calls.forEach(call => {
    if (call.startTime) {
      const [hourStr] = call.startTime.split(":");
      const hour = parseInt(hourStr, 10);
      if (!isNaN(hour)) {
        hourCounts[hour]++;
      }
    }
  });

  return (
    <div>
      <h2>Hourly Call Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Hour</th>
            <th>Call Count</th>
          </tr>
        </thead>
        <tbody>
          {hourCounts.map((count, hour) => {
            if (hour >= 7 && hour <= 17) {  // Filter 7 AM to 5 PM
              const period = hour < 12 ? "AM" : "PM";
              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
              return (
                <tr key={hour}>
                  <td>{`${displayHour} ${period}`}</td>
                  <td>{count}</td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default HourlyBreakdown;

