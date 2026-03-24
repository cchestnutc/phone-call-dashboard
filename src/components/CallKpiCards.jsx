import React from "react";
import {
  buildKpiDataFromCalls,
  formatHourLabel,
  formatSecondsToHms,
} from "../utils/phoneDashboardData";

function KpiCard({ label, value, subtext }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "1rem",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        minHeight: "110px",
      }}
    >
      <div
        style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#6b7280",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>

      {subtext ? (
        <div
          style={{
            fontSize: "0.85rem",
            color: "#6b7280",
          }}
        >
          {subtext}
        </div>
      ) : null}
    </div>
  );
}

function CallKpiCards({ calls = [] }) {
  const {
    totalCalls,
    totalTalkSeconds,
    avgTalkSeconds,
    busiestHour,
    busiestHourCount,
    topAgent,
    topAgentCount,
  } = buildKpiDataFromCalls(calls);

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
      }}
    >
      <KpiCard
        label="Total Calls"
        value={totalCalls.toLocaleString()}
      />

      <KpiCard
        label="Total Talk Time"
        value={formatSecondsToHms(totalTalkSeconds)}
      />

      <KpiCard
        label="Average Talk Time"
        value={formatSecondsToHms(avgTalkSeconds)}
      />

      <KpiCard
        label="Busiest Hour"
        value={formatHourLabel(busiestHour)}
        subtext={`${busiestHourCount.toLocaleString()} calls`}
      />

      <KpiCard
        label="Top Agent"
        value={topAgent}
        subtext={`${topAgentCount.toLocaleString()} calls`}
      />
    </div>
  );
}

export default CallKpiCards;
