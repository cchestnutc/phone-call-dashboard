import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { bookingsDb } from "./firebase";
import BookingFilterBar from "./components/BookingFilterBar";
import BookingsSummaryChart from "./components/BookingsSummaryChart";
import BookingsMonthlyTrends from "./components/BookingsMonthlyTrends";

export default function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  const currentYear = currentDate.getFullYear();
  const previousYear = currentYear - 1;

  const [selectedBookingMonth, setSelectedBookingMonth] = useState([currentMonth]);
  const [selectedBookingYear, setSelectedBookingYear] = useState([previousYear, currentYear]);

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snap = await getDocs(collection(bookingsDb, "bookings-appointments"));
        const bookingData = snap.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        console.log("Fetched bookings:", bookingData.length); // Debug log
        setBookings(bookingData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, []);

  // Filter logic
  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      if (!booking.start || !booking.start.toDate) return false;
      const date = booking.start.toDate();

      const yearMatch =
        selectedBookingYear.length === 0 || 
        selectedBookingYear.includes(date.getFullYear());

      const monthMatch =
        selectedBookingMonth.length === 0 ||
        selectedBookingMonth.includes(date.getMonth() + 1);

      return yearMatch && monthMatch;
    });

    setFilteredBookings(filtered);
  }, [bookings, selectedBookingYear, selectedBookingMonth]);

  return (
    <>
      {/* Filters row */}
      <div className="section-block">
        <BookingFilterBar
          bookings={bookings}
          selectedBookingMonth={selectedBookingMonth}
          setSelectedBookingMonth={setSelectedBookingMonth}
          selectedBookingYear={selectedBookingYear}
          setSelectedBookingYear={setSelectedBookingYear}
        />
      </div>

      {/* Bookings Chart */}
      <div className="section-block">
        <BookingsSummaryChart
          selectedBookingMonth={selectedBookingMonth}
          selectedBookingYear={selectedBookingYear}
        />
      </div>
    </>
  );
}
