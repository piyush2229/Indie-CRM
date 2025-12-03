// src/lib/auth.js

const TOKEN_KEY = "indiecrm_token";

/**
 * Save JWT token (string) to localStorage
 * @param {string} token
 */
export function saveToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get token from localStorage
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Decode JWT payload (no verification) to read claims like user id.
 * Returns null on failure.
 * @param {string} token
 */
export function decodeToken(token = getToken()) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (e) {
    try {
      // fallback
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (err) {
      return null;
    }
  }
}
