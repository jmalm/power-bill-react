"use client";

import React from 'react';

interface MonthSelectorProps {
  months: { year: number; month: number }[];
  selectedMonth: { year: number; month: number } | null;
  onMonthChange: (year: number, month: number) => void;
  className?: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthSelector({ 
  months, 
  selectedMonth, 
  onMonthChange,
  className = '' 
}: MonthSelectorProps) {
  if (months.length === 0) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = e.target.value.split('-').map(Number);
    onMonthChange(year, month);
  };

  // Sort months chronologically (newest first)
  const sortedMonths = [...months].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  // Set default selected value
  const selectedValue = selectedMonth 
    ? `${selectedMonth.year}-${selectedMonth.month}`
    : `${sortedMonths[0].year}-${sortedMonths[0].month}`;

  return (
    <div className={`flex items-center ${className}`}>
      <label htmlFor="month-select" className="mr-2 text-sm font-medium">
        Select Month:
      </label>
      <select
        id="month-select"
        value={selectedValue}
        onChange={handleChange}
        className="p-2 border border-gray-300 rounded-md bg-white text-sm"
      >
        {sortedMonths.map(({ year, month }) => (
          <option key={`${year}-${month}`} value={`${year}-${month}`}>
            {monthNames[month]} {year}
          </option>
        ))}
      </select>
    </div>
  );
}
