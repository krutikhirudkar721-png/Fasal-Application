"""
backend/engines/auth_engine.py

Core security logic for FASAL's phone-number + OTP login.
Kept separate from routes/ so the crypto & token logic is easy to unit-test
and reused by other routers via `get_current_user` (see routes/auth.py).
"""

import hashlib
import hmac
import os
import secrets
import time
from typing import Optional

import jwt  # PyJWT

# --- Config ------------------------------------------------------------
# Move these into a real .env file. Never commit a real JWT_SECRET.
JWT_SECRET = os.getenv("JWT_SECRET", "fasal_secure_jwt_secret_key_change_in_production_2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_MIN = int(os.getenv("ACCESS_TOKEN_TTL_MIN", "60"))
REFRESH_TOKEN_TTL_DAYS = int(os.getenv("REFRESH_TOKEN_TTL_DAYS", "30"))
OTP_TTL_SECONDS = int(os.getenv("OTP_TTL_SECONDS", "300"))          # 5 minutes
OTP_MAX_ATTEMPTS_PER_WINDOW = 3
OTP_RATE_WINDOW_SECONDS = 600                                        # 10 minutes


# ---------------------------------------------------------------------------
# OTP generation & verification
# ---------------------------------------------------------------------------

def generate_otp() -> str:
    """6-digit OTP using a cryptographically secure RNG — never random.randint."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str, phone: str) -> str:
    """
    Never store OTPs in plaintext, even in a short-lived cache. Using the
    JWT secret as the HMAC key means a cache leak alone doesn't leak a
    usable OTP — you'd also need the server secret.
    """
    return hmac.new(JWT_SECRET.encode(), f"{phone}:{otp}".encode(), hashlib.sha256).hexdigest()


def verify_otp_hash(otp: str, phone: str, stored_hash: str) -> bool:
    """Constant-time comparison — prevents timing attacks on OTP guessing."""
    return hmac.compare_digest(hash_otp(otp, phone), stored_hash)


# ---------------------------------------------------------------------------
# JWT access / refresh tokens
# ---------------------------------------------------------------------------

def create_access_token(user_id: int, phone: str) -> str:
    payload = {
        "sub": str(user_id),
        "phone": phone,
        "type": "access",
        "iat": int(time.time()),
        "exp": int(time.time()) + ACCESS_TOKEN_TTL_MIN * 60,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "iat": int(time.time()),
        "exp": int(time.time()) + REFRESH_TOKEN_TTL_DAYS * 86400,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None


# ---------------------------------------------------------------------------
# Phone number validation/normalization (India-focused — adjust if needed)
# ---------------------------------------------------------------------------

def normalize_phone(raw: str) -> Optional[str]:
    """'9876543210' / '+91 98765 43210' / '09876543210' -> '+919876543210'."""
    digits = "".join(ch for ch in raw if ch.isdigit())
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10:
        digits = "91" + digits
    if len(digits) == 12 and digits.startswith("91"):
        return "+" + digits
    return None
