import React from "react";
import Select from "react-select";
import "./FilterBar.css";

const BookingFilterBar = ({
  bookings,
  selectedBookingMonth,
  setSelectedBookingMonth,
  selectedBookingYear,
  setSelectedBookingYear
}) => {
  const currentYear = new Date().getFullYear();
  
  const monthOptions = [...Array(12)].map((_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("default", { month: "long" })
  }));

  const extractedYears = Array.from(
    new Set(
      (bookings || [])
        .map(b => {
          const date = new Date(b.start);
          return isNaN(date) ? null : date.getFullYear();
        })
        .filter(Boolean)
    )
  );

  // Always include at least the current year
  const allYears = Array.from(
    new Set([...extractedYears, currentYear])
  ).sort((a, b) => b - a);

  const yearOptions = allYears.map(y => ({ value: y, label: `${y}` }));

  return (
    <div className="filter-bar-horizontal">
      <div className="filter-group">
        <label>Booking Month:</label>
        <Select
          options={monthOptions}
          isMulti
          value={monthOptions.filter(opt => selectedBookingMonth.includes(opt.value))}
          onChange={selected =>
            setSelectedBookingMonth(selected ? selected.map(opt => opt.value) : [])
          }
        />
      </div>

      <div className="filter-group">
        <label>Booking Year:</label>
        <Select
          options={yearOptions}
          isMulti
          value={yearOptions.filter(opt => selectedBookingYear.includes(opt.value))}
          onChange={selected =>
            setSelectedBookingYear(selected ? selected.map(opt => opt.value) : [])
          }
        />
      </div>
    </div>
  );
};

export default BookingFilterBar;
