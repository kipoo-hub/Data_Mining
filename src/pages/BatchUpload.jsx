import React, { useState } from 'react';
import UploadZone from '../components/UploadZone';
import VehiclePill from '../components/VehiclePill';
import ApiUrlSettings from '../components/ApiUrlSettings';
import { predictVehicle } from '../utils/apiClient';
import { store } from '../data/store';
import { CONFIDENCE_THRESHOLD, USE_MOCK } from '../config';
import { exportToCSV } from '../utils/exportCsv';
import { Layers, Download, Filter, AlertCircle, Car, Bike, Truck, Loader2, CheckCircle2, X, BrainCircuit, FlaskConical, WifiOff } from 'lucide-react';

function BatchSourceBadge({ source, fallbackReason }) {
  if (source === 'model') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] text-[10px] font-bold border border-[#A3E3CE]">
        <BrainCircuit size={10} className="text-[#1D9E75]" />
        CNN
      </span>
    );
  }
  if (source === 'mock') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F1FB] text-[#185FA5] text-[10px] font-bold border border-[#BEE0F8]">
        <FlaskConical size={10} />
        Demo
      </span>
    );
  }
  if (source === 'fallback') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold border border-[#FDE68A]" title={fallbackReason || ''}>
        <WifiOff size={10} className="text-[#D97706]" />
        Local
      </span>
    );
  }
  return null;
}

