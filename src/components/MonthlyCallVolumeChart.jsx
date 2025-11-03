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

const MonthlyCallVolumeChart = ({ calls, title = "Call Volume" }) => {
  const yearMonthMap = {};
  const years = new Set();
  const currentYear = new Date().getFullYear();

  // Build data map: { "2024-1": 12, ... } and collect all years
  calls.forEach(call => {
    const date = new Date(call.startDate);
    if (isNaN(date)) return;
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    yearMonthMap[key] = (yearMonthMap[key] || 0) + 1;
    years.add(year);
  });

  const sortedYears = Array.from(years).sort();

  // Build chart data per month - only include months with data
  const chartData = monthLabels.map((label, monthIndex) => {
    let hasData = false;
    const entry = { month: label };

    sortedYears.forEach(year => {
      const key = `${year}-${monthIndex}`;
      const count = yearMonthMap[key] || 0;
      entry[year] = count;
      if (count > 0) hasData = true;
    });

    // Only include this month if at least one year has data
    return hasData ? entry : null;
  }).filter(Boolean);

  // Function to get color for each year
  const getYearColor = (year) => {
    if (year === currentYear) return "#59a14f"; // Green for current year
    if (year === currentYear - 1) return "#f28e2c"; // Orange for previous year
    // Fallback colors for other years
    const yearColors = ["#4e79a7", "#e15759", "#b07aa1", "#76b7b2", "#edc949"];
    const index = sortedYears.indexOf(year) % yearColors.length;
    return yearColors[index];
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      height: '100%',
      minHeight: '1200px',
      padding: '1rem'
    }}>
      <h2 style={{ 
        margin: '0 0 0.5rem 0',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#1f2937',
        textAlign: 'center'
      }}>
        {title}
      </h2>
      
      <div style={{ flex: 1, minHeight: '1150px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
            barGap={2}
            barCategoryGap="15%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              angle={0}
              textAnchor="middle"
              height={60}
            />
            <YAxis />
            <Tooltip />
            <Legend 
              verticalAlign="top" 
              height={36}
            />
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
  );
};

export default MonthlyCallVolumeChart;
