// src/components/MonthlyCallVolumeChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function MonthlyCallVolumeChart({ calls }) {
  // Aggregate calls per month
  const monthlyData = calls.reduce((acc, call) => {
    const date = call.startDate;
    if (!date) return acc; // safeguard for undefined dates
    const [month, , year] = date.split("/"); // Assuming date format MM/DD/YY
    const monthYear = `${month}/${year}`;
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData).map(([monthYear, count]) => ({
    monthYear,
    count,
  }));

  return (
    <div>
      <h2>Monthly Call Volume</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthYear" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyCallVolumeChart;

