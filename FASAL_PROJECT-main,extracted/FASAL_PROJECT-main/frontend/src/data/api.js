/**
 * frontend/src/data/api.js
 *
 * Centralized fetch wrapper — every request goes through here so JWT
 * attachment, 401 handling, and refresh-token retry live in ONE place
 * instead of being copy-pasted into every component.
 */

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function getAccessToken() {
  // sessionStorage for the short-lived access token: cleared when the tab
  // closes, which limits the blast radius if a device is shared/stolen.
  return sessionStorage.getItem("fasal_access_token") || localStorage.getItem("fasal_access_token");
}

export function setTokens({ accessToken, token, refreshToken, user }) {
  const tokenToSave = accessToken || token;
  if (tokenToSave) {
    sessionStorage.setItem("fasal_access_token", tokenToSave);
    localStorage.setItem("fasal_access_token", tokenToSave);
  }
  if (refreshToken) {
    // Longer-lived refresh token — localStorage so "stay logged in" persists
    // across tab closes. Tradeoff: slightly larger exposure if the device
    // is compromised.
    localStorage.setItem("fasal_refresh_token", refreshToken);
  }
  if (user) {
    localStorage.setItem("fasal_user", JSON.stringify(user));
  }
}

export function clearTokens() {
  sessionStorage.removeItem("fasal_access_token");
  localStorage.removeItem("fasal_access_token");
  localStorage.removeItem("fasal_refresh_token");
  localStorage.removeItem("fasal_user");
}

async function tryRefresh() {
  const refreshToken = localStorage.getItem("fasal_refresh_token");
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    sessionStorage.setItem("fasal_access_token", data.accessToken);
    localStorage.setItem("fasal_access_token", data.accessToken);
    return true;
  } catch {
    return false;
  }
}

async function request(path, options = {}, _isRetry = false) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...options.headers }
    : { "Content-Type": "application/json", ...options.headers };

  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !_isRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request(path, options, true);
    clearTokens();
    window.dispatchEvent(new Event("fasal:logout"));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  requestOtp: (phone) =>
    request("/auth/request-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, otp) =>
    request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp }) }),
  me: () => {
    if (!getAccessToken() && !localStorage.getItem("fasal_refresh_token")) {
      return Promise.resolve(null);
    }
    return request("/auth/me");
  },
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),

  // Ask AI / Gemini Multimodal Assistant
  async askAi(formData) {
    return request("/assistant/ask", {
      method: "POST",
      body: formData,
    });
  },

  // Voice Assistant (Speech-to-Text & Text-to-Speech)
  async transcribeAudio(audioBlob, language = "auto") {
    const formData = new FormData();
    formData.append("audio", audioBlob, "farmer_speech.webm");
    formData.append("language", language);
    return request("/voice/transcribe", {
      method: "POST",
      body: formData,
    });
  },

  async synthesizeSpeech(text, language = "en") {
    const res = await fetch(`${API_BASE}/voice/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Speech synthesis failed (${res.status})`);
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },

  async getVoiceLanguages() {
    return request("/voice/languages");
  },

  // Community Forum
  async getCommunityPosts(crop = "") {
    const qs = crop && crop !== "all" ? `?crop=${encodeURIComponent(crop)}` : "";
    return request(`/community${qs}`);
  },

  async createCommunityPost(postData) {
    return request("/community", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  async replyCommunityPost(postId, replyData) {
    return request(`/community/${postId}/reply`, {
      method: "POST",
      body: JSON.stringify(replyData),
    });
  },

  async likeCommunityPost(postId) {
    return request(`/community/${postId}/like`, {
      method: "POST",
    });
  },

  // Schemes
  async getSchemes(region = "", category = "") {
    const params = new URLSearchParams();
    if (region && region !== "all") params.append("region", region);
    if (category && category !== "all") params.append("category", category);
    const qs = params.toString();
    return request(`/schemes${qs ? `?${qs}` : ""}`);
  },

  // Weather
  async getWeather(location = "", lat = null, lon = null) {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (lat !== null && lat !== undefined) params.append("lat", lat);
    if (lon !== null && lon !== undefined) params.append("lon", lon);
    const qs = params.toString();
    return request(`/weather${qs ? `?${qs}` : ""}`);
  },

  // Recommendations
  async getRecommendations(payload) {
    return request("/recommend", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export { API_BASE };
