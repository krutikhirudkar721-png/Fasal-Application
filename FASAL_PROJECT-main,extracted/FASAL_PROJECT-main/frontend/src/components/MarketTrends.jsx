import React from 'react';
import { STR } from '../data/i18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarketTrends({ lang, marketData, loading }) {
  const t = STR[lang];

  // Build chart data from real API or fallback
  const commodities = (marketData?.commodities && marketData.commodities.length > 0)
    ? marketData.commodities
    : [
        { name: 'Wheat', unit: '$/mt', data: [{year:'2024',value:280},{year:'2023',value:270},{year:'2022',value:320},{year:'2021',value:260}] },
        { name: 'Maize', unit: '$/mt', data: [{year:'2024',value:195},{year:'2023',value:198},{year:'2022',value:270},{year:'2021',value:210}] },
        { name: 'Soybeans', unit: '$/mt', data: [{year:'2024',value:480},{year:'2023',value:475},{year:'2022',value:580},{year:'2021',value:450}] },
      ];

  // Mandi price trends (local reference data)
  const trendData = [
    { month: 'Jan', Soybean: 42, Cotton: 55, Wheat: 20 },
    { month: 'Feb', Soybean: 43, Cotton: 56, Wheat: 21 },
    { month: 'Mar', Soybean: 45, Cotton: 58, Wheat: 21 },
    { month: 'Apr', Soybean: 44, Cotton: 60, Wheat: 22 },
    { month: 'May', Soybean: 46, Cotton: 59, Wheat: 23 },
    { month: 'Jun', Soybean: 45, Cotton: 60, Wheat: 22 },
  ];

  return (
    <section id="market" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="gradient-text">{t.marketTitle}</h2>
          <p>{t.marketSub}</p>
        </div>

        <div className="grid grid-cols-3">
          
          {/* Chart */}
          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Local Mandi Price Trends (₹/kg)</h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--accent-emerald)', display: 'inline-block' }}></span> Soybean</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--accent-sky)', display: 'inline-block' }}></span> Cotton</span>
              </div>
            </div>
            
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(6,15,26,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '0.85rem' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="Soybean" stroke="var(--accent-emerald)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--bg-1)', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="Cotton" stroke="var(--accent-sky)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--bg-1)', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span className="live-dot"></span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.globalPrices}</h3>
              </div>
              {loading ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading live data...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {commodities.slice(0, 4).map(cmd => {
                    const latest = cmd.data?.[0]?.value || 0;
                    const prev = cmd.data?.[1]?.value || latest;
                    const diff = latest - prev;
                    const pct = prev ? (diff / prev * 100) : 0;
                    const isUp = diff >= 0;
                    return (
                      <div key={cmd.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{cmd.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cmd.unit || t.priceUnit}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>${Number(latest).toFixed(0)}</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isUp ? 'var(--accent-emerald)' : 'var(--accent-orange)' }}>
                            {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {marketData?.source && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', fontStyle: 'italic' }}>
                      Source: {marketData.source}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.06), rgba(255,255,255,0.02))' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-sky)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--accent-sky)' }}>Export Demand Alert</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Global soybean meal demand projected to increase 4% this quarter. Good time to hold stock if storage permits.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
