import React from 'react';
import { USE_MOCK, API_URL } from '../config';
import { Wifi, Server } from 'lucide-react';

export default function ApiStatus() {
  const truncatedUrl = API_URL.length > 22 ? API_URL.substring(0, 22) + '...' : API_URL;

  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 font-medium flex items-center gap-1">
          <Server size={14} /> Backend Status
        </span>
        {USE_MOCK ? (
          <span className="px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-semibold text-[11px] border border-[#FADBA8]">
            Mode Demo
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-semibold text-[11px] border border-[#A3E3CE] flex items-center gap-1">
            <Wifi size={10} className="animate-pulse" /> API Aktif
          </span>
        )}
      </div>
      <p className="text-gray-400 font-mono text-[10px] truncate" title={API_URL}>
        {USE_MOCK ? 'Menggunakan data simulasi local' : truncatedUrl}
      </p>
    </div>
  );
}
