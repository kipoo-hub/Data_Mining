import { API_URL, USE_MOCK } from '../config';
import { simulatePredictionAsync, simulateAugmentation } from '../data/mockData';

/**
 * Predict vehicle class by connecting directly to Colab Flask API or fallback to mock.
 * Endpoint expects FormData with key 'file'.
 */
export async function predictVehicle(fileObj, forcedClass = null) {
  if (USE_MOCK) {
    return await simulatePredictionAsync(fileObj, forcedClass);
  }

  const formData = new FormData();
  const file = fileObj instanceof File ? fileObj : fileObj?.file || fileObj;
  formData.append('file', file);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Backend Flask mengembalikan status gagal.');
    }

    const vehicle_type = data.vehicle_type || 'Tidak Diketahui';
    const confidence = +parseFloat(data.confidence || 0).toFixed(1);
    const all_predictions = {};

    if (data.all_predictions) {
      Object.keys(data.all_predictions).forEach(k => {
        all_predictions[k] = +parseFloat(data.all_predictions[k]).toFixed(1);
      });
    }

    return {
      filename: file.name,
      vehicle_type,
      confidence,
      all_predictions
    };
  } catch (err) {
    console.error('Flask API connection error:', err);
    alert(`[Koneksi API Gagal] ${err.message}. Menggunakan simulasi lokal.`);
    return await simulatePredictionAsync(fileObj, forcedClass);
  }
}
