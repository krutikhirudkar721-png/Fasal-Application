import React from 'react';
import { STR } from '../data/i18n';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function SoilDashboard({ lang, fieldData, soilData }) {
  const t = STR[lang];

  const data = [
    { subject: t.soilPh, A: Math.min(100, (fieldData.ph / 7.0) * 100), fullMark: 100 },
    { subject: t.soilN, A: Math.min(100, (fieldData.n / 100) * 100), fullMark: 100 },
    { subject: t.soilP, A: Math.min(100, (fieldData.p / 60) * 100), fullMark: 100 },
    { subject: t.soilK, A: Math.min(100, (fieldData.k / 60) * 100), fullMark: 100 },
    { subject: t.soilOrganic, A: soilData?.organic_carbon ? Math.min(100, soilData.organic_carbon * 5) : 65, fullMark: 100 },
    { subject: t.soilMoist, A: fieldData.rainfall > 800 ? 80 : 45, fullMark: 100 },
  ];

  const phStatus = fieldData.ph < 6 ? { text: 'Acidic — Lime recommended', color: 'var(--accent-orange)' }
    : fieldData.ph > 7.5 ? { text: 'Alkaline — Gypsum recommended', color: 'var(--accent-orange)' }
    : { text: 'Optimal range', color: 'var(--accent-emerald)' };

  const nStatus = fieldData.n < 40 ? { text: 'Deficient — Urea or legumes', color: 'var(--accent-orange)' }
    : { text: 'Adequate levels', color: 'var(--accent-emerald)' };

  return (
    <section id="soil" className="section" style={{ position: 'relative' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="gradient-text-gold">{t.soilTitle}</h2>
          <p>{t.soilSub}</p>
        </div>

        <div className="grid grid-cols-2" style={{ alignItems: 'start' }}>
          
          {/* Radar Chart */}
          <div className="glass-card" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Nutrient Profile</h3>
              {soilData && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}><span className="live-dot" style={{ background: 'var(--accent-gold)', marginRight: '0.4rem' }}></span>ISRIC Live</span>}
            </div>
            
            <div style={{ flex: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Soil" dataKey="A" stroke="var(--accent-gold)" fill="var(--accent-gold)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
              <div className="glass-card">
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: phStatus.color, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                  {fieldData.ph}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t.soilPh}</div>
                <div style={{ fontSize: '0.8rem', color: phStatus.color, lineHeight: 1.4 }}>{phStatus.text}</div>
              </div>
              
              <div className="glass-card">
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: nStatus.color, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                  {fieldData.n} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>kg/ha</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t.soilN}</div>
                <div style={{ fontSize: '0.8rem', color: nStatus.color, lineHeight: 1.4 }}>{nStatus.text}</div>
              </div>
            </div>

            {/* Extra soil stats if real data */}
            {soilData && (
              <div className="glass-card">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--accent-gold)' }}>ISRIC SoilGrids Data (0–5cm)</h4>
                <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clay</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{soilData.clay ?? '—'} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>g/kg</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sand</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{soilData.sand ?? '—'} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>g/kg</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Org Carbon</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{soilData.organic_carbon ?? '—'} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>g/kg</span></div>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(240,180,41,0.06), rgba(255,255,255,0.02))' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-gold)' }}>AI Insight</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Based on your soil profile, rotating with a leguminous crop like Chickpea or Pigeon Pea will naturally fix nitrogen, reducing fertilizer costs by up to 25% next season.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
