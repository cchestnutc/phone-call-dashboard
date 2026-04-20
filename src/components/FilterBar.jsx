import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

const MONTH_LABELS = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const MonthlyCallVolumeChart = ({
  aggregateDocs = [],
  selectedAgents = [],
  selectedMonth = [],
  selectedYear = [],
  title = "Call Volume",
}) => {
  const currentYear = new Date().getFullYear();

  const filteredDocs = useMemo(() => {
    let docs = [...aggregateDocs];

    if (selectedYear.length > 0) {
      docs = docs.filter((doc) => selectedYear.includes(Number(doc.year)));
    }

    if (selectedMonth.length > 0) {
      docs = docs.filter((doc) => selectedMonth.includes(Number(doc.month)));
    }

    return docs;
  }, [aggregateDocs, selectedMonth, selectedYear]);

  const sortedYears = useMemo(() => {
    return Array.from(new Set(filteredDocs.map((doc) => Number(doc.year)))).sort(
      (a, b) => a - b
    );
  }, [filteredDocs]);

  const chartData = useMemo(() => {
    const rowsByMonth = {};

    filteredDocs.forEach((doc) => {
      const monthNum = Number(doc.month);
      const year = Number(doc.year);

      if (!monthNum || !year) return;

      if (!rowsByMonth[monthNum]) {
        rowsByMonth[monthNum] = {
          month: MONTH_LABELS[monthNum] || String(monthNum),
        };
      }

      let value = Number(doc.totalCalls) || 0;

      if (selectedAgents.length > 0) {
        const agentTotals = doc.agentTotals || {};
        value = selectedAgents.reduce(
          (sum, agent) => sum + (Number(agentTotals[agent]) || 0),
          0
        );
      }

      rowsByMonth[monthNum][year] = value;
    });

    return Object.entries(rowsByMonth)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, row]) => row);
  }, [filteredDocs, selectedAgents]);

  const getYearColor = (year) => {
    if (year === currentYear) return "#59a14f";
    if (year === currentYear - 1) return "#f28e2c";

    const yearColors = ["#4e79a7", "#e15759", "#b07aa1", "#76b7b2", "#edc949"];
    const index = sortedYears.indexOf(year) % yearColors.length;
    return yearColors[index];
  };

  return (
    <div className="monthly-chart">
      <div
        style={{
          fontWeight: 600,
          fontSize: "1rem",
          textAlign: "center",
          marginBottom: "0.5rem",
          color: "#111827",
        }}
      >
        {title}
      </div>

      <div
        style={{
          width: "100%",
          height: "320px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", height: "100%", paddingBottom: "0.5rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              barGap={2}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={0} textAnchor="middle" height={40} />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" height={30} />
              {sortedYears.map((year) => (
                <Bar
                  key={year}
                  dataKey={year}
                  fill={getYearColor(year)}
                  isAnimationActive={false}
                >
                  <LabelList dataKey={year} position="top" />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCallVolumeChart;
