import React, { useState } from 'react';
import { STR } from '../data/i18n';
import { useSchemes } from '../hooks/useSchemes';

export default function GovernmentSchemes({ lang }) {
  const t = STR[lang] || STR.en;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('');

  const { schemes, loading, lastRefreshed, refetch } = useSchemes(selectedRegion, selectedCategory);

  const categories = [
    { id: 'all', label: t.allCategories, icon: '🏛️' },
    { id: 'income-support', label: t.incomeSupport, icon: '💰' },
    { id: 'insurance', label: t.insuranceCategory, icon: '🛡️' },
    { id: 'soil', label: t.soilCategory, icon: '🌱' },
    { id: 'irrigation', label: t.irrigationCategory, icon: '☀️' },
    { id: 'credit', label: t.creditCategory, icon: '💳' },
  ];

  const getSchemeName = (scheme) => {
    if (lang === 'hi' && scheme.nameHi) return scheme.nameHi;
    if (lang === 'mr' && scheme.nameMr) return scheme.nameMr;
    return scheme.name;
  };

  const getSchemeDesc = (scheme) => {
    if (lang === 'hi' && scheme.descHi) return scheme.descHi;
    if (lang === 'mr' && scheme.descMr) return scheme.descMr;
    return scheme.description;
  };

  return (
    <section id="schemes" className="section">
      <div className="container">
        <div className="section-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="live-dot"></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t.liveSchemesBanner}
            </span>
          </div>
          <h2 className="gradient-text">{t.schemesTitle}</h2>
          <p>{t.schemesSub}</p>
        </div>

        {/* Filters & Control Bar */}
        <div
          className="glass-card no-hover"
          style={{
            marginBottom: '2rem',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: selectedCategory === cat.id ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                  color: selectedCategory === cat.id ? '#000' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.id ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Region Filter & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <select
              className="form-input"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', width: 'auto', background: '#0a1628' }}
            >
              <option value="">{lang === 'hi' ? 'सभी क्षेत्र (राष्ट्रीय)' : lang === 'mr' ? 'सर्व प्रदेश (राष्ट्रीय)' : 'All Regions (National)'}</option>
              <option value="national">{lang === 'hi' ? 'केवल केंद्रीय योजनाएं' : lang === 'mr' ? 'केवळ केंद्रीय योजना' : 'National Schemes Only'}</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="madhya pradesh">Madhya Pradesh</option>
              <option value="uttar pradesh">Uttar Pradesh</option>
              <option value="punjab">Punjab</option>
            </select>

            <button
              onClick={refetch}
              title="Refresh Schemes"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                border: '3px solid rgba(52,211,153,0.15)',
                borderTopColor: 'var(--accent-emerald)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3" style={{ gap: '1.25rem' }}>
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                className="glass-card animate-slide-up"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'rgba(15,23,42,0.65)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div>
                  {/* Top tags */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span
                      style={{
                        background: 'rgba(52,211,153,0.12)',
                        border: '1px solid rgba(52,211,153,0.25)',
                        color: 'var(--accent-emerald)',
                        borderRadius: '6px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {scheme.badge || scheme.category}
                    </span>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      📍 {scheme.region === 'national' ? t.regionNational : scheme.region.toUpperCase()}
                    </span>
                  </div>

                  {/* Scheme Title */}
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--accent-gold)',
                      marginBottom: '0.65rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {getSchemeName(scheme)}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {getSchemeDesc(scheme)}
                  </p>
                </div>

                <div>
                  {/* Benefit box */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t.benefitLabel}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {scheme.benefit || 'Direct Subsidy'}
                      </div>
                    </div>

                    <span
                      style={{
                        background: 'rgba(56,189,248,0.12)',
                        border: '1px solid rgba(56,189,248,0.25)',
                        color: 'var(--accent-sky)',
                        borderRadius: '999px',
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      {scheme.status || 'Active'}
                    </span>
                  </div>

                  {/* Action Link */}
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      width: '100%',
                      background: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(56,189,248,0.15) 100%)',
                      border: '1px solid rgba(52,211,153,0.3)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '0.65rem 1rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent-emerald)';
                      e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(56,189,248,0.15) 100%)';
                      e.currentTarget.style.color = '#fff';
                    }}
                  >
                    <span>{t.applyGovPortal}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {schemes.length === 0 && !loading && (
          <div className="glass-card no-hover" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
            <p>{lang === 'hi' ? 'कोई योजना नहीं मिली।' : lang === 'mr' ? 'कोणतीही योजना आढळली नाही.' : 'No government schemes found for the selected filter.'}</p>
          </div>
        )}
      </div>
    </section>
  );
}
