import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { store } from '../data/store';
import StatCard from '../components/StatCard';
import VehiclePill from '../components/VehiclePill';
import { ArrowRight, Car, Bike, Truck, Activity, UploadCloud, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [historyList, setHistoryList] = useState(store.getHistory());
  const [stats, setStats] = useState(store.getStats());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setHistoryList(store.getHistory());
      setStats(store.getStats());
    });
    return unsubscribe;
  }, []);

  const { total, mobil, motor, truk } = stats;

  const mobilPct = total ? (mobil / total) * 100 : 0;
  const motorPct = total ? (motor / total) * 100 : 0;
  const trukPct = total ? (truk / total) * 100 : 0;

  const c = 251.2;
  const mobilDash = (mobilPct / 100) * c;
  const motorDash = (motorPct / 100) * c;
  const trukDash = (trukPct / 100) * c;

  const getIcon = (iconName) => {
    if (iconName === 'bike') return <Bike size={18} className="text-[#854F0B]" />;
    if (iconName === 'truck') return <Truck size={18} className="text-[#993C1D]" />;
    return <Car size={18} className="text-[#185FA5]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Ringkasan</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Ikhtisar performa deteksi berbasis citra yang Anda upload secara real-time.
          </p>
        </div>
        {historyList.length > 0 && (
          <button
            onClick={() => store.clearAll()}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
          >
            <Trash2 size={14} /> Reset Data Sesi
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Deteksi Upload" value={total} sub={total ? `↑ ${total} foto terproses` : 'Belum ada upload'} color="green" />
        <StatCard label="Klasifikasi Mobil" value={mobil} sub={total ? `${mobilPct.toFixed(1)}% dari total` : '0%'} color="blue" />
        <StatCard label="Klasifikasi Motor" value={motor} sub={total ? `${motorPct.toFixed(1)}% dari total` : '0%'} color="amber" />
        <StatCard label="Klasifikasi Truk" value={truk} sub={total ? `${trukPct.toFixed(1)}% dari total` : '0%'} color="coral" />
      </div>

      {/* 2 Large Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Donut Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Activity size={20} className="text-[#1D9E75]" /> Distribusi Citra Upload
            </h3>
            <span className="text-xs font-semibold text-gray-400">Pure Dynamic Data</span>
          </div>

          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-3">
              <div className="p-4 bg-gray-50 rounded-full">
                <UploadCloud size={36} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium">Belum ada foto yang di-upload pada sesi ini</p>
              <Link to="/deteksi" className="text-xs font-bold text-[#1D9E75] hover:underline">
                Upload foto pertama Anda &rarr;
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around my-4 gap-6">
              {/* SVG Donut */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="16" fill="transparent" />
                  <circle cx="50" cy="50" r="40" stroke="#185FA5" strokeWidth="16" fill="transparent" strokeDasharray={`${mobilDash} ${c - mobilDash}`} strokeDashoffset={0} />
                  <circle cx="50" cy="50" r="40" stroke="#D97706" strokeWidth="16" fill="transparent" strokeDasharray={`${motorDash} ${c - motorDash}`} strokeDashoffset={-mobilDash} />
                  <circle cx="50" cy="50" r="40" stroke="#E05638" strokeWidth="16" fill="transparent" strokeDasharray={`${trukDash} ${c - trukDash}`} strokeDashoffset={-(mobilDash + motorDash)} />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-gray-800">{total}</span>
                  <span className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">Foto</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#185FA5]"></span>
                    <span className="font-medium text-gray-700">Mobil</span>
                  </div>
                  <span className="font-bold text-gray-900">{mobil} <span className="text-xs font-normal text-gray-400">({mobilPct.toFixed(0)}%)</span></span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#D97706]"></span>
                    <span className="font-medium text-gray-700">Motor</span>
                  </div>
                  <span className="font-bold text-gray-900">{motor} <span className="text-xs font-normal text-gray-400">({motorPct.toFixed(0)}%)</span></span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E05638]"></span>
                    <span className="font-medium text-gray-700">Truk</span>
                  </div>
                  <span className="font-bold text-gray-900">{truk} <span className="text-xs font-normal text-gray-400">({trukPct.toFixed(0)}%)</span></span>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center sm:text-left pt-2 border-t border-gray-100">
            * Statistik dikalkulasi murni dari foto yang telah di-upload pengguna.
          </p>
        </div>

        {/* Right Card: Recent Detections */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Upload Terbaru</h3>
              <span className="text-xs text-gray-400">{historyList.length} Aktivitas</span>
            </div>

            {historyList.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-sm">Riwayat upload masih kosong</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {historyList.slice(0, 4).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3 truncate">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.filename} className="w-10 h-10 object-cover rounded-xl border border-gray-200 shrink-0" />
                      ) : (
                        <div className="p-2.5 bg-gray-100 rounded-xl shrink-0">
                          {getIcon(item.icon)}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px] sm:max-w-[180px]" title={item.filename}>
                          {item.filename}
                        </p>
                        <p className="text-xs text-gray-400">{item.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs font-bold text-gray-600">{item.confidence}%</span>
                      <VehiclePill type={item.vehicle_type} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 mt-2">
            <Link
              to="/riwayat"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-[#1D9E75] hover:text-[#085041] transition-colors w-full py-1.5"
            >
              <span>Lihat Semua Riwayat Upload</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
