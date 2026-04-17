import hashlib
import time
import logging

logger = logging.getLogger("rod.cache")


class TTLCache:
    def __init__(self, ttl_seconds: int = 3600):
        self._store: dict = {}
        self._ttl = ttl_seconds

    async def warm(self):
        logger.info("Cache warmed.")

    def _key(self, work_order: str, vehicle_type: str) -> str:
        raw = f"{work_order.strip().lower()}:{vehicle_type}"
        return hashlib.sha256(raw.encode()).hexdigest()[:16]

    def get(self, work_order: str, vehicle_type: str):
        key = self._key(work_order, vehicle_type)
        entry = self._store.get(key)
        if not entry:
            return None
        if time.time() - entry["ts"] > self._ttl:
            del self._store[key]
            return None
        logger.info(f"Cache hit: {key}")
        return entry["value"]

    def set(self, work_order: str, vehicle_type: str, value):
        key = self._key(work_order, vehicle_type)
        self._store[key] = {"value": value, "ts": time.time()}

    def size(self) -> int:
        return len(self._store)

    def invalidate(self):
        self._store.clear()


cache = TTLCache(ttl_seconds=3600)
