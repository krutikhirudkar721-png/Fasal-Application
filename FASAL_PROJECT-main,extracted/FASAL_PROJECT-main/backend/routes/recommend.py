from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.engines.crop_engine import CropRecommendationEngine

router = APIRouter()

class RecommendRequest(BaseModel):
    ph: float
    n: float
    p: float
    k: float
    rainfall: float
    irrigation: str
    season: str
    budget: float
    land_size: float
    region: Optional[str] = None

@router.post("/api/recommend")
async def recommend_crops(req: RecommendRequest):
    db = await get_db()
    async with db.execute("SELECT * FROM crops") as cursor:
        rows = await cursor.fetchall()
        crops = [dict(r) for r in rows]
        
    engine = CropRecommendationEngine(crops)
    results = engine.evaluate(
        ph=req.ph, n=req.n, p=req.p, k=req.k,
        rainfall=req.rainfall, irrigation=req.irrigation,
        season=req.season, budget=req.budget, land_size=req.land_size
    )
    return {"recommendations": results}
