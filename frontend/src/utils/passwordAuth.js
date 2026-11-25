/**
 * Password hashing & synchronous local user-store utilities for ARVÉA.
 *
 * - Uses SHA-256 with per-user random salt (`sha256$<salt>$<digest>`) via a
 *   portable pure-JS SHA-256 implementation so hashing works identically on
 *   HTTPS (Vercel) AND non-HTTPS local LAN IPs (where crypto.subtle is unavailable).
 * - Never relies on hardcoded/static passwords for login verification.
 * - Reads/writes `sik_bumma_users` synchronously so password resets persist
 *   immediately across tabs, reloads, and instant re-login attempts.
 */

export const USERS_STORAGE_KEY = 'sik_bumma_users';

// Compact, FIPS-180-4 compliant pure-JS SHA-256 (UTF-8 aware)
function sha256Hex(message) {
  const bytes = new TextEncoder().encode(String(message));
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  // Write 64-bit big-endian bit length at end of block
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const W = new Uint32Array(64);
  const rotr = (n, x) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, W[i - 15]) ^ rotr(18, W[i - 15]) ^ (W[i - 15] >>> 3);
      const s1 = rotr(17, W[i - 2]) ^ rotr(19, W[i - 2]) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return H.map(v => v.toString(16).padStart(8, '0')).join('');
}

function generateSalt(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let salt = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(length);
    window.crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) {
      salt += chars[arr[i] % chars.length];
    }
    return salt;
  }
  for (let i = 0; i < length; i++) {
    salt += chars[Math.floor(Math.random() * chars.length)];
  }
  return salt;
}

/**
 * Hash a plaintext password with a random salt (iterated SHA-256).
 * Format: `sha256$<salt>$<hex>`
 */
export function hashPasswordLocal(rawPassword, existingSalt = null) {
  const clean = String(rawPassword || '').trim();
  const salt = existingSalt || generateSalt(16);
  let digest = sha256Hex(`${salt}:${clean}`);
  // Stretch hash (512 rounds) for stronger local storage protection while remaining fast in UI
  for (let i = 0; i < 512; i++) {
    digest = sha256Hex(`${salt}:${digest}:${clean}`);
  }
  return `sha256$${salt}$${digest}`;
}

/**
 * Strictly verify an input password against the user's LATEST stored credential.
 * Supports salted `password_hash` and legacy un-migrated `password` field on the
 * user object — NEVER falls back to hardcoded/static passwords.
 */
export function verifyPasswordLocal(inputPassword, userRecord) {
  if (!userRecord) return false;
  const cleanInput = String(inputPassword || '').trim();
  if (!cleanInput) return false;

  // 1. Primary: verify against stored salted hash
  if (typeof userRecord.password_hash === 'string' && userRecord.password_hash.startsWith('sha256$')) {
    const parts = userRecord.password_hash.split('$');
    if (parts.length === 3) {
      const salt = parts[1];
      const expected = hashPasswordLocal(cleanInput, salt);
      return expected === userRecord.password_hash;
    }
  }

  // 2. Legacy compatibility for existing un-migrated localStorage user records
  if (typeof userRecord.password === 'string' && userRecord.password.trim().length > 0) {
    return cleanInput === userRecord.password.trim();
  }

  return false;
}

/**
 * Read the freshest users array directly from localStorage (prevents stale cross-tab state).
 */
export function readStoredUsers(fallbackUsers = []) {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return fallbackUsers;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {}
  return fallbackUsers;
}

/**
 * Synchronously write the updated users array to localStorage immediately.
 */
export function writeStoredUsers(usersList) {
  try {
    if (Array.isArray(usersList)) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
    }
  } catch (e) {}
}
