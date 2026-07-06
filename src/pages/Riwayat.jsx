import React, { useState, useEffect } from 'react';
import { store } from '../data/store';
import { CONFIDENCE_THRESHOLD } from '../config';
import VehiclePill from '../components/VehiclePill';
import { exportToCSV } from '../utils/exportCsv';
import { Search, Filter, Download, Trash2, ChevronLeft, ChevronRight, History, Car, Bike, Truck } from 'lucide-react';

export default function Riwayat() {
  const [historyList, setHistoryList] = useState(store.getHistory());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterConf, setFilterConf] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setHistoryList(store.getHistory());
    });
    return unsubscribe;
  }, []);

  const handleDelete = (id) => {
    store.deleteRecord(id);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all upload history?')) {
      store.clearAll();
    }
  };

  const handleExportCSV = () => {
    const dataToExport = filteredData.map((item, index) => ({
      No: index + 1,
      'File Name': item.filename,
      Class: item.vehicle_type,
      'Confidence (%)': item.confidence,
      Time: item.timestamp
    }));
    exportToCSV(dataToExport, `Detection_History_VehicleVision_${Date.now()}.csv`);
  };

  const filteredData = historyList.filter((item) => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || item.vehicle_type === filterClass;
    let matchesConf = true;
    if (filterConf === 'High') matchesConf = item.confidence >= CONFIDENCE_THRESHOLD;
    if (filterConf === 'Low') matchesConf = item.confidence < CONFIDENCE_THRESHOLD;

    return matchesSearch && matchesClass && matchesConf;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getBarColor = (type) => {
    if (type === 'Car') return 'bg-[#185FA5]';
    if (type === 'Motorcycle') return 'bg-[#D97706]';
    return 'bg-[#E05638]';
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Original Image Detection History</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Complete history of all images you have uploaded in this session.
          </p>
        </div>
        {historyList.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
          >
            <Trash2 size={14} /> Clear History
          </button>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Class:</span>
              <select
                value={filterClass}
                onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-auto py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1D9E75]"
              >
                <option value="All">All Classes</option>
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Accuracy:</span>
              <select
                value={filterConf}
                onChange={(e) => { setFilterConf(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-auto py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1D9E75]"
              >
                <option value="All">All Confidence</option>
                <option value="High">High (&ge;70%)</option>
                <option value="Low">Low (&lt;70%)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={filteredData.length === 0}
            onClick={handleExportCSV}
            className="w-full md:w-auto py-2 px-4 rounded-xl bg-[#1D9E75] hover:bg-[#085041] disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Photo / File Name</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-medium">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <History size={36} className="mx-auto mb-2 stroke-1" />
                    <p>No photos have been uploaded in this session</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const isLowConf = item.confidence < CONFIDENCE_THRESHOLD;
                  const rowNum = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${isLowConf ? 'bg-amber-50/70 hover:bg-amber-100/60' : 'hover:bg-gray-50/80'}`}
                    >
                      <td className="py-3.5 px-4 text-gray-400 text-xs font-mono">{rowNum}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        <div className="flex items-center space-x-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.filename} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0" />
                          ) : (
                            <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                              {getIcon(item.icon)}
                            </div>
                          )}
                          <span className="truncate max-w-[180px]" title={item.filename}>{item.filename}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <VehiclePill type={item.vehicle_type} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3 max-w-[140px]">
                          <span className={`font-bold ${isLowConf ? 'text-red-600' : 'text-gray-800'}`}>
                            {item.confidence}%
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${getBarColor(item.vehicle_type)}`}
                              style={{ width: `${item.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">{item.timestamp}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Delete this record"
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-gray-500">
            Showing <span className="font-bold">{paginatedData.length}</span> of <span className="font-bold">{filteredData.length}</span> upload records
          </p>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-gray-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
