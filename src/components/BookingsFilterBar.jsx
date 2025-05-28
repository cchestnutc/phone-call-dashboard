import React from "react";
import Select from "react-select";
import "./FilterBar.css";

const BookingsFilterBar = ({
  selectedBookingMonth,
  setSelectedBookingMonth,
  selectedBookingYear,
  setSelectedBookingYear,
  bookings = []
}) => {
  const currentYear = new Date().getFullYear();

  const monthOptions = [...Array(12)].map((_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("default", { month: "long" })
  }));

  const extractedYears = Array.from(
    new Set(
      (bookings || []).map(booking => {
        const date = new Date(booking.start);
        return isNaN(date) ? null : date.getFullYear();
      }).filter(Boolean)
    )
  );

  const fallbackYears = [currentYear - 1, currentYear, currentYear + 1];
  const years = extractedYears.length > 0 ? extractedYears : fallbackYears;

  const yearOptions = years.map(y => ({ value: y, label: `${y}` }));

  return (
    <div className="filter-bar-horizontal">
      <div className="filter-group">
        <label>Booking Month:</label>
        <Select
          options={monthOptions}
          value={monthOptions.find(opt => opt.value === selectedBookingMonth)}
          onChange={(selected) => setSelectedBookingMonth(selected?.value || null)}
        />
      </div>

      <div className="filter-group">
        <label>Booking Year:</label>
        <Select
          options={yearOptions}
          value={yearOptions.find(opt => opt.value === selectedBookingYear)}
          onChange={(selected) => setSelectedBookingYear(selected?.value || null)}
        />
      </div>
    </div>
  );
};

export default BookingsFilterBar;



