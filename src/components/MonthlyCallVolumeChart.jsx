import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const MonthlyCallVolumeChart = ({ calls, title = "Call Volume" }) => {
  // Group calls by month/year
  const grouped = calls.reduce((acc, call) => {
    const date = new Date(call.startDate);
    if (isNaN(date)) return acc; // skip invalid dates
    const key = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(grouped).map(([monthYear, count]) => ({
    month: monthYear,
    count,
  }));

  // Sort by year then month
  chartData.sort((a, b) => {
    const [aMonth, aYear] = a.month.split("/").map(Number);
    const [bMonth, bYear] = b.month.split("/").map(Number);
    return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
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
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyCallVolumeChart;


