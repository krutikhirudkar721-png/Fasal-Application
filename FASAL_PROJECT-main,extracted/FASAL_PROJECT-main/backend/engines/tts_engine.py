"""
backend/engines/tts_engine.py

Text-to-Speech Engine for FASAL:
- Synthesizes agricultural advice into fluent spoken audio in Hindi (hi), Marathi (mr), and English (en).
- Strips markdown and special characters to produce natural speech.
- Uses gTTS (Google Text-to-Speech) with in-memory streaming.
"""

import io
import re
import logging
from typing import Optional, Tuple
from functools import lru_cache

logger = logging.getLogger("fasal.tts")

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False
    logger.warning("gTTS not installed. Server-side TTS will be disabled until gTTS is installed.")


def clean_markdown_for_speech(text: str) -> str:
    """Cleans markdown formatting, emojis, and symbols so that TTS reads smoothly."""
    if not text:
        return ""
    
    # 1. Remove markdown links [text](url) -> text
    cleaned = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    
    # 2. Remove markdown bold, italics, strikethrough, backticks
    cleaned = re.sub(r'[*_~`#>]', '', cleaned)
    
    # 3. Remove horizontal rules
    cleaned = re.sub(r'[-=]{3,}', ' ', cleaned)
    
    # 4. Remove emojis (common Unicode ranges)
    cleaned = re.sub(r'[\U00010000-\U0010ffff]', '', cleaned)
    
    # 5. Normalize whitespace and newlines
    cleaned = re.sub(r'\n+', '. ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    # Limit length for speech if too long (first 1000 characters for instant playback)
    if len(cleaned) > 1200:
        cleaned = cleaned[:1200] + "..."
        
    return cleaned


class TTSEngine:
    @staticmethod
    def synthesize_speech(text: str, language: str = "en") -> Tuple[Optional[bytes], str]:
        """
        Synthesizes text into MP3 audio bytes.
        Returns: (audio_bytes, mime_type)
        """
        try:
            from gtts import gTTS
        except ImportError:
            raise RuntimeError("gTTS is not installed. Please run: pip install gTTS")

        clean_text = clean_markdown_for_speech(text)
        if not clean_text:
            raise ValueError("Input text is empty.")

        # Map language codes
        lang_code = "en"
        tld = "co.in"
        
        if language in ("mr", "mr-IN", "marathi"):
            lang_code = "mr"
        elif language in ("hi", "hi-IN", "hindi"):
            lang_code = "hi"
        elif language in ("en", "en-IN", "en-US", "english"):
            lang_code = "en"
            tld = "co.in"

        try:
            tts = gTTS(text=clean_text, lang=lang_code, tld=tld, slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            return fp.read(), "audio/mpeg"
        except Exception as e:
            logger.error(f"TTS synthesis failed for lang {lang_code}: {e}", exc_info=True)
            # If regional dialect fails, attempt fallback to standard English
            if lang_code != "en":
                try:
                    tts = gTTS(text=clean_text, lang="en", tld="co.in", slow=False)
                    fp = io.BytesIO()
                    tts.write_to_fp(fp)
                    fp.seek(0)
                    return fp.read(), "audio/mpeg"
                except Exception:
                    pass
            raise RuntimeError(f"Speech synthesis error: {str(e)}")
