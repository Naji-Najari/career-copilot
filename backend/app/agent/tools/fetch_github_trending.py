"""Fetch trending GitHub repos for a domain via the public Search API.

Anonymous usage: 60 req/h limit, plenty for a demo. Add a PAT in iter 2 if
rate-limited.
"""

from datetime import datetime, timedelta, timezone

import httpx

from app.utils.logger import get_logger

logger = get_logger(__name__)

_ENDPOINT = "https://api.github.com/search/repositories"
_TIMEOUT = 10.0
_MAX_RESULTS = 10


async def fetch_github_trending(domain: str) -> list[dict]:
    """Return up to 10 GitHub repos trending in the last 7 days for the domain.

    Args:
        domain: topic area (e.g. "AI agents", "React").

    Returns:
        List of dicts with keys: name, full_name, description, url, stars,
        language, created_at. Empty list on HTTP error.
    """
    since = (datetime.now(timezone.utc) - timedelta(days=7)).date().isoformat()
    query = f"{domain} created:>={since}"

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        try:
            response = await client.get(
                _ENDPOINT,
                params={
                    "q": query,
                    "sort": "stars",
                    "order": "desc",
                    "per_page": _MAX_RESULTS,
                },
                headers={"Accept": "application/vnd.github+json"},
            )
            response.raise_for_status()
        except Exception as exc:
            logger.warning("fetch_github_trending failed for %r: %s", domain, exc)
            return []

    items = response.json().get("items", [])
    return [
        {
            "name": item.get("name", ""),
            "full_name": item.get("full_name", ""),
            "description": item.get("description") or "",
            "url": item.get("html_url", ""),
            "stars": item.get("stargazers_count", 0),
            "language": item.get("language") or "",
            "created_at": item.get("created_at", ""),
        }
        for item in items
    ]
