import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const BookingsSummaryChart = ({ bookings }) => {
  // Count bookings by service
  const serviceCount = bookings.reduce((acc, { service }) => {
    if (!service) return acc;
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(serviceCount).map(([service, count]) => ({
    service,
    count
  }));

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Bookings This Month: {bookings.length}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="service" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#4e79a7" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsSummaryChart;
