import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { bookingsDb } from "./firebase";
import BookingFilterBar from "./components/BookingFilterBar";
import BookingsSummaryChart from "./components/BookingsSummaryChart";
import BookingsMonthlyTrends from "./components/BookingsMonthlyTrends";

export default function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
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
        console.log("Fetched bookings:", bookingData.length);
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

  // THE CLEANUP FUNCTION GOES HERE
  const fixBlankRecords = async () => {
    if (!window.confirm('This will fix all records with "blank" values. Continue?')) {
      return;
    }
    
    setIsCleaningUp(true);
    console.log('🔧 Fixing "blank" data...');
    
    try {
      const snapshot = await getDocs(collection(bookingsDb, "bookings-appointments"));
      let fixedCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const docId = docSnapshot.id;
        
        // Check for blank values
        const hasBlankCreatedAt = data.createdAt === "blank" || !data.createdAt;
        const hasBlankEnd = data.end === "blank";
        
        // Fix blank values
        if (hasBlankCreatedAt || hasBlankEnd) {
          console.log(`🔧 Fixing blank values in: ${docId}`);
          const updates = {};
          
          if (hasBlankCreatedAt) {
            // Use start date as createdAt if available, otherwise use now
            updates.createdAt = data.start && data.start.toDate ? 
              data.start : 
              Timestamp.now();
          }
          
          if (hasBlankEnd) {
            updates.end = null;
          }
          
          await updateDoc(doc(bookingsDb, "bookings-appointments", docId), updates);
          fixedCount++;
        }
      }
      
      alert(`✅ Fixed ${fixedCount} records with "blank" values`);
      
      // Refresh the page to reload data
      window.location.reload();
      
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
      alert(`Error during cleanup: ${error.message}`);
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <>
      {/* Cleanup button */}
      <div className="section-block" style={{ marginBottom: '1rem' }}>
        <button 
          onClick={fixBlankRecords}
          disabled={isCleaningUp}
          style={{
            backgroundColor: isCleaningUp ? '#9ca3af' : '#f59e0b',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: isCleaningUp ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          {isCleaningUp ? '🔄 Cleaning up...' : '🔧 Fix "blank" Records'}
        </button>
      </div>

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

      {/* Monthly Trends by Service */}
      <div className="section-block">
        <BookingsMonthlyTrends
          selectedBookingYear={selectedBookingYear}
        />
      </div>
    </>
  );
}
