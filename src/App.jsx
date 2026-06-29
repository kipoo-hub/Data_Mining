import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Deteksi from './pages/Deteksi';
import BatchUpload from './pages/BatchUpload';
import KomparasiAugmentasi from './pages/KomparasiAugmentasi';
import Riwayat from './pages/Riwayat';
import TentangModel from './pages/TentangModel';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="deteksi" element={<Deteksi />} />
        <Route path="batch" element={<BatchUpload />} />
        <Route path="augmentasi" element={<KomparasiAugmentasi />} />
        <Route path="riwayat" element={<Riwayat />} />
        <Route path="tentang" element={<TentangModel />} />
      </Route>
    </Routes>
  );
}
