import React from 'react';

export default function StatCard({ label, value, sub, color }) {
  let valueColorClass = 'text-gray-900';
  if (color === 'blue') valueColorClass = 'text-[#185FA5]';
  if (color === 'amber') valueColorClass = 'text-[#854F0B]';
  if (color === 'coral') valueColorClass = 'text-[#993C1D]';
  if (color === 'green') valueColorClass = 'text-[#085041]';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <h3 className={`text-3xl font-bold ${valueColorClass}`}>{value}</h3>
      {sub && <p className="text-xs text-gray-500 mt-2 font-medium">{sub}</p>}
    </div>
  );
}
