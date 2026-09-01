from fastapi import APIRouter
from typing import Optional
from backend.database import get_db
from backend.engines.market_engine import MarketAnalyzer

router = APIRouter()

@router.get("/api/market-demand")
async def get_market_demand(crops: Optional[str] = None, region: Optional[str] = None):
    db = await get_db()
    analyzer = MarketAnalyzer(db)
    results = await analyzer.analyze(crops, region)
    return {"market_trends": results}
