from fastapi import APIRouter
from typing import Optional
from backend.database import get_db

router = APIRouter()

@router.get("/api/seasonal-calendar")
async def get_seasonal_calendar(crop: Optional[str] = None):
    db = await get_db()
    
    query = """
        SELECT c.name_en, c.name_hi, c.name_mr, cal.sowing_months, cal.growing_months, cal.harvest_months
        FROM crop_calendar cal
        JOIN crops c ON cal.crop_id = c.id
    """
    params = []
    
    if crop:
        query += " WHERE c.name_en = ?"
        params.append(crop)
        
    async with db.execute(query, params) as cursor:
        rows = await cursor.fetchall()
        
    results = []
    for r in rows:
        results.append({
            "crop": r["name_en"],
            "crop_hi": r["name_hi"],
            "crop_mr": r["name_mr"],
            "sowing": r["sowing_months"].split(','),
            "growing": r["growing_months"].split(','),
            "harvest": r["harvest_months"].split(',')
        })
        
    return {"calendar": results}
