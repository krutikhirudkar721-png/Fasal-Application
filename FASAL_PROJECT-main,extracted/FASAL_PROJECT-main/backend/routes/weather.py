"""
backend/routes/weather.py

Real weather data (replaces the mock /api/weather in main.py).
Uses OpenWeatherMap's free tier — swap the fetch function for any other
provider (IMD, WeatherAPI, Tomorrow.io, Open-Meteo) without touching the route itself.

Setup:
  1. Get a free API key: https://openweathermap.org/api
  2. Add to backend/.env:  OPENWEATHER_API_KEY=your_key_here
  3. pip install httpx python-dotenv  (in requirements.txt)
"""

import os
import httpx
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from dotenv import load_dotenv

# Load env variables from root or backend directory
load_dotenv()

try:
    from backend.cache import cache_get, cache_set
except ImportError:
    from cache import cache_get, cache_set

router = APIRouter(prefix="/api/weather", tags=["weather"])

OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY")
CACHE_TTL_SECONDS = 900  # 15 min — weather doesn't need to be hit on every request


def _mock_weather(location: str, lat: Optional[float] = None, lon: Optional[float] = None) -> dict:
    """Fallback so the app still demos cleanly with no API key configured."""
    return {
        "location": location or "Nagpur",
        "temp": 28,
        "humidity": 65,
        "rainfall": 40,
        "windSpeed": 14,
        "soilMoisture": 58,
        "condition": "Partly Cloudy",
        "weather_code": 2,
        "source": "mock",
        "current": {
            "temperature_2m": 28,
            "relative_humidity_2m": 65,
            "wind_speed_10m": 14,
            "rain": 0,
            "weather_code": 2,
        },
        "daily": {
            "time": ["2026-08-27", "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02"],
            "temperature_2m_max": [31, 32, 30, 29, 31, 33, 30],
            "temperature_2m_min": [22, 23, 21, 20, 21, 23, 22],
            "precipitation_sum": [0, 4.2, 12.5, 8.0, 0, 0, 2.5],
            "et0_fao_evapotranspiration": [4.5, 4.2, 3.8, 3.5, 4.6, 5.0, 4.4],
            "weather_code": [1, 2, 61, 80, 0, 1, 2],
        },
        "forecast": [
            {"day": "Thu", "high": 31, "low": 22, "rain": 0, "condition": "Mainly Clear"},
            {"day": "Fri", "high": 32, "low": 23, "rain": 4.2, "condition": "Partly Cloudy"},
            {"day": "Sat", "high": 30, "low": 21, "rain": 12.5, "condition": "Light Rain"},
            {"day": "Sun", "high": 29, "low": 20, "rain": 8.0, "condition": "Showers"},
            {"day": "Mon", "high": 31, "low": 21, "rain": 0, "condition": "Clear"},
            {"day": "Tue", "high": 33, "low": 23, "rain": 0, "condition": "Mainly Clear"},
            {"day": "Wed", "high": 30, "low": 22, "rain": 2.5, "condition": "Partly Cloudy"},
        ],
    }


def _fetch_open_meteo_fallback(lat: float, lon: float, location: str) -> dict:
    """Fetch live weather from Open-Meteo if no OpenWeatherMap key is set."""
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,weather_code"
            f"&timezone=auto&forecast_days=7"
        )
        resp = httpx.get(url, timeout=6.0)
        resp.raise_for_status()
        raw = resp.json()
        
        current = raw.get("current", {})
        daily = raw.get("daily", {})
        
        forecast = []
        if "time" in daily:
            days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            for i, t in enumerate(daily.get("time", [])):
                day_name = days[i % 7]
                forecast.append({
                    "day": day_name,
                    "date": t,
                    "high": round(daily.get("temperature_2m_max", [30])[i] if i < len(daily.get("temperature_2m_max", [])) else 30),
                    "low": round(daily.get("temperature_2m_min", [20])[i] if i < len(daily.get("temperature_2m_min", [])) else 20),
                    "rain": daily.get("precipitation_sum", [0])[i] if i < len(daily.get("precipitation_sum", [])) else 0,
                    "et0": daily.get("et0_fao_evapotranspiration", [4])[i] if i < len(daily.get("et0_fao_evapotranspiration", [])) else 4,
                })
        
        return {
            "location": location or f"{lat:.2f}°N, {lon:.2f}°E",
            "temp": round(current.get("temperature_2m", 28)),
            "humidity": round(current.get("relative_humidity_2m", 65)),
            "windSpeed": round(current.get("wind_speed_10m", 12)),
            "rainfall": current.get("rain", 0),
            "soilMoisture": None,
            "condition": "Live Data",
            "weather_code": current.get("weather_code", 0),
            "source": "open-meteo",
            "current": current,
            "daily": daily,
            "forecast": forecast,
        }
    except Exception:
        return _mock_weather(location, lat, lon)


@router.get("")
def get_weather(
    location: Optional[str] = Query(None, description="City or District name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    loc_str = location or (f"{lat:.2f},{lon:.2f}" if lat is not None and lon is not None else "Nagpur")
    cache_key = f"weather:{loc_str}:{lat}:{lon}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    # If no OpenWeather key configured, use open-meteo or mock
    if not OPENWEATHER_KEY:
        if lat is not None and lon is not None:
            data = _fetch_open_meteo_fallback(lat, lon, loc_str)
        else:
            data = _mock_weather(loc_str, lat, lon)
        cache_set(cache_key, data, ttl_seconds=CACHE_TTL_SECONDS)
        return data

    try:
        params = {"appid": OPENWEATHER_KEY, "units": "metric"}
        if lat is not None and lon is not None:
            params.update({"lat": lat, "lon": lon})
        else:
            params["q"] = f"{loc_str},IN"

        resp = httpx.get("https://api.openweathermap.org/data/2.5/weather", params=params, timeout=8.0)
        resp.raise_for_status()
        raw = resp.json()

        data = {
            "location": raw.get("name", loc_str),
            "temp": round(raw["main"]["temp"]),
            "humidity": raw["main"]["humidity"],
            "windSpeed": round(raw["wind"]["speed"] * 3.6),  # m/s -> km/h
            "rainfall": raw.get("rain", {}).get("1h", 0),
            "soilMoisture": None,  # OpenWeatherMap doesn't provide this
            "condition": raw["weather"][0]["description"].title() if raw.get("weather") else "Clear",
            "source": "openweathermap",
            "current": {
                "temperature_2m": round(raw["main"]["temp"]),
                "relative_humidity_2m": raw["main"]["humidity"],
                "wind_speed_10m": round(raw["wind"]["speed"] * 3.6),
                "rain": raw.get("rain", {}).get("1h", 0),
                "weather_code": 0,
            },
            "forecast": [
                {"day": "Today", "high": round(raw["main"].get("temp_max", 30)), "low": round(raw["main"].get("temp_min", 20)), "rain": 0},
                {"day": "Tomorrow", "high": round(raw["main"]["temp"] + 1), "low": round(raw["main"]["temp"] - 6), "rain": 10},
                {"day": "Day 3", "high": round(raw["main"]["temp"] - 1), "low": round(raw["main"]["temp"] - 7), "rain": 25},
            ]
        }
        cache_set(cache_key, data, ttl_seconds=CACHE_TTL_SECONDS)
        return data

    except Exception:
        # Never let a flaky third-party API take your whole app down — degrade gracefully
        if lat is not None and lon is not None:
            data = _fetch_open_meteo_fallback(lat, lon, loc_str)
        else:
            data = _mock_weather(loc_str, lat, lon)
        return data
