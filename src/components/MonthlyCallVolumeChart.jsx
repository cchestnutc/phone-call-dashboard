import React from "react";
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

const monthLabels = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const colorPalettes = [
  "#4e79a7", "#f28e2c", "#59a14f", "#e15759",
  "#b07aa1", "#76b7b2", "#edc949", "#af7aa1"
];

const MonthlyCallVolumeChart = ({ calls, title = "Call Volume" }) => {
  // Group by month + year
  const yearMonthMap = {};
  const years = new Set();

  calls.forEach(call => {
    const date = new Date(call.startDate);
    if (isNaN(date)) return;
    const month = date.getMonth(); // 0–11
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    yearMonthMap[key] = (yearMonthMap[key] || 0) + 1;
    years.add(year);
  });

  const sortedYears = Array.from(years).sort();

  // Build data structure: [{ month: "Jan", "2024": 10, "2025": 15 }, ...]
  const chartData = monthLabels.map((label, monthIndex) => {
    const entry = { month: label };
    sortedYears.forEach(year => {
      const key = `${year}-${monthIndex}`;
      entry[year] = yearMonthMap[key] || 0;
    });
    return entry;
  });

  return (
    <div>
      <h2>{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          {sortedYears.map((year, i) => (
            <Bar key={year} dataKey={year} fill={colorPalettes[i % colorPalettes.length]}>
              <LabelList dataKey={year} position="top" />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyCallVolumeChart;
