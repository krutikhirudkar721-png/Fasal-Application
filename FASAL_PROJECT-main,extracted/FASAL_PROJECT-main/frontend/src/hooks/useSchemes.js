import { useState, useEffect } from 'react';
import { api } from '../data/api';

export function useSchemes(region = '', category = '') {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError] = useState(null);

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSchemes(region, category);
      setSchemes(data.schemes || []);
      setLastRefreshed(data.lastRefreshed || Date.now() / 1000);
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
      setError(err.message || 'Failed to load government schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [region, category]);

  return { schemes, loading, lastRefreshed, error, refetch: fetchSchemes };
}
