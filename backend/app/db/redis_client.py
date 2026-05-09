"""
Redis client — session management, rate limiting, pub/sub, question cache.
"""
from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
    return _redis_client


async def redis_set(key: str, value: Any, ttl: int | None = None) -> None:
    r = await get_redis()
    data = json.dumps(value) if not isinstance(value, str) else value
    if ttl:
        await r.setex(key, ttl, data)
    else:
        await r.set(key, data)


async def redis_get(key: str) -> Any | None:
    r = await get_redis()
    val = await r.get(key)
    if val is None:
        return None
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return val


async def redis_delete(key: str) -> None:
    r = await get_redis()
    await r.delete(key)


async def redis_incr(key: str, ttl: int | None = None) -> int:
    r = await get_redis()
    val = await r.incr(key)
    if ttl and val == 1:
        await r.expire(key, ttl)
    return val


async def redis_publish(channel: str, message: dict) -> None:
    r = await get_redis()
    await r.publish(channel, json.dumps(message))


async def redis_hset(key: str, field: str, value: Any) -> None:
    r = await get_redis()
    await r.hset(key, field, json.dumps(value) if not isinstance(value, str) else value)


async def redis_hget(key: str, field: str) -> Any | None:
    r = await get_redis()
    val = await r.hget(key, field)
    if val is None:
        return None
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return val


async def redis_hgetall(key: str) -> dict:
    r = await get_redis()
    data = await r.hgetall(key)
    result = {}
    for k, v in data.items():
        try:
            result[k] = json.loads(v)
        except (json.JSONDecodeError, TypeError):
            result[k] = v
    return result