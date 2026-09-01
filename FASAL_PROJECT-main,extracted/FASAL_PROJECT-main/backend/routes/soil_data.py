import json
import urllib.request
import urllib.error
import asyncio
from fastapi import APIRouter, HTTPException, Query
from backend.cache import cache_get, cache_set

router = APIRouter(prefix="/api/soil-data", tags=["soil-data"])

def fetch_soil_data(lat: float, lon: float) -> dict:
    url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}&property=phh2o&property=soc&property=nitrogen&property=clay&property=sand&property=silt&depth=0-5cm&value=mean"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            # The SoilGrids returns phh2o values scaled by factor 10 (e.g. 68 = pH 6.8), 
            # nitrogen in cg/kg (divide by 100 for g/kg), soc in dg/kg (divide by 10 for g/kg)
            
            properties = data.get("properties", {}).get("layers", [])
            
            extracted = {
                "ph": None,
                "nitrogen": None,
                "organic_carbon": None,
                "clay": None,
                "sand": None,
                "silt": None
            }
            
            for layer in properties:
                name = layer.get("name")
                depths = layer.get("depths", [])
                if not depths:
                    continue
                mean_val = depths[0].get("values", {}).get("mean")
                if mean_val is None:
                    continue
                
                if name == "phh2o":
                    extracted["ph"] = round(mean_val / 10.0, 2)
                elif name == "nitrogen":
                    extracted["nitrogen"] = round(mean_val / 100.0, 2)
                elif name == "soc":
                    extracted["organic_carbon"] = round(mean_val / 10.0, 2)
                elif name == "clay":
                    extracted["clay"] = mean_val
                elif name == "sand":
                    extracted["sand"] = mean_val
                elif name == "silt":
                    extracted["silt"] = mean_val
            
            return {
                "ph": extracted["ph"] if extracted["ph"] is not None else 6.5,
                "nitrogen": extracted["nitrogen"] if extracted["nitrogen"] is not None else 1.5,
                "organic_carbon": extracted["organic_carbon"] if extracted["organic_carbon"] is not None else 10.0,
                "clay": extracted["clay"] if extracted["clay"] is not None else 300,
                "sand": extracted["sand"] if extracted["sand"] is not None else 400,
                "silt": extracted["silt"] if extracted["silt"] is not None else 300,
                "source": "ISRIC SoilGrids v2.0"
            }
    except Exception as e:
        print(f"Error fetching soil data: {e}")
        return {
            "ph": 6.8,
            "nitrogen": 1.8,
            "organic_carbon": 12.5,
            "clay": 350,
            "sand": 400,
            "silt": 250,
            "source": "default"
        }

@router.get("")
async def get_soil_data(lat: float = Query(..., description="Latitude"), lon: float = Query(..., description="Longitude")):
    # Cache for 24 hours (86400 seconds) by rounded lat/lon
    rounded_lat = round(lat, 2)
    rounded_lon = round(lon, 2)
    cache_key = f"soil_{rounded_lat}_{rounded_lon}"
    
    cached_data = cache_get(cache_key, ttl_seconds=86400)
    if cached_data:
        return cached_data

    try:
        data = await asyncio.to_thread(fetch_soil_data, rounded_lat, rounded_lon)
        cache_set(cache_key, data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
