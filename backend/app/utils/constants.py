"""Flat environment configuration.

`.env` is loaded by `app/__init__.py` before any `app.*` module runs, so
this file only needs to read the resulting `os.environ`.
"""

import os

ENV = os.getenv("ENV", "development")
VERSION = os.getenv("VERSION", "0.1.0")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

APP_NAME = "career_copilot"
USER_ID = "demo"
