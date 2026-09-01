import React, { useState, useMemo, useEffect } from 'react';
import { STR } from '../data/i18n';
import { INDIA_STATES } from '../data/indiaLocations';
import { useGeolocation } from '../hooks/useGeolocation';

export default function LocationSearch({ lang, onLocationSelect }) {
  const t = STR[lang] || STR.en;
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRealData, setIsRealData] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const { position, error: geoError, permission, requestLocation } = useGeolocation();

  // Get districts for selected state
  const currentState = useMemo(() => 
    INDIA_STATES.find(s => s.state === selectedState), 
    [selectedState]
  );

  // Filter districts by search
  const filteredDistricts = useMemo(() => {
    if (!currentState) return [];
    if (!searchQuery) return currentState.districts;
    const q = searchQuery.toLowerCase();
    return currentState.districts.filter(d => 
      d.name.toLowerCase().includes(q) || 
      (d.nameHi && d.nameHi.includes(q)) ||
      (d.nameMr && d.nameMr.includes(q))
    );
  }, [currentState, searchQuery]);

  // Handle GPS position arrival
  useEffect(() => {
    if (position?.lat && position?.lon) {
      setGpsLoading(false);
      // Find nearest district from INDIA_STATES
      let closestDistrict = null;
      let closestState = null;
      let minDistance = Infinity;

      INDIA_STATES.forEach((st) => {
        st.districts.forEach((dist) => {
          const distKm = Math.hypot(dist.lat - position.lat, dist.lon - position.lon);
          if (distKm < minDistance) {
            minDistance = distKm;
            closestDistrict = dist;
            closestState = st;
          }
        });
      });

      if (closestDistrict && closestState) {
        setSelectedState(closestState.state);
        setSelectedDistrict(closestDistrict.name);
        setIsRealData(true);
        onLocationSelect(position.lat, position.lon, `${closestDistrict.name}, ${closestState.state}`);
      }
    }
  }, [position]);

  const handleGpsClick = () => {
    setGpsLoading(true);
    requestLocation();
  };

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedDistrict('');
    setIsRealData(false);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district.name);
    setSearchQuery('');
    setIsRealData(true);
    onLocationSelect(district.lat, district.lon, `${district.name}, ${selectedState}`);
  };

  return (
    <div className="glass-card location-search" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{t.fieldLocation}</span>
        {isRealData && (
          <span className="badge badge-emerald" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
            ● {t.realDataBadge}
          </span>
        )}
      </div>

      {/* GPS Live Auto-detect Button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={handleGpsClick}
          disabled={gpsLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(56,189,248,0.12) 100%)',
            border: '1px solid rgba(52,211,153,0.35)',
            color: 'var(--accent-emerald)',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(52,211,153,0.2)';
            e.currentTarget.style.borderColor = 'var(--accent-emerald)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(56,189,248,0.12) 100%)';
            e.currentTarget.style.borderColor = 'rgba(52,211,153,0.35)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          <span>{gpsLoading ? t.gpsLocating : t.useGpsBtn}</span>
        </button>

        {geoError && (
          <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.4rem', paddingLeft: '0.25rem' }}>
            {geoError}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {lang === 'hi' ? 'या मैनुअल चुनें' : lang === 'mr' ? 'किंवा स्वतः निवडा' : 'or select manually'}
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* State Selector */}
      <div style={{ marginBottom: '1rem' }}>
        <label className="form-label">{lang === 'en' ? 'State' : lang === 'hi' ? 'राज्य' : 'राज्य'}</label>
        <select 
          className="form-input" 
          value={selectedState} 
          onChange={handleStateChange}
          style={{ appearance: 'none' }}
        >
          <option value="" style={{ background: '#0a1628' }}>{lang === 'en' ? '-- Select State --' : '-- राज्य चुनें --'}</option>
          {INDIA_STATES.map(s => (
            <option key={s.state} value={s.state} style={{ background: '#0a1628' }}>
              {lang === 'en' ? s.state : s.stateHi}
            </option>
          ))}
        </select>
      </div>

      {/* District Selector with search */}
      {currentState && (
        <div style={{ position: 'relative' }}>
          <label className="form-label">{lang === 'en' ? 'District' : lang === 'hi' ? 'जिला' : 'जिल्हा'}</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder={t.searchLocation}
              value={selectedDistrict || searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedDistrict('');
              }}
              onFocus={() => setSelectedDistrict('')}
              style={{ paddingLeft: '2.5rem' }}
            />
            <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Dropdown */}
          {!selectedDistrict && filteredDistricts.length > 0 && (
            <div className="location-dropdown">
              {filteredDistricts.map((d, i) => (
                <div
                  key={i}
                  className="location-item"
                  onClick={() => handleDistrictSelect(d)}
                >
                  <div style={{ fontWeight: 500 }}>
                    {lang === 'en' ? d.name : lang === 'hi' ? (d.nameHi || d.name) : (d.nameMr || d.nameHi || d.name)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {d.lat.toFixed(2)}°N, {d.lon.toFixed(2)}°E
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected location summary */}
      {selectedDistrict && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(52,211,153,0.08)', borderRadius: '8px', border: '1px solid rgba(52,211,153,0.15)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
            📍 {selectedDistrict}, {selectedState}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {lang === 'en' ? 'Fetching real soil & weather data...' : 'वास्तविक मिट्टी और मौसम डेटा प्राप्त हो रहा है...'}
          </div>
        </div>
      )}
    </div>
  );
}
