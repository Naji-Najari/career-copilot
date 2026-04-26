"""Per-IP rate limiter shared across routes.

Lives in its own module so route handlers and `main.py` can both import the
same `Limiter` instance without circular imports.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
