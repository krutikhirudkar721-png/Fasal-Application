import React from 'react';

export default function Background() {
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const delay = Math.random() * 20;
    const duration = Math.random() * 20 + 20;
    const maxOpacity = Math.random() * 0.25 + 0.05;
    const drift = (Math.random() - 0.5) * 80;
    const colors = [
      'rgba(52,211,153,0.5)',
      'rgba(45,212,191,0.4)',
      'rgba(56,189,248,0.35)',
      'rgba(240,180,41,0.3)',
      'rgba(255,255,255,0.2)'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return (
      <div key={i} style={{
        position: 'absolute', bottom: '-10px', left: `${left}%`,
        width: `${size}px`, height: `${size}px`,
        backgroundColor: color, borderRadius: '50%',
        boxShadow: `0 0 ${size * 4}px ${color}`,
        animation: `particleFloat ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        '--drift': `${drift}px`, '--max-opacity': maxOpacity,
        opacity: 0
      }} />
    );
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden',
      background: 'linear-gradient(165deg, #060f1a 0%, #0a1e14 35%, #060f1a 65%, #0c1424 100%)' }}
    >
      {/* Emerald glow */}
      <div style={{ position: 'absolute', top: '-10%', left: '-8%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)',
        filter: 'blur(100px)', animation: 'blobFloat1 30s ease-in-out infinite' }} />
      {/* Teal glow */}
      <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)',
        filter: 'blur(120px)', animation: 'blobFloat2 35s ease-in-out infinite' }} />
      {/* Gold glow */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(240,180,41,0.05) 0%, transparent 60%)',
        filter: 'blur(100px)', animation: 'blobFloat3 25s ease-in-out infinite' }} />

      {/* Subtle grid */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.02 }}>
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {particles}
    </div>
  );
}
