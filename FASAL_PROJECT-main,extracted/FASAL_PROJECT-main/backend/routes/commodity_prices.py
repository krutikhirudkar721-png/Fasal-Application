import json
import urllib.request
import urllib.error
import asyncio
from fastapi import APIRouter, HTTPException
from backend.cache import cache_get, cache_set

router = APIRouter(prefix="/api/commodity-prices", tags=["commodity-prices"])

INDICATORS = {
    "Wheat": "PWHEAMT",
    "Maize": "PMAIZMT",
    "Soybeans": "PSOYB",
    "Rice": "PRICENPQ",
    "Cotton": "PCOTTIND",
    "Sugar": "PSUGAR"
}

def fetch_indicator(name: str, code: str) -> dict:
    url = f"https://api.worldbank.org/v2/country/all/indicator/{code}?format=json&per_page=10&date=2020:2026"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            if len(data) > 1 and isinstance(data[1], list):
                records = data[1]
                formatted_data = [{"year": str(r.get("date")), "value": r.get("value")} for r in records if r.get("value") is not None]
                return {
                    "name": name,
                    "indicator": code,
                    "unit": "$/mt",
                    "data": formatted_data
                }
    except Exception as e:
        print(f"Error fetching {code}: {e}")
    return {
        "name": name,
        "indicator": code,
        "unit": "$/mt",
        "data": []
    }

def fetch_all_commodities() -> dict:
    commodities = []
    for name, code in INDICATORS.items():
        res = fetch_indicator(name, code)
        commodities.append(res)
    return {
        "commodities": commodities,
        "source": "World Bank Pink Sheet"
    }

@router.get("")
async def get_commodity_prices():
    # Cache for 6 hours (21600 seconds)
    cache_key = "commodity_prices"
    
    cached_data = cache_get(cache_key, ttl_seconds=21600)
    if cached_data:
        return cached_data

    try:
        data = await asyncio.to_thread(fetch_all_commodities)
        cache_set(cache_key, data)
        return data
    except Exception as e:
        # Fallback empty data
        return {
            "commodities": [],
            "source": "World Bank Pink Sheet (Error)"
        }
