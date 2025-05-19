import React from "react";

const FilterBar = ({ agents, selectedAgents, onAgentChange, selectedMonth, onMonthChange, selectedWeek, onWeekChange }) => {
  return (
    <div className="filter-bar">
      <label>Agents:</label>
      <select multiple value={selectedAgents} onChange={(e) => {
        const options = [...e.target.selectedOptions].map(o => o.value);
        onAgentChange(options);
      }}>
        {agents.map(agent => (
          <option key={agent} value={agent}>{agent}</option>
        ))}
      </select>

      <label>Month:</label>
      <select value={selectedMonth} onChange={(e) => onMonthChange(e.target.value)}>
        <option value="">All</option>
        {[...Array(12)].map((_, i) => (
          <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
        ))}
      </select>

      <label>Week:</label>
      <select value={selectedWeek} onChange={(e) => onWeekChange(e.target.value)}>
        <option value="">All</option>
        {[1, 2, 3, 4, 5].map(week => (
          <option key={week} value={week}>Week {week}</option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
