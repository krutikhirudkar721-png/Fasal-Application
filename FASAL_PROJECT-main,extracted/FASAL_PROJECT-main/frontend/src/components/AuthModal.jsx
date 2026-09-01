import React, { useState, useEffect, useRef } from 'react';
import { STR } from '../data/i18n';
import { useAuth } from '../hooks/useAuth';

export default function AuthModal({ isOpen, onClose, lang, onFarmerLocationSync }) {
  const t = STR[lang] || STR.en;
  const { user, requestOtp, verifyOtp, logout } = useAuth();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [demoNotice, setDemoNotice] = useState('');

  const otpInputsRef = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setStep('phone');
      setOtpValues(['', '', '', '', '', '']);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError(lang === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : lang === 'mr' ? 'कृपया १० अंकांचा वैध मोबाईल नंबर प्रविष्ट करा.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const res = await requestOtp(cleanPhone);
      setStep('otp');
      setResendTimer(45);
      setDemoNotice(res.demoOtp ? `(Demo OTP: ${res.demoOtp})` : '(Demo OTP: 123456)');
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const enteredOtp = otpValues.join('');
    if (enteredOtp.length < 6) {
      setError(lang === 'hi' ? 'कृपया 6-अंकीय OTP दर्ज करें।' : lang === 'mr' ? 'कृपया ६-अंकी OTP प्रविष्ट करा.' : 'Please enter the 6-digit OTP code.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const userData = await verifyOtp(cleanPhone, enteredOtp);
      if (userData?.state && userData?.district && onFarmerLocationSync) {
        onFarmerLocationSync(userData.state, userData.district);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid OTP code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(10, 20, 35, 0.95)',
          border: '1px solid rgba(52, 211, 153, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(52, 211, 153, 0.15)',
          position: 'relative',
          padding: '2rem',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--accent-emerald)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
            {user ? t.farmerAccount : t.farmerLogin}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {user ? t.profileSaved : t.loginSubtitle}
          </p>
        </div>

        {/* Logged in state */}
        {user ? (
          <div>
            <div
              style={{
                background: 'rgba(0,0,0,0.35)',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Name</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-gold)' }}>{user.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mobile</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>+91 {user.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>District</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>{user.district || 'Nagpur'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Land Size</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-sky)' }}>{user.landSize || 4} Acres</span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.logout}
            </button>
          </div>
        ) : (
          /* Login Form */
          <div>
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                }}
              >
                {error}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">{t.mobileNumber}</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      +91
                    </span>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="9876543210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      style={{ paddingLeft: '3.2rem', fontSize: '1rem', letterSpacing: '0.05em' }}
                      autoFocus
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.75rem',
                    color: 'var(--accent-sky)',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>💡</span>
                  <span>{t.demoOtpNotice}</span>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.8rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (lang === 'hi' ? 'भेजा जा रहा है...' : lang === 'mr' ? 'पाठवत आहे...' : 'Sending OTP...') : t.sendOtp}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    OTP sent to <strong>+91 {phone}</strong> {demoNotice}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        style={{
                          width: '44px',
                          height: '50px',
                          textAlign: 'center',
                          fontSize: '1.3rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(0,0,0,0.4)',
                          color: '#fff',
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      ← Change number
                    </button>

                    {resendTimer > 0 ? (
                      <span style={{ color: 'var(--text-muted)' }}>Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {t.resendOtp}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.8rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (lang === 'hi' ? 'सत्यापित हो रहा है...' : lang === 'mr' ? 'पडताळणी सुरू आहे...' : 'Verifying...') : t.verifyAndLogin}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
