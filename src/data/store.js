// Simple reactive store for live session state (pure user uploads)
const STORAGE_KEY_HISTORY = 'vehiclevision_history_v1';

function getInitialHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse history from localStorage', e);
  }
  return []; // Start purely empty without dummy data!
}

let historyState = getInitialHistory();
const listeners = new Set();

function notifyListeners() {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyState));
  } catch (e) {
    console.error('Failed to persist history to localStorage', e);
  }
  listeners.forEach(fn => fn(historyState));
}

export const store = {
  getHistory() {
    return historyState;
  },
  getStats() {
    const total = historyState.length;
    const mobil = historyState.filter(i => i.vehicle_type === 'Mobil').length;
    const motor = historyState.filter(i => i.vehicle_type === 'Motor').length;
    const truk = historyState.filter(i => i.vehicle_type === 'Truk').length;
    return { total, mobil, motor, truk };
  },
  addRecord(record) {
    const newEntry = {
      id: Date.now() + Math.random(),
      filename: record.filename || 'citra_upload.jpg',
      vehicle_type: record.vehicle_type,
      confidence: record.confidence,
      all_predictions: record.all_predictions,
      timestamp: 'Baru saja',
      imageUrl: record.imageUrl || null,
      icon: record.vehicle_type === 'Motor' ? 'bike' : record.vehicle_type === 'Truk' ? 'truck' : 'car'
    };
    historyState = [newEntry, ...historyState];
    notifyListeners();
    return newEntry;
  },
  addBatchRecords(records) {
    const newEntries = records.map((record, index) => ({
      id: Date.now() + index + Math.random(),
      filename: record.filename || `citra_upload_${index + 1}.jpg`,
      vehicle_type: record.vehicle_type,
      confidence: record.confidence,
      all_predictions: record.all_predictions,
      timestamp: 'Baru saja',
      imageUrl: record.imageUrl || null,
      icon: record.vehicle_type === 'Motor' ? 'bike' : record.vehicle_type === 'Truk' ? 'truck' : 'car'
    }));
    historyState = [...newEntries, ...historyState];
    notifyListeners();
  },
  deleteRecord(id) {
    historyState = historyState.filter(item => item.id !== id);
    notifyListeners();
  },
  clearAll() {
    historyState = [];
    notifyListeners();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};
