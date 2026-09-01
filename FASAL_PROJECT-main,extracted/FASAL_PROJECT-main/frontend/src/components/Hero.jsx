import React from 'react';
import { STR } from '../data/i18n';

export default function Hero({ lang, onStart, onOpenAskAi, onOpenVoice }) {
  const t = STR[lang] || STR.en;

  return (
    <section className="hero-section">
      {/* Background Image */}
      <div className="hero-bg">
        <img src="/hero-bg.jpg" alt="" />
      </div>

      {/* Content */}
      <div className="hero-content container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', width: '100%' }}>
        
        {/* Left - Text */}
        <div className="animate-slide-up" style={{ maxWidth: '580px', flex: '0 0 auto' }}>
          <div className="badge badge-emerald badge-pulse" style={{ marginBottom: '1.5rem' }}>
            <span className="live-dot" style={{ marginRight: '0.5rem' }}></span>
            {t.heroEyebrow}
          </div>
          
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.08, fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            {t.heroTitle1} <br/>
            <span className="gradient-text">{t.heroTitle2}</span>
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: '95%' }}>
            {t.heroDesc}
          </p>
          
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button className="btn-primary animate-pulse-glow" onClick={onStart} style={{ fontSize: '1.05rem', padding: '0.85rem 1.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {t.ctaPrimary}
            </button>

            {/* Voice Assistant Button */}
            <button
              onClick={onOpenVoice || onOpenAskAi}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(56,189,248,0.15) 100%)',
                border: '1px solid var(--accent-emerald)',
                color: '#fff',
                borderRadius: '8px',
                padding: '0.85rem 1.4rem',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(16,185,129,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(56,189,248,0.3) 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(56,189,248,0.15) 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🎤</span>
              <span>{t.voiceHeroBtn || 'Voice Assistant'}</span>
            </button>

            {/* Ask AI Plant Doctor Button */}
            <button
              onClick={onOpenAskAi}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '8px',
                padding: '0.85rem 1.4rem',
                fontSize: '0.98rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.borderColor = 'var(--accent-emerald)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
            >
              <span>🔬</span>
              <span>{lang === 'hi' ? 'फसल AI डॉक्टर' : lang === 'mr' ? 'पीक AI डॉक्टर' : 'AI Plant Doctor'}</span>
            </button>
          </div>
          
          {/* Stats */}
          <div style={{ display: 'flex', gap: '3rem', marginTop: '3.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.75rem' }}>
            <div>
              <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>12,400+</div>
              <div className="stat-label">{t.statFarmers}</div>
            </div>
            <div>
              <div className="stat-value">10</div>
              <div className="stat-label">{t.statCrops}</div>
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>180+</div>
              <div className="stat-label">{t.statDistricts}</div>
            </div>
          </div>
        </div>

        {/* Right - Preview Card */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s', flex: '0 0 380px' }}>
          <div className="glass-card no-hover" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(1deg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: '0.25rem' }}>Top Match</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-gold)' }}>Soybean + Tur</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', lineHeight: 1 }}>94%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Match Score</div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Est. Net Profit</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>₹ 28,500 / acre</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Climate Risk</span>
                <span style={{ color: 'var(--accent-sky)', fontWeight: 500 }}>Low</span>
              </div>
            </div>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" strokeLinecap="round"/>
              </svg>
              <span style={{ lineHeight: 1.4 }}>
                {lang === 'hi' ? 'विविधीकरण सुझाव: तुअर गहरी जड़ें डालती है, जिससे मिट्टी सुरक्षित रहती है।' : lang === 'mr' ? 'विविधीकरण सूचना: तूर खोल मुळे घालते, ज्यामुळे माती सुरक्षित राहते.' : 'Diversification tip: Tur adds deep roots, improving soil structure for the next season.'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
