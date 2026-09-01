from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.engines.soil_engine import SoilAnalyzer

router = APIRouter()

class SoilRequest(BaseModel):
    ph: float
    n: float
    p: float
    k: float
    organic_carbon: float
    moisture: float
    locale: Optional[str] = 'en'

@router.post("/api/soil-analysis")
async def analyze_soil(req: SoilRequest):
    analyzer = SoilAnalyzer()
    res = analyzer.analyze(
        ph=req.ph, n=req.n, p=req.p, k=req.k, 
        oc=req.organic_carbon, moisture=req.moisture, locale=req.locale
    )
    return res
