import { useState, useEffect } from 'react';

export function useMarketPrices() {
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    fetch('/api/commodity-prices')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setPrices(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Market prices fetch error', err);
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, []);
  
  return { prices, loading };
}
