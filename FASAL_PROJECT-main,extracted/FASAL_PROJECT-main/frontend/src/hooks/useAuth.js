/**
 * frontend/src/hooks/useAuth.js
 *
 * Usage in any component:
 *   const { user, loading, requestOtp, verifyOtp, logout } = useAuth();
 */
import { useState, useEffect, useCallback } from "react";
import { api, setTokens, clearTokens } from "../data/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const onLogout = () => setUser(null);
    window.addEventListener("fasal:logout", onLogout);
    return () => window.removeEventListener("fasal:logout", onLogout);
  }, []);

  const requestOtp = useCallback((phone) => api.requestOtp(phone), []);

  const verifyOtp = useCallback(async (phone, otp) => {
    const data = await api.verifyOtp(phone, otp);
    setTokens(data);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return { user, loading, requestOtp, verifyOtp, logout };
}
