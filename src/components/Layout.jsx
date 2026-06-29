import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#F8F8F6]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        <div className="transition-opacity duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
