import React from "react";
import Select from "react-select";
import "./FilterBar.css";

const FilterBar = ({
  agents = [],
  calls = [],
  bookings = [],
  selectedAgents,
  setSelectedAgents,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear
}) => {
  const currentYear = new Date().getFullYear();

  const monthOptions = [...Array(12)].map((_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("default", { month: "long" })
  }));

  const requiredYears = [2022, 2023];

  const extractedYears = Array.from(
    new Set(
      (calls || []).map(call => {
        const date = new Date(call.startDate);
        return isNaN(date) ? null : date.getFullYear();
      }).filter(Boolean)
    )
  );

  const combinedYears = Array.from(new Set([...extractedYears, ...requiredYears])).sort((a, b) => b - a);
  const fallbackYears = [currentYear - 1, currentYear, currentYear + 1];
  const years = combinedYears.length > 0 ? combinedYears : fallbackYears;

  const yearOptions = years.map(y => ({
    value: y,
    label: `${y}`
  }));

  const agentOptions = agents.map(agent => ({
    value: agent,
    label: agent
  }));

  return (
    <div className="filter-bar-horizontal">
      <div className="filter-group">
        <label>Agents:</label>
        <Select
          options={agentOptions}
          isMulti
          value={agentOptions.filter(opt => selectedAgents.includes(opt.value))}
          onChange={(selected) => setSelectedAgents(selected ? selected.map(opt => opt.value) : [])}
        />
      </div>

      <div className="filter-group">
        <label>Month:</label>
        <Select
          options={monthOptions}
          isMulti
          value={monthOptions.filter(opt => selectedMonth.includes(opt.value))}
          onChange={(selected) => setSelectedMonth(selected ? selected.map(opt => opt.value) : [])}
        />
      </div>

      <div className="filter-group">
        <label>Year:</label>
        <Select
          options={yearOptions}
          isMulti
          value={yearOptions.filter(opt => selectedYear.includes(opt.value))}
          onChange={(selected) => setSelectedYear(selected ? selected.map(opt => opt.value) : [])}
        />
      </div>
    </div>
  );
};

export default FilterBar;


