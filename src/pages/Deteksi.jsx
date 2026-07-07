import React, { useState } from 'react';
import UploadZone from '../components/UploadZone';
import ConfidenceBar from '../components/ConfidenceBar';
import VehiclePill from '../components/VehiclePill';
import ApiUrlSettings from '../components/ApiUrlSettings';
import { predictVehicle } from '../utils/apiClient';
import { store } from '../data/store';
import { CONFIDENCE_THRESHOLD, USE_MOCK } from '../config';
import { ScanLine, Loader2, AlertTriangle, CheckCircle2, RotateCcw, Car, Bike, Truck, Sparkles, X, BrainCircuit, FlaskConical, WifiOff } from 'lucide-react';

function SourceBadge({ source, fallbackReason }) {
  if (source === 'model') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1F5EE] text-[#085041] text-xs font-bold border border-[#A3E3CE]">
        <BrainCircuit size={13} className="text-[#1D9E75]" />
        Prediction from CNN Model
      </span>
    );
  }
  if (source === 'mock') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1FB] text-[#185FA5] text-xs font-bold border border-[#BEE0F8]">
        <FlaskConical size={13} />
        Simulation Mode (Demo)
      </span>
    );
  }
  if (source === 'fallback') {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold border border-[#FDE68A]">
          <WifiOff size={13} className="text-[#D97706]" />
          ⚠ Backend not connected — local simulation result, NOT from model
        </span>
        {fallbackReason && (
          <p className="text-[11px] text-gray-400 pl-1 font-mono">
            Reason: {fallbackReason}
          </p>
        )}
      </div>
    );
  }
  return null;
}

export default function Deteksi() {
  const [fileObj, setFileObj] = useState(null);
  const [previewObj, setPreviewObj] = useState(null);
  const [targetClass, setTargetClass] = useState('Auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const handleFileSelect = (selectedFile, preview) => {
    setFileObj(selectedFile);
    setPreviewObj(preview);
    setResult(null);
    setSaved(false);
    setErrorBanner(null);
  };

  const handleDetect = async () => {
    if (!fileObj) return;
    setLoading(true);
    setResult(null);
    setSaved(false);
    setErrorBanner(null);

    const forced = targetClass === 'Auto' ? null : targetClass;

    try {
      const pred = await predictVehicle(fileObj, forced);

      // Show non-blocking banner if fallback was triggered
      if (pred.source === 'fallback') {
        setErrorBanner({
          message: `API Connection Failed: ${pred.fallbackReason || 'Unknown error'}. The result below is a local simulation, NOT from the CNN model.`,
        });
      }

      const fullResult = {
        ...pred,
        imageUrl: previewObj?.url || null
      };
      setResult(fullResult);
      store.addRecord(fullResult);
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFileObj(null);
    setPreviewObj(null);
    setResult(null);
    setSaved(false);
    setErrorBanner(null);
  };

  const getVehicleIcon = (type) => {
    if (type === 'Motorcycle') return <Bike size={40} className="text-[#854F0B]" />;
    if (type === 'Truck') return <Truck size={40} className="text-[#993C1D]" />;
    return <Car size={40} className="text-[#185FA5]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header + Settings */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Image Detection</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Classify uploaded original photos using the CNN model in real-time.
          </p>
        </div>
        <ApiUrlSettings />
      </div>

      {/* Error Banner (replaces browser alert) */}
      {errorBanner && (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs font-medium shadow-sm">
          <div className="flex items-start gap-2.5">
            <WifiOff size={18} className="shrink-0 text-[#D97706] mt-0.5" />
            <span>{errorBanner.message}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Upload */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-gray-800 text-lg">Upload Original Photo</h3>

          <UploadZone onFileSelect={handleFileSelect} multiple={false} />

          {/* Demo Mode Smart Tag Helper */}
          {USE_MOCK && fileObj && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[#085041]">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#1D9E75]" /> Target Vehicle Tag (Demo Mode)
                </span>
                <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded text-[#085041]">Simulation</span>
              </div>
              <p className="text-gray-600 text-[11px]">
                Make sure the vehicle type in the photo matches for 100% precise simulation prediction:
              </p>
              <div className="flex gap-1.5 pt-1">
                {[
                  { id: 'Auto', label: '⚡ Auto Visual' },
                  { id: 'Car', label: '🚗 Car' },
                  { id: 'Motorcycle', label: '🏍️ Motorcycle' },
                  { id: 'Truck', label: '🚚 Truck' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetClass(item.id)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                      targetClass === item.id
                        ? 'bg-[#1D9E75] text-white shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                <span>{USE_MOCK ? 'Analyzing Image Pixels...' : 'Sending to Flask API Colab...'}</span>
              </>
            ) : (
              <>
                <ScanLine size={18} />
                <span>Detect This Photo</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Result */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[380px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4">CNN Analysis Result</h3>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="p-4 bg-gray-50 text-gray-300 rounded-full">
                  <ScanLine size={48} />
                </div>
                <div className="max-w-xs">
                  <p className="font-semibold text-gray-600 text-base">Upload a photo to get started</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Select a photo from your computer then click the detect button.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Loader2 size={40} className="animate-spin text-[#1D9E75]" />
                <p className="text-sm font-medium text-gray-600">
                  {USE_MOCK ? 'Extracting pixel matrix...' : 'Waiting for response from model_project.h5 Colab...'}
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                {/* Source Badge */}
                <div>
                  <SourceBadge source={result.source} fallbackReason={result.fallbackReason} />
                </div>

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
                        Classification Result
                      </p>
                      <h4 className="text-2xl font-black text-[#085041]">
                        {result.raw_label || result.vehicle_type}
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
                    <p className="text-[11px] text-[#1D9E75] font-semibold">Confidence Level</p>
                  </div>
                </div>

                {/* Warning Banner if Low Confidence */}
                {result.confidence < CONFIDENCE_THRESHOLD && (
                  <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-xl p-3.5 flex items-center space-x-3 text-xs font-medium shadow-sm">
                    <AlertTriangle size={20} className="shrink-0 text-[#D97706]" />
                    <span>
                      <strong>Low Confidence ({result.confidence}%):</strong> Result is below the {CONFIDENCE_THRESHOLD}% threshold. Manual verification is recommended.
                    </span>
                  </div>
                )}

                {/* Confidence Bar Chart */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Softmax Probability Distribution (API Colab)
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
                <span>Automatically Saved to History</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw size={16} />
                <span>New Upload</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
