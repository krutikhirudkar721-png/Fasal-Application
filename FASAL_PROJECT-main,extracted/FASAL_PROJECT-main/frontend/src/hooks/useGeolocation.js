/**
 * frontend/src/hooks/useGeolocation.js
 *
 * Handles the "Location (LIVE)" feature from your notes.
 *
 * IMPORTANT SECURITY NOTE:
 * Browsers block geolocation, camera, and microphone access on any origin
 * that isn't HTTPS (localhost is the one exception, for development).
 * This means "add HTTPS" from your notes isn't just a login concern — it's
 * a hard requirement for this feature to work at all once deployed. Netlify
 * gives you HTTPS automatically, so this "just works" once you deploy the
 * frontend there; it's your own backend host you need to double check.
 */
import { useState, useCallback } from "react";

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState("idle"); // idle | granted | denied | unsupported

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPermission("unsupported");
      setError("Geolocation isn't supported on this device/browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermission("granted");
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        setPermission("denied");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. You can still use the app — just enter your district manually."
            : "Couldn't get your location right now."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { position, error, permission, requestLocation };
}
