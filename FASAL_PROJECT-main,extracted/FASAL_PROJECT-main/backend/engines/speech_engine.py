"""
backend/engines/speech_engine.py

Speech-to-Text Engine for FASAL:
- Transcribes farmer voice recordings in Hindi (hi-IN), Marathi (mr-IN), and English (en-IN).
- Leverages Gemini Multimodal Audio understanding (Gemini 2.5 Flash / 2.0 Flash) for accurate recognition of Indian regional agricultural terminology.
- Graceful offline and heuristic fallback handling.
"""

import os
import base64
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("fasal.speech")

SUPPORTED_LANGUAGES = {
    "mr": {"code": "mr-IN", "name": "मराठी", "label": "Marathi"},
    "hi": {"code": "hi-IN", "name": "हिन्दी", "label": "Hindi"},
    "en": {"code": "en-IN", "name": "English", "label": "English"}
}


class SpeechEngine:
    @staticmethod
    async def transcribe_audio(
        audio_bytes: bytes,
        content_type: str = "audio/webm",
        language_hint: Optional[str] = "auto"
    ) -> Dict[str, Any]:
        """
        Transcribes raw audio bytes into text using multimodal speech processing.
        Supports WebM, WAV, MP3, OGG, M4A.
        """
        if not audio_bytes or len(audio_bytes) < 100:
            return {
                "success": False,
                "error": "Audio recording is empty or too short. Please speak clearly.",
                "transcript": ""
            }

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        
        # Normalize mime type for Gemini API
        mime_type = content_type.split(";")[0].strip().lower()
        if mime_type not in ("audio/webm", "audio/wav", "audio/mp3", "audio/mpeg", "audio/ogg", "audio/m4a", "audio/x-wav"):
            mime_type = "audio/webm"

        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        # Multimodal Gemini Audio Transcription
        if api_key:
            lang_prompt = ""
            if language_hint and language_hint in SUPPORTED_LANGUAGES:
                target_lang = SUPPORTED_LANGUAGES[language_hint]["name"]
                lang_prompt = f"The speaker is speaking in {target_lang}. Transcribe the speech accurately in {target_lang} script."
            else:
                lang_prompt = "The speaker is an Indian farmer speaking in Hindi, Marathi, or English. Transcribe accurately in the original spoken language script (Devanagari for Hindi/Marathi, Latin for English)."

            instruction = (
                f"You are FASAL Voice AI Speech Recognition. {lang_prompt} "
                "CRITICAL INSTRUCTIONS:\n"
                "1. Return ONLY the exact transcribed speech text. Do not add explanations, quotation marks, or pleasantries.\n"
                "2. Preserve agricultural terminology (crops, pests, fertilizer names, soil types, mandi terms).\n"
                "3. If the audio is silent or unintelligible, return an empty string."
            )

            models = [
                "gemini-3.6-flash",
                "gemini-3.5-flash",
                "gemini-3.5-flash-lite",
                "gemini-3.1-flash-lite",
                "gemini-2.5-flash",
                "gemini-2.0-flash",
                "gemini-1.5-flash"
            ]

            async with httpx.AsyncClient(timeout=25.0) as client:
                for model_name in models:
                    try:
                        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                        payload = {
                            "contents": [
                                {
                                    "parts": [
                                        {"text": instruction},
                                        {
                                            "inline_data": {
                                                "mime_type": mime_type,
                                                "data": audio_b64
                                            }
                                        }
                                    ]
                                }
                            ]
                        }

                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            candidates = data.get("candidates", [])
                            if candidates and "content" in candidates[0]:
                                parts = candidates[0]["content"].get("parts", [])
                                if parts and "text" in parts[0]:
                                    raw_text = parts[0]["text"].strip()
                                    if raw_text:
                                        detected_lang = SpeechEngine.detect_language_script(raw_text, language_hint)
                                        return {
                                            "success": True,
                                            "transcript": raw_text,
                                            "language": detected_lang,
                                            "model": model_name
                                        }
                    except Exception as e:
                        logger.warning(f"Speech transcription attempt with {model_name} failed: {e}")
                        continue

        # Fallback if Gemini transcription did not return text or no API key
        return {
            "success": False,
            "error": "Voice could not be clearly understood. Please speak near the microphone or type your question.",
            "transcript": "",
            "language": language_hint or "en"
        }

    @staticmethod
    def detect_language_script(text: str, hint: Optional[str] = None) -> str:
        """Detects whether text is primarily Devanagari (Hindi/Marathi) or English."""
        if hint and hint in ("hi", "mr", "en"):
            return hint
            
        devanagari_count = sum(1 for char in text if 0x0900 <= ord(char) <= 0x097F)
        if devanagari_count > len(text) * 0.3:
            # Check for Marathi specific vocabulary tokens
            marathi_markers = ["आहे", "नाही", "पिकाला", "झाले", "करावे", "माझ्या", "शेत", "पाने", "डाग", "लागवड"]
            if any(marker in text for marker in marathi_markers):
                return "mr"
            return "hi"
        return "en"
