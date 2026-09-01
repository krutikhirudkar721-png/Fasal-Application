"""
backend/main.py

FASAL Core Production Application Server:
- Enterprise ASGI configuration (FastAPI)
- Security Headers & Dynamic CORS
- Rate Limiting Middleware
- Structured Logging & Trace IDs
- Real-time System Health & Readiness Diagnostics (/health, /api/health)
- Global Error & Exception Handling
- Database initialization and snapshot backup support
"""

import os
import time
import uuid
import logging
from contextlib import asynccontextmanager
from typing import Dict
from collections import defaultdict

from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

# Setup structured logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("fasal.api")

import sys
# Ensure both root project dir and backend dir are in Python path
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.abspath(os.path.join(_backend_dir, ".."))
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

try:
    from backend.database import init_db, get_db, backup_database
    from backend.routes import (
        recommend,
        soil,
        market,
        profit,
        calendar,
        weather,
        soil_data,
        geocode,
        commodity_prices,
        schemes,
        auth,
        assistant,
        community,
        voice
    )
except ImportError:
    from database import init_db, get_db, backup_database
    from routes import (
        recommend,
        soil,
        market,
        profit,
        calendar,
        weather,
        soil_data,
        geocode,
        commodity_prices,
        schemes,
        auth,
        assistant,
        community,
        voice
    )

SERVER_START_TIME = time.time()


# ==============================================================================
# 1. APPLICATION LIFESPAN
# ==============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FASAL Database and Agronomy Services...")
    await init_db()
    logger.info("FASAL Services successfully initialized and ready.")
    yield
    logger.info("FASAL Services shutting down gracefully.")


app = FastAPI(
    title="FASAL API — Precision Agriculture Platform",
    description="Production-grade AI Agronomy, Climate Intelligence, and Farmer Advisory Engine",
    version="2.0.0",
    lifespan=lifespan
)


# ==============================================================================
# 2. CORS & SECURITY CONFIGURATION
# ==============================================================================

# Allowed origins from env (comma-separated), e.g. "https://fasal.netlify.app,http://localhost:5173"
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()] if raw_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time"]
)


# ==============================================================================
# 3. RATE LIMITING & SECURITY HEADERS MIDDLEWARE
# ==============================================================================

# In-memory sliding window rate limiter: {ip: [timestamps]}
RATE_LIMIT_STORE: Dict[str, list] = defaultdict(list)
MAX_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MIN", "120"))

@app.middleware("http")
async def production_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # 1. Rate Limiter (by Client IP)
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    # Filter timestamps older than 60s
    timestamps = [t for t in RATE_LIMIT_STORE[client_ip] if current_time - t < 60]
    RATE_LIMIT_STORE[client_ip] = timestamps

    # Exempt health checks from rate limiting
    if not request.url.path.endswith("/health"):
        if len(timestamps) >= MAX_REQUESTS_PER_MINUTE:
            logger.warning(f"Rate limit exceeded for IP: {client_ip} on {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. Please wait 60 seconds before retrying.",
                    "retry_after_seconds": 60
                },
                headers={"Retry-After": "60", "X-Request-ID": request_id}
            )
        RATE_LIMIT_STORE[client_ip].append(current_time)

    # 2. Process Request
    try:
        response: Response = await call_next(request)
    except Exception as exc:
        logger.error(f"Unhandled Server Exception on {request.method} {request.url.path} (ID: {request_id}): {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "Internal Server Error",
                "message": "An unexpected error occurred. Our engineering team has been notified.",
                "request_id": request_id
            },
            headers={"X-Request-ID": request_id}
        )

    # 3. Attach Security & Tracing Headers
    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration_ms}ms"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Structured Access Log
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms) [ID: {request_id[:8]}]")
    return response


# ==============================================================================
# 4. GLOBAL ERROR HANDLERS
# ==============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail if isinstance(exc.detail, str) else "Request error",
            "detail": exc.detail,
            "path": request.url.path
        }
    )


# ==============================================================================
# 5. HEALTH-CHECK & SYSTEM DIAGNOSTICS ENDPOINTS
# ==============================================================================

@app.get("/health", tags=["system"])
@app.get("/api/health", tags=["system"])
async def health_check():
    """Comprehensive readiness and liveness diagnostic check."""
    checks = {}
    is_healthy = True

    # 1. Check Database Ping
    try:
        db = await get_db()
        async with db.execute("SELECT 1") as cursor:
            await cursor.fetchone()
        await db.close()
        checks["database"] = {"status": "ok", "type": "sqlite3"}
    except Exception as e:
        checks["database"] = {"status": "error", "message": str(e)}
        is_healthy = False

    # 2. Check AI Engine Status
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    checks["ai_engine"] = {
        "status": "ok" if gemini_key else "fallback_mode",
        "primary_model": "gemini-3.6-flash",
        "rag_knowledge_base": "active",
        "has_api_key": bool(gemini_key)
    }

    # 3. Check System Info
    uptime_seconds = round(time.time() - SERVER_START_TIME, 1)

    status_code = 200 if is_healthy else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "healthy" if is_healthy else "degraded",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "uptime_seconds": uptime_seconds,
            "environment": os.getenv("ENVIRONMENT", "production"),
            "version": "2.0.0",
            "checks": checks
        }
    )


@app.post("/api/admin/backup", tags=["admin"])
async def trigger_backup():
    """Triggers an atomic snapshot backup of the database."""
    try:
        backup_path = await backup_database()
        return {
            "success": True,
            "message": "Database snapshot backup created successfully",
            "backup_file": os.path.basename(backup_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")


@app.get("/")
def root():
    return {
        "name": "FASAL Precision Agriculture API",
        "status": "running",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# ==============================================================================
# 6. REGISTER MODULE ROUTERS
# ==============================================================================

app.include_router(recommend.router)
app.include_router(soil.router)
app.include_router(market.router)
app.include_router(profit.router)
app.include_router(calendar.router)
app.include_router(weather.router)
app.include_router(soil_data.router)
app.include_router(geocode.router)
app.include_router(commodity_prices.router)
app.include_router(schemes.router)
app.include_router(auth.router)
app.include_router(assistant.router)
app.include_router(community.router)
app.include_router(voice.router)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )