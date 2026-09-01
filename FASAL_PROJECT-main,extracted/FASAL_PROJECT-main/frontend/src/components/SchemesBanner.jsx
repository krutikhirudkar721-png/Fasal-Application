import React, { useState } from 'react';
import { STR } from '../data/i18n';

export default function SchemesBanner({ lang, onExploreSchemes }) {
  const t = STR[lang] || STR.en;
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="schemes-live-header"
      style={{
        background: 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(56,189,248,0.18) 50%, rgba(245,158,11,0.15) 100%)',
        borderBottom: '1px solid rgba(52,211,153,0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#fff',
        fontSize: '0.82rem',
        padding: '0.45rem 1rem',
        position: 'relative',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 auto', overflow: 'hidden' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(16,185,129,0.25)',
            border: '1px solid rgba(52,211,153,0.4)',
            borderRadius: '999px',
            padding: '0.15rem 0.6rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--accent-emerald)',
            flexShrink: 0,
          }}
        >
          <span className="live-dot" style={{ width: '7px', height: '7px' }}></span>
          {t.liveSchemesBanner}
        </span>

        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)', fontWeight: 500 }}>
          {lang === 'hi'
            ? 'पीएम-किसान 17वीं किस्त जारी · पीएम फसल बीमा योजना नामांकन चालू · पीएम कुसुम 60% सोलर पंप सब्सिडी'
            : lang === 'mr'
            ? 'पीएम-किसान १७ वा हप्ता सक्रिय · प्रधानमंत्री पीक विमा नोंदणी सुरू · सौर कृषी पंप ६०% अनुदान'
            : 'PM-KISAN 17th Installment active · PM Fasal Bima enrollment open · PM-KUSUM 60% Solar Pump Subsidy'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <button
          onClick={onExploreSchemes}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: '6px',
            padding: '0.2rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-emerald)', e.currentTarget.style.color = '#000')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)', e.currentTarget.style.color = '#fff')}
        >
          {t.exploreSchemes} <span>→</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          title="Dismiss banner"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1rem',
            lineHeight: 1,
            padding: '0.1rem 0.3rem',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
