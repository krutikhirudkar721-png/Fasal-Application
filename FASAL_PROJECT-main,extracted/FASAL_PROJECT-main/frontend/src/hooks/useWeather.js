import { useState, useEffect } from 'react';
import { api } from '../data/api';

export function useWeather(lat, lon, locationName = '') {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no coordinates and no location name, skip or load default
    if ((lat === null || lat === undefined || lon === null || lon === undefined) && !locationName) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    api.getWeather(locationName, lat, lon)
      .then(data => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Weather fetch error', err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lon, locationName]);

  return { weather, loading, error };
}
