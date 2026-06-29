import React from 'react';

export default function ConfidenceBar({ predictions, winner }) {
  if (!predictions) return null;

  const classes = [
    { name: 'Mobil', barColor: 'bg-[#185FA5]', textColor: 'text-[#185FA5]' },
    { name: 'Motor', barColor: 'bg-[#D97706]', textColor: 'text-[#854F0B]' },
    { name: 'Truk', barColor: 'bg-[#E05638]', textColor: 'text-[#993C1D]' }
  ];

  return (
    <div className="space-y-3 w-full">
      {classes.map(({ name, barColor, textColor }) => {
        const value = predictions[name] || 0;
        const isWinner = winner === name;

        return (
          <div key={name} className="space-y-1">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className={isWinner ? `font-bold ${textColor}` : 'text-gray-600'}>
                {name} {isWinner && '✓'}
              </span>
              <span className={isWinner ? `font-bold ${textColor}` : 'text-gray-600'}>
                {value.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`${barColor} ${isWinner ? 'h-3' : 'h-2.5'} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
