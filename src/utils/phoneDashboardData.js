export function parseTalkTimeToSeconds(talkTime) {
  if (!talkTime || typeof talkTime !== "string") return 0;

  const parts = talkTime.split(":").map(Number);

  if (parts.some(Number.isNaN)) return 0;

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return 0;
}

export function formatSecondsToHms(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0;

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function getAgentName(call) {
  return call?.agentName || call?.agent || "Unknown";
}

export function buildAgentSummaryFromCalls(calls = []) {
  const grouped = calls.reduce((acc, call) => {
    const agent = getAgentName(call);
    const date = call?.startDate ? new Date(call.startDate) : null;

    if (!date || Number.isNaN(date.getTime())) return acc;

    const year = date.getFullYear();
    const key = `${agent}-${year}`;

    if (!acc[key]) {
      acc[key] = {
        agent,
        year,
        totalCalls: 0,
        totalTalkSeconds: 0,
      };
    }

    acc[key].totalCalls += 1;
    acc[key].totalTalkSeconds += parseTalkTimeToSeconds(call?.talkTime);

    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => {
    if (a.agent !== b.agent) {
      return a.agent.localeCompare(b.agent);
    }
    return b.year - a.year;
  });
}

export function buildHourlyRowsFromCalls(calls = []) {
  const hourCounts = Array(24).fill(0);

  calls.forEach((call) => {
    if (!call?.startTime || typeof call.startTime !== "string") return;

    const [hourStr] = call.startTime.split(":");
    const hour = parseInt(hourStr, 10);

    if (!Number.isNaN(hour) && hour >= 0 && hour <= 23) {
      hourCounts[hour] += 1;
    }
  });

  const totalCalls = calls.length;

  const rows = [];
  for (let hour = 7; hour <= 17; hour += 1) {
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const count = hourCounts[hour];
    const percentOfTotal = totalCalls > 0 ? (count / totalCalls) * 100 : 0;

    rows.push({
      hour,
      label: `${displayHour} ${period}`,
      count,
      percentOfTotal,
    });
  }

  return rows;
}

export function getAggregateDocCallCount(doc, selectedAgents = []) {
  if (!doc) return 0;

  if (!selectedAgents || selectedAgents.length === 0) {
    return doc.totalCalls || 0;
  }

  const agentTotals = doc.agentTotals || {};

  return selectedAgents.reduce((sum, agent) => {
    return sum + (agentTotals[agent] || 0);
  }, 0);
}

export function buildMonthlyChartDataFromAggregateDocs(docs = [], selectedAgents = []) {
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const years = Array.from(new Set(docs.map((doc) => doc.year))).sort((a, b) => a - b);

  return monthLabels
    .map((label, monthIndex) => {
      const entry = { month: label };
      let hasData = false;

      years.forEach((year) => {
        const match = docs.find(
          (doc) => doc.year === year && doc.month === monthIndex + 1
        );

        const count = getAggregateDocCallCount(match, selectedAgents);
        entry[year] = count;

        if (count > 0) hasData = true;
      });

      return hasData ? entry : null;
    })
    .filter(Boolean);
}

export function getAvailableYearsFromAggregateDocs(docs = []) {
  return Array.from(new Set(docs.map((doc) => doc.year))).sort((a, b) => b - a);
}

export function getAvailableAgentsFromCalls(calls = []) {
  return Array.from(
    new Set(calls.map((call) => getAgentName(call)).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}

export function buildKpiDataFromCalls(calls = []) {
  const totalCalls = calls.length;

  let totalTalkSeconds = 0;
  const agentCounts = {};
  const hourCounts = Array(24).fill(0);

  calls.forEach((call) => {
    totalTalkSeconds += parseTalkTimeToSeconds(call?.talkTime);

    const agent = getAgentName(call);
    agentCounts[agent] = (agentCounts[agent] || 0) + 1;

    if (typeof call?.startTime === "string") {
      const [hourStr] = call.startTime.split(":");
      const hour = parseInt(hourStr, 10);

      if (!Number.isNaN(hour) && hour >= 0 && hour <= 23) {
        hourCounts[hour] += 1;
      }
    }
  });

  const avgTalkSeconds = totalCalls > 0 ? totalTalkSeconds / totalCalls : 0;

  let busiestHour = null;
  let busiestHourCount = 0;

  for (let hour = 0; hour <= 23; hour += 1) {
    if (hourCounts[hour] > busiestHourCount) {
      busiestHour = hour;
      busiestHourCount = hourCounts[hour];
    }
  }

  let topAgent = "N/A";
  let topAgentCount = 0;

  Object.entries(agentCounts).forEach(([agent, count]) => {
    if (count > topAgentCount) {
      topAgent = agent;
      topAgentCount = count;
    }
  });

  return {
    totalCalls,
    totalTalkSeconds,
    avgTalkSeconds,
    busiestHour,
    busiestHourCount,
    topAgent,
    topAgentCount,
  };
}

export function formatHourLabel(hour) {
  if (hour === null || hour === undefined || Number.isNaN(hour)) return "N/A";

  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

export function formatPercent(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(1)}%`;
}
