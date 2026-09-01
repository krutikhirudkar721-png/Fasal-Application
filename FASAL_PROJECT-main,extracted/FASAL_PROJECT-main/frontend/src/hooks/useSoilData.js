import { useState, useEffect } from 'react';

export function useSoilData(lat, lon) {
  const [soil, setSoil] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!lat || !lon) return;
    
    let isMounted = true;
    setLoading(true);
    
    fetch(`/api/soil-data?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setSoil(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Soil fetch error', err);
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [lat, lon]);
  
  return { soil, loading };
}
