import React from 'react';
import { STR } from '../data/i18n';
import { CROP_CALENDAR } from '../data/crops';

export default function SeasonCalendar({ lang }) {
  const t = STR[lang];
  const months = t.monthsShort;

  return (
    <section id="season" className="section">
      <div className="container">
        
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }} className="gradient-text">
            {t.seasonTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            {t.seasonSub}
          </p>
        </div>

        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', justifyContent: 'flex-end', paddingRight: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--accent-gold)' }}></div>
                {t.sow}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--accent-emerald)' }}></div>
                {t.tend}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--accent-orange)' }}></div>
                {t.harvest}
              </div>
            </div>

            {/* Grid Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(12, 1fr)', gap: '4px', marginBottom: '1rem' }}>
              <div></div>
              {months.map((m, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {m}
                </div>
              ))}
            </div>

            {/* Grid Rows */}
            {CROP_CALENDAR.map((item, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '150px repeat(12, 1fr)', gap: '4px', marginBottom: '0.5rem', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.crop}</div>
                
                {Array.from({ length: 12 }).map((_, i) => {
                  let bgColor = 'rgba(255,255,255,0.05)';
                  let isEdge = false;
                  let edgeRadius = '';

                  if (item.sow.includes(i)) {
                    bgColor = 'var(--accent-gold)';
                    if (i === item.sow[0]) { isEdge = true; edgeRadius = '8px 0 0 8px'; }
                    if (i === item.sow[item.sow.length-1]) { isEdge = true; edgeRadius = isEdge ? '8px' : '0 8px 8px 0'; }
                  } else if (item.tend.includes(i)) {
                    bgColor = 'var(--accent-emerald)';
                  } else if (item.harvest.includes(i)) {
                    bgColor = 'var(--accent-orange)';
                    if (i === item.harvest[item.harvest.length-1]) edgeRadius = '0 8px 8px 0';
                  }

                  return (
                    <div 
                      key={i} 
                      style={{ 
                        height: '32px', 
                        background: bgColor,
                        borderRadius: edgeRadius || (bgColor !== 'rgba(255,255,255,0.05)' ? '0' : '4px'),
                        opacity: bgColor !== 'rgba(255,255,255,0.05)' ? 0.9 : 1
                      }}
                    />
                  );
                })}
              </div>
            ))}
            
          </div>
        </div>

      </div>
    </section>
  );
}
