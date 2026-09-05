import time
from typing import Any, Optional

_cache: dict[str, tuple[float, int, Any]] = {}

def cache_get(key: str, ttl_seconds: Optional[int] = None) -> Optional[Any]:
    if key in _cache:
        ts, stored_ttl, val = _cache[key]
        effective_ttl = ttl_seconds if ttl_seconds is not None else stored_ttl
        if time.time() - ts < effective_ttl:
            return val
        del _cache[key]
    return None

def cache_set(key: str, value: Any, ttl_seconds: int = 600) -> None:
    _cache[key] = (time.time(), ttl_seconds, value)
