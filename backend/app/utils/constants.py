"""Flat environment configuration."""

import os

ENV = os.getenv("ENV", "development")
VERSION = os.getenv("VERSION", "0.1.0")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

APP_NAME = "trend_writer"
USER_ID = "demo"
