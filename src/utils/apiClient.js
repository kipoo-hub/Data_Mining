import { API_URL, USE_MOCK } from '../config';
import { simulatePredictionAsync, simulateAugmentation } from '../data/mockData';

const LS_KEY = 'CNN_API_URL';

/**
 * Get the currently active backend URL.
 * Priority: localStorage > config.js default.
 */
export function getApiUrl() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch (_) {
    // localStorage may fail in incognito / restricted environment
  }
  return API_URL;
}

/**
 * Set a new backend URL to localStorage.
 * @param {string} url - Full URL, e.g. https://xxxx.ngrok-free.app/predict
 */
export function setApiUrl(url) {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(LS_KEY);
    } else {
      localStorage.setItem(LS_KEY, url.trim());
    }
  } catch (_) {
    console.warn('Failed to save URL to localStorage');
  }
}

/**
 * Predict vehicle class by connecting directly to Colab Flask API or fallback to mock.
 * Endpoint expects FormData with key 'file'.
 *
 * Every result always has a `source` field so the UI knows whether this is
 * actually from the model or not:
 *   - 'model'    -> genuine response from CNN via Flask backend
 *   - 'mock'     -> USE_MOCK is intentionally enabled (demo mode)
 *   - 'fallback' -> backend failed to connect, system falls back to local
 *                   heuristic (imageAnalyzer.js) as a temporary substitute
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

    // Guard: ngrok free tier may return HTML even with status 200
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `Response is not JSON (content-type: ${contentType}). ` +
        'Possibly ngrok warning page or incorrect URL.'
      );
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Flask backend returned a failure status.');
    }

    const vehicle_type = data.vehicle_type || 'Unknown';
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
    // No alert() — error is surfaced via source + fallbackReason fields
    const result = await simulatePredictionAsync(fileObj, forcedClass);
    return {
      ...result,
      source: 'fallback',
      fallbackReason: err.message
    };
  }
}