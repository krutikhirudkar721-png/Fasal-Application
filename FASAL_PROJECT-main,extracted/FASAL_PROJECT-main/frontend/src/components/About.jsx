import React from 'react';
import { STR } from '../data/i18n';

export default function About({ lang }) {
  const t = STR[lang];

  const features = [
    { title: 'AI-Powered Analysis', desc: 'Composite scoring engine evaluating 6 agricultural parameters simultaneously.', icon: '🧠', color: 'var(--accent-emerald)' },
    { title: 'Real-time Global Data', desc: 'Integration with Open-Meteo, ISRIC SoilGrids, and World Bank APIs.', icon: '🌍', color: 'var(--accent-sky)' },
    { title: 'Vernacular First', desc: 'Native support for Marathi, Hindi, and English — bridging the digital divide.', icon: '🗣️', color: 'var(--accent-gold)' },
    { title: 'Actionable Insights', desc: 'Not just data — specific diversification and tend-care advice for your field.', icon: '💡', color: 'var(--accent-teal)' },
    { title: 'Financial Modeling', desc: 'Integrated cost-benefit analysis for projected net seasonal profit.', icon: '📈', color: 'var(--accent-emerald)' },
    { title: 'Responsive Design', desc: 'Fully functional across low-end mobile devices and high-end desktops.', icon: '📱', color: 'var(--accent-violet)' },
  ];

  return (
    <section id="about" className="section" style={{ background: 'rgba(0,0,0,0.15)' }}>
      <div className="container">
        
        <div className="section-header">
          <h2 className="gradient-text">{t.aboutTitle}</h2>
        </div>

        <div className="grid grid-cols-3" style={{ marginBottom: '4rem' }}>
          {features.map((feature, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ 
          background: 'rgba(232, 119, 46, 0.06)', border: '1px solid rgba(232, 119, 46, 0.15)', 
          borderRadius: '12px', padding: '1.25rem 1.5rem', textAlign: 'center', marginBottom: '4rem'
        }}>
          <p style={{ color: 'var(--accent-orange)', fontWeight: 500, fontSize: '0.9rem' }}>
            {t.footerNote}
          </p>
        </div>

      </div>
      
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '2rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem' }} className="gradient-text">
            {t.brandLine}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Built for Smart India Hackathon • React + Vite + FastAPI
          </p>
        </div>
      </footer>
    </section>
  );
}
