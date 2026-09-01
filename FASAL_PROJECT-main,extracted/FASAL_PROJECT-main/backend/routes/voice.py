"""
backend/routes/voice.py

Voice API Routes for FASAL:
- POST /api/voice/transcribe: Speech-to-Text for farmer voice recordings.
- POST /api/voice/synthesize: Text-to-Speech audio streaming for responses.
- GET  /api/voice/languages: List supported Indian languages.
"""

import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response, status
from pydantic import BaseModel, Field

try:
    from backend.engines.speech_engine import SpeechEngine, SUPPORTED_LANGUAGES
    from backend.engines.tts_engine import TTSEngine
except ImportError:
    from engines.speech_engine import SpeechEngine, SUPPORTED_LANGUAGES
    from engines.tts_engine import TTSEngine

router = APIRouter(prefix="/api/voice", tags=["voice"])

MAX_AUDIO_BYTES = 15 * 1024 * 1024  # 15MB max


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Agricultural response text to synthesize")
    language: Optional[str] = Field("en", description="Language code: mr, hi, or en")


@router.get("/languages")
async def get_supported_languages():
    """Returns supported Indian languages for voice recognition and synthesis."""
    return {
        "success": True,
        "languages": SUPPORTED_LANGUAGES,
        "default": "mr"
    }


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(..., description="Recorded audio file (WebM, WAV, MP3, OGG, M4A)"),
    language: Optional[str] = Form("auto")
):
    """
    Transcribes farmer speech audio into text using multimodal speech processing.
    """
    # 1. Validate file existence
    if not audio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file was uploaded."
        )

    # 2. Read and validate file size
    audio_bytes = await audio.read()
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Audio file is too large (maximum size is 15MB)."
        )

    if len(audio_bytes) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio recording was empty. Please speak clearly into the microphone."
        )

    # 3. Transcribe via Speech Engine
    result = await SpeechEngine.transcribe_audio(
        audio_bytes=audio_bytes,
        content_type=audio.content_type or "audio/webm",
        language_hint=language
    )

    if not result.get("success"):
        return {
            "success": False,
            "transcript": "",
            "error": result.get("error", "Could not transcribe audio. Please try speaking again or type your query."),
            "language": language or "en"
        }

    return result


@router.post("/synthesize")
async def synthesize_speech(req: SynthesizeRequest):
    """
    Synthesizes agricultural text advice into a clear MP3 spoken audio stream.
    """
    try:
        audio_bytes, mime_type = TTSEngine.synthesize_speech(
            text=req.text,
            language=req.language or "en"
        )
        if not audio_bytes:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Speech synthesis produced empty audio."
            )

        return Response(
            content=audio_bytes,
            media_type=mime_type,
            headers={
                "Content-Disposition": "inline; filename=fasal_advice.mp3",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis error: {str(e)}"
        )
