// src/components/AgentSummary.jsx
import React from "react";

function AgentSummary({ calls }) {
  // Aggregate data by agent
  const agentData = calls.reduce((acc, call) => {
    const agent = call.agentName || "Unknown";
    if (!acc[agent]) {
      acc[agent] = { totalCalls: 0, totalTalkSeconds: 0 };
    }
    acc[agent].totalCalls += 1;

    // Convert talk time to seconds (handle hh:mm:ss and mm:ss)
    if (call.talkTime) {
      const parts = call.talkTime.split(":").map(Number);
      let totalSeconds = 0;
      if (parts.length === 3) {
        totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        totalSeconds = parts[0] * 60 + parts[1];
      }
      acc[agent].totalTalkSeconds += totalSeconds;
    }

    return acc;
  }, {});

  const agents = Object.entries(agentData);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div>
      <h2>Agent Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Agent Name</th>
            <th>Total Calls</th>
            <th>Total Talk Time (hh:mm:ss)</th>
            <th>Avg Talk Time</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(([agent, data]) => {
            const avgSeconds = data.totalTalkSeconds / data.totalCalls || 0;
            return (
              <tr key={agent}>
                <td>{agent}</td>
                <td>{data.totalCalls}</td>
                <td>{formatTime(data.totalTalkSeconds)}</td>
                <td>{formatTime(avgSeconds)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AgentSummary;

