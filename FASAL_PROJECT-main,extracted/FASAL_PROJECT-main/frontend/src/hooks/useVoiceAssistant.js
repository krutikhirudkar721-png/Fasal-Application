/**
 * frontend/src/hooks/useVoiceAssistant.js
 *
 * Production Voice Assistant Hook for FASAL:
 * - Speech-to-Text (STT): Browser Web Speech API with seamless server-side MediaRecorder fallback.
 * - Text-to-Speech (TTS): Native SpeechSynthesis with server-side gTTS MP3 audio stream fallback.
 * - Supports Hindi (hi-IN), Marathi (mr-IN), and English (en-IN).
 * - Mobile-friendly, tactile farmer UX with clear permission & audio states.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../data/api';

const LANG_CONFIGS = {
  mr: { bcp47: 'mr-IN', name: 'मराठी', gtts: 'mr' },
  hi: { bcp47: 'hi-IN', name: 'हिन्दी', gtts: 'hi' },
  en: { bcp47: 'en-IN', name: 'English', gtts: 'en' },
};

export function useVoiceAssistant({ currentLang = 'en', onTranscriptReady = null } = {}) {
  // STT States
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioError, setAudioError] = useState('');
  const [selectedVoiceLang, setSelectedVoiceLang] = useState(currentLang || 'en');

  // TTS States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioElementRef = useRef(null);
  const activeAudioUrlRef = useRef(null);

  // Sync selected voice language with app language changes if user hasn't explicitly overridden
  useEffect(() => {
    if (currentLang && LANG_CONFIGS[currentLang]) {
      setSelectedVoiceLang(currentLang);
    }
  }, [currentLang]);

  // Clean up audio & recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (activeAudioUrlRef.current) {
        URL.revokeObjectURL(activeAudioUrlRef.current);
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // 1. SPEECH-TO-TEXT (STT) IMPLEMENTATION
  // --------------------------------------------------------------------------

  const startListening = useCallback(async () => {
    setAudioError('');
    setLiveTranscript('');
    setIsProcessing(false);

    const targetLangCode = LANG_CONFIGS[selectedVoiceLang]?.bcp47 || 'en-IN';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // A. Native Browser Web Speech Recognition
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = targetLangCode;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setLiveTranscript(currentText);

          if (event.results[0].isFinal) {
            const finalQuery = currentText.trim();
            if (finalQuery && onTranscriptReady) {
              onTranscriptReady(finalQuery, selectedVoiceLang);
            }
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setAudioError('mic_permission_denied');
          } else if (event.error === 'no-speech') {
            setAudioError('no_speech_detected');
          } else {
            // If browser recognition fails, try server fallback
            fallbackMediaRecorderRecording();
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn('Failed to start native speech recognition:', err);
      }
    }

    // B. Server-Side MediaRecorder Fallback (Mobile / Browsers without Web Speech)
    fallbackMediaRecorderRecording();
  }, [selectedVoiceLang, onTranscriptReady]);

  const fallbackMediaRecorderRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);
        // Stop microphone tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const res = await api.transcribeAudio(audioBlob, selectedVoiceLang);
          if (res.success && res.transcript) {
            setLiveTranscript(res.transcript);
            if (onTranscriptReady) {
              onTranscriptReady(res.transcript, res.language || selectedVoiceLang);
            }
          } else {
            setAudioError(res.error || 'no_speech_detected');
          }
        } catch (err) {
          setAudioError(err.message || 'transcription_failed');
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (permErr) {
      setIsListening(false);
      setAudioError('mic_permission_denied');
    }
  }, [selectedVoiceLang, onTranscriptReady]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    setIsListening(false);
  }, []);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setLiveTranscript('');
  }, []);

  // --------------------------------------------------------------------------
  // 2. TEXT-TO-SPEECH (TTS) IMPLEMENTATION
  // --------------------------------------------------------------------------

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (audioElementRef.current && !audioElementRef.current.paused) {
      audioElementRef.current.pause();
      setIsPaused(true);
    } else if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (audioElementRef.current && audioElementRef.current.paused) {
      audioElementRef.current.play();
      setIsPaused(false);
    } else if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const speak = useCallback(
    async (text, preferredLang = null) => {
      stopSpeaking();
      if (!text) return;

      const langKey = preferredLang || selectedVoiceLang || 'en';
      const targetBcp47 = LANG_CONFIGS[langKey]?.bcp47 || 'en-IN';

      // Clean text for speech
      const cleanText = text
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/[*_~`#>]/g, '')
        .replace(/[-=]{3,}/g, ' ')
        .replace(/\n+/g, '. ')
        .trim();

      // Check if browser native synthesis has an available voice for Hindi/Marathi/English
      const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      const hasNativeVoice = voices.some(
        (v) => v.lang.startsWith(langKey) || v.lang.startsWith(targetBcp47.slice(0, 2))
      );

      // A. Try Browser Native Speech Synthesis (if matching voice is present)
      if (window.speechSynthesis && hasNativeVoice) {
        try {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = targetBcp47;
          utterance.rate = 0.95; // Slightly measured pace for clarity

          const matchingVoice = voices.find(
            (v) => v.lang === targetBcp47 || v.lang.startsWith(langKey)
          );
          if (matchingVoice) utterance.voice = matchingVoice;

          utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
          };
          utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
          };

          window.speechSynthesis.speak(utterance);
          return;
        } catch (e) {
          console.warn('Native speech synthesis failed, falling back to server TTS:', e);
        }
      }

      // B. Server-Side gTTS Fallback (High-quality Indian audio stream)
      try {
        setIsSpeaking(true);
        setIsPaused(false);

        const audioUrl = await api.synthesizeSpeech(cleanText, langKey);
        if (activeAudioUrlRef.current) {
          URL.revokeObjectURL(activeAudioUrlRef.current);
        }
        activeAudioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioElementRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setAudioError('tts_playback_failed');
        };

        await audio.play();
      } catch (err) {
        console.error('Server TTS playback failed:', err);
        setIsSpeaking(false);
        setIsPaused(false);
      }
    },
    [selectedVoiceLang, stopSpeaking]
  );

  return {
    isListening,
    isProcessing,
    liveTranscript,
    audioError,
    setAudioError,
    selectedVoiceLang,
    setSelectedVoiceLang,
    supportedLanguages: LANG_CONFIGS,
    startListening,
    stopListening,
    cancelListening,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isSpeaking,
    isPaused,
  };
}
