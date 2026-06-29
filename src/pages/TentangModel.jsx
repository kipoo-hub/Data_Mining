import React from 'react';
import { Layers, Tag, Maximize2, Settings, RefreshCw, FileCode, Server, FlipHorizontal, ZoomIn, Sun, RotateCw, MoveHorizontal, MoveVertical, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function TentangModel() {
  const specs = [
    { icon: Layers, label: 'Arsitektur', value: 'Sequential CNN — 3 blok Conv2D + MaxPooling' },
    { icon: Tag, label: 'Kelas Output', value: 'Mobil · Motor · Truk (3 kelas)' },
    { icon: Maximize2, label: 'Input Gambar', value: '150 × 150 px, RGB (3 channel)' },
    { icon: Settings, label: 'Optimizer', value: 'Adam · Loss: Categorical Crossentropy' },
    { icon: RefreshCw, label: 'Epoch Training', value: '15 epoch' },
    { icon: FileCode, label: 'Format Model', value: 'model_project.h5 (TensorFlow/Keras)' },
    { icon: Server, label: 'Backend API', value: 'Flask API + ngrok (Google Colab)' },
  ];

  const cnnFlow = [
    { name: 'Input', detail: '150×150×3' },
    { name: 'Conv2D 16', detail: '3×3 ReLU' },
    { name: 'MaxPool', detail: '2×2' },
    { name: 'Conv2D 32', detail: '3×3 ReLU' },
    { name: 'MaxPool', detail: '2×2' },
    { name: 'Conv2D 64', detail: '3×3 ReLU' },
    { name: 'MaxPool', detail: '2×2' },
    { name: 'Flatten', detail: 'Vec 2304' },
    { name: 'Dense 512', detail: 'ReLU' },
    { name: 'Output', detail: 'Softmax (3)' },
  ];

  const augmentations = [
    { icon: RotateCw, name: 'Rotasi', param: '±20°' },
    { icon: FlipHorizontal, name: 'Flip Horizontal', param: 'True' },
    { icon: ZoomIn, name: 'Zoom Range', param: '0.8× – 1.2×' },
    { icon: Sun, name: 'Brightness', param: '±30%' },
    { icon: MoveHorizontal, name: 'Width Shift', param: '0.2' },
    { icon: MoveVertical, name: 'Height Shift', param: '0.2' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tentang Arsitektur Model CNN</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Spesifikasi teknis arsitektur jaringan saraf konvolusi dan teknik Smart Augmentation pada VehicleVision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: CNN Architecture */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Cpu size={20} className="text-[#1D9E75]" /> Spesifikasi Arsitektur CNN
            </h3>

            <div className="divide-y divide-gray-100">
              {specs.map(({ icon: Icon, label, value }, idx) => (
                <div key={idx} className="py-3 flex items-center space-x-3 text-sm">
                  <div className="p-2 bg-[#E1F5EE] text-[#085041] rounded-lg shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="font-bold text-gray-800 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CNN Visual Layer Diagram */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 overflow-hidden">
            <h3 className="font-bold text-gray-800 text-lg">Visualisasi Layer Pipeline</h3>
            
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center space-x-2 min-w-max">
                {cnnFlow.map((layer, index) => (
                  <React.Fragment key={index}>
                    <div className="bg-[#E1F5EE] border border-[#A3E3CE] p-3 rounded-xl text-center shadow-sm w-24">
                      <p className="text-xs font-bold text-[#085041] truncate">{layer.name}</p>
                      <p className="text-[10px] font-mono text-[#1D9E75] mt-1">{layer.detail}</p>
                    </div>
                    {index < cnnFlow.length - 1 && (
                      <ArrowRight size={14} className="text-gray-300 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Augmentation Details */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#1D9E75]" /> Teknik Augmentasi Data Pintar
            </h3>

            {/* 2x3 Grid Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {augmentations.map(({ icon: Icon, name, param }, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1.5 hover:border-[#1D9E75] transition-colors">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-[#1D9E75]">
                    <Icon size={20} />
                  </div>
                  <p className="text-xs font-bold text-gray-800">{name}</p>
                  <span className="text-[10px] font-mono font-semibold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded">
                    {param}
                  </span>
                </div>
              ))}
            </div>

            {/* Light Green Card explanation */}
            <div className="bg-[#E1F5EE] border border-[#A3E3CE] rounded-xl p-4 text-xs text-[#085041] leading-relaxed font-medium">
              Augmentasi diterapkan saat training menggunakan <strong>ImageDataGenerator Keras</strong> untuk meningkatkan variasi data dan ketahanan model terhadap perbedaan kondisi foto kendaraan nyata.
            </div>

            {/* Why Augmentation Important */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-bold text-gray-800">Kenapa augmentasi penting?</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5 text-xs text-gray-700 font-medium">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#1D9E75] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <p>Meningkatkan jumlah data training secara virtual tanpa pengambilan foto baru.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#1D9E75] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <p>Mencegah overfitting pada dataset yang terbatas agar generalisasi lebih baik.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#1D9E75] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <p>Membuat model lebih robust terhadap variasi sudut, pencahayaan, dan orientasi kendaraan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
