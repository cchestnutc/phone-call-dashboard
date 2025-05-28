import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, bookingsDb } from "./firebase";
import AgentSummary from "./components/AgentSummary";
import HourlyBreakdown from "./components/HourlyBreakdown";
import MonthlyCallVolumeChart from "./components/MonthlyCallVolumeChart";
import BookingsSummaryChart from "./components/BookingsSummaryChart";
import FilterBar from "./components/FilterBar";
import BookingFilterBar from "./components/BookingFilterBar";
import "./App.css";

function App() {
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);

  const [selectedBookingMonth, setSelectedBookingMonth] = useState([]);
  const [selectedBookingYear, setSelectedBookingYear] = useState([]);

  useEffect(() => {
    const fetchCalls = async () => {
      const snapshot = await getDocs(collection(db, "phone_calls"));
      const callData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCalls(callData);
    };

    fetchCalls();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      const snapshot = await getDocs(collection(bookingsDb, "bookings-appointments"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const filtered = calls.filter(call => {
      const date = new Date(call.startDate);
      const yearMatch = selectedYear.length === 0 || selectedYear.includes(date.getFullYear());
      const monthMatch = selectedMonth.length === 0 || selectedMonth.includes(date.getMonth() + 1);
      const agentMatch = selectedAgents.length === 0 || selectedAgents.includes(call.agent);
      return yearMatch && monthMatch && agentMatch;
    });
    setFilteredCalls(filtered);
  }, [calls, selectedYear, selectedMonth, selectedAgents]);

  useEffect(() => {
    const filtered = bookings.filter(booking => {
      const date = new Date(booking.start);
      const yearMatch = selectedBookingYear.length === 0 || selectedBookingYear.includes(date.getFullYear());
      const monthMatch = selectedBookingMonth.length === 0 || selectedBookingMonth.includes(date.getMonth() + 1);
      return yearMatch && monthMatch;
    });
    setFilteredBookings(filtered);
  }, [bookings, selectedBookingYear, selectedBookingMonth]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Help Desk Dashboard</h1>

      <FilterBar
        agents={calls.map(call => call.agent).filter((v, i, a) => v && a.indexOf(v) === i)}
        calls={calls}
        selectedAgents={selectedAgents}
        setSelectedAgents={setSelectedAgents}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      <div className="summary-breakdown-container">
        <div className="agent-summary">
          <AgentSummary calls={filteredCalls} />
        </div>
        <div className="hourly-breakdown">
          <HourlyBreakdown calls={filteredCalls} />
        </div>
        <div className="monthly-chart">
          <MonthlyCallVolumeChart calls={filteredCalls} />
        </div>
      </div>

      <BookingFilterBar
        bookings={bookings}
        selectedBookingMonth={selectedBookingMonth}
        setSelectedBookingMonth={setSelectedBookingMonth}
        selectedBookingYear={selectedBookingYear}
        setSelectedBookingYear={setSelectedBookingYear}
      />

      <div className="monthly-chart">
        <BookingsSummaryChart
          selectedBookingMonth={selectedBookingMonth}
          selectedBookingYear={selectedBookingYear}
        />
      </div>
    </div>
  );
}

export default App;
