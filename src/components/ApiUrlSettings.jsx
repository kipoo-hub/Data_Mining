import React, { useState, useEffect, useRef } from 'react';
import { getApiUrl, setApiUrl } from '../utils/apiClient';
import { Settings, ChevronDown, ChevronUp, Check, ExternalLink } from 'lucide-react';

export default function ApiUrlSettings() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [toast, setToast] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setCurrentUrl(getApiUrl());
  }, []);

  // Clear toast timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setApiUrl(trimmed);
    setCurrentUrl(trimmed);
    setUrl('');
    setToast(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(false), 2500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#085041] transition-colors group"
      >
        <Settings size={14} className="group-hover:rotate-90 transition-transform duration-300" />
        <span>Pengaturan Koneksi Model</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Collapsible Panel */}
      {open && (
        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 animate-in">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600" htmlFor="api-url-input">
              URL Backend Flask (ngrok)
            </label>
            <div className="flex gap-2">
              <input
                id="api-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://xxxx.ngrok-free.app/predict"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40 focus:border-[#1D9E75] transition-all placeholder:text-gray-300 font-mono"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={!url.trim()}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  url.trim()
                    ? 'bg-[#1D9E75] hover:bg-[#085041] text-white active:scale-[0.97]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <Check size={14} />
                Simpan
              </button>
            </div>
          </div>

          {/* Current Active URL */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              URL Aktif Saat Ini
            </p>
            <p className="text-xs font-mono text-[#085041] break-all flex items-start gap-1">
              <ExternalLink size={12} className="shrink-0 mt-0.5 text-[#1D9E75]" />
              {currentUrl}
            </p>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="absolute top-0 right-0 bg-[#E1F5EE] border border-[#A3E3CE] text-[#085041] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 z-50 animate-in">
          <Check size={12} className="text-[#1D9E75]" />
          URL backend diperbarui
        </div>
      )}
    </div>
  );
}
