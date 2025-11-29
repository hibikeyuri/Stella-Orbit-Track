from redis.asyncio import Redis

_token_blacklist = Redis(
    host="localhost",
    port=6379,
    db=0,
)


async def add_jti_to_blacklist(jti: str):
    await _token_blacklist.set(jti, "blacklisted")


async def is_jti_blacklisted(jti: str) -> bool:
    return await _token_blacklist.exists(jti)
