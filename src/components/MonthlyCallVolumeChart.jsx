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
import { buildMonthlyChartDataFromAggregateDocs } from "../utils/phoneDashboardData";

const MonthlyCallVolumeChart = ({
  aggregateDocs = [],
  title = "Call Volume",
}) => {
  const currentYear = new Date().getFullYear();

  const chartData = useMemo(() => {
    return buildMonthlyChartDataFromAggregateDocs(aggregateDocs);
  }, [aggregateDocs]);

  const sortedYears = useMemo(() => {
    return Array.from(new Set(aggregateDocs.map((doc) => doc.year))).sort((a, b) => a - b);
  }, [aggregateDocs]);

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
          height: "290px",
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
            <XAxis
              dataKey="month"
              angle={0}
              textAnchor="middle"
              height={40}
            />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
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
