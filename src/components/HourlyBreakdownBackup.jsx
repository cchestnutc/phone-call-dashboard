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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      height: '100%',
      padding: '1rem'
    }}>
      <h2 style={{ 
        margin: '0 0 1rem 0',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#1f2937',
        textAlign: 'center'
      }}>
        Hourly Call Breakdown
      </h2>
      
      <div style={{ 
        width: '100%',
        maxWidth: '400px',
        overflowX: 'auto'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.95rem'
        }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'center',
                padding: '0.75rem',
                borderBottom: '2px solid #e5e7eb',
                background: '#f3f4f6',
                fontWeight: 600,
                color: '#374151'
              }}>
                Hour
              </th>
              <th style={{
                textAlign: 'center',
                padding: '0.75rem',
                borderBottom: '2px solid #e5e7eb',
                background: '#f3f4f6',
                fontWeight: 600,
                color: '#374151'
              }}>
                Call Count
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td style={{
                  textAlign: 'center',
                  padding: '0.6rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  {row.label}
                </td>
                <td style={{
                  textAlign: 'center',
                  padding: '0.6rem',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 500
                }}>
                  {row.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HourlyBreakdown;
