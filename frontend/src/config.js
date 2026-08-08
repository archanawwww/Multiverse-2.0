// In production, the API and frontend share the same host/port.
export const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`);
