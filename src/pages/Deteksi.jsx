import React, { useState } from 'react';
import UploadZone from '../components/UploadZone';
import ConfidenceBar from '../components/ConfidenceBar';
import VehiclePill from '../components/VehiclePill';
import { simulatePrediction } from '../data/mockData';
import { store } from '../data/store';
import { CONFIDENCE_THRESHOLD } from '../config';
import { ScanLine, Loader2, AlertTriangle, CheckCircle2, RotateCcw, Save, Car, Bike, Truck } from 'lucide-react';

export default function Deteksi() {
  const [fileObj, setFileObj] = useState(null);
  const [previewObj, setPreviewObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleFileSelect = (selectedFile, preview) => {
    setFileObj(selectedFile);
    setPreviewObj(preview);
    setResult(null);
    setSaved(false);
  };

  const handleDetect = () => {
    if (!fileObj) return;
    setLoading(true);
    setResult(null);
    setSaved(false);

    setTimeout(() => {
      const pred = simulatePrediction(fileObj);
      const fullResult = {
        ...pred,
        imageUrl: previewObj?.url || null
      };
      setResult(fullResult);
      setLoading(false);
      
      // Auto save to live session store
      store.addRecord(fullResult);
      setSaved(true);
    }, 1200);
  };

  const handleReset = () => {
    setFileObj(null);
    setPreviewObj(null);
    setResult(null);
    setSaved(false);
  };

  const getVehicleIcon = (type) => {
    if (type === 'Motor') return <Bike size={40} className="text-[#854F0B]" />;
    if (type === 'Truk') return <Truck size={40} className="text-[#993C1D]" />;
    return <Car size={40} className="text-[#185FA5]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Deteksi Citra Kendaraan</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Klasifikasi foto asli yang di-upload menggunakan model CNN secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Upload */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-gray-800 text-lg">Upload Foto Asli</h3>

          <UploadZone onFileSelect={handleFileSelect} multiple={false} />

          <button
            type="button"
            disabled={!fileObj || loading}
            onClick={handleDetect}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all ${
              !fileObj || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-[#1D9E75] hover:bg-[#085041] text-white active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menganalisis Citra CNN...</span>
              </>
            ) : (
              <>
                <ScanLine size={18} />
                <span>Deteksi Foto Ini</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Result */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[380px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4">Hasil Analisis CNN</h3>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="p-4 bg-gray-50 text-gray-300 rounded-full">
                  <ScanLine size={48} />
                </div>
                <div className="max-w-xs">
                  <p className="font-semibold text-gray-600 text-base">Upload foto untuk memulai</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Pilih foto dari komputer Anda lalu klik tombol deteksi.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Loader2 size={40} className="animate-spin text-[#1D9E75]" />
                <p className="text-sm font-medium text-gray-600">
                  Model CNN sedang mengekstrak matriks pixel & matriks ekstraksi fitur...
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                {/* Winner Card with REAL IMAGE PREVIEW */}
                <div className="bg-[#E1F5EE] border border-[#A3E3CE] rounded-xl p-5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-4">
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.filename}
                        className="w-16 h-16 object-cover rounded-xl border-2 border-white shadow-md shrink-0"
                      />
                    ) : (
                      <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
                        {getVehicleIcon(result.vehicle_type)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-[#085041] uppercase tracking-wider">
                        Hasil Klasifikasi
                      </p>
                      <h4 className="text-2xl font-black text-[#085041]">
                        {result.vehicle_type}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-mono truncate max-w-[140px]">
                        {result.filename}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-3xl font-extrabold text-[#085041]">
                      {result.confidence}%
                    </span>
                    <p className="text-[11px] text-[#1D9E75] font-semibold">Tingkat Kepercayaan</p>
                  </div>
                </div>

                {/* Warning Banner if Low Confidence */}
                {result.confidence < CONFIDENCE_THRESHOLD && (
                  <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-xl p-3.5 flex items-center space-x-3 text-xs font-medium shadow-sm">
                    <AlertTriangle size={20} className="shrink-0 text-[#D97706]" />
                    <span>
                      <strong>Confidence Rendah ({result.confidence}%):</strong> Hasil di bawah threshold {CONFIDENCE_THRESHOLD}%. Disarankan verifikasi manual.
                    </span>
                  </div>
                )}

                {/* Confidence Bar Chart */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Distribusi Probabilitas Softmax
                  </p>
                  <ConfidenceBar predictions={result.all_predictions} winner={result.vehicle_type} />
                </div>
              </div>
            )}
          </div>

          {result && !loading && (
            <div className="pt-6 border-t border-gray-100 flex items-center gap-3 mt-4">
              <div className="flex-1 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 text-sm bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>Otomatis Tersimpan ke Riwayat</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw size={16} />
                <span>Upload Baru</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
