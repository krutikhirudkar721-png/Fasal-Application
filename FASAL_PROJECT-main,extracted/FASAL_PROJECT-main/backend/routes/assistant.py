"""
backend/routes/assistant.py

High-Precision Agricultural AI Assistant for FASAL:
Pipeline: User Query + Image -> AI Router -> RAG Knowledge Base (ICAR/CIBRC) 
          + Live Weather Microclimate Risk -> Gemini 2.5 Flash Reasoning -> Post-Safety Validator
"""

import os
import base64
import httpx
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Header
from dotenv import load_dotenv

load_dotenv()

try:
    from backend.routes.auth import get_current_user
    from backend.engines.ai_precision_engine import (
        AIRouter,
        RAGRetriever,
        MicroclimateRiskEngine,
        AgronomySafetyValidator,
        PrecisionAIEngine
    )
except ImportError:
    from routes.auth import get_current_user
    from engines.ai_precision_engine import (
        AIRouter,
        RAGRetriever,
        MicroclimateRiskEngine,
        AgronomySafetyValidator,
        PrecisionAIEngine
    )

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8MB


def _build_rag_heuristic_response(question: str, routed: dict, rag_items: list, weather_risk: dict, had_image: bool) -> str:
    """Intelligent, verified RAG heuristic response when Gemini is offline or API key is not yet set."""
    if rag_items:
        item = rag_items[0]
        resp = (
            f"### 🌾 Clinical Diagnosis: {item['condition']}\n\n"
            f"**Causal Category:** {item['category'].upper()} | **Target Crop:** {', '.join(item['crops']).title()}\n\n"
            f"#### 🔍 Key Observed Symptoms & Indicators:\n"
            + "\n".join([f"- {s}" for s in item['symptoms']]) + "\n\n"
            f"#### 🌿 Organic & Low-Cost Biological Remedy (First Priority):\n"
            f"{item['organic_remedy']}\n\n"
            f"#### 🧪 Targeted Chemical Remedy (CIBRC Approved Dosage):\n"
            f"{item['chemical_remedy']}\n"
            f"- **Pre-Harvest Interval (PHI):** {item['phi_days']} days\n\n"
            f"#### 🌦️ Microclimate Advisory & Environmental Risk:\n"
            f"- **Fungal Risk Index:** {weather_risk['fungal_risk']}\n"
            f"- **Pest Escalation Level:** {weather_risk['pest_risk']}\n"
            f"- **Spraying Window Guidance:** {weather_risk['spray_condition']}\n\n"
            f"#### 🛡️ Preventive Cultural Practices:\n"
            f"{item['preventive']}\n"
        )
        return AgronomySafetyValidator.validate_and_guard(resp, rag_items)
    
    # Fallback if no direct RAG match
    return (
        f"### 🌱 Agricultural Agronomy Advisory\n\n"
        f"**Query Analysis:** \"{question}\"\n\n"
        f"**Detected Intent:** {routed['intent']} ({', '.join(routed['detected_crops'])})\n\n"
        f"**Key Recommendations:**\n"
        f"1. **Nutrient Management:** Maintain soil pH 6.0-7.5 and perform soil testing before fertilizer application.\n"
        f"2. **Integrated Pest Management (IPM):** Use yellow/blue sticky traps and bio-agents (*Trichoderma*, *Beauveria*) before chemical intervention.\n"
        f"3. **Microclimate Context:** Current risk level: {weather_risk['fungal_risk']}.\n\n"
        f"*💡 For live real-time Gemini Vision multimodal analysis, configure GEMINI_API_KEY in backend/.env.*"
    )


@router.post("/ask")
async def ask_ai(
    question: str = Form(...),
    image: UploadFile = File(None),
    temp_c: Optional[float] = Form(None),
    humidity: Optional[float] = Form(None),
    rain_mm: Optional[float] = Form(None),
    authorization: Optional[str] = Header(None)
):
    # 1. Process image if uploaded
    image_b64 = None
    mime_type = None
    if image:
        contents = await image.read()
        if len(contents) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=400, detail="Image too large (max 8MB)")
        if image.content_type not in ("image/jpeg", "image/png", "image/webp"):
            raise HTTPException(status_code=400, detail="Unsupported image type. Use JPEG, PNG, or WebP.")
        image_b64 = base64.b64encode(contents).decode("utf-8")
        mime_type = image.content_type

    # 2. Stage 1: AI Router (Intent & Crop Isolation)
    routed = AIRouter.route_query(question, has_image=image is not None)

    # 3. Stage 2: RAG Knowledge Retrieval (ICAR / KVK / CIBRC standards)
    rag_items = RAGRetriever.retrieve(question, routed, top_k=2)

    # 4. Stage 3: Real-Time Microclimate Risk Engine
    weather_risk = MicroclimateRiskEngine.analyze_weather_risk(
        temp_c=temp_c,
        humidity=humidity,
        rain_mm=rain_mm
    )

    # 5. Stage 4: Grounded LLM Prompt Synthesizer
    grounded_prompt = PrecisionAIEngine.build_grounded_prompt(
        question=question,
        routed=routed,
        rag_items=rag_items,
        weather_context=weather_risk
    )

    # 6. Stage 5: Gemini Multimodal Call (with fallback across versions)
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    if api_key:
        parts = [{"text": grounded_prompt}]
        if image_b64 and mime_type:
            parts.append({
                "inline_data": {
                    "mime_type": mime_type,
                    "data": image_b64
                }
            })

        models = [
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ]
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            for model_name in models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                    payload = {"contents": [{"parts": parts}]}
                    
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts_resp = candidates[0]["content"].get("parts", [])
                            if parts_resp and "text" in parts_resp[0]:
                                raw_answer = parts_resp[0]["text"]
                                # Stage 6: Agronomy Safety & IPM Validation
                                validated_answer = AgronomySafetyValidator.validate_and_guard(raw_answer, rag_items)
                                
                                return {
                                    "success": True,
                                    "answer": validated_answer,
                                    "hadImage": image is not None,
                                    "source": f"FASAL AI Precision Pipeline (RAG + {model_name})",
                                    "model": model_name,
                                    "pipeline": {
                                        "intent": routed["intent"],
                                        "crops": routed["detected_crops"],
                                        "rag_matches": len(rag_items),
                                        "weather_risk": weather_risk["fungal_risk"]
                                    }
                                }
                except Exception as e:
                    print(f"Gemini API attempt with {model_name} failed: {e}")
                    continue

    # Stage 7: Deterministic RAG + Heuristic fallback when offline / no API key
    fallback_ans = _build_rag_heuristic_response(question, routed, rag_items, weather_risk, image is not None)
    return {
        "success": True,
        "answer": fallback_ans,
        "hadImage": image is not None,
        "source": "FASAL Precision Agronomy Engine (ICAR Verified RAG)",
        "model": "grounded-rag-engine",
        "pipeline": {
            "intent": routed["intent"],
            "crops": routed["detected_crops"],
            "rag_matches": len(rag_items),
            "weather_risk": weather_risk["fungal_risk"]
        }
    }
