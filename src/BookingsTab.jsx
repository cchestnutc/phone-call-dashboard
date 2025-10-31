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
      try {
        const snap = await getDocs(collection(bookingsDb, "bookings-appointments"));
        const bookingData = snap.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
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

      {/* Bookings Table */}
      <div className="section-block">
        <h2>Bookings Summary</h2>
        {filteredBookings.length === 0 ? (
          <p>No bookings available for the selected filters.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const startDate = booking.start?.toDate ? booking.start.toDate() : null;
                  return (
                    <tr key={booking.id}>
                      <td>{startDate ? startDate.toLocaleDateString() : 'N/A'}</td>
                      <td>{startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                      <td>{booking.service || 'N/A'}</td>
                      <td>{booking.customerName || booking.customer || 'N/A'}</td>
                      <td>{booking.status || 'Scheduled'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
