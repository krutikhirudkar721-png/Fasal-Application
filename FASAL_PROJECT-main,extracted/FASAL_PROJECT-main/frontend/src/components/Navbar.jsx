import React, { useState, useEffect } from 'react';
import { STR } from '../data/i18n';

export default function Navbar({ lang, setLang, activeSection, user, onOpenAuth, onOpenAskAi, onOpenVoice }) {
  const [scrolled, setScrolled] = useState(false);
  const t = STR[lang] || STR.en;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'hero', label: t.navHome },
    { id: 'engine', label: t.navEngine },
    { id: 'weather', label: t.navWeather },
    { id: 'soil', label: t.navSoil },
    { id: 'market', label: t.navMarket },
    { id: 'season', label: t.navSeason },
    { id: 'schemes', label: t.navSchemes },
    { id: 'community', label: t.navCommunity || 'Community' },
  ];

  return (
    <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`} style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, transition: 'all 0.3s' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => scrollTo('hero')}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22V12" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12L16 8" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" />
                <stop offset="1" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
          <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em' }}>
            {t.brandLine}
          </span>
        </div>

        {/* Links (Desktop) */}
        <div style={{ display: 'flex', gap: '1.1rem' }} className="nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: activeSection === item.id ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                fontSize: '0.88rem',
                fontWeight: activeSection === item.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'color 0.3s',
                padding: '0.2rem 0.2rem'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right side controls: Ask AI + Farmer Auth + Language */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          
          {/* Voice Assistant Quick Button */}
          <button
            onClick={onOpenVoice || onOpenAskAi}
            title={t.voiceHeroBtn || 'Voice Assistant'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'rgba(16,185,129,0.2)',
              border: '1px solid var(--accent-emerald)',
              color: '#34d399',
              borderRadius: '50%',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 0 10px rgba(52,211,153,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(52,211,153,0.35)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16,185,129,0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🎤
          </button>

          {/* Ask AI Plant Doctor Button */}
          <button
            onClick={onOpenAskAi}
            className="animate-pulse-glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, rgba(52,211,153,0.2) 0%, rgba(56,189,248,0.2) 100%)',
              border: '1px solid var(--accent-emerald)',
              color: '#fff',
              borderRadius: '999px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span>🔬</span>
            <span>{t.navAskAi || 'Ask AI'}</span>
          </button>

          {/* Farmer Auth Button */}
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: user ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
              border: '1px solid',
              borderColor: user ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.12)',
              color: user ? 'var(--accent-emerald)' : '#fff',
              borderRadius: '999px',
              padding: '0.35rem 0.8rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{user ? user.name : t.farmerLogin}</span>
            {user && <span className="live-dot" style={{ width: '5px', height: '5px' }}></span>}
          </button>

          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: '0.2rem', background: 'rgba(0,0,0,0.3)', padding: '0.15rem', borderRadius: '999px', border: '1px solid var(--glass-border)' }}>
            {['en', 'hi', 'mr'].map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  background: lang === l ? 'var(--accent-emerald)' : 'transparent',
                  color: lang === l ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'मरा'}
              </button>
            ))}
          </div>

        </div>

      </div>
    </nav>
  );
}
