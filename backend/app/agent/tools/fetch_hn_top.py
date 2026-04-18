"""Fetch top Hacker News stories whose title matches a domain.

Uses the public Firebase endpoints. No API key required.
"""

import asyncio

import httpx

from app.utils.logger import get_logger

logger = get_logger(__name__)

_TOP_ENDPOINT = "https://hacker-news.firebaseio.com/v0/topstories.json"
_ITEM_ENDPOINT = "https://hacker-news.firebaseio.com/v0/item/{id}.json"
_TIMEOUT = 10.0
_SCAN_TOP_N = 50
_MAX_RESULTS = 10


async def _fetch_json(client: httpx.AsyncClient, url: str):
    try:
        response = await client.get(url, timeout=_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except Exception as exc:
        logger.debug("HN fetch failed %s: %s", url, exc)
        return None


async def fetch_hn_top(domain: str) -> list[dict]:
    """Return up to 10 Hacker News top stories whose title mentions the domain.

    Args:
        domain: topic area (case-insensitive substring match on story title).

    Returns:
        List of dicts with keys: title, url, score, by, time.
        Empty list if nothing matches or on HTTP error.
    """
    domain_lower = domain.lower()

    async with httpx.AsyncClient() as client:
        ids = await _fetch_json(client, _TOP_ENDPOINT)
        if not ids:
            return []
        candidate_ids = ids[:_SCAN_TOP_N]
        stories = await asyncio.gather(
            *(_fetch_json(client, _ITEM_ENDPOINT.format(id=sid)) for sid in candidate_ids),
            return_exceptions=False,
        )

    results: list[dict] = []
    for story in stories:
        if not story or story.get("type") != "story":
            continue
        title = story.get("title", "")
        if domain_lower not in title.lower():
            continue
        results.append(
            {
                "title": title,
                "url": story.get("url")
                or f"https://news.ycombinator.com/item?id={story.get('id')}",
                "score": story.get("score", 0),
                "by": story.get("by", ""),
                "time": story.get("time", 0),
            }
        )
        if len(results) >= _MAX_RESULTS:
            break
    return results
