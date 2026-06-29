import React, { useState } from 'react';
import UploadZone from '../components/UploadZone';
import VehiclePill from '../components/VehiclePill';
import { simulatePrediction } from '../data/mockData';
import { store } from '../data/store';
import { CONFIDENCE_THRESHOLD } from '../config';
import { exportToCSV } from '../utils/exportCsv';
import { Layers, Download, Filter, AlertCircle, Car, Bike, Truck, Loader2, CheckCircle2 } from 'lucide-react';

export default function BatchUpload() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [filterClass, setFilterClass] = useState('Semua');

  const handleFilesSelect = (selectedFiles, filePreviews) => {
    setFiles(selectedFiles || []);
    setPreviews(filePreviews || []);
    setResults(null);
  };

  const handleProcessBatch = async () => {
    if (!files || files.length === 0) return;
    setProcessing(true);
    setCurrentIndex(0);
    const processed = [];

    for (let i = 0; i < files.length; i++) {
      setCurrentIndex(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 250));
      const pred = simulatePrediction(files[i]);
      const previewUrl = previews[i]?.url || null;
      processed.push({
        id: Date.now() + i,
        filename: files[i].name,
        vehicle_type: pred.vehicle_type,
        confidence: pred.confidence,
        all_predictions: pred.all_predictions,
        imageUrl: previewUrl
      });
    }

    setResults(processed);
    setProcessing(false);

    // Add to dynamic store
    store.addBatchRecords(processed);
  };

  const handleExportCSV = () => {
    if (!results) return;
    const exportData = results.map((item, index) => ({
      No: index + 1,
      'Nama File': item.filename,
      Kelas: item.vehicle_type,
      'Confidence (%)': item.confidence
    }));
    exportToCSV(exportData, `Batch_Detection_Result_${Date.now()}.csv`);
  };

  const filteredResults = results
    ? results.filter((r) => filterClass === 'Semua' || r.vehicle_type === filterClass)
    : [];

  const totalCount = results ? results.length : 0;
  const mobilCount = results ? results.filter((r) => r.vehicle_type === 'Mobil').length : 0;
  const motorCount = results ? results.filter((r) => r.vehicle_type === 'Motor').length : 0;
  const trukCount = results ? results.filter((r) => r.vehicle_type === 'Truk').length : 0;

  const c = 188.4;
  const mPct = totalCount ? (mobilCount / totalCount) : 0;
  const moPct = totalCount ? (motorCount / totalCount) : 0;
  const tPct = totalCount ? (trukCount / totalCount) : 0;

  const mDash = mPct * c;
  const moDash = moPct * c;
  const tDash = tPct * c;

  const getIcon = (type) => {
    if (type === 'Motor') return <Bike size={22} className="text-[#854F0B]" />;
    if (type === 'Truk') return <Truck size={22} className="text-[#993C1D]" />;
    return <Car size={22} className="text-[#185FA5]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Batch Processing Upload</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload banyak foto citra sekaligus untuk diklasifikasikan secara berurutan.
        </p>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Top Left: Upload Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">Upload Multiple Citra</h3>
          
          <UploadZone onFileSelect={handleFilesSelect} multiple={true} />

          {files.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-2">
              <p className="font-bold text-gray-700">{files.length} file dipilih untuk diproses:</p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                {files.slice(0, 4).map((f, i) => (
                  <li key={i} className="truncate">{f.name}</li>
                ))}
                {files.length > 4 && (
                  <li className="font-semibold text-[#1D9E75] list-none pt-1">
                    +{files.length - 4} file lainnya...
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
                  Memproses foto {currentIndex}/{files.length}...
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
              <span>Proses Semua Citra Ini ({files.length})</span>
            </button>
          )}
        </div>

        {/* Top Right: Summary Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[340px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Ringkasan Batch Real-Time</h3>
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
                <p className="text-sm font-medium">Ringkasan akan tampil setelah foto selesai diproses</p>
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
                      <p className="text-[10px] uppercase font-bold text-gray-400">Total Citra</p>
                      <p className="text-lg font-black text-gray-800">{totalCount}</p>
                    </div>
                    <div className="bg-[#E6F1FB] p-2.5 rounded-lg border border-[#BEE0F8]">
                      <p className="text-[10px] uppercase font-bold text-[#185FA5]">Mobil</p>
                      <p className="text-lg font-black text-[#185FA5]">{mobilCount}</p>
                    </div>
                    <div className="bg-[#FAEEDA] p-2.5 rounded-lg border border-[#FADBA8]">
                      <p className="text-[10px] uppercase font-bold text-[#854F0B]">Motor</p>
                      <p className="text-lg font-black text-[#854F0B]">{motorCount}</p>
                    </div>
                    <div className="bg-[#FAECE7] p-2.5 rounded-lg border border-[#F7C6B8]">
                      <p className="text-[10px] uppercase font-bold text-[#993C1D]">Truk</p>
                      <p className="text-lg font-black text-[#993C1D]">{trukCount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Filter size={14} /> Filter Tampilan Kelas:
                  </span>
                  <div className="flex gap-1.5">
                    {['Semua', 'Mobil', 'Motor', 'Truk'].map((cls) => (
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

      {/* Bottom Section: Grid 5 Columns with REAL IMAGES */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <CheckCircle2 size={20} className="text-[#1D9E75]" /> Katalog Citra Asli Terproses ({filteredResults.length} foto)
            </h3>
            <p className="text-xs text-gray-400">
              * Cell border kuning memiliki confidence &lt; {CONFIDENCE_THRESHOLD}%
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
                      <AlertCircle size={10} /> Perlu Verifikasi
                    </span>
                  )}

                  {/* REAL Image thumbnail display */}
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
