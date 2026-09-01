import React, { useState } from 'react';
import { STR } from '../data/i18n';

export default function ProfitCalculator({ lang }) {
  const t = STR[lang];
  const [calc, setCalc] = useState({
    landSize: 4,
    yieldPerAcre: 800,
    pricePerKg: 45,
    costPerAcre: 12000
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCalc(prev => ({ ...prev, [name]: Number(value) }));
  };

  const grossReturn = calc.landSize * calc.yieldPerAcre * calc.pricePerKg;
  const totalCost = calc.landSize * calc.costPerAcre;
  const netProfit = grossReturn - totalCost;
  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

  return (
    <section className="section">
      <div className="container grid grid-cols-2" style={{ alignItems: 'center' }}>
        
        <div>
          <div className="section-header" style={{ textAlign: 'left' }}>
            <h2 className="gradient-text">{t.profitCalcTitle}</h2>
            <p style={{ margin: 0 }}>{t.profitCalcSub}</p>
          </div>
          
          <div className="glass-card" style={{ marginTop: '1.5rem' }}>
            <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
              <div>
                <label className="form-label">{t.fieldLandSize}</label>
                <input type="number" name="landSize" value={calc.landSize} onChange={handleInputChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Yield (kg/acre)</label>
                <input type="number" name="yieldPerAcre" value={calc.yieldPerAcre} onChange={handleInputChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Price (₹/kg)</label>
                <input type="number" name="pricePerKg" value={calc.pricePerKg} onChange={handleInputChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Cost (₹/acre)</label>
                <input type="number" name="costPerAcre" value={calc.costPerAcre} onChange={handleInputChange} className="form-input" />
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-in">
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.06), rgba(6, 15, 26, 0.5))', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
            
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{t.grossReturn}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹ {grossReturn.toLocaleString()}</div>
            </div>
            
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Total {t.inputCost}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-orange)' }}>- ₹ {totalCost.toLocaleString()}</div>
            </div>
            
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '0.5rem' }}>Estimated {t.netProfit}</div>
              <div style={{ fontSize: '2.75rem', fontWeight: 800, color: netProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-orange)', letterSpacing: '-0.02em', textShadow: `0 0 30px ${netProfit >= 0 ? 'rgba(52,211,153,0.3)' : 'rgba(232,119,46,0.3)'}` }}>
                ₹ {netProfit.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Return on Investment</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: roi >= 0 ? 'var(--accent-emerald)' : 'var(--accent-orange)' }}>{roi.toFixed(0)}%</span>
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}