export default function BatchUpload() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [filterClass, setFilterClass] = useState('All');
  const [errorBanner, setErrorBanner] = useState(null);

  const handleFilesSelect = (selectedFiles, filePreviews) => {
    setFiles(selectedFiles || []);
    setPreviews(filePreviews || []);
    setResults(null);
    setErrorBanner(null);
  };

  const handleProcessBatch = async () => {
    if (!files || files.length === 0) return;
    setProcessing(true);
    setCurrentIndex(0);
    setErrorBanner(null);
    const processed = [];
    const fallbackReasons = [];

    for (let i = 0; i < files.length; i++) {
      setCurrentIndex(i + 1);
      const pred = await predictVehicle(files[i]);
      const previewUrl = previews[i]?.url || null;

      if (pred.source === 'fallback' && pred.fallbackReason) {
        fallbackReasons.push(`#${i + 1}: ${pred.fallbackReason}`);
      }

      processed.push({
        id: Date.now() + i,
        filename: files[i].name,
        vehicle_type: pred.vehicle_type,
        confidence: pred.confidence,
        all_predictions: pred.all_predictions,
        source: pred.source,
        fallbackReason: pred.fallbackReason || null,
        imageUrl: previewUrl
      });
    }

    // Show consolidated error banner if any items fell back
    if (fallbackReasons.length > 0) {
      setErrorBanner({
        message: `${fallbackReasons.length} of ${files.length} images failed to connect to the CNN backend and used local simulation.`,
        details: fallbackReasons.length <= 3 ? fallbackReasons.join(' | ') : `${fallbackReasons.slice(0, 3).join(' | ')} and ${fallbackReasons.length - 3} more.`,
      });
    }

    setResults(processed);
    setProcessing(false);
    store.addBatchRecords(processed);
  };

  const handleExportCSV = () => {
    if (!results) return;
    const exportData = results.map((item, index) => ({
      No: index + 1,
      'File Name': item.filename,
      Class: item.vehicle_type,
      'Confidence (%)': item.confidence,
      Source: item.source === 'model' ? 'CNN Model' : item.source === 'mock' ? 'Simulation' : 'Local Fallback',
    }));
    exportToCSV(exportData, `Batch_Detection_Result_${Date.now()}.csv`);
  };

  const filteredResults = results
    ? results.filter((r) => filterClass === 'All' || r.vehicle_type === filterClass)
    : [];

  const totalCount = results ? results.length : 0;
  const carCount = results ? results.filter((r) => r.vehicle_type === 'Car').length : 0;
  const motorcycleCount = results ? results.filter((r) => r.vehicle_type === 'Motorcycle').length : 0;
  const truckCount = results ? results.filter((r) => r.vehicle_type === 'Truck').length : 0;

  const c = 188.4;
  const mPct = totalCount ? (carCount / totalCount) : 0;
  const moPct = totalCount ? (motorcycleCount / totalCount) : 0;
  const tPct = totalCount ? (truckCount / totalCount) : 0;

  const mDash = mPct * c;
  const moDash = moPct * c;
  const tDash = tPct * c;

  const getIcon = (type) => {
    if (type === 'Motorcycle') return <Bike size={22} className="text-[#854F0B]" />;
    if (type === 'Truck') return <Truck size={22} className="text-[#993C1D]" />;
    return <Car size={22} className="text-[#185FA5]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header + Settings */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Batch Processing Upload</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload multiple images at once to be classified sequentially via API.
          </p>
        </div>
        <ApiUrlSettings />
      </div>

      {/* Error Banner */}
      {errorBanner && (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs font-medium shadow-sm">
          <div className="flex items-start gap-2.5">
            <WifiOff size={18} className="shrink-0 text-[#D97706] mt-0.5" />
            <div className="space-y-0.5">
              <span>{errorBanner.message}</span>
              {errorBanner.details && (
                <p className="text-[11px] text-[#B45309] font-mono">{errorBanner.details}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="shrink-0 p-1 rounded-lg hover:bg-[#FDE68A] transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Top Left: Upload Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">Upload Multiple Images</h3>
          
          <UploadZone onFileSelect={handleFilesSelect} multiple={true} />

          {files.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-2">
              <p className="font-bold text-gray-700">{files.length} files selected for processing:</p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                {files.slice(0, 4).map((f, i) => (
                  <li key={i} className="truncate">{f.name}</li>
                ))}
                {files.length > 4 && (
                  <li className="font-semibold text-[#1D9E75] list-none pt-1">
                    +{files.length - 4} more files...
                  </li>
                )}
              </ul>
            </div>
          )}

          {processing ? (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-[#1D9E75]" />
                  Processing photo {currentIndex}/{files.length} via {USE_MOCK ? 'Simulation' : 'Flask API Colab'}...
                </span>
                <span>{Math.round((currentIndex / files.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#1D9E75] h-full transition-all duration-300"
                  style={{ width: `${(currentIndex / files.length) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={files.length === 0}
              onClick={handleProcessBatch}
              className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all ${
                files.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-[#1D9E75] hover:bg-[#085041] text-white active:scale-[0.99]'
              }`}
            >
              <Layers size={18} />
              <span>Process All Images ({files.length})</span>
            </button>
          )}
        </div>

        {/* Top Right: Summary Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[340px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Real-Time Batch Summary</h3>
              {results && (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg bg-[#E1F5EE] text-[#085041] hover:bg-[#a3e3ce] text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#a3e3ce]"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {!results ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-2">
                <Layers size={40} className="stroke-1" />
                <p className="text-sm font-medium">Summary will appear after photos are processed</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="30" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                      <circle cx="40" cy="40" r="30" stroke="#185FA5" strokeWidth="12" fill="transparent" strokeDasharray={`${mDash} ${c - mDash}`} strokeDashoffset={0} />
                      <circle cx="40" cy="40" r="30" stroke="#D97706" strokeWidth="12" fill="transparent" strokeDasharray={`${moDash} ${c - moDash}`} strokeDashoffset={-mDash} />
                      <circle cx="40" cy="40" r="30" stroke="#E05638" strokeWidth="12" fill="transparent" strokeDasharray={`${tDash} ${c - tDash}`} strokeDashoffset={-(mDash + moDash)} />
                    </svg>
                    <span className="absolute text-xl font-black text-gray-800">{totalCount}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full sm:w-auto text-center sm:text-left">
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Total Images</p>
                      <p className="text-lg font-black text-gray-800">{totalCount}</p>
                    </div>
                    <div className="bg-[#E6F1FB] p-2.5 rounded-lg border border-[#BEE0F8]">
                      <p className="text-[10px] uppercase font-bold text-[#185FA5]">Car</p>
                      <p className="text-lg font-black text-[#185FA5]">{carCount}</p>
                    </div>
                    <div className="bg-[#FAEEDA] p-2.5 rounded-lg border border-[#FADBA8]">
                      <p className="text-[10px] uppercase font-bold text-[#854F0B]">Motorcycle</p>
                      <p className="text-lg font-black text-[#854F0B]">{motorcycleCount}</p>
                    </div>
                    <div className="bg-[#FAECE7] p-2.5 rounded-lg border border-[#F7C6B8]">
                      <p className="text-[10px] uppercase font-bold text-[#993C1D]">Truck</p>
                      <p className="text-lg font-black text-[#993C1D]">{truckCount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Filter size={14} /> Filter Display by Class:
                  </span>
                  <div className="flex gap-1.5">
                    {['All', 'Car', 'Motorcycle', 'Truck'].map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setFilterClass(cls)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          filterClass === cls
                            ? 'bg-[#1D9E75] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <CheckCircle2 size={20} className="text-[#1D9E75]" /> Processed Original Image Catalog ({filteredResults.length} photos)
            </h3>
            <p className="text-xs text-gray-400">
              * Yellow border cells have confidence &lt; {CONFIDENCE_THRESHOLD}%
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredResults.map((item) => {
              const isLowConf = item.confidence < CONFIDENCE_THRESHOLD;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-3 border flex flex-col justify-between space-y-3 transition-all relative overflow-hidden ${
                    isLowConf
                      ? 'border-amber-400 bg-amber-50/40 shadow-sm'
                      : 'border-gray-200 bg-white hover:shadow-md'
                  }`}
                >
                  {isLowConf && (
                    <span className="absolute top-0 right-0 bg-amber-400 text-amber-950 font-bold text-[9px] px-2 py-0.5 rounded-bl-lg flex items-center gap-0.5 z-10">
                      <AlertCircle size={10} /> Needs Verification
                    </span>
                  )}

                  <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center relative overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.filename} className="w-full h-full object-cover" />
                    ) : (
                      getIcon(item.vehicle_type)
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-800 truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <VehiclePill type={item.vehicle_type} size="sm" />
                      <span className={`text-xs font-extrabold ${isLowConf ? 'text-amber-700' : 'text-gray-700'}`}>
                        {item.confidence}%
                      </span>
                    </div>
                    {/* Source badge per item */}
                    <div className="mt-1.5">
                      <BatchSourceBadge source={item.source} fallbackReason={item.fallbackReason} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
