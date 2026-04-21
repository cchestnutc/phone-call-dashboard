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

const MONTH_NUMBER_MAP = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const MonthlyCallVolumeChart = ({
  aggregateDocs = [],
  selectedAgents = [],
  selectedMonth = [],
  selectedYear = [],
  title = "Call Volume",
}) => {
  const currentYear = new Date().getFullYear();

  const filteredAggregateDocs = useMemo(() => {
    let docs = [...aggregateDocs];

    if (selectedYear.length > 0) {
      docs = docs.filter((doc) => selectedYear.includes(Number(doc.year)));
    }

    if (selectedMonth.length > 0) {
      docs = docs.filter((doc) => selectedMonth.includes(Number(doc.month)));
    }

    return docs;
  }, [aggregateDocs, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    let data = buildMonthlyChartDataFromAggregateDocs(
      filteredAggregateDocs,
      selectedAgents
    );

    if (selectedMonth.length > 0) {
      data = data.filter((row) => {
        const rowMonthNumber =
          MONTH_NUMBER_MAP[String(row.month).toLowerCase()] ?? null;
        return selectedMonth.includes(rowMonthNumber);
      });
    }

    return data;
  }, [filteredAggregateDocs, selectedAgents, selectedMonth]);

  const sortedYears = useMemo(() => {
    return Array.from(
      new Set(filteredAggregateDocs.map((doc) => Number(doc.year)))
    ).sort((a, b) => a - b);
  }, [filteredAggregateDocs]);

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
              <XAxis
                dataKey="month"
                angle={0}
                textAnchor="middle"
                height={40}
              />
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
