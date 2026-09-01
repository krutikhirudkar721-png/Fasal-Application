import React, { useState } from 'react';
import { STR } from '../data/i18n';
import { SOIL_TYPES, CROPS } from '../data/crops';
import { runEngine } from '../engine/scoring';
import LocationSearch from './LocationSearch';

export default function RecommendationEngine({ lang, fieldData, setFieldData, handleLocationSelect }) {
  const t = STR[lang];
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRun = () => {
    setIsAnalyzing(true);
    setResults([]);
    setTimeout(() => {
      const scored = runEngine(fieldData, CROPS);
      setResults(scored.slice(0, 4));
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFieldData(prev => ({ ...prev, [name]: isNaN(value) ? value : Number(value) }));
  };

  return (
    <section id="engine" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="gradient-text">{t.engineTitle}</h2>
          <p>{t.engineSub}</p>
        </div>

        <div className="grid grid-cols-3">
          
          {/* Inputs */}
          <div style={{ gridColumn: 'span 1' }}>
            <LocationSearch lang={lang} onLocationSelect={handleLocationSelect} />
            
            <div className="glass-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div>
                  <label className="form-label">{t.fieldSoilType}</label>
                  <select name="soilType" value={fieldData.soilType} onChange={handleInputChange} className="form-input">
                    {SOIL_TYPES.map(s => <option key={s} value={s} style={{ background: '#060f1a' }}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>{t.fieldPh}</label>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>{fieldData.ph}</span>
                  </div>
                  <input type="range" name="ph" min="4" max="9" step="0.1" value={fieldData.ph} onChange={handleInputChange} />
                </div>

                <div className="grid grid-cols-3" style={{ gap: '0.5rem' }}>
                  <div>
                    <label className="form-label">N (kg/ha)</label>
                    <input type="number" name="n" value={fieldData.n} onChange={handleInputChange} className="form-input" style={{ padding: '0.5rem' }} />
                  </div>
                  <div>
                    <label className="form-label">P (kg/ha)</label>
                    <input type="number" name="p" value={fieldData.p} onChange={handleInputChange} className="form-input" style={{ padding: '0.5rem' }} />
                  </div>
                  <div>
                    <label className="form-label">K (kg/ha)</label>
                    <input type="number" name="k" value={fieldData.k} onChange={handleInputChange} className="form-input" style={{ padding: '0.5rem' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>{t.fieldRainfall}</label>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-sky)' }}>{fieldData.rainfall} mm</span>
                  </div>
                  <input type="range" name="rainfall" min="100" max="3000" step="50" value={fieldData.rainfall} onChange={handleInputChange} />
                </div>

                <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">{t.fieldSeason}</label>
                    <select name="season" value={fieldData.season} onChange={handleInputChange} className="form-input" style={{ padding: '0.5rem' }}>
                      <option value="kharif" style={{ background: '#060f1a' }}>Kharif</option>
                      <option value="rabi" style={{ background: '#060f1a' }}>Rabi</option>
                      <option value="zaid" style={{ background: '#060f1a' }}>Zaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">{t.fieldIrrigation}</label>
                    <select name="irrigation" value={fieldData.irrigation} onChange={handleInputChange} className="form-input" style={{ padding: '0.5rem' }}>
                      <option value="none" style={{ background: '#060f1a' }}>None</option>
                      <option value="partial" style={{ background: '#060f1a' }}>Partial</option>
                      <option value="full" style={{ background: '#060f1a' }}>Full</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '0.75rem' }}
                  onClick={handleRun}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" strokeLinejoin="round">
                          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                        </path>
                      </svg>
                      {t.running}
                    </>
                  ) : t.runEngine}
                </button>

              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ gridColumn: 'span 2' }}>
            {results.length === 0 && !isAnalyzing ? (
              <div className="glass-card no-hover" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.4 }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" strokeLinecap="round"/>
                </svg>
                <p style={{ fontSize: '0.95rem' }}>Run the recommendation engine to see results</p>
              </div>
            ) : null}

            {isAnalyzing ? (
              <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid rgba(52,211,153,0.15)', borderTopColor: 'var(--accent-emerald)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : null}

            {results.length > 0 && (
              <div className="grid grid-cols-2">
                {results.map((crop, index) => (
                  <div key={crop.id} className="glass-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: '0.25rem' }}>
                          {index === 0 ? 'Top Match' : `#${index + 1} Match`}
                        </div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--accent-gold)' }}>
                          {lang === 'en' ? crop.name : lang === 'hi' ? crop.nameHi : crop.nameMr}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: crop.score > 80 ? 'var(--accent-emerald)' : crop.score > 60 ? 'var(--accent-gold)' : 'var(--accent-orange)', lineHeight: 1 }}>{crop.score}%</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.15rem' }}>Score</div>
                      </div>
                    </div>
                    
                    <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.profitLabel}</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>₹ {crop.netProfit.toLocaleString()} / acre</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.riskLabel}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: crop.risk < 0.4 ? 'var(--accent-sky)' : crop.risk < 0.6 ? 'var(--accent-gold)' : 'var(--accent-orange)' }}>
                          {crop.risk < 0.4 ? t.riskLow : crop.risk < 0.6 ? t.riskMed : t.riskHigh}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.demandLabel}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: crop.demand === 'strong' ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                          {crop.demand === 'strong' ? t.demandStrong : crop.demand === 'stable' ? t.demandStable : t.demandSoft}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      <span style={{ lineHeight: 1.5 }}>{crop.tip[lang]}</span>
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
