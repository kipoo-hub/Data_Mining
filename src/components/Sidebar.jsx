import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ScanLine, LayoutGrid, Wand2, History, Info, Car } from 'lucide-react';
import ApiStatus from './ApiStatus';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/deteksi', label: 'Detailed Detection', icon: ScanLine },
    { path: '/batch', label: 'Batch Upload', icon: LayoutGrid },
    { path: '/augmentasi', label: 'Augmentation Comparison', icon: Wand2 },
    { path: '/riwayat', label: 'Detection History', icon: History },
    { path: '/tentang', label: 'About Model', icon: Info },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="p-2.5 bg-[#1D9E75] text-white rounded-xl shadow-sm">
            <Car size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">VehicleVision</h1>
            <p className="text-xs text-gray-400 font-medium">CNN Classifier</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E1F5EE] text-[#085041] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / API status */}
      <div className="pt-4 border-t border-gray-100">
        <ApiStatus />
      </div>
    </aside>
  );
}
