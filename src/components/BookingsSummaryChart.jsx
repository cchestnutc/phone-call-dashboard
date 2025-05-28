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
      const snapshot = await getDocs(collection(bookingsDb, "bookings-appointments"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filtered = data.filter(booking => {
        if (!booking.start || !booking.start.toDate) return false;
        const date = booking.start.toDate();
        const yearMatch = Array.isArray(selectedBookingYear) && (selectedBookingYear.length === 0 || selectedBookingYear.includes(date.getFullYear()));
        const monthMatch = Array.isArray(selectedBookingMonth) && (selectedBookingMonth.length === 0 || selectedBookingMonth.includes(date.getMonth() + 1));
        return yearMatch && monthMatch;
      });

      setBookings(filtered);
    };

    fetchBookings();
  }, [selectedBookingMonth, selectedBookingYear]);

  // Normalize service names by trimming after the dash
  const serviceCount = bookings.reduce((acc, { service }) => {
    if (!service) return acc;
    const normalizedService = service.split("-")[0].trim();
    acc[normalizedService] = (acc[normalizedService] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(serviceCount).map(([service, count]) => ({
    service,
    count
  }));

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Total Bookings: {bookings.length}</h2>
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
