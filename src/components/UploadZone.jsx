import React, { useState, useRef } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

export default function UploadZone({ onFileSelect, multiple = false, accept = 'image/*' }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (filesList) => {
    const files = Array.from(filesList);
    if (!files.length) return;

    const filePreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    
    if (multiple) {
      setSelectedFiles(files);
      setPreviews(filePreviews);
      if (onFileSelect) onFileSelect(files, filePreviews);
    } else {
      setSelectedFiles([files[0]]);
      setPreviews([filePreviews[0]]);
      if (onFileSelect) onFileSelect(files[0], filePreviews[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    previews.forEach(p => URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(multiple ? [] : null, multiple ? [] : null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full space-y-3">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragOver 
            ? 'border-[#1D9E75] bg-[#E1F5EE]' 
            : 'border-gray-300 hover:border-[#1D9E75] bg-white hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-[#E1F5EE] text-[#1D9E75] rounded-full">
            <UploadCloud size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Seret & lepas foto kendaraan atau <span className="text-[#1D9E75] underline">pilih file</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {multiple ? 'Bisa pilih banyak foto sekaligus (JPG, PNG)' : 'Format: JPG, PNG, JPEG'}
            </p>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            {!multiple && previews[0]?.url ? (
              <img
                src={previews[0].url}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
              />
            ) : (
              <File size={20} className="text-[#1D9E75] shrink-0" />
            )}
            <div className="truncate text-left">
              <p className="text-xs font-bold text-gray-800 truncate">
                {multiple ? `${previews.length} foto dipilih` : previews[0].name}
              </p>
              <p className="text-[11px] text-gray-500">
                {multiple 
                  ? previews.slice(0, 2).map(f => f.name).join(', ') + (previews.length > 2 ? '...' : '')
                  : formatSize(previews[0].size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
