import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { bookingsDb } from "../firebase";

const BookingsSummaryChart = ({ selectedBookingMonth, selectedBookingYear }) => {
  const [bookings, setBookings] = useState([]);

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

  // collapse services with trailing "- something"
  const serviceCount = bookings.reduce((acc, { service }) => {
    if (!service) return acc;
    const normalizedService = service.split("-")[0].trim();
    acc[normalizedService] = (acc[normalizedService] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(serviceCount).map(
    ([service, count]) => ({
      service,
      count,
    })
  );

  return (
    <div className="monthly-chart" style={{ width: "100%" }}>
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

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="service" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsSummaryChart;

