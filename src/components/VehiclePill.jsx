import React from 'react';
import { Car, Bike, Truck } from 'lucide-react';

export default function VehiclePill({ type, size = 'md' }) {
  let styleClass = 'bg-gray-100 text-gray-700';
  let Icon = Car;

  if (type === 'Mobil') {
    styleClass = 'bg-[#E6F1FB] text-[#185FA5] border border-[#BEE0F8]';
    Icon = Car;
  } else if (type === 'Motor') {
    styleClass = 'bg-[#FAEEDA] text-[#854F0B] border border-[#FADBA8]';
    Icon = Bike;
  } else if (type === 'Truk') {
    styleClass = 'bg-[#FAECE7] text-[#993C1D] border border-[#F7C6B8]';
    Icon = Truck;
  }

  const sizeClass = size === 'sm' 
    ? 'px-2.5 py-0.5 text-xs gap-1 font-semibold' 
    : 'px-3 py-1 text-sm gap-1.5 font-semibold';
    
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <span className={`inline-flex items-center rounded-full ${styleClass} ${sizeClass}`}>
      <Icon size={iconSize} />
      <span>{type}</span>
    </span>
  );
}
