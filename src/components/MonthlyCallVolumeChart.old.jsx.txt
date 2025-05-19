import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const colorPalettes = [
  ["#4e79a7", "#a0cbe8"],
  ["#f28e2c", "#fbc15e"],
  ["#59a14f", "#8cd17d"],
  ["#e15759", "#ff9d9a"],
  ["#b07aa1", "#d4a6c8"],
];

const MonthlyCallVolumeChart = ({ calls, title = "Call Volume" }) => {
  const grouped = calls.reduce((acc, call) => {
    const date = new Date(call.startDate);
    if (isNaN(date)) return acc;
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${month}/${year}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(grouped).map(([key, count]) => {
    const [month, year] = key.split("/").map(Number);
    const label = `${new Date(0, month).toLocaleString("default", {
      month: "short",
    })} '${String(year).slice(-2)}`;
    return {
      key,
      label,
      count,
      month,
      year,
    };
  });

  chartData.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

  const yearToPalette = {};
  let paletteIndex = 0;

  const barsWithColors = chartData.map((item, index) => {
    if (!yearToPalette[item.year]) {
      yearToPalette[item.year] = colorPalettes[paletteIndex % colorPalettes.length];
      paletteIndex++;
    }
    const [colorA, colorB] = yearToPalette[item.year];
    const fill = index % 2 === 0 ? colorA : colorB;
    return { ...item, fill };
  });

  return (
    <div>
      <h2>{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barsWithColors}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count">
            <LabelList dataKey="count" position="top" />
            {barsWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyCallVolumeChart;



