import React from "react";

function AgentSummary({ calls }) {
  // Aggregate data by agent AND year
  const agentYearData = calls.reduce((acc, call) => {
    const agent = call.agentName || call.agent || "Unknown";
    const date = new Date(call.startDate);
    const year = date.getFullYear();
    const key = `${agent}-${year}`;

    if (!acc[key]) {
      acc[key] = { 
        agent, 
        year,
        totalCalls: 0, 
        totalTalkSeconds: 0 
      };
    }
    acc[key].totalCalls += 1;

    // Convert talk time to seconds (supports "hh:mm:ss" or "mm:ss")
    if (call.talkTime) {
      const parts = call.talkTime.split(":").map(Number);
      let totalSeconds = 0;

      if (parts.length === 3) {
        // hh:mm:ss
        totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        // mm:ss
        totalSeconds = parts[0] * 60 + parts[1];
      }

      acc[key].totalTalkSeconds += totalSeconds;
    }

    return acc;
  }, {});

  // Convert to array and sort by agent name, then year
  const agentYearArray = Object.values(agentYearData).sort((a, b) => {
    if (a.agent !== b.agent) {
      return a.agent.localeCompare(b.agent);
    }
    return b.year - a.year; // Newer years first
  });

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      padding: '1rem'
    }}>
      <h2 style={{ 
        margin: '0 0 1rem 0',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#1f2937',
        textAlign: 'center'
      }}>
        Agent Summary
      </h2>
      
      <div style={{ overflowX: 'auto' }}>
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
            {agentYearArray.map((data) => {
              const avgSeconds = data.totalTalkSeconds / data.totalCalls || 0;
              return (
                <tr key={`${data.agent}-${data.year}`}>
                  <td>{data.agent}</td>
                  <td>{data.year}</td>
                  <td>{data.totalCalls}</td>
                  <td>{formatTime(data.totalTalkSeconds)}</td>
                  <td>{formatTime(avgSeconds)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AgentSummary;
