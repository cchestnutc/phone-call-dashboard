import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snap = await getDocs(collection(db, "bookings"));
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
      // Adjust this based on your booking data structure
      // If bookings have a date field, use it for filtering
      if (booking.date) {
        const date = new Date(booking.date);
        
        const yearMatch =
          selectedYear.length === 0 || selectedYear.includes(date.getFullYear());

        const monthMatch =
          selectedMonth.length === 0 ||
          selectedMonth.includes(date.getMonth() + 1);

        return yearMatch && monthMatch;
      }
      return true;
    });

    setFilteredBookings(filtered);
  }, [bookings, selectedYear, selectedMonth]);

  return (
    <div className="section-block">
      <h2>Bookings Data</h2>
      
      {/* You can add filters here similar to CallsTab if needed */}
      
      {filteredBookings.length === 0 ? (
        <p>No bookings data available.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Details</th>
                {/* Add more columns based on your booking data structure */}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</td>
                  <td>{booking.details || 'N/A'}</td>
                  {/* Add more cells based on your booking data structure */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
