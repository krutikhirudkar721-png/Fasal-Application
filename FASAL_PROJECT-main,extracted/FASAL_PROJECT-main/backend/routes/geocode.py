import json
import urllib.request
import urllib.parse
import urllib.error
import asyncio
from fastapi import APIRouter, HTTPException, Query
from backend.cache import cache_get, cache_set

router = APIRouter(prefix="/api/geocode", tags=["geocode"])

def fetch_geocode(q: str, count: int) -> dict:
    encoded_q = urllib.parse.quote(q)
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded_q}&count={count}&language=en&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get("results", [])
    except urllib.error.URLError as e:
        raise Exception(f"Error fetching geocode data: {e}")

@router.get("")
async def get_geocode(q: str = Query(..., description="Query string"), count: int = Query(5, description="Number of results")):
    # Cache for 1 hour
    cache_key = f"geocode_{q}_{count}"
    
    cached_data = cache_get(cache_key, ttl_seconds=3600)
    if cached_data is not None:
        return cached_data

    try:
        data = await asyncio.to_thread(fetch_geocode, q, count)
        cache_set(cache_key, data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
