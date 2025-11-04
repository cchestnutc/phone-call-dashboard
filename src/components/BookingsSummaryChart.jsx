import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { bookingsDb } from "../firebase";

const BookingsSummaryChart = ({ selectedBookingMonth, selectedBookingYear }) => {
  const [bookings, setBookings] = useState([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchBookings = async () => {
      const snapshot = await getDocs(
        collection(bookingsDb, "bookings-appointments")
      );
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filtered = data.filter((booking) => {
        if (!booking.start || !booking.start.toDate) return false;
        const date = booking.start.toDate();

        const yearMatch =
          Array.isArray(selectedBookingYear) &&
          (selectedBookingYear.length === 0 ||
            selectedBookingYear.includes(date.getFullYear()));

        const monthMatch =
          Array.isArray(selectedBookingMonth) &&
          (selectedBookingMonth.length === 0 ||
            selectedBookingMonth.includes(date.getMonth() + 1));

        return yearMatch && monthMatch;
      });

      setBookings(filtered);
    };

    fetchBookings();
  }, [selectedBookingMonth, selectedBookingYear]);

  // Build data structure: service -> year -> count
  const serviceYearMap = {};
  const years = new Set();

  bookings.forEach((booking) => {
    if (!booking.service || !booking.start || !booking.start.toDate) return;
    
    const normalizedService = booking.service.split("-")[0].trim();
    const year = booking.start.toDate().getFullYear();
    
    years.add(year);
    
    if (!serviceYearMap[normalizedService]) {
      serviceYearMap[normalizedService] = {};
    }
    
    serviceYearMap[normalizedService][year] = 
      (serviceYearMap[normalizedService][year] || 0) + 1;
  });

  const sortedYears = Array.from(years).sort();

  // Build chart data with year columns
  const chartData = Object.entries(serviceYearMap).map(([service, yearCounts]) => {
    const entry = { service };
    sortedYears.forEach(year => {
      entry[year] = yearCounts[year] || 0;
    });
    return entry;
  });

  // Function to get color for each year
  const getYearColor = (year) => {
    if (year === currentYear) return "#59a14f"; // Green for current year
    if (year === currentYear - 1) return "#f28e2c"; // Orange for previous year
    // Fallback colors for other years
    const yearColors = ["#4e79a7", "#e15759", "#b07aa1", "#76b7b2", "#edc949"];
    const index = sortedYears.indexOf(year) % yearColors.length;
    return yearColors[index];
  };

  // Custom tick component to wrap and angle long text
  const CustomXAxisTick = ({ x, y, payload }) => {
    const maxChars = 25;
    const text = payload.value;
    
    // Truncate if too long and add ellipsis
    const displayText = text.length > maxChars 
      ? text.substring(0, maxChars) + '...' 
      : text;

    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-35)"
          fontSize="12"
        >
          {displayText}
        </text>
      </g>
    );
  };

  return (
    <div className="monthly-chart" style={{ width: "100%", padding: "1rem" }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: "1rem",
          textAlign: "center",
          marginBottom: "0.5rem",
          color: "#111827",
        }}
      >
        Total Bookings: {bookings.length}
      </div>

      <div style={{ width: "100%", height: "450px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 20, left: 10, bottom: 120 }}
            barGap={2}
            barCategoryGap="15%"
          >
            <XAxis 
              dataKey="service" 
              tick={<CustomXAxisTick />}
              height={130}
              interval={0}
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

export default BookingsSummaryChart;
