import React, { useState } from 'react';
import UploadZone from '../components/UploadZone';
import VehiclePill from '../components/VehiclePill';
import { simulateAugmentation } from '../data/mockData';
import { exportToCSV } from '../utils/exportCsv';
import { Wand2, Loader2, Download, CheckCircle2, AlertTriangle, FlipHorizontal, ZoomIn, Sun, ZoomOut, RotateCw, Award, Image as ImageIcon } from 'lucide-react';

export default function KomparasiAugmentasi() {
  const [fileObj, setFileObj] = useState(null);
  const [previewObj, setPreviewObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [augResults, setAugResults] = useState(null);

  const handleFileSelect = (selectedFile, preview) => {
    setFileObj(selectedFile);
    setPreviewObj(preview);
    setAugResults(null);
  };

  const handleCompare = () => {
    if (!fileObj) return;
    setLoading(true);
    setAugResults(null);

    setTimeout(() => {
      const res = simulateAugmentation(fileObj);
      setAugResults(res);
      setLoading(false);
    }, 1800);
  };

  const getAugIcon = (iconName) => {
    if (iconName === 'FlipHorizontal') return <FlipHorizontal size={20} className="text-[#1D9E75]" />;
    if (iconName === 'ZoomIn') return <ZoomIn size={20} className="text-[#1D9E75]" />;
    if (iconName === 'Sun') return <Sun size={20} className="text-[#1D9E75]" />;
    if (iconName === 'ZoomOut') return <ZoomOut size={20} className="text-[#1D9E75]" />;
    return <RotateCw size={20} className="text-[#1D9E75]" />;
  };

  let avgConf = 0;
  let consistentCount = 0;
  let bestAug = null;
  let worstAug = null;
  let isRobust = false;

  if (augResults && augResults.length > 0) {
    const totalConf = augResults.reduce((acc, curr) => acc + curr.confidence, 0);
    avgConf = (totalConf / augResults.length).toFixed(1);

    const firstClass = augResults[0].vehicle_type;
    consistentCount = augResults.filter(r => r.vehicle_type === firstClass).length;
    isRobust = consistentCount === augResults.length;

    bestAug = [...augResults].sort((a, b) => b.confidence - a.confidence)[0];
    worstAug = [...augResults].sort((a, b) => a.confidence - b.confidence)[0];
  }

  const handleExportCSV = () => {
    if (!augResults) return;
    const dataToExport = augResults.map((item, index) => ({
      No: index + 1,
      'Augmentation Technique': item.technique,
      'Predicted Class': item.vehicle_type,
      'Confidence (%)': item.confidence
    }));
    exportToCSV(dataToExport, `Augmentation_Analysis_${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Smart Data Augmentation Comparison</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Test the CNN model's robustness against 5 augmentation variations using your uploaded photo.
        </p>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Top Left: Upload Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">Upload Original Sample Photo</h3>

          <UploadZone onFileSelect={handleFileSelect} multiple={false} />

          <button
            type="button"
            disabled={!fileObj || loading}
            onClick={handleCompare}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all ${
              !fileObj || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-[#1D9E75] hover:bg-[#085041] text-white active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Applying Augmentations...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Compare Augmentations for This Photo</span>
              </>
            )}
          </button>
        </div>

        {/* Top Right: Conclusion Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[340px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Real-Time Analysis Conclusion</h3>
              {augResults && (
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

            {!augResults ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-2">
                <Wand2 size={40} className="stroke-1" />
                <p className="text-sm font-medium">Upload an original photo and click the button to analyze model robustness</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Average Confidence</p>
                    <p className="text-xl font-extrabold text-gray-800">{avgConf}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Prediction Consistency</p>
                    <p className="text-xl font-extrabold text-[#085041]">{consistentCount}/5 Same Class</p>
                  </div>
                  <div className="bg-[#E1F5EE] p-3 rounded-xl border border-[#A3E3CE]">
                    <p className="text-[11px] font-semibold text-[#085041] uppercase">Best Augmentation</p>
                    <p className="text-xs font-bold text-[#085041] truncate">{bestAug?.technique}</p>
                    <p className="text-lg font-black text-[#085041]">{bestAug?.confidence}%</p>
                  </div>
                  <div className="bg-[#FAEEDA] p-3 rounded-xl border border-[#FADBA8]">
                    <p className="text-[11px] font-semibold text-[#854F0B] uppercase">Lowest Augmentation</p>
                    <p className="text-xs font-bold text-[#854F0B] truncate">{worstAug?.technique}</p>
                    <p className="text-lg font-black text-[#854F0B]">{worstAug?.confidence}%</p>
                  </div>
                </div>

                {isRobust ? (
                  <div className="bg-[#E1F5EE] border border-[#A3E3CE] text-[#085041] rounded-xl p-3.5 flex items-center space-x-3 text-xs font-semibold shadow-sm">
                    <CheckCircle2 size={20} className="shrink-0 text-[#1D9E75]" />
                    <span><strong>Model Robust:</strong> All 5 visual augmentation results predict the same consistent class.</span>
                  </div>
                ) : (
                  <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-xl p-3.5 flex items-center space-x-3 text-xs font-semibold shadow-sm">
                    <AlertTriangle size={20} className="shrink-0 text-[#D97706]" />
                    <span><strong>Model Sensitive:</strong> Confidence fluctuation detected on certain transformations.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Grid 5 Augmentations with VISUAL AUGMENTED REAL IMAGE */}
      {augResults && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-gray-800 text-lg">
            Visual Transformation &amp; CNN Classification of Your Photo
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {augResults.slice(0, 3).map((item) => renderAugCell(item, bestAug, worstAug, getAugIcon, previewObj?.url))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {augResults.slice(3, 5).map((item) => renderAugCell(item, bestAug, worstAug, getAugIcon, previewObj?.url))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderAugCell(item, bestAug, worstAug, getAugIcon, imageUrl) {
  const isBest = bestAug && item.technique === bestAug.technique;
  const isWorst = worstAug && item.technique === worstAug.technique;

  let borderClass = 'border-gray-200 bg-white';
  if (isBest) borderClass = 'border-[#1D9E75] bg-[#E1F5EE]/30 shadow-md ring-1 ring-[#1D9E75]';
  if (isWorst) borderClass = 'border-amber-400 bg-amber-50/30 shadow-sm';

  return (
    <div
      key={item.technique}
      className={`rounded-xl p-4 border flex flex-col justify-between space-y-3 relative overflow-hidden transition-all ${borderClass}`}
    >
      {isBest && (
        <span className="absolute top-0 right-0 bg-[#1D9E75] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1 z-10">
          <Award size={12} /> Best
        </span>
      )}
      {isWorst && (
        <span className="absolute top-0 right-0 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1 z-10">
          <AlertTriangle size={12} /> Lowest
        </span>
      )}

      {/* Header icon + name */}
      <div className="flex items-center space-x-3 pt-1">
        <div className="p-2 bg-gray-100 rounded-lg shrink-0">
          {getAugIcon(item.iconName)}
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{item.technique}</h4>
          <p className="text-[11px] text-gray-400 font-mono">CSS Matrix Transform</p>
        </div>
      </div>

      {/* Augmented Visual Image Display */}
      <div className="bg-gray-900 rounded-lg h-32 flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.technique}
            className={`w-full h-full object-cover transition-transform duration-500 ${item.cssClass}`}
          />
        ) : (
          <ImageIcon className="text-gray-600" size={32} />
        )}
        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
          {item.technique}
        </span>
      </div>

      {/* Middle: VehiclePill + Confidence */}
      <div className="flex items-center justify-between pt-1">
        <VehiclePill type={item.vehicle_type} size="sm" />
        <span className={`text-lg font-black ${isBest ? 'text-[#1D9E75]' : isWorst ? 'text-amber-700' : 'text-gray-800'}`}>
          {item.confidence}%
        </span>
      </div>

      <div className="space-y-1">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full ${isBest ? 'bg-[#1D9E75]' : isWorst ? 'bg-amber-500' : 'bg-gray-600'}`}
            style={{ width: `${item.confidence}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
