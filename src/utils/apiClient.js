import { API_URL, USE_MOCK } from '../config';
import { simulatePredictionAsync, simulateAugmentation } from '../data/mockData';

const LS_KEY = 'CNN_API_URL';

/**
 * Ambil URL backend yang sedang aktif.
 * Prioritas: localStorage > config.js default.
 */
export function getApiUrl() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch (_) {
    // localStorage bisa gagal di incognito / restricted environment
  }
  return API_URL;
}

/**
 * Set URL backend baru ke localStorage.
 * @param {string} url - URL lengkap, misal https://xxxx.ngrok-free.app/predict
 */
export function setApiUrl(url) {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(LS_KEY);
    } else {
      localStorage.setItem(LS_KEY, url.trim());
    }
  } catch (_) {
    console.warn('Gagal menyimpan URL ke localStorage');
  }
}

/**
 * Predict vehicle class by connecting directly to Colab Flask API or fallback to mock.
 * Endpoint expects FormData with key 'file'.
 *
 * Every hasil selalu punya field `source` supaya UI bisa tau ini beneran dari
 * model atau bukan:
 *   - 'model'    -> respons asli dari CNN lewat backend Flask
 *   - 'mock'     -> USE_MOCK memang sengaja diaktifkan (mode demo)
 *   - 'fallback' -> backend gagal dihubungi, dan sistem terpaksa nebak pakai
 *                   heuristik lokal (imageAnalyzer.js) sebagai pengganti sementara
 */
export async function predictVehicle(fileObj, forcedClass = null) {
  if (USE_MOCK) {
    const result = await simulatePredictionAsync(fileObj, forcedClass);
    return { ...result, source: 'mock' };
  }

  const formData = new FormData();
  const file = fileObj instanceof File ? fileObj : fileObj?.file || fileObj;
  formData.append('file', file);

  const activeUrl = getApiUrl();

  try {
    const response = await fetch(activeUrl, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Guard: ngrok free tier bisa mengembalikan HTML meski status 200
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `Response bukan JSON (content-type: ${contentType}). ` +
        'Kemungkinan halaman warning ngrok atau URL salah.'
      );
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
      all_predictions,
      source: 'model'
    };
  } catch (err) {
    console.error('Flask API connection error:', err);
    // TIDAK pakai alert() — error disurfacekan via field source + fallbackReason
    const result = await simulatePredictionAsync(fileObj, forcedClass);
    return {
      ...result,
      source: 'fallback',
      fallbackReason: err.message
    };
  }
}