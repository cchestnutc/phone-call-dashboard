import React from "react";
import Select from "react-select";
import "./FilterBar.css";

const FilterBar = ({
  agents,
  selectedAgents,
  onAgentChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  selectedWeek,
  onWeekChange
}) => {
  const currentYear = new Date().getFullYear();

  const monthOptions = [...Array(12)].map((_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("default", { month: "long" })
  }));

  const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map(y => ({
    value: y,
    label: `${y}`
  }));

  const weekOptions = [1, 2, 3, 4, 5].map(w => ({
    value: w,
    label: `Week ${w}`
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
          onChange={(selected) => onAgentChange(selected.map(opt => opt.value))}
        />
      </div>

      <div className="filter-group">
        <label>Month:</label>
        <Select
          options={monthOptions}
          isMulti
          value={monthOptions.filter(opt => selectedMonth.includes(opt.value))}
          onChange={(selected) => onMonthChange(selected.map(opt => opt.value))}
        />
      </div>

      <div className="filter-group">
        <label>Year:</label>
        <Select
          options={yearOptions}
          isMulti
          value={yearOptions.filter(opt => selectedYear.includes(opt.value))}
          onChange={(selected) => onYearChange(selected.map(opt => opt.value))}
        />
      </div>

      <div className="filter-group">
        <label>Week:</label>
        <Select
          options={weekOptions}
          isMulti
          value={weekOptions.filter(opt => selectedWeek.includes(opt.value))}
          onChange={(selected) => onWeekChange(selected.map(opt => opt.value))}
        />
      </div>
    </div>
  );
};

export default FilterBar;

