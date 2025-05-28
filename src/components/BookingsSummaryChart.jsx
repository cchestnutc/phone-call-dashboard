import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function summarizeBookings(bookings) {
  const monthlyData = {};

  bookings.forEach(({ start, service }) => {
    if (!start || !service) return;
    const date = new Date(start);
    if (isNaN(date)) return;

    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyData[month]) monthlyData[month] = { month: monthLabels[date.getMonth()] + " " + date.getFullYear() };

    monthlyData[month][service] = (monthlyData[month][service] || 0) + 1;
  });

  return Object.values(monthlyData);
}

const BookingsSummaryChart = ({ bookings }) => {
  const data = summarizeBookings(bookings);
  const serviceTypes = [...new Set(bookings.map(b => b.service).filter(Boolean))];

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Monthly Booking Summary</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          {serviceTypes.map((service, idx) => (
            <Bar key={service} dataKey={service} stackId="a" fill={`hsl(${(idx * 47) % 360}, 70%, 60%)`} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsSummaryChart;
