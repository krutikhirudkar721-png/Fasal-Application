"""
backend/routes/auth.py

Phone-number + OTP authentication for FASAL.

Flow:
  1. POST /api/auth/request-otp   {phone}          -> OTP generated & "sent"
  2. POST /api/auth/verify-otp    {phone, otp}      -> user found/created, JWT issued
  3. GET  /api/auth/me            (Bearer token)    -> current user profile
  4. POST /api/auth/refresh       {refresh_token}   -> new access token

Security notes:
  - OTPs are never stored in plaintext (see engines/auth_engine.hash_otp).
  - OTP requests are rate-limited per phone number, to blunt SMS-bombing.
  - Verify failures return one generic message so an attacker can't tell
    "wrong OTP" apart from "phone not registered".
  - This API MUST run behind HTTPS in production — a JWT sent over plain
    HTTP gives an eavesdropper the same access as the real farmer.
"""

import os
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, field_validator

try:
    from backend.engines.auth_engine import (
        generate_otp, hash_otp, verify_otp_hash,
        create_access_token, create_refresh_token, decode_token,
        normalize_phone, OTP_TTL_SECONDS, OTP_MAX_ATTEMPTS_PER_WINDOW, OTP_RATE_WINDOW_SECONDS,
    )
    from backend.cache import cache_get, cache_set
    from backend import database_users as db
except ImportError:
    from engines.auth_engine import (
        generate_otp, hash_otp, verify_otp_hash,
        create_access_token, create_refresh_token, decode_token,
        normalize_phone, OTP_TTL_SECONDS, OTP_MAX_ATTEMPTS_PER_WINDOW, OTP_RATE_WINDOW_SECONDS,
    )
    from cache import cache_get, cache_set
    import database_users as db

router = APIRouter(prefix="/api/auth", tags=["auth"])

DEV_MODE = os.getenv("FASAL_ENV", "development") != "production"


class RequestOTPInput(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def must_be_valid_phone(cls, v):
        if not normalize_phone(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v


class VerifyOTPInput(BaseModel):
    phone: str
    otp: str


class RefreshInput(BaseModel):
    refresh_token: str


@router.post("/request-otp")
def request_otp(body: RequestOTPInput):
    phone = normalize_phone(body.phone)
    if not phone:
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit Indian mobile number")

    # --- rate limit: max N OTP requests per window per phone number ---
    rl_key = f"otp_rl:{phone}"
    attempts = cache_get(rl_key) or 0
    if attempts >= OTP_MAX_ATTEMPTS_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Too many OTP requests. Try again in a few minutes.")
    cache_set(rl_key, attempts + 1, ttl_seconds=OTP_RATE_WINDOW_SECONDS)

    otp = "123456" if DEV_MODE else generate_otp()
    cache_set(f"otp:{phone}", hash_otp(otp, phone), ttl_seconds=OTP_TTL_SECONDS)

    response = {"success": True, "message": f"OTP sent to {phone}"}
    if DEV_MODE:
        # Convenience for local testing ONLY
        response["dev_otp"] = otp
        response["demoOtp"] = otp
    return response


@router.post("/verify-otp")
def verify_otp(body: VerifyOTPInput):
    phone = normalize_phone(body.phone)
    if not phone:
        raise HTTPException(status_code=400, detail="Invalid phone number")

    stored_hash = cache_get(f"otp:{phone}")
    is_valid = False

    # Check against stored hash or dev mode fallback (123456)
    if stored_hash and verify_otp_hash(body.otp, phone, stored_hash):
        is_valid = True
    elif DEV_MODE and body.otp == "123456":
        is_valid = True

    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    # Burn the OTP immediately after a correct check — single use only.
    cache_set(f"otp:{phone}", None, ttl_seconds=1)

    user = db.get_or_create_user(phone)
    access_token = create_access_token(user["id"], phone)
    refresh_token = create_refresh_token(user["id"])

    return {
        "success": True,
        "token": access_token,
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "user": user,
    }


@router.post("/refresh")
def refresh(body: RefreshInput):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")

    return {"accessToken": create_access_token(user["id"], user["phone"])}


def get_current_user(authorization: str = Header(default=None)) -> dict:
    """
    FastAPI dependency for any route that needs a logged-in farmer:

        @router.get("/something")
        def something(user: dict = Depends(get_current_user)):
            ...
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user
