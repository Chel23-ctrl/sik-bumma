import axios from 'axios';

const TOKEN_STORAGE_KEY = 'arvea_access_token';
const API_BASE_URL = (process.env.REACT_APP_API_URL || '/api').replace(/\/+$/, '');

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {}
};

export const clearAuthToken = () => setAuthToken('');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 8000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

// Selalu kirim header Authorization: Bearer <token> agar kebal blokir cookie lintas browser/IP lokal
apiClient.interceptors.request.use((config) => {
  const tok = getAuthToken();
  if (tok) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${tok}`;
  }
  return config;
});

/**
 * Cek apakah response berasal dari API JSON nyata (bukan index.html SPA fallback Vercel).
 */
export const isJsonApiResponse = (res) => {
  const ct = (res?.headers?.['content-type'] || '').toLowerCase();
  return ct.includes('application/json') && res?.data && typeof res.data === 'object';
};

/**
 * Klasifikasikan error autentikasi secara spesifik agar ditampilkan jelas di UI.
 */
export const parseAuthError = (err) => {
  if (!err) {
    return {
      code: 'UNKNOWN_ERROR',
      title: 'Gagal Masuk',
      message: 'Terjadi kesalahan tidak terduga saat memproses login.'
    };
  }

  // Network / CORS / Timeout (tidak ada response HTTP dari server)
  if (!err.response) {
    const isTimeout = err.code === 'ECONNABORTED';
    return {
      code: isTimeout ? 'TIMEOUT' : 'CORS_OR_NETWORK',
      title: isTimeout ? 'Koneksi Server Timeout' : 'Koneksi Jaringan / CORS Terblokir',
      message: isTimeout
        ? 'Server API tidak merespons tepat waktu. Periksa koneksi internet Anda lalu coba lagi.'
        : 'Tidak dapat terhubung ke server API (kemungkinan jaringan terputus atau kebijakan CORS memblokir origin perangkat ini).'
    };
  }

  const status = err.response.status;
  const rawDetail = err.response.data?.detail ?? err.response.data;
  const detailObj = typeof rawDetail === 'object' && rawDetail !== null ? rawDetail : null;
  const detailMsg =
    detailObj?.message ||
    (typeof rawDetail === 'string' ? rawDetail : '') ||
    err.response.data?.message ||
    '';
  const detailCode = detailObj?.code || '';

  if (status === 419 || detailCode === 'CSRF_EXPIRED') {
    return {
      code: 'CSRF_EXPIRED',
      title: 'Token Keamanan (CSRF) Kedaluwarsa',
      message: 'Sesi halaman login telah kedaluwarsa. Muat ulang (refresh) browser lalu coba masuk kembali.'
    };
  }

  if (status === 403 && detailCode === 'ACCOUNT_DEACTIVATED') {
    return {
      code: 'ACCOUNT_DEACTIVATED',
      title: 'Akun Dinonaktifkan',
      message: detailMsg || 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.'
    };
  }

  if (status === 401) {
    return {
      code: detailCode || 'INVALID_CREDENTIALS',
      title: 'Kredensial Tidak Valid',
      message:
        detailMsg ||
        'Username/email atau kata sandi salah. Pastikan tidak ada huruf kapital otomatis atau spasi berlebih.'
    };
  }

  if (status >= 500) {
    return {
      code: 'SERVER_ERROR',
      title: `Gangguan Server (${status})`,
      message: detailMsg || 'Server sedang mengalami kendala. Coba beberapa saat lagi.'
    };
  }

  return {
    code: detailCode || `HTTP_${status}`,
    title: `Gagal Masuk (${status})`,
    message: detailMsg || 'Permintaan login ditolak oleh server.'
  };
};

export const hasExplicitRemoteApi = Boolean(process.env.REACT_APP_API_URL);

export default apiClient;
