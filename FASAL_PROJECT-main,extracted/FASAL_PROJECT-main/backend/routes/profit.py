from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ProfitRequest(BaseModel):
    crop: str
    land_size: float
    expected_yield: float
    expected_price: float
    input_cost: float

@router.post("/api/profit-estimate")
async def estimate_profit(req: ProfitRequest):
    gross_return = req.expected_yield * req.expected_price
    total_cost = req.input_cost * req.land_size
    net_profit = gross_return - total_cost
    profit_per_acre = net_profit / req.land_size if req.land_size > 0 else 0
    
    return {
        "crop": req.crop,
        "gross_return": round(gross_return, 2),
        "total_cost": round(total_cost, 2),
        "net_profit": round(net_profit, 2),
        "profit_per_acre": round(profit_per_acre, 2)
    }
