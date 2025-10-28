import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { bookingsDb } from "./firebase";

import BookingFilterBar from "./components/BookingFilterBar";
import BookingsSummaryChart from "./components/BookingsSummaryChart";

export default function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  const [selectedBookingMonth, setSelectedBookingMonth] = useState([]);
  const [selectedBookingYear, setSelectedBookingYear] = useState([]);

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      const snapshot = await getDocs(
        collection(bookingsDb, "bookings-appointments")
      );
      const bookingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(bookingData);
    };
    fetchBookings();
  }, []);

  // Filter logic (yours, unchanged)
  useEffect(() => {
    const filtered = bookings.filter(booking => {
      const date = new Date(booking.start);

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

    setFilteredBookings(filtered);
  }, [bookings, selectedBookingYear, selectedBookingMonth]);

  return (
    <div className="flex flex-col gap-4">
      <BookingFilterBar
        selectedBookingMonth={selectedBookingMonth}
        setSelectedBookingMonth={setSelectedBookingMonth}
        selectedBookingYear={selectedBookingYear}
        setSelectedBookingYear={setSelectedBookingYear}
        bookings={bookings}
      />

      <div className="monthly-chart">
        <BookingsSummaryChart
          // Note: in your original code you only pass month/year,
          // not the actual filtered list. I'm keeping that.
          selectedBookingMonth={selectedBookingMonth}
          selectedBookingYear={selectedBookingYear}
          // If BookingsSummaryChart actually needs the filtered data,
          // change it to: bookings={filteredBookings}
        />
      </div>

      {/* Optional: bookings table or detail list */}
      {/* If you eventually want a table of individual appointments, you can render filteredBookings here. */}
    </div>
  );
}
