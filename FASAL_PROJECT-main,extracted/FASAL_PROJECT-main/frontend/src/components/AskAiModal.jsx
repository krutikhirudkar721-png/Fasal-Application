import React, { useState, useRef, useEffect } from 'react';
import { STR } from '../data/i18n';
import { api } from '../data/api';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

export default function AskAiModal({ isOpen, onClose, lang, weather, initialVoiceMode = false }) {
  const t = STR[lang] || STR.en;

  const [question, setQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // Voice Assistant Hook
  const {
    isListening,
    isProcessing: isVoiceProcessing,
    liveTranscript,
    audioError,
    setAudioError,
    selectedVoiceLang,
    setSelectedVoiceLang,
    supportedLanguages,
    startListening,
    stopListening,
    cancelListening,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isSpeaking,
    isPaused,
  } = useVoiceAssistant({
    currentLang: lang || 'en',
    onTranscriptReady: (transcript, detectedLang) => {
      setQuestion(transcript);
      if (detectedLang && ['mr', 'hi', 'en'].includes(detectedLang)) {
        setSelectedVoiceLang(detectedLang);
      }
    },
  });

  // Automatically start voice if opened in voice mode
  useEffect(() => {
    if (isOpen && initialVoiceMode) {
      const timer = setTimeout(() => {
        startListening();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialVoiceMode, startListening]);

  // Clean up speech when closing modal
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      cancelListening();
    }
  }, [isOpen, stopSpeaking, cancelListening]);

  if (!isOpen) return null;

  const samplePrompts = [
    lang === 'hi' ? 'सोयाबीन की पत्तियों पर पीले धब्बे और किनारों का सूखना' : lang === 'mr' ? 'सोयाबीनच्या पानांवर पिवळे डाग आणि पाने सुकणे' : 'Yellow spots and curling on Soybean leaves',
    lang === 'hi' ? 'कपास में गुलाबी सुंडी (Pink Bollworm) की रोकथाम' : lang === 'mr' ? 'कापूस बोंडअळीचे (Pink Bollworm) सेंद्रिय नियंत्रण' : 'Organic control for Pink Bollworm in Cotton',
    lang === 'hi' ? 'गेहूं में कल्ले (tillers) बढ़ाने के लिए सबसे अच्छा उर्वरक' : lang === 'mr' ? 'गव्हाच्या फुटव्यांसाठी उत्तम खत व्यवस्थापन' : 'Best fertilizer schedule for high wheat tillering',
    lang === 'hi' ? 'काली मिट्टी में तुअर के साथ कौन सी सह-फसल सबसे अच्छी है?' : lang === 'mr' ? 'काळी मातीत तुरीसोबत कोणते आंतरपीक सर्वोत्तम आहे?' : 'Best intercropping crop with Tur in black soil',
  ];

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Image must be under 8MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAsk = async (promptText) => {
    // Stop any ongoing voice playback or recording
    stopSpeaking();
    stopListening();

    const q = promptText || question;
    if (!q.trim() && !selectedImage) {
      setError(lang === 'hi' ? 'कृपया प्रश्न लिखें, बोलें या फसल की फोटो अपलोड करें।' : lang === 'mr' ? 'कृपया प्रश्न लिहा, बोला किंवा पिकाचा फोटो अपलोड करा.' : 'Please enter a question, speak, or upload a crop photo.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('question', q.trim() || 'Please analyze this crop image for any disease, pest, or nutrient deficiency and provide treatment recommendations.');
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    // Attach real-time weather microclimate context
    if (weather) {
      if (weather.temp !== undefined && weather.temp !== null) formData.append('temp_c', weather.temp);
      if (weather.humidity !== undefined && weather.humidity !== null) formData.append('humidity', weather.humidity);
      if (weather.rainfall !== undefined && weather.rainfall !== null) formData.append('rain_mm', weather.rainfall);
    }

    try {
      const data = await api.askAi(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to get AI diagnosis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.84)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 110,
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
          maxWidth: '700px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'rgba(10, 22, 38, 0.97)',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.15)',
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
            fontSize: '1.6rem',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(52,211,153,0.2) 0%, rgba(56,189,248,0.2) 100%)',
              border: '1px solid rgba(52,211,153,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 0 20px rgba(52,211,153,0.2)',
            }}
          >
            🌾
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {lang === 'hi' ? 'फसल AI डॉक्टर एवं आवाज सहायक' : lang === 'mr' ? 'पीक AI डॉक्टर व आवाज सहाय्यक' : 'FASAL AI Plant Doctor & Voice'}
              </h2>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                ● Multimodal RAG + Voice
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              {lang === 'hi'
                ? 'रोग, कीट या पोषण निदान के लिए बोलकर पूछें, फोटो अपलोड करें या लिखें'
                : lang === 'mr'
                ? 'रोग, कीड किंवा खत मार्गदर्शनासाठी बोलून विचारा, फोटो टाका किंवा लिहा'
                : 'Speak in Marathi/Hindi/English, upload a photo, or type your crop question'}
            </p>
          </div>
        </div>

        {/* Voice Language Selector Chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.3)',
            padding: '0.5rem 0.85rem',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            🗣️ {t.voiceSelectLang || 'Spoken Language'}:
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {Object.entries(supportedLanguages).map(([code, meta]) => (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedVoiceLang(code)}
                style={{
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: selectedVoiceLang === code ? 700 : 500,
                  borderRadius: '6px',
                  border: selectedVoiceLang === code ? '1px solid var(--accent-emerald)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedVoiceLang === code ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.03)',
                  color: selectedVoiceLang === code ? '#34d399' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {meta.name}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload Area */}
        <div style={{ marginBottom: '1.25rem' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(52,211,153,0.3)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-emerald)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)')}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>📷</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                {lang === 'hi' ? 'फसल / पत्ती का फोटो जोड़ें (वैकल्पिक)' : lang === 'mr' ? 'पिकाचा / पानाचा फोटो जोडा (पर्यायी)' : 'Add Crop / Leaf Photo (Optional)'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                JPEG, PNG, WebP (Max 8MB) · Gemini Vision Inspection
              </div>
            </div>
          ) : (
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(52,211,153,0.4)',
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                    {selectedImage?.name || 'Photo Attached'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>
                    Ready for Gemini Vision Multimodal Inspection
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Remove ✕
              </button>
            </div>
          )}
        </div>

        {/* Question Input with Embedded Voice Mic */}
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              borderRadius: '12px',
              border: isListening ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.35)',
              boxShadow: isListening ? '0 0 20px rgba(52,211,153,0.25)' : 'none',
              transition: 'all 0.25s',
            }}
          >
            <textarea
              className="form-input"
              rows={3}
              placeholder={
                isListening
                  ? `${t.voiceListening || 'Listening... Speak now'} (${supportedLanguages[selectedVoiceLang]?.name})...`
                  : lang === 'hi'
                  ? 'अपनी फसल का सवाल यहाँ बोलें या लिखें (उदा. कपास के पत्तों में पीले धब्बे या तुअर में फूल झड़ने की दवा...)'
                  : lang === 'mr'
                  ? 'तुमच्या पिकाचा प्रश्न इथे बोला किंवा लिहा (उदा. सोयाबीन पानांवर पिवळे डाग किंवा कपाशीवरील कीड उपाय...)'
                  : 'Speak or type your crop question (e.g. Yellow veins on Soybean, pest infestation, fertilizer advice...)'
              }
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                resize: 'vertical',
                minHeight: '82px',
                fontSize: '0.92rem',
                padding: '0.85rem 3.5rem 0.85rem 1rem',
                color: '#fff',
              }}
            />

            {/* Prominent Microphone Button (Inside text area) */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              title={isListening ? (t.voiceStop || 'Stop') : (t.voiceBtn || 'Speak Question')}
              style={{
                position: 'absolute',
                right: '0.65rem',
                bottom: '0.65rem',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: isListening
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: isListening ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isListening
                  ? '0 0 15px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.4)'
                  : '0 4px 12px rgba(16, 185, 129, 0.4)',
                transform: isListening ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s',
                animation: isListening ? 'pulse-wave 1.2s infinite' : 'none',
              }}
            >
              {isListening ? '⏹️' : '🎤'}
            </button>
          </div>
        </div>

        {/* Live Listening Banner & Feedback */}
        {isListening && (
          <div
            className="animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(6,78,59,0.3) 100%)',
              border: '1px solid rgba(52,211,153,0.4)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <span style={{ width: '4px', height: '14px', background: '#34d399', borderRadius: '2px', animation: 'bounce-bar 0.8s infinite 0.1s' }} />
                <span style={{ width: '4px', height: '22px', background: '#34d399', borderRadius: '2px', animation: 'bounce-bar 0.8s infinite 0.3s' }} />
                <span style={{ width: '4px', height: '16px', background: '#34d399', borderRadius: '2px', animation: 'bounce-bar 0.8s infinite 0.2s' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
                  {t.voiceListening || 'Listening... Speak your crop question'} ({supportedLanguages[selectedVoiceLang]?.name})
                </div>
                {liveTranscript && (
                  <div style={{ fontSize: '0.78rem', color: '#e2e8f0', marginTop: '0.15rem' }}>
                    "{liveTranscript}"
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={stopListening}
                style={{
                  background: 'rgba(52,211,153,0.2)',
                  border: '1px solid rgba(52,211,153,0.4)',
                  color: '#34d399',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✓ {t.voiceStop || 'Done'}
              </button>
              <button
                type="button"
                onClick={cancelListening}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--text-muted)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.55rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                ✕ {t.voiceCancel || 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Voice Processing Indicator */}
        {isVoiceProcessing && (
          <div
            style={{
              background: 'rgba(56,189,248,0.15)',
              border: '1px solid rgba(56,189,248,0.3)',
              borderRadius: '8px',
              padding: '0.6rem 0.85rem',
              marginBottom: '1rem',
              fontSize: '0.82rem',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div style={{ width: '14px', height: '14px', border: '2px solid rgba(56,189,248,0.3)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            {t.voiceTranscribing || 'Understanding your voice...'}
          </div>
        )}

        {/* Voice Error Notice (Farmer Friendly) */}
        {audioError && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {audioError === 'mic_permission_denied'
                ? t.voiceMicDenied || 'Microphone access denied. Please enable microphone permissions in your browser or type your question.'
                : audioError === 'no_speech_detected'
                ? t.voiceNoSpeech || "We couldn't hear any speech clearly. Please speak near the microphone and try again."
                : audioError}
            </span>
            <button
              onClick={() => setAudioError('')}
              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '1rem', marginLeft: '0.5rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Sample Chips */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
            {lang === 'hi' ? 'त्वरित प्रश्न:' : lang === 'mr' ? 'त्वरित प्रश्न:' : 'Quick Prompts:'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuestion(prompt);
                  handleAsk(prompt);
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-emerald)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
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

        {/* Action Button */}
        <button
          type="button"
          className="btn-primary"
          onClick={() => handleAsk(question)}
          disabled={loading}
          style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              {lang === 'hi' ? 'Gemini AI द्वारा विश्लेषण हो रहा है...' : lang === 'mr' ? 'Gemini AI विश्लेषण करत आहे...' : 'Analyzing with Gemini AI...'}
            </span>
          ) : (
            <span>🌿 {lang === 'hi' ? 'AI निदान प्राप्त करें' : lang === 'mr' ? 'AI निदान मिळवा' : 'Get AI Diagnosis'}</span>
          )}
        </button>

        {/* Diagnosis Results Card with Audio Spoken Player */}
        {result && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: '1.75rem',
              padding: '1.5rem',
              background: 'rgba(6, 15, 26, 0.88)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              borderRadius: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="live-dot"></span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {result.source || 'FASAL AI Precision Engine'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {result.pipeline?.intent && (
                  <span style={{ fontSize: '0.7rem', background: 'rgba(52, 211, 153, 0.12)', color: 'var(--accent-emerald)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(52,211,153,0.3)' }}>
                    🎯 {result.pipeline.intent}
                  </span>
                )}
                {result.hadImage && (
                  <span style={{ fontSize: '0.7rem', background: 'rgba(56,189,248,0.15)', color: 'var(--accent-sky)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(56,189,248,0.3)' }}>
                    📸 Vision Inspected
                  </span>
                )}
                {result.pipeline?.weather_risk && (
                  <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.3)' }}>
                    🌦️ Weather Factor Grounded
                  </span>
                )}
              </div>
            </div>

            {/* Audio Voice Player Controls Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🔊</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                    {isSpeaking
                      ? isPaused
                        ? (t.voicePause || 'Paused')
                        : (t.voicePlaying || 'Speaking Advice...')
                      : (t.voiceListenResponse || 'Listen to Advice')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {supportedLanguages[selectedVoiceLang]?.name || 'Hindi / Marathi / English'} Audio
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {!isSpeaking ? (
                  <button
                    type="button"
                    onClick={() => speak(result.answer, selectedVoiceLang)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(16,185,129,0.35)',
                    }}
                  >
                    ▶️ {t.voiceListenResponse || 'Listen'}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={isPaused ? resumeSpeaking : pauseSpeaking}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {isPaused ? `▶️ ${t.voiceResume || 'Resume'}` : `⏸️ ${t.voicePause || 'Pause'}`}
                    </button>
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      style={{
                        background: 'rgba(239,68,68,0.2)',
                        border: '1px solid rgba(239,68,68,0.4)',
                        color: '#f87171',
                        borderRadius: '6px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      ⏹️ {t.voiceStopAudio || 'Stop'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Answer Text Content */}
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
              }}
            >
              {result.answer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
