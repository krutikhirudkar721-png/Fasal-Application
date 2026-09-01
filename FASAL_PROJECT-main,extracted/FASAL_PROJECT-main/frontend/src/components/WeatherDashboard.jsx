import React from 'react';
import { STR } from '../data/i18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WMO_CODES = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Rime Fog', 51: 'Light Drizzle', 53: 'Moderate Drizzle',
  55: 'Dense Drizzle', 61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
  80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm + Hail', 99: 'Thunderstorm + Heavy Hail'
};

function getWeatherIcon(code, condition = '') {
  const condLower = (condition || '').toLowerCase();
  if (condLower.includes('rain') || condLower.includes('drizzle')) return '🌧️';
  if (condLower.includes('thunder') || condLower.includes('storm')) return '⛈️';
  if (condLower.includes('cloud')) return '⛅';
  if (condLower.includes('snow')) return '🌨️';
  if (condLower.includes('clear') || condLower.includes('sun')) return '☀️';

  if (typeof code === 'number') {
    if (code <= 1) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 55) return '🌦️';
    if (code <= 65) return '🌧️';
    if (code <= 75) return '🌨️';
    if (code <= 82) return '🌧️';
    return '⛈️';
  }
  return '☀️';
}

export default function WeatherDashboard({ lang, weatherData, loading }) {
  const t = STR[lang] || STR.en;

  if (!weatherData && !loading) return null;

  const current = weatherData?.current ? {
    temp: weatherData.current.temperature_2m ?? weatherData.temp ?? 28,
    humidity: weatherData.current.relative_humidity_2m ?? weatherData.humidity ?? 65,
    windSpeed: weatherData.current.wind_speed_10m ?? weatherData.windSpeed ?? 12,
    precip: weatherData.current.rain ?? weatherData.rainfall ?? 0,
    code: weatherData.current.weather_code ?? weatherData.weather_code ?? 0,
    description: weatherData.condition || WMO_CODES[weatherData.current.weather_code] || 'Clear'
  } : {
    temp: weatherData?.temp ?? 28,
    humidity: weatherData?.humidity ?? 65,
    windSpeed: weatherData?.windSpeed ?? 12,
    precip: weatherData?.rainfall ?? 0,
    code: weatherData?.weather_code ?? 0,
    description: weatherData?.condition || 'Clear'
  };

  let forecast = [];
  if (weatherData?.daily?.time) {
    forecast = weatherData.daily.time.map((timeStr, i) => ({
      date: new Date(timeStr).toLocaleDateString('en-US', { weekday: 'short' }),
      tempMax: Math.round(weatherData.daily.temperature_2m_max?.[i] ?? 30),
      tempMin: Math.round(weatherData.daily.temperature_2m_min?.[i] ?? 20),
      precip: weatherData.daily.precipitation_sum?.[i] || 0,
      et0: weatherData.daily.et0_fao_evapotranspiration?.[i] || 4.2,
      code: weatherData.daily.weather_code?.[i] || 0,
      condition: WMO_CODES[weatherData.daily.weather_code?.[i]] || 'Clear'
    }));
  } else if (Array.isArray(weatherData?.forecast)) {
    forecast = weatherData.forecast.map((item, i) => ({
      date: item.day || item.date || `Day ${i + 1}`,
      tempMax: Math.round(item.high ?? item.tempMax ?? 30),
      tempMin: Math.round(item.low ?? item.tempMin ?? 20),
      precip: item.rain ?? item.precip ?? 0,
      et0: item.et0 ?? 4.0,
      code: item.code || 0,
      condition: item.condition || 'Clear'
    }));
  } else {
    forecast = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      date: day,
      tempMax: 30 + (i % 3),
      tempMin: 21 + (i % 2),
      precip: i === 2 ? 6.5 : 0,
      et0: 4.2,
      code: i === 2 ? 61 : 1,
      condition: i === 2 ? 'Rain' : 'Clear'
    }));
  }

  const totalPrecip = forecast.reduce((sum, d) => sum + d.precip, 0);
  const avgET0 = forecast.reduce((sum, d) => sum + d.et0, 0) / (forecast.length || 1);

  return (
    <section id="weather" className="section">
      <div className="container">
        <div className="section-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="live-dot"></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {weatherData?.source === 'openweathermap' ? 'OpenWeatherMap Live' : weatherData?.source === 'open-meteo' ? 'Open-Meteo Sensors' : 'Field Weather Telemetry'}
            </span>
          </div>
          <h2 className="gradient-text">{t.liveWeather}</h2>
          <p>{t.weatherSub}</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid rgba(56,189,248,0.15)', borderTopColor: 'var(--accent-sky)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <div className="grid grid-cols-3">
            
            {/* Current Conditions */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="live-dot"></span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {t.currentConditions}
                  </span>
                </div>
                {weatherData?.location && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    📍 {weatherData.location}
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em' }}>{Math.round(current.temp)}</span>
                  <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>°C</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{getWeatherIcon(current.code, current.description)}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{current.description}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{t.humidity}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{current.humidity}<span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>%</span></div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{t.wind}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{current.windSpeed}<span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}> km/h</span></div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>7-Day Rain</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-sky)' }}>{totalPrecip.toFixed(1)}<span style={{ fontSize: '0.85rem' }}> mm</span></div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Avg ET₀</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{avgET0.toFixed(1)}<span style={{ fontSize: '0.85rem' }}> mm</span></div>
                </div>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="glass-card" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t.forecast7day}</div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--accent-orange)', display: 'inline-block' }}></span> Max</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 3, borderRadius: 2, background: 'var(--accent-sky)', display: 'inline-block' }}></span> Min</span>
                </div>
              </div>
              <div style={{ height: '260px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(6,15,26,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '0.85rem' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="tempMax" name="Max °C" stroke="var(--accent-orange)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--bg-1)', strokeWidth: 2 }} />
                    <Line yAxisId="left" type="monotone" dataKey="tempMin" name="Min °C" stroke="var(--accent-sky)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--bg-1)', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Daily forecast icons row */}
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {forecast.map((day, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{getWeatherIcon(day.code, day.condition)}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{day.precip > 0 ? `${day.precip.toFixed(0)}mm` : '—'}</div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </section>
  );
}
