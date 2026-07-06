import React from 'react';
import { USE_MOCK } from '../config';
import { getApiUrl } from '../utils/apiClient';
import { Wifi, Server } from 'lucide-react';

export default function ApiStatus() {
  const activeUrl = getApiUrl();
  const truncatedUrl = activeUrl.length > 22 ? activeUrl.substring(0, 22) + '...' : activeUrl;

  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 font-medium flex items-center gap-1">
          <Server size={14} /> Backend Status
        </span>
        {USE_MOCK ? (
          <span className="px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-semibold text-[11px] border border-[#FADBA8]">
            Demo Mode
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-semibold text-[11px] border border-[#A3E3CE] flex items-center gap-1">
            <Wifi size={10} className="animate-pulse" /> API Active
          </span>
        )}
      </div>
      <p className="text-gray-400 font-mono text-[10px] truncate" title={activeUrl}>
        {USE_MOCK ? 'Using local simulation data' : truncatedUrl}
      </p>
    </div>
  );
}
